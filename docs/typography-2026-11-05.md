# Supplied OKNO typography scale — 5 November 2026

The owner asked to deploy the attached `OKNO Typography Font Sizes_new.pdf`. It supersedes the earlier all-Manrope default and the homepage 1.35 size multiplier. Existing wording, logo artwork, video loading/scrubbing, media assets, prices and CMS publication data are unchanged.

Kento Light/Regular/Bold and Govandi Adhiwan Regular were retrieved from the client's existing https://www.oknomodhomes.com/ CSS declarations. Exact URLs, byte sizes and SHA-256 hashes are in `public/fonts/okno-font-provenance.json`. Files are served locally; no third-party font request is needed. Manrope supplies U+20B9 explicitly through the currency-only OKNO Rupee face.

`src/app/typography-scale.css` owns the mobile, tablet (768px), desktop (1280px) and large desktop (1920px) scale. Gaps between the document's viewport ranges retain the smaller scale. Its explicit 13px minimum takes precedence over conflicting 11/12px table entries. Body is 16/16/17/18px; fields stay 16px; footer text stays 13px. Role-specific CSS fallbacks retain section numeric overrides. Split headlines inherit the same size across spans, and Kento tracking is kept low. Long editorial card sentences and Hospitality descriptions use Govandi Regular per the document's full-sentence rule.

The default admin font selection is now the paired OKNO preset. Individual Kento/Govandi and previous font choices remain available. Explicit saved choices and numeric overrides continue to win; neither local nor production had existing typography overrides at inspection. No CMS writes were needed.

Layout accommodations: wider mobile navigation with internal scrolling, intact swipeable Signature plan filters, stacked model-selector text, Journal columns wide enough for Kento, and Hospitality numerical figures distinguished from text labels. Existing retrieved components and provenance are preserved; no new visual component was introduced.

Validation is recorded in deployment operations after release. PDF editing and measurement of the old site's complete computed scale were not part of this website deployment.

## Local checks

85 focused tests across typography, shared navigation, Home V1/timeline, Signature, Bespoke, Hospitality, Journal and Enquiry pass. TypeScript, scoped zero-warning ESLint, CSS parsing and diff checks pass. The wider suite was stopped after stalling; it is not claimed complete. Its reported Bespoke image failure was a stale pre-thumbnail assertion and was corrected, then the relevant suite passed.

Browser checks covered the homepage desktop/phone headline, phone menu, model selector, Signature/detail prices, Journal desktop/phone, Enquiry fields, About and Hospitality. All six inspected form fields compute to 16px Govandi. The page checks are visual/computed-style verification, not physical-iPhone testing. Existing 21st structures and hook lifecycles remain intact; the two TSX edits only widen the shared menu and distinguish numeric Hospitality figures.
