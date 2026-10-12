# Production deployment documentation

- [Implementation plan and subtask checklist](implementation-plan.md)
- [Repository and runtime architecture](architecture.md)
- [Deploy, storage and rollback operations](operations.md)
- [Fixed shared admin-key configuration](admin-keys.md)
- [Release decisions, live verification and remaining limits](release-ledger.md)

The deployment is complete only after private repository, source SHA, READY status and live smokes are verified.

## Verified release

The current Hero V1 release is recorded in [its scroll-control repair ledger](../hero-v1-scroll-repair-2026-10-12.md): runtime `f92e623c476b9655adaa8b4551119e16cf00d3b4`, READY deployment `dpl_FCaGh8xAsfZvAvULtjQ4DLmQoUU2`. It uses position-driven independent frames with prepared window anchors, static reversal, a constant faster intro, completed-window handoff and section-aware reloads. Cold preparation and physical-device acceptance limits remain documented.

Production website: https://okno-homes-deployment.vercel.app. Editor: https://okno-homes-deployment.vercel.app/admin. All plan subtasks are complete. Read the release ledger for source/deployment identity, exact checks and remaining acceptance boundaries.

Machine-readable reports: [CMS/API](live-api-verification.json), [public routes/models](live-public-verification.json), [media](live-media-verification.json), [final smoke](live-final-smoke.json).
