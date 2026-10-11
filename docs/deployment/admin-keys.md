# Admin access and owner-key operations

## Current release model

Type `https://<website-domain>/admin` directly. Public navigation has no admin link. The editor shell can load publicly, but reads of drafts and every administrative action require a valid owner key. An obscure URL is not an authorization boundary.

The key is a bearer credential with full CMS read, media upload, save and publish rights. It grants no GitHub, Vercel account, billing or shell access. Existing content validation and revision checks still apply to authenticated actions.

## Generate

```sh
npm run admin:key
# Rotation: always use a new filename
npm run admin:key -- --output .okno-secrets/admin-key-rotation.env
```

The script generates 32 cryptographically random bytes (256 bits), encoded as a 43-character base64url string. It writes `OKNO_CMS_ADMIN_TOKEN=<key>` to a new file with owner-only 0600 permissions; the default directory is 0700. It refuses to overwrite a file. Console output shows only the path and a short SHA-256 fingerprint. The secret directory and all real environment files are ignored by Git. `--help` prints usage without generating a key.

## Configure and hand off

1. Copy the key into a password manager; share only through that manager's private share feature with authorized editors.
2. In the verified OKNO Vercel project, set `OKNO_CMS_ADMIN_TOKEN` as a sensitive server-only environment variable for **Production**. Never prefix it with `NEXT_PUBLIC_` or put it in source, docs, logs, URLs, browser storage or screenshots.
3. Use a different key for Preview if preview editing is enabled, and a different Blob store. Preview must never write to production content.
4. Deploy a fresh production build after changing the environment. Existing deployments retain their old environment; an environment update alone does not revoke an old deployment's key.
5. Open `/admin`, enter the key and Connect. The editor holds it in React memory and sends it in the HTTPS Authorization header. Reload/Disconnect clears editor authorization. It is not saved to cookies/localStorage/sessionStorage.
6. Keep the local `.env.local` credential separate. Never deploy the expiring local demo credential. Demo access is disabled when running on Vercel.

## Rotate or revoke

Generate a new file, update the **exact project's** Production environment value, deploy, and verify that the new key succeeds while the old key receives 401 on the current production URL. Share the replacement through the password manager. For compromise response, also remove or protect superseded deployments that still contain the old key; do not assume moving the production alias revokes access to their individual URLs. To disable all writes, clear the environment value and redeploy; the editor APIs fail closed with 503. Restore a valid key and redeploy to re-enable access.

Rotation is manual, with no automatic expiry in this release. Record date, operator and fingerprint in the release ledger, never the secret. Do not use a local demo token as an owner credential.

## Management options

| Option | Strengths | Limits / work needed |
| --- | --- | --- |
| One owner key (implemented) | Simple handoff, secure random generation, rotation via Vercel env | Shared identity; everyone with key can publish; no individual revocation or actor audit |
| Named per-person keys | Separate expiry/revocation, roles and actor audit | Needs a durable key registry, hashed secrets, management UI, access roles and event log; not implemented |
| Managed accounts with MFA | Named users, recovery, roles and short-lived sessions | Requires an auth provider, owner enrollment and account/role integration; not implemented |
| Vercel deployment protection | Additional gate for preview/old deployment URLs | Supplementary only; protecting the whole production deployment would also gate the public site |

The owner key is the release default. Choose named accounts before widening access to a team. GitHub PAT, Vercel CLI token and Blob token are infrastructure secrets, distinct from the admin action key.
