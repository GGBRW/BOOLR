<p align="center">
  <img src="public/brand/reeo-mark.svg" width="112" height="112" alt="REEO circuit-R mark">
</p>

<h1 align="center">REEO</h1>

<p align="center"><strong>Digital logic. Limitless curiosity.</strong></p>

<p align="center">
  A browser, desktop, and mobile logic simulator that keeps the original BOOLR editor —<br>
  and makes it clearer, safer, bilingual, and easier to learn.
</p>

<p align="center">
  <a href="https://reeo.vercel.app">Open the app</a> ·
  <a href="docs/USER-GUIDE.md">User guide</a> ·
  <a href="docs/COMPONENTS.md">Components</a> ·
  <a href="docs/DEVELOPMENT.md">Develop</a>
</p>

---

## What it is

REEO is a grid-based digital logic playground. Place gates, switches, clocks, counters, displays, ROMs, and custom subcircuits; wire their pins together; and watch binary signals propagate.

This is an **incremental modernization of BOOLR, not a UI rewrite**. The dark main menu, white grid canvas, gate toolbar, component behavior, context menus, console, and `.board` format remain recognizable. The work around them is new:

- **Three platforms** — static browser build, Electron desktop, Capacitor Android/iOS.
- **A typed safety boundary** — strict TypeScript for storage, board validation, scheduling, expressions, rendering, help, localization, and input normalization.
- **Three languages** — English, العربية, and مصري, with RTL, localized dialogs/help/diagnostics, and a bundled Arabic font.
- **Teaching tools** — searchable component guide, eight worked circuits, dashed ghosts, structural circuit checks, contextual tips, and a pinned recipe dock.
- **Real touch support** — Interact/Move/Pan/Select tools, pinch and two-finger navigation, long press, double tap, and responsive dialogs.
- **Portable boards** — a local board library plus validated `.board` import/export. No account, database, or backend.

It is **not** an analog simulator, a formally verified HDL, a cloud collaboration service, or a React/Solid rewrite.

## Try it

- **Hosted build:** <https://reeo.vercel.app>
- **Local:** follow the quick start below.

## Quick start

Requires **[Bun](https://bun.sh) ≥ 1.3** (the repo pins 1.4.5). Node 22.12+ is useful for native tooling.

```bash
git clone https://github.com/abdou-da0wew/REEO.git
cd REEO
bun install
bun run dev
```

Open the printed URL (default `http://localhost:5173`). The dev server binds `0.0.0.0`, so it also works from a phone on your network or a container preview.

Browser-only setup without downloading Electron:

```bash
ELECTRON_SKIP_BINARY_DOWNLOAD=1 bun install
bun run dev
```

Before the first e2e run:

```bash
bunx playwright install chromium
bun run test:e2e
```

### Your first circuit

1. **NEW BOARD** → name it → **Create**.
2. Toolbar **I/O → Input**, then click the grid.
3. Toolbar **`!`** (NOT), place it to the right.
4. Drag from the input’s **black output pin** to the gate’s **white input pin**.
5. Add **I/O → LED**, wire the gate output to it.
6. Click the input to toggle `0`/`1`.
7. `Ctrl+S` to save; **Export board** for a portable backup.

Full walkthrough: [User guide](docs/USER-GUIDE.md#your-first-circuit).

> **Your boards are local.** They live in this browser profile or app installation, not in an account. Clearing site/app data, using a different origin, or uninstalling can remove them. Export backups. Old BOOLR `saves/` files are not migrated automatically — import each `.board` file.

## Feature tour

| Area        | What you can do                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| Canvas      | Place, select, move, rotate, resize, copy/paste, delete, undo/redo, pan, zoom, fit                                |
| Wiring      | Fan-out, branches, wire colors, port editing, straight segments, waypoints                                        |
| Logic       | Input, Output, Button, Constant, NOT, AND, OR, XOR, Delay, Clock, Counter, LED, Display, ROM, Debug, Beep, timers |
| Reuse       | Componentize a selection, open/edit custom circuits, save components to a local library                           |
| Learning    | Field guide search, 19 component entries, 8 recipes, ghosts, diagnostics, contextual tips, tutorial               |
| Console     | Variables, lookup by name/ID/position, remove/edit properties, expressions, start/pause                           |
| Persistence | Autosave, local board library, rename/delete, export/import, empty-board saving                                   |
| Languages   | English, Modern Standard Arabic, Egyptian Arabic; persistent RTL                                                  |
| Platforms   | Browser, Electron (Linux/Windows/macOS), Capacitor (Android/iOS)                                                  |
| Input       | Mouse, keyboard, pen, touch; explicit coarse-pointer controls                                                     |

Pin-level reference: [Components](docs/COMPONENTS.md). Shortcuts: [Controls](docs/SHORTCUTS.md). Console: [Console](docs/CONSOLE.md).

## Documentation

| I want to…                       | Read                                                                |
| -------------------------------- | ------------------------------------------------------------------- |
| Learn the whole app              | [User guide](docs/USER-GUIDE.md)                                    |
| Look up pins/properties          | [Component reference](docs/COMPONENTS.md)                           |
| Find a shortcut or touch gesture | [Controls](docs/SHORTCUTS.md)                                       |
| Use the console/variables        | [Console](docs/CONSOLE.md)                                          |
| Fix a problem                    | [Troubleshooting](docs/TROUBLESHOOTING.md)                          |
| Understand the code              | [Architecture](docs/ARCHITECTURE.md)                                |
| Set up and contribute            | [Development](docs/DEVELOPMENT.md), [Contributing](CONTRIBUTING.md) |
| Run/write tests                  | [Testing](docs/TESTING.md)                                          |
| Build native apps or release     | [Platforms](docs/PLATFORMS.md), [Releasing](docs/RELEASING.md)      |
| Deploy the web build             | [Vercel](docs/VERCEL.md)                                            |
| Configure GitHub                 | [GitHub guide](docs/GITHUB.md)                                      |
| Understand the identity/type     | [Brand](docs/BRAND.md)                                              |
| See audit records                | [Documentation index](docs/README.md#audit-records)                 |

## Commands

| Command                                 | Purpose                                                    |
| --------------------------------------- | ---------------------------------------------------------- |
| `bun run dev`                           | Vite dev server on `0.0.0.0`                               |
| `bun run build`                         | Typecheck + build `dist/`                                  |
| `bun run build:vercel`                  | Build + verify built files/references                      |
| `bun run preview`                       | Serve the production build                                 |
| `bun run check`                         | Typecheck, Oxlint, Biome, Prettier, docs links, unit tests |
| `bun run test`                          | `bun:test` specs in `src/`                                 |
| `bun run test:e2e`                      | Playwright suite                                           |
| `bun run docs:verify`                   | Internal documentation link check                          |
| `bun run lint` / `format`               | Lint / Prettier                                            |
| `bun run desktop:dev`                   | Build + open Electron                                      |
| `bun run desktop:pack`                  | Package for the current desktop OS                         |
| `bun run mobile:android` / `mobile:ios` | Build + sync Capacitor                                     |
| `bun run mobile:assets`                 | Regenerate native icons/splash                             |
| `bun run font:build` / `font:verify`    | Build/verify REEO Circuit Display                          |

Environment details, prerequisites, and troubleshooting are in [Development](docs/DEVELOPMENT.md). Native builds are documented in [Platforms](docs/PLATFORMS.md).

## Project structure

```text
app/                 original page, classic-script simulator, CSS, fonts, images
src/                 strict TypeScript boundary (runtime, board, storage, i18n, help…)
tests/               Playwright specs against the real app
scripts/             build verification, docs links, native assets, font tooling
electron/            typed main process + narrow preload bridge
public/              brand assets, Phosphor icons, shared fonts
assets/native/       source icons/splash for Android/iOS
docs/                user and developer documentation
.github/             workflows, issue/PR templates, CODEOWNERS, Dependabot
```

`app/index.html` is the single page. Vite keeps the original classic-script load order and injects a compiled TypeScript bootstrap; the legacy canvas/model remains JavaScript. See [Architecture](docs/ARCHITECTURE.md) for the module map, globals bridge, board format, simulation flow, and known debts.

## Testing and honest limits

The automated suite covers gate truth tables, sources/sinks, counters, ROM slicing, fan-out, pause, save/import round trips, custom components, timers, touch gestures, dialogs/overlays, localization/RTL, the field guide, layout measurements, production CSP boot, and the wordmark/font.

**Not certified:** Safari/Firefox/WebKit, physical iOS/Android devices, screen readers or full keyboard-only canvas editing, signed/notarized installers, real audio output, long-duration stress boards, or the optional collaboration server (no server is bundled). The repository’s GitHub `verify` CI can be blocked by an account billing lock; Vercel checks are separate.

Details and the latest recorded baseline: [Testing](docs/TESTING.md). Product-level issues: [Troubleshooting](docs/TROUBLESHOOTING.md).

## Deploy

Vercel is the configured browser target. `vercel.json` sets:

```text
install: ELECTRON_SKIP_BINARY_DOWNLOAD=1 bun install --frozen-lockfile
build:   bun run build:vercel
output:  dist
```

No environment variables are required. The static app has no cloud database or authentication. The optional legacy WebSocket collaboration path requires a server you host and secure yourself; none is deployed here. See [Vercel guide](docs/VERCEL.md).

## Contributing

- Read [Contributing](CONTRIBUTING.md) and the [Development guide](docs/DEVELOPMENT.md).
- Preserve the existing REEO interface and visual language; do not introduce a new framework or design system.
- Run `bun run check`, `bun run build:vercel`, and `bun run test:e2e`.
- Add all three locales for new user-facing text.
- Report security issues privately via [SECURITY.md](SECURITY.md), not a public issue.
- Questions and bug-report guidance: [Support](SUPPORT.md).

Desktop and mobile workflows are manual and produce unsigned artifacts. See [Releasing](docs/RELEASING.md).

## Identity and type

The wordmark joins the original circuit-R image to live `EEO` set in **REEOCircuitDisplay.ttf**. The font is a real 359-glyph typeface with tabular figures, kerning, and a slashed-zero feature. Specimen: [`public/brand/font-specimen.html`](public/brand/font-specimen.html). Build/verify with `bun run font:build` and `bun run font:verify` (Python + fontTools). Details: [Brand guide](docs/BRAND.md) and [`public/brand/README.md`](public/brand/README.md).

## Credits and license

REEO is derived from **BOOLR by Gees Brouwer**. Original attribution and GPLv3 licensing are retained; the REEO identity does not erase the original authors’ credit.

- License: **GPL-3.0-only** — [LICENSE](LICENSE)
- Attribution: [NOTICE](NOTICE)
- Maintainer: [@abdou-da0wew](https://github.com/abdou-da0wew)
