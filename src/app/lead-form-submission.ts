import type { LeadFormValues } from "./lead-form-validation";

export type FormStatus = "idle" | "validating" | "submitting" | "success" | "error";
export type DemoScenario = "success" | "errorOnce";
export type SubmissionErrorCode = "validation_error" | "technical_error";

export type SubmitLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; error: { code: SubmissionErrorCode; retryable: boolean } };

export type SubmitLead = (values: LeadFormValues) => Promise<SubmitLeadResult>;

export type FormSubmissionState = {
  status: FormStatus;
  notice: "none" | "validated";
  leadId?: string;
  errorCode?: SubmissionErrorCode;
};

export type FormSubmissionEvent =
  | { type: "validationStarted" }
  | { type: "validationFailed" }
  | { type: "validationPassed" }
  | { type: "submissionStarted" }
  | { type: "submissionSucceeded"; leadId: string }
  | { type: "submissionFailed"; errorCode: SubmissionErrorCode }
  | { type: "formChanged" };

export const initialFormSubmissionState: FormSubmissionState = {
  status: "idle",
  notice: "none",
};

export function formSubmissionReducer(
  state: FormSubmissionState,
  event: FormSubmissionEvent,
): FormSubmissionState {
  switch (event.type) {
    case "validationStarted":
      if (state.status === "submitting") return state;
      return { status: "validating", notice: "none" };
    case "validationFailed":
      if (state.status !== "validating") return state;
      return initialFormSubmissionState;
    case "validationPassed":
      if (state.status !== "validating") return state;
      return { status: "idle", notice: "validated" };
    case "submissionStarted":
      if (state.status !== "validating") return state;
      return { status: "submitting", notice: "none" };
    case "submissionSucceeded":
      if (state.status !== "submitting") return state;
      return { status: "success", notice: "none", leadId: event.leadId };
    case "submissionFailed":
      if (state.status !== "submitting") return state;
      return { status: "error", notice: "none", errorCode: event.errorCode };
    case "formChanged":
      if (state.status === "submitting") return state;
      return initialFormSubmissionState;
  }
}

export type SubmissionAttempt =
  | { kind: "completed"; result: SubmitLeadResult }
  | { kind: "duplicate" };

const technicalError: SubmitLeadResult = {
  ok: false,
  error: { code: "technical_error", retryable: true },
};

export function createSubmissionExecutor(submitLead: SubmitLead) {
  let isSubmitting = false;

  return {
    async submit(values: LeadFormValues): Promise<SubmissionAttempt> {
      if (isSubmitting) return { kind: "duplicate" };

      isSubmitting = true;
      try {
        return { kind: "completed", result: await submitLead(values) };
      } catch {
        return { kind: "completed", result: technicalError };
      } finally {
        isSubmitting = false;
      }
    },
  };
}
