# Mandra Travel — Travel Lead Automation

A portfolio-quality bilingual website and lead-processing automation for a realistic boutique travel agency.

The project is built in small, reviewable milestones. The current repository contains the **Milestone 0 foundation only**. It does not yet include the final home page, lead form, email delivery, n8n workflow, Google Sheets, Telegram notifications, or AI qualification.

## Product direction

Mandra Travel creates personalized trips with human support before, during, and after travel. The working brand and approved MVP design direction are documented in [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md).

## Technology foundation

- Next.js with the App Router
- React
- TypeScript in strict mode
- Tailwind CSS
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
npm run build
```

## Project structure

```text
.
├── docs/
│   └── ARCHITECTURE.md   Technical decisions and planned data flow
├── public/               Static assets added when they are needed
├── src/
│   └── app/
│       ├── globals.css   Minimal global styles and Tailwind import
│       ├── layout.tsx    Root HTML layout and metadata
│       └── page.tsx      Temporary Milestone 0 verification page
├── .env.example          Safe environment-variable placeholders
├── DESIGN_BRIEF.md       Approved MVP brand and design direction
├── PROJECT_BRIEF.md      Product source of truth
├── ROADMAP.md            Milestone checklist
└── package.json          Dependencies and development commands
```

## Environment variables

`.env.example` documents names only and contains safe placeholders. Variables without the `NEXT_PUBLIC_` prefix must remain server-only. Never put provider keys or personal data in a `NEXT_PUBLIC_` variable.

## Current scope

Milestone 0 establishes the workspace and records decisions. Product implementation begins only after owner review:

- Milestone 1: bilingual responsive website shell;
- Milestone 2: production-quality lead form;
- later milestones: secure email delivery and the n8n automation chain.

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
