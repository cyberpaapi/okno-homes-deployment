# Accepted Hero V1 window finish — 11 October 2026

## Process-style Hero V1 smoothing — 12 October 2026

The owner requests the Process page's weighted scroll feel on Hero V1. `ForestEntryOption` now follows the same visual spring as `ProcessJourney`: stiffness 160, damping 30, mass .72 and restDelta .0002. Film time and all opening/ending fades use that one progress value. Lenis lerp is shortened from .12 to .18 to avoid adding a long document tail; reduced motion remains direct, and initial restored positions skip spring travel. The Process page itself is unchanged.

The current delivery remains the existing 1920×1080 / 24 fps / 577-frame `forest-entry-scroll-window-smooth.mp4` (47,573,337 bytes). No media generation, re-encoding, Blob upload or CMS write is part of this correction. The accepted source history below remains historical; its larger master URL redirects to the current derivative.

Existing film/component/reload regressions: 4 files / 18 tests pass. Focused lint, production build/TypeScript and all 30 traces pass (largest 179.8 MiB; private files excluded). The fixed 3134 website and 3140 gateway remain running.

Local browser checks at 1280×720 and 390×844 show gradual settling and reversal, the accepted final frame at 24.0000 seconds, no horizontal overflow or captured browser errors, and a playing intro at scroll zero after endpoint reload. Settled Timeline, Forza and Sustainability positions survive reload exactly. Cold large jumps still need decode catch-up: the desktop sample's largest frame wait was 293.9 ms, phone-layout sample 875.6 ms; these observations do not claim universal device smoothness. The shared spring gives weighted progress, not a guarantee of decoder throughput. No media, content-store, credentials, billing or unrelated-project changes accompany this release.

Production application `c56fe011bdff21b13aae032ff94573dd16fa0510` is READY as `dpl_8YgKJ9CRGWgTdkLyYaxsjX5Nz4qy` on the canonical domain. Cloud build/TypeScript and all 30 traces pass (largest 177.5 MiB). Live desktop and phone layouts ease forward/reverse and reach 24.0000 seconds. Endpoint reload starts the playing intro at scroll zero. Timeline reload preserves position within one pixel; Forza and Sustainability match exactly. Homepage, Hero V1 and admin return 200; the film's final-byte range returns 206 with the unchanged 47,573,337-byte length. No captured browser errors or horizontal overflow. A cold desktop jump directly near the film end recorded a 2023.6 ms frame wait, so perfectly smooth cold jumps remain unverified; cached reversal samples were 2–53 ms. Evidence and workflow notes remain private outside the repository. This documentation follow-up keeps the tested application deployment.

The user accepted the closed-window continuation and requested its integration into the original website. This supersedes the earlier window-opening/exit request and rejected endpoint stills. No further generation or credits were used during integration.

## Accepted source and merge

- Higgsfield Seedance 2.0 standard job `fe408f8f-fc83-481e-9524-04da237d579a`; one approved four-second, 1080p, 36-credit generation, high bitrate, silent. The user accepted the rendered window view; exact camera yaw is not independently measurable from generated images.
- Original source `forest-entry-scroll-seekable-900p.mp4` remains intact, SHA-256 `9e0794be866cd8beda09382a0e77b45c1c13283cc3c74c18057ba6a584d6998e`, 481 frames at 1920×1080 and 24 fps.
- The accepted output contains 97 frames. Omit its repeated initial boundary frame, normalize only its remaining 96 frames to Main H.264, no B frames, GOP 3, CRF 10, and concatenate with the original by stream copy.
- New single film: `/assets/landing-options/forest-entry-scroll-window-finish.mp4`, 577 frames / 24.041667 seconds, 193 keyframes, 80,406,713 bytes, SHA-256 `343226605f6e66b0285a7bca261425cc27d551c63c78ea9c88873c3c87bf3801`.
- Full decoded frame hashes verify that all 481 original frames remain pixel-identical in the merged prefix. Full merged decode completed without an error. Only the generated tail is encoded again; the original is untouched.
- The ending still `/assets/landing-options/forest-entry-window-finish.jpg` comes from the actual accepted final frame. This prevents the ending overlay returning to the old interior view.

## Website integration

Hero V1, homepage variant defaults, admin built-in media defaults, public-asset inventory and the packet index use the new film/still. The scroll renderer keeps one continuous source and its existing bounded decoder cache; the packet index now includes the four-second finish. Original intro, branding, scroll section geometry, following sections and Hero V2 remain unchanged. Local and production published snapshots have no Hero V1 media or Home variant overrides, so these built-in defaults apply without a CMS write. Production Blob suspension is unrelated and not changed.

## Verification and release

Targeted decoder/component tests: 2 files / 6 tests passed. All original decoded prefix frames match exactly. Full suite initially passed 339/345 tests; six tests in five unrelated UI files exceeded the default five-second timeout during concurrent build load. Rerunning those five files with two workers passed all 23 tests. Full-project lint passed. Production build, trace audit, browser checks and live release evidence will be recorded below after completion.

Production build and TypeScript passed. After build tracing completed, all 30 function traces passed, largest 179.8 MiB, with private files excluded. An early audit during trace generation was discarded and rerun against the completed build. Local 3134 website and 3140 gateway run under transient user services so they survive chat interruption; both reuse the existing configured key.

Local browser: indexed WebCodecs renderer stays active across the join, reaches the accepted 24.0000-second final frame, and reverses through 20.4167 to the original 18.8333-second footage. The new ending still loads; there is one scroll-film source. All 15 fixed-port entry routes and 21 stylesheet assets pass. Saved local key authenticated (200), and the saved key was accepted by live upload capability (200). Gateway remains 3140 with the single website on 3134.

## Production acceptance

- Application commit `b64ad37a2f2b44e2e029b2b3469a88b4c1b2722a` was pushed with the existing saved GitHub PAT, without SSH or credential rotation. Production deployment `dpl_FJNdVEP8ALYoZvbhNtr6zQcraVkb` is READY and attached to `https://okno-homes-deployment.vercel.app`.
- Cloud build and TypeScript passed; all 30 function traces passed, largest 177.5 MiB, private files excluded.
- Homepage, `/hero-v1`, `/admin`, new film and new still return 200; the film is 80,406,713 bytes and its last-byte range returns 206. Existing configured key still authenticates to upload capability (200). Public revision remains 17, with no V1 media or Home variant override. No CMS write was required.
- Live homepage uses the new indexed source, reaches frame time 24.0000, reverses into original footage at 18.6667 and returns to 24.0000. The accepted final still loads and the browser reports no errors/warnings. [Screenshot](hero-v1-evidence/window-finish-production.png), [scroll observations](hero-v1-evidence/window-finish-production-scroll.json), [HTTP/auth smoke](hero-v1-evidence/window-finish-production-smoke.json).
- Confidence is high in endpoint integration and original-frame preservation. The generated perspective is user-accepted, rather than a independently measured exact 90-degree yaw. This is not a physical-device performance guarantee: this cold production run loaded its first frame in 3.5 seconds and an early large uncached jump took about 5 seconds while streaming; the later return to the cached endpoint settled in 229 ms.
- Local website and admin remain running as transient user services `okno-final-showcase-website` / `okno-final-showcase-admin`, on the existing fixed addresses. These survive chat interruption; they are not new reboot/autostart configuration.
