import {
  type DemoScenario,
  type SubmitLead,
  type SubmitLeadResult,
} from "./lead-form-submission";

const demoSuccess: SubmitLeadResult = {
  ok: true,
  leadId: "DEMO-2026-0001",
};

const demoError: SubmitLeadResult = {
  ok: false,
  error: { code: "technical_error", retryable: true },
};

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

export function createDemoSubmitLead(
  scenario: DemoScenario,
  delayMilliseconds = 900,
): SubmitLead {
  let attempt = 0;

  return async () => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("The local submission demo is disabled in production.");
    }

    attempt += 1;
    if (delayMilliseconds > 0) await wait(delayMilliseconds);

    if (scenario === "errorOnce" && attempt === 1) return demoError;
    return demoSuccess;
  };
}
