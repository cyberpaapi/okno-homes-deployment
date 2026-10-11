# Process reverse cadence, phase progress and page ending

## Request and plan

The user accepts forward film motion and asks for a slightly faster reverse, a replacement for the bottom timeline's unfinished-looking progress line, and content after the five photographs. Work is confined to Process, its matching admin content inventory and documentation.

1. Preserve forward timing, original media and the accepted input bounds; give reverse playback 25% more travel per second with the same critically damped acceleration.
2. Replace the long ticked baseline with a compact phase count and controlled segments. They track the phase actually displayed, work backwards too, and introduce no playback/navigation buttons.
3. Add a normal-flow pale-green editorial close: “Before we begin.” Land, brief and timing prompts prepare visitors for a conversation, with links to Enquiry and Models. No new media or factual delivery promise.
4. Add the closing copy to the Process editor after Detail 5. Preserve cloud content, owner credentials and storage.
5. Run relevant regressions, lint, TypeScript/build and trace checks; inspect desktop/mobile together, make one defect batch if necessary, then deploy the tested application commit to the existing OKNO project and verify the live route.

## Decisions and provenance

- Forward limit remains 3.2 film-seconds per second; reverse limit becomes 4.0. The .24-second damping parameter, velocity braking, delayed-frame cap, original cue points and presented-frame gesture boundaries are unchanged. The existing decoder still presents original packets; no re-encoding or quality reduction.
- The replacement marker is read-only. Its accessible list identifies the current phase with `aria-current="step"`; its count and short segments replace the old full-width line. It derives state from the presented spring, not raw scrolling, and updates React only on phase changes. Reduced-motion and short mobile layouts retain ordinary stacked articles and omit the marker.
- Retrieved actual Component and Demo source from 21st.dev **Animated Progress Stepper**, **shadcnspace**, demo **28558**, parent component **14938**: [source listing](https://21st.dev/@shadcnspace/components/stepper-03). `ProcessPhaseProgress.tsx` adapts its controlled active/completed state, current-step semantics and eased progress presentation into OKNO's existing CSS Modules/motion stack. Checkout buttons, icons/checkmarks, pulsing rings, panel chrome and workflow state are removed; no package added.
- Also inspected actual **Reshaped Progress indicator** source/demo **17921**, author **reshaped**: [listing](https://21st.dev/@reshaped/components/reshaped-progress-indicator). It re-exports a package instead of exposing the underlying component; it is not used or installed.
- The closing extends the existing Bodoni/Geist and green palette with a paper surface. It is useful preparation content rather than another pin, animation or video. Existing global footer remains the only footer. All 11 copy fields use the current publication subscription and editor; URL targets stay fixed to real routes. Enquiry delivery remains explicitly deferred.

## Verification

Local acceptance: **57 relevant tests passed** (33 gesture/playhead/native-fallback/route/inventory checks plus 24 content-store tests). The new sustained-direction regression measures a 1.25 reverse/forward travel ratio, caps reverse frame movement and verifies exact settling; the existing forward/reversal/delayed-frame checks still pass. One content-store assertion retained the old 71-field total; it was updated to the new 82-field inventory and the 24 tests then passed. Full zero-warning lint, affected-file lint, standalone TypeScript and production build pass. All 30 trace guards pass, largest 179.7 MiB; no private local data is traced. Both original master SHA-256 hashes match the preceding accepted release.

One batched 1280×720 / 390×844 inspection shows legible compact phase markers, balanced closing copy and complete action hit areas, with no horizontal overflow. The read-only finishing reviewer returned **Ship the narrow extension**, with no material visual blocker. The computed closing font matches the accepted timeline font (`Geist OKNO`) under the existing public brand override; the override is retained. This is an ordinary extension, not a new system or a font redesign: green palette and incumbent geometry remain, no DESIGN.md/Product context drift is repaired.

Browser actions confirm Enquiry and Models navigation, large-forward movement bounded at scrollY=576.6667, complete mobile last-phase entry at 7757.3335 followed by inward reverse movement to 7216.6665, full desktop timeline/film inverse traversing chapter labels and ending at scrollY=0 / presented time=0.0000. No captured browser errors. Reading/momentum bounds are retained without source changes. [Observation record](process-optimization-evidence/ending-local-observations.json).

The sole 3134 website uses `.next-release-process-ending`, with all 15 canonical route / 21 stylesheet checks passing. The 3140 gateway reuses it; unauthorized content API returns 401 and gateway ready=true. The 11 closing fields are inventory/validation verified. No live CMS write, key change or storage change is performed; production publication remains subject to the documented Blob suspension. No claim is made of physical-device performance or enquiry email delivery.

Layout evidence: [desktop ending](process-optimization-evidence/ending-close-desktop-local.png), [desktop marker](process-optimization-evidence/ending-marker-desktop-local.png), [mobile preparation](process-optimization-evidence/ending-close-mobile-local.png), [mobile actions](process-optimization-evidence/ending-actions-mobile-local.png), [mobile marker](process-optimization-evidence/ending-marker-mobile-local.png).

Production identity and live confirmation will be appended after the application commit is READY.
