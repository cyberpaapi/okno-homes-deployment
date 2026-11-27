# Testimonial quote typography — 27 November 2026

The owner requested an elegant, luxury handwriting feel for testimonials on phones and desktop. The existing brand headings, supporting Manrope text, names, locations, controls and photographs remain. Only review quote text receives the calligraphic default. This is a refinement of the approved Testimonials page.

## Font and source

Allura Regular (400), from The Allura Project Authors, is self-hosted as `public/fonts/allura-latin.woff2`. The CSS alias is `OKNO Handwriting`; the downloaded font binary is unmodified. The selected Google Fonts Latin subset includes the existing English preview quotes, curly punctuation and European currency characters. Other scripts fall through to the existing reading-font stack rather than fetching another font service.

- Family: https://fonts.google.com/specimen/Allura
- Google Fonts CSS used to select the 400 Latin asset: https://fonts.googleapis.com/css2?family=Allura&display=swap
- Exact asset: https://fonts.gstatic.com/s/allura/v23/9oRPNYsQpS4zjuA_iwgW.woff2
- Licence source: https://raw.githubusercontent.com/google/fonts/main/ofl/allura/OFL.txt
- Licence: SIL Open Font License 1.1; complete copyright and licence retained in `public/fonts/allura-OFL.txt`.
- Font: 26,488 bytes; SHA-256 `203583457d9c8cc90309f580dbf27a5fa9ed2893f06b8404ebb4c05e909c18e5`.
- Licence: 4,478 bytes; SHA-256 `c8cb4c94a558b6cb82ac5dc981a73a0b8aee35a5c52c8a7832fc0280c289ad49`.

The WOFF2 uses 1,000 units per em, an 800-unit ascender and -450-unit descender, zero line gap, x-height 295, cap height 590 and 272 glyphs. These values were read from the actual downloaded font with FontTools. A 1.4 line height and zero letter spacing retain room for the script's tails and joins. Default sizes are 30–32px on phones, 32px on tablets and 32–34px on larger screens. Administrator-supplied body-size variables still take precedence.

The external Google URLs are provenance only. Client font requests use the local WOFF2. The testimonial route calls React's `preload` while rendering, with matching anonymous font CORS and WOFF2 type, preserving the existing root Experience element and its server-supplied published content. `font-display: swap` retains readable fallback content if delivery fails. No global layout or unrelated route received a preload, and no package was added.

References checked: bundled Next font and CSS guidance; https://react.dev/reference/react-dom/preload. The primary React reference supports server-render-time font preloading and deduplicates equivalent hints.

## Admin override contract

`testimonialSectionStyle` adds `--testimonial-quote-font`. The review section defaults it to the handwriting stack, while the approved Manrope body and attribution roles remain. A valid registered review body-font or master-font choice overrides the quote font too. The existing `inherit`, `okno` default pairing and invalid-choice rejection remain. No new field, saved-data migration, picker option or CMS write is introduced.

The dedicated mapping tests check the default quote-only role, non-review text, master selection, section selection, inherited master and rejected CSS injection. The production build, rendered mobile/desktop readability, actual preload delivery and integration with the ink effect are checked by the orchestrator and independent verifier; these source changes alone do not certify physical-phone rendering.
