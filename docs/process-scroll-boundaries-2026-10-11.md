# Process fast-scroll boundaries and timeline polish — 11 October 2026

## Requested correction

The user accepted the eased film but found that large forward/reverse gestures could move the page past it before its frames caught up. They also requested a more finished bottom timeline. This extends [the continuous-scroll revision](process-scroll-revision-2026-10-11.md); it supersedes that revision's unrestricted gesture boundaries, without reinstating chapter locks or playback buttons.

## Decisions and checklist

- Keep the existing critically damped film playhead, original compressed video packets, HQ/mobile dimensions, cover and cue timing.
- Bound gesture-driven page movement to the actually presented frame, allowing 6.5% of film progression ahead/behind. Repeated scrolls advance continuously; excess input is discarded rather than queued for delayed jumps.
- Release ordinary forward exit once the ending has been presented, and reverse exit once the beginning has been presented. The nearest unfinished sequence owns a crossing gesture: the film first going down, detailed timeline first going up.
- Small wheel/touch/key gestures remain native. Only oversized gestures/momentum are constrained. Zoom, links, menu/form interactions, browser restoration and explicit Home/End navigation remain available. Escape bypasses the guard; a film that makes no frame progress during eight seconds of constrained input fails open. Reduced motion and short mobile layouts retain native document flow.
- Keep the five-phase horizontal detailed timeline, but ease between complete phases rather than resting with one phase's image beside the next phase's text. Its local guard allows the next phase in either direction without jumping over the sequence.
- A crossing gesture enters the detail timeline on its complete first/last phase; another gesture advances within it. Deliberate End/history jumps prepare the original ending offscreen so subsequent reverse entry does not show a stale opening frame.
- Tighten the detail introduction gap, align day range with phase heading/copy, reduce oversized day numerals, and retain full-width imagery. Improve the film rail's contrast and vertical thumbnail/type alignment without adding controls.
- No new dependencies, generated/transcoded video, third-party component, CMS field or change to other routes. Existing 21st source provenance remains in [the Process component record](process-21st-components.md).

## Implementation and source verification

`processScrollGuard.ts` holds the directional boundary calculation and wheel-unit conversion. `useProcessScrollGuard.ts` owns and removes its listeners/MotionValue subscription, keeps transient data out of React state, and shares presented-progress attributes between the two local sequences. The original decoder and easing remain unchanged.

Initial eight-file regression run: 27 tests passed. After adding nearest-sequence ownership, the next eight-file run passed 28 tests, including huge forward/reverse input, momentum correction, touch/keyboard, idle entry, eight-second failure escape, menu/zoom/Home exemptions, cleanup and film/detail handoff. Original decoder/native-fallback/playhead/menu regressions pass. ESLint initially rejected direct dataset assignment through a hook argument; the effect now uses DOM attribute methods and full lint passed. The first completed production build, standalone TypeScript and all 30 trace guards passed (largest 179.7 MiB). Verification was interrupted once before an earlier completed build; no deployment was claimed from that attempt.

The batched first rendered pass at 1280×720 and 390×844 confirmed fast forward/reverse film bounds, native Home/End, original 1080p/720p rendering, zero horizontal overflow and matching settled phase imagery/copy. A 24-gesture forward path reached the ending at 25.5667 seconds before the next gesture could leave the pin. It identified three final corrections: entry must present the complete first/last detail phase, mobile rail labels needed breathing room, and End must prepare the ending offscreen for subsequent reverse entry. These are fixed together; mobile phase grouping is centered in its available viewport. A new native-offscreen test initially asserted before its requestAnimationFrame seek flush; it now waits for that frame flush before checking presented time. Final source gates/confirmation follow below.

Final eight-file regression run passed 31 tests, including the new complete-phase entry, offscreen-ending/native reversal and reset-velocity cases. The 19 directly affected gesture/playhead/native-fallback tests passed after the short-mobile layout exemption. Full lint and final production build passed. The sole 3134 server now uses `.next-release-process-guard-final`; all 15 canonical routes and 21 stylesheet assets pass. Original HQ/mobile SHA-256 hashes match the prior accepted masters. No application/media edits follow these gates.

## Rendered and production acceptance

First production application `e5db2466a1c397012b56900a70fbd8cc37b3826a`, READY `dpl_3kNdq3HKW4tLzuQNYE17ffiEMkeV`, confirmed large forward/reverse film bounds and exact original ending at 25.6000 seconds. The next gesture entered the complete first detail phase at scrollY=3821.3333. Live confirmation then found an idle-boundary regression: the eight-second stalled-source escape clock had also been armed for a deliberately static timeline entry. Pausing to read allowed the next large gesture to bypass the detail sequence. This first deployment is not final acceptance.

The focused correction clears that clock whenever the current scroll position's expected content is already presented, and arms it only for genuinely outstanding content. The handoff test now pauses for 60 seconds at both first/last detail entries before a large forward/reverse gesture; each must remain bounded. No further UI/media change is made. Final deployment identity and acceptance follow after this correction's verification.
