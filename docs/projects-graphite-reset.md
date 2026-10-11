# Projects — graphite reset

**Content update, September 20:** real-project assets now replace the demo studies. See [Projects asset reconciliation](projects-asset-reconciliation.md) for the active seven collections, film assignments and pending client questions. The small cotton background texture is a subsequent explicit user request. Earlier monochrome/study descriptions below are historical.

This direction replaces the navy/gold atlas. The user's latest brief is the authority: a flat, artistic chalk/graphite globe, fine geography, restrained location marks, direct galleries, no gradients, surface textures, lit sphere, house-list section, or particle cursor on Projects.

The supplied No Art reference was reviewed both on Awwwards and on its live website. The visual reference is the flat geography, spacing, compact annotations, and location-led interaction; no source code, brand assets, or photos were copied.

- Reference: https://www.awwwards.com/inspiration/no-art-globe-no-art
- Live reference: https://www.noartmusic.com/
- Geography: Natural Earth 1:50m countries, public-domain data: https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/
- Source repository: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson

The new map uses orthographic vector projection on a 2D canvas, not a shaded sphere. Its desktop globe diameter is approximately 461px at 1280px viewport width. Fine coastlines/country boundaries and quiet graticules sit on a solid chalk background. Geographic data is local; `scripts/build-projects-cartography.mjs` strips metadata, simplifies sub-pixel detail, and generates the static vector fallback. Result: 524,556-byte geographic data, 242 features. Pointer drag, arrow keys, and previous/next selection rotate to projects. Hovering a location reveals the corresponding photograph and title; all pins link to dedicated gallery routes.

One screen replaces the previous long sequence and house list. A full-color photograph, coordinates, current project and compact previous/next controls surround the globe. Flat sage land and clay location marks give OKNO a distinct accent palette without gradients, lighting or surface textures. Native pointer/grab/crosshair affordances replace the particle cursor only on `/projects` and its gallery routes. Other pages retain their existing cursor behavior.

Projects no longer borrows `/models/` catalogue images. It uses the four existing dedicated project study assets. There is currently one available study photograph per location, so the gallery does not invent alternate views. The multi-image gallery implementation remains ready for approved site-specific photos. Locations and images remain unverified study content, marked accordingly and noindex. No generated media, spend, commit, push or public deployment.

Verification: TypeScript, lint, 38 tests across 12 test files, and optimized production build pass. Completed browser review on desktop and at 390×844 and 320×740. Verified globe drag, location selection, gallery transition, fullscreen viewing/Escape, remembered return location, mobile navigation, image loading and no horizontal overflow. Fixed a simplified geographic ring that inverted Honduras and incorrectly filled the spherical complement; a regression test now checks every feature. Clamped location labels to the visible viewport after finding a clipped narrow-screen label. No browser warnings/errors observed in the completed journey. Physical-device performance remains unmeasured. Production preview is running on port 3102 and left open for review.

Source scope comparison against `/tmp/okno-graphite-reset/source-before.json`: fourteen existing source files changed, all belonging to Projects or the Projects-only cursor exception; 75 existing source files unchanged. Previous implementation is backed up in `/tmp/okno-graphite-reset/`.

Preview: http://127.0.0.1:3102/projects

Run: `npm run build`, then `npm run start -- --hostname 127.0.0.1 --port 3102`.

## September 20 refinement

The accepted globe is roughly 6% larger on desktop, with idle rotation increased from 1.4 to 1.75 degrees per second, slightly quicker focus easing and drag response. Small-screen globe sizes are retained to protect the composition.

The gallery is now a single-project photographic viewer with the same navigation as the atlas. Removed the chain of other-project redirections and repeated image sections. One available photograph displays once; multiple approved images enable thumbnails, previous/next controls, keyboard navigation and touch swipes. Fullscreen viewing preserves the whole photograph, traps focus, closes with Escape and restores focus. Returning to the atlas restores the selected location. Existing study assets still repeat across locations until the client supplies project-specific photography.

Validation: 39 tests across 12 files, lint and production build passed. Browser review at desktop and mobile includes fullscreen, focus restoration, mobile navigation and remembered location. A mobile-menu Escape issue and subpixel horizontal overflow were found and corrected. The source baseline for this refinement is `/tmp/okno-gallery-refinement/source-before.json`; changes are confined to Projects components/routes, cartography color assets and this documentation. No changes to other pages or the shared cursor in this refinement.
