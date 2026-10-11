# Accepted Hero V1 window finish — 11 October 2026

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
