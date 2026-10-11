# Process closed-house ending — 11 October 2026

Superseded by the owner’s [12 October continuous-date and smooth-finish correction](process-continuous-days-2026-10-12.md). The grouped ranges and hard keyframe cut below are historical, not the current specification.

The owner requests one coherent Days 73–90 period and a held, complete house at Handover, rather than the film continuing into its ending effects.

## Decisions

- Assembly, Enclosure and Handover are visual chapters of the same documented on-site Days 73–90 period. Display the adjacent identical range once across those chapters in the build rail; retain all six chapters and their accessible individual labels. Architecture / Design lock likewise share one range. Do not invent unsupported day allocations. CMS chapter dates stay editable; different custom values form separate visible ranges.
- Original-frame inspection found the roof still resolving around 19.6–20.0 seconds. The first live inspection exposed residual roof geometry in frame 620. Handover now begins at presentation time 20.1 seconds and uses the fully resolved original final source keyframe 768 / 25.6 seconds. Repeat that unchanged packet through the short presentation hold ending at 20.6667 seconds, omitting the unresolved roof and cyan outro from Handover. Keep the completed frame through the end of the scroll track; reverse begins from that frame.
- Limit both the seek target and indexed decoder packet window, so cache lookahead cannot briefly present discarded ending frames. Apply the same final-source-frame mapping to native fallback for the built-in desktop/mobile films. Custom replacement films retain their own duration.
- No transcoding, added transition layer, arbitrary counters, new UI components, dates invented from animation time, media upload, key rotation, or changes to other pages. Preserve 4 film seconds/second forward, 5 reverse and damped braking.
- Preserve the separate five-photo Days 01–90 delivery chronology and all CMS content. The duplicate ranges were a presentation problem, not three independent build periods.

## Validation

Focused checks cover a single shared range with all chapter labels, exact Handover cue, native fallback endpoint/hold/reverse, replacement films and scroll boundaries. Original source frames were visually inspected in full-film and ending contact sheets (ignored artifacts/process-finish). Production build and live desktop/mobile acceptance are recorded below when completed.

## Production acceptance — 12 October 2026

- Process source corrections: `6236362` and `e7ffea3ad4a4ce76719f2449a50437af4ad2c250`; the latter is the accepted application release. READY deployment `dpl_Dp9Kks77S1etJEvo5nv89Gf8NqP6` is attached to https://okno-homes-deployment.vercel.app. The initial held-frame selection was rejected during live visual QA and replaced with the resolved final source frame before final acceptance.
- Five focused Process files / 23 tests passed. Follow-up coverage for native films and existing reload fixtures also passed. Zero-warning focused lint and full `tsc --noEmit` passed. Three existing reload-test mock casts were corrected to `PerformanceNavigationTiming[]`; no Hero runtime change is part of that correction.
- Cloud production build and TypeScript passed; all 30 function traces passed, largest 177.5 MiB, with private files excluded. The separate temporary local snapshot build was interrupted before completion; it is not counted as a passed build and its temporary worktree was removed. The existing fixed-port local runtime was preserved.
- Live desktop 1280×720 and mobile 390×844 both reached and held presentation time 20.6667 seconds using the original source frame at 25.6 seconds. Reverse entry returned into Enclosure, then fresh forward gestures restored the completed-house hold. Handover showed no suspended roof geometry. Both viewports show only the three grouped day ranges in the film rail, with all six named chapters intact. Mobile has no horizontal overflow. Browser error/warning logs were empty.
- Original desktop/mobile MP4 files and their compressed picture bytes remain unchanged. No CMS write, upload, authentication change, new cloud store, billing change or other project mutation was required.

[Desktop held house](process-evidence/handover-production-2026-10-12.jpg) · [Mobile held house](process-evidence/handover-mobile-production-2026-10-12.jpg) · [Observed endpoint and ranges](process-evidence/handover-production-2026-10-12.json).
