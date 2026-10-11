# Browser evidence for the 7 October public mouse audit

The route-by-route interpretation and current status are in [the audit ledger](../public-mouse-interaction-audit-2026-10-07.md). These files preserve the raw browser observations and selected visual captures.

- `desktop-hover-sweep.jsonl`: 20 non-Projects routes, visible-control hover, style changes, pointer blocking, overflow, shared cursor and page errors. The five Journal `unreached` items are horizontally moving marquee cards; the two Bespoke `blocked` items were retested after entrance and passed.
- `click-matrix.jsonl`: representative click sequence. Its Hero V2 skip `FAIL` is a deliberate keyboard-only control, and its Tengo Review `FAIL` is the headless 3D normal-motion timeout described in C-01. Gallery close counts recorded immediately after click can include the exit animation; later waits confirmed removal.
- `mobile-menu.jsonl`: 13 narrow-route checks. The first two `open:false` results on `/` and `/hero-v1` clicked before hydration; focused retests after hydration passed with nine links each.
- `configurator-review-reduced-motion.jsonl`: Review opened on Tengo and Kray with reduced motion; Tengo generated a selection URL. Further mouse clicks timed out while the headless 3D renderer saturated CPU, as described in C-01.
- `hospitality-lens-selected.png`, `hospitality-lens-closing-final.png`: repaired heading lens activation. `hospitality-lens-closing-before-hit-area.png` shows the blank-space circle caught by visual review before the final text-fragment hit test.
- `models-nav-before.png`, `models-nav-after.png`: selector header contrast repair.
- `enquiry-hover-final.png`: full-width dark hover reveal with legible label.
- `mobile-menu.png`: sampled narrow menu appearance during entrance.

These captures were made against the local development server at 1440 × 900, except the mobile menu at 390 × 844. They are test evidence, not production signoff.
