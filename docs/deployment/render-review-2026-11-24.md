# Render free review deployment — 24 November 2026

This configuration prepares a separate review deployment in the owner's connected CodeAcc2007 Render workspace, My Workspace (`tea-dc2k59l9fdbs73fubqn0`). It does not replace a production deployment or establish hosted acceptance. No paid service, persistent disk, database, credentials or CMS data is provisioned by this configuration.

## Source and service

- Blueprint: repository-root `render.yaml`.
- Service name: `okno-homes-finishing-review`.
- Source: `https://github.com/cyberpaapi/okno-homes-deployment.git`, branch `codex/finishing-2026-11-24`.
- Runtime: Node web service, Free plan, Singapore.
- Node: exactly `22.22.2`, supplied through `NODE_VERSION`.
- Automatic deployment: disabled with `autoDeployTrigger: off`. Deploy a deliberately selected, committed review revision and record its source SHA and resulting service/deployment identity.

A Node web service retains Next.js routes, APIs and `/admin`; a static export would not provide that server behavior. Render clones the public Git repository, including its existing `public` assets. The earlier proposed Vercel CLI asset-restoration workaround is not part of this deployment.

## Build, start and health

The Blueprint build command is:

```sh
npm ci --include=dev && npm run build && npm run release:check-bundles
```

The existing build script remains `next build --webpack`; Next.js remains pinned to `16.4.5`. `NEXT_TELEMETRY_DISABLED=1` disables Next telemetry, and the existing `OKNO_LOW_MEMORY_BUILD=1` configuration limits the build to one worker.

The start command is `npm run start:render`, which runs `next start --hostname 0.0.0.0`. The installed Next.js CLI documentation confirms that `next start` reads the `PORT` environment variable. Render supplies that variable, normally `10000`, so no shell interpolation, fixed local port or custom server is needed. Render requires the public listener to bind to `0.0.0.0`. See [Render web services](https://render.com/docs/web-services).

The health path is `/api/site-status`, an existing dynamic, no-store endpoint. A successful health check confirms the server responds; it does not verify page layouts, film playback, asset delivery, CMS publication or owner acceptance.

## Content and review limits

`OKNO_CONTENT_BACKEND=blob` retains the intended durable backend selection. This configuration supplies no Blob token, owner key or passwordless setting. Admin editing and publication are unconfigured and unverified for this review. Do not use the ephemeral service filesystem as a content store, import private data, or enable demo/passwordless access as part of deployment preparation. The frozen 3D configurator is unchanged.

Render's Free web services spin down after 15 minutes without inbound traffic and can take about a minute to wake. Their writable filesystem is ephemeral across restarts, redeployments and spin-down. These are review-host constraints; record cold and warm behavior separately. See [Render Free service limits](https://render.com/docs/free).

Before claiming hosted acceptance, record the selected commit, service ID, deploy ID and review URL, then check health, representative public pages, media/fonts and the requested responsive cases on that exact deployment. Keep CMS writes outside this review until owner access and durable storage are separately configured.

The Blueprint uses the current `autoDeployTrigger` field rather than deprecated `autoDeploy`. See the [Blueprint reference](https://render.com/docs/blueprint-spec). `NODE_VERSION` takes precedence over repository Node ranges; see [Node version selection](https://render.com/docs/node-version).

The finishing branch has a branch-specific `git.deploymentEnabled: false` rule in `vercel.json`, using [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration). This keeps the Render review branch from triggering automatic Vercel deployments when published to the supplied repository.
