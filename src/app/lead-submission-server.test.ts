import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseLeadSubmission,
  processLeadSubmission,
  type LeadSubmissionRequest,
} from "./lead-submission-server";

const NOW = new Date("2026-09-30T12:00:00.000Z");

function validRequest(overrides: Partial<LeadSubmissionRequest> = {}): LeadSubmissionRequest {
  return {
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
    comment: "Спокійний відпочинок біля моря",
    firstName: "Олена",
    lastName: "Коваль",
    contactMethod: "telegram",
    contactDetail: "@olena_test",
    communicationLanguage: "uk",
    consent: true,
    website: "",
    locale: "uk",
    ...overrides,
  };
}

describe("parseLeadSubmission", () => {
  it("keeps only known fields and normalizes text safely", () => {
    const parsed = parseLeadSubmission({
      ...validRequest({
        departure: "  Київ\u0000   ",
        comment: "  Тихо\r\n  біля   моря  ",
      }),
      unexpected: "discard me",
    });

    assert.equal(parsed?.departure, "Київ");
    assert.equal(parsed?.comment, "Тихо\nбіля моря");
    assert.equal("unexpected" in (parsed ?? {}), false);
  });

  it("rejects an invalid JSON shape before business validation", () => {
    assert.equal(parseLeadSubmission({ ...validRequest(), consent: "yes" }), null);
    assert.equal(parseLeadSubmission({ ...validRequest(), childAges: Array(9).fill("1") }), null);
  });
});

describe("processLeadSubmission", () => {
  const dependencies = {
    now: () => NOW,
    createId: () => "00000000-0000-4000-8000-000000000001",
  };

  it("revalidates data and returns field errors", () => {
    const result = processLeadSubmission(validRequest({ firstName: "A" }), dependencies);
    assert.equal(result.kind, "validation_failed");
    if (result.kind === "validation_failed") {
      assert.equal(result.errors.firstName, "firstNameInvalid");
    }
  });

  it("creates a unique identifier, timestamp, locale, and source metadata", () => {
    const result = processLeadSubmission(validRequest(), dependencies);
    assert.equal(result.kind, "accepted");
    if (result.kind === "accepted") {
      assert.equal(result.lead.leadId, "lead_00000000-0000-4000-8000-000000000001");
      assert.equal(result.lead.receivedAt, NOW.toISOString());
      assert.equal(result.lead.locale, "uk");
      assert.deepEqual(result.lead.source, { channel: "website", formVersion: "1" });
      assert.equal("website" in result.lead.data, false);
    }
  });

  it("does not expose honeypot detection in the public result", () => {
    const result = processLeadSubmission(validRequest({ website: "bot.example" }), dependencies);
    assert.deepEqual(result, {
      kind: "spam",
      leadId: "lead_00000000-0000-4000-8000-000000000001",
      receivedAt: NOW.toISOString(),
    });
  });
});
