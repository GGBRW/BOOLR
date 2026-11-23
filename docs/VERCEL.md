# Vercel deployment

REEO deploys as a **static Vite website**. Bun installs dependencies and builds it; there are no serverless functions, cloud database, or required environment variables. Desktop/mobile packages are separate targets.

## Import from GitHub (recommended)

1. In Vercel, choose **Add New → Project** and import this repository.
2. Keep **Root Directory** at the repository root (`.`), **not** `app/` or `dist/`.
3. Use the settings in `vercel.json`; remove conflicting dashboard overrides:

   | Setting               | Value                                                           |
   | --------------------- | --------------------------------------------------------------- |
   | Framework preset      | Vite                                                            |
   | Install command       | `ELECTRON_SKIP_BINARY_DOWNLOAD=1 bun install --frozen-lockfile` |
   | Build command         | `bun run build:vercel`                                          |
   | Output directory      | `dist`                                                          |
   | Development command   | `bun run dev`                                                   |
   | Node.js version       | 24.x (22.x also satisfies this repo's engine range)             |
   | Environment variables | None required                                                   |

4. Leave development dependencies available during the build: TypeScript, Vite and esbuild are build tools. Do not set `NODE_ENV=production` for dependency installation or add `--production` to `bun install`.
5. Deploy. With Git integration, Vercel creates preview deployments for eligible branches/PRs and production deployments for the project's selected production branch. Select `master` for the repository's current mainline; do not designate a temporary working branch as production by accident.
6. Open the deployment URL, create a board, place and connect gates, toggle an input, export, reload, and re-import. Confirm Arabic/Egyptian Arabic and RTL switching.
7. Add a custom domain in **Project → Settings → Domains** if desired. Follow the exact DNS records Vercel displays and wait for DNS/TLS provisioning. No domain-specific URL is compiled into REEO.

The committed `bun.lock` and `packageManager` declaration identify Bun. Match the declared Bun version in local/CI builds; if Vercel's build image reports an incompatible Bun version, review its supported Bun version selection before changing the lockfile. Do not regenerate the lockfile during deployment to bypass a frozen-lockfile error.

## CLI alternative

From the repository root, in your own authenticated terminal:

```sh
bun x vercel login
bun x vercel link
bun x vercel           # preview deployment
# After checking the preview:
bun x vercel --prod    # production deployment
```

These commands let Vercel install and build remotely using `vercel.json`. Do not pass `dist/` as the project root. The generated `.vercel/` link state is ignored by Git. Never commit Vercel tokens or local `.env` files.

Git integration is the default deployment automation; a second GitHub deployment workflow and token are not required. If an organization needs token-based CI instead, store credentials only in its CI secret store and scope them to the intended Vercel project/team.

## What the configuration does

- Builds with a frozen Bun lockfile and skips the unused Electron binary download.
- Runs the normal typed browser build, followed by `verify:web`, which checks local HTML/CSS asset references and required classic-script runtime/brand files in `dist/`.
- Excludes local state, native generated projects, build outputs and environment files through `.vercelignore`. Native TypeScript source remains available because the shared typecheck includes it.
- Gives fingerprinted `/assets/*` a one-year immutable cache. HTML, original unversioned `/js/*`, and brand assets must revalidate so deployments do not mix old logic with new HTML.
- Sends `nosniff`, referrer, permissions, frame and Content Security Policy headers.
- Retains inline scripts/styles for the original UI (`'unsafe-inline'`); does **not** allow `'unsafe-eval'`. Removing inline permissions requires a separate nonce/hash or script-extraction migration.
- Allows same-origin connections, the public GitHub Releases API used by the What's new dialog, and secure `wss:` connections for the existing optional external collaboration feature. This does not deploy a collaboration server. Tighten `connect-src` to a specific server hostname if one is operated.
- Uses clean URLs and no trailing slash. There is intentionally **no catch-all SPA rewrite**: this editor lives at `/`, not at arbitrary client-side routes. Missing JS/images must return 404 rather than HTML.

Vercel manages HTTPS and compression. No custom function runtime, region, duration, wildcard CORS policy, or secret is needed for this static target. The framing policy permits only same-origin embedding; adjust both CSP `frame-ancestors` and `X-Frame-Options` deliberately if cross-origin embedding becomes a requirement.

## Local verification

```sh
ELECTRON_SKIP_BINARY_DOWNLOAD=1 bun install --frozen-lockfile
bun run check
bun run build:vercel
bun run preview --port 4173
# In another terminal:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 bun run test:e2e
```

The production-only deployment browser test applies the exact committed CSP to the document response and checks startup and gate placement for script/security violations. Vite preview itself does not implement Vercel caching/redirect/header rules. Unit tests check the deployment contract; final edge behavior must be verified on an actual Vercel URL.

After deployment, check headers and missing-file handling:

```sh
curl -I https://YOUR-DEPLOYMENT.vercel.app/
curl -I https://YOUR-DEPLOYMENT.vercel.app/index.html
# Substitute a real fingerprinted path from the deployed HTML:
curl -I https://YOUR-DEPLOYMENT.vercel.app/assets/ACTUAL-HASHED-FILE.css
curl -I https://YOUR-DEPLOYMENT.vercel.app/definitely-missing.js
```

Expect revalidation on HTML/classic scripts, immutable caching on the hashed asset, security headers, and 404 on the nonexistent script. `vercel.json` rules are validated locally by regression tests, not by a live deployment in this workspace.

## Operational notes

- Boards are stored in the browser's local storage, scoped to the origin. Preview URLs, production domains, and custom domains do not share that storage. Export boards before changing domains or clearing site data.
- Deployments do not provide account sync or server-side backup. Browser storage limits/private mode still apply.
- A rollback can be performed by promoting a known-good deployment in Vercel. Unversioned files revalidate; fingerprinted assets remain immutable.
- Build failure: check root directory, Bun version, frozen lockfile, development dependencies and dashboard overrides first.
- Blank page: check network 404s/CSP violations, then confirm `dist/js/` was generated by the Vite copy plugin. Do not solve missing assets with a blanket HTML rewrite.

**Repository configuration is not evidence of a published deployment.** Linking a Vercel project and triggering a deployment are separate account actions.

## Related

- [Architecture → Local storage keys](ARCHITECTURE.md#local-storage-keys) — origin-scoped persistence.
- [Releasing](RELEASING.md) — version and rollback steps.
- [Troubleshooting → Web deployment](TROUBLESHOOTING.md#web-deployment-and-runtime) — blank page/CSP/404 checks.
