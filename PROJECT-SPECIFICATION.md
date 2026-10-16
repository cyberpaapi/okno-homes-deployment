# OKNO Homes — project specification

Release package: 16 October 2026. Product identity: OKNO Modhomes. Canonical application: Final Showcase. This document describes the delivered website, content studio, configurator, media behaviour and operating requirements.

## Product and visual identity

OKNO presents modular residences, bespoke architectural commissions and hospitality estates through completed-project photography, architectural films and an interactive Signature catalogue. Visitors can explore the practice, compare models, understand the build process, read published coverage and reach an enquiry appropriate to their interest.

The visual system combines deep forest green, charcoal, warm neutral copy and architectural photography. Bespoke has its own pale blue and white composition; Journal uses its established editorial palette. Authored type sizes are preserved on desktop. Phone headings are composed for their available width, with optional per-section numeric overrides in the content studio. Existing Geist, Manrope and Bodoni families are self-hosted; fonts use swap behaviour.

The shared shell owns one header/navigation experience, one footer where applicable and one desktop cursor implementation. Immersive Signature/configurator routes omit the footer. Admin has a separate operating layout and no public navigation entry. Menus expose named buttons, keyboard focus, Escape handling and current-page state. Touch targets and safe-area spacing are part of the phone composition.

## Public routes

| Route | Purpose and principal behaviour |
| --- | --- |
| `/` | Published homepage, selected from supported V1/V2 openings; V1 is the default. Shared lower sections follow the opening. |
| `/hero-v1` | Explicit forest-to-home V1 preview. |
| `/hero-v2` | Explicit nighttime V2 preview, without an introductory autoplay. |
| `/hero/[id]` | A published custom opening configured from a supported hero template. Removed/unavailable variants provide a return-home path. |
| `/projects` | Geographically anchored globe, selected project cinema and searchable/filtered photographic index. |
| `/projects/[slug]` | Published project gallery with photographs and available films. Unknown or archived projects are unavailable. |
| `/models` | Signature/Bespoke path selector. |
| `/models/signature` | Immersive Signature catalogue. Query parameters select a model, details state and variant. |
| `/models/signature/[slug]/configure` | Named model configuration; reviewed geometry is used when available and fallback geometry is identified explicitly. |
| `/models/bespoke` | Bespoke commission journey: opening, manifesto, OKNO portal, decisions and architectural result. |
| `/hospitality` | Estate introduction, delivery capabilities, selected project photography, programme and enquiry. |
| `/process` | Land-to-handover film, meaningful Days 01–90 chronology and supporting delivery detail. |
| `/sustainability` | Site-led architecture, materials/process evidence and closing enquiry. |
| `/journal` | Featured coverage, Press reel, archive reel, publication ticker and article index. |
| `/journal/[slug]` | Published editorial reading page. |
| `/about` | Vision, people, making, future and suitability of the OKNO approach. |
| `/enquiry` | Home, Hospitality and Press/other enquiry tabs; URL intent selects the appropriate context. |
| `/admin` | Private content studio shell; authenticated content operations require the configured owner credential. |

Navigation and configurable CTA destinations use existing same-site paths and anchors. Press and social links use their established external destinations. Availability of third-party sites is outside the application's control. Unknown public routes use the shared not-found experience.

## Homepage

### V1 opening

The accepted forest-to-interior film retains its original source and endpoint. Scroll position selects independently decoded poses; rapid input replaces the current target and does not queue an old chronological playback. The page keeps normal document scrolling. Hero-only wheel sensitivity remains separate from lower content. Touch input stays native.

The intro plays at 1.75× on a fresh opening load/reload. Its fingerprinted delivery copy is 11,926,832 bytes (47% smaller than the retained original), preserving 1,920×1,080, 24 fps, all 361 frames and the 15.042-second duration. Muted playback starts explicitly from buffered data instead of relying solely on a full-playthrough estimate. Leaving it releases its video source. Returning by reverse scroll or Home holds the static intro-ending pose. Reload within the hero restarts the intro; reload within lower content restores the section and offset. Decoder failure can reveal the accepted endpoint rather than trap document scrolling.

Desktop V1 uses 1,920×1,080 poses from the existing 46,739,190-byte frame bundle. The phone delivery uses 1,280×720 WebP poses, 26,704,366 bytes, with the same 289 sampled source positions and original final pose. The original 24 fps source and desktop bytes are unchanged. Phone delivery is a lossy compressed derivative, not a pixel-identical master.

### V2 opening

V2 presents the approved nighttime cave-to-interior sequence entirely through scrolling. It has no intro or idle loop. Closing copy and actions appear only after the actual final pose has been presented and hide again on reverse movement. Custom replacement films use the existing native-video path.

The approved desktop sequence uses the existing lossless 1,280×720 frame parts. Phone delivery uses 960×540 WebP poses at every second source position, including both endpoints: 396 poses and 13,908,198 bytes, compared with the desktop source's 384,273,474 bytes. This is a smaller sampled delivery of the same camera path. Desktop source quality is preserved.

Phone decoded-frame caches are capped at ten images. Both hero renderers keep bounded compressed caches, cancel distant requests, close evicted decoded images and release resources on teardown. Browser memory includes other resources beyond these cache limits.

### Shared lower sections

The Home process presents a connected Days 01–90 chronology. Desktop retains its horizontal composition. Phones use a compact vertical timeline without viewport-sized gaps between each milestone.

Signature preview retains the desktop scroll reveal. At phone/tablet widths through 800px, its heading, contained rotation film and collection link form one naturally scrolling composition. The visible film plays natively, provides native controls and pauses when offscreen or when the tab is hidden. Reduced-motion visitors retain photography and the action. It no longer reserves a multi-screen sticky track on phones.

Bespoke and Sustainability use architectural media with their established discovery links. The final editorial pair leads to Journal and About. All lower content remains shared between V1 and V2.

## Projects and globe

Globe locations are geographically anchored latitude/longitude records. Globe pins are independent of project records: a location may appear without a project detail page. Labels and coordinates are edited in the studio. Geographic projection and fixed attachment to the globe are retained during rotation.

The phone globe is centred at 50% of the available page width, contained within 96vw and sized independently of the introductory copy. Vertical document scrolling remains available over the canvas. The globe has a poster fallback when rendering is unavailable.

Projects expose their available title, cover, description, gallery, preview and titled films. Runtime published projects can create detail routes without rebuilding the application. Archiving a record removes it from public collections. Hospitality references the project library rather than copying it; dependency validation prevents silently breaking linked selections.

## Signature catalogue and configurator

The public Signature catalogue presents Forza, Kray, Gaze, Tengo, Trib and Octapod. Phones use the single rotation decoder, omit the hidden 1080p refinement film and have a shorter rotation track with a labelled Explore details action. Model/detail/plan selection uses the existing catalogue controls and URL intent. Images, rotation films, features, galleries, plan labels, area strings and starting-price strings remain editable. Displayed catalogue prices are owner-controlled content; the application does not calculate construction quotations.

The supplied Studio Cabin configuration experience and its material register are included in this package. It offers exterior roof/wall, flooring, internal ceiling and internal wall finishes; day/golden light; supported landscape backgrounds; camera presets; interior view; and rotation controls. The shared OKNO header remains available.

Reviewed geometry derivatives are recorded by URL, byte size, SHA-256, dimensions and scale:

| Geometry | Approximate GLB size | Representation |
| --- | --- | --- |
| Forza | 1.70 MB | Supplied family geometry; separate plan layouts are not represented. |
| Tengo | 8.09 MB | Supplied family geometry; separate plan layouts are not represented. |
| Kray | 6.36 MB | Supplied family geometry; separate plan layouts are not represented. |
| Tish | 0.36 MB | Supplied Tish 2 BHK geometry. |

Only catalogue-valid slugs resolve. Models without a reviewed dedicated derivative retain the labelled Studio Cabin fallback rather than substituting another named house without explanation. Material choices do not change the identity of the geometry. The asset manifest is `src/data/configurator/signatureAssetManifest.json`.

The configurator is a visual exploration tool. It does not provide an engineering certification, building approval, checkout, quotation or saved customer account. Configurator-specific admin navigation remains deferred while established content IDs and existing stored data are retained.

## Bespoke

The opening photograph expands into the page, followed by the authored manifesto, OKNO letter portal, Place/Brief/Form/Atmosphere stages and the final architectural composition. Phones stack the decision stages vertically. Existing copy and enquiry navigation are preserved.

The entrance has a short minimum and bounded deadline; its exit uses a compositor translation. Static responsive photographs serve built-in imagery directly rather than requiring a cold server image conversion. CMS images retain the supported image pipeline.

The phone OKNO portal uses a portrait SVG coordinate space and centred transform origin, with the complete wordmark visible before enlargement. It avoids the previous oversized SVG and negative horizontal offset. The background wallpaper is painted once on narrow screens/reduced motion; desktop painting is capped at 24 fps and stops in hidden tabs.

## Hospitality

The opening retains the Silk surface and architectural photography. The existing bento communicates estate capabilities using its approved source geometry and content.

Selected work uses an editorial photographic sequence: a full-width lead, alternating image widths on desktop and full-width photographs on phones, each with its caption below. It avoids repeating the bento's overlaid-card treatment. Selecting a photograph opens the existing fullscreen viewer with named previous/next/close controls, keyboard navigation, background inertness and focus restoration. Single-item selections omit unnecessary previous/next controls.

The delivery programme and hospitality enquiry retain their existing content and linkage. The studio controls the selected work through linked project records.

## Process and build film

The film chronology is Land 01–10, Architecture 11–18, Design lock 19–25, Assembly 26–60, Enclosure 61–72 and Handover 73–90. These are the existing presentation allocations. The separate five-photo delivery chronology remains distinct.

Desktop retains scroll-position playback, its bounded decoder and the gradual final-house blend. Phones through 700px replace the long sticky film track with a short native H.264 sequence, 960×540 at 30 fps, approximately 20.7 seconds. It preserves the completed-house blend and removes the discarded outro.

Phone playback starts only while the film is visible and the tab is active. Native controls allow pause, seek and replay; an intentional pause is respected. Current chapter copy follows actual playback time. The complete day schedule remains visible below it, followed by the existing detailed delivery content. Reduced motion retains the static readable sequence.

## Journal

The featured story, Press records, archive/project notes and article index retain their factual content and destinations. Text-only Press entries remain valid; article/project-note photography requirements remain enforced by the content model.

Press/archive reels move on phones as well as desktop. Pointer dragging supports touch and mouse while vertical page scrolling remains available. A Pause/Resume motion control is provided per reel. Keyboard focus pauses motion. Hover pauses are limited to mouse use, preventing a sticky touch-hover pause. Offscreen/hidden reels stop advancing. Reduced-motion visitors receive a manually scrollable track.

Duplicate loop cards retain visible arrow controls but remove duplicate actions from the keyboard order and accessibility tree. Images themselves remain inert. The publication ticker respects reduced motion and visibility.

## About and Enquiry

About retains the approved composition. Phone opening, manifesto and chapter heading sizes are reduced; body text, desktop sizes and optional CMS numeric overrides remain available.

Enquiry retains its established layout and behaviour. The three intent tabs and validation remain included. The current form prevents submission in the browser and has no configured message-delivery API, CRM, email sender or payment connection. A visual submit control must not be interpreted as evidence that an enquiry was delivered. Connecting delivery is a separate integration.

## Content studio

### Access and roles

The owner opens `/admin` directly. No public header/footer links advertise the studio. The server uses the configured fixed, non-expiring shared owner credential. Enter it in the studio and choose Connect. Reload or Disconnect clears access from that tab. Credential values never belong in the specification, repository, browser bundle or exported public content.

This is a shared-owner model, not individual staff accounts, role-based permissions or an audit trail identifying each staff member. Existing local test fixtures do not replace production authentication. Do not regenerate/rotate the owner credential during routine startup or release.

### Editing model

The studio is ordered by public page and section. It manages scalar text/media fields, optional numeric desktop/phone typography, collections, visibility/order and linked selections. Existing component layout remains authored in the application; the studio is not a free-form page builder.

Draft values are separate from published values. Draft previews communicate with the embedded page through a ready handshake with origin/window validation. Preview frames persist across content changes and offer reload recovery when readiness stalls. An editor can save drafts, preview them and publish a coherent revision. Open public pages refresh published content on their shared polling interval, currently 15 seconds, and on visibility changes. There is one polling subscription per tab, not one per field.

Concurrent edits use revision/ETag checks. A stale save returns a conflict and requires reload; it must not overwrite newer content. Publish validates known fields, media and collection dependencies. Numeric typography accepts bounded values and retains authored CSS sizes when unset.

### Media operations

Uploads require authentication. Images are validated and prepared; supported video workflows can prepare seeking-friendly derivatives. Large cloud uploads use scoped direct private Blob upload authorization followed by authenticated finalization. Prepared content-addressed media is served through the media route. Local drafts, uploads and content history remain excluded from Git.

Replacing a film does not silently apply an original built-in endpoint image to unrelated media. Original media and their manifest/index relationships remain versioned. Cancelled/failed uploads must not publish partial replacements.

### Persistence and failure

Local editing uses the private filesystem content store. Production requires the existing private durable Blob store and server-only owner configuration. Vercel never falls back to insecure local demo authentication or ephemeral filesystem persistence.

Public cloud reads cache published fields/collections, never drafts. Publish invalidates the public-content cache. When storage is unavailable, visitors receive a cached publication or the packaged publication seed. Authenticated storage operations fail closed with 503 rather than claiming a save succeeded.

At the 16 October release inspection, the team's Blob feature block is still active. Restoring cloud save/upload/publish requires account/storage recovery by the owner; this package does not change billing, create a substitute store or bypass the block. A new application deployment does not itself restore storage.

## Application and API architecture

The application uses Node.js 22, Next.js 16.4.0, React 19, TypeScript, CSS Modules, Motion/GSAP/Lenis where already used, Three.js for configuration and geographic/canvas rendering for the globe. One Next application serves public routes, APIs and the studio.

| Endpoint | Contract |
| --- | --- |
| `/api/site-status` | Runtime identity, mode and configurator identity metadata. |
| `/api/site-content` | Published scalar/collection snapshot; supports revision-aware unchanged responses. No drafts or credentials. |
| `/api/site-media/[name]` | Validated content-addressed published media, including supported byte-range requests. |
| `/api/admin/content` | Authenticated snapshot, draft and publication operations with revision/conflict validation. |
| `/api/admin/upload` | Authenticated image/video preparation workflow. |
| `/api/admin/upload/blob` | Authenticated private direct-upload authorization/finalization. |
| `/api/admin/upload/jobs/[id]` | Authenticated preparation-job status. |
| `/api/admin/geocode` | Authenticated location lookup for globe editing. |
| `/api/configurator/customer-model/[slug]` | Existing validated customer-model delivery endpoint and compressed variants. |

The public rendering boundary is editor → durable content → published API → page. A working admin shell verifies only the shell; authentication, persistence, uploading and publication are separate operations.

## Responsive and performance requirements

Phone compositions use normal document flow where a desktop sticky effect would require excessive scrolling. Desktop presentation and accepted source media remain intact. Image size hints match layout width; prepared photos cover common responsive widths. Below-fold photographs load lazily, while critical hero images retain priority.

Motion respects reduced-motion preferences and data-saving fallbacks where supported. Decorative cursor effects disable for coarse/no-hover input and reduced motion. Animation/decoder loops stop or release resources when hidden, offscreen or unmounted. Geographic functionality is preserved while reducing rendering work.

Caching is content-aware: fingerprinted frame/model/media paths are immutable; changing bytes requires a different fingerprint. Range-aware frame fetches avoid downloading an entire source before presenting a later pose. Current-target work replaces stale work; a slow older frame does not serialize a newer scroll target. V1 starts with 256 KiB ranges and defers speculative forward poses until scrolling starts, inside the same 16 MiB compressed-cache cap. Public-content polling is shared and skips hidden tabs.

Chromium viewport checks demonstrate layout and selected browser behaviour. They do not certify physical-phone frame rate, Safari touch/keyboard behaviour, every network, or real-user Core Web Vitals. Native controls provide recovery where autoplay is blocked.

## Repository, deployment and operation

The canonical private repository is `CodeAcc2007-dev/okno-homes-deployment`, with production branch `main`. Vercel project `okno-homes-deployment` is linked to that repository. Other accounts/projects and historical local checkouts are separate.

Production website: https://okno-homes-deployment.vercel.app. Production studio: https://okno-homes-deployment.vercel.app/admin. A Git push of application changes triggers the configured deployment. Release verification requires the deployment's source SHA, READY state, canonical alias and actual route/media responses to agree.

Install from the lockfile with `npm ci` on Node.js 22. Start the website with `npm run website` at `http://127.0.0.1:3134`. Start the studio with `npm run admin`, then open `http://127.0.0.1:3140/admin`. The gateway reuses the existing website process and starts it only when absent. `config/local-ports.json` is authoritative; there must not be a second arbitrary Next process for admin.

Production build runs `npm run build` and `npm run release:check-bundles`. Function-trace validation enforces private-file exclusions, the 250 MiB uncompressed function ceiling and required media binaries/legacy customer-model files. Static public assets are delivered separately from function bundles. Production secrets are configured on the server and excluded from source.

For constrained development hardware, use one test worker and a bounded Node heap. `OKNO_LOW_MEMORY_BUILD=1` limits build workers. Build, browser and media-conversion work should run in bounded batches. Temporary output, captures and private source masters remain outside the release checkout or in ignored paths.

The release package contains the website, current admin, supplied configurator, reviewed public derivatives, lockfile, runtime configuration, source provenance and this specification. It excludes dependencies, build caches, private drafts/history, credentials, private masters and temporary evidence. Existing third-party source/license records remain in `docs/21st-source`.

## Acceptance and remaining boundaries

Acceptance comprises source integrity, single-worker automated checks, zero-warning application lint, TypeScript/production build, function-trace checks, public route/link/media checks, responsive browser inspection and remote deployment identity. Saved content and credentials must survive these checks.

Physical-device smoothness remains a hardware acceptance step. Cloud CMS publication remains blocked while the account Blob block is active. Enquiry delivery remains unconnected. The specification does not turn these limitations into completed features, and a successful build or GitHub push alone does not prove them.
