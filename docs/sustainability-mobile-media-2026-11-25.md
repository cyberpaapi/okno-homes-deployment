# Sustainability portrait media —25 November2026

Owner request OKNO-042 replaces only phone media at widths<=700px. Desktop/tablet>=701px retain the existing CMS media sources, landscape framing and24fps scrub calculation. Configurator, fonts, content and admin stay unchanged. The owner authorized deploying the verified finishing changes to the existing CodeAcc2007 free Render review service. No paid generation.

## Delivery assets

All six assets live under `public/sustainability/mobile/`, versioned20261125. MP4s are silent H.264/yuv420p,1080×1920 at30fps, fast-start with no Bframes. The original scroll derivative uses a6-frame GOP. The active phone scroll film now uses a fresh all-intra derivative (every frame a keyframe); both idle loops use60-frame GOPs.

- `hero-idle-mobile-20261125.mp4`:167frames,5.566667seconds. One cycle of the owner-approved repeated idle cut.
- `scroll-journey-mobile-intra-20261125.mp4`:267frames,8.9seconds. The approved joined zoom/fog film, with its original decoded frame order retained.
- `fog-loop-mobile-20261125.mp4`:208frames,6.933333seconds. The existing fog continuation, frames149→45→148, then adjacent-frame wrap back to149. Begins on the exact scene used by the scroll endpoint. Fog motion gently reverses at the turnaround; no new terrain or camera motion is generated.
- Hero,journey,fog JPEG posters use each delivery film’s first frame.

The approved media masters remain outside this repository in the owner’s Documents media archive. Exact local provenance, encode logs and SHA256 hashes are in the private Work Drive `sustainability-mobile-media-2026-11-25/manifest.json`. No private masters/workflow files are copied into deployable assets.

## Runtime behavior

Responsive picture supplies the portrait poster before hydration. Client media selection avoids requesting desktop movies on phones. Phones crop the native portrait composition with `object-fit:cover` to fill the dynamic viewport below the measured fixed-header height. All videos, canvas and static posters share centered framing, with no letterbox bands. Native30fps scrub time lands inside each chosen frame and the final frame. Fog handoff waits for that decoded endpoint; the fog layer adds a14–18% soft white veil and5.5px blur while scenery stays visible. Hidden/offscreen phone loops pause. Reduced motion uses static hero/fog posters without movies.

## Validation

Validation evidence and immutable candidate snapshot are kept in the private Work Drive review folder, with acceptance recorded in the external finishing harness. Browser responsive sizing is separate from physical-phone acceptance. Owner acceptance remains pending. The final release record binds the reviewed source commit, Render deploy and hosted checks; physical-device acceptance remains separate.

## Owner final refinement —OKNO-043

The owner reported scroll stutter and asked for a foggier Material truth ending. The mobile scroll derivative retains1080×1920/30fps and267frames, encoded from the approved private joined master with libx264CRF18,all-intra,noBframes,faststart. This trades some transfer size for independent frame decoding and preserved detail. The previous derivative remains available at its original versioned URL. The phone journey uses the existing indexed AVC packet renderer with a24-frame decoded cache and a native-video fallback. Original source packets are decoded ahead of the requested playhead; the last complete canvas frame stays visible until its successor or a ready fallback frame is available. Desktop native seeking and Process renderer defaults remain unchanged. Endpoint crossfade is softened over180ms on phones.

The ending video and reduced-motion poster use5.5pxblur; a soft14–18%white mist overlays only the picture, keeping narrative text sharp. Existing moving fog remains the source of motion; no new terrain/video generation.

Appending `?media-debug` enables local diagnostics where available. The indexed canvas also exposes actual presented time/frame count and bounded cache/draw timing attributes. This renders no controls and sends/stores no telemetry. Native seek-target time is distinct from composited-frame callbacks. Formal browser/quality results live in the private Work Drive `sustainability-mobile-smooth-2026-11-25` review folder. Physical-device smoothness and owner visual acceptance remain separate.

Native-seek candidate browser diagnostics measured median166.5ms between sampled presentations after offline decode jobs stopped; that candidate was not accepted as smooth. The scoped correction switches the phone journey to cached frame presentation. Delivery full267-frame SSIM against the approved source is0.984212; compression is not pixel-identical. The all-intra file is35,272,461bytes, trading bandwidth for seeking/decoding behavior. No source frames, resolution or frame rate are removed.

For this all-intra phone film only, backward prefetch submits independently decodable packets nearest-first. Ordinary GOP/Process packet order remains unchanged. This addresses the measured reverse-frame wait rather than adding scroll delay.

## Mobile framing followup —OKNO-044

The owner approved cropping to remove visible top/bottom bands. The phone stage now starts at the measured `[data-site-header]` height and reaches the bottom of `100dvh`. Its resize observer tracks header changes; the64px fallback matches the current public phone shell. Media paint is clipped to that stage so the blurred ending does not extend behind navigation. The header backing uses the existing scene palette. Widths>=701px continue to select the desktop media and framing; no playback code, assets, scroll timing or global header styles change in this followup.

Owner correction OKNO-045 restores the original centered proof opening on phones. The temporary top76px override is removed. “The land leads. The home follows.” remains the middle-screen transition between the fog journey and the news citations, with its original animation and timing. Desktop/tablet presentation is unchanged.

## Fog handoff followup —OKNO-046

The owner reported a pause entering the fog loop. A warm browser trace also showed the exponential scrub easing still approaching its final frame after raw scroll had entered the fog chapter. The phone handoff now prepares fog during the journey, bounds the endpoint easing tail and retains the last valid journey composition until fog playback has a decoded ready frame. Brief reversals near the handoff preserve loop position; deeper reversal resets it. Hidden/offscreen playback and stale asynchronous play completions are guarded. The desktop branch, source movies, image quality, framing and centered proof transition are preserved. Diagnostic counters and timestamps are opt-in via `?media-debug`, with no telemetry.

Local production and hosted responsive evidence, source fingerprint, focused test results and provider identity are recorded outside the deployment checkout in the Work Drive fog-handoff review folder and finishing harness. Those browser checks do not establish uniform frame cadence on every physical phone.

## Complete heading centering —OKNO-047, all viewports

The owner rejected the visibly low proof title and explicitly confirmed the correction applies to both mobile and desktop. Its Motion Y transform had overridden CSS transform centering, so a `top:50%` anchor did not center the whole heading. The opening now uses an independent CSS half-height translation and zero introductory Motion Y offset at every viewport. The complete rendered heading is centered through its opaque hold; only its existing opacity fades before the photograph and citations. The surrounding desktop/tablet layout, typography and citation timing remain unchanged. Verification measures the heading rectangle against viewport center rather than treating the anchor as proof.
