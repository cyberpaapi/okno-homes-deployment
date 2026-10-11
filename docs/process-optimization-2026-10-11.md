# Process chapter playback — 11 October 2026

## Request checklist and implementation plan

1. Verify the signed-in Vercel account, plan, quotas, feature blocks and available usage counters; distinguish allowances from measured consumption.
2. Replace continuous scroll seeking with native 1× playback. Enter the pinned film after one or two scroll gestures, pause after each of the six existing chapters and require a fresh gesture before proceeding. The user confirmed all six stops, including both Days 11–25 chapters.
3. Preserve both original film files, dimensions and frame rates. No re-encoding or lower-quality replacement.
4. Add a separate cover photograph with an opacity transition into decoded video. Expose it in the Process opening editor separately from the film fallback poster.
5. Restore fluid Silk background cadence, and pause that shader while the opaque full-screen film covers it.
6. Remove the five-phase timeline's outer width cap and side bars; retain deliberate inner spacing and readable copy.
7. Promote chapter labels, day ranges and phase headings over supporting prose. Preserve the shared header/logo and other routes.
8. Verify playback, all chapter stops, ignored gestures during playback, fresh-gesture continuation, reverse navigation, keyboard/buttons, escape/skip, media errors, visibility and reduced-motion paths; verify desktop/narrow layouts, lint/tests/build and the deployed page.

## Motion and interaction decisions

One continuous cover expansion leads into the film. Scroll chooses a chapter; the browser's video decoder determines frame cadence. Input while a chapter is playing is consumed rather than queued. A paused chapter holds its final frame indefinitely. A fresh downward gesture resumes the next chapter. Upward navigation returns to the previous chapter's held frame, while Escape or “View the timeline” always exits the film. Buttons offer the same actions to keyboard/touch users. Native scrolling resumes below the short pinned track after the last chapter. No body overflow or global scroll configuration is changed.

The original cue boundaries (seconds): 0, 7.65, 10.241667, 11.375, 16.675, 21.975, 25.633333. Replacement masters must preserve chapter order/duration. Day labels remain CMS content, not timing inputs. Reduced-motion visitors retain the existing document-flow stills.

Cover: a distinct 1920×1080 WebP at quality 95, extracted from the accepted HQ master at 24.8 seconds. It shows the completed home instead of an empty land frame. Original media SHA-256 before changes: HQ `ab4451bfa9742f77878ee86a866724a1df9dd6d1d4acc18b58289b12e1a001dc`; mobile `05f710983853f49bebbcd34c609f0dfca4a89ae1af7d4fc65650bba9440ec23c`.

## Progress and verification

Implementation, local acceptance and production verification are complete as recorded below. Source checks alone do not establish smooth playback on every physical device. Exact Vercel usage meters and cloud admin publication remain blocked as described in the account report.

### Source and interaction verification

The first browser pass exposed a real entrance fault: a full-page gesture could cross the complete sticky interval before the scroll listener ran. The lock now catches that crossing while any of the short film track remains visible; a dedicated regression exercises a 720px jump. Touch gestures begun during playback cannot advance after a stop. Hidden-tab pauses resume the unfinished chapter, and buffering resumes the same chapter rather than skipping it.

The full regression run checked 82 files / 323 tests; one existing CMS assertion still expected 70 Process fields and failed after the new cover field raised that to 71. That assertion was updated, and the follow-up CMS/controller run passed 34 tests (24 store + 10 chapter/gesture cases). Earlier focused Process rendering, field registry, day parser and V1 decoder tests passed. An existing canvas mock needed a type-only adjustment for the installed DOM getContext overload; runtime V1 code is unchanged. The final TypeScript/build/lint and browser results are recorded below when complete.

React review: one lifecycle owns the media and scroll listeners; input is non-passive only when cancelling wheel/touch; page scroll remains passive. Transient frame progress uses MotionValue, avoiding React renders per frame. Lifecycle cleanup cancels frame callbacks, pauses media and removes listeners without changing body styles. Reused shader's existing paused/visibility/reduced-motion behavior remains intact. No new dependencies.

### Rendered and CMS checks

- Desktop native playback verified all six held end times at 1920×1080, playbackRate=1 and pinned scrollY=396. The initial browser capture is in [local-chapter-stops.json](process-optimization-evidence/local-chapter-stops.json). Forward continuation initially caused a tiny boundary seek/loading flash; that seek has now been removed, and a test asserts the held currentTime is not rewritten when advancing. Reverse navigation still seeks once to the previous held frame.
- 390×844 viewport verified zero horizontal document overflow, original mobile master selection at 1280×720, normal playback, Land hold, Skip and keyboard Home. This is desktop browser breakpoint testing, not a physical phone benchmark.
- One authenticated local cover Save/Publish cycle verified draft privacy, public API propagation and a changed image src in an already-open page without reload. The exact original published fields/collections were restored, and the page returned to the completed-home fallback. Local revisions advanced 15→16→17. Test-only content never went to the cloud.
- The detail track occupies the full 1272px document width at the default 1280px viewport; horizontal document overflow was 0. The existing horizontal timeline remains scroll-linked, now damped.
- Subsequent visual findings: cover fitting must follow the visible opening rectangle as it expands (rather than cropping a full-screen photograph through that rectangle); tall screens request an image width sufficient for cover-fit height. Outgoing/incoming chapter copy shares an absolute bottom anchor so the crossfade cannot shift the next heading through document flow.
- Browser decoder dropped-frame statistics are unavailable through this read-only inspection surface. Native-rate progress, holds, input behavior and source dimensions are verified; no claim of zero dropped frames on every physical device is made.

### Vercel limits

See [the account limit report](deployment/account-limits-2026-10-11.md). CLI authentication is confirmed, the account is Hobby and Blob remains blocked. Exact cloud usage meters require the pending browser verification. Production admin publishing cannot be accepted while that storage is unavailable.

### Final local acceptance

Final production build, standalone TypeScript, lint and trace checks passed (30 traces, largest 179.7 MiB). Final targeted rendering/controller/registry/CMS validation passed 46 tests; the final rendering/controller repeat passed 12. The earlier full-suite count correction is explicitly described above rather than hidden.

Desktop and 390×844 final cover composition passed: the completed home is visible inside its opening frame on both layouts, with no horizontal overflow. Proof: [desktop cover](process-optimization-evidence/cover-final-local.png), [mobile cover](process-optimization-evidence/cover-final-mobile.png). Website health checks cover the 15 canonical editorial/configurator routes and 17 stylesheet assets; existing admin gateway remains on 3140. Original master media bytes and HTTP 206 support are retained. Production deployment verification follows below.

Final native continuation check: Land held at 7.635115 seconds; a fresh scroll resumed Architecture at 8.033094 seconds with playbackRate=1, paused=false and no loading overlay. The currentTime was not rewritten at that forward boundary. Other unchanged cue stops were exercised in the six-stage capture above. Cloud verification repeated the final flow below.

### Production acceptance

Application source `9301ee7dbe553e21ca89c6434218ce170d48161a` is READY in deployment `dpl_5RcH7jvcCXVAHMd5hWLSsuf7fgR5`, attached to `https://okno-homes-deployment.vercel.app`. Cloud compile and TypeScript passed; all 30 trace guards passed, largest 177.4 MiB. The existing project/repository is retained; no KRNL project changes.

- All six live 1080p chapter stops held at 1× with pinned scrollY=396. Fresh scroll resumed each next chapter; Continue also resumed Handover, and a fresh final scroll released native page scrolling. Observed held times: 7.620866, 10.236372, 11.369369, 16.657924, 21.948763 and 25.622642 seconds. [Native DOM capture](process-optimization-evidence/production-chapter-stops.json).
- Live Architecture continuation began without a forward boundary seek. Both Days 11–25 stages remain distinct. [Paused Architecture proof](process-optimization-evidence/architecture-production.png).
- A separate live reverse-control pass moved from the Architecture hold to the Land hold with Previous (7.616666 seconds); View the timeline and Home then restored the opening at scrollY=0/time=0. The delivered tab is left at the opening.
- Cover/Process/admin shell returned 200; original HQ video returned HTTP 206 with total size 31,172,040 bytes. Public content returned revision 17 with no draft fields. The owner content request returned 503 from the suspended Blob store; cloud publication is explicitly unaccepted.
- Live 390×844 initial reload selected the original 1280×720 master, played at 1× and held Land at 7.604283 seconds. View the timeline released scrolling; Home restored the opening at time zero. Cover images loaded, horizontal overflow was zero; this remains browser breakpoint QA rather than a physical-phone performance benchmark.
- Live detailed phase headings render at weight 700 and the desktop document has zero horizontal overflow. [Timeline proof](process-optimization-evidence/timeline-production.png), [opening](process-optimization-evidence/cover-production.png), [narrow opening](process-optimization-evidence/cover-production-mobile.png).

The browser account audit still stops at Verify Your Identity after a refreshed GitHub sign-in. CLI billing usage remains unavailable for this Hobby account; no exact used/remaining totals or reclaimed bytes are asserted. Local CMS cover publication/restoration passed; live CMS writes await storage recovery.
