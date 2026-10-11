# Journal: 21st.dev component record

Implemented on 24 September 2026 after restoring the verified GitHub Journal baseline at commit `c989a03412914463267c037b9ee00d89ac1db5a5`. Full component and demo source—not thumbnails or metadata—was retrieved through the signed-in 21st.dev MCP before adaptation.

| Journal use | Retrieved source | Production adaptation |
| --- | --- | --- |
| Animated background | [Just Playing / ShaderBackground by reachwelch, demo 20032](https://21st.dev/@reachwelch/components/just-playing) | The retrieved WebGL mesh-drift shader is mounted behind the opening with a dark forest-green palette. Cursor response stays disabled; DPR and pixel count remain capped; rendering stops offscreen and in hidden tabs. A static first frame is used for reduced motion. |
| Press and archive reels | [Marquee Along SVG Path by danielpetho, demo 19091](https://21st.dev/@danielpetho/components/marquee-along-svg-path) | Its pointer-capture drag, inertial decay and continuous Motion frame loop were adapted to the approved straight horizontal treatment. Desktop travel uses a cached-width, GPU-composited transform rather than per-frame document scrolling; mouse users can force-drag either row, touch users retain native horizontal scrolling, and automatic motion pauses while interacting. |
| Publication marquee | [Marquee by lukacho, demo 1198](https://21st.dev/@lukacho/components/marquee) | Keeps the bookmarked duplicated-track marquee, rebuilt as a full-width sequence of publication wordmarks. It pauses on hover, keyboard focus, offscreen and for reduced motion; duplicate content is inert and hidden from assistive technology. |
| Journal article index | [Blog Grid by shadcnspace, demo 28557](https://21st.dev/@shadcnspace/components/blog-01) | Retains the source's conventional editorial card proportions and one-time viewport reveals. The six original OKNO guides now link to internal reading routes. Scroll-linked image drift is bounded and disabled for reduced motion. |
| Internal reading pages | [Article With Author Sidebar by olewandowski1, demo 29471](https://21st.dev/@olewandowski1/components/article-5) | Full [component](21st-source/journal-article-29471.tsx.txt) and [demo](21st-source/journal-article-29471-demo.tsx.txt) source retrieved on 6 October 2026. Adapted its content column, sticky sidebar, related-story links and mobile stacking. Removed the example's invented author, date, subscription form and generic UI package dependencies. Added OKNO photography, contents links, paper material, generous reading measure and route-specific metadata. |
| Headline typography | [Text Reveal by ddoemonn, demo 23571](https://21st.dev/@ddoemonn/components/text-reveal) | Preserves capped word staggering, one-time in-view playback, blur/translate reveal and an accessible non-animated text equivalent. Reduced motion resolves immediately. |
| Corner headline control | [Morphing Arrow Button by arunachalam, demo 3179](https://21st.dev/@arunachalam/components/morphing-arrow-button) | Converted to a semantic internal/external link and held at a fixed circular size. Only the arrow shifts subtly on hover or focus; the control never extends. This explicit control—not the image or card—is the Journal's magnetic cursor target. |
| Shared cursor | [Fluid Magnetic Cursor by jahed, demo 9314](https://21st.dev/@jahed/components/magnetic-cursor) | On Journal, activation is whitelisted to shared navigation and `[data-journal-cursor-action]`. The particle trail is omitted on this route, so copy and photography retain the native cursor. Touch and reduced-motion users keep native behavior. |

No selected component declares an external font. The Journal continues using the site's locally served Geist files with `font-display: swap`.

## Content and media validation

- Press titles and dates come from Architectural Digest India, New Atlas, Homecrux, World Architecture Community and ArchDaily.
- Every story uses a supplied clean project photograph rather than a screenshot of a publication page.
- Reflections/Kioo images carry the visible credit `Photography · Inclined Studio`.
- ArchDaily is labelled a project record, not an independent endorsement.
- The archive row keeps verified project records. The lower Journal grid links to six original general-interest guides at `/journal/[slug]`; they avoid fabricated bylines, dates, project results and performance claims. Local project photographs illustrate the subjects and are captioned as such.
- No unsupported The Hindu or Times of India feature is shown.

## Publication marks — 5 October 2026

The press cards and featured story now use each publisher's own mark beside its name. These are local copies from the publishers' sites, so the Journal does not depend on cross-site image requests. The marks identify the source of each linked story; they are not OKNO endorsements. Archive cards keep their plain `OKNO project archive` label.

| Publication | Local asset | Publisher-hosted source |
| --- | --- | --- |
| Architectural Digest India | `public/assets/journal/source-logos/architectural-digest.png` | [AD favicon](https://www.architecturaldigest.in/verso/static/architecturaldigest-global/assets/favicon-ad-int.ico), converted from ICO to PNG without changing the artwork |
| New Atlas | `public/assets/journal/source-logos/new-atlas.png` | [New Atlas touch icon](https://newatlas.com/apple-touch-icon.png) |
| Homecrux | `public/assets/journal/source-logos/homecrux.png` | [Homecrux favicon](https://cdn.homecrux.com/wp-content/uploads/2026/09/cropped-Fab-Icon-Final-192x192.png) |
| World Architecture Community | `public/assets/journal/source-logos/world-architecture-community.png` | [WAC touch icon](https://worldarchitecture.org/wac/favicons/apple-touch-icon.png) |
| ArchDaily | `public/assets/journal/source-logos/archdaily.svg` | [ArchDaily official logo page](https://www.archdaily.com/logos), [white isotype SVG](https://assets.adsttc.com/doodles/flat/logo-white-isotype.svg) |

The marks are decorative images because the adjacent source names provide the accessible text. If a source name is changed to an unknown publication through content settings, no unrelated mark is shown.

On 6 October, the same five local marks were added beside publication names in the full-width marquee. An SVG luminance filter renders exact silhouettes from the publisher assets in monochrome white against the existing dark green background, without square favicon backgrounds; the original colored marks remain on the press cards. The duplicate moving track stays hidden from assistive technology.

## Outstanding client inputs

1. Confirm website-reuse rights for Inclined Studio photography.
2. Supply canonical article URLs for Architecture+Design India and India Art n Design if they should become full press cards.
3. Review the six original Journal guides and supply any approved author names, publication dates, canonical slugs and final copy before public editorial release.
