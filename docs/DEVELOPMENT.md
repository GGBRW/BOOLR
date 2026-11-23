# Development guide

This guide gets a new developer from a clean checkout to a tested change. Read [Architecture](ARCHITECTURE.md) first if you need the big picture.

## Prerequisites

| Tool                   | Version                 | Needed for                                                            |
| ---------------------- | ----------------------- | --------------------------------------------------------------------- |
| [Bun](https://bun.sh)  | ≥ 1.3 (repo pins 1.4.5) | install, dev server, build, unit tests, scripts                       |
| Node.js                | ≥ 22.12                 | alternative tooling and some editors; Bun remains the package manager |
| Git                    | current                 | contribution workflow                                                 |
| Python 3 + `fonttools` | 3.10+                   | only `font:build` / `font:verify`                                     |
| Playwright Chromium    | installed by command    | end-to-end tests                                                      |
| JDK 21 + Android SDK   | current                 | Android builds only                                                   |
| macOS + Xcode          | current                 | iOS builds only                                                       |

Desktop packaging normally downloads an Electron binary during `bun install`. In a web-only/offline environment set `ELECTRON_SKIP_BINARY_DOWNLOAD=1` before installing; desktop commands will not work there.

## Setup

```bash
git clone https://github.com/abdou-da0wew/REEO.git
cd REEO
bun install
bunx playwright install chromium
bun run dev
```

Open the printed URL (default `http://localhost:5173`). The dev server binds `0.0.0.0` so it also works from a phone on the same network, a container port forward, or an Arena preview.

For a production-like check:

```bash
bun run build
bun run preview
# or serve the static output
python3 -m http.server 5180 --directory dist
```

`bun run dev` uses Vite with `app/` as the root. There is no router and no React/Vue/Solid runtime: the page is one HTML document plus classic scripts and the typed bootstrap.

## Everyday commands

| Command                                 | What it does                                                |
| --------------------------------------- | ----------------------------------------------------------- |
| `bun run dev`                           | Vite dev server on `0.0.0.0`                                |
| `bun run build`                         | Typecheck, then build `dist/`                               |
| `bun run build:vercel`                  | Build + verify built references/files                       |
| `bun run preview`                       | Serve the production build                                  |
| `bun run check`                         | Typecheck + Oxlint + Biome + Prettier check + unit tests    |
| `bun run test`                          | `bun:test` unit specs in `src/`                             |
| `bun run test:e2e`                      | Playwright suite (starts a dev server unless one is reused) |
| `bun run lint`                          | Oxlint + Biome                                              |
| `bun run format`                        | Prettier write                                              |
| `bun run verify:web`                    | Assert `dist/` contains required scripts/assets             |
| `bun run desktop:dev`                   | Build + compile Electron + launch                           |
| `bun run desktop:pack`                  | Build + package installers                                  |
| `bun run mobile:android` / `mobile:ios` | Build + Capacitor sync + native assets                      |
| `bun run mobile:assets`                 | Generate native icons/splash from `assets/native`           |
| `bun run font:build` / `font:verify`    | Build/verify the REEO Circuit font                          |

`check` is the required pre-commit gate. It does **not** run Playwright; run `test:e2e` when touching interaction, layout, or persistence.

## Repository map

```text
app/                  legacy runtime, markup, CSS, images, fonts
  index.html          the single page
  js/                 classic scripts (global scope)
  css/                original UI styles; reeo.css for the wordmark/system additions
src/                  typed bootstrap, validation, help, i18n, diagnostics, interaction
tests/                Playwright end-to-end specs
scripts/              build/verification/native-asset/font scripts
electron/             main process + preload bridge
public/               brand assets, Phosphor icons, shared fonts
assets/native/        source icons/splash for native shells
data/                 checked-in default custom-component library
saves/                checked-in empty saves folder
docs/                 this documentation set
.github/workflows/    CI, desktop, mobile workflows
```

Detailed module responsibilities are in [Architecture](ARCHITECTURE.md#typed-runtime-src).

## Coding standards

- **TypeScript is strict.** `tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax`, and `erasableSyntaxOnly`.
  - No `enum`, `namespace`, or constructor parameter properties (`erasableSyntaxOnly`).
  - Import types with `import type`.
  - Handle `undefined` from array/index access.
  - Optional properties must be omitted, not set to `undefined`.
- **Prettier** is the only formatter: 2 spaces, single quotes, semicolons, 100-column width, trailing commas everywhere, LF. Do not hand-format TS/JSON.
- **Biome + Oxlint** are the linters; both reject explicit `any`. `app/**` is intentionally outside their configured lint globs; legacy JavaScript is covered by tests, not static linting.
- Keep the existing visual language. Reuse dialog, button, menu, and color-picker classes; do not introduce a new palette or parallel component library.
- Prefer small modules and pure functions for new logic (`src/expression.ts`, `src/geometry.ts`, `src/diagnostics.ts` are examples). Put DOM installation in an `install*` function.
- Do not add dependencies casually. Runtime dependencies are intentionally minimal (`@capacitor/core`, Phosphor icon assets).

## Working on the application modules

### Typed code (`src/`)

- Add a module or extend an existing one.
- If it must talk to legacy globals, add a matching `declare let/function` in the consuming module (see `runtime.ts`/`interaction.ts`) and keep the type narrow.
- Expose only what classic scripts need on `window`, and document it in the architecture global table.
- Add unit tests for pure logic; add Playwright coverage if the behavior reaches the UI.

### Editor modules (`src/app/`)

- These files are TypeScript classic scripts that share one global scope. Do not add
  ECMAScript `import`/`export` syntax or load them as `type="module"`; add the file to
  `src/legacy-modules.ts` instead.
- Load order is the manifest order. Functions may be defined later than first reference
  only when the reference runs at event time; top-level class extends and registries must
  appear after their dependencies.
- Keep files under roughly 300 lines and name them by responsibility. Split a growing
  canvas, dialog, or component family into a new sibling file rather than appending.
- Run `bun run check` and the e2e suite after any change to components, canvas, keyboard,
  persistence, or `src/interaction.ts`.
- If a function must be called from typed code, keep the global bridge name stable and
  update the narrow `declare` in the consumer. Prefer moving new logic into a typed module
  and calling it from the editor module.
- `src/app/**` currently uses `// @ts-nocheck` while legacy behavior is migrated. Do not
  add new `any`-heavy code outside that boundary.

## Adding a component

A component is not done when it draws. It must exist in **all** of these places:

1. **Class** in a focused `src/app/components/*.ts` file extending `Component`, with
   `input`/`output` ports, `properties`, and `update()`/`dispose()` as needed. Append the
   file to `src/legacy-modules.ts` after `component.ts` and before `persistence`.
2. **Constructor registry** in `src/app/persistence/constructors.ts` and the TS allowlist
   in `src/board.ts` (`constructors`).
3. **Toolbar/picker** markup in `app/partials/workspace.html` and `src/app/ui/toolbar.ts`
   behavior. The picker is a list of slots; follow an existing entry rather than adding a
   separate picker style.
4. **Body rendering** in `src/rendering.ts` (`switch`/lookup by constructor name).
5. **Circuit symbol** in `src/icons.ts` (`circuitPaths` key, fallback symbol).
6. **Help copy** in `src/help-content.ts`: `id`, localized title/description/wiring/experiment/caution, and any recipe references.
7. **Translation** in `src/i18n/` / `src/legacy-messages.ts` for dynamic strings and dialogs.
8. **Board validation** limits (pins, properties) if the component adds arrays or unusual fields.
9. **Tests**:
   - unit test for pure behavior if extracted,
   - Playwright test that places it via the real UI, wires it, and asserts signal behavior,
   - serialization round-trip if its `data` is nontrivial,
   - localization coverage if the help entry is user-facing.

Checklist questions:

- Does deleting the component cancel timers/audio and dispose nested state?
- Does it survive save/load and copy/paste?
- Does it work inside a Custom component?
- Does it have a sensible default size, pin side/position, and name length?
- Does the renderer work at low zoom and in RTL?
- Is an unconnected input’s `0` behavior acceptable and documented?
- Does it behave when paused/resumed?

Avoid adding a component that only differs by color/style; differentiate by behavior, pins, or a clear teaching purpose.

## Adding or changing a dialog/screen

1. Reuse the existing `.dialog`/`.menu` markup patterns and CSS classes. Do not invent a second modal system.
2. Give the surface a stable id and register it with `src/overlays.ts` if it should participate in “one popup at a time,” outside dismissal, Escape, and focus restoration.
3. Place it with `src/geometry.ts` (`positionPopup`) rather than hard-coded coordinates; check viewport flipping near edges.
4. Add every user-facing string to all three locales. No inline English fallbacks in new UI.
5. Ensure it closes on outside pointer-down and `Escape` **without applying values**.
6. Measure it at 320 px, 390 px, tablet, and desktop; check RTL and Arabic line wrapping.
7. Add a Playwright test for opening, dismissing, and (if applicable) committing.

The home screen is deliberately not a dashboard: it exposes board actions, board list, settings, quit, language, credit, and resume. Do not add editor controls back to it.

## Internationalization workflow

- Locale type: `'en' | 'ar' | 'arz'`.
- New dynamic UI: add a key to the typed dictionary and call `window.reeoI18n.t(key)` or the local `t` helper.
- New legacy prose: add a translation to `legacy-messages.ts`; keep the original English key stable.
- Help content uses per-locale tuples/arrays. Every locale must be filled; tests reject Arabic entries that are empty or still mostly Latin.
- Do not translate commands, file extensions, constructor names, coordinates, or user-authored names.
- Test by switching to `ar` and `arz`, reloading, and signing in RTL. Check `html[dir]`, no horizontal overflow, and LTR technical terms.
- Use the bundled IBM Plex Sans Arabic for Arabic and Alan Sans for English; do not add remote font URLs (CSP and offline builds).

## Modifying the board format

Backward compatibility matters: people have exported boards.

- Add new fields optionally; keep reading old 10- and 11-field wire tuples.
- Validate every new field in `src/board.ts` (type, bounds, allowlist).
- Keep `decodeBoard` non-executable; never parse with `eval`.
- Update `stringify`/`parse` symmetrically.
- Add a round-trip test in Playwright (`logic-audit.spec.ts`) and a unit test for the validator.
- If a constructor name changes, add a migration alias instead of dropping old boards.

## Storage rules

- Use `src/storage.ts` (or `window.reeo.storage`) for board/custom-component persistence; do not touch `localStorage` directly from new code unless you are adding an explicitly namespaced preference.
- Paths are restricted to the storage adapter’s two shapes. Do not add arbitrary path support.
- Preferences persist under `reeo.*`; they can be cleared by the settings action.
- Always handle quota/serialization errors and surface a localized message.
- Never claim a save succeeded without checking the underlying `setItem`.

## Simulation rules

- Update order is queue-based; do not assume synchronous propagation through the whole graph.
- Any timer must be cancelable and guarded by a disposal flag/generation.
- Respect the tick budget; do not add unbounded loops inside `update()`.
- An unconnected input reads `0`; state that in help when it matters.
- Test rising-edge vs. level behavior explicitly for counters/latches.
- Pause freezes queue processing, not the timers that enqueue work.

## Testing your change

Minimum before a PR:

```bash
bun run check
bun run build:vercel
bun run test:e2e
```

Then manually verify the real UI at desktop and phone widths in all three locales for visual changes. See [Testing](TESTING.md) for the harness, coverage, and known gaps.

## Debugging

- **Browser DevTools** is the primary tool; classic scripts are served unminified in dev.
- The canvas element and legacy globals (`components`, `wires`, `updateQueue`, `offset`, `zoom`) are inspectable from the console.
- `F3` toggles the debug overlay, which reports render/tick counters.
- `window.reeo` exposes `version`, `storage`, import/export, and quit.
- `Shift+T` opens the in-app console; use it to inspect component IDs/positions (`findComponent`) without mutating.
- To inspect a saved board: DevTools → Application → Local Storage → `reeo.files.v1:saves/...`. Copy the wrapper JSON and import it into a scratch profile.
- To reproduce an import failure, use a temporary board and read the thrown message in the console; invalid imports must leave the current board intact.
- For touch bugs, use DevTools device emulation with touch enabled; pointer events are synthesized once into the legacy mouse pipeline.
- For a blank production build, compare `bun run dev` vs. `bun run preview`, then run `verify:web` and inspect `dist/`/the Network panel.

## Common development errors

| Symptom                                          | Fix                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Editor module is not running                     | Add it to `src/legacy-modules.ts` in dependency order; classic scripts must not use `import`/`export`   |
| Type error on an optional field                  | Omit it; do not assign `undefined` (`exactOptionalPropertyTypes`)                                       |
| Build succeeds but page is blank in Electron     | Run `bun run build` before `desktop:dev`/`desktop:pack`; Electron loads `dist/`                         |
| e2e cannot launch Chromium                       | Install Playwright Chromium and the Linux shared libraries; use `CHROMIUM_PATH` if using a custom build |
| Arabic test fails with Latin text left over      | Add the missing translation rather than loosening the test                                              |
| A component works alone but breaks inside Custom | Check port recreation on parse and disposal of nested timers                                            |
| A save silently does nothing                     | Check storage quota and whether the path passed the adapter’s allowlist                                 |
| Prettier failure in legacy HTML/CSS              | Prettier ignores most `app/**` markup/CSS; format those by hand to match the file                       |

## Submitting a change

1. Branch from `master` with a focused name.
2. Keep the change scoped; do not mix documentation, refactors, and behavior changes without a reason.
3. Use clear commit messages; commits must be your own work with no bot/co-author trailers.
4. Run the checks above and include the commands/results in the PR.
5. Fill the PR template: what changed, why, user-visible effects, screenshots for UI, test evidence, and known gaps.
6. Do not commit build output, `node_modules`, saves, certificates, or generated native projects.
7. If you change user-facing behavior, update the relevant page in `docs/` in the same PR.

See [GitHub workflow](GITHUB.md) for the public contribution path and [Releasing](RELEASING.md) for maintainers.
