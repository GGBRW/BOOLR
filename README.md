# REEO

**Digital logic. Limitless curiosity.**

REEO renews the original BOOLR digital logic simulator **without replacing its interface**. The dark main menu, Righteous/Ubuntu typography, white grid canvas, gate symbols, bottom toolbar, custom components, console, and existing circuit editor remain. Improvements are additive.

## Run it with Bun

Use **Bun 1.4.5+**. No account, database, or server backend is required.

```sh
bun install
bun run dev
```

Open the URL printed by Vite. The development server binds to `0.0.0.0`, so you can also test it from another device on your local network. For a browser-only setup without downloading Electron:

```sh
ELECTRON_SKIP_BINARY_DOWNLOAD=1 bun install
bun run dev
```

Bun is the package manager, development runtime, script runner, and unit-test runner. Electron necessarily ships its own Chromium/Node runtime; the browser and Capacitor versions run in browser engines. Node 22.12+ remains useful for native packaging tools.

## What's new

- **Circuit and UI icons:** vector gate/component symbols, Phosphor interface icons, and bottom-right dismissible tip toasts.
- **REEO identity:** original circuit-R mark, wordmark, application icons, brand guide, and the REEO Circuit Display typeface.
- **Browser version:** Vite static build; Vercel is the default configured hosting target.
- **Desktop retained:** modern Electron with a typed main/preload, sandboxed renderer, context isolation, and no renderer access to Node or the OS filesystem.
- **Mobile targets:** Capacitor Android/iOS configuration and manual CI builds, sharing the same interface.
- **English, Arabic, Egyptian Arabic:** typed dictionaries, persistent language selection, RTL, translated tutorials, dialogs, validation, tips, console help and built-in diagnostics. IBM Plex Sans Arabic is bundled for Arabic glyphs only; command syntax and user-created names remain unchanged.
- **Touch support:** placement/toggle/wire gestures plus explicit Move, Pan, Select, and zoom controls. Responsive menus, bounded dialogs, safe-area handling, and larger touch targets.
- **Portable boards:** local board library plus `.board` import/export, compatible with the original current save format. Browser and desktop now use the same local-storage adapter.
- **Reliability:** bounded TypeScript simulation scheduler, periodic and lifecycle saves, empty-board saving, validated import boundary, and arithmetic parsing without `eval`.
- **Live release notes:** the What's new dialog reads the latest public GitHub release, parses its changelog, and caches it for offline use instead of shipping a hardcoded list.
- **Release pipeline:** one version tag builds the web bundle, Electron desktop packages, and Android/iOS shells through `.github/workflows/release.yml`.
- **Tooling:** TypeScript 7 strict checking; Prettier as the **only formatter**; Biome and Oxlint as **linters only**; Bun lockfile and CI.

## First circuit

1. Choose **NEW BOARD**, enter a name, and create it.
2. In the original bottom toolbar, choose **I/O → Input**, then click/tap the canvas.
3. Choose a gate (`!`, `&`, `|`, `^`) and place it.
4. Drag from a black output pin to a white input pin.
5. Add **I/O → Output** to see the result. Toggle your input.
6. Save from the bottom-right menu. **Export board** downloads a backup.

On a touchscreen, use the small top-left controls to move components or pan without keyboard modifiers. On a computer, original shortcuts and mouse interactions remain. The quick-guide button explains both.

**Your boards are stored on this device, in this browser profile/app.** Clearing browser/app data removes them. Export backups before switching devices or uninstalling. Existing files in an old BOOLR `saves/` folder are not automatically migrated: import those `.board` files explicitly. Private browsing and storage quotas may prevent persistence.

## Type

**REEO Circuit Display** is an original monoline display typeface cut from the R in the wordmark: one 56-unit stroke, round caps, and port stubs at the joints. It is a real installable TTF, not an expanded logo font.

- 359 glyphs and 344 mapped codepoints: complete Latin-1 and Latin Extended-A, plus typographic quotes, dashes, daggers, ellipsis, euro and minus.
- Tabular figures, 161 kern pairs, a real `.notdef`, and `ss01` for a slashed zero.
- Metrics: 1000 upm, cap 700, x-height 500, ascender 880, descender −240.
- Live specimen: `/brand/font-specimen.html`. Source: `scripts/circuit-font.py`. Verification: `python3 scripts/verify-font.py` (or `bun run font:verify`).
- License: GPL-3.0-only, the same license as the repository.

## Commands

| Command                | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `bun run dev`          | Browser development, using Bun + Vite                |
| `bun run build:web`    | Type-check and build static `dist/`                  |
| `bun run preview`      | Serve the production build locally                   |
| `bun run typecheck`    | Strict web and desktop type checking                 |
| `bun run test`         | Bun unit tests for the production TypeScript modules |
| `bun run test:e2e`     | Playwright integration/responsive/touch tests        |
| `bun run font:build`   | Rebuild `REEOCircuitDisplay.ttf` (fontTools)         |
| `bun run font:verify`  | Check coverage, tables and features; run OTS         |
| `bun run lint`         | Oxlint and Biome, no formatting                      |
| `bun run format`       | Format with Prettier only                            |
| `bun run check`        | Types, both linters, formatting, and unit tests      |
| `bun run desktop:dev`  | Build and open the Electron app                      |
| `bun run desktop:pack` | Package for the current desktop OS                   |

Install a Playwright browser before the first end-to-end run:

```sh
bunx playwright install chromium
bun run test:e2e
```

## Deploy to Vercel

Import this repository into a Vercel project, keeping the repository root as the project root. `vercel.json` specifies Bun installation, the Vite build, `dist/`, cache policies, and browser security headers. The deployment build also verifies generated asset references. No environment variables are needed for the web app. Alternatively run `bunx vercel` from your own authenticated environment.

This repository is **configured for Vercel**, not already deployed by these changes. The static site has no cloud database, authentication, or cross-device synchronization. Existing optional WebSocket collaboration requires a separately maintained server; no server is bundled or deployed here.

For the complete dashboard/CLI setup, preview and production deployment steps, custom domains, caching, security policy, and troubleshooting, see [the Vercel deployment guide](docs/VERCEL.md).

## Native apps and releases

See [platform build instructions](docs/PLATFORMS.md). Desktop CI is manual and produces Windows, Linux, and macOS artifacts. Mobile CI is manual and produces an Android debug APK and an iOS simulator app. These are not signed app-store releases.

## Architecture and migration

This is an **incremental modernization, not a from-scratch UI rewrite**:

- `app/`: original HTML, CSS, classic-script simulator, and assets.
- `app/css/reeo.css`: small additive responsive/RTL/accessibility layer.
- `src/`: strict TypeScript platform contracts, local storage, i18n, bounded simulation work loop, safe arithmetic, and board-validation boundary.
- `electron/`: strict TypeScript desktop host and narrow preload bridge.
- `capacitor.config.ts`: native mobile shells using the same `dist/`.
- `vite.config.ts`: preserves classic-script ordering and compiles the typed platform bootstrap.
- `tests/`: real-browser checks against the original editor and gates.

The approximately 9,000-line original editor is **not yet entirely TypeScript**. Its renderers, component classes, advanced dialogs, and globals remain JavaScript to preserve behavior while their boundaries are migrated. New code is strictly typed; `satisfies`, discriminated unions, literal locale keys, type-only imports, typed DOM APIs, and `unknown` validation are used where appropriate. We deliberately do not add Solid/React/TanStack just to redraw an already working interface.

See the [modernization audit](docs/MODERNIZATION.md) for completed work, compatibility constraints, and remaining work. Prettier and the new linters deliberately exclude the untouched legacy JavaScript to avoid a misleading whole-repository lint claim or a noisy bulk rewrite.

## Credits and license

REEO is derived from **BOOLR by Gees Brouwer**. The original project attribution and GPLv3 licensing are retained. The REEO identity does not remove the original authors' credit. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
