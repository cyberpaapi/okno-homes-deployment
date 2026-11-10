// The two faces every public page paints first. Without preloading, the browser only
// discovers them after parsing the stylesheet, so phones painted Arial before Kento and
// Govandi arrived (see docs/typography-qa-2026-11-10.md). Fonts load in CORS mode, hence
// crossOrigin even for same-origin files. Rendered as plain <link> tags in the root
// layout's <head>: ReactDOM.preload() hints were dropped on the force-dynamic home page.
export const criticalFontFiles = ['/fonts/kento-regular.woff2', '/fonts/govandi-adhiwan-regular.woff2'] as const;

export default function FontPreloads() {
  return criticalFontFiles.map(href => (
    <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
  ));
}
