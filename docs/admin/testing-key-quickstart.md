# Fixed admin sign-in

1. Open `https://okno-homes-deployment.vercel.app/admin` directly, or `http://127.0.0.1:3140/admin` for the local editor.
2. Enter the fixed shared key supplied by the owner, exactly as supplied, and click **Connect**.
3. Edit content, save drafts, then **Publish** to update the public website.

The owner chose one shared, non-expiring key for production and local use. There is no routine key-generation, renewal or rotation step. Disconnect or reload clears the current browser authorization; it does not expire or change the key. Keep using the same key unless the owner explicitly changes it.

The credential grants full CMS read, upload, draft save and publishing rights. It does not grant infrastructure or billing access. The value stays in server configuration and ignored local files, not the public website code. Maintainers configure it once as Production `OKNO_CMS_ADMIN_TOKEN` and local `.env.local`; a deployment/restart is needed only if the owner later changes that value. The former random testing-key instructions are superseded.

Production's existing Vercel Blob storage block is separate from sign-in. A valid key currently reaches a storage-unavailable 503; live editing/upload/publishing cannot be accepted until that store is available. This credential change does not reduce compute materially or alter the quota.

See [the configuration notes](../deployment/admin-keys.md) and the current admin/release ledgers for activation evidence.
