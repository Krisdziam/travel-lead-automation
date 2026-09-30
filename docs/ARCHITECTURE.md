# Mandra Travel — Architecture

> **Status:** Milestone 3B Route Handler implemented for review; no external delivery connected
>
> **Last updated:** 30 September 2026

## 1. Purpose

This document records the main technical boundaries and data-flow decisions for the Mandra Travel MVP. It describes the intended architecture without claiming that later integrations are already implemented.

## 2. Current state

The project currently contains:

- a responsive Ukrainian home-page shell approved in Milestone 1A;
- complete Ukrainian and English interface copy for the implemented sections;
- an accessible client-side language switcher;
- a first-party locale cookie restored by the browser for language persistence;
- a bilingual lead form with accessible client-side validation and automated tests;
- an explicit form-submission state model and a future submission-function contract;
- a local development-only submission demo that performs no network requests;
- a verified Vercel deployment using the standard Next.js runtime;
- a same-origin `POST /api/leads` Route Handler with bounded JSON parsing, normalization, authoritative validation, metadata creation, and automated contract tests;
- a production submission adapter that returns the generated `leadId` to the bilingual form;
- a temporary legacy static deployment still available on GitHub Pages during migration;
- TypeScript in strict mode, linting, type-checking, and production-build scripts;
- documentation and a safe environment-variable template.

Email delivery, Gmail, n8n, Google Sheets, Telegram notifications, and AI processing are not implemented yet. Accepted Milestone 3B requests are deliberately not stored or sent anywhere.

## 3. Decisions

### ADR-001 — Next.js with the App Router

**Decision:** Use Next.js with the App Router and keep application code under `src/`.

**Why:** This provides one maintainable project for the public interface and future server endpoint. The `src/` boundary keeps configuration separate from application code.

### ADR-002 — TypeScript in strict mode

**Decision:** Use TypeScript with `strict: true` and the `@/*` import alias.

**Why:** Lead data will pass through several systems. Strong typing will help expose inconsistent field shapes early and make future validation code easier to understand.

### ADR-003 — Small component system with Tailwind CSS

**Decision:** Use Tailwind CSS and create only the reusable components that the approved design actually needs.

**Why:** This supports a consistent mobile-first interface without introducing a large third-party component library before requirements are known.

### ADR-004 — Server boundary for lead submission

**Decision:** The browser will eventually submit lead data to an endpoint owned by this Next.js application. The browser will never receive email-provider credentials.

**Why:** Server-side validation, sanitization, rate limiting, metadata creation, and secret handling must happen in a trusted environment.

### ADR-005 — Shared schema validation

**Decision:** A future schema will be shared between browser feedback and server validation, while the server remains authoritative.

**Why:** Shared rules reduce duplication. Revalidating on the server prevents a caller from bypassing browser checks.

### ADR-006 — Email as the first automation handoff

**Decision:** After server validation, the first production workflow will send a readable email containing a marked machine-readable JSON block. n8n will ingest that message from Gmail.

**Why:** This matches the approved product brief and creates an inspectable handoff that is suitable for learning and manual recovery.

### ADR-007 — One structured AI call with human approval

**Decision:** The future n8n workflow will use one structured LLM call. It may prepare a reply draft but must not automatically send it to the customer in the first production version.

**Why:** This keeps the system understandable, reduces failure modes, and preserves human review for customer communication.

### ADR-008 — Google Sheets first, database later if justified

**Decision:** Store initial lead records in Google Sheets. Consider PostgreSQL or Supabase only when real requirements justify the additional complexity.

**Why:** A spreadsheet is sufficient for the learning-focused MVP and is easy for the owner to inspect.

### ADR-009 — Lightweight cookie-based localization

**Decision:** Keep Ukrainian as the default locale and store an explicit `uk` or `en` choice in the first-party `mandra_locale` cookie. React restores that choice after the static page loads and changes the visible copy, metadata, and document language without navigation or reload.

**Why:** The MVP needs one bilingual page, not localized URL routing. This approach preserves the visitor’s scroll position and future form state while remaining compatible with static GitHub Pages hosting.

### ADR-010 — GitHub Pages for the public website shell (superseded by ADR-012)

**Decision:** Export the current Next.js site as static files and deploy them from GitHub Actions to the project path `/travel-lead-automation/` on GitHub Pages.

**Why:** This provides a stable public review link without introducing paid hosting. GitHub Pages cannot run the future form API, so server-side lead processing remains a later deployment decision.

### ADR-011 — Submission contract separated from the form interface

**Decision:** Model the form lifecycle as `idle`, `validating`, `submitting`, `success`, and `error`. A typed `SubmitLead` function accepts validated form values and returns either a `leadId` or a controlled error. The current public form never calls a submission adapter. A no-network demonstration adapter is available only in development and automated tests.

**Why:** Milestone 3 can replace the demonstration adapter with a real server call without changing field handling, validation, accessible status messages, retry behavior, or duplicate-submission protection.

### ADR-012 — Vercel Hobby for the non-commercial portfolio deployment

**Decision:** Deploy the complete Next.js application to Vercel Hobby and use the standard Next.js runtime for local and Vercel builds. Keep the project strictly demonstrational, accept only invented test data, and add the same-origin lead Route Handler in Milestone 3B. Keep the existing GitHub Pages workflow temporarily; only its GitHub Actions build requests a static export until the first Vercel deployment is verified.

**Why:** The website is an interface for demonstrating the future n8n workflow, not a commercial service. Vercel keeps the page and future server endpoint in one project, removes cross-origin configuration from the submission path, and avoids a separate backend deployment. The standard runtime is required because a static export cannot process a dynamic `POST` request.

### ADR-013 — Bounded same-origin lead contract before email delivery

**Decision:** Implement `POST /api/leads` as a same-origin Next.js Route Handler before connecting Resend. Accept only JSON up to 16 KiB, normalize known text fields, repeat the complete form validation on the server, generate `lead_<UUID>`, an ISO timestamp, interface locale, and fixed website source metadata, then return only the identifier and timestamp. Keep provider delivery as a separate Milestone 3C concern.

**Why:** This creates a small testable security boundary without credentials or external side effects. Same-origin submission needs no permissive CORS policy. Separating input processing from email delivery makes both failure paths easier to understand and test.

**Legacy deployment consequence:** Static export supports only static `GET` handlers, not a request-dependent `POST`. The GitHub Pages workflow therefore moves `src/app/api` out of the build tree only inside its disposable runner. Its published form remains validation-only while the primary Vercel deployment uses the real endpoint.

## 4. Planned data flow

1. A visitor completes the Ukrainian or English form.
2. The browser provides immediate validation feedback.
3. The Next.js server endpoint validates and sanitizes the same data again.
4. The server adds `leadId`, timestamp, locale, and source metadata.
5. The server sends a readable email with a marked JSON payload to Gmail.
6. n8n extracts and validates the payload and checks for duplicate `leadId` values.
7. One LLM call returns structured qualification data and a reply draft.
8. n8n writes the result to Google Sheets, notifies the owner in Telegram, and creates a Gmail draft.
9. A human reviews the draft before any customer reply is sent.
10. Failures follow a visible error path instead of silently losing the lead.

## 5. Security and reliability boundaries

- Secrets exist only in local or hosting environment variables, never in browser code or Git.
- `.env.example` contains placeholders only.
- Browser input is length-limited and validated; the server parses unknown JSON, normalizes known text fields, and validates it again.
- The server is the authoritative validation boundary.
- Lead request bodies are limited to 16 KiB and successful responses use `Cache-Control: no-store`.
- A hidden honeypot is implemented; server-side rate limiting remains required before public launch.
- Logs use `leadId` and workflow state without unnecessary personal data.
- Gmail/n8n processing will deduplicate by `leadId`.
- Automated customer replies remain disabled until a later explicit decision.

## 6. Planned application boundaries

```text
src/
  app/          Routes, layout, bilingual page copy, and the lead endpoint
  components/   Reusable interface components added in Milestone 1+
  lib/          Shared validation, transformations, and integrations
```

Only folders containing real code are created; empty architecture is avoided. The small Milestone 1 translation dictionary remains beside the page component and can move to `messages/` if later routes make that separation useful.

## 7. Deferred decisions

The following are intentionally unresolved and must not be treated as completed:

- localized URL routing and a localization library — deferred unless future routes make them useful;
- final privacy-policy destination and production consent wording — before public launch;
- Resend account setup, test recipient address, and email delivery implementation — Milestone 3C;
- n8n hosting and Gmail filter details — Milestone 4;
- LLM provider and model — Milestone 5;
- real Google Sheet and Telegram credentials — Milestone 6;
- production domain, rate limiting, and public launch settings — Milestone 7;
- domain, social account, and trademark checks for Mandra Travel — before public launch.
