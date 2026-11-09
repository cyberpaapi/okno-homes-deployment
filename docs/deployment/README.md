# Production deployment documentation

- [Implementation plan and subtask checklist](implementation-plan.md)
- [Repository and runtime architecture](architecture.md)
- [Deploy, storage and rollback operations](operations.md)
- [Fixed shared admin-key configuration](admin-keys.md)
- [Release decisions, live verification and remaining limits](release-ledger.md)

The deployment is complete only after private repository, source SHA, READY status and live smokes are verified.

## Verified release

Current package: source `7c0b0bbbae847c22c2191c086d7d0480da1fb0c1`, READY production `dpl_7cLd4JXPruKfnsyB3onTDjRVkEFv`, canonical alias assigned on 9 November 2026. The active project is `okno-homes-aryan` in the owner's Aryan team, from the private `cyberpaapi/okno-homes-deployment` repository. This release adds managed house models, the supplied customer configurator, PDF selections and corrected scene grounding/layout. [The release ledger](release-ledger.md) records checks and limitations. The existing password-free admin connection and private production store remain configured; published content is unchanged at revision 1.

Earlier Hero V1 baseline:

The current Hero V1 release is recorded in [its scroll-control repair ledger](../hero-v1-scroll-repair-2026-10-12.md): runtime `a58d3640ee8dac793dc63f765e07522f6606e472`, READY deployment `dpl_CfkkNk552GBmH2mqDj7CKkq9SYoS`. It uses position-driven independent frames with Hero-only wheel/trackpad gain 0.45, prepared window anchors, static reversal, a constant faster intro, completed-window handoff and section-aware reloads. Cold preparation and physical-device acceptance limits remain documented.

Production website: https://okno-homes-aryan.vercel.app. Editor: https://okno-homes-aryan.vercel.app/admin. Read the release ledger for source/deployment identity, exact checks and remaining acceptance boundaries. The older CodeAcc deployment and its historical storage limitations are separate from this target.

Historical machine-readable reports: [CMS/API](live-api-verification.json), [public routes/models](live-public-verification.json), [media](live-media-verification.json), [final smoke](live-final-smoke.json).
