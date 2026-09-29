import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { type LeadFormValues, validateLeadForm } from "./lead-form-validation";

const TODAY = new Date(2026, 8, 29);

function validValues(overrides: Partial<LeadFormValues> = {}): LeadFormValues {
  return {
    departure: "Київ",
    destinationChoice: "chosen",
    destination: "Португалія",
    dateFrom: "2026-11-10",
    dateTo: "2026-11-17",
    flexibleDates: false,
    adults: "2",
    children: "0",
    childAges: [],
    budget: "from1500To3000",
    comment: "Спокійний відпочинок біля моря",
    firstName: "Олена",
    lastName: "Коваль",
    contactMethod: "telegram",
    contactDetail: "@olena_test",
    communicationLanguage: "uk",
    consent: true,
    website: "",
    ...overrides,
  };
}

describe("validateLeadForm", () => {
  it("accepts a complete valid request", () => {
    assert.deepEqual(validateLeadForm(validValues(), TODAY), {});
  });

  it("requires a departure place", () => {
    assert.equal(validateLeadForm(validValues({ departure: "" }), TODAY).departure, "departureInvalid");
  });

  it("allows help choosing without a destination", () => {
    assert.deepEqual(
      validateLeadForm(validValues({ destinationChoice: "help", destination: "" }), TODAY),
      {},
    );
  });

  it("requires both dates unless dates are flexible", () => {
    assert.equal(
      validateLeadForm(validValues({ dateFrom: "", dateTo: "" }), TODAY).dates,
      "datesRequired",
    );
    assert.deepEqual(
      validateLeadForm(validValues({ dateFrom: "", dateTo: "", flexibleDates: true }), TODAY),
      {},
    );
  });

  it("rejects reversed, past, and more-than-three-years-ahead dates", () => {
    assert.equal(validateLeadForm(validValues({ dateTo: "2026-11-01" }), TODAY).dateTo, "dateOrder");
    assert.equal(validateLeadForm(validValues({ dateFrom: "2026-09-28" }), TODAY).dateFrom, "datePast");
    assert.equal(validateLeadForm(validValues({ dateTo: "2029-09-30" }), TODAY).dateTo, "dateTooLate");
  });

  it("validates traveller counts and every child age", () => {
    const countErrors = validateLeadForm(validValues({ adults: "0", children: "9" }), TODAY);
    assert.equal(countErrors.adults, "adultsInvalid");
    assert.equal(countErrors.children, "childrenInvalid");
    assert.equal(
      validateLeadForm(validValues({ children: "2", childAges: ["7", ""] }), TODAY)["childAge-1"],
      "childAgeInvalid",
    );
  });

  for (const [contactMethod, contactDetail] of [
    ["telegram", "@valid_name"],
    ["telegram", "https://t.me/valid_name"],
    ["whatsapp", "+380 67 123 45 67"],
    ["viber", "+48 123 456 789"],
    ["phone", "+1 (202) 555-0123"],
    ["email", "traveller@example.com"],
  ]) {
    it(`accepts valid ${contactMethod} contact details`, () => {
      assert.deepEqual(validateLeadForm(validValues({ contactMethod, contactDetail }), TODAY), {});
    });
  }

  for (const [contactMethod, contactDetail] of [
    ["telegram", "@bad"],
    ["whatsapp", "0671234567"],
    ["viber", "+12"],
    ["phone", "phone"],
    ["email", "name@example"],
  ]) {
    it(`rejects invalid ${contactMethod} contact details`, () => {
      assert.equal(
        validateLeadForm(validValues({ contactMethod, contactDetail }), TODAY).contactDetail,
        `${contactMethod}Invalid`,
      );
    });
  }

  it("requires names, communication language, and consent", () => {
    const errors = validateLeadForm(
      validValues({ firstName: "", lastName: "A", communicationLanguage: "", consent: false }),
      TODAY,
    );
    assert.equal(errors.firstName, "firstNameInvalid");
    assert.equal(errors.lastName, "lastNameInvalid");
    assert.equal(errors.communicationLanguage, "languageRequired");
    assert.equal(errors.consent, "consentRequired");
  });

  it("blocks a filled honeypot without exposing other validation details", () => {
    assert.deepEqual(validateLeadForm(validValues({ website: "spam" }), TODAY), { form: "spam" });
  });
});
