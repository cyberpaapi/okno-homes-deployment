# Release decision and evidence ledger

## Phone touch targets — 10 November 2026

Owner approved design changes so that every phone control reaches 44px, then approved the production deploy. Source `816b2cfad2f654bbbad76f2ce4c5c3b3526d9a05` is READY as production `dpl_4FrsxEFB6tBosUZx79mtZ96RosKw` on the canonical alias; `dpl_DuAExDNHBsy4NBPFkFtnmV5TKTPR` (phone usability pass) is the rollback baseline. Changes and reasons: the touch-target section of [typography QA](../typography-qa-2026-11-10.md).

Validation: 40 focused test files / 157 tests, TypeScript, scoped ESLint and a local production build pass. The full suite's two failures are environmental and unrelated: `mediaPreparation.integration` (this container's ffmpeg lacks `libopenh264`) and `AdminStudio.preview` (15 s timeout, also failing on the unchanged release). Local touch-emulated audit: 14 routes at eight viewports (320–932px phones in portrait and landscape, 768px tablet).

Live acceptance with touch emulation: 14 routes at 390×844 show no page overflow, no visible text under 13px and no control under 44×44. Signature and the configurator pass at 360×780, 740×360 and 844×390, except the five configurator background thumbnails at 360px (38×44, as documented). The 740×360 Signature dock shows all six models beside “Explore details”. The 14 audited routes and `/admin` return 200, and the post-deploy runtime error scan is empty. Headless Chrome only; no physical-device claim.

## Phone usability pass — 10 November 2026

Owner asked for the phone layouts to be optimised after the font release and approved the production deploy. Source `498c43be0054558871fa4835cd80559abaa6c7a7` is READY as production `dpl_DuAExDNHBsy4NBPFkFtnmV5TKTPR` on the canonical alias; `dpl_AaKxz1Nxd88j6r2KLp8woujpNggK` (font corrections) is the rollback baseline. Changes and reasons: the phone section of [typography QA](../typography-qa-2026-11-10.md).

Validation: 60 focused test files / 252 tests, TypeScript, local production build and all 30 function traces pass (largest 177.4 MiB).

Live acceptance at 390px on ten routes: no page-level horizontal overflow, no visible text under 13px, no interactive target under 24px (previously 9–14 per page, mainly footer and text links); footer links measure 32px tall and social buttons 44px on touch. Sustainability press headlines fit their columns in Govandi; the 820px Process rail is stacked. `/fonts/*` returns `public, max-age=604800, stale-while-revalidate=86400`. Twelve public routes plus `/admin` return 200, a six-route font crawl still finds zero system-fallback glyphs, and the post-deploy runtime error scan is empty. Headless Chrome only; no physical-device claim.

## Font QA corrections — 10 November 2026

Owner requested a QA pass on font problems and fixes, then approved the production deploy. Source `193d9aac32d7eb0b6d9f302eaefe5285bb69b072` on `release/aryan-vercel-2026-10-31` is READY as production `dpl_AaKxz1Nxd88j6r2KLp8woujpNggK` with the canonical https://okno-homes-aryan.vercel.app alias. The automatic branch Preview build was left to finish (its cancellation was not performed). Previous production `dpl_7cLd4JXPruKfnsyB3onTDjRVkEFv` remains the rollback baseline. Findings, fixes and file provenance: [typography QA](../typography-qa-2026-11-10.md).

Validation: 44 focused test files / 196 tests (including the new `typography-fonts` checks), TypeScript, scoped ESLint, local `next build --webpack` and all 30 function traces pass (largest 177.4 MiB). The wider suite was not run.

Live acceptance: 14 routes × 1440/390px crawled after release — zero glyphs painted by a system fallback, no font request errors or console font messages, only WOFF2 font requests (once per page), display headings Kento Regular on every route with Bold only where 700+ is explicit. On a throttled phone profile (1.6 Mbps, 150 ms) About's fonts finish at 1.80 s before first contentful paint at 1.86 s (previously Arial painted first and fonts landed at 2.8 s), CLS 0 (was 0.0066). Font files, preload links and Home/About/Process/Enquiry/Signature return 200. Runtime error scan after the deploy is empty. Headless Chrome only; no physical-device claim.

## Managed house configurators and customer QA — 9 November 2026

Owner authorized pushing the verified local work to the existing OKNO live project. Application source `7c0b0bbbae847c22c2191c086d7d0480da1fb0c1` is verified on the private `cyberpaapi/okno-homes-deployment` release branch. Production `dpl_7cLd4JXPruKfnsyB3onTDjRVkEFv` is READY and the canonical https://okno-homes-aryan.vercel.app alias resolves to that exact source. The automatic duplicate Preview build was canceled in favor of the explicit Production build. Previous production `dpl_BmFyFeHE6UGEsct335y1QXzoEzKB` remains available as a rollback baseline.

Customers load Forza, Tengo or Kray directly and select approved independent finishes, with PDF download. Admin can link a house to an existing model, upload a GLB, preview/match meshes, and set initial materials. Preparation instructions are delivered at `/configurator/model-preparation.txt`. Precise mesh bounds remove the floating Forza placement, the legacy warm hotspot is removed, and the customer canvas fills the scene without rectangular clipping seams. Mobile material controls and the tablet toolbar fit the tested layouts.

Validation: 99 affected tests across 18 files, source lint and TypeScript pass. A broader Windows suite stalled and was stopped, so no full-suite pass is claimed. Cloud `npm ci`, Next production compilation/typechecking/page generation and all 30 function traces pass (largest 177.4 MiB; private data excluded and required media/model assets retained). The build completed in about five minutes including deployment output processing.

Live acceptance: homepage, Signature, three configure routes, admin, model instructions and all three GLBs return 200. GLB lengths match the manifest. All three houses render in the browser; Forza changes to Golden Oak and exports a one-page PDF containing register item 10. Admin opens without a key and loads the Forza draft preview with all five mapped zones. Published content matches the pre-release snapshot exactly at revision 1; no cloud upload, save or publish was used for these read-only admin checks. Browser warning/error captures and the new deployment's error/fatal runtime scan are empty. Local viewport QA covers 1280×720, 768×1024, 390×844 and 320×640; this does not establish physical-device or Safari acceptance.

Evidence outside Git: this chat's `outputs/OKNO-configurator-live.png`, `outputs/OKNO-customer-QA.md`, and `work/live-release-smoke.json`. Documentation-only follow-up preserves the verified runtime.

## Aryan password-free admin — 31 October 2026

Live verification: production `dpl_5oyupnkoUQnme5kkT4SmakLRHvQu` is READY at source `f62d84f7c1d5e6a634b26a8b8af6835a9f9a36e4`, with the canonical alias `https://okno-homes-aryan.vercel.app`. The browser opens `/admin` automatically and shows “Editor connected.” with zero password inputs. A password-free same-origin PATCH saved the existing tagline without changing its text; PUT published revision 1, and separate admin/public GETs read revision 1 back with no remaining drafts. Homepage and admin return 200. The production build passed all 30 function traces (largest 177.3 MiB); no error/fatal runtime logs appeared in the post-deploy scan. This verifies content saving/publication; it does not claim a new end-to-end media-upload test.

The user explicitly requested removal of the admin password. Public editing is enabled only on the Aryan production project; other deployments retain their existing authentication. The new private Blob store and its server credential are scoped to Production. The implementation passed 84 admin/authentication/storage/upload tests, scoped ESLint and TypeScript before release.

## Extensive review and repair — 16 October 2026

Previous loading repair `49d1eced8439ce1b8f2763d5ef2da596779e5742` completed as READY `dpl_47SQWx9a6v4pHpyf4Rjjj6yeWZxS` on the canonical alias while work was paused. On resumption the live intro completes at 1.75× and a sampled first frame prepares in 2.274 seconds (warm reload 59ms); these observations do not promise all-device/network smoothness.

Review covered 31 reachable public/admin routes, 159 media references and internal section destinations without a failure. Nine external destinations were checked: seven returned 200; Homecrux returned 429 and LinkedIn 999, so their accessibility to automated requests is unconfirmed, not treated as a broken owner URL. Main public layouts were sampled at 320×568, 390×844, 844×390 and 1440×900; all completed sampled images were valid and no horizontal overflow occurred. All four live house configurators loaded and accepted a material choice sequentially. Gallery open/keyboard-next/close, phone Process completion and all 15 local admin panel mappings were inspected. Shell checks are separate from authenticated publication.

Confirmed repairs: the homepage smooth scroller previously moved almost 995px behind its open mobile menu; it now stops, retains inner menu scrolling and delays pending hero handoffs until close. V2 no longer queues its current pose behind an obsolete slow request and reduces startup speculation. The missing phone Signature typography binding is restored. Header and globe targets are easier to select. Enquiry input focus keeps at least 16px text, with stronger placeholder contrast, while delivery remains explicitly deferred. Hospitality capability cards are shorter on phones and the viewer's decorative counter is removed. Configurator downloads have bounded waiting/retry; small-phone and short-landscape controls fit inside the viewport. Temporary private-media storage failures return uncached 503 instead of masquerading as missing files.

Validation: 113 files / 449 tests passed with one worker; full lint, TypeScript, production build and 30 function traces pass (largest 179.7 MiB). Dependency patches update Vitest/mocker, Undici, js-yaml and brace-expansion within supported ranges. Production dependency audit reports zero advisories. Five remaining high development-tool warnings trace to the same unpatched `braces` dependency under the matching Next ESLint plugin; the suggested forced downgrade to Next 14 tooling was not applied. This is a scoped access/input/dependency review, not a claim of an exhaustive independent security assessment.

The first capped build's minimum available RAM was 1,550 MiB; the isolated short-screen confirmation retained at least 3,321 MiB available. Subsequent short-screen confirmation closes agent browser/local services first and uses a 1,536 MiB Node heap with one worker and a 1,400 MiB available-memory stop guard. Full evidence and plan remain outside the release repository at `Documents/ChatGPT/OKNO Homes/extensive-review-2026-10-16`. Original owner data, credentials and 3D/film sources are preserved. The account Blob block remains active and exact quota headroom is not claimed. Final control geometry is verified at 320×568, 360×640, 568×320 and 844×360: all bottom buttons are on screen and document height matches the viewport. Source/deployment and live confirmation follow this application commit.



Final acceptance: source `7463faf7e9c501a11d45ba3277988dceb6491d51`, READY `dpl_GBJSzMRCvUqG8DEi9aNfaJwPyZJH`, canonical alias assigned. Cloud compile/TypeScript and all 30 function traces passed (largest 177.5 MiB). All 31 live route HEADs and 159 live media HEADs return 200; the intro's first/last 64-byte ranges return 206 and exactly match local bytes. Unauthorized admin content remains 401; public content remains 200. Live phone hero reload plays at 1.75×/y=0, menu lock holds y=0 and releases normally, Home retains the static base, the exact 24-second ending presents and lower-page reload preserves y=4486. Live 320×568 Forza material selection works with no clipped bottom buttons, document height 568 and no browser error/warning logs. Journal Press/archive pause holds and Resume advances were checked on the live site. Production error-log query returned no entries in the sampled window. No physical-device or unrestricted-network guarantee is inferred. Local website/admin remain on 3134/3140 with unchanged owner data/key.

## Homepage loading incident — 16 October 2026

Live investigation of runtime `8ef834a`: deployment READY, team not blocked/soft-blocked, static media HTTP 206 and public API 200. The Blob-only usage block remains. No production error logs were returned for the preceding hour. This does not certify transfer headroom or every visitor connection.

The browser reproduced the intro paused at time zero with buffered data (readyState 3), cold hero preparation 8–13.9 seconds and a later frame wait of 6.6 seconds. A full 22,439,964-byte intro transfer took 30 seconds in the sampled connection. Document scroll moved while the picture waited. Lazy images outside the viewport were not broken URLs; completed sampled images had valid dimensions.

Repair: explicitly start muted intro playback and retry on buffered-data events/user input, recover errors to the existing static ending, prioritize the newest frame independently of slow older work, reduce startup speculation and use 256 KiB ranges with the unchanged 16 MiB cap. The original intro remains; a fingerprinted 11,926,832-byte delivery preserves 1080p/24fps/361 frames/15.042 seconds. Full decode passes, full-film SSIM 0.984550 and opening/midpoint visual comparisons are recorded privately. Prepared responsive hero photographs bypass cold Next image conversion. Custom intro selections remain supported.

Local acceptance: 28 focused tests, zero-warning scoped lint, production compile/TypeScript and 30 trace checks pass (largest 179.7 MiB). Actual desktop and 390×844 reloads play at 1.75×/y=0; forward/reverse responds, exact 24-second ending presents before handoff. First decoded poses measured 23–45 ms locally; these are local results, not a live-network guarantee. Available RAM samples stayed above 6 GiB during this repair. Evidence and the tracked incident plan are outside the release checkout under `Documents/ChatGPT/OKNO Homes/loading-incident-2026-10-16`. Production verification follows the Git release.


## Latest Process reverse and page ending — 11 October 2026

Source `fc30dd64658beaae0a5bfc297344c0aa581728ab`, READY `dpl_DfCwmVtogtSwBqxuhxx9m4iuouHj`, canonical alias verified. Reverse film travel limit is 25% higher; forward cadence/damping/original media and fast-scroll guards remain. The long bottom line is replaced by a read-only phase count/segments; a new preparation/conversation close follows the five photographs, with 11 matching editor fields. Actual 21st.dev Stepper 03 source (shadcnspace, 28558) retrieved and adaptation recorded. 57 tests, lint, TS/local/cloud builds and 30 traces pass. Live desktop/mobile-width checks verify inverse restoration, marker state, normal-flow close and both destination links; five HEADs 200 and both original media ranges 206. [Full decisions and evidence](../process-ending-2026-10-11.md). No cloud CMS/key/store/billing write or other project change; Blob recovery and email delivery are not claimed.

## Latest Process fast-scroll correction — 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Accepted smooth film | Continuous eased playhead and exact original masters retained | Oversized forward/reverse gestures bounded to presented frames; no chapter waits/buttons |
| Timeline UI | Complete phase settling, day/title/copy alignment, tighter introduction and readable mobile rail | 1280×720 and 390×844 live checks; zero horizontal overflow |
| Boundary regressions | 60-second simulated reading pauses and exact observed fractional coordinates | Idle is distinguished from stalled decoding; 1px comparison tolerance prevents inverse entry traps |
| Source gates | 32 targeted tests, lint, TypeScript, final local/cloud builds, 30 function traces | Passed; local largest 179.7 MiB, cloud 177.4 MiB |
| Final runtime | `54e2d0b151b1b42ebabb304b7889188d83a522ba`; READY `dpl_A9sH5P44XkMJAG1DE9RR5mF7EFBY`; canonical alias attached | Same private repo/project; original video hashes unchanged |
| Live inverse | 30-second final-phase pause, inward progression from rounded boundary, all detail phases and full film reverse to time/scroll 0 | Passed; [detailed acceptance and failure provenance](../process-scroll-boundaries-2026-10-11.md) |
| Services / scope | Single 3134 accepted build, reused 3140 gateway; no cloud content/key/store/billing writes | Gateway health verified; no production CMS publication claim |

11 October 2026. Entries distinguish verified facts, planned work and unresolved gates.

## Current Models header and quota correction

See [the header/storage review](../header-storage-review-2026-10-11.md) for the implementation plan, October 7 capsule provenance, three local visual iterations, 13 passing focused tests, lint, production build and trace acceptance. The Models-only nav backdrop is removed; shared geometry and rolling interactions are retained with foreground contrast over the split background. Runtime `0b0cdc636f64c221762437cf496973e682a248e4`, READY deployment `dpl_8PFTmtV1QxmW13GjWi9ftrFwvuLQ`, exact canonical alias/source verified. Live header appearance and About/Models navigation passed; public/admin shell HEADs 200, unauthenticated admin API 401. See the [production evidence](../header-storage-evidence/production-verification.json). No media quality change or CMS write is included.

The unused `okno-homes-demo` cloud project and its six deployments were permanently deleted after explicit user confirmation, preserving local/GitHub source and private metadata backups. Post-delete listing retains only current OKNO and KRNLv3; both canonical sites return 200. KRNL settings and deployments are untouched. The confirmed Blob-only block remains; exact Blob counter and Deployment Storage total still await dashboard 2FA. Team Deployment Storage is shared, so project separation alone does not guarantee quota isolation.

| Step | Decision / evidence | Result |
| --- | --- | --- |
| Source audit | Read WORKING-VERSION.md, docs/README.md, docs/admin-system.md and checkout AGENTS.md | Final Showcase confirmed |
| Platform inventory | Vercel connector lists ten unrelated projects and no OKNO project | No existing project mutated |
| GitHub credential | Preserved PAT checked against `/user`, returned 401 | Browser login being checked |
| Storage audit | `.okno-content/content.json`, filesystem uploads and in-memory FFmpeg jobs | Cloud adaptation required |
| Route decision | User requires typed `/admin`, no public button/link | Same-domain route retained |
| Key decision | User requests working generation and management options | Generation/rotation documentation and checks pending |

| GitHub recovery | Refreshed PAT verified as CodeAcc2007-dev, repo scope; new repository API confirms private=true | Access restored; no token in tracked files |
| Vercel recovery | CLI 63.1.2 verified as codeacc2007-8289 in codeacc2007-8289s-projects; connector belongs to a different account | Use verified CLI exclusively |
| Existing projects | okno-homes-demo and krnlv3 listed before mutations | Preserve both; create isolated release project |
| Release seed | Current revision 11 / draft revision 54, 23 published fields; current uploaded image copied byte-for-byte to versioned content-media | Local snapshot unchanged; drafts/history excluded |
| Cloud architecture | Private Blob snapshot with ETag conditional writes; authenticated direct uploads to uploads/; validated hashed media; synchronous request-bound video preparation | Implemented, verification pending |
| Dependency audit | Installed Next.js 16.3.1 had runtime advisories; updated to 16.4.0 and sharp 0.35.5 | npm audit fix failed inside npm; targeted verification continues |

| Project isolation | Created prj_IerXwGshmSnvYnuvQmXuJY5tEb8j in verified team; connected only new private GitHub repo | Existing projects unchanged |
| Production storage | Created private store_1AQc4Grm9lELxTSB in bom1, connected Production only, initialized published revision 11 | Durable seed verified; local snapshot preserved |
| Owner key | npm run admin:key; 256-bit randomness, 0600 file, overwrite refusal and distinct rotation checked; fingerprint 89c68ff262bc | Production secret configured, no secret in Git/logs |
| Source checks | 78 Vitest files / 300 tests passed; TypeScript and zero-warning lint passed; production dependency audit reports zero advisories | Production build pending |
| Initial validation correction | Dependency updates overlapped the first suite; re-ran after installation. Isolated output needed writable tsconfig and ESLint ignore | Corrected; full suite clean |
| Git source audit | 1002 staged files, no actual GitHub/admin secrets and no files above GitHub 100 MiB limit | Credentials, caches and local runtime data excluded |

| Live Blob atomicity | Created a QA-only private object, wrote using its current ETag, then retried the stale ETag | Current write persisted; stale write rejected by BlobPreconditionFailedError |
| Build packaging | Linux media binaries and customer model assets explicitly traced; local content, secrets, env, logs and Git excluded from function tracing | Deployment credential isolation documented |

| Function packaging finding | First trace pulled the entire public media tree into CMS functions (about 1.3 GiB). Added route-specific public-tree exclusions while retaining customer-model assets | Rebuilding to verify functions below Vercel's bundle ceiling |

| Trace matching correction | Next uses contains=true for route patterns, so a bare root slash excluded customer-model assets too. Replaced with a negated customer-model route selector and verified pattern semantics | Final trace validation pending; approved GLB endpoint retained |

| Final production source build | Webpack build passed; 30 final function traces passed, largest 179.7 MiB; no local CMS, secrets or env files; Linux binaries and all four approved GLB variants retained | Source ready to publish; cloud live checks pending |
| Trace regression gate | Added release:check-bundles to Vercel build command | Future application builds fail on private-data inclusion, oversized functions or missing required binaries/models |
| Preserved archive whitespace | Initial git diff check reports incumbent whitespace in retrieved provenance and preserved source | No unrelated whitespace rewrite; scoped lint passes |

| First Git deployment | GitHub main 49cc56a2aab8f6fe61ceff0695134e77867f7f53 pushed; production deployment dpl_Gv6a1LLPrTaUjX6UZzSwNFEknoz3 started from matching SHA | Cloud build in progress |
| Git build-context correction | Vercel applies .vercelignore before the ignored-build command. Excluding .git made the docs-only comparison unavailable. Retain Git build metadata while excluding it from every runtime trace | Configuration follow-up build required; no application/media change |

| Live draft finding | Production GET authentication passed, but draft PATCH returned 409. Blob JSON GET used a compressed weak ETag while head returned its strong validator | No draft/public content changed; request identity encoding and refuse any weak validator before CAS |

| Public cloud smoke | Sixteen main page/API HEADs returned 200; owner key absent from HTML; home has no admin anchor; admin is noindex; public content excludes draft/history data | Passed; live-public-verification.json |
| Approved model recovery | Tengo and Kray negotiated variants returned 200; streamed full model bodies match source byte lengths and SHA-256 hashes | Approved geometry retained; Vercel may negotiate gzip internally and strip HEAD content-length |
| Live media preparation | Scoped owner-authorized private client upload, three prepared outputs, range 206, poster 200 and original byte hash checked | Passed; QA film never staged/published; live-media-verification.json |
| Browser access | Live home visually loaded; /admin Connect accepted the generated owner key; Disconnect cleared it and disabled editing; no error console entries on these two routes | Save/publish live check awaits ETag fix deployment |
| ETag correction validation | Private QA object read with identity encoding yielded a strong validator; current conditional write passed and stale retry failed | New weak-validator regression test added; final source checks running |

| Corrected source checks | 78 files / 301 tests passed after the ETag correction; scoped lint and TypeScript passed | Cloud read now requests identity encoding and rejects weak validators; incidental cloud connection copy corrected |

| Final runtime | dpl_FEwsSa5fnzqPhBtKYMUDC5B1JoDq READY; source e8347acd4c8675d29c95caf4a1d6140a88ae4087; production alias https://okno-homes-deployment.vercel.app | Exact source and bom1 functions verified; cloud build 3m 2s plus 30s post-build |
| Final cloud build | Next compile and TypeScript passed; all 30 trace gates passed, largest 177.4 MiB | No local secrets/state/Git in runtime bundles; required binaries/models retained |
| CMS round trip | All 17 live API checks passed: unauthorized/wrong key, owner access, save, draft isolation, stale 409, publish, public propagation, exact restoration and media workflow | live-api-verification.json; original published fields/collections restored, no drafts |
| Final state | Cloud published revision 13 / draft revision 58, 23 published fields; local remains revision 11 / draft revision 54 | Verification advances cloud revisions/history for audit; no verification text remains published |
| Final public routes | Sixteen page/API HEADs all 200; production site-status remains 2026-10-05; zero drafts | live-final-smoke.json; accepted working version preserved |
| Final browser | Fresh /admin build displayed Editor connected. with owner key; Disconnect cleared access; home and admin browser smokes passed | No exhaustive control/device or large-film acceptance inferred |
| Evidence follow-up | Documentation-only commit records verification; ignored-build command must exit 0 and leave the tested runtime alias in place | Will verify Git integration after push before handoff |

| Ignored-build verification | Documentation source 123886bd7ac32f459d6149c62d30a069a026c018, deployment dpl_3NJ7Pfvi88vZ4a9JiFMgwzJRQTuk, was intentionally canceled after the ignored-build command exited 0 | Live Vercel logs confirm docs-only comparison works; production alias still resolves to READY dpl_FEwsSa5fnzqPhBtKYMUDC5B1JoDq |
| Handoff | Runtime stays at tested application source e8347acd4c8675d29c95caf4a1d6140a88ae4087; later commits contain documentation only | All deployment-plan subtasks complete; key remains in owner-only ignored local file and sensitive Production env |

## First optimization release — 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Scope | About, Journal, Hospitality performance and Enquiry padding first; Projects/Hero V1 excluded, Home/Process intensive videos and Sustainability fades later | Accepted visual identity retained; excluded page implementations untouched |
| Image/render work | 196 prepared WebPs from 36 photos; responsive loader on priority pages; seven Hospitality stage photos lazy; Journal shader bounded to about 520k pixels / 24 fps | Production URLs, immutable headers, lazy loading and shader backing dimensions verified |
| Public control defect | Configurator Back to model carried parameters ignored by Signature | Query-aware static-shell client wrapper and stable variant return links added; live Kray 1 BHK and Tengo 3 BHK regressions pass |
| Source checks | Full 78-file / 301-test suite passed before return fix; focused 15 Signature + 3 customer-copy tests passed after; whole-repository lint and final isolated build/TypeScript pass | 30 local function trace guards pass, largest 179.7 MiB |
| Final runtime | Source `3fa5be36fd38315934381c30e67fba4790e7aade`; `dpl_BzKXYyMjC94pQC3TtcmZd2ao9GwP`, READY; production alias attached, bom1 functions | Cloud compile/TypeScript and all 30 trace guards pass (largest 177.4 MiB) |
| Live admin | Browser image upload, text/image Save draft, draft isolation, Publish, public rendering, existing-tab polling and guarded exact restoration | Original published fields/collections restored; revision 17 / draft 65, zero drafts; Disconnect clears owner key; unauthorized access 401 |
| Public acceptance | Primary navigation, footer routes, all six article/contents/related links, galleries, model/plan/view controls, supported 3D configurators, Bespoke stages and Enquiry tabs/fields/actions | Detailed current records in [optimization ledger](../optimization-2026-10-11.md); mobile/physical-device acceptance unconfirmed |
| Enquiry decision | User explicitly chose to defer delivery during this pass | UI and 10px action clearance checked; no message-delivery claim |
| Evidence follow-up | Documentation-only changes record runtime and coverage | Keep this tested runtime when pushing evidence; verify ignored-build result before final handoff |
| Optimization evidence guard | Documentation commit `f6728b6` produced deployment `okno-homes-deployment-6mxbqvvmg`; live logs confirm the ignored-build command returned 0 and intentionally canceled it | Production alias still resolves to READY `dpl_BzKXYyMjC94pQC3TtcmZd2ao9GwP`; evidence updates preserve tested application source |

## Hero V1 and storage recovery — 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Hero V1 iterations | Six implementation/browser passes; original 1920×1080/24 fps source retained byte-for-byte | Original AVC frame decoding, bounded cache, directional prebuffering and gentler scroll easing; native fallback retained |
| Held opening | Original intro endpoint, actual OKNO Modhomes logo, editable V1-only tagline/still | Intermediate ambient film, fog and fireflies removed; V2/Process unchanged |
| Other scoped fixes | About paper rendering, Bespoke heading, Hospitality stage copy and project-index responsive previews | Existing identity/copy retained; nested editorial scrollers removed and all seven improved previews loaded |
| Local V1 admin | Two draft-isolated browser publish cycles: still/tagline, then V1 duplicate + homepage selector | Already-open public pages updated without reload; original content restored exactly at local revision 15, zero drafts; editor disconnected |
| Production storage incident | Existing store `limits-exceeded-suspended`; account block until 10 November 2026 02:47 UTC | No production V1 QA writes, new store or billing change; user account action required before two production V1 cycles |
| Public content recovery | Published-only 30-minute Data Cache, Publish/reconnect invalidation, verified revision-17 seed fallback; admin fresh reads/CAS unchanged | Public routes remain available during suspension; owner API explicitly returns 503 instead of pretending to save |
| Source gates | 81 files / 314 tests, lint, isolated production build/type checking, 30 traces largest 179.7 MiB | Passed; cloud traces largest 177.4 MiB |
| Runtime | `003ee99ff7fe3a07d522f3eda5295a2fee7f5970`, READY `dpl_3vcbYX4PkNBjoKUvtHuYf4XcFHYD`; canonical alias verified | Same private repository and existing project; other projects untouched |
| Production acceptance | 13 page/API HEADs 200; revision-17 public content exact/private drafts absent; since poll 204, invalid key 401, owner storage 503; five V1 scroll cases | Detailed [V1 ledger](../hero-v1-optimization-2026-10-11.md); production publishing remains explicitly blocked |

## Process chapter playback — 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Motion and quality | Native 1× chapter playback replaces per-scroll seeks; original HQ/mobile SHA-256 unchanged | Six separate holds, including Architecture and Design lock at Days 11–25; fresh gesture resumes |
| Layout and cover | Separate CMS cover, expanding transition, stronger phase/day hierarchy, full-width detail timeline, bounded/paused Silk | Desktop and 390px local/live checks; zero horizontal overflow; other route implementations preserved |
| Source gates | Final build, TypeScript, lint, 46 targeted tests; 30 local traces largest 179.7 MiB | Earlier obsolete CMS field-count failure corrected and relevant 34 tests rerun; see detailed ledger |
| Runtime | `9301ee7dbe553e21ca89c6434218ce170d48161a`; READY `dpl_5RcH7jvcCXVAHMd5hWLSsuf7fgR5`; canonical alias attached | Cloud compile/TypeScript and 30 trace guards passed, largest 177.4 MiB |
| Live playback | Six captured native held frames at 1080p/1×; final release, Continue, narrow initial 720p source and skip/Home verified | [Process evidence and limits](../process-optimization-2026-10-11.md); no physical-device zero-dropped-frame claim |
| CMS / account | Local cover draft privacy/publish/public-update/restoration passed; live public revision 17, owner storage 503 | Blob block remains until 10 November 02:47 UTC; exact usage still awaits browser 2FA; KRNL untouched |

## Process continuous-scroll revision — later 11 October 2026

| Decision / check | Evidence | Outcome |
| --- | --- | --- |
| Latest user direction | Smooth continuous forward/reverse scroll; faster traversal; remove chapter locks and Previous/Continue/View timeline buttons | Replaces the same-day native chapter experiment; accepted cover, layout, typography and lower timeline preserved |
| Rendering / quality | Exact original AVC packets; bounded frame cache; critically damped playhead; native fallback for replacement/unsupported films | Original HQ/mobile byte hashes retained; V1 renderer and other page implementations unchanged |
| Source/local gates | 28 targeted tests across packet, pacing, fallback, V1 regression, Process and registry checks; TypeScript, full lint, build, 30 traces largest 179.7 MiB | All passed; native Home/End, desktop/narrow layout and forward/reverse behavior verified |
| Runtime | `317e8b86fbdfe9dc961a49c286005f4a5ed07667`; READY `dpl_HmeqeFUEFdx5WiUEHwKpZRakHizJ`; canonical alias attached | Cloud compile/TypeScript and 30 trace guards passed, largest 177.4 MiB |
| Live acceptance | Original 1080p/720p frame renderers, actual frame/copy alignment, native exit/restoration, no extra controls, zero horizontal overflow | [Detailed revision and proof](../process-scroll-revision-2026-10-11.md); physical-device/zero-dropped-frame guarantee not asserted |
| Account boundary | Browser still at 2FA; no CMS cloud writes, new store, billing or KRNL changes | Prior exact-usage and Blob-publication blockers remain |


## Connected Process day timeline — 11 October 2026

- Client rejected the arbitrary 01/05-style counters and short segmented indicator. Replaced them with a full-width connected day chronology and presented-progress beam, retaining the existing five photos, day fields, accepted film cadence and page ending.
- Actual [Aceternity Timeline source](https://21st.dev/@manuarora700/components/timeline), Manu Arora, demo 857 / component 325, retrieved and recorded. Live catalogue shows 4.2k bookmarks; download ranking was unavailable and is not asserted. Permanent no-counter/catalogue-popularity guidance saved in AGENTS.md and authorized memory note.
- 21 targeted tests, TypeScript, full zero-warning lint, local/cloud production builds and 30 trace checks passed. Live desktop/mobile: all real day markers visible, zero overflow/errors, reverse fill follows presented phase.
- Runtime `305844f09b8d8392cc2cfacf05e22f8a36c8803e`; READY `dpl_7oGkLsPtWv6UHY4A9yeaYy5jNfVy`, canonical alias verified. [Decision and screenshot ledger](../process-days-timeline-2026-10-11.md). Documentation-only follow-up preserves this runtime. No CMS cloud writes, store, billing or other-project changes.


## Process closing removal and final pacing — 11 October 2026

- Remove rejected white **Before we begin** section and its 11 editor fields. Five-photo timeline and connected Days 01–90 beam lead directly into the existing footer. No replacement section or arbitrary content added.
- Forward and reverse travel caps increase 25% to 4 and 5 film-seconds/sec; same damping, reversal braking, original media packets and presented-frame scroll bounds.
- 57 targeted tests, full zero-warning lint, TypeScript, local/cloud production builds and 30 trace checks passed. Fixed 3140 admin gateway check passed, reusing 3134.
- Application `39a944d9edb408fe7e6156c13e2d4299d96be7dc`; READY `dpl_5o8WAAixFtssmK41ux9HWz9UWqCU`, canonical alias attached. Desktop/mobile native forward and reverse gestures, first-frame settling and dark ending verified; no overflow or captured console errors. [Decisions and evidence](../process-final-pacing-2026-10-11.md).
- No CMS cloud writes, store, billing or other-project changes; production Blob block unchanged. Documentation-only follow-up keeps this tested runtime.


## Admin audit and Process footer crossing — 11 October 2026

- Correct the small-scroll timeline endpoint snap without changing accepted film pacing, day beam, layout or media. Huge-entry guards remain. Small fractional crossings have regression coverage.
- Inspect all 16 editor panels; inventory 1,080 registered scalars and 25 collections; trace the 675 exposed scalar inputs. Correct trusted Journal default-logo validation, original favicon existence and the unused Process loading label.
- Full suite 87 files / 341 tests, focused final Process checks 2 files / 4 tests, lint, TypeScript and local/cloud builds passed. Cloud 30 trace guards passed, largest 177.5 MiB. Two real fixed-port local upload/publish/poll cycles passed and original fields/collections were restored exactly, with zero drafts; test media retained.
- Runtime `e11c6288bd32f3e9def5bcfc451f39a7ba2626b0`; READY `dpl_6MW8vo2vcUG4jjQfYYeNoaM8Fj5c`; canonical alias verified. Fresh desktop and 390×844 live forward/reverse footer crossings stayed native; zero horizontal overflow and no captured Process console errors.
- Live public/admin shell/favicon/published API return 200; unauthenticated editor API 401. Authenticated CMS content remains storage-unavailable **503**. Live upload capability is not upload acceptance. Production publishing remains blocked; no cloud QA writes, media upload, new store, billing or unrelated-project mutation. [Complete audit and evidence](../admin-audit-2026-10-11.md). Documentation-only follow-up preserves the tested runtime.


## Requested admin testing-key handoff — 11 October 2026

- Generate a new 256-bit key for the owner’s explicit testing handoff, fingerprint `0afd324cd321`; ignored private file permissions 0600. Keep the single-owner model, full CMS rights and manual rotation; no automatic expiry, individual roles or cloud demo key is claimed.
- Replace only OKNO Production `OKNO_CMS_ADMIN_TOKEN` as a Secret. Redeploy tested application source `e11c6288bd32f3e9def5bcfc451f39a7ba2626b0`; READY `dpl_8rQAxu1fj2Z61wQyXbDN3EaSvuuL`, canonical alias attached. No source, public content, media, storage, billing or unrelated project change.
- New key passes upload capability authentication (200); authenticated content reaches the known storage error (503). Previous main-domain key and unauthenticated content return 401. Homepage/admin shell 200. Historical deployments retain their old credentials and need separate restriction/removal for global revocation.
- [Short generation/management steps](../admin/testing-key-quickstart.md) and [sanitized acceptance proof](../admin/testing-key-activation.json). Current private key file updated; previous credential preserved privately. Local runtime left running with its loaded local credential. Documentation-only follow-up preserves this tested deployment.


## Fixed shared non-expiring admin key — supersedes testing rotation, 11 October 2026

- Owner explicitly chooses a memorable credential, corrects its exact case/spelling, accepts the security tradeoff and rejects routine regeneration. Preserve one configured, non-expiring owner key for live Production and local admin. Keep its value server-only/ignored; fingerprint `252935053fbb`. Staff guide contains no generation/renewal/rotation step. AGENTS.md preserves this instruction for future work.
- Lower configured owner-key minimum from 24 to 8 characters. Exact constant-time matching, missing/wrong-key rejection, validation, draft privacy and Publish remain. No automatic expiry or client fallback is added. This change does not materially reduce compute.
- 4 targeted auth/store/cloud files / 38 tests passed, including eight-character owner API access through a future date, incorrect case/old/missing keys, fail-closed incomplete configuration and long-key compatibility. Zero-warning lint, production-build TypeScript/build and 30 local traces passed, largest 179.8 MiB. Fixed 3140 gateway reuses the one checked 3134 server; 15 public entry routes and 21 stylesheet assets passed. Local owner key 200; old/wrong-case/missing credentials 401.
- Application `f10f273ac158d69e2242fda9cb771e5bc01d65f6`; READY `dpl_Dg764YQjh6aQjJUMWUhxBov3x2Tq`, canonical production alias attached. Cloud build/TypeScript and 30 traces passed, largest 177.5 MiB. Production fixed key authenticated for upload capability (200); content reached existing storage error (503). Old key/wrong case/unauthenticated content 401; homepage/admin shell 200. Capability acceptance is not working media upload or publication.
- Operational private key file and local `.env.local` use the same fixed value. Previous private credentials retained for historical deployment operations; old deployment URLs retain their environments. No content/media, store, billing, preview or unrelated-project changes. [Staff guide](../admin/testing-key-quickstart.md), [sanitized proof](../admin/fixed-key-acceptance.json). Documentation-only follow-up preserves tested runtime.

## Accepted Hero V1 window ending — 11 October 2026

- User accepts closed-window continuation and requests original website integration. New single 577-frame film remains 1920×1080 / 24 fps; all 481 original decoded prefix frames match exactly. Actual accepted final frame supplies ending still. V1/public/editor defaults and packet index agree.
- Application `b64ad37a2f2b44e2e029b2b3469a88b4c1b2722a`; READY `dpl_FJNdVEP8ALYoZvbhNtr6zQcraVkb`, canonical production alias attached. Local/cloud TypeScript and builds, zero-warning lint and 30 traces pass. Six broad-suite timing failures under concurrent build load pass on bounded two-worker rerun. Existing saved PAT used over HTTPS; configured owner key remains accepted (200), no credential rotation or CMS publication.
- Live homepage reaches accepted 24.0000-second endpoint, reverses to 18.6667 and returns to endpoint; new still loads, no browser errors/warnings. New film/still and homepage/preview/admin return 200; final-byte media range returns 206. Local fixed-port website/admin remain active under transient user services. [Detailed evidence and cold-load limitations](../hero-v1-window-finish-2026-10-11.md). Documentation follow-up keeps this tested runtime.


## Mobile performance and complete source package — 16 October 2026

Owner authorizes responsive/performance corrections and upload of the current public website, admin and supplied configurator to the existing private repository. Application source `8ef834abdcad356b8f664d4e20b8bfd0b32a0594` is verified on remote `main`; production `dpl_AGWoF3QPbNmsVghwCpgDnWdAoPbB` is **READY**, with the canonical `okno-homes-deployment.vercel.app` alias assigned. GitHub blob hashes for the project specification, admin, supplied configurator and reviewed geometry manifest match local source exactly.

Home Signature is a compact native-film composition on phones (635px in the checked 390px layout, previously 2,448px). The Home timeline becomes more compact, the globe is centred, Projects headings wrap by whole word, Bespoke has prepared responsive photographs and a centred portrait portal, About phone headings are smaller, and Journal Press/archive motion supports touch with pause/resume. Hospitality selected work is an editorial photographic sequence. Phone Process uses a short native 960×540/30fps film with the accepted completed-house blend. Signature omits the hidden 1080p refinement decoder on phones, shortens its rotation track and labels Explore details. Existing Enquiry changes and the current admin/configurator work are preserved in the package. The complete product/operation reference is `PROJECT-SPECIFICATION.md` at the repository root.

Phone Hero V1 delivery is 26,704,366 bytes (previous desktop representation 46,739,190); V2 is 13,908,198 bytes (desktop lossless representation 384,273,474). Approved desktop media remains unchanged. Phone image caches are bounded at ten decoded poses. Fingerprinted byte-range delivery and exact endpoints remain; this is sampled scroll rendering, not a forced chronological queue or a guarantee of physical-device frame rate.

Validation: complete 111-file/437-test pass, followed by 27 focused tests after the final Signature/registry corrections; zero-warning lint, final production TypeScript/build, clean whitespace/package checks and 30 function traces pass. The largest local/cloud functions are 179.7/177.5 MiB. Local responsive checks cover 320/390/768/1440px; public routes/assets pass 51/219 HTTP checks. Nine external links return 200. Live production passes all 51 routes, four first/last mobile frame-range byte comparisons and range-byte comparisons for all four reviewed model assets. Ten live phone/desktop layout samples have no overflow, completed broken images or application-error screens. Live phone V1/V2 decoding, native rotation, single Signature decoder, Journal resume movement and an actual Forza material change are verified without browser console errors. The first cold configurator preparation required waiting for delivery before controls enabled; no instantaneous-load claim is made.

Local fixed-port production website/admin checks pass with one website process and its gateway. Authenticated local content read is 200; unauthorized local/live reads are 401. Authenticated live content still returns **503**, and the account inspection confirms the existing Blob feature block. No production content writes, billing/store changes or credential rotation occur. Enquiry delivery remains unconnected. Physical-phone/Safari behaviour and universal smoothness remain separate acceptance; Chromium viewports do not establish those outcomes. Existing dependency installation advisories were inspected separately; this responsive release does not claim a security audit or dependency-advisory remediation.

New private plan, test/build logs, live/API reports and captures are retained outside Git under the owner's OKNO working documents. A monitored capped build retained at least 3,640 MiB MemAvailable; checks used bounded heaps and one test/build worker. Temporary browser workers are closed, and the canonical 3134/3140 services remain available.


## Fresh-visit loading recovery — 18 October 2026

Owner approved release of the tested reliability fixes and authorized the saved PAT for the private repository push. Application source `e01c6a5cdd1a62772e830e4b50c650a1b59005f3` is on remote `main`; deployment `dpl_9tCdrYWojKfDW9MxYHak4kGAmrNX` is **READY**, and the canonical `okno-homes-deployment.vercel.app` alias resolves to that exact source in `bom1`.

Both Hero image loaders now bound stalled requests, retry once outside the partial browser cache, validate ranges and cancel unexpected full-file responses. Public content polling recovers after a stalled refresh and cancels when its subscribers leave. Seven Projects gallery covers have 42 prebuilt responsive quality-90 derivatives with recipe-versioned immutable URLs; existing native crops/layouts and original media remain. Local production startup validates the selected build folder and checks all four customer configurators. Fixed 3134/3140 previews are supervised transient user services.

Acceptance: 115 files / 455 tests, zero-warning lint, isolated production TypeScript/build, 30 local traces (179.7 MiB largest), and cloud TypeScript/build plus 30 cloud traces (177.5 MiB largest) pass. Post-release HTTP checks cover 34 routes/APIs, 125 referenced assets and 12 source-matching film ranges. All 42 new images match local hashes and have immutable cache headers. Live Projects gallery/Next/Pause, mobile V1's 24.0000s endpoint/static Home and V2's 32.9167s endpoint pass without observed console errors, film failures or horizontal overflow. The available new-deployment runtime error query returned no entries. A 60-request local sample had no failures/restarts; it does not establish multi-day stability.

Authenticated local content remains revision 38 with zero drafts. Valid-key production content still returns the existing Blob-storage **503**; no content write, upload, credential, billing, replacement-store or unrelated-project change occurred. Enquiry delivery remains deferred, and no physical-phone/Safari, Web Vitals or three-day soak claim is made. [Detailed review and boundaries](../reliability-review-2026-10-18.md). External evidence stays outside the canonical source.
