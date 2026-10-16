# Local showcase verification — 13 October 2026

Scope: run Final Showcase locally, verify admin publication and the supplied configurator, and correct small issues. No deployment, cloud CMS write, credential change, model edit or Blender work.

## Running services

- Website: http://127.0.0.1:3134
- Content Studio: http://127.0.0.1:3140/admin
- Started with `npm run admin`. The gateway owns one website dependency on 3134; no second Next.js instance was launched.
- Existing owner key reused. The upload endpoint reports `local`; content and media live in `.okno-content/`.

## Implementation and verification plan

1. Start the fixed services and preserve the local publication privately.
2. Verify authentication, text/photo editing, isolated preview, draft persistence, Publish and public propagation.
3. Verify a collection edit, restart persistence, public pages and Configure actions.
4. Correct observed issues, run checks, restore the publication and leave services running.

Read-only route checks and automated checks ran independently of browser work. Content mutations and restoration were sequential and guarded against concurrent changes.

## Results

| Boundary | Verified result |
| --- | --- |
| Admin access | Normal browser connection with the existing key; reload clears tab access; Disconnect clears access; unauthenticated reads/writes return 401. |
| Unsaved preview | About title and uploaded photo changed in the iframe while the public page retained its original content. |
| Photo upload | Browser file chooser uploaded an existing project WebP; the stored image returned 200. |
| Draft save | Both About fields saved; reload and reconnection recovered the drafts. |
| Publication | Publish updated the already-open public About page without reload. The photo loaded; page reload retained the publication. |
| Collections | An Enquiry land-status label changed in preview, stayed isolated publicly, saved and published, then appeared in the already-open public dropdown. |
| Restart persistence | Restarting the owned gateway and website retained the published option and uploaded image. Authentication still worked. |
| Restoration | Original published fields and collections restored exactly. Final revision 24, zero drafts. Private backup and local QA upload remain outside Git. |
| Guardrails | Stale revisions returned 409, invalid Process day ranges returned 422, public pages on the admin gateway returned 404. |
| Admin inventory | All 15 current page previews rendered: Published homepage, V1, V2, Projects, Models overview, Signature, Bespoke, Hospitality, Process, Sustainability, Journal, About, Enquiry, Footer, Shared settings. |
| Public pages | Main editorial routes rendered in the browser. Launcher checked 13 main routes, two configurators and 16 stylesheets. All 26 observed internal links, including seven project and six Journal detail routes, returned 200. |
| Interactions | Signature selection/details, project lightbox opening/next/close, Journal detail rendering and three Enquiry tabs checked. No enquiry message submitted. |
| Configure | Six published model buttons had expected destinations. Following Octapod Configure opened Studio Cabin. All 12 catalogue Configure routes returned the same supplied configurator. Plan query parameters retain the shared viewer. |
| Cladding/viewer | External roof, external wall, flooring, internal ceiling and internal wall groups worked, with a finish selected in each. Camera/background controls worked. The supplied shared interior-material limitation remains documented in the viewer. |
| Responsive layout | Admin checked at 795px and 390px; configurator at 1280px and 390px. No horizontal overflow observed. Phone screenshots are actual 390px captures. |
| Preservation | All 34 integrity entries matched: 32 textures, original cabin source and projection helper. |

## Small fixes

- Added a main landmark around the Enquiry form, keeping the shared header and footer outside.
- Positioned the Process finish-image picture wrapper to fill its existing surface, removing the invalid-parent-position warning. Browser image/wrapper widths match. Playback, media and timing are unchanged.

## Engineering checks

- Full suite before the two fixes: **102 files / 409 tests passed**.
- Relevant Process, Enquiry and admin suite after fixes: **15 files / 53 tests passed**.
- TypeScript passed before/after fixes; ESLint passed for both edited runtime files.
- JSDOM canvas/navigation notices are test-environment limitations; the actual viewer rendered in the browser.

Evidence: [captures and sanitized reports](evidence/local-showcase-2026-10-13/). API routes, internal routes, browser checks, restart/restoration and integrity reports distinguish their coverage. `admin-phone.png` and `configurator-phone.png` are the phone captures; `admin-mobile.png` is an earlier 795px preview capture.

## Coverage limits

Live publication covered representative text, an actual photo upload and a dropdown collection. Automated tests round-trip every registered scalar and exercise collection/editor contracts; every individual control was not manually published. New video uploads, exhaustive film playback, physical-device performance and external enquiry delivery were not acceptance-tested. Existing logo/Bespoke image-optimization warnings do not block the checked flows. Deployed acceptance remains separate.
