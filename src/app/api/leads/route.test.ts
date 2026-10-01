import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createLeadPostHandler } from "./lead-route-handler";
import { MAX_LEAD_REQUEST_BYTES } from "../../lead-submission-server";

let deliveryCalls = 0;
const POST = createLeadPostHandler({
  deliverLeadEmail: async () => {
    deliveryCalls += 1;
    return { ok: true, providerMessageId: "email_test" };
  },
});

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    departure: "Kyiv",
    destinationChoice: "help",
    destination: "",
    dateFrom: "",
    dateTo: "",
    flexibleDates: true,
    adults: "2",
    children: "0",
    childAges: [],
    budget: "unsure",
    comment: "A fictional portfolio test request",
    firstName: "Test",
    lastName: "Traveller",
    contactMethod: "email",
    contactDetail: "test@example.com",
    communicationLanguage: "en",
    consent: true,
    website: "",
    locale: "en",
    ...overrides,
  };
}

function request(body: string, contentType = "application/json; charset=utf-8") {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
}

describe("POST /api/leads", () => {
  it("accepts a valid test lead after email delivery succeeds", async () => {
    const callsBefore = deliveryCalls;
    const response = await POST(request(JSON.stringify(validBody())));
    const body = await response.json() as Record<string, unknown>;

    assert.equal(response.status, 201);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(body.ok, true);
    assert.match(String(body.leadId), /^lead_[0-9a-f-]{36}$/);
    assert.match(String(body.receivedAt), /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(deliveryCalls, callsBefore + 1);
  });

  it("returns 400 for malformed JSON or a wrong request shape", async () => {
    const malformed = await POST(request("{"));
    const wrongShape = await POST(request(JSON.stringify({ ...validBody(), consent: "yes" })));
    assert.equal(malformed.status, 400);
    assert.equal(wrongShape.status, 400);
  });

  it("returns field errors with 422 after authoritative server validation", async () => {
    const response = await POST(request(JSON.stringify(validBody({ departure: "" }))));
    const body = await response.json() as { error: { code: string; fields: Record<string, string> } };

    assert.equal(response.status, 422);
    assert.equal(body.error.code, "validation_error");
    assert.equal(body.error.fields.departure, "departureInvalid");
  });

  it("rejects unsupported content and oversized requests", async () => {
    const unsupported = await POST(request(JSON.stringify(validBody()), "text/plain"));
    const oversizedByHeader = await POST(new Request("http://localhost/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(MAX_LEAD_REQUEST_BYTES + 1),
      },
      body: "{}",
    }));
    const oversizedByBody = await POST(request("x".repeat(MAX_LEAD_REQUEST_BYTES + 1)));

    assert.equal(unsupported.status, 415);
    assert.equal(oversizedByHeader.status, 413);
    assert.equal(oversizedByBody.status, 413);
  });

  it("returns an indistinguishable success for a filled honeypot", async () => {
    const callsBefore = deliveryCalls;
    const response = await POST(request(JSON.stringify(validBody({ website: "bot.example" }))));
    const body = await response.json() as Record<string, unknown>;
    assert.equal(response.status, 201);
    assert.equal(body.ok, true);
    assert.equal(deliveryCalls, callsBefore);
  });

  it("does not deliver malformed or invalid submissions", async () => {
    const callsBefore = deliveryCalls;
    await POST(request("{"));
    await POST(request(JSON.stringify(validBody({ departure: "" }))));
    assert.equal(deliveryCalls, callsBefore);
  });

  it("maps delivery configuration, provider, and timeout failures to safe errors", async () => {
    const scenarios = [
      { reason: "configuration" as const, status: 503 },
      { reason: "provider" as const, status: 502 },
      { reason: "timeout" as const, status: 504 },
    ];

    for (const scenario of scenarios) {
      const handler = createLeadPostHandler({
        deliverLeadEmail: async () => ({ ok: false, reason: scenario.reason }),
      });
      const response = await handler(request(JSON.stringify(validBody())));
      assert.equal(response.status, scenario.status);
      assert.deepEqual(await response.json(), {
        ok: false,
        error: { code: "technical_error" },
      });
    }
  });

  it("returns a generic 500 response when request processing throws unexpectedly", async () => {
    const brokenRequest = request("{}");
    Object.defineProperty(brokenRequest, "text", {
      value: async () => { throw new Error("simulated read failure"); },
    });

    const response = await POST(brokenRequest);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: { code: "technical_error" },
    });
  });
});
