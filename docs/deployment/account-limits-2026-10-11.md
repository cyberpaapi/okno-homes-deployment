# Vercel account limits — 11 October 2026

## Account verification

CLI 63.1.2 remains authenticated as `codeacc2007-8289`; no new login was needed. Team `codeacc2007-8289s-projects` (`team_WYCx00nKZCK9KiAyuA2gKpWK`) is **Hobby**. Fresh team API state: one concurrent build, elastic concurrency disabled; account limited=false, blocked=null, softBlock=null. The root featureBlocks record confirms **Blob is blocked until 10 November 2026 02:47 UTC / 08:17 IST**. The account itself is not reported as blocked.

The CLI billing `usage --json --group-by project` request was retried; Vercel returned “Billing cost data is unavailable” for this Hobby team. Its observability schema has requests/functions/transfer metrics but no Blob or retained-deployment storage counters. Those are not substitutes for a quota meter. The browser still awaits the owner's two-factor verification. This report does **not** invent current consumption or a remaining percentage.

## Included allowances

These are the current published Hobby limits, not the user's measured consumption. [Official Hobby plan](https://vercel.com/docs/plans/hobby):

| Resource | Allowance |
| --- | --- |
| Fast Data Transfer | 100 GB |
| Fast Origin Transfer | 10 GB |
| CDN requests | 1,000,000 |
| Function invocations | 1,000,000 |
| Active CPU | 4 CPU-hours |
| Provisioned memory | 360 GB-hours |
| Image transformations | 5,000 |
| Image cache reads / writes | 300,000 / 100,000 |
| Web Analytics | 50,000 events/month |
| Speed Insights | 10,000 events/last 30 days, team-shared |
| Global Config reads / writes | 100,000 / 100 |
| Workflow events / data written | 50,000 / 1 GB |
| Connect token requests / triggers | 500 / 1,000 |
| Projects / domains per project | 200 / 50 |
| Deployments per day | 100 |
| Function maximum duration | 300 seconds |
| Build CPU / RAM / disk | 2 vCPU / 8 GB / 32 GB |

Hobby has no paid billing cycle. Most exceeded features wait 30 days; Web Analytics has a different pause policy. Current account-specific Blob blockedUntil above is the authoritative available reset timestamp. [Official Hobby cycle explanation](https://vercel.com/docs/plans/hobby#hobby-billing-cycle).

[Official Blob allowances](https://vercel.com/docs/vercel-blob/usage-and-pricing):

| Blob resource | Allowance |
| --- | --- |
| Storage size | 1 GB-month |
| Simple operations | 10,000 |
| Advanced operations | 2,000 |
| Data transfer | 10 GB |

Blob storage is a monthly average, not the number of bytes presently listed. Dashboard browsing/listing and multipart upload parts can consume advanced operations; cache misses/head accesses consume simple operations. The active block does not identify which counter was exhausted. The earlier 13-object/~4.16 MB listing cannot establish that storage, rather than operations or transfer, hit the limit.

## Deployment storage and impact on KRNL

**Deployment Storage is a 10 GB allowance shared by the Hobby team**, per [Vercel's 16 September changelog](https://vercel.com/changelog/hobby-projects-now-retain-fewer-deployments-to-free-up-storage). Exceeding it can block new deployments until space is freed. The current production deployment is protected by retention. The separate **Functions Storage** metric counts retained regional function bundles; do not relabel it as Blob or infer an unverified separate allowance. [Storage definitions and project breakdown](https://vercel.com/docs/deployment-storage).

OKNO and KRNL are separate projects on the same team, so shared account allowances can affect KRNL's future deployments. OKNO's private Blob store is connected only to OKNO; its suspension is not evidence that KRNL's database is suspended. No KRNL settings, secrets, deployment or storage were changed. The previously authorized unused demo project deletion is complete and removes its retained cloud outputs; it does not reset Blob operations or erase historic GB-month daily maxima. Exact reclaimed bytes and post-deletion usage remain unavailable until the dashboard can be read.

## Remaining meter verification

After two-factor sign-in, select this team → Usage → All projects. Record each meter's exact usage, denominator and displayed period; inspect Deployment Storage and Functions Storage → Projects for OKNO/KRNL attribution, and Blob → storage/simple/advanced/transfer to identify the exhausted resource. Do not upgrade, purchase, move projects or change retention as part of this read-only audit.
