# Mandra Travel — Travel Lead Automation

A portfolio-quality bilingual website and lead-processing automation for a realistic boutique travel agency.

**Live website:** [travel-lead-automation.vercel.app](https://travel-lead-automation.vercel.app/)

The project is built in small, reviewable milestones. **Milestones 1, 2, 3A, 3B, and 3C are approved and complete.** The bilingual form now validates fictional test requests on the server and sends accepted leads to the owner's Gmail inbox through Resend test mode. The site still does not include an n8n workflow, Google Sheets, Telegram notifications, or AI qualification.

## Product direction

Mandra Travel creates personalized trips with human support before, during, and after travel. The working brand and approved MVP design direction are documented in [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md).

## Technology foundation

- Next.js with the App Router
- React
- TypeScript in strict mode
- Tailwind CSS
- Vercel Hobby for the approved non-commercial portfolio deployment
- ESLint
- npm

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for decisions and the planned lead data flow.

## Requirements

- Node.js 20.9 or newer
- npm

The foundation was initially verified with Node.js 26.8.2 and npm 11.19.1.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

   Email delivery remains disabled until the server-only Resend values are supplied. Keep real secrets only in `.env.local`; never add them to Git.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Quality checks

Run all foundation checks:

```bash
npm run check
```

Or run them separately:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Project structure

```text
.
├── docs/
│   └── ARCHITECTURE.md   Technical decisions and planned data flow
├── public/
│   └── images/           Local editorial imagery for the website
├── src/
│   └── app/
│       ├── globals.css   Brand tokens and responsive page styles
│       ├── home-page.tsx Bilingual interactive home page
│       ├── api/leads/route.ts            Same-origin lead Route Handler
│       ├── lead-form.tsx Bilingual lead-form interface
│       ├── lead-form-api.ts              Browser-to-server submission adapter
│       ├── lead-form-submission.ts      Submission contract and state transitions
│       ├── lead-form-validation.ts      Client-side validation rules
│       ├── lead-email.ts                Resend test-mode formatting and delivery
│       ├── lead-submission-server.ts    Server parsing, normalization, and metadata
│       ├── lead-form-*.test.ts          Automated validation and state tests
│       ├── layout.tsx    Static root layout, metadata, and font setup
│       ├── locale.ts     Supported locale and cookie helpers
│       └── page.tsx      Static home-page entry point
├── .env.example          Safe environment-variable placeholders
├── DESIGN_BRIEF.md       Approved MVP brand and design direction
├── PROJECT_BRIEF.md      Product source of truth
├── ROADMAP.md            Milestone checklist
└── package.json          Dependencies and development commands
```

## Environment variables

`.env.example` documents names only and contains safe placeholders. `RESEND_API_KEY` and `LEAD_INBOX_EMAIL` are server-only. Variables without the `NEXT_PUBLIC_` prefix must remain server-only. Never put provider keys or personal data in a `NEXT_PUBLIC_` variable.

Milestone 3C uses Resend's restricted test mode: `Mandra Travel <onboarding@resend.dev>` may send only to the email address associated with the Resend account. No custom domain or paid Resend feature is required. Preview and Production values are configured separately in Vercel; the API key should be stored as a Sensitive Environment Variable.

## Current scope

Milestone 0 established the workspace and recorded the core decisions. Milestones 1 and 2 were delivered in small, reviewable parts:

- Milestone 1A: Ukrainian responsive home-page shell — approved and committed;
- Milestone 1B: English copy and accessible language switching — approved and committed;
- Milestone 2A: bilingual lead-form structure and basic behavior — approved and committed;
- Milestone 2B: client-side validation, accessible errors, and anti-spam honeypot — approved and committed;
- Milestone 2C: submission states and a development-only local demo — approved;
- Milestone 3A: Vercel hosting migration — approved and deployed;
- Milestone 3B: same-origin Route Handler — approved and verified in Production;
- Milestone 3C: Resend test-mode delivery — approved and verified end to end in Production with fictional data;
- later milestones: the Gmail/n8n automation chain.

## Language preference

Ukrainian is the default for a new visitor. Choosing `UA` or `EN` updates the page immediately without navigation or reload and stores only the selected locale in the first-party `mandra_locale` cookie for one year. On the next visit, the browser restores that choice after the static page loads. The visible copy and document language follow the selection.

## Deployment

The approved hosting architecture is Vercel Hobby for this non-commercial portfolio project. Local and Vercel builds use the standard Next.js runtime. The form posts fictional test data to the same-origin `POST /api/leads` Route Handler. The endpoint validates and normalizes the request, creates metadata, and, when its server-only variables are configured, submits accepted leads to the owner's Gmail inbox through Resend test mode. It does not store requests.

The Vercel deployment at [travel-lead-automation.vercel.app](https://travel-lead-automation.vercel.app/) is the primary public portfolio preview. The existing [GitHub Pages deployment](https://krisdziam.github.io/travel-lead-automation/) remains available temporarily as a legacy fallback. Its [deployment workflow](./.github/workflows/deploy-pages.yml) is intentionally still present and continues to request a static export only inside GitHub Actions. It will be retired only after owner approval; it should not be treated as the future server-capable deployment.

The legacy workflow temporarily excludes `src/app/api` inside its disposable GitHub Actions runner because a dynamic `POST` handler cannot be included in a static export. The GitHub Pages form therefore remains validation-only and directs testing to Vercel.

## Lead endpoint contract

`POST /api/leads` accepts `application/json` with the current form fields plus the interface `locale`. Requests are limited to 16 KiB. On success it returns HTTP `201`:

```json
{
  "ok": true,
  "leadId": "lead_<uuid>",
  "receivedAt": "2026-09-30T12:00:00.000Z"
}
```

The server treats the browser validation as convenience only. It reads the unknown JSON shape safely, keeps known fields, normalizes text, repeats all business validation, and creates locale and source metadata. A filled honeypot receives an indistinguishable success response and never triggers email delivery. Malformed and invalid requests also never call Resend. Only an accepted request is formatted as a readable email with a versioned JSON payload between `---BEGIN_LEAD_JSON---` and `---END_LEAD_JSON---` markers.

Expected error statuses are `400` for invalid JSON or shape, `413` for an oversized body, `415` for a non-JSON media type, `422` for field validation errors, `502` for a rejected provider request, `503` for missing server configuration, `504` for a delivery timeout, and `500` for an unexpected server failure. Provider failures expose only the generic `technical_error` code. Responses are not cached. No CORS headers are added because the production form and endpoint share the same Vercel origin.

The Resend integration uses the server's standard `fetch`, an eight-second timeout, and an idempotency key derived from `leadId`. No API key or inbox address is committed. Gmail automation and n8n remain deferred to Milestone 4.

Milestone 3C was verified in Vercel Production on 1 October 2026 with a completely fictional lead. The endpoint returned `201`, Resend reported `Delivered`, and the owner confirmed receipt in the dedicated Gmail inbox. The received subject, readable fields, `leadId`, and marked versioned JSON payload matched the accepted server data.

## Documentation

- [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) — product requirements and definition of done
- [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md) — approved MVP design direction
- [`ROADMAP.md`](./ROADMAP.md) — implementation order and progress
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — architecture and data-flow decisions

## Safety rules

- Do not commit `.env.local` or real credentials.
- Do not send real external messages during development without explicit owner confirmation.
- Do not enable automatic AI-generated customer replies in the first production version.
- Do not mark a milestone complete until its behavior has been verified.
