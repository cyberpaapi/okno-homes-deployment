# Admin verification and Process footer boundary — 11 October 2026

## Story and work plan

Owner edits a page field or collection → authenticated draft API → private storage → Publish → published-only API → already-open public page polling. Unsaved/draft previews remain inside the editor. Public content refreshes on a 2.5-second active-tab poll, not on every keystroke; hidden tabs refresh when visible again.

1. Verify current checkout, live auth/storage and fixed local services.
2. Inventory every registered scalar and collection, and every current editor page.
3. Trace public consumers; test draft privacy, durable save/publish and media preparation.
4. Correct identified validation/connection gaps and the Process footer crossing.
5. Run source/build gates, desktop/mobile confirmation, then publish the reviewed application to the existing project.

## Production boundary — blocked, not accepted

Owner-authenticated live `/api/admin/content` returns **503**, explicitly stating content storage is unavailable. The live upload capability returns 200 / `mode: blob`, which is only a capability declaration and does not establish upload success. No cloud QA upload/save/publish attempt is made after the broken storage boundary. The previously recorded existing Blob suspension remains the unresolved dependency; no replacement store, billing change or other project is authorized or made. Original production publication remains intact.

The account owner must restore availability of `okno-content-production`. After recovery, reconnect, verify current drafts before publishing, privately back up the fresh cloud state, then repeat two browser publish/poll/restore cycles. Earlier production acceptance does not establish current publishing. This audit cannot honestly mark every field as live-changing while its storage API is unavailable.

## Inventory and observed controls

- **1,080 unique registered scalar fields:** 860 text, 177 image, 38 video, 5 choice. This includes migration/compatibility fields, not 1,080 separately exposed current controls.
- **25 collection definitions**, including Home openings, Projects, independent globe pins, Signature models/plans/gallery, Hospitality selections, Journal records, Footer links and Enquiry options.
- Current page hierarchy contains 743 unique scalar IDs. Browser inventory captured 675 scalar inputs; the five About icon choices are radio groups. The other 63 page IDs are replaced by collection editors: 9 V1 opening fields, 36 legacy Signature-plan fields, 18 legacy Footer-link fields. Other registered legacy Project/Journal fields remain migration compatibility.
- All **16 editor pages** visited in the deployed disconnected shell: Published homepage, V1, V2, Projects, Models overview, Signature, Configurators, Bespoke, Hospitality, Process, Sustainability, Journal, About, Enquiry, Footer, Shared. All inspected input fonts use `Geist OKNO`; every page had zero document horizontal overflow.
- A 390×844 Shared/Global Brand inspection likewise found Geist and zero overflow. This is emulated layout acceptance; it does not claim physical-device gestures or every possible long copy/artwork combination.
- `admin-field-audit-2026-10-11.json` records every registered page/section scalar and collection definition. `admin-ui-audit-2026-10-11.json` records current rendered inputs. `admin-consumer-audit-2026-10-11.json` traces all 675 exposed scalar inputs to exact/template public source references, with helper consumers reviewed separately. Source references alone are not individual browser publication tests.

## Corrections

- Legacy Journal ArchDaily logo: exact compiled default SVG now passes scalar validation, matching the existing trusted Journal-logo policy. Arbitrary SVG replacements remain rejected.
- Browser icon Use original: `/favicon.ico` is a Next app metadata route, not a file under public/. Local existence checks now resolve its actual source file; its verified 25,931-byte route is included in the cloud public-asset inventory. Existing uploaded icon rules are preserved.
- Process loading label: formerly exposed but unused. It now names the film accessibly while loading, then gives way to the existing film label when ready. No new visible loading ornament or typography is added.
- Process timeline/footer crossing: the guard previously snapped even tiny reverse crossing gestures to the timeline endpoint. It now reserves endpoint catches for gestures reaching beyond the permitted first/last-phase band. Small crossings stay native; large gestures retain first/last-phase protection. Film cadence, photographs, chapter timing, day beam and layout are unchanged. Regression covers 8/40/120/180px crossings and fractional CSS boundaries.

## Verification and restoration

- Isolated-store regression saved all 1,080 scalar defaults in bounded batches, proved drafts stayed out of publication, published them and verified durable rereads. Real media paths were checked through read-only links to the current assets. Fixtures use a temporary store; normal CMS data is untouched by that test.
- Full suite: **87 files / 341 tests passed**, covering upload validation/cancellation/cloud protocol, media preparation, collection edit/reorder/restore behavior, draft privacy, stale-revision conflicts, owner/demo auth, public fallback, page consumers and scroll guards. Routine jsdom canvas/navigation notices are not browser acceptance.
- Final zero-warning lint, standalone TypeScript and isolated production build passed. All 30 function traces passed; the largest was 179.8 MiB. Private credentials were excluded.
- Actual fixed-port local browser cycle 1: WebP upload, About title and photograph saves, Process Days 02–09 save; public API stayed identical before Publish. Publication revision 18 reached already-open About and Process pages without reload. Uploaded photograph decoded at 1114px; day text and title changed.
- Actual cycle 2: MP4 upload completed preparation; saved draft left the observer on the original frame renderer. Publication revision 19 reached the same Process tab, switched to native replacement-film rendering and loaded at **1280×720 / readyState 4**.
- Guarded exact restoration compared QA expectations, unrelated fields, all collections and revision counters before atomic local restoration. Original fields/collections restored at revision 20; zero drafts remain. Already-open observers restored their title/day fields and original frame renderer. Editor disconnected, credential cleared. QA media retained; production was not mutated.
- Evidence in `admin-audit-evidence/local-cycles.json`, `local-restoration.json`, `admin-mobile.png`.

## Release acceptance

Final local production runtime and fixed-port admin gateway passed. Desktop reverse crossing moved naturally from y=7131.33 to 6591.33 across the timeline endpoint 6701.28; mobile moved from 8258 to 7625.33 across endpoint 7757.02. Forward gestures returned to the footer normally. Both had zero horizontal overflow. The previous desktop build intercepted the same reverse gesture at the endpoint. Evidence: `admin-audit-evidence/process-boundary-local.json` and desktop/mobile screenshots. This confirms the removed endpoint snap, not a hardware-wide guarantee of zero dropped frames.

Existing-project production deployment and fresh cloud page verification pending. Production CMS publication remains blocked as recorded above.
