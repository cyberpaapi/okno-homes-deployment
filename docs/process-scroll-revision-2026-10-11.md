# Process scroll revision — 11 October 2026

## User direction and checklist

This supersedes the same-day chapter-playback experiment. The user rejects its forced holds, slow playback, intermediate transition layers and Previous/Continue/View the timeline controls. Smooth movement matters more than instant response or rapid reversal.

- Restore continuous scroll-controlled forward/reverse film progression, without consuming wheel/touch/keyboard gestures or forcing page position.
- Use a shorter film scroll distance and gently eased playhead so imperfections do not remain exposed at fixed chapter stops.
- Remove the added playback buttons, loading overlay and overlapping moving caption layers. Keep the accepted compact sequence rail and detailed timeline below; the user's “useless timeline” clarification identifies the new buttons.
- Preserve the completed-home cover, full-width timeline geometry, phase/day typography, bounded Silk background, original films and other public routes.
- Verify decoder/fallback lifecycle, motion pacing, forward/reverse movement, restored opening, desktop/narrow layout, build/trace gates and the deployed page.

## Implementation decisions

The film track is 480svh (380svh of sticky scroll), rather than the earlier 760svh scrub or locked 180svh experiment. The first 16% expands the accepted cover; the film maps 16–94% to its complete source sequence. The last interval holds the completed home before leaving the pinned area. Page scroll is always native.

A critically damped playhead eases toward the current scroll target. A 0.24-second smoothing parameter and bounded 3.2 film-seconds/second avoid hard jumps, sharp direction flips or spring bounce. The cover expansion has its own restrained viewport easing; it does not feed a second spring into film time. Captions and compact rail follow the actually presented frame, not an unloaded target. Chapter/day cue positions remain unchanged; there are no chapter waits. The cover blend is tied to scroll position, so reversing returns it without a timed overlay flash.

Original masters have 769 presentation-ordered H.264 samples each, at 30fps, with six-frame keyframe spacing. Their byte offsets/configuration are indexed into two small manifests by `scripts/prepare-process-video-index.mjs`. The Process renderer adapts the existing V1 packet decoder with independent code; V1 implementation and files are untouched. Decoding uses the exact compressed source packets and native source dimensions, at most 48/96 cached frames depending on device memory. No video re-encoding, new generated film, frame interpolation, reduced desktop resolution or changed codec is introduced. Unsupported configurations and CMS replacement films use the existing one-at-a-time native seek adapter with the same eased target.

Offscreen/hidden playhead work pauses; cleanup cancels animation work, releases decoded frames and aborts the stream. There are no global scroll locks, non-passive input listeners, arbitrary ports, new packages or new third-party components. Reduced-motion stills and existing menu/navigation remain.

Original SHA-256: HQ `ab4451bfa9742f77878ee86a866724a1df9dd6d1d4acc18b58289b12e1a001dc`, mobile `05f710983853f49bebbcd34c609f0dfca4a89ae1af7d4fc65650bba9440ec23c`. The source-verified manifests assert both unchanged files and matching presentation timestamps. Native browser frame inspection is separate from physical-device performance acceptance.

## Verification ledger

- Initial targeted run: 23/24 passed; an exact floating-point equality for 0.94 progress failed at 0.9999999999999999. The assertion now uses numeric tolerance. Final six-file run passed all 27 tests, covering playhead pacing/reversal/settling, original-packet decoding/cache/release, original V1 regression, native seek coalescing, Process rendering and field registry.
- A separate CMS-replacement/native-fallback test passed: eased advancement, reverse settling, actual seek publication callback and no work after unmount.
- Lint passed before the build. Build, final lint/type checks and rendered acceptance follow below when completed.

### Local acceptance

Production build and standalone TypeScript passed. Final full lint passed with only the local `.next-process-scroll` generated output excluded. The correct isolated output passed all 30 trace gates, largest 179.7 MiB; private data excluded and required models/media binaries retained. The trace command initially inspected the stale default `.next` cache; rerunning with the explicit current build path resolved that output-selection mistake. The generated TypeScript include changes were restored before commit.

The rebuilt server remains the sole website on 3134, with the existing admin gateway on 3140. All 15 canonical routes and 21 stylesheet assets passed launcher checks. In the rendered desktop browser, the frame renderer uses 1920×1080 and continuously advances from Land through Architecture/Design lock/Assembly; native scrolling reaches 720 then 1440px rather than being forced to an anchor. After settling, scrollY=1440 showed 12.0333 seconds; an upward gesture changed page scroll to 720 and gently reversed the presented frame. The actual frame, caption and rail remained aligned.

At 390×844, the initial reload selects the 1280×720 original source. One page scroll settles at 3.4000 seconds; reversing/Home restores scrollY=0 and cover opacity=1 while the hidden playhead eases back. Both layouts have zero horizontal document overflow. Only the existing Menu button is present; the three playback controls/loading overlay are absent. Local mobile captures: [cover](process-optimization-evidence/scroll-cover-mobile-local.png), [film](process-optimization-evidence/scroll-film-mobile-local.png). These are browser breakpoint and decoder checks, not a universal zero-dropped-frame or physical-device guarantee.

React review: decoder/manifests load in parallel only on Process; one effect owns abort, observation and animation cleanup. Transient frame/time data stay in refs/MotionValues, and React state changes only when the shown stage changes. CMS source identity remounts the owned renderer so a replacement cannot reuse stale packet metadata. V1 runtime is unchanged.

The local output was subsequently moved intact to `.next-release-process-scroll`, under the repository's existing release-cache ignore convention. The sole 3134 service was restarted against that output; all 15 routes/21 stylesheet gates passed again, the relocated 30 traces passed, and unmodified `npm run lint` passed. No additional build or application-source change was needed.

### Production acceptance

Application source `317e8b86fbdfe9dc961a49c286005f4a5ed07667` is READY as `dpl_HmeqeFUEFdx5WiUEHwKpZRakHizJ`, attached to `https://okno-homes-deployment.vercel.app`. Cloud compile, TypeScript and all 30 trace guards passed; largest 177.4 MiB. Project/team/repository are unchanged.

- Live 1280×720 viewport uses original 1920×1080 frame decoding. At scrollY=1260 it settles to 9.8667 seconds with Architecture selected and zero document overflow. An upward gesture returns page scroll to 720 while frames gently reverse, eventually settling at 3.4000 seconds/Land. Caption/rail follow displayed frames. The playback buttons and full-screen loading layer are absent; only the existing Menu button remains. No captured browser errors. [Clean Architecture proof](process-optimization-evidence/scroll-architecture-production.png).
- Native End reaches scrollY=7384 below the film without interception; Home returns to scrollY=0 and restores the cover. There is no fixed scroll anchor or chapter wait.
- Live 390×844 initial reload uses original 1280×720 frame decoding. One page scroll settles to 3.4000 seconds; upward/Home restores the opening cover. Zero horizontal overflow, no playback buttons. [Cover](process-optimization-evidence/scroll-cover-mobile-production.png), [film](process-optimization-evidence/scroll-film-mobile-production.png), [DOM observations](process-optimization-evidence/scroll-production-observations.json).
- Process/public content returned 200; both original master URLs returned 206 with unchanged total sizes 31,172,040 and 15,346,328 bytes. The original file hashes still match both indexed manifests. Spatial quality is preserved; the source film's own generated artifacts are not regenerated by this playback revision.
- Temporary viewport reset and the delivered Process tab restored to the opening. Existing account browser still awaits two-factor sign-in, so exact billing meters and the separate production Blob/publication block remain outside this acceptance.

The previous Vercel account/Blob block remains a separate issue. This implementation does not write cloud content, create a store or alter KRNL. See [account report](deployment/account-limits-2026-10-11.md).
