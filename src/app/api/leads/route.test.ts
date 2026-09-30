import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "./route";
import { MAX_LEAD_REQUEST_BYTES } from "../../lead-submission-server";

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
  it("accepts a valid test lead without sending it anywhere", async () => {
    const response = await POST(request(JSON.stringify(validBody())));
    const body = await response.json() as Record<string, unknown>;

    assert.equal(response.status, 201);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(body.ok, true);
    assert.match(String(body.leadId), /^lead_[0-9a-f-]{36}$/);
    assert.match(String(body.receivedAt), /^\d{4}-\d{2}-\d{2}T/);
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
    const oversized = await POST(new Request("http://localhost/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(MAX_LEAD_REQUEST_BYTES + 1),
      },
      body: "{}",
    }));

    assert.equal(unsupported.status, 415);
    assert.equal(oversized.status, 413);
  });

  it("returns an indistinguishable success for a filled honeypot", async () => {
    const response = await POST(request(JSON.stringify(validBody({ website: "bot.example" }))));
    const body = await response.json() as Record<string, unknown>;
    assert.equal(response.status, 201);
    assert.equal(body.ok, true);
  });
});
