# Runtime smoothing pass — 23 September 2026

## Signature models

- The active 1080p orbit is the only mounted video. Model changes unmount the previous decoder before the next model is shown.
- The active video uses `preload="auto"` because the experience depends on random-access scroll seeking.
- Every orbit now has a dedicated 1920×1080, 24 fps H.264 Baseline delivery file with a six-frame GOP, no B-frames and fast-start metadata. This removes the large High-profile random-seek penalty while retaining the original source files unchanged.
- Scroll motion uses a separate sharpened 1152×648 H.264 Baseline layer. After 140 ms without scroll input, the 1920×1080 layer resolves the identical frame and fades in, keeping movement fluid without leaving the resting architecture soft.
- Media targets begin with native scroll progress and pass through a dedicated critically damped spring (`stiffness: 300`, `damping: 32`, `mass: 0.85`). It carries the house briefly after wheel input ends, settles without overshoot and only resets the 1080p refinement timer when the visible source frame actually changes. Requests remain coalesced while the decoder is busy and the final requested frame is applied after an in-progress seek completes.
- Trib receives a restrained luma-only sharpening pass and a higher 8 Mbps quality budget. The other optimized orbits use 5.5–7 Mbps according to scene detail.
- Offscreen and hidden scrub work remains suspended through the existing intersection and document-visibility guards.
- Signature now uses the same 21st.dev Models header and fluid magnetic cursor as the selector. The Signature cursor uses its own muted gold treatment. The full-screen particle canvas is not mounted on this route.
- The compact menu sizes itself from the live viewport. Focus uses `preventScroll`, which keeps the Close control and navigation list aligned while the morphing panel opens on tablet and phone screens.

## Projects

- The supplied green Silk composition renders one WebGL frame. Its subtle movement is a compositor transform, rather than a permanent fragment-shader loop.
- The atlas globe is event-driven. It redraws for drag, momentum, keyboard movement, focus changes, resize and project focus; it does not auto-rotate while idle.
- The Silk canvas remains capped at 240,000 pixels. The globe remains capped at 520,000 pixels and 30 fps while interacting.
- Lenis wheel interpolation uses `0.2` so it settles faster and does not feel detached from wheel input.

## Homepage

- The cinematic video no longer measures page and media geometry during every scroll frame. Geometry is cached and refreshed on resize or metadata readiness.
- Scrub seeking is throttled to 20 updates per second. The first wheel event no longer starts and immediately pauses video playback.
- The page now uses the fluid magnetic cursor, so it no longer mounts the full-viewport particle canvas.

## Brand system

The supplied `Assests/Logo files/SVG/Asset 19.svg` remains copied unchanged at `public/assets/projects/brand/okno-modhomes-white.svg`. Shared and route-specific navigation/footer marks now render that file through `OknoLogo`; textual approximations were removed from brand positions.

## Verification

Automated browser inspection at 1440×1000 confirmed one active motion stream plus one paused detail-refinement stream for the selected model, an idle Projects globe with unchanged longitude, the 239,904-pixel Silk canvas, the official logo on the primary routes and no horizontal overflow. Before the final Signature encoding pass, random-seek latency averaged 58 ms for Forza, 254 ms for Kray, 252 ms for Gaze, 91 ms for Tengo, 94 ms for Trib and 73 ms for Octapod. The optimized 1080p files measured 58, 66, 63, 58, 59 and 61 ms respectively in the same headless Chrome profile. Kray's 6 Mbps optimized source measured 0.993 SSIM and 49.9 dB average PSNR against its original.

The subsequent cadence refinement compared 1920×1080, 1600×900, 1280×720, 1152×648, 1024×576 and 960×540 motion sources. The selected 1152×648 layer stayed below the source frame budget while retaining more spatial detail than the smaller candidates. With decoder-completion scheduling, the same 1.6-second full-range test presented 43–45 updates per model at 35–36 ms average spacing. Every model then exposed its 1920×1080 refinement at the exact same media time, with a measured motion/detail delta of 0 seconds.

Responsive browser captures at 390×844, 768×1024 and 1440×1000 confirmed that the compact navigation remains inside the viewport, keeps its Close control visible and does not displace the model stage. In the Projects comparison, idle main-thread task time over 1.8 seconds fell from 1.83 seconds to 0.23 seconds after replacing the continuous shader and globe loops. Homepage synthetic-scroll task time was 0.04 seconds. These are local comparative measurements; physical-device, Safari and Firefox checks remain release validation.
