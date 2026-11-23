# Architecture

REEO is a browser circuit editor with a TypeScript-only source tree. The original
canvas interaction model was migrated from classic scripts into small TypeScript
modules that still share one browser global scope; the newer typed layer supplies
validation, persistence adapters, diagnostics, help, localization, overlays,
layout, rendering helpers, and the platform bridge.

There is no JavaScript source file in the repository. `src/**/*.ts` is compiled by
Vite, `tsc --noEmit`, Bun, and Playwright; `app/index.html` is assembled from HTML
partials; CSS is split into small partials imported by three entry stylesheets.

## Source layout

```text
app/
  index.html                12-line shell with @include placeholders
  partials/                 head, editor chrome, home menu, tutorial, workspace, overlays
  css/                      small component styles + entry stylesheets that @import partials
src/
  runtime.ts                typed browser bridge compiled into <head>
  legacy-modules.ts         ordered list of migrated editor modules injected into <body>
  app/
    boot/                   version, startup, unload hooks
    model/                  board graph, Component base, mutations, serialization glue
    components/             one family per file: gates, io, display, seven-segment, wire…
    editor/                 canvas split by event/concern, keyboard, clipboard, undo, waypoints
    persistence/            localStorage, legacy constructors, parser, board files
    ui/                     menus, dialogs, console, toolbars, context menus, tips
    audio/ net/             Web Audio and optional collaboration socket
  help/                     guide data, help rendering, panel and dock
  ghosts/                   guide diagrams, placement scoring, overlay drawing
  i18n/                     locale dictionaries and DOM translator
  messages/                 audited legacy interface copy, split by area
  *.ts                      typed core: board, circuit DSL, diagnostics, rendering, release…
tests/                      Playwright end-to-end suites
docs/                       architecture, development, testing and release notes
```

### Size and naming rules

- No source file exceeds roughly 300 lines. Split by responsibility, not by line count.
- File names describe the responsibility. Avoid iteration suffixes (`foo2`, `final`, `copy`).
- Every source file is Prettier-formatted with the repository configuration.
- New code is strict TypeScript. `src/app/**` still carries `// @ts-nocheck` only while
  individual legacy modules are migrated; the compiler and linters still parse them.

## Build pipeline

| Piece                | Location                                     | Role                                                                       |
| -------------------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| Vite config          | `vite.config.ts`                             | root `app`, relative base, `dist/` output, `0.0.0.0` dev server            |
| Typed bootstrap      | `src/runtime.ts`                             | esbuild IIFE injected at `head-prepend`                                    |
| Editor modules       | `src/legacy-modules.ts`                      | ordered list injected as ordinary `<script>` blocks at the end of `body`   |
| HTML partial include | `vite.config.ts`                             | expands `<!-- @include partials/file.html -->` before Vite parses the page |
| CSS entries          | `app/css/reeo.css`, `style.css`, `popup.css` | `@import` partials in cascade order                                        |
| Web verification     | `scripts/verify-web.ts`                      | checks built asset references and required files in `dist/`                |
| Desktop build        | Bun + `electron/`                            | bundles the Electron main/preload processes into CommonJS                  |

`bun run build` runs `tsc --noEmit` first. `bun run build:vercel` adds the web
verification step. `closeBundle` copies only `img/` and `fonts/`; editor code is
already inlined into `index.html`, so `dist/` contains no loose runtime scripts.

## Runtime boot

`src/runtime.ts` is the only true ES module bundle. It exposes the typed bridge
(`window.reeo`, `window.reeoI18n`, `window.reeoTick`, …), installs language and help
surfaces, and defines the `require` shim used by the desktop-shaped persistence
adapter.

Every file in `src/legacy-modules.ts` is injected as its own classic script in the
listed order. They intentionally share the global lexical environment, so top-level
`const`, `class`, and `function` declarations remain visible across files exactly as
the original `app/js` scripts were. The last entry is `src/app/boot/startup.ts`; it
waits one task, restores local state, and sets `document.body.dataset.reeoReady`.

When adding a module:

1. Create a narrowly named file under the right `src/app` directory.
2. Append it to `src/legacy-modules.ts` at the position required by initialization.
3. Keep shared global names stable, or update every consumer and `declare` in `src/`.
4. Run `bun run typecheck`, `bun run check`, and the Playwright suite.

## Global bridge

The editor modules expose a small set of legacy globals used by inline markup and
the typed layer: `components`, `wires`, `constructors`, `offset`, `zoom`, `mouse`,
`settings`, `dialog`, `contextMenu`, `mainMenu`, `reeoConsole`, `tutorial`,
`save`, `openFile`, `drop`, `createNewBoard`, `readFile`, `getLocalStorage`,
`setLocalStorage`, `saveCustomComponents`, and `beep`.

Typed consumers declare only the members they use (`declare const components` in
`board.ts`, `help/panel.ts`, `ghosts/overlay.ts`, and so on). Keep those declarations
narrow and in sync with the implementation. New typed code should import a real
module; use the global bridge only at the legacy boundary.

## Board model and components

- `src/app/model/board-state.ts` owns the live `components`/`wires`/`path` arrays.
- `src/app/model/component.ts` defines the `Component` base class. Custom drawing
  lives in `component-draw.ts` so neither file approaches the size limit.
- `src/app/components/*` contains one family per file. Families are deliberately
  independent: ports, rotation, hit boxes, and serialization come from the base class.
- `src/board.ts` validates imported data, `src/circuit-dsl.ts` builds boards from
  the HDL, and `src/diagnostics.ts` performs structural checks.
- Component identity uses the `IdGenerator` in `src/app/model/id.ts`.

Adding a component means updating the class module, `src/app/persistence/constructors.ts`,
the picker markup in `app/partials/workspace.html`, `src/rendering.ts`, `src/icons.ts`,
`src/help/*`, translations where needed, and tests.

## Canvas and interaction

`src/app/editor/` splits the original canvas script by concern:

- `canvas.ts` — canvas, context, camera and grid state
- `canvas-draw.ts` — frame loop
- `canvas-mousedown.ts`, `canvas-mousemove.ts`, `canvas-mouseup.ts` — event dispatchers
- `canvas-finish-*.ts` — selection, drag and connection completion helpers
- `canvas-dblclick.ts`, `canvas-window.ts` — remaining native events
- `keys.ts`, `clipboard.ts`, `undo.ts`, `waypoints.ts` — editor services

`src/interaction.ts` normalizes pointer/touch input into the same event pipeline.
Do not add a second gesture path; extend the normalized one.

## Persistence

`src/app/persistence/` is split by format responsibility:

| Module                 | Responsibility                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| `storage.ts`           | localStorage availability, save/load of UI settings              |
| `constructors.ts`      | constructor registry used by import/export                       |
| `parse.ts`             | legacy board parser, colors, ports, custom-component restoration |
| `files.ts`             | `saveBoard`, `openFile`, `readFile` façade                       |
| `saves.ts`             | desktop-shaped save library through the `require('fs')` shim     |
| `custom-components.ts` | saved custom-component library                                   |

`src/storage.ts` provides the typed adapter used by Electron and the browser
fallback. Unknown formats and invalid colors degrade to safe defaults; never
execute imported data.

## Simulation and rendering

`src/app/model/component-updates.ts` runs the 16 ms loop and calls
`window.reeoTick(updateQueue, pauseSimulation)`. `src/simulation.ts` owns the
scheduler contract and budget. `src/rendering.ts` draws component bodies;
`src/app/editor/canvas-draw.ts` composes the scene; `src/app/ghosts/` draws the
click-through guide blueprint. `src/logic-expression.ts` is the only expression
evaluator; `new Function` and `eval` are forbidden by CSP and by
`src/runtime-safety.test.ts`.

## UI surfaces

- `src/app/ui/dialog-*.ts` — dialog shell, board actions, editors
- `src/app/ui/edit-dialog-*.ts` — shared field builders and component/port forms
- `src/app/ui/context-menu/` — context-menu construction and action groups
- `src/app/ui/*.ts` — menus, console, toolbar, notifications, tutorials, tips
- `src/overlays.ts`, `src/help/`, `src/i18n/` — typed overlays, field guide, localization

HTML lives in `app/partials/`. `app/index.html` only assembles partials. When adding
a surface, prefer adding an element to the relevant partial and wiring behavior in a
module instead of growing the shell.

CSS is split into `app/css/reeo/`, `app/css/style/`, and `app/css/popup/`. The three
entry files contain only ordered `@import` statements and are linked from
`app/partials/head-content.html`.

## Security and deployment

The CSP forbids `unsafe-eval`; only inline scripts are allowed (`unsafe-inline`) for
the compiled application bundles. Board imports are validated before parsing.
`vercel.json` adds security headers and long-lived caching only for fingerprinted
`assets/`. `tests/deployment.spec.ts` checks boot and editing under the real policy.
`playwright.config.ts` uses `PLAYWRIGHT_PRODUCTION=1` for the production preview and
`PLAYWRIGHT_BASE_URL` to test an already running server.

## Board format

A board is `[components, wires]` with legacy-compatible component records. The parser
accepts the original 10-field tuple and the newer object form; positions start at index
7 of the old tuple. Colors are normalized to `[r, g, b]`, unknown constructors are
rejected, and malformed or oversized payloads are refused before any object is built.

## Typed runtime (src/)

`src/runtime.ts` and the adjacent typed modules are real ES modules bundled into the
page head. They own validation, i18n, the guide, overlays, rendering helpers, platform
integration, and the simulation scheduler. Import them normally; they never rely on
classic-script load order.

## Simulation flow

1. `src/app/model/component-updates.ts` starts a 16 ms interval.
2. The interval calls `window.reeoTick(updateQueue, pauseSimulation)`.
3. `src/simulation.ts` drains the bounded queue in dependency order, with a budget.
4. Component `update()` methods enqueue downstream work; `src/app/editor/canvas-draw.ts`
   paints the resulting values on the next animation frame.
5. Pausing stops queue draining but keeps pending work for resume.

## Local storage keys

| Key                   | Contents                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| `pwsData`             | Last board autosave and UI settings                                      |
| `reeo.locale`         | Selected locale (`en`, `ar`, `arz`)                                      |
| `reeo.contextualTips` | `on`/`off` preference for contextual advice                              |
| `reeo.files.v1:*`     | Desktop-shaped board and custom-component files through the storage shim |

Browser data is device-local, not account-backed. Clearing site data removes it; export
a `.board` backup first.

## Known transitional debt

- Legacy interface modules under `src/app/**` use `// @ts-nocheck` and file-level
  lint suppressions. They are split and organized, but not yet fully typed.
- Inline `on*` attributes remain in the HTML partials for the original controls.
  New controls should use `data-*` hooks and event listeners.
- `src/app/persistence/saves.ts` keeps its desktop `require('fs')` shape; the typed
  storage adapter is the portability boundary.
