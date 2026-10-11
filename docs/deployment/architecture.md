# Repository and runtime architecture

One Next.js App Router application at the repository root serves both public pages and `/admin`. It reuses current components, content manifest, validators and shared layout; no duplicate admin app or website process is deployed.

| Directory | Responsibility |
| --- | --- |
| `src/app` | Public routes, editor route and API handlers |
| `src/components/admin` | Editor controls, upload client and draft preview |
| `src/components` | Current public page experiences and shared shell |
| `src/data` | Approved defaults, content field/collection registry and product data |
| `src/lib` | Content validation, storage, publishing and media preparation |
| `public` | Versioned supplied photographs, films, models, fonts and artwork |
| `config` | Local ports, published release seed and public asset inventory |
| `scripts` | Local launcher, key generation and release operations |
| `docs/deployment` | Current production architecture, operations, keys and release evidence |
| `docs/admin` | Admin documentation entry points and existing decision ledger |
| `docs/21st-source` | Retrieved third-party source and licenses |
| `docs/archive` | Historical specifications and snapshot evidence |

Local website 3134 and admin gateway 3140 remain local tooling. Cloud has one domain: `/` and public routes; `/admin`; authenticated `/api/admin/*`; published-only `/api/site-content`; media `/api/site-media/*`.

Production requires durable shared CMS and uploaded media. Drafts never enter the public endpoint. Cross-instance writes must use atomic compare-and-swap, not a process-local promise queue. Video preparation must finish within a tracked cloud request, not rely on a process-local background job surviving between requests.

This release preserves current visual design and source provenance. Further optimization follows user review.
