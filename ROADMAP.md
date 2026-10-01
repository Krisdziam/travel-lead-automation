# Roadmap

## Milestone 0 — Product and workspace foundation

- [x] Confirm the temporary brand name and visual direction.
- [x] Initialize Git and create the project structure.
- [x] Create README and environment-variable template.
- [x] Record architecture and data-flow decisions.
- [x] Confirm local development works.

## Milestone 1 — Bilingual website shell

- [x] Build the main responsive page.
- [x] Add Ukrainian and English copy.
- [x] Add language switching.
- [x] Add navigation and visible request CTA.
- [x] Verify mobile and desktop layouts.

## Milestone 2 — Production-quality lead form

- [x] Implement all agreed fields.
- [x] Add dynamic validation by contact method.
- [x] Add consent and privacy copy.
- [x] Add loading, success, validation, and failure states.
- [x] Add a honeypot and input limits.
- [x] Test keyboard and screen-reader-friendly labels.

## Milestone 3 — Secure email delivery

### Milestone 3A — Vercel hosting migration

- [x] Use the standard Next.js runtime locally and on Vercel.
- [x] Keep the legacy GitHub Pages static export isolated to its GitHub Actions build.
- [x] Document the approved non-commercial Vercel Hobby architecture.
- [x] Connect the GitHub repository to Vercel and verify the first deployment.
- [x] Keep GitHub Pages available temporarily without blocking the Vercel migration.

### Milestone 3B — Next.js Route Handler

- [x] Add the same-origin `POST /api/leads` endpoint.
- [x] Revalidate and normalize input on the server.
- [x] Generate `leadId`, timestamp, locale, and source metadata.
- [x] Connect the Vercel form to the endpoint without external delivery.
- [x] Add safe HTTP errors, request-size limits, and automated contract tests.
- [x] Complete owner review and Production verification of the Vercel deployment.

### Milestone 3C — Resend email delivery

- [x] Send human-readable email plus marked JSON payload to Gmail.
- [x] Add safe error handling and environment-variable setup.
- [x] Verify with test submissions.

## Milestone 4 — Gmail and n8n ingestion

- [ ] Configure Gmail trigger/filter.
- [ ] Extract and parse the marked JSON payload.
- [ ] Validate the lead schema.
- [ ] Add deduplication by `leadId`.
- [ ] Add processed and failed labels/statuses.
- [ ] Create a separate error path.

## Milestone 5 — AI qualification

- [ ] Define the structured AI output schema.
- [ ] Create representative test leads.
- [ ] Add classification, priority, summary, missing fields, and next action.
- [ ] Generate a reply draft in the lead's language.
- [ ] Test ambiguous, incomplete, and malicious input.
- [ ] Keep human approval before sending.

## Milestone 6 — Lead register and notifications

- [ ] Create a structured Google Sheet.
- [ ] Write original and enriched data.
- [ ] Send a concise Telegram notification.
- [ ] Create a Gmail draft reply.
- [ ] Verify retry behavior does not create duplicates.

## Milestone 7 — Hardening and launch

- [ ] Retire the legacy GitHub Pages deployment after explicit owner approval.
- [ ] Add rate limiting or equivalent spam protection.
- [ ] Check security, privacy, and secret handling.
- [ ] Test email/API/AI failure scenarios.
- [ ] Deploy the website.
- [ ] Run an end-to-end acceptance test.

## Milestone 8 — Portfolio packaging

- [ ] Sanitize and export the n8n workflow.
- [ ] Finish README and setup guide.
- [ ] Add architecture diagram and screenshots.
- [ ] Record a short walkthrough video.
- [ ] Write the portfolio case study.
