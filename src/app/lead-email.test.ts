import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  deliverLeadEmail,
  formatLeadEmail,
  LEAD_JSON_END,
  LEAD_JSON_START,
} from "./lead-email";
import type { AcceptedLead } from "./lead-submission-server";

function testLead(overrides: Partial<AcceptedLead> = {}): AcceptedLead {
  return {
    leadId: "lead_00000000-0000-4000-8000-000000000001",
    receivedAt: "2026-09-30T12:00:00.000Z",
    locale: "uk",
    source: { channel: "website", formVersion: "1" },
    data: {
      departure: "Київ",
      destinationChoice: "help",
      destination: "",
      dateFrom: "",
      dateTo: "",
      flexibleDates: true,
      adults: "2",
      children: "0",
      childAges: [],
      budget: "unsure",
      comment: "Тест <без реальних даних>",
      firstName: "Тест",
      lastName: "Мандрівник",
      contactMethod: "email",
      contactDetail: "fictional@example.com",
      communicationLanguage: "uk",
      consent: true,
    },
    ...overrides,
  };
}

describe("formatLeadEmail", () => {
  it("creates a stable subject and a marked versioned JSON payload", () => {
    const email = formatLeadEmail(testLead());
    assert.equal(
      email.subject,
      "[TRAVEL_LEAD][v1][UK][lead_00000000-0000-4000-8000-000000000001]",
    );

    const start = email.text.indexOf(`${LEAD_JSON_START}\n`) + LEAD_JSON_START.length + 1;
    const end = email.text.indexOf(`\n${LEAD_JSON_END}`, start);
    const payload = JSON.parse(email.text.slice(start, end)) as Record<string, unknown>;

    assert.equal(payload.schemaVersion, "1");
    assert.equal(payload.leadId, testLead().leadId);
    assert.deepEqual(payload.source, { channel: "website", formVersion: "1" });
  });

  it("escapes user-provided values in the HTML alternative", () => {
    const email = formatLeadEmail(testLead());
    assert.match(email.html, /Тест &lt;без реальних даних&gt;/);
    assert.doesNotMatch(email.html, /Тест <без реальних даних>/);
  });
});

describe("deliverLeadEmail", () => {
  const env = {
    RESEND_API_KEY: "re_test_secret",
    LEAD_INBOX_EMAIL: "owner@example.com",
  };

  it("sends only configured server values with an idempotency key", async () => {
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;
    const fetchMock: typeof fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedInit = init;
      return Response.json({ id: "email_test_123" });
    };

    const result = await deliverLeadEmail(testLead(), { env, fetch: fetchMock });
    assert.deepEqual(result, { ok: true, providerMessageId: "email_test_123" });
    assert.equal(capturedUrl, "https://api.resend.com/emails");

    const headers = new Headers(capturedInit?.headers);
    assert.equal(headers.get("authorization"), "Bearer re_test_secret");
    assert.equal(
      headers.get("idempotency-key"),
      "travel-lead-email/lead_00000000-0000-4000-8000-000000000001",
    );

    const body = JSON.parse(String(capturedInit?.body)) as Record<string, unknown>;
    assert.equal(body.from, "Mandra Travel <onboarding@resend.dev>");
    assert.deepEqual(body.to, ["owner@example.com"]);
  });

  it("fails closed when server configuration is missing or invalid", async () => {
    let calls = 0;
    const fetchMock: typeof fetch = async () => {
      calls += 1;
      return Response.json({ id: "unexpected" });
    };

    assert.deepEqual(await deliverLeadEmail(testLead(), { env: {}, fetch: fetchMock }), {
      ok: false,
      reason: "configuration",
    });
    assert.deepEqual(await deliverLeadEmail(testLead(), {
      env: { RESEND_API_KEY: "re_test", LEAD_INBOX_EMAIL: "invalid" },
      fetch: fetchMock,
    }), { ok: false, reason: "configuration" });
    assert.equal(calls, 0);
  });

  it("maps provider rejection and timeout without exposing response details", async () => {
    const rejected: typeof fetch = async () => Response.json(
      { message: "sensitive provider detail" },
      { status: 403 },
    );
    const waiting: typeof fetch = async (_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    });

    assert.deepEqual(await deliverLeadEmail(testLead(), { env, fetch: rejected }), {
      ok: false,
      reason: "provider",
    });
    assert.deepEqual(await deliverLeadEmail(testLead(), {
      env,
      fetch: waiting,
      timeoutMs: 1,
    }), { ok: false, reason: "timeout" });
  });
});
