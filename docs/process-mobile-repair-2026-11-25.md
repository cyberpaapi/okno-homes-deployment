# Process mobile correction - 25 November 2026

The owner reported that the bottom Build sequence progress bar was removed and mobile scrolling felt stuck/slow. Only the day label beside Build sequence was intended to disappear. This correction restores the progress line and keeps that adjacent day label hidden; the accepted lower detail content, desktop/tablet layout and existing media remain protected.

The source baseline is ad73d72531df50e474fbe427d82b7c06d9723479. At 390 x 844, hosted browser inspection found the complete first rail track hidden by the phone CSS. Eight ordinary consecutive scroll gestures advanced the film track 1478.67 px, with the final six advancing only around 129-141 px each. The gesture guard constrained page position to decoded progress, while the film playhead also imposed a speed cap and easing. These measurements are one functional browser trace, not a physical-device or statistical performance result.

The current work is scoped to the phone progress line and input/playhead coordination. Media encoding, source dimensions/frame order, the accepted final-house composition, Sustainability, configurator, admin, company fonts and global header styles are outside this correction. Further implementation, production-build, responsive browser and Render release evidence is kept outside this repository in the Work Drive process-mobile-repair-2026-11-25 review folder and the finishing harness. Owner acceptance remains separate.

## Implemented correction

Phones at widths up to700px now retain native document input in both Process sequences. The guard continues to publish presented-progress diagnostics, but does not intercept ordinary wheel, touch, keyboard, pointer or momentum scroll on phones. Desktop/tablet guard behavior is retained. The phone film playhead follows the newest position with a short cubic ease-out; a fixed target settles within180ms of animation time, without a movie-speed backlog. Reversal retargets immediately. Switching the phone breakpoint replaces the response in place without another media download or decoder rebuild.

The first phone rail again displays its existing base line and film-driven active fill beneath the one-line Build sequence heading, within the same46px shell. The adjacent day/phase summary remains hidden; lower detail presentation and desktop/tablet CSS are unchanged. Media/cache/decoder files, source frames and the closed-house ending remain unchanged.

The playback worker passed23 focused behavior tests and scoped ESLint. Integrated checks, production browser evidence and the exact hosted release are recorded in the external review folder; they do not establish uniform frame pacing on physical devices.
