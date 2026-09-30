import { isLocale, type Locale } from "./locale";
import {
  validateLeadForm,
  type LeadFormValues,
  type ValidationErrors,
} from "./lead-form-validation";

export const MAX_LEAD_REQUEST_BYTES = 16_384;

export type LeadSubmissionRequest = LeadFormValues & {
  locale: Locale;
};

export type AcceptedLead = {
  leadId: string;
  receivedAt: string;
  locale: Locale;
  source: {
    channel: "website";
    formVersion: "1";
  };
  data: Omit<LeadFormValues, "website">;
};

export type ProcessLeadResult =
  | { kind: "accepted"; lead: AcceptedLead }
  | { kind: "spam"; leadId: string; receivedAt: string }
  | { kind: "invalid_body" }
  | { kind: "validation_failed"; errors: ValidationErrors };

type LeadProcessingDependencies = {
  now?: () => Date;
  createId?: () => string;
};

const stringFields = [
  "departure",
  "destinationChoice",
  "destination",
  "dateFrom",
  "dateTo",
  "adults",
  "children",
  "budget",
  "comment",
  "firstName",
  "lastName",
  "contactMethod",
  "contactDetail",
  "communicationLanguage",
  "website",
] as const satisfies ReadonlyArray<keyof LeadFormValues>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: string, multiline = false) {
  const normalized = value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

  if (multiline) {
    return normalized
      .split("\n")
      .map((line) => line.trim().replace(/[\t ]+/g, " "))
      .join("\n")
      .trim();
  }

  return normalized.replace(/\s+/g, " ").trim();
}

export function parseLeadSubmission(input: unknown): LeadSubmissionRequest | null {
  if (!isRecord(input)) return null;

  for (const field of stringFields) {
    if (typeof input[field] !== "string") return null;
  }

  if (
    typeof input.flexibleDates !== "boolean" ||
    typeof input.consent !== "boolean" ||
    !Array.isArray(input.childAges) ||
    input.childAges.length > 8 ||
    !input.childAges.every((age) => typeof age === "string") ||
    typeof input.locale !== "string" ||
    !isLocale(input.locale)
  ) {
    return null;
  }

  return {
    departure: cleanText(input.departure as string),
    destinationChoice: cleanText(input.destinationChoice as string),
    destination: cleanText(input.destination as string),
    dateFrom: cleanText(input.dateFrom as string),
    dateTo: cleanText(input.dateTo as string),
    flexibleDates: input.flexibleDates,
    adults: cleanText(input.adults as string),
    children: cleanText(input.children as string),
    childAges: input.childAges.map((age) => cleanText(age as string)),
    budget: cleanText(input.budget as string),
    comment: cleanText(input.comment as string, true),
    firstName: cleanText(input.firstName as string),
    lastName: cleanText(input.lastName as string),
    contactMethod: cleanText(input.contactMethod as string),
    contactDetail: cleanText(input.contactDetail as string),
    communicationLanguage: cleanText(input.communicationLanguage as string),
    consent: input.consent,
    website: cleanText(input.website as string),
    locale: input.locale,
  };
}

export function processLeadSubmission(
  input: unknown,
  dependencies: LeadProcessingDependencies = {},
): ProcessLeadResult {
  const request = parseLeadSubmission(input);
  if (!request) return { kind: "invalid_body" };

  const now = dependencies.now?.() ?? new Date();
  const receivedAt = now.toISOString();
  const leadId = `lead_${dependencies.createId?.() ?? crypto.randomUUID()}`;
  const { website, locale, ...formData } = request;

  if (website) {
    return { kind: "spam", leadId, receivedAt };
  }

  const errors = validateLeadForm(request, now);
  if (Object.keys(errors).length > 0) {
    return { kind: "validation_failed", errors };
  }

  return {
    kind: "accepted",
    lead: {
      leadId,
      receivedAt,
      locale,
      source: { channel: "website", formVersion: "1" },
      data: formData,
    },
  };
}
