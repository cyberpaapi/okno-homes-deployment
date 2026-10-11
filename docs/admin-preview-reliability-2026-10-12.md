# Admin preview reliability — 12 October 2026

## Request and plan

The external tester reports the embedded preview turns black after roughly 4–5 seconds, across panels. The owner requests fresh-session checks, preview optimization and deferring Configurator in admin until explicitly restored.

1. Inspect live previews from a newly opened disconnected editor; separate rendering from authentication/storage.
2. Trace iframe loading, draft delivery, frame replacement and video memory ownership.
3. Correct verified lifecycle weaknesses and reduce embedded video memory without changing visitor rendering.
4. Test source regressions, then every available live editor preview with delayed interaction, mobile layout, media readiness and repeated panel switching.
5. Deploy only this existing OKNO project; save sanitized observations and note any unverified external-device behavior.

## Findings and changes

- The controlled browser exposes only the in-app browser, with no incognito/context-creation capability. A new editor tab has no saved key or connection; admin authentication is tab memory. This is a fresh disconnected application session, not proof of an actual incognito profile or the tester's browser/device. The reported black screen did not reproduce in the initial Home/About checks. Browser/device details were requested.
- Draft messages were sent on iframe load without a child readiness acknowledgement. On slow hydration the message receiver could miss the initial draft. A child-ready handshake now resends the latest draft. Both sides retain exact expected-origin/source checks; credentials are never sent to the iframe.
- Connecting or publishing changed the iframe key through the publication revision, unnecessarily discarding an already-loaded preview. The iframe now changes only for page selection, editor view selection or explicit Reload preview. Eager loading and explicit autoplay/fullscreen permission avoid deferred iframe loading and inconsistent inherited media policies. A 12-second readiness timeout offers the existing sourced action style for recovery; healthy previews remain untouched.
- Home V1 and Process scroll previews previously allocated the same large decoded-frame cache as the standalone website. Embedded previews use the existing native video scrubber and original media/poster instead. This avoids a second full-size WebCodecs cache inside the editor. Scroll timing, Process finish, native fallback and standalone visitor renderers remain intact. No image or video is recompressed.
- Configurators is removed from the visible Models editor navigation. The registry and stored legacy IDs remain intact to avoid deleting data or breaking existing public reads. Reintroducing its editor requires the owner's explicit instruction. Other Models editors remain available.
- This adapts existing preview/field/action components, not a newly selected UI library. The sourced 21st.dev styles/provenance remain unchanged. No new counters, fonts or decorative section are introduced.

## Storage boundary

Fresh read-only production probes: `/api/admin/content` with the configured owner key returns 503 in 0.09 seconds; `/api/site-content` returns 200 / publication revision 17. The existing Blob usage suspension still prevents authenticated content access, uploads, saving and publishing. That is separate from iframe rendering. No cloud content write, credential change, new store, billing or other-project change is part of this correction.

## Checks

New focused tests cover navigation deferral, delayed readiness/latest drafts, origin/source rejection, stable iframe on connection, timeout/retry, native embedded film selection without indexed decoder allocation and post-five-second scroll reversal. Existing admin structure/Journal/Process/default-registry tests passed before release. Full suite: 94 files / 369 tests passed. Standalone TypeScript and focused zero-warning lint passed. After the readiness-state refinement, the three focused lifecycle regressions passed again. Final cloud build and live panel ledger follow after deployment.

## Production acceptance

Application `b3845dc0dbe341279e1190d570fbfb46ff9353fe` is READY as `dpl_4rpyAQaBuSRuGgjb2ypphSBa8L4H`, attached to the canonical website and `/admin`. Cloud build/TypeScript and 30 function traces passed; largest 177.5 MiB, private files excluded. The first canonical browser refresh preceded alias assignment and still showed the old menu; the acceptance checks below use the verified new alias with Configurator absent and media permission present.

All 15 remaining desktop panels were opened in both editor/expanded-preview views, held for 6.5 seconds after opening, then scrolled: Published homepage, V1, V2, Projects, Models overview, Signature, Bespoke, Hospitality, Process, Sustainability, Journal, About, Enquiry, Footer and Shared settings. Every panel retained content and responded to scroll; none showed the recovery action or an application-error page. The screenshot contact sheet contains no black preview. This verifies the loaded default content and delayed interaction, not every possible replacement asset or the external tester's browser. An initially pending Projects image was loading, not a completed broken image; its photograph rendered in the saved screenshot. Offscreen/preload-none videos are not counted as failed merely because they have no decoded frame yet.

- Embedded V1 decoded at 1920 pixels and sought to 11.8333 seconds. Embedded Process decoded at 1280 pixels, advanced to 5.5 seconds and reversed to 3.7333; its rendered construction frame was visible. Native seek snapshots may temporarily report readyState 1 while seeking, which is not a persistent blackout.
- Unsaved About title and image path reached the iframe without reload. The selected image finished decoding at 316 pixels in the narrow side preview. Both original fields were restored. A separate public About tab retained its original heading; no Save or Publish was attempted.
- A second fresh disconnected editor at 390×844 rendered decoded About images and scrolled from y=0 to y=844, with no admin horizontal overflow. This is an emulated viewport, not a physical-device test.
- Desktop console error/warning logs were empty. The standalone public Process route still uses the frame renderer, confirming the compatibility change is limited to embedded films.
- Post-release read-only checks retain public content revision 17 / 200 and authenticated content 503. Upload, save and publication acceptance remain blocked by the existing Blob suspension. No content-store write, key change, plan/storage purchase or unrelated-project change occurred. The fixed local runtime was preserved; it was not rebuilt or visually accepted for this cloud correction.

[Panel contact sheet](admin-preview-evidence/desktop-panel-contact-sheet.jpg) · [Native Process frame](admin-preview-evidence/native-process-live.jpg) · [Mobile About](admin-preview-evidence/mobile-about.jpg) · [Complete panel and draft-isolation ledger](admin-preview-evidence/live-panels-2026-10-12.json) · [Current storage boundary](admin-preview-evidence/storage-boundary.json).
