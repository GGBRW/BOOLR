# Architecture

REEO is an **incremental modernization** of BOOLR. The original canvas editor and circuit model remain as classic scripts; a typed TypeScript layer supplies validation, storage, simulation scheduling, rendering helpers, diagnostics, help, localization, overlays, layout, and input normalization.

Understanding the two layers is the key to working on this repository.

```text
app/index.html
  ├─ <head> inlined esbuild bundle of src/runtime.ts   (typed boundary)
  ├─ body markup + dialogs + styles
  └─ classic scripts (original canvas model) in a fixed order
        components.js ─ localStorage2.js ─ canvas.js ─ componentUpdates.js
        undo.js ─ clipboard.js ─ keys.js ─ chat.js ─ variables.js ─ console2.js
        … ─ startup.js
```

At build time Vite uses `app/` as its root, injects the compiled TS bundle into the page head, builds `index.html` and CSS, then copies the traditional `app/js`, `app/img`, and `app/fonts` folders into `dist/`. `public/` is served/copied at the root.

## Build pipeline

| Piece               | Location                               | Role                                                                                              |
| ------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Vite config         | `vite.config.ts`                       | Root `app`, `base: './'`, `publicDir: '../public'`, output `../dist`, host `0.0.0.0`              |
| TS bootstrap        | `src/runtime.ts`                       | Bundled with esbuild (`iife`, `es2022`, minified) by a `transformIndexHtml` plugin                |
| Classic scripts     | `app/js/*.js`                          | Served in dev, copied verbatim in `closeBundle`; marked `vite-ignore` so Vite does not touch them |
| Version injection   | `app/index.html` inline script         | Sets the display version; `src/runtime.ts` exposes `window.reeo.version`                          |
| Web verification    | `scripts/verify-web.ts`                | Checks built asset references and required files in `dist/`                                       |
| Desktop compilation | `bun build` in package scripts         | Bundles `electron/main.ts`, `electron/preload.ts` to CommonJS in `electron-out/`                  |
| Native shell        | Capacitor + `scripts/native-assets.ts` | Copies `dist/` into Android/iOS and generates icons/splash                                        |

`bun run build` runs `tsc --noEmit` first, so a type error prevents a build. `bun run build:vercel` adds `verify:web`.

## Classic runtime (`app/js/`)

The scripts are not ES modules and share one global scope. **Load order matters.**

| Script                      | Responsibility                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `saves.js`                  | Filesystem-shaped board library; uses the `require("fs")` shim to the storage adapter |
| `savedCustomComponents.js`  | Read/write the saved custom-component library                                         |
| `mainmenu.js`               | Home screen, board naming, settings, first-run welcome                                |
| `components.js`             | `Component` base class, 19 component classes, `Wire`, ports, selection, componentize  |
| `localStorage2.js`          | Legacy `stringify`/`parse` format, board import/export helpers                        |
| `canvas.js`                 | Canvas input, camera, drawing, wire routing, ports, selection rectangle               |
| `componentUpdates.js`       | `setInterval(tick, 16)` → `window.reeoTick(updateQueue, pauseSimulation)`             |
| `undo.js`                   | Closure-based `undoStack`/`redoStack`                                                 |
| `clipboard.js`              | Copy/paste/delete and deep component cloning                                          |
| `keys.js`                   | Canvas keyboard map (after dialogs/overlays have handled their keys)                  |
| `chat.js`                   | Legacy collaboration chat surface                                                     |
| `variables.js`              | `variables`, `variableReferences`, `setVariable`, expression-backed edits             |
| `console2.js`               | Console parser, history, `inputHandler`, command implementations                      |
| `notifications.js`          | Bottom-left transient messages (auto-hide, max 4)                                     |
| `toolbar.js`                | Component shelf, picker, messages, truth-table popups                                 |
| `debug.js`                  | Debug overlay and timing counters                                                     |
| `audio.js`                  | Web Audio context and beep synthesis                                                  |
| `userList.js`               | Collaboration user list                                                               |
| `contextmenu2.js`           | Canvas context menu and its actions                                                   |
| `hover.js`                  | Hover balloon (poll-based) and toolbar tooltips                                       |
| `customComponentToolbar.js` | Subcircuit breadcrumb/edit/save bar                                                   |
| `componentInfo.js`          | Legacy component-info helper; **no caller** in app code (tests only)                  |
| `tips.js`                   | Tip toasts and contextual advice                                                      |
| `tutorial.js`               | Original tutorial show/hide                                                           |
| `dialogs.js`                | Welcome, new board, settings, confirm, color picker, ROM editor, truth tables, etc.   |
| `editDialogs.js`            | Component/port edit, size, delay, ROM, name forms                                     |
| `waypoints.js`              | Camera waypoints                                                                      |
| `socket.js`                 | Optional WebSocket collaboration; no server included                                  |
| `startup.js`                | Closing animation, load save files, first-run menu boot                               |

`app/index.html` also includes `mainmenu.js` inside the page and several inline scripts for the markup. Do not move scripts into a different order without checking initialization and event-handler capture.

### Why some code is still JavaScript

The typed layer is a **boundary**, not a rewrite. It declares the legacy globals it needs (`components`, `wires`, `offset`, `zoom`, `stringify`, `openSaveFile`, …) and installs behavior through exported functions. This keeps the original interaction model (and its quirks) intact while allowing new code to be strictly typed.

New behavior should generally go in `src/` unless it must hook deeply into a legacy class or the canvas event loop. If you edit legacy code, run the Playwright suite because the TS compiler does not check those files.

## Typed runtime (`src/`)

| Module               | Responsibility                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `types.ts`           | Shared interfaces: `Point`, `Component`, `WireLike`, `BoardFile`, `SavedBoard`, `StorageAdapter` |
| `runtime.ts`         | Bootstrap: storage, globals bridge, save/import/export, header wiring, autosave, fit/zoom        |
| `storage.ts`         | Narrow filesystem-shaped adapter over `Storage`; only saves and custom components paths          |
| `board.ts`           | Untrusted board decoding and structural validation                                               |
| `simulation.ts`      | `runTick` update-queue budget and saturation result                                              |
| `expression.ts`      | No-`eval` arithmetic parser for variables and edit fields                                        |
| `interaction.ts`     | Pointer Events → exactly-once legacy mouse events; touch tools, pinch, tap/hold/double-tap       |
| `gestures.ts`        | Distance, midpoint, anchored zoom math                                                           |
| `geometry.ts`        | Popup placement/flipping/clamping within the viewport                                            |
| `layout.ts`          | Responsive layout class/measurement and safe-area handling                                       |
| `overlays.ts`        | Popup manager: one open surface, outside dismissal, Escape, focus restoration                    |
| `rendering.ts`       | Typed component-body renderer used by the classic canvas                                         |
| `icons.ts`           | Phosphor UI icon lookup, per-type circuit symbols, tutorial diagrams                             |
| `i18n.ts`            | Locale install, `t()` messages, document `lang`/`dir`, persistence                               |
| `language-picker.ts` | Editor language menu                                                                             |
| `legacy-messages.ts` | Authored translations for legacy dialog/tutorial/console prose                                   |
| `help-content.ts`    | Component entries, recipes, basics, diagnostics copy                                             |
| `help.ts`            | Field-guide dialog, search, recipe dock, ghost toggling, contextual advice                       |
| `diagnostics.ts`     | Conservative structural findings for the current board                                           |
| `ghosts.ts`          | Dashed recipe reference renderer                                                                 |

### Window/global bridge

`runtime.ts` exposes the following intentionally:

| Global                                                   | Consumer / purpose                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `window.reeoTick`                                        | `componentUpdates.js` calls `runTick` every 16 ms                        |
| `window.reeoExpression`                                  | `variables.js` evaluates edit expressions                                |
| `window.reeoValidateCircuit`                             | `localStorage2.js` validates before parse                                |
| `window.reeoDrawComponentBody`                           | `canvas.js` draws typed bodies                                           |
| `window.reeoDrawComponentIcon` / `window.reeoCircuitSVG` | Toolbar/help icons                                                       |
| `window.reeoDrawGhost`                                   | Recipe ghosts rendered on the classic canvas                             |
| `window.reeoHelp.open`                                   | Header/help buttons                                                      |
| `window.reeoPositionPopup`                               | Legacy popup positioning                                                 |
| `window.reeoI18n`                                        | Locale getters/setters and `t()`                                         |
| `window.reeo`                                            | `version`, `storage`, `exportBoard`, `importBoard`, `importFile`, `quit` |
| `window.reeoDesktop`                                     | Present only when the Electron preload bridge is available               |
| `window.require`                                         | Restricted shim: only `fs` (storage) and `electron.remote.openDevTools`  |

The `require` shim is not a general Node bridge. It maps `fs` to the browser-local storage adapter and throws for every other module.

## Circuit model

- A **component** has `id`, `name`, `pos {x,y}`, `width`, `height`, `rotation`, `color`, `properties`, optional `value`, and arrays `input`/`output` of ports.
- A **port** has `id`, `name`, `pos {side,pos}` and `value`. `side`: `0` top, `1` right, `2` bottom, `3` left. `pos` is the offset along that side in grid units.
- A **wire** has `from`/`to` port references, `id`, `value`, `pos` (orthogonal path points) and `intersections`. Wires can branch through `input`/`output` child wires.
- Signals are numbers in practice `0`/`1`. Gates perform bitwise operations on their input values.
- `updateQueue` holds components whose state may have changed. `window.reeoTick` drains it with a budget.
- `dispose()` is required for timers/audio/custom internals when a component is removed or a board is cleared.

### Component classes

`Component` in `app/js/components.js` provides port creation, rotation, resizing, move helpers, and serialization-facing fields. Subclasses implement `update()` where needed. See [Components](COMPONENTS.md) for behavior and [Development](DEVELOPMENT.md#adding-a-component) for the extension checklist.

`Component.update()` implementations may call `this.emit`/queue helpers; the exact method names are in the base class. Follow an existing class rather than inventing a new update protocol.

Timers in `Clock`/`Delay` guard against disposal and stale timer generations. Any new asynchronous behavior must do the same, or a deleted component can keep updating the board.

## Simulation flow

```text
user action / timer
  → component input value changes
  → component.update()
  → wire propagation
  → updateQueue.push(downstream)
  → setInterval(16) → window.reeoTick(queue, paused)
  → runTick drains up to 10,000 entries
  → canvas draw loop renders state
```

`runTick` returns `{ updates, pending, saturated }`. Saturation is surfaced by diagnostics; it is not silently ignored. The 16 ms interval is a processing cadence, not a claim of real-time hardware accuracy.

Undo/redo is separate: structural edits push closures that reverse model mutations. Undo does **not** rewind timer clocks; deleting a clock cancels its timers, and undo restarts them.

## Board format

A portable file is a JSON object:

```json
{
  "name": "My board",
  "offset": { "x": 0, "y": 0 },
  "zoom": 100,
  "variables": { "period": 500 },
  "variableReferences": { "period": [] },
  "data": "[[...],[...]]"
}
```

`data` is a JSON **string** containing a three-element array:

```json
[
  [
    [
      "Input",
      {
        "id": 0,
        "name": "A",
        "pos": { "x": 0, "y": 0 },
        "width": 2,
        "height": 1,
        "rotation": 0,
        "color": "#000",
        "properties": {},
        "input": [],
        "output": [{ "id": 0, "name": "out", "pos": { "side": 1, "pos": 0 }, "value": 0 }]
      }
    ]
  ],
  [
    [
      0,
      0,
      1,
      0,
      [],
      [],
      "wire-id",
      0,
      [
        { "x": 2, "y": 0 },
        { "x": 3, "y": 0 }
      ],
      [],
      [136, 136, 136]
    ]
  ],
  [0, 0, 10, 10]
]
```

Index meanings:

| Index | Board array | Meaning                               |
| ----- | ----------- | ------------------------------------- |
| `0`   | outer       | Components: `[constructorName, data]` |
| `1`   | outer       | Wires (11-field current form)         |
| `2`   | outer       | Optional selection `[x, y, w, h]`     |

Current wire tuple (11 fields):

| Index | Field                                                    |
| ----- | -------------------------------------------------------- |
| 0     | source component index                                   |
| 1     | source output-port index                                 |
| 2     | destination component index                              |
| 3     | destination input-port index                             |
| 4     | child wires fed by this wire (indices)                   |
| 5     | child wires driven by this wire (indices)                |
| 6     | wire id                                                  |
| 7     | value                                                    |
| 8     | orthogonal path points                                   |
| 9     | intersection markers                                     |
| 10    | color (`[r,g,b]` or `#rgb`/`#rrggbb`/`rgb(...)` on load) |

A 10-field legacy tuple is still accepted; its position data starts at index 7. `localStorage2.parse` converts string colors to `[r,g,b]` and defaults unknown formats to grey.

Component `data` fields: `id`, `name`, `pos`, `width`, `height`, `rotation`, `color`, `properties`, optional `value`, `input[]`, `output[]`. Ports in the file are `{id, name, pos:{side,pos}, value}`. A `Custom` component adds `componentData`, a nested `[components, wires]` structure (not the whole board wrapper).

The importer validates:

- file size ≤ 2 MB and JSON depth/key count limits,
- top-level `name`/`offset`/`zoom`/`data` and zoom within 2–300,
- known constructor names,
- only allowed component fields,
- point bounds and finite numbers,
- dimensions > 0 and ≤ 1000,
- ≤ 512 ports per component,
- ≤ 2,000 components and 10,000 wires,
- custom nesting depth ≤ 12,
- wire path points (≤ 20,000).

All objects are parsed without executable constructor expressions; there is no `eval`/`Function`.

### Local storage keys

| Key                                        | Contents                                                 |
| ------------------------------------------ | -------------------------------------------------------- |
| `localStorage.pwsData`                     | Legacy app state: `{version, clipboard, settings, tips}` |
| `reeo.files.v1:saves/<file>.board`         | Saved board wrapper                                      |
| `reeo.files.v1:data/customcomponents.json` | Saved custom-component library, default `[[],[]]`        |
| `reeo.locale`                              | `en`, `ar`, or `arz`                                     |
| `reeo.contextualTips`                      | Whether contextual advice is enabled                     |

The storage adapter normalizes paths to exactly `saves/<name>.board` or `data/customcomponents.json`; `..` and other paths are rejected. It is not an OS filesystem.

## Rendering and input

- `canvas.js` owns the main render loop, camera transform, grid, wires, ports, and hit-testing.
- `src/rendering.ts` draws component bodies by type (gate silhouettes, display segments, ROM, custom, etc.).
- `src/icons.ts` draws toolbar/help symbols and tutorial SVGs.
- `src/interaction.ts` removes the canvas’s original mouse handlers, installs `PointerEvent` handling, and synthesizes `mousedown`/`mousemove`/`mouseup` exactly once. Touch tools map a one-finger drag to a synthetic middle/`Ctrl`/`Shift` gesture; pinch and two-finger drag are handled locally.
- `src/overlays.ts` and `src/geometry.ts` enforce one popup at a time and viewport-aware placement.
- `src/layout.ts` applies responsive/coarse-pointer classes and measures the visual viewport.

Because touch is synthesized into the legacy mouse pipeline, a gesture must not call both the legacy handler and a second custom action. That duplicate-toggle class of bug is covered by the touch Playwright specs.

## Internationalization

`i18n.ts` owns the active locale and message dictionary; `legacy-messages.ts` supplies translations for prose that existed before the typed layer. Locale changes update:

- `html[lang]`/`html[dir]`,
- `t()` strings for dynamic UI,
- legacy dialog/tutorial text via dictionary lookup,
- `aria-label`/`title` attributes installed by the typed layer,
- language-picker labels.

Static markup translations live in the dictionary/keys rather than in per-language copies of `index.html`. The circuit, commands, coordinates, and file extensions are not translated. Arabic fonts are Unicode-range-restricted so Latin text keeps its Latin stack.

## Security model

- Board data is untrusted: size/depth/field allowlists, no executable expressions.
- Storage is origin-local; there is no server-side account or database.
- The renderer does not get a general Node `require`; only the narrow `fs` shim and devtools hook exist.
- Electron uses a preload bridge (`window.reeoDesktop`) with `contextIsolation`; do not enable `nodeIntegration` to “fix” a module error.
- Vercel sets a CSP in `vercel.json`; a new external font/API/WebSocket host must be added deliberately. `wss:` is allowed for the optional legacy collaboration path.
- The collaboration client has no authentication. Do not deploy an unauthenticated relay publicly.

## Known architectural debts

These are real and should not be presented as features:

- `componentInfo.show()` is unused by the app; hover details come from `hover.js`.
- `Key`, `Merger`, `Splitter`, `BinaryToDecimal`, and `DecimalToBinary` are commented-out classes. Do not document them as available.
- The console's undocumented `openDevTools` command is an Electron-only helper; in a browser it silently does nothing.
- `saves.js` still uses filesystem-style method names even though it is backed by `localStorage`.
- Some legacy dialogs have terse labels; translation coverage is tested for authored prose, not arbitrary browser errors.
- The typed layer declares legacy globals with `declare`; it is type-checked but not runtime-validated. Keep the declarations in sync with `app/js` when signatures change.

## Where to change what

| Task                     | Start here                                                                      |
| ------------------------ | ------------------------------------------------------------------------------- |
| Component behavior       | `app/js/components.js`, matching class                                          |
| Component body drawing   | `src/rendering.ts`                                                              |
| Toolbar/help symbol      | `src/icons.ts`                                                                  |
| Board validation/import  | `src/board.ts`, `src/runtime.ts`                                                |
| Storage                  | `src/storage.ts`, `app/js/localStorage2.js`                                     |
| Simulation budget        | `src/simulation.ts`, `app/js/componentUpdates.js`                               |
| Canvas input/camera      | `app/js/canvas.js`, `src/interaction.ts`                                        |
| Menus/dialogs            | `app/js/mainmenu.js`, `app/js/dialogs.js`, `src/overlays.ts`, `src/geometry.ts` |
| Help/recipes/diagnostics | `src/help*.ts`, `src/diagnostics.ts`                                            |
| Translation              | `src/i18n.ts`, `src/legacy-messages.ts`, `src/help-content.ts`                  |
| Native shells            | `electron/`, `capacitor.config.ts`, `scripts/native-assets.ts`                  |

For the step-by-step contribution workflow, see [Development](DEVELOPMENT.md) and [Testing](TESTING.md).
