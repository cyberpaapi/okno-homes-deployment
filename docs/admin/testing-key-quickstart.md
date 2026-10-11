# Generate and manage an OKNO admin key

Open `https://okno-homes-deployment.vercel.app/admin`, enter the active key and click **Connect**. Disconnect or reload clears it from the editor.

The current release accepts one owner key. It grants full CMS read, upload, draft save and publishing rights, with no automatic expiry. It grants no GitHub, Vercel-account or billing access. A generated file is not active until configured and redeployed.

## Generate a replacement

Run from the Final Showcase repository:

```sh
npm run admin:key -- --output .okno-secrets/admin-key-next.env
```

1. Open the generated file privately and copy only the value after `OKNO_CMS_ADMIN_TOKEN=`. Generation uses 32 random bytes (256 bits); the ignored file has owner-only permissions. Existing files are never overwritten.
2. In Vercel, open **okno-homes-deployment → Settings → Environment Variables**. Replace `OKNO_CMS_ADMIN_TOKEN` for **Production**, keep its type **Secret**, and redeploy the current reviewed application. Do not use a `NEXT_PUBLIC_` variable. Other projects and environments are separate.
3. Enter the new key at `/admin`. Verify the new key is accepted and the previous key returns 401 on the main website domain. Share only with the intended tester. Rotate again after testing to end their access to the main site.

Older deployments keep their old environment and credentials at their individual URLs. Main-domain rotation does not revoke those older URLs; restricting or removing those deployments is a separate revocation step. Named users, individual roles and automatic expiry are not implemented. See [the complete operations guide](../deployment/admin-keys.md).

## Current testing handoff — 11 October 2026

A new owner key was generated for the requested testing handoff, fingerprint `0afd324cd321`. Its secret is stored only in ignored owner-readable files, never in this guide or Git. Activated on the main production domain in READY deployment `dpl_8rQAxu1fj2Z61wQyXbDN3EaSvuuL`, retaining reviewed source `e11c6288bd32f3e9def5bcfc451f39a7ba2626b0`. New-key upload capability returns 200; content reaches the known storage 503. Previous key and unauthenticated content both return 401. Admin shell and homepage return 200. This proves authentication, not working media uploads or publication. Evidence: [sanitized checks](testing-key-activation.json).

The existing Vercel Blob outage is independent of the key. An accepted key can still receive the storage-unavailable 503. Until the existing store is available, cloud content editing, uploads and publication are not accepted as working; a new key does not fix that limit.
