# OKNO private repository and Vercel release plan

Date: 11 October 2026 (Asia/Kolkata). Status: implementation in progress.

## Authorized outcome

Create a new private GitHub repository containing the current Final Showcase website and admin. Deploy one Next.js application to Vercel: public website at `/`, editor at `/admin`, authenticated writes at `/api/admin/*`. Do not add a public admin navigation link. Preserve accepted designs and existing content. Optimization is a later request. Every decision and verification is recorded here and in the release ledger.

## Subtasks and acceptance gates

| ID | Work | Acceptance | State |
| --- | --- | --- | --- |
| D1 | Inspect canonical source, credentials, assets, CMS and platform projects | Exact checkout confirmed; unrelated projects inventoried | Complete |
| D2 | Organize repository and documentation | Root README, architecture, deployment guide, key guide, release ledger; historical evidence retained | Complete |
| D3 | Adapt CMS persistence and media for Vercel | Durable storage, atomic revision conflicts, draft isolation, deployed media serving; no writes to deployment filesystem | Complete |
| D4 | Admin access and key operations | Cryptographic generation, server-only secret, rotation/revocation guide; demo credential disabled in cloud | Complete |
| D5 | Verify source | Tests, lint, typecheck and clean production build; secret/asset audit | Complete |
| D6 | Create and push private repository | Remote visibility and pushed commit verified | Pending |
| D7 | Create isolated Vercel project and configure storage/secrets | Exact owner and project confirmed; other projects unchanged | Complete |
| D8 | Deploy and smoke-test | Public pages and `/admin`; unauthorized writes refused; authenticated draft/publish and media persist; evidence recorded | Pending |

Subtasks are sequential in this chat; no additional agents or unrelated project changes are required.

## Initial audit and decisions

- Source: `OKNO-homes-final-showcase-2026-09-23`, version `final-showcase-2026-10-05`, confirmed from WORKING-VERSION and current docs. It has no existing Git history; preserved older checkout is not the release source.
- Keep one Next.js app at repository root. Existing `src/app/admin` is already the correct production route. Local 3140 gateway is local tooling only; it is not a cloud service.
- Keep source components and public asset URLs stable. Organize docs by purpose and retain source provenance and historical evidence.
- Prefer a separate Vercel project named `okno-homes-deployment` to isolate other projects. CLI login now confirms the correct account and existing okno-homes-demo; retain it and create an isolated project.
- Existing CMS JSON writes and FFmpeg background queue are local-only and cannot be treated as shared serverless persistence. Address these before claiming the cloud editor works.
- Public assets total about 1.2 GiB. Audit individual GitHub file limits and runtime references before choosing media packaging; do not degrade approved media quality.
- Preserved GitHub PAT returns HTTP 401 Bad credentials on 11 October. Browser account may still be signed in. No secrets are printed or committed.
- Admin key: use a 32-byte cryptographically random owner key, environment variable `OKNO_CMS_ADMIN_TOKEN` (server only), browser memory only. Individual keys/accounts remain an alternative documented in the key guide.
