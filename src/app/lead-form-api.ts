import type { Locale } from "./locale";
import type { SubmitLead } from "./lead-form-submission";

type FetchLead = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

function isSuccessResponse(value: unknown): value is { ok: true; leadId: string } {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  return response.ok === true && typeof response.leadId === "string" && response.leadId.length > 0;
}

function isValidationResponse(value: unknown) {
  if (typeof value !== "object" || value === null) return false;
  const response = value as { error?: { code?: unknown } };
  return response.error?.code === "validation_error";
}

export function createApiSubmitLead(locale: Locale, fetchLead: FetchLead = fetch): SubmitLead {
  return async (values) => {
    const response = await fetchLead("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, locale }),
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return { ok: false, error: { code: "technical_error", retryable: true } };
    }

    if (response.status === 201 && isSuccessResponse(body)) {
      return { ok: true, leadId: body.leadId };
    }

    if (response.status === 422 && isValidationResponse(body)) {
      return { ok: false, error: { code: "validation_error", retryable: false } };
    }

    return { ok: false, error: { code: "technical_error", retryable: response.status >= 500 } };
  };
}
