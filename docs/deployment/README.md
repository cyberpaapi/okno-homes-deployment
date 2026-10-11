# Production deployment documentation

- [Implementation plan and subtask checklist](implementation-plan.md)
- [Repository and runtime architecture](architecture.md)
- [Deploy, storage and rollback operations](operations.md)
- [Fixed shared admin-key configuration](admin-keys.md)
- [Release decisions, live verification and remaining limits](release-ledger.md)

The deployment is complete only after private repository, source SHA, READY status and live smokes are verified.

## Verified release

The current Hero V1 normal-scroll release is recorded in [its integration ledger](../hero-v1-window-finish-2026-10-11.md): runtime `0509a19a66e2ceb4a829d0828f579815e6d322de`, READY deployment `dpl_CY9aTSRaXE2iV3vRePfhYrfHAdZN`. It shortens the Hero, removes discarded gesture distance, speeds ready-frame presentation and preserves the accepted source, endpoint and reload rules. Cold decode holds remain measured; previous reports below retain historical evidence.

Production website: https://okno-homes-deployment.vercel.app. Editor: https://okno-homes-deployment.vercel.app/admin. All plan subtasks are complete. Read the release ledger for source/deployment identity, exact checks and remaining acceptance boundaries.

Machine-readable reports: [CMS/API](live-api-verification.json), [public routes/models](live-public-verification.json), [media](live-media-verification.json), [final smoke](live-final-smoke.json).
