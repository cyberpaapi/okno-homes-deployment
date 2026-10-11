# OKNO Homes

Private source for the Final Showcase website and its content studio. One Next.js application serves the public website and `/admin` on the same domain. Admin is reached by typing its URL; no public website link is provided. Editing requires the owner's action key.

## Live release

- Website: https://okno-homes-deployment.vercel.app
- Admin: https://okno-homes-deployment.vercel.app/admin
- Private repository: https://github.com/CodeAcc2007-dev/okno-homes-deployment

## Start here

- [Working version](WORKING-VERSION.md)
- [Documentation index](docs/README.md)
- [Repository architecture](docs/deployment/architecture.md)
- [Deployment plan and subtasks](docs/deployment/implementation-plan.md)
- [Release decisions and verification](docs/deployment/release-ledger.md)
- [Admin guide and evidence](docs/admin/README.md)
- [Admin key generation and management](docs/deployment/admin-keys.md)

## Local development

Node.js 22. Install with `npm ci`. Start the website with `npm run website` at `http://127.0.0.1:3134`. Start the admin with `npm run admin`, then open `http://127.0.0.1:3140/admin`; the gateway reuses the website process. Ports are owned by `config/local-ports.json`.

Generate a new owner key using `npm run admin:key`, then configure the server-only `OKNO_CMS_ADMIN_TOKEN` in an ignored local environment file. Read the key guide before production setup. Never commit real keys, local content history, demo tokens, dependencies or build output.

## Checks

```sh
npm test -- --maxWorkers=2
npm run lint -- --max-warnings=0
npx tsc --noEmit
npm run build
npm run release:check-bundles
```

This repository is proprietary and is not open source. Third-party component source and licenses remain in `docs/21st-source`; their original terms remain applicable. Historical snapshots and rejected approaches are identified in `docs/archive`.
