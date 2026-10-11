# Process continuous dates and smooth finish — 12 October 2026

This supersedes the grouped-date and hard-cut decisions in the previous Handover correction. The owner explicitly requests every day between 01 and 90 to appear and rejects the abrupt finish.

## Implemented decisions

| Film chapter | Displayed days |
| --- | --- |
| Land | 01–10 |
| Architecture | 11–18 |
| Design lock | 19–25 |
| Assembly | 26–60 |
| Enclosure | 61–72 |
| Handover | 73–90 |

One shared map supplies public and admin defaults, with existing CMS IDs and validated custom date editing preserved. The sequence has no gaps or overlaps. The separate accepted five-photo delivery chronology and sourced connected progress rail remain unchanged. No arbitrary counters or new UI components are added.

The original film packets now remain intact through frame 620; the earlier jump to packet 768 is removed. From presented film time 18.3 to 20.1 seconds, a quintic smootherstep gradually blends in the fully resolved source final frame at 25.6 seconds. Its opacity has zero velocity and acceleration at both endpoints. Handover holds that completed house through the end of the scroll track. Reverse uses the same blend in reverse, rather than a camera jump. Desktop 1920×1080 and mobile 1280×720 stills are lossless WebP extracts; the MP4 files are unchanged. Only the original paired films use these stills; replacement films keep their own endpoint. The discarded outro remains outside the decoder window.

Retain the accepted 4 film seconds/second forward, 5 reverse and damped braking. Authentication, content, billing and unrelated routes/projects remain unchanged.

## Verification

- Six focused test files / 35 tests passed: complete day coverage, public/admin matching defaults, monotonic soft-endpoint blend, original packet window, native end/reverse, custom films, playhead and fast-scroll boundaries.
- Full TypeScript check passed. Focused lint is checked after removing an unsupported picture ARIA attribute.
- Production build and live desktop/mobile observations will be recorded after deployment. This does not claim production CMS writes; the existing Blob 503 remains separate.
