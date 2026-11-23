# Releasing

REEO ships a browser build continuously (Vercel), manual desktop packages (Electron), and manual mobile test builds (Capacitor). A release is a deliberate version bump plus verified artifacts, not just a merge to `master`.

## Version sources

The version is duplicated in four places. Keep them identical:

| File             | Field                            |
| ---------------- | -------------------------------- |
| `package.json`   | `version`                        |
| `app/index.html` | inline `const VERSION = "2.0.0"` |
| `src/runtime.ts` | `window.reeo.version`            |
| `src/types.ts`   | `ReeoApi.version` literal        |

`bun.lock` records the package version only indirectly; run `bun install` after changing `package.json` so the lockfile stays consistent. Do not hand-edit generated native projects.

## What goes into a release

1. **Code and docs** merged to `master`, with `bun run check`, `build:vercel`, and e2e green locally.
2. **What’s new** content updated in `app/js/dialogs.js` (`dialog.update`). Add/remove list items, then add matching translations in `src/legacy-messages.ts` for Arabic and Egyptian Arabic. The dialog is opened from the bottom-right navigation menu.
3. **Version bump** in all four files above.
4. **Screenshots/README** refreshed if the home screen, wordmark, or guide changed.
5. **Known issues** recorded in the release notes (including CI billing limitations, untested browsers/devices, unsigned packages).

## Pre-release checklist

```bash
bun install --frozen-lockfile
bun run check
bun run build:vercel
bun run test:e2e
bun run font:verify
PLAYWRIGHT_PRODUCTION=1 bun run test:e2e   # production/CSP pass
```

Manual smoke test (see [Testing → Manual smoke test](TESTING.md#manual-smoke-test)):

- New board, welcome dialog, place/wire/toggle, save/reload, export/import.
- Componentize and saved components.
- Console `set`/`get`/`findComponent`/`edit`.
- Field guide search, recipe dock/ghost, diagnostics.
- English, Arabic, Egyptian Arabic at 320 px and desktop; RTL.
- Touch placement/move/pan/pinch/long press/double tap.
- Pause/resume; delete a running Clock then undo.
- Production console has no CSP or 404 errors.

Do not release if an invalid import can replace the current board, if clear-local-data still leaves REEO keys, or if the What’s new/version text is inconsistent.

## Browser release (Vercel)

`vercel.json` defines:

```text
installCommand: ELECTRON_SKIP_BINARY_DOWNLOAD=1 bun install --frozen-lockfile
buildCommand:   bun run build:vercel
outputDirectory: dist
```

Flow:

1. Merge the release PR to `master`.
2. Vercel builds `dist` with `build:vercel`, which typechecks, builds, and verifies referenced assets/files.
3. Confirm the production deployment at https://reeo.vercel.app and a preview URL.
4. Verify the CSP headers and that `/app/js/*`, fonts, icons, and brand assets load.
5. Confirm storage is per-origin and note that preview/production/custom domains do not share boards.

Roll back by promoting the previous deployment in Vercel. Local storage is origin-scoped, so a rollback does not delete user boards.

## Desktop release (Electron)

```bash
bun run desktop:compile   # electron-out/main.cjs + preload.cjs
bun run desktop:pack      # build + compile + electron-builder
```

Outputs go to `releases/` (git-ignored): AppImage/deb (Linux), NSIS `.exe` (Windows), DMG/ZIP (macOS) per `electron-builder.yml`. The app loads `dist/index.html`; **build the web bundle first**. `files` includes `dist`, `electron-out`, the brand icon, and `package.json`; ASAR is on.

The `desktop.yml` workflow is manual (`workflow_dispatch`) and sets `CSC_IDENTITY_AUTO_DISCOVERY=false`. **Packages are unsigned/notarized by this repository.** Distributing to end users requires your own code-signing/notarization credentials and a tested install/uninstall path on each OS.

Verify at minimum:

```bash
bun run desktop:dev
# then: save, reopen, export/import, Quit (saves), devtools only when unpackaged
```

The Electron main process uses `contextIsolation`, `sandbox`, no `nodeIntegration`, denies permission requests, blocks navigation, and opens only `https://` links externally.

## Mobile release (Capacitor)

```bash
bun run mobile:assets           # regenerate icons/splash from assets/native
bun run mobile:android          # build + cap sync android + assets
bun run mobile:ios              # build + cap sync ios + assets
```

- `mobile:add:android` / `mobile:add:ios` create native projects once; they are git-ignored.
- Android CI uses JDK 21 + Android SDK and builds a **debug APK**.
- iOS CI builds a **simulator `.app`** with `CODE_SIGNING_ALLOWED=NO`.
- Store submission (signing, provisioning, version codes, Play/App Store metadata) is not automated here.

`capacitor.config.ts` uses `appId: app.reeo.logic`, `webDir: dist`, dark background `#111111`, no mixed content. Native assets come from `assets/native/` and `scripts/native-assets.ts`.

## Release notes

Use GitHub Releases. Suggested body:

```markdown
## REEO vX.Y.Z

### Highlights

- …

### Fixes

- …

### Breaking changes / migration

- …

### Verification

- `bun run check`
- `bun run build:vercel`
- `bun run test:e2e` (production)
- Manual: desktop/phone, en/ar/arz, RTL, touch

### Known issues

- CI billing lock (if still active)
- Untested browsers/devices
- Unsigned desktop/mobile packages
```

Tag and publish:

```bash
git tag -a vX.Y.Z -m "REEO vX.Y.Z"
git push origin vX.Y.Z
gh release create vX.Y.Z --title "REEO vX.Y.Z" --notes-file release-notes.md
```

Attach desktop artifacts if they were built and reviewed. Do not attach debug APKs to a stable release unless clearly labeled.

## Post-release

- Confirm the production site loads with no CSP/404 errors.
- Confirm the tag matches the version in the UI and `window.reeo.version`.
- Open a follow-up issue for anything deferred.
- Update `docs/TESTING.md` if the tested browser/device matrix changed.

## Rollback

| Surface | Action                                                              |
| ------- | ------------------------------------------------------------------- |
| Web     | Promote the previous Vercel deployment                              |
| Desktop | Withdraw the artifact/announcement; publish a corrected build       |
| Mobile  | Halt rollout in the store console; publish a new version code       |
| Data    | Users’ boards are local; never advise “clear storage” as a rollback |

Never rewrite a published tag or silently replace a release asset. Publish a new patch version with an explanation.

## Maintainer merge policy

- Prefer squash or merge commits that preserve a readable history; do not force-push `master`.
- Require the `verify` check when CI is available. While the billing lock blocks it, document that Vercel checks and local results were used.
- Require review for changes to `app/js/components.js`, `src/board.ts`, `src/storage.ts`, workflows, `vercel.json`, and this document.
- Never commit secrets, signing certificates, `.env` files, or generated native/desktop output.

See [GitHub workflow](GITHUB.md) for the public contribution process.
