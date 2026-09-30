import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createApiSubmitLead } from "./lead-form-api";
import type { LeadFormValues } from "./lead-form-validation";

const values = { firstName: "Test" } as LeadFormValues;

describe("createApiSubmitLead", () => {
  it("posts the form and locale to the same-origin endpoint", async () => {
    let capturedBody = "";
    const submit = createApiSubmitLead("en", async (input, init) => {
      assert.equal(input, "/api/leads");
      assert.equal(init?.method, "POST");
      capturedBody = String(init?.body);
      return Response.json({ ok: true, leadId: "lead_test", receivedAt: "2026-09-30T12:00:00.000Z" }, { status: 201 });
    });

    assert.deepEqual(await submit(values), { ok: true, leadId: "lead_test" });
    assert.deepEqual(JSON.parse(capturedBody), { firstName: "Test", locale: "en" });
  });

  it("maps server validation failures to a controlled non-retryable error", async () => {
    const submit = createApiSubmitLead("uk", async () => Response.json(
      { ok: false, error: { code: "validation_error", fields: { firstName: "firstNameInvalid" } } },
      { status: 422 },
    ));

    assert.deepEqual(await submit(values), {
      ok: false,
      error: { code: "validation_error", retryable: false },
    });
  });

  it("treats malformed and server responses as controlled technical errors", async () => {
    const malformed = createApiSubmitLead("uk", async () => new Response("not json", { status: 502 }));
    const serverError = createApiSubmitLead("uk", async () => Response.json(
      { ok: false, error: { code: "technical_error" } },
      { status: 500 },
    ));

    assert.equal((await malformed(values)).ok, false);
    assert.deepEqual(await serverError(values), {
      ok: false,
      error: { code: "technical_error", retryable: true },
    });
  });
});
