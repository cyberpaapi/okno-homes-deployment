# Responsive layout correction — 14 October 2026

> The shared size presets described here are superseded by [original responsive sizes and optional numbers](numeric-typography-2026-10-15.md). This document preserves the earlier implementation/inspection evidence; its size measurements are historical.

The owner reported broken Hospitality card alignment after typography normalization and requested a site-wide responsive audit. This work stays in the declared Final Showcase checkout and uses the existing website on 3134.

## Repairs

- Hospitality's auto-width value column consumed almost all the description column. At 1440px the bottom cards grew to 1023px and descriptions wrapped to single characters. Card copy now stacks label, value and description. Values use the shared Heading preset; descriptions use Subheading. Row heights align, and all five values stay on one line at the checked widths. The preserved two-large/three-small source geometry returns above 1000px; intermediate screens use two columns and phones one column.
- The gallery's middle-column parallax could cross the Selected work heading. Desktop spacing reserves its 56px upward travel. At 900px and below the gallery uses two columns without tilt/parallax; phones keep the existing single-column photography. Responsive image sizes match both revised breakpoints.
- Signature feature cards and the scroll cue occupied the same space as the mobile floor-plan filters. Both now clear the two control rows. Below 621px screen height the stage fits the viewport, keeping the model selector and Explore details reachable; landscape story cards use the right side.
- Process detail descriptions extended below the clipped landscape stage. Below 621px height all five phases use normal vertical flow. The existing scroll guard checks the actual non-sticky layout and allows normal document scrolling; the pinned progress overlay is hidden in that layout. Day ranges and copy remain on their phase articles.
- Sustainability's short-screen facts and citations could extend outside their panels. The proof stage fits the viewport; overflowing sidebar and facts text can scroll. The closing line was reached inside the landscape facts panel and measured within the 390px viewport.

## Coverage and evidence

[Machine-readable verification](evidence/responsive-2026-10-14/verification.json) records the actual routes, viewports, element counts and final observations. Captures remain outside Git in the private `responsive-audit-2026-10-14` folder beside the owner's OKNO workflow.

| Surface | Browser coverage |
| --- | --- |
| Eleven main routes | 320, 360, 390, 620, 768, 900, 1024, 1280, 1440 and 1920px widths, plus 844×390 landscape |
| Seven project pages, six journal articles, Hero V1/V2, Tengo/Kray configurators | 390×844, 768×1024 and 1440×900 |
| Full main-page scroll sections | Phone and desktop viewport captures; additional Hospitality tablet sweep |
| Hospitality cards | Final measurements at 320, 390, 620, 768, 901, 1001, 1024, 1201, 1440 and 1920px; equal heights within each row and single-line values |
| Signature details | All six models after entrance transforms complete, at phone/tablet/desktop; nine currently published plan variants selected on phone; all variant tabs also exercised across the three widths |
| Enquiry | All three tab panels at 320, 768 and 1440px; no enquiry sent |
| Navigation | Shared and Models menus opened/closed at 320×740 and 844×390; overflow menu links retain scrolling |
| Short scenes | Process article bounds, Signature control bounds and Sustainability panel scrolling checked at 844×390 |

The route scans recorded no document horizontal overflow or unresolved narrow/clipped direct-text boxes. Initial Signature dialog scale animations produced narrow-box flags; all eighteen cases passed after the final card transforms completed. Intentional horizontal timeline, gallery and marquee transitions were reviewed separately from actual text clipping.

## Validation

- Focused Hospitality, Signature, Header, Enquiry and typography suites: five files / 42 tests passed.
- Process guard/Journey, Hospitality and typography follow-up suites: four files / 15 tests passed (overlapping suites, not 57 unique tests).
- Changed TSX lint and whitespace validation passed. Impeccable layout detector returned no findings.
- Production build passed with the isolated `.next-release-responsive-2026-10-14` directory. Website health check reused the existing process and passed all fifteen launcher routes and sixteen stylesheet assets.
- The fixed admin gateway was restored through `npm run admin` and its follow-up health check passed on 3140, reusing the existing 3134 website process.
- Fonts still use the admin-controlled shared presets and inherited master/section font variables. This task does not mutate CMS content or credentials.

## Acceptance boundary

This is local Chromium viewport and native mouse/keyboard verification. It does not certify physical touch devices, other browser engines, every possible width or arbitrary future CMS copy/font extremes. Scroll captures include intermediate animation states and do not certify film frame order or physical-device smoothness. No production deployment or external form submission occurred.
