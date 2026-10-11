# Release decision and evidence ledger

11 October 2026. Entries distinguish verified facts, planned work and unresolved gates.

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
