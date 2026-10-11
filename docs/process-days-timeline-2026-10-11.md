> The connected actual-day timeline remains current. The subsequently rejected white closing section is removed and both film directions are faster in [the final pacing correction](process-final-pacing-2026-10-11.md).

# Process day timeline correction — 11 October 2026

## Current decision

The client rejected the compact Stepper adaptation and all arbitrary phase counters. Replace it with one continuous, full-width connecting progress beam and the actual five day ranges: Days 01–10, 11–25, 26–60, 61–72 and 73–90. Keep the five photographs, copy, accepted forward motion, faster reverse cadence, scroll boundaries and page ending. No new buttons, font or slide-count display.

The client's 21st.dev requirement refers to catalogue-wide popularity, not their personal bookmarks. It is now recorded in repository AGENTS.md and the explicitly authorized memory note. Never add decorative counters to future OKNO revisions.

## Component evidence

- Selected source: [Timeline by Manu Arora / Aceternity UI](https://21st.dev/@manuarora700/components/timeline), demo **857**, component **325**; MIT.
- Actual component source and demo retrieved through 21st.dev; retained source: `docs/21st-source/process-days-857.tsx.txt`.
- The live related-component catalogue on [Product Timeline](https://21st.dev/@hyperiux/components/timeline) showed **4.2k bookmarks** for Aceternity Timeline, ahead of the other related timelines inspected (Modern Timeline 638, HextaUI Timeline 621, ReleaseTimeLine 819). Product Timeline was separately observed at 1.4k. This verifies strong relative bookmark popularity among inspected matches, not an absolute whole-catalogue ranking.
- Download totals and download-order controls were not exposed by the component pages or metadata API. No download count or rank is claimed.
- Adaptation: rotate the source's connected scroll beam to the horizontal day chronology, use the already-presented phase MotionValue for fill, keep milestone/date structure, use the existing OKNO colors and typography. Replace sample years with existing CMS day ranges. The film and gallery scroll implementations remain untouched. No second scroll runtime or package is added.

## Verification

Local verification passed: 21 targeted Process/playhead/boundary tests, zero-warning full ESLint, TypeScript, production build and all 30 trace checks (largest 179.7 MiB). Canonical 3134 launcher verified 15 routes and 21 stylesheet assets. Desktop 1280×720 and mobile 390×844 captures show all five day ranges connected across the width, with no arbitrary counts, new controls or horizontal overflow. Large reverse input moved from the completed last phase into Days 61–72; fill and current milestone followed presented motion. Browser error logs were empty. Evidence: `days-progress-desktop-local.png`, `days-progress-mobile-local.png` and `days-component-popularity.json` in `docs/process-optimization-evidence/`. Existing Process day-field inputs feed both the phase content and the bottom day markers; no new CMS keys are introduced. This does not change the separate production Blob usage block or claim live admin publication works while that store is suspended.


## Published acceptance

Application SHA `305844f09b8d8392cc2cfacf05e22f8a36c8803e`; READY deployment `dpl_7oGkLsPtWv6UHY4A9yeaYy5jNfVy`, canonical [Process page](https://okno-homes-deployment.vercel.app/process). Vercel compile, TypeScript and all 30 cloud trace checks passed (largest 177.4 MiB). Same private repository and existing OKNO project; no other project, storage or billing changes.

Live 1280×720 and 390×844 captures match the local composition. All five real day ranges remain visible, the beam spans 1195.2px on desktop and 342px on mobile, horizontal overflow is zero, and console error logs are empty. Large reverse input moves from the last phase to Days 61–72, with the fill settling at the same presented 0.75 phase position. See `days-progress-desktop-live.png`, `days-progress-mobile-live.png`, `days-progress-live-observations.json` and `days-live-http.json` in the evidence folder. Public Process and admin shell return 200; the unauthenticated owner API returns 401. Existing CMS publication limitations remain separate from this UI-only correction.
