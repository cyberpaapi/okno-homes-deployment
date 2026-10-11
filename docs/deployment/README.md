# Production deployment documentation

- [Implementation plan and subtask checklist](implementation-plan.md)
- [Repository and runtime architecture](architecture.md)
- [Deploy, storage and rollback operations](operations.md)
- [Admin key generation, handoff, rotation and management options](admin-keys.md)
- [Release decisions, live verification and remaining limits](release-ledger.md)

The deployment is complete only after private repository, source SHA, READY status and live smokes are verified.

## Verified release

The current performance release is recorded in [the 11 October optimization ledger](../optimization-2026-10-11.md): runtime `3fa5be36fd38315934381c30e67fba4790e7aade`, READY deployment `dpl_BzKXYyMjC94pQC3TtcmZd2ao9GwP`. The reports below retain the initial deployment's historical evidence; use the optimization ledger and its linked reports for the current pass.

Production website: https://okno-homes-deployment.vercel.app. Editor: https://okno-homes-deployment.vercel.app/admin. All plan subtasks are complete. Read the release ledger for source/deployment identity, exact checks and remaining acceptance boundaries.

Machine-readable reports: [CMS/API](live-api-verification.json), [public routes/models](live-public-verification.json), [media](live-media-verification.json), [final smoke](live-final-smoke.json).
