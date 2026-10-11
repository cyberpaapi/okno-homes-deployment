# Global footer — OKNO directory

## Current design

The 6 October 2026 footer follows the Vize footer screenshot supplied by the user: one brand area, three evenly spaced link categories, a row of social icons and a narrow lower strip. It uses the supplied OKNO wordmark and Geist OKNO type. The default surface is deep forest green; SiteFrame gives the homepage and both hero previews the landing editorial's `#141713` charcoal, Bespoke a pale blue surface with dark text and icons, Sustainability its near-black ending colour, and Journal a gradient drawn from the hero shader palette. Enquiry extends its dark-left/pale-right form composition into the footer on desktop and uses the form's pale surface on mobile. Projects and About keep their existing silk visual continuity. The footer is deliberately compact and has no newsletter, large wordmark, decorative glow or separate callout.

The categories are Homes (Signature, Bespoke, Hospitality), Explore (Projects, Process, Journal), and OKNO (About, Sustainability, Enquire). All internal destinations exist in the current checkout. The brand line, “Live better, live modular,” comes from the original OKNO website. The lower line, “Designed with intent,” is also existing OKNO language.

The 7 October admin extension keeps this layout and fixed link slots. A dedicated Footer editor exposes the existing brand line, four social icons/names/HTTPS URLs, three column headings, nine link labels and local destinations, and two bottom lines in rendered order. `{year}` in the copyright text renders the current year. The global logo remains owned by Global Brand. Existing 21st.dev-derived admin Accordion 24854, Field 26101, Button 143 and Dropzone 19201 controls are reused; no new 21st.dev component source was added for these fields.

## Social links and icons

The four exact social destinations were read from the footer of [OKNO's live website](https://www.oknomodhomes.com/) on 6 October 2026:

| Service | Destination |
| --- | --- |
| Instagram | https://www.instagram.com/oknomodhomes/ |
| YouTube | https://www.youtube.com/@OknoModHomes |
| LinkedIn | https://www.linkedin.com/company/oknomodhomes/ |
| Facebook | https://www.facebook.com/Oknomodhomes/ |

The Facebook and LinkedIn icon paths are copied from the SVG marks on OKNO's live website. Instagram and YouTube are bundled from the version 16 [Simple Icons](https://github.com/simple-icons/simple-icons) SVG set. All four are locally hosted, single-colour marks inside one consistent button treatment.

## Placement and earlier source

SiteFrame mounts this shared footer after ordinary public pages. It omits it from the immersive Signature Models route and every route below it, including configurators. The homepage and Enquiry page retain it. The prior footer, [Footer Section 2071](https://21st.dev/@efferd/components/footer-section), by efferd, supplied the restrained column entrance that remains; its retrieved source is docs/21st-source/rebuild-2071.tsx.txt. The previous inset panel, glow, and old grouping were replaced by the user-approved reference.

The 6 October refinement reduces the Process timeline's trailing space, the Projects footer's desktop top padding, and the About ending's bottom padding. These values are route-specific so the shared directory stays compact without crowding the page endings.
