# Mandra Travel — Travel Lead Automation

A portfolio-quality bilingual website and lead-processing automation for a realistic boutique travel agency.

**Live website:** [travel-lead-automation.vercel.app](https://travel-lead-automation.vercel.app/)

The project is built in small, reviewable milestones. **Milestones 1, 2, and 3A are approved and complete; Milestone 3B is in review:** the responsive bilingual website includes an accessible lead form and a same-origin server endpoint for fictional test data. The endpoint does not store or forward requests, and the site does not include email delivery, an n8n workflow, Google Sheets, Telegram notifications, or AI qualification.

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

   The current technical page does not call external services. Keep real secrets only in `.env.local`; never add them to Git.

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

`.env.example` documents names only and contains safe placeholders. Variables without the `NEXT_PUBLIC_` prefix must remain server-only. Never put provider keys or personal data in a `NEXT_PUBLIC_` variable.

## Current scope

Milestone 0 established the workspace and recorded the core decisions. Milestones 1 and 2 were delivered in small, reviewable parts:

- Milestone 1A: Ukrainian responsive home-page shell — approved and committed;
- Milestone 1B: English copy and accessible language switching — approved and committed;
- Milestone 2A: bilingual lead-form structure and basic behavior — approved and committed;
- Milestone 2B: client-side validation, accessible errors, and anti-spam honeypot — approved and committed;
- Milestone 2C: submission states and a development-only local demo — approved;
- Milestone 3A: Vercel hosting migration — approved and deployed;
- Milestone 3B: same-origin Route Handler — implemented on a feature branch for review;
- later milestones: Resend email delivery and the n8n automation chain.

## Language preference

Ukrainian is the default for a new visitor. Choosing `UA` or `EN` updates the page immediately without navigation or reload and stores only the selected locale in the first-party `mandra_locale` cookie for one year. On the next visit, the browser restores that choice after the static page loads. The visible copy and document language follow the selection.

## Deployment

The approved hosting architecture is Vercel Hobby for this non-commercial portfolio project. Local and Vercel builds use the standard Next.js runtime. The form now posts fictional test data to the same-origin `POST /api/leads` Route Handler. The endpoint validates and normalizes the request, creates metadata, and returns a confirmation; it does not store data or contact an external service.

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

The server treats the browser validation as convenience only. It reads the unknown JSON shape safely, keeps known fields, normalizes text, repeats all business validation, and creates locale and source metadata. A filled honeypot receives an indistinguishable success response but is not accepted for later delivery.

Expected error statuses are `400` for invalid JSON or shape, `413` for an oversized body, `415` for a non-JSON media type, `422` for field validation errors, and `500` for an unexpected server failure. Responses are not cached. No CORS headers are added because the production form and endpoint share the same Vercel origin.

Milestone 3B intentionally contains no Resend package, email delivery, Gmail connection, n8n call, environment variable, or credential. Those remain Milestone 3C and later work.

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
