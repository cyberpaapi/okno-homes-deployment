# Forza framing and Signature names — 12 November 2026

The owner reported excessive space above the homepage Forza film, no space below it, a clipped lower frame, and Signature model names covering the houses.

The homepage preview now uses a normal heading/film/action stack instead of a 340svh clipped reveal. Desktop media retains the complete 16:9 frame with contain sizing, bounded by laptop height. The heading gap is 24px, the copy/action gap is 32px, and section bottom padding is 48px. The existing compact layout, typography, content, no-controls one-shot autoplay and reduced-motion behavior remain. The separate homepage hero scroll film is untouched.

The Signature stage reserves separate grid rows for the complete contained media and model identity. Laptop identity uses a horizontal name/specifications strip, with room reserved for Configure yours. Phone identity sits above the film. Short viewports retain a scrollable 620px stage rather than clipping its content. Rotation, detail films, model/filter selection and the admin model data are unchanged.

Local verification: 22 existing playback/model tests pass; TypeScript, scoped zero-warning ESLint and diff checks pass. Browser checks on all six models at 1280x720 find approximately 25px between the video element and identity block and no overlap or horizontal page overflow. Octapod also fits 1366x768, 1440x900 and 390x844; phone identity and media have separate bounds. These are browser viewport checks, not physical-device testing.
