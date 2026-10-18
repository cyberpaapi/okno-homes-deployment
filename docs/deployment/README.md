# Production deployment documentation

- [Implementation plan and subtask checklist](implementation-plan.md)
- [Repository and runtime architecture](architecture.md)
- [Deploy, storage and rollback operations](operations.md)
- [Fixed shared admin-key configuration](admin-keys.md)
- [Release decisions, live verification and remaining limits](release-ledger.md)

The deployment is complete only after private repository, source SHA, READY status and live smokes are verified.

## Verified release

Current package: source `e01c6a5cdd1a62772e830e4b50c650a1b59005f3`, READY `dpl_9tCdrYWojKfDW9MxYHak4kGAmrNX`, canonical alias assigned on 18 October 2026. [The release ledger](release-ledger.md) records responsive/performance corrections, the included studio/configurator and live verification. [The complete project specification](../../PROJECT-SPECIFICATION.md) describes the product and operating boundaries. Cloud CMS writes remain blocked by the existing Blob feature block.

Earlier Hero V1 baseline:

The current Hero V1 release is recorded in [its scroll-control repair ledger](../hero-v1-scroll-repair-2026-10-12.md): runtime `a58d3640ee8dac793dc63f765e07522f6606e472`, READY deployment `dpl_CfkkNk552GBmH2mqDj7CKkq9SYoS`. It uses position-driven independent frames with Hero-only wheel/trackpad gain 0.45, prepared window anchors, static reversal, a constant faster intro, completed-window handoff and section-aware reloads. Cold preparation and physical-device acceptance limits remain documented.

Production website: https://okno-homes-deployment.vercel.app. Editor: https://okno-homes-deployment.vercel.app/admin. All plan subtasks are complete. Read the release ledger for source/deployment identity, exact checks and remaining acceptance boundaries.

Machine-readable reports: [CMS/API](live-api-verification.json), [public routes/models](live-public-verification.json), [media](live-media-verification.json), [final smoke](live-final-smoke.json).
