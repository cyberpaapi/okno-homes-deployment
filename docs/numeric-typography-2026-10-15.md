# Original responsive sizes and optional numbers — 15 October 2026

The owner's latest correction supersedes the five shared size presets. Forced uniform sizes changed carefully authored labels, card copy and headings. Original sizes now remain the default; Geist remains the master font, with the existing master and section body/heading/highlight font choices. Logo artwork stays unchanged.

## Implementation

Restored 754 authored size expressions across 58 CSS files. Each declaration keeps its original pixel, rem, viewport clamp or media-query expression as the fallback to an optional section override. Source values came from the preserved tracked source and supplied configurator UI source. No Git reset, media replacement or 3D change was used. The three newly authored Hero V2 ending styles retain their own responsive fallback expressions. Earlier Hospitality stacking/gallery, Signature control clearance and short-screen layout repairs remain.

In admin, open a page and section, then **Fonts and numeric text sizes**. Large titles, Headings, Subheadings, Body text and Small text each have optional desktop and phone pixel inputs. Allowed values are 6–400 with up to one decimal. Desktop applies above 700px; phone applies at 700px and below. Blank or **Use original** restores the original responsive size independently for that viewport. Save draft, preview and Publish retain the existing workflow. These are section text-role controls; collection items inherit their owning section. Roles absent from a section have no visible text to resize.

Shared settings now owns **Master font** only. Obsolete saved preset assignments are ignored, avoiding a destructive CMS migration. Numeric values are validated in both the editor and store; generated CSS uses safe numbers and allowlisted families. A section boundary resets inherited overrides, so nested sections retain their own original defaults.

## Verification

- Seven focused test files / 77 tests passed for typography, registry, persistence and affected public components. Final targeted ESLint (zero warnings), TypeScript and diff checks passed; lint/type checks ran sequentially under 1.5 GiB memory caps.
- All 1,010 numeric settings across 101 registered sections saved as private drafts and published locally. Visitor data stayed unchanged until Publish. Public CSS reflection measured 177 saved browser states with zero mismatches: all 101 sections at desktop, 90 at phone width. Hospitality phone text also reflected actual 31px values, 21px descriptions and 9px labels.
- Test settings were removed at publication revision 38 / draft revision 145. The published fields and collections match the private original snapshot exactly, with zero field or collection drafts. An offline store comparison reconfirmed this after the service interruption.
- A source consistency check verified all 754 restored fallback expressions against their recovered originals, with zero missing or changed expressions.
- Admin-browser inspection was blocked by the browser URL safety check; authenticated local CMS API verification is distinct from browser UI acceptance. The final restored-default visual pass was interrupted by system memory pressure and is not claimed complete.

Machine-readable scope and limits: [verification](evidence/numeric-sizes-2026-10-14/verification.json). Private snapshots and captures remain outside versioned delivery. No deployment or cloud CMS write occurred.

## Resource boundary

After the reported kernel memory termination, no leftover Next.js/build/test jobs were running. A final production check was attempted alone in a systemd user scope: 3 GiB hard memory limit, 2.5 GiB memory high watermark, 512 MiB swap maximum, 200% CPU quota, one Next build worker and 2 GiB Node heap. No development server or browser route sweep ran alongside it. It stalled under the cap and was stopped to avoid prolonged swapping; a completed production build is not claimed. The website/admin remain stopped to conserve memory. Remaining lint/type checks run sequentially with their own smaller memory caps. The browser safety check also blocked closing the two disconnected test tabs; no alternate cleanup method was attempted.
