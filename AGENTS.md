# OKNO release repository

Read `WORKING-VERSION.md`, `docs/README.md` and `docs/deployment/README.md` before edits. Admin work also reads and updates `docs/admin-system.md`. This private repository contains one website and same-domain `/admin`; never add a public admin navigation link. Local website/admin ports are 3134/3140, with `npm run admin` reusing the website process. Production requires private durable Blob storage and server-only owner key; do not enable local demo auth or filesystem persistence on Vercel. Preserve current public designs and third-party provenance. Only operate on the Vercel project identified in `docs/deployment/operations.md`; other projects remain separate.

## Required OKNO design preferences

- Never add arbitrary slide/step counters (01 / 05, x of y), decorative percentages, invented statistics or numbered section labels. Only display numbers that carry requested meaning, such as the real Days 01–90 build chronology.
- For new UI components use actual 21st.dev source selected from the most bookmarked and downloaded suitable assets across the catalogue, not personal bookmarks or whichever component is easiest. Verify available popularity signals; never invent download totals or claim an absolute rank without evidence. Record source URL, author, demo/component IDs and the concrete adaptation.
- Preserve the source component's recognizable structure and established OKNO typography. Do not substitute invented buttons, fonts, line breaks or ornamental controls during a scoped correction. Keep immersive media and timeline content primary.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Shared admin credential policy

The owner chose a fixed, non-expiring shared owner credential for live and local admin. Reuse the configured key; do not regenerate or rotate it unless the owner explicitly requests a change. Staff sign-in instructions must not require generation or renewal. Keep the configured value server-only and out of public client code.
