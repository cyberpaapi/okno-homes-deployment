# Production deployment documentation

- [Implementation plan and subtask checklist](implementation-plan.md)
- [Repository and runtime architecture](architecture.md)
- [Deploy, storage and rollback operations](operations.md)
- [Fixed shared admin-key configuration](admin-keys.md)
- [Release decisions, live verification and remaining limits](release-ledger.md)

The deployment is complete only after private repository, source SHA, READY status and live smokes are verified.

## Verified release

The current Hero V1 ordered-frame release is recorded in [its integration ledger](../hero-v1-window-finish-2026-10-11.md): runtime `53a82f60224ef92ca7ea7723e02568d303f956f6`, READY deployment `dpl_HBqXTrpP6yZ5giMuvx5Q5UeHqboh`. It preserves the accepted window film, applies adjacent-frame playback and reload rules, and caches its unchanged fingerprinted source. Earlier reports below retain historical evidence.

Production website: https://okno-homes-deployment.vercel.app. Editor: https://okno-homes-deployment.vercel.app/admin. All plan subtasks are complete. Read the release ledger for source/deployment identity, exact checks and remaining acceptance boundaries.

Machine-readable reports: [CMS/API](live-api-verification.json), [public routes/models](live-public-verification.json), [media](live-media-verification.json), [final smoke](live-final-smoke.json).
