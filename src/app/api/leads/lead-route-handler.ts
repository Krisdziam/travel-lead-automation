import {
  MAX_LEAD_REQUEST_BYTES,
  processLeadSubmission,
} from "../../lead-submission-server";
import {
  deliverLeadEmail,
  type LeadEmailDeliveryResult,
} from "../../lead-email";
import type { AcceptedLead } from "../../lead-submission-server";

const jsonHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

type DeliverLeadEmail = (lead: AcceptedLead) => Promise<LeadEmailDeliveryResult>;

type LeadRouteDependencies = {
  deliverLeadEmail: DeliverLeadEmail;
};

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: jsonHeaders });
}

function accepted(leadId: string, receivedAt: string) {
  return json({ ok: true, leadId, receivedAt }, 201);
}

export function createLeadPostHandler(
  dependencies: LeadRouteDependencies = { deliverLeadEmail },
) {
  return async function POST(request: Request) {
    try {
      const mediaType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
      if (mediaType !== "application/json") {
        return json({ ok: false, error: { code: "unsupported_media_type" } }, 415);
      }

      const contentLength = Number(request.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > MAX_LEAD_REQUEST_BYTES) {
        return json({ ok: false, error: { code: "payload_too_large" } }, 413);
      }

      const text = await request.text();
      if (new TextEncoder().encode(text).byteLength > MAX_LEAD_REQUEST_BYTES) {
        return json({ ok: false, error: { code: "payload_too_large" } }, 413);
      }

      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        return json({ ok: false, error: { code: "invalid_request" } }, 400);
      }

      const result = processLeadSubmission(body);
      if (result.kind === "invalid_body") {
        return json({ ok: false, error: { code: "invalid_request" } }, 400);
      }
      if (result.kind === "validation_failed") {
        return json(
          { ok: false, error: { code: "validation_error", fields: result.errors } },
          422,
        );
      }
      if (result.kind === "spam") {
        return accepted(result.leadId, result.receivedAt);
      }

      const delivery = await dependencies.deliverLeadEmail(result.lead);
      if (!delivery.ok) {
        const status = delivery.reason === "timeout"
          ? 504
          : delivery.reason === "configuration"
            ? 503
            : 502;
        return json({ ok: false, error: { code: "technical_error" } }, status);
      }

      return accepted(result.lead.leadId, result.lead.receivedAt);
    } catch {
      return json({ ok: false, error: { code: "technical_error" } }, 500);
    }
  };
}
