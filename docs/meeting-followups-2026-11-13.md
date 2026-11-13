# 11 November meeting follow-ups — 13 November 2026

Items from the 11 November meeting notes that were still open. The configurator and the
red-house imagery item were left out at the owner's request.

- **Logo:** the MODHOMES line is removed. `public/assets/projects/brand/okno-white.svg` is the
  standalone OKNO wordmark, cut from `okno-modhomes-white.svg` with the same paths (467×91).
  Header, admin brand preview, Bespoke glyph mask and admin brand defaults use it.
- **Sustainability typography:** a size census against `typography-scale.css` found one
  off-token size (the phone press-citation heading used the spec size); it now uses the body
  token.
- **Admin image replacements keep the slot's proportions:** every image was swapped for
  extreme-ratio images in a slot test. Project galleries were the only slot whose layout
  followed the image, so they now use fixed 4:3 tiles (`MasonryLightbox even`).
- **Consistent aspect ratios:** covered by the same slot test and change.
- **Collection cards:** hover grows one card and shrinks the other by the same amount; at rest
  both are equal. Narrow cards show the whole house (13 November, earlier release).
- **Hospitality pop-up image:** the card is centred vertically on tablet/desktop and its scroll
  travel is reduced (70 → −70 px), so it no longer drifts below the frame.
- **Bespoke phone panels:** desktop-like spacing between heading, photo and caption. Short
  landscape phones stack the stages like portrait phones so text never sits on the photo.

## Device audit fixes in the same release

- Process (phone): the story copy follows the build-sequence bar when the browser bar shows.
- Signature/Forza (phone): feature-card scroll ranges no longer overlap, so two cards never show
  at once; inactive model names and the card topline have higher contrast.
- About (1024×768): founder captions sit above the founders image.

Remaining audit flags were checked on screenshots and are fade-in frames, gradient backgrounds
or horizontally scrollable rows, not visible overlaps.
