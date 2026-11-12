# Forza framing and Signature names â€” 12 November 2026

The owner reported excessive space above the homepage Forza film, no space below it, a clipped lower frame, and Signature model names covering the houses.

The homepage preview now uses a normal heading/film/action stack instead of a 340svh clipped reveal. Desktop media retains the complete 16:9 frame with contain sizing, bounded by laptop height. The heading gap is 24px, the copy/action gap is 32px, and section bottom padding is 48px. The existing compact layout, typography, content, no-controls one-shot autoplay and reduced-motion behavior remain. The separate homepage hero scroll film is untouched.

The Signature stage reserves separate grid rows for the complete contained media and model identity. Laptop identity uses a horizontal name/specifications strip, with room reserved for Configure yours. The phone correction below supersedes the original identity-above-film arrangement. Short viewports retain a scrollable 620px stage rather than clipping its content. Rotation, detail films, model/filter selection and the admin model data are unchanged.

Local verification: 22 existing playback/model tests pass; TypeScript, scoped zero-warning ESLint and diff checks pass. Browser checks on all six models at 1280x720 find approximately 25px between the video element and identity block and no overlap or horizontal page overflow. Octapod also fits 1366x768, 1440x900 and 390x844; phone identity and media have separate bounds. These are browser viewport checks, not physical-device testing.

## Release

Rebased onto the owner’s newer `135f919` release before publishing, preserving its merged opening film, font delivery, mobile viewport and other page fixes. Production source `93d2a518b525b1e857de4c670157ebc29b90ef1b`, deployment `dpl_3mFiiwAQpWVdCirgHtaVuohakSdL`, is READY at https://okno-homes-aryan.vercel.app. Vercel’s clean build and all 30 function traces pass (largest 177.5 MiB). The 22 focused tests, TypeScript, scoped lint and both edited CSS parses pass after integration.

Live Signature checks on every model confirm disjoint media/name bounds and no horizontal page overflow at 1280x720. The live 390x844 Forza view keeps identity above its full frame. Home, Signature, Forza configure and admin return 200; the deployment error/fatal scan has no entries. Screenshot: workspace `outputs/signature-no-overlap-live.png`. The Windows dev server was restarted with a fresh ignored `.local-preview/next-spacing` build cache after stale HMR chunks during integration; it remains on 127.0.0.1:3134. No CMS writes were performed.

Live homepage computed checks confirm contain sizing, no clip path, no native controls, approximately 21px after the rendered heading and 32px before the copy/action row. The larger difference from the nominal 24px heading gap is the existing text-reveal span’s baseline allowance.

## Phone follow-up

The owner requested the film above the identity and feature cards on phones, preserving desktop. At widths up to 700px, the video occupies the first grid row; the identity and all three feature cards share the second row. Hidden cards continue to size that row, keeping the video frame stable through fades. Cards no longer use absolute placement or the bottom-controls viewport translation on phones. The mouse-scroll cue is hidden at this breakpoint, matching existing touch behavior.

Local checks: all 22 existing playback/model tests pass, CSS parses, and diff checks pass. Browser viewports 390x844 and 375x667 show the complete contained film above identity and cards; all three Forza feature states were checked. At 375x667, the settled second and third cards start 20.7px below the video element, and the Octapod identity also clears the film without horizontal overflow. At 1280x720 desktop retains absolute feature cards and the original horizontal identity strip with 24.7px media clearance. These are viewport checks, not physical-device testing.

Production follow-up: source `ac139e65f92b8b2ef5f0611901cfb909cfa95c44`, deployment `dpl_8QHsYJEi8bQZpz5dVhiWNGYznyCF`, is READY on the canonical Aryan domain. Clean build and 30 function traces pass (largest 177.5 MiB). Live 390x844 checks confirm identity and each of the three fully visible Forza cards start 20.7px below the video; its bounds remain unchanged while scroll advances the video from 1.83 to 3.50 to 5.54 seconds. No horizontal overflow. Screenshots: workspace `outputs/signature-phone-identity-live.png` and `outputs/signature-phone-card-live.png`. Desktop rules and CMS content were not changed.

## Endpoint identity and phone anchoring

The owner subsequently requested the name/price card again after rotation and a phone view that does not shift during scrolling. Identity now fades back after the last feature card, reaching full visibility at 93% and remaining at the end. On phones the normal-motion stage is fixed to the dynamic viewport with its minimum height removed; bottom controls no longer apply an additional large-viewport translation. The document remains the scroll input track. Route-scoped phone overscroll containment suppresses bounce; reduced-motion static details retain their scrollable layout.

Local 390x844 checks: video top stays 88.7px and model selector bottom stays 834px at scroll positions 0, 1351 and 2025, including extra downward input at the endpoint. At the endpoint video time is 8 seconds and identity opacity is 1 with Forza, area and price visible. Resizing to 390x740 gives a 740px stage and selector bottom at 730px. Details open/close and the logo returns to `/`. Existing 20 model tests, scoped lint and both CSS parses pass. Separate logo consistency changes make both retained customer studio layouts link home, matching the shared header; all 19 header/configurator checks pass. Physical mobile browser chrome behavior has not been device-tested.
