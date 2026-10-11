# Fixed shared admin key

The owner explicitly selected one memorable, non-expiring shared key for the live OKNO admin and local editor. This replaces the earlier random testing-key generation/rotation handoff. Staff do not generate, renew or rotate keys. Use the same key unless the owner explicitly changes it.

## Staff sign-in

Type `https://okno-homes-deployment.vercel.app/admin`, enter the supplied shared key exactly, and click **Connect**. Local editor: `http://127.0.0.1:3140/admin`. Public navigation has no admin link. Reload or Disconnect clears the browser's current authorization, not the key itself. Save drafts and Publish remain separate actions.

The shared credential has full CMS read, upload, draft and publish rights, without automatic expiry. It has no GitHub/Vercel-account/billing/shell privileges. This owner-chosen short credential replaces the previous length policy; incorrect or absent credentials still receive 401. Missing/incomplete server configuration still fails closed. No public/client fallback key is embedded.

## Maintainer configuration

- Configure the supplied value once in the exact OKNO project's Production `OKNO_CMS_ADMIN_TOKEN` Secret and the local ignored `.env.local`. Keep the same value in the private operational key file.
- Minimum supported configured length is eight characters. Matching is exact and case-sensitive using the existing constant-time comparison. No extra account, key-generation or expiry service is introduced.
- Keep the value server-only; never prefix it with `NEXT_PUBLIC_`. The editor holds it in React memory and uses the HTTPS Authorization header; it is not saved in browser storage.
- Deploy/restart only when the owner explicitly changes the key. Existing deployments retain their old environment at their individual URLs. Updating the main production domain does not rewrite historical deployments.
- Preview editing/storage remains disabled; this request does not enable previews or change any other project. The legacy optional random-key utility and local-only expiring QA fixture are not part of the staff workflow and never renew the configured owner key.

The existing Blob block is independent of the credential. A correct key can reach the storage-unavailable 503; no live upload/publish acceptance is implied by successful authentication. The simpler credential has negligible impact on compute and cannot resolve storage usage.
