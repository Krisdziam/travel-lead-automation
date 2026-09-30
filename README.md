# Mandra Travel — Travel Lead Automation

A portfolio-quality bilingual website and lead-processing automation for a realistic boutique travel agency.

**Current public preview:** [krisdziam.github.io/travel-lead-automation](https://krisdziam.github.io/travel-lead-automation/) (legacy GitHub Pages deployment until the first Vercel deployment is verified)

The project is built in small, reviewable milestones. **Milestones 1 and 2 are approved and complete:** the responsive bilingual website includes a production-quality lead-form interface with accessible validation and submission states. The form does not send data yet, and the site does not include email delivery, an n8n workflow, Google Sheets, Telegram notifications, or AI qualification.

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
│       ├── lead-form.tsx Bilingual lead-form interface
│       ├── lead-form-submission.ts      Submission contract and state transitions
│       ├── lead-form-validation.ts      Client-side validation rules
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
- later milestones: secure email delivery and the n8n automation chain.

## Language preference

Ukrainian is the default for a new visitor. Choosing `UA` or `EN` updates the page immediately without navigation or reload and stores only the selected locale in the first-party `mandra_locale` cookie for one year. On the next visit, the browser restores that choice after the static page loads. The visible copy and document language follow the selection.

## Deployment

The approved hosting architecture is Vercel Hobby for this non-commercial portfolio project. Local and Vercel builds now use the standard Next.js runtime, which prepares the project for a same-origin Route Handler in Milestone 3B. No server endpoint or external service is connected yet.

The existing [GitHub Pages deployment](https://krisdziam.github.io/travel-lead-automation/) remains available as a temporary legacy preview while the first Vercel deployment is created and verified. Its [deployment workflow](./.github/workflows/deploy-pages.yml) is intentionally still present and continues to request a static export only inside GitHub Actions. It will be retired only after owner approval; it should not be treated as the future server-capable deployment.

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
