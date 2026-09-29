# Travel Lead Automation — Project Brief

## Vision

Create a polished, realistic bilingual website for a boutique travel agency and an end-to-end lead-processing workflow. A visitor submits a travel request; the website sends a structured email to a dedicated Gmail inbox; n8n reads the email, validates and enriches the lead, uses an LLM to classify it, records it, notifies the business, and prepares a reply.

This must look and behave like a real small business system, not a classroom demo.

## Business concept

- Working brand: **Mandra Travel** (temporary; easy to rename).
- Type: boutique travel agency that creates personalized trips for Ukrainian and international clients.
- Languages: Ukrainian and English, with a visible language switcher.
- Primary conversion: submit a request for a personalized travel proposal.

## Visitor experience

The website should include:

1. A strong but concise home page that establishes trust and explains the service.
2. A visible request form without forcing the visitor through unnecessary pages.
3. Clear privacy/consent language.
4. Responsive design for mobile and desktop.
5. Accessible controls and understandable validation messages.
6. Honest success and failure states after submission.

## Lead form

### Personal and contact information

- First name — required.
- Last name — required.
- Preferred contact method — Telegram, WhatsApp, Viber, phone, or email.
- Contact detail/link — required and validated according to the selected method.
- Email — optional unless email is the selected contact method.
- Phone number — optional unless phone/Viber/WhatsApp requires it.

### Travel request

- Departure city or country.
- Desired destination or “help me choose”.
- Approximate travel dates or flexible dates.
- Number of adults and children.
- Approximate budget range.
- Short comment or wishes.
- Preferred communication language.
- Consent to processing the submitted information — required.

## Target workflow

1. The browser validates the form for immediate feedback.
2. The site sends the data to its own server endpoint.
3. The server validates and sanitizes the data again.
4. The server creates a unique `leadId`, timestamp, locale, and source metadata.
5. The server sends a human-readable email to a dedicated Gmail inbox.
6. The email also contains a machine-readable JSON section between stable markers:
   - `---BEGIN_LEAD_JSON---`
   - `---END_LEAD_JSON---`
7. The subject uses a predictable format such as `[TRAVEL_LEAD][UK][leadId]`.
8. n8n watches Gmail for matching unread messages or a dedicated label.
9. n8n extracts the JSON, validates required fields, and checks `leadId` for duplicates.
10. An LLM returns structured output:
    - concise lead summary;
    - request category;
    - lead priority;
    - qualification score with explanation;
    - missing information;
    - recommended next action;
    - suggested reply draft in the lead's language.
11. n8n writes the original and enriched data to Google Sheets initially. PostgreSQL/Supabase may be added later.
12. n8n sends a Telegram notification to the business owner.
13. n8n creates a Gmail draft response. It must not automatically email the customer in the first production version.
14. Successful messages are labeled/marked processed; failures go to an error path for review.

## Recommended implementation

- Website: Next.js with TypeScript.
- Styling: Tailwind CSS with a small reusable component system.
- Form validation: shared schema-based validation in browser and server.
- Email delivery: a server-side email provider such as Resend, configured with environment variables; the recipient is Gmail.
- Automation: n8n.
- AI step: one LLM call with structured JSON output, not a multi-agent system.
- Initial storage: Google Sheets.
- Notifications: Telegram bot.
- Version control: Git and GitHub.

The exact hosting and email provider can change if setup constraints make another secure option more appropriate. Document any change and its trade-offs.

## Reliability and security requirements

- No API keys or credentials in browser code, Git, screenshots, exports, or documentation.
- Add server-side rate limiting or another reasonable spam-control mechanism before public release.
- Add a hidden honeypot field; consider CAPTCHA only if needed.
- Escape or safely render user-provided text.
- Limit input lengths and allowed formats.
- Do not send an AI-generated reply automatically without human approval.
- Prevent duplicate processing when Gmail/n8n retries.
- Log the lead ID and workflow status without logging unnecessary personal data.
- Prepare an n8n error workflow and a manual recovery procedure.

## Portfolio deliverables

- Public website URL.
- GitHub repository with a useful README.
- Sanitized n8n workflow export.
- Architecture diagram.
- Example test leads and edge cases.
- Screenshots or short walkthrough video.
- A short case study: problem, architecture, decisions, reliability measures, result, and lessons learned.

## Definition of done

A test visitor can submit a bilingual form from mobile or desktop. The lead reaches Gmail, is processed once by n8n, appears in the lead register, triggers an internal notification, and produces a reviewable draft reply. The workflow handles invalid input and service failures without silently losing the lead. The repository and automation contain no secrets and another person can follow the README to understand the system.
