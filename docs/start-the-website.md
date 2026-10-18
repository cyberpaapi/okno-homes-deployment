# Start the complete Final Showcase

Run from `OKNO-homes-final-showcase-2026-09-23`:

```sh
npm run website
```

The one application serves Hero V1, Hero V2, Models/Signature/Bespoke, Projects, Hospitality, Process, Sustainability, Journal, About, Enquiry and the published Tengo/Kray customer configurators at the fixed Final Showcase address **http://127.0.0.1:3134**. No separate customer-configurator server is required. All recovered customer implementation and assets are physically inside this final folder.

The content admin has a separate fixed local address, **http://127.0.0.1:3140/admin**. Start it with `npm run admin`; its gateway reuses this same website process on 3134 instead of launching a duplicate Next.js server. `npm run admin:check` only checks an existing admin gateway. For admin-only requests, open the admin address, not the public website address. Both reserved ports are declared in `config/local-ports.json`.

The command checks all seventeen entry routes and their referenced CSS files before reporting ready, including `/`, `/hero-v1`, `/hero-v2` and all four published customer configurators. It reuses an already verified Final Showcase process without taking ownership of it. It refuses to stop or replace an unrelated/older process occupying the port. Keep this checkout on port **3134**. Override it with `npm run website -- --port=PORT` only when two different servers must run simultaneously; in that case, record which checkout uses each port and open the matching URL. Only one Next development server can use this checkout at a time.

The launcher stays attached to a server it starts. Ctrl+C stops that process group only. Logs are written to `.local-preview/website-PORT.log`. An existing server reused by the command remains running when the command exits. To check an existing server without starting one, run `npm run website:check`.

For a compiled presentation:

```sh
npm run build
npm run website:production
```

Production uses the last build, so rebuild after changes. During development, the default launcher updates pages from current source. The historical `npm run dev`, `npm run build`, and `npm run start` scripts remain available for standard Next tooling.

Do not run `npm run build` while a production preview is serving from the same `.next` directory: the build replaces hashed CSS and JavaScript assets and can leave the live server serving a page whose styles no longer exist. Stop the preview, finish the build, then restart it on **3134**. If a page looks unstyled, `npm run website:check` now reports missing stylesheet assets instead of claiming the site is ready.

## Recovered customer configuration

The old active `Onko-Homes-models` directory had been moved to Trash. Its surviving `.configurator-local-preview` contained broken public/dependency symlinks. This pass copied only the final customer viewer, woodland setting, material register, customer geometry and required textures/posters into this folder. The source checkout and Trash were left untouched.

- `/models/signature/tengo/configure`: actually published revision 1.
- `/models/signature/kray/configure`: actually published revision 4.
- Both catalogues identify generic **Signature** geometry. They must not be presented as a specific bedroom variant. Explicit unsupported/repeated variants retain the material-collection fallback; unregistered model routes return 404.
- The Signature page's Configure control links to these routes for Tengo/Kray. Other models retain enquiry routing.
- `src/data/configurator/studio/published.json` contains only the two actually published records exported from the source database. No draft, private uploaded material, database or admin/editor endpoint was restored. This is a read-only showcase snapshot, not a live editorial publishing system.
- `docs/configurator-recovery-manifest.json` records recovered source checksums and published model source identity. Optimized customer GLB checksums match the source `customerAssets.json`; raw company masters were neither copied nor changed.

The supplied `Cofigurator files/fullcode` remains a separate legacy/internal editor iteration. It includes uploads, conversion and editing, and is intentionally not mounted on the public Final Showcase or started as a customer dependency. Likewise, older editorial previews, Hero Exploration and `OKNO-homes-older-version` (formerly `OKNO-homes-demo`) are historical iterations; Final Showcase is the current website. Their implementations are not silently substituted for current pages. The approved Hero V2 and latest Hospitality changes were explicitly consolidated into Final Showcase on 4 October 2026.

## Verification boundary

HTTP checks establish routes are available; they do not establish 3D rendering or successful enquiry delivery. Customer viewer recovery/context-loss and material behavior have their existing focused tests. Real-device GPU performance and production enquiry integration still require their own verification.

### Recovery checks on 2026-09-27

- Focused customer/configuration tests: 7 files, 21 tests passed.
- Scoped ESLint passed without warnings. The integration pass fixed the two canvas mock overload typings; full TypeScript and production build pass.
- Historical launcher verification reused a live development server on port 3105, verified all thirteen entry routes at HTTP 200 and exited successfully without stopping that server. The current canonical Final Showcase port is 3134.
- A separate startup attempt encountered Next's existing-development-server lock and exited without stopping the existing server; fresh production startup and owned shutdown were subsequently verified on 3104 during the original integration. The current canonical Final Showcase port is 3134.
- Browser: Tengo and Kray both reached Live 3D with their distinct customer houses and the shared woodland. Tengo Golden Oak changed wall appearance, Golden hour changed scene lighting, and selection-save feedback appeared. No browser warning/error was present at the desktop check.
- Kray's rendered scene fitted a 390 × 844 viewport without horizontal overflow. The development server disconnected before the additional mobile material/review checks; do not treat those later checks as completed.
- Both optimized customer binaries and their gzip forms match the recorded SHA-256 and decompressed bytes. Recovered configurator public assets total 237.9 MB.

The recovered customer configurator keeps its specialized material/review workflow controls. Its former Arial/Georgia declarations now use the already-loaded Geist OKNO family to match the final site. This font adaptation is the one intentional styling difference from the recovered source checksum manifest.
