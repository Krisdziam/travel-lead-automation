# Working agreement for Codex

## Project purpose

Build a portfolio-quality bilingual website and lead-processing automation for a realistic boutique travel agency. The project owner is learning vibe coding, web development, n8n, APIs, and AI automation while building it.

## Teaching mode

- Work in small, reviewable milestones. Do not build the whole system in one opaque pass.
- Before each milestone, explain in plain Ukrainian what will be built and why.
- After each milestone, show what changed, how to test it, and which concepts the owner should understand.
- Invite the owner to make one small meaningful change personally when practical.
- Use plain language first; introduce technical terms with a short explanation.
- Never claim something works until it has been run or otherwise verified.

## Engineering rules

- Keep the interface bilingual: Ukrainian and English.
- Design mobile-first and verify both mobile and desktop layouts.
- Keep secrets out of source code. Use environment variables and maintain `.env.example` with placeholders only.
- Validate and sanitize all form input on the server as well as in the browser.
- Add loading, success, empty, validation, and failure states where relevant.
- Preserve accessibility: labels, keyboard use, focus states, useful error messages, and sufficient contrast.
- Prefer a small maintainable solution over unnecessary frameworks or multi-agent complexity.
- Add automated tests for important validation and transformation logic.
- Update project documentation whenever architecture or setup changes.

## Delivery discipline

- Treat `PROJECT_BRIEF.md` as the product source of truth.
- Treat `ROADMAP.md` as the milestone checklist.
- Stop for owner review at the end of each milestone unless explicitly asked to continue.
- Do not connect paid services, publish publicly, or send real external messages without the owner's confirmation.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
