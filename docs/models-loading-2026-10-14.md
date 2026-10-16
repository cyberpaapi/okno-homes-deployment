# Models entrance loader — 14 October 2026

Scope: the initial loading screen on `/models` in the canonical Final Showcase checkout, local preview `http://127.0.0.1:3134/models`.

The existing [Preloader by gaxocif204](https://21st.dev/@gaxocif204/components/preloader), demo 13967, remains the source adaptation; its retrieved source is preserved in `21st-source/13967.tsx.txt`. No new component or imagery was introduced.

The entrance retains the OKNO logo, blue gradient and upward reveal. The exit now animates a complete transform rather than individual `y` and full-screen border-radius properties. The installed Motion implementation supports native acceleration for complete transforms; removing the changing border radius avoids repainting the gradient clip. Scoped `will-change` prepares only the temporary loader and logo layers, which are removed with the overlay.

The configured upward reveal lasts 650 ms instead of 900 ms. The logo fades over 450 ms with a gentler 1.6× zoom instead of 4.5×. Image readiness, the 420 ms minimum, the 2.8 s fallback, session skipping and reduced-motion handling are unchanged.

Validation: all five existing Models selector tests, scoped zero-warning ESLint and TypeScript pass. Local browser checks at 1280 px and 390 px confirm the loading screen appears and leaves, both ownership destinations remain available, and there is no horizontal overflow. The phone-sized check reports no console errors. This is a code-path and browser-state verification, not a measured physical-device frame-rate improvement. No production deployment was made.
