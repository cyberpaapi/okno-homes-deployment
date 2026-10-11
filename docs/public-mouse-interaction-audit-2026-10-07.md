# Public mouse interaction audit — 7 October 2026

## Scope and evidence

Working checkout: `OKNO-homes-final-showcase-2026-09-23`; local site: `http://127.0.0.1:3134`. This is the public website, not the admin studio. The user asked to leave `/projects` and project details for later, and to defer Enquiry submission/delivery. Neither is represented as complete below.

A 1440 × 900 mouse sweep opened **20 non-Projects routes**, scrolled through their interactive elements, moved the pointer onto each, checked whether it received `:hover`, compared rendered hover styles, checked horizontal overflow, counted the shared cursor root, and collected browser page errors. The sweep found **580 visible candidates**: 573 received direct hover, two Bespoke header targets passed after its entrance overlay finished, and five moving Journal cards were outside the viewport until the marquee was dragged. No route had horizontal overflow; each had one shared cursor root; the sweep recorded zero page errors. A center-point style comparison is not a visual pass by itself: magnetic motion can be zero at the center, and active tabs need not change style again. The logo magnet was separately checked near its edge and translated; a footer social link was separately checked on About, Hospitality and Process and changed border/background on hover.

Click tests used real browser mouse input for route links, filters, selectors, gallery controls, tab changes and the Journal drag. All four footer social links opened new tabs while the OKNO page stayed in place; remote loads were deliberately aborted after tab creation, so this verifies the site interaction and declared hrefs, not social-platform availability. A 390 × 844 menu check covered 13 route templates. First attempts on `/` and `/hero-v1` clicked before hydration; after waiting for hydration, both opened nine menu links and closed with Escape. The other 11 menu checks passed. Visual captures are in [the evidence folder](public-mouse-evidence-2026-10-07/README.md); raw sweep/click logs are kept there with their automation caveats.

Status: **Checked** means the route's distinct mouse controls were exercised; **Partial** names the remaining control; **Deferred** is user-directed. Shared header and footer controls were tested by template and sampled on multiple routes, not clicked redundantly on every page.

## Pages visited and interaction status

| Page | Hover | Mouse clicks / drag | Status and notes |
| --- | --- | --- | --- |
| `/` | 30/30 | Shared Models nav; six distinct lower-page links to Process, Signature, Bespoke, Sustainability, Journal and About navigated | **Checked**. Logo edge magnet and footer social hover also verified. |
| `/hero-v1` | 30/30 | Shares the tested lower-page component with `/`; mobile menu opened and closed | **Checked by shared template**. |
| `/hero-v2` | 30/30 | Shares the tested lower-page component with `/`; mobile menu opened and closed | **Checked for mouse**. Film skip is deliberately keyboard-only and hidden offscreen until focus. Keyboard activation was not part of this mouse pass. |
| `/models` | 26/26 | Signature and Bespoke full-panel links navigated; both expanded on hover | **Checked**. Desktop nav contrast repaired; mobile menu passed. |
| `/models/signature` | 21/21 | All four floor-plan filters, all six model choices, detail open, tabs and close exercised | **Checked**. Detail dialog removal was verified after its exit animation. Route intentionally omits the shared footer. |
| `/models/bespoke` | 26/28 initially; both blocked header targets passed after entrance | Four Next-step buttons advanced the section; mobile menu passed | **Checked**. Initial misses came from the finite entrance overlay. |
| `/projects` | — | — | **Deferred by user** after initial route inventory. No hover/click acceptance claimed. |
| `/projects/[slug]` | — | — | **Deferred by user** with the Projects page. |
| `/hospitality` | 31/31 | Intro and closing Enquiry links navigated; photo viewer opened, next/previous worked, close removed the dialog | **Checked**. Both circular inverse-colour headings now work; closing navigation repaired; see H-01 and H-02. |
| `/process` | 24/24 | Shared header, footer and mobile menu; route has no separate in-page link/button | **Checked** for mouse controls. |
| `/sustainability` | 25/25 | In-page Begin a conversation link navigated; mobile menu passed | **Checked**. |
| `/journal` | 36/41 direct; five moving, horizontally offscreen marquee cards | First article link navigated; mouse drag moved the marquee track 130px | **Checked for reachable controls**. The five cards link into the user-deferred Projects section, so their destination clicks remain deferred. |
| `/journal/compact-site` | 31/31 | Article anchor, related article and return action tested | **Checked by article template**. |
| `/journal/sloped-land` | 31/31 | Article route opened, HTTP 200; shares tested article template | **Checked by template**. |
| `/journal/small-retreat` | 31/31 | Article route opened, HTTP 200; shares tested article template | **Checked by template**. |
| `/journal/material-comfort` | 31/31 | Article route opened, HTTP 200; shares tested article template | **Checked by template**. |
| `/journal/factory-to-site` | 31/31 | Article route opened, HTTP 200; shares tested article template | **Checked by template**. |
| `/journal/hospitality-rooms` | 31/31 | Article route opened, HTTP 200; shares tested article template | **Checked by template**. |
| `/about` | 24/24 | Shared header/footer controls; footer Process link navigated; mobile menu passed | **Checked**. Footer social hover was specifically retested. |
| `/enquiry` | 34/34 | All three tabs selected; inputs and selects exercised; button hover visually inspected | **Partial by user direction**. Submit/delivery intentionally remains unresolved (E-01). |
| `/models/signature/tengo/configure` | 26/26 | Material swatch selected, Next advanced to Roof; Interior and Original state changes observed; Review opened and Copy selection link produced a URL with reduced motion | **Partial**. Edit/reset and a full normal-motion mouse run were hindered by headless 3D rendering (C-01). |
| `/models/signature/kray/configure` | 24/24 | Interior state change observed; Review opened with reduced motion; route opened, HTTP 200 | **Partial** for the same headless 3D browser limit (C-01). |

## Fix and finding log

| ID | Location | Finding | Action and verification |
| --- | --- | --- | --- |
| H-01 | Hospitality selected and closing headings | Circular inverse-colour lenses stayed at `0px`: GSAP SplitText replaced their React descendants, and the decorative wipe could intercept pointer movement. After the first repair, the closing circle could also appear in empty space beside wrapped text. | Preserved the heading DOM during the wipe and made the wipe pointer-transparent. A Hospitality-local lens now measures rendered text fragments before activating, while retaining the 21st.dev inverse-colour effect and leaving the deferred Projects component untouched. Browser retest: both headings activate over letters; closing lens remains inactive in blank space and stops when the pointer leaves the text. |
| H-02 | Hospitality closing Enquiry link | A real mouse click reached the anchor and requested Enquiry, but the client route transition stalled after the long pinned timeline and the URL stayed on Hospitality. | Kept the magnetic pointer effect and used native navigation for this link's ordinary primary click. Browser retest reached `/enquiry?intent=hospitality`. Modified clicks keep their usual browser behavior. |
| M-01 | `/models` desktop header | Journal/About nav text crossed the selector's pale half and became hard to read. | Added a dark, translucent nav backdrop only on this route. The 1440px before/after captures show consistent text contrast over both halves. |
| E-02 | Enquiry submit button hover | The source's fixed `scale(100.8)` dot only covered about half of the 646px-wide button; the white reveal text crossed onto the pale uncovered area. | Replaced the fixed scale with a full-button circular clip reveal and delayed incoming text until the fill advances. At 580ms hover, the whole button is dark and the label/arrow are readable; screenshot saved. |
| E-01 | Enquiry submission | Each form prevents native submission and has no delivery, success or visible validation outcome; empty fields currently pass `checkValidity()`. | **Deferred by user** (“skip that part well figure that later”). The button's visual hover was repaired; form delivery was not changed. |
| I-01 | Hero V2 film skip | Automated mouse click timed out because the skip button is intentionally placed offscreen until keyboard focus. | Classified as a keyboard-only control from source; no mouse fix. |
| C-01 | Signature configurators | In headless Chrome, the 3D renderer saturated CPU and normal-motion clicks sometimes timed out even though some clicks landed. | Browser confirmed Interior/Original state changes, Review opening on both models under reduced motion, and a share URL on Tengo. Edit/reset and the full normal-motion mouse sequence remain **unverified**. Treat as a verification limit, not a confirmed site defect. |

The circular inverse-colour lens is explicitly mounted on the two Hospitality headings and the Projects atlas headline. Other public headings do not mount that component; adding the lens globally was not inferred from this audit. Projects remains deferred.

## Validation and remaining work

- Browser: zero page errors in the 20-route hover sweep; no desktop horizontal overflow; one global Obsidian cursor root per route.
- Mobile: 13 route templates tested at 390 × 844; menu opened nine links and closed with Escape after hydration; no horizontal overflow.
- Code: TypeScript and scoped ESLint passed after the final lens and link changes. Focused Header, Hospitality and Enquiry suites passed: 24 tests across three files. An earlier isolated Hospitality run timed out under concurrent browser load; reruns passed.
- **Still not done:** Projects and project details, including the five Journal marquee links into Projects, per user direction; Enquiry submit/delivery, per user direction; configurator Edit/reset and a normal-motion, hardware-rendered full control run.
