import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDemoSubmitLead } from "./lead-form-demo";
import {
  createSubmissionExecutor,
  formSubmissionReducer,
  initialFormSubmissionState,
  type SubmitLead,
} from "./lead-form-submission";
import type { LeadFormValues } from "./lead-form-validation";

const values = {} as LeadFormValues;

describe("formSubmissionReducer", () => {
  it("moves through validation without pretending to submit", () => {
    const validating = formSubmissionReducer(initialFormSubmissionState, { type: "validationStarted" });
    const checked = formSubmissionReducer(validating, { type: "validationPassed" });

    assert.equal(validating.status, "validating");
    assert.deepEqual(checked, { status: "idle", notice: "validated" });
  });

  it("moves from validation to submission and success", () => {
    const validating = formSubmissionReducer(initialFormSubmissionState, { type: "validationStarted" });
    const submitting = formSubmissionReducer(validating, { type: "submissionStarted" });
    const success = formSubmissionReducer(submitting, {
      type: "submissionSucceeded",
      leadId: "DEMO-1",
    });

    assert.equal(submitting.status, "submitting");
    assert.deepEqual(success, { status: "success", notice: "none", leadId: "DEMO-1" });
  });

  it("supports an error followed by a retry", () => {
    const validating = formSubmissionReducer(initialFormSubmissionState, { type: "validationStarted" });
    const submitting = formSubmissionReducer(validating, { type: "submissionStarted" });
    const error = formSubmissionReducer(submitting, {
      type: "submissionFailed",
      errorCode: "technical_error",
    });
    const retrying = formSubmissionReducer(error, { type: "validationStarted" });

    assert.equal(error.status, "error");
    assert.equal(retrying.status, "validating");
  });

  it("does not leave submitting because of a field change", () => {
    const submitting = { status: "submitting", notice: "none" } as const;
    assert.equal(formSubmissionReducer(submitting, { type: "formChanged" }), submitting);
  });
});

describe("createSubmissionExecutor", () => {
  it("prevents a duplicate call while one submission is pending", async () => {
    let resolveSubmission: ((result: { ok: true; leadId: string }) => void) | undefined;
    let callCount = 0;
    const submitLead: SubmitLead = () => {
      callCount += 1;
      return new Promise((resolve) => { resolveSubmission = resolve; });
    };
    const executor = createSubmissionExecutor(submitLead);

    const firstAttempt = executor.submit(values);
    const duplicateAttempt = await executor.submit(values);
    assert.deepEqual(duplicateAttempt, { kind: "duplicate" });
    assert.equal(callCount, 1);

    resolveSubmission?.({ ok: true, leadId: "DEMO-1" });
    assert.equal((await firstAttempt).kind, "completed");
  });

  it("converts an unexpected exception into a controlled error", async () => {
    const executor = createSubmissionExecutor(async () => { throw new Error("boom"); });
    assert.deepEqual(await executor.submit(values), {
      kind: "completed",
      result: { ok: false, error: { code: "technical_error", retryable: true } },
    });
  });
});

describe("development submission demo", () => {
  it("can return a test lead id without a network request", async () => {
    const result = await createDemoSubmitLead("success", 0)(values);
    assert.deepEqual(result, { ok: true, leadId: "DEMO-2026-0001" });
  });

  it("fails once and succeeds on retry", async () => {
    const submitLead = createDemoSubmitLead("errorOnce", 0);
    assert.equal((await submitLead(values)).ok, false);
    assert.deepEqual(await submitLead(values), { ok: true, leadId: "DEMO-2026-0001" });
  });
});
