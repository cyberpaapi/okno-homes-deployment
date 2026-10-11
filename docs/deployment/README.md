# Production deployment documentation

- [Implementation plan and subtask checklist](implementation-plan.md)
- [Repository and runtime architecture](architecture.md)
- [Deploy, storage and rollback operations](operations.md)
- [Fixed shared admin-key configuration](admin-keys.md)
- [Release decisions, live verification and remaining limits](release-ledger.md)

The deployment is complete only after private repository, source SHA, READY status and live smokes are verified.

## Verified release

The current accepted Hero V1 window finish is recorded in [its integration ledger](../hero-v1-window-finish-2026-10-11.md): runtime `b64ad37a2f2b44e2e029b2b3469a88b4c1b2722a`, READY deployment `dpl_FJNdVEP8ALYoZvbhNtr6zQcraVkb`. It retains the earlier performance/authentication work and updates the scroll film and final still. Earlier reports below retain historical evidence.

Production website: https://okno-homes-deployment.vercel.app. Editor: https://okno-homes-deployment.vercel.app/admin. All plan subtasks are complete. Read the release ledger for source/deployment identity, exact checks and remaining acceptance boundaries.

Machine-readable reports: [CMS/API](live-api-verification.json), [public routes/models](live-public-verification.json), [media](live-media-verification.json), [final smoke](live-final-smoke.json).
