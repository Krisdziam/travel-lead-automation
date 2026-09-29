# Roadmap

## Milestone 0 — Product and workspace foundation

- [x] Confirm the temporary brand name and visual direction.
- [x] Initialize Git and create the project structure.
- [x] Create README and environment-variable template.
- [x] Record architecture and data-flow decisions.
- [x] Confirm local development works.

## Milestone 1 — Bilingual website shell

- [ ] Build the main responsive page.
- [ ] Add Ukrainian and English copy.
- [ ] Add language switching.
- [ ] Add navigation and visible request CTA.
- [ ] Verify mobile and desktop layouts.

## Milestone 2 — Production-quality lead form

- [ ] Implement all agreed fields.
- [ ] Add dynamic validation by contact method.
- [ ] Add consent and privacy copy.
- [ ] Add loading, success, validation, and failure states.
- [ ] Add a honeypot and input limits.
- [ ] Test keyboard and screen-reader-friendly labels.

## Milestone 3 — Secure email delivery

- [ ] Add a server endpoint.
- [ ] Revalidate and sanitize input on the server.
- [ ] Generate `leadId`, timestamp, locale, and source metadata.
- [ ] Send human-readable email plus marked JSON payload to Gmail.
- [ ] Add safe error handling and environment-variable setup.
- [ ] Verify with test submissions.

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
