> Superseded by [Projects — graphite reset](projects-graphite-reset.md). This file records the rejected navy/gold iteration.

# Projects atlas — 20 September 2026

Scope: /projects, its gallery destinations, and the shared cursor. Other page source is protected by /tmp/okno-projects-sept20/source-before.json.

Authority: client meeting PDF, Projects section (blue/gold globe, clickable locations, full-bleed galleries); WEBSITE CONCEPTS AND IDEAS, section 6; live No Art reference reviewed in this task. User authorized implementation and iteration. No paid generation until separately approved.

Design: midnight blue architectural atlas, champagne-gold cartography, lit sculptural globe, generous typography. Persistent project selection; pointer/touch rotation; every location has its own URL. Globe selection opens a filmic photo gallery with return navigation, next project, keyboard navigation and full-screen viewing. Native scroll brings the atlas into a photographic portfolio; no tutorial labels or arbitrary progress counters.

Execution: implement geographic WebGL globe with graceful fallback and DOM marker links; build atlas and full-bleed galleries; refine cursor; verify desktop/mobile, direct URLs, keyboard/reduced motion, map failure, asset resolution, build and tests; review the rendered result and iterate.

Content: existing CONFIRMED_GLOBE_LOCATIONS contains ten named records, but source PDFs do not substantiate those individual locations. Existing photography is expressly placeholder study imagery and is reused across several locations. Preserve those records for the internal preview, label the collection as studies, and mark pages noindex. Do not present them as verified deliveries or fabricate new project facts. Production publication remains dependent on verified project records and matching media.

Proposed runtime targets: WebGL DPR at most 1.5; no shadows/postprocessing; pause offscreen/hidden; reduced motion renders only on interaction; local geographic texture; no video generation or new remote media. Verify measurable implementation properties rather than claiming physical-device performance.

## Implementation and verification

- Three.js globe uses local geographic color/relief textures, DOM gallery links, inertial pointer rotation, location selection, visibility pausing and a static geographic fallback. Selection is restored by `/projects?place=…` on return from a gallery.
- Ten gallery routes use model-consistent sets of four existing photographs. Thumbnail-to-cover transitions have a bounded navigation deadline, with native link behavior for reduced motion and modified clicks. Galleries include full-screen viewing, arrow keys, Escape, focus restoration and a next-project destination.
- Shared cursor uses a precise angular pointer, a brief 16-particle wake, open corner marks over links and directional arrows over the globe. Native interaction is retained for editing fields, keyboard, touch and reduced motion. Its animation stops when particles expire.
- `npm run lint`, `npm test` (36 tests across 12 files), and `npm run build` passed. Tests include navigation independent of animation callbacks, disposal, WebGL failure, source asset existence, gallery keyboard behavior and cursor fallback/idle behavior.
- Reviewed the production build at `http://127.0.0.1:3102/projects`, desktop 1280×720 and mobile 320×740; the development preview was additionally reviewed at 390×844. Confirmed globe drag, location focus, gallery arrival, remembered return selection, fullscreen navigation, Escape/focus return, resolved images and no horizontal overflow. No browser warnings/errors observed in the final production journey. Physical-device GPU performance remains unmeasured.
- Compared existing source to `/tmp/okno-projects-sept20/source-before.json`: six existing files changed, all under Projects or CustomCursor; 71 other source files unchanged. New implementation files and local assets are within the same scope. Three.js and its types are recorded in the package manifests.
- No generation spend, remote publishing, commit or push. Internal study content must be replaced with client-verified locations and corresponding photography before public launch; route metadata is deliberately noindex meanwhile.

Preview command: `npm run start -- --hostname 127.0.0.1 --port 3102` after `npm run build`. Do not run a development server against the same `.next` output while building production; stop it first to avoid stale development style chunks.
