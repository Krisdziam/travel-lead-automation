import type { AcceptedLead } from "./lead-submission-server";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const EMAIL_FROM = "Mandra Travel <onboarding@resend.dev>";
const DELIVERY_TIMEOUT_MS = 8_000;

export const LEAD_JSON_START = "---BEGIN_LEAD_JSON---";
export const LEAD_JSON_END = "---END_LEAD_JSON---";

type LeadEmailPayload = AcceptedLead & {
  schemaVersion: "1";
};

export type LeadEmail = {
  subject: string;
  text: string;
  html: string;
};

export type LeadEmailDeliveryResult =
  | { ok: true; providerMessageId: string }
  | { ok: false; reason: "configuration" | "provider" | "timeout" };

type LeadEmailDependencies = {
  fetch?: typeof fetch;
  env?: Readonly<Record<string, string | undefined>>;
  timeoutMs?: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function display(value: string) {
  return value || "—";
}

function createMachinePayload(lead: AcceptedLead): LeadEmailPayload {
  return {
    schemaVersion: "1",
    leadId: lead.leadId,
    receivedAt: lead.receivedAt,
    locale: lead.locale,
    source: lead.source,
    data: lead.data,
  };
}

export function formatLeadEmail(lead: AcceptedLead): LeadEmail {
  const language = lead.locale.toUpperCase();
  const payload = JSON.stringify(createMachinePayload(lead), null, 2);
  const details = [
    ["Lead ID", lead.leadId],
    ["Received", lead.receivedAt],
    ["Interface language", language],
    ["Name", `${lead.data.firstName} ${lead.data.lastName}`],
    ["Contact method", lead.data.contactMethod],
    ["Contact detail", lead.data.contactDetail],
    ["Communication language", lead.data.communicationLanguage],
    ["Departure", lead.data.departure],
    ["Destination choice", lead.data.destinationChoice],
    ["Destination", display(lead.data.destination)],
    ["Date from", display(lead.data.dateFrom)],
    ["Date to", display(lead.data.dateTo)],
    ["Flexible dates", lead.data.flexibleDates ? "yes" : "no"],
    ["Adults", lead.data.adults],
    ["Children", lead.data.children],
    ["Child ages", lead.data.childAges.length ? lead.data.childAges.join(", ") : "—"],
    ["Budget", lead.data.budget],
    ["Comment", display(lead.data.comment)],
  ] as const;

  const readableText = details.map(([label, value]) => `${label}: ${value}`).join("\n");
  const markedPayload = `${LEAD_JSON_START}\n${payload}\n${LEAD_JSON_END}`;
  const readableHtml = details
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`)
    .join("");

  return {
    subject: `[TRAVEL_LEAD][v1][${language}][${lead.leadId}]`,
    text: `New Mandra Travel test lead\n\n${readableText}\n\n${markedPayload}`,
    html: `<h1>New Mandra Travel test lead</h1>${readableHtml}<pre>${escapeHtml(markedPayload)}</pre>`,
  };
}

export async function deliverLeadEmail(
  lead: AcceptedLead,
  dependencies: LeadEmailDependencies = {},
): Promise<LeadEmailDeliveryResult> {
  const env = dependencies.env ?? process.env;
  const apiKey = env.RESEND_API_KEY?.trim();
  const inbox = env.LEAD_INBOX_EMAIL?.trim();

  if (!apiKey || !inbox || !isEmail(inbox)) {
    return { ok: false, reason: "configuration" };
  }

  const email = formatLeadEmail(lead);
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, dependencies.timeoutMs ?? DELIVERY_TIMEOUT_MS);

  try {
    const response = await (dependencies.fetch ?? fetch)(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `travel-lead-email/${lead.leadId}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [inbox],
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return { ok: false, reason: "provider" };

    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof (body as Record<string, unknown>).id !== "string"
    ) {
      return { ok: false, reason: "provider" };
    }

    return {
      ok: true,
      providerMessageId: (body as { id: string }).id,
    };
  } catch {
    return { ok: false, reason: timedOut ? "timeout" : "provider" };
  } finally {
    clearTimeout(timeout);
  }
}
