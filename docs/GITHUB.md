# GitHub repository guide

REEO lives at <https://github.com/abdou-da0wew/REEO>. This page explains the repository configuration, automation, and contribution flow.

## Repository facts

| Item           | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Default branch | `master`                                                     |
| License        | GPL-3.0-only (`LICENSE`, `NOTICE`)                           |
| Description    | “A digital logic simulator :3, revived BOOLR”                |
| Homepage       | <https://reeo.vercel.app>                                    |
| Issues         | GitHub Issues (see the note below if the tab is unavailable) |
| Discussions    | Not enabled                                                  |
| Wiki           | Enabled but not used; documentation lives in `docs/`         |
| Code owners    | `@abdou-da0wew` for the whole repository                     |
| Deployment     | Vercel (browser), manual Electron/Capacitor workflows        |

> **If the Issues tab is unavailable**, a maintainer must enable it once in **Settings → General → Features → Issues**. The templates in `.github/ISSUE_TEMPLATE/` are already committed and will appear as soon as Issues is on. Do not use a public issue for security reports.

Recommended repository settings (owner-only):

- Enable **Issues**; keep **Discussions** off until there is a moderation plan.
- Disable the unused **Wiki** to avoid stale duplicate documentation, or seed it with a link to `docs/`.
- Add topics: `logic-simulator`, `digital-logic`, `circuit-simulator`, `education`, `typescript`, `vite`, `electron`, `capacitor`, `bun`, `i18n`, `arabic`, `accessibility`.
- Enable **Dependabot alerts** and **secret scanning**.
- Protect `master`: require a pull request, require the `verify` check once CI is available, and block force-pushes.
- Use squash or merge commits; do not rewrite shared history.

## Configuration files

| Path                                         | Purpose                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                   | Push/PR gate: install, `check`, `build:vercel`, Playwright, upload `dist` |
| `.github/workflows/desktop.yml`              | Manual Linux/Windows/macOS Electron packages                              |
| `.github/workflows/mobile.yml`               | Manual Android debug APK and iOS simulator app                            |
| `.github/PULL_REQUEST_TEMPLATE.md`           | PR summary, verification, checklist, known gaps                           |
| `.github/ISSUE_TEMPLATE/bug_report.yml`      | Reproducible bug form                                                     |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Scoped feature proposal                                                   |
| `.github/ISSUE_TEMPLATE/documentation.yml`   | Docs correction form                                                      |
| `.github/ISSUE_TEMPLATE/config.yml`          | Disables blank issues; links docs, support, security                      |
| `.github/CODEOWNERS`                         | Default and sensitive-path review ownership                               |
| `.github/dependabot.yml`                     | Weekly Bun + GitHub Actions updates, grouped minor/patch                  |
| `SECURITY.md`                                | Private vulnerability reporting and scope                                 |
| `CONTRIBUTING.md`                            | Setup, standards, commit/PR rules                                         |
| `CODE_OF_CONDUCT.md`                         | Contributor Covenant 2.1                                                  |
| `SUPPORT.md`                                 | Where to ask and what to include                                          |

## CI

`.github/workflows/ci.yml` runs on every push and pull request:

1. Checkout, Bun 1.4.5, `bun install --frozen-lockfile` with `ELECTRON_SKIP_BINARY_DOWNLOAD=1`.
2. `bun run check` — typecheck, Oxlint, Biome, Prettier, unit tests.
3. `bun run build:vercel` — production build + built-asset verification.
4. Install Playwright Chromium with system dependencies.
5. `bun run test:e2e` with `PLAYWRIGHT_PRODUCTION=1`.
6. Upload `dist` as the `REEO-web` artifact.

The job has a 25-minute timeout and a per-ref concurrency group that cancels superseded runs.

**Known limitation:** the `verify` job has been blocked by a GitHub billing lock (“job was not started because your account is locked due to a billing issue”). This is not a test failure. When that happens, review the Vercel checks and local results, and state the limitation in the PR. Restore GitHub billing to make the check meaningful.

Desktop and mobile workflows are manually triggered (`workflow_dispatch`) and build artifacts only; they do not publish releases or sign packages. See [Platforms](PLATFORMS.md) and [Releasing](RELEASING.md).

## Dependabot

Dependabot checks the root Bun manifest/lockfile and GitHub Actions weekly. Minor/patch updates are grouped; majors arrive individually. For each update:

```bash
bun install
bun run check
bun run build:vercel
bun run test:e2e
```

Review native/Electron major upgrades carefully; they can change packaging behavior even when unit tests pass.

## Issues

Use the templates. A useful report includes:

- version/deployment, platform/browser/viewport, language,
- exact reproduction, expected vs. actual,
- a minimal `.board` when the circuit matters,
- console/network errors and screenshots for visual issues.

Maintainers may close reports that cannot be reproduced, that request a framework/UI replacement, or that disclose security details publicly. See [Support](../SUPPORT.md).

## Pull requests

1. Fork/branch from `master`.
2. Follow [Contributing](../CONTRIBUTING.md) and the PR template.
3. Keep the diff focused; include docs and translations for behavior changes.
4. Record test evidence and known gaps honestly.
5. A code owner review is required for sensitive paths (`src/board.ts`, `src/storage.ts`, workflows, Electron, `vercel.json`, docs).

Do not commit generated output, native projects, release artifacts, or personal saves. `dist/`, `android/`, `ios/`, `electron-out/`, and `releases/` are ignored.

## Security advisories

Use **Security → Advisories → Report a vulnerability**:

<https://github.com/abdou-da0wew/REEO/security/advisories/new>

Do not open a public issue. See [SECURITY.md](../SECURITY.md) for scope and handling.

## Releases and tags

- Version sources and release steps: [Releasing](RELEASING.md).
- Web deploys from Vercel on merge.
- Desktop/mobile artifacts come from the manual workflows or local commands.
- Tags are annotated (`vX.Y.Z`); do not move a published tag.

## Repository ownership

`@abdou-da0wew` owns the repository and release configuration. REEO preserves the original BOOLR attribution; see `NOTICE`. Contributions are licensed under GPL-3.0-only.
