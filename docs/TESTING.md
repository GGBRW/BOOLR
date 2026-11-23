# Testing

REEO uses three layers of verification:

1. **Static checks** — TypeScript, Oxlint, Biome, Prettier.
2. **Unit tests** — pure/typed logic with `bun:test` in `src/`.
3. **End-to-end tests** — Playwright driving the real page, canvas, dialogs, touch events, and persistence.

There is also a build-output verifier (`verify:web`) and a font verifier.

## Commands

```bash
bun run typecheck       # tsc + electron tsconfig
bun run lint            # oxlint + biome
bun run format:check    # prettier --check .
bun run test            # bun test ./src
bun run check           # all of the above
bun run build           # typecheck + production build
bun run build:vercel    # build + verify built assets
bun run verify:web      # built assets/files only
bun run test:e2e        # Playwright
```

`bun run check` is the standard PR gate. `test:e2e` is separate because it needs a browser and a server.

## Unit tests (`src/*.test.ts`)

| File                   | Covers                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `deployment.test.ts`   | `dist` verification rules: required files, referenced assets, no missing paths     |
| `diagnostics.test.ts`  | Structural diagnostics findings and messages for representative boards             |
| `localization.test.ts` | Locale dictionaries, Arabic coverage, key parity, direction/technical-string rules |
| `platform.test.ts`     | Capacitor/Electron config assumptions and platform detection/bridge shape          |

Unit tests must not require a DOM unless the test explicitly provides one. Prefer extracting pure functions (`expression.ts`, `geometry.ts`, `simulation.ts`, `board.ts`) over mocking the world.

Run a single file/pattern:

```bash
bun test src/diagnostics.test.ts
bun test -t "saturation"
```

## End-to-end tests (`tests/*.spec.ts`)

Playwright starts `bun run dev` on `127.0.0.1:5173` unless a server is already running (or `PLAYWRIGHT_BASE_URL` is set). Specs wait for `body[data-reeo-ready="true"]`, then use the real UI and legacy globals.

| Spec                         | Focus                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `studio.spec.ts`             | Core editor: original menu/canvas/toolbar, gates, export/persistence, locale switching, real pointer placement, touch, pinch                                                      |
| `logic-audit.spec.ts`        | Truth tables, source/button/sink signals, Counter edges, ROM bit 31, fan-out, pause, serialization, custom components, timers, Delay ordering, wire removal/undo, audio fallbacks |
| `help.spec.ts`               | Field guide search, recipes, ghosts, diagnostics, contextual advice, localization, viewport fit                                                                                   |
| `localization-icons.spec.ts` | Arabic/Egyptian prose coverage, Phosphor/circuit symbols, local Arabic font Unicode ranges                                                                                        |
| `overlays.spec.ts`           | One-popup-at-a-time, outside/Escape dismissal without applying values, tooltip dismissal, popup placement                                                                         |
| `ui-audit.spec.ts`           | Original UI elements preserved, What’s new/nav behavior, quick guide, compact release dialog                                                                                      |
| `ux-measurements.spec.ts`    | Measured control/overlay geometry, dock/picker overlap, menu columns, narrow devices                                                                                              |
| `rtl-alignment.spec.ts`      | RTL navigation alignment above the right-edge trigger                                                                                                                             |
| `header.spec.ts`             | Header alignment at widths/locales                                                                                                                                                |
| `home-controls.spec.ts`      | Home rows preserve icon/divider/label; footer credit links; no editor actions on home                                                                                             |
| `color-picker.spec.ts`       | Twelve-color palette, exact RGB, wire color edit, phone fit/cancel                                                                                                                |
| `deployment.spec.ts`         | Production boot/edit under the Vercel CSP                                                                                                                                         |
| `font.spec.ts`               | Served font, specimen features, wordmark lockup                                                                                                                                   |

### Environment variables

| Variable                  | Effect                                                        |
| ------------------------- | ------------------------------------------------------------- |
| `PLAYWRIGHT_BASE_URL`     | Use an already-running server instead of starting one         |
| `PLAYWRIGHT_PRODUCTION=1` | Start `bun run preview --port 5173` instead of the dev server |
| `CHROMIUM_PATH`           | Use a custom Chromium executable                              |
| `CI`                      | Do not reuse an existing dev server                           |

In a minimal Linux container without system browser libraries:

```bash
export LD_LIBRARY_PATH=/tmp/reeo-libs/lib
export CHROMIUM_PATH=/tmp/chromium
bun run test:e2e
```

Some suites intentionally use `page.evaluate` with legacy globals (`components`, `select(Input)`, constructors). That is deliberate: it tests the **actual shipped runtime**, not a mock module. Keep raw-global tests focused on invariants and use real pointer locators for user flows.

### Production mode

The deployment spec and CI run against a production build:

```bash
PLAYWRIGHT_PRODUCTION=1 bun run build
PLAYWRIGHT_PRODUCTION=1 bun run test:e2e
```

This catches CSP, relative-base, and missing-copied-asset bugs that the dev server hides.

## CI

`.github/workflows/ci.yml` runs on push/PR:

1. Bun 1.4.5, `bun install --frozen-lockfile` with `ELECTRON_SKIP_BINARY_DOWNLOAD=1`.
2. `bun run check`.
3. `bun run build:vercel`.
4. Install Playwright Chromium with OS dependencies.
5. `bun run test:e2e` with `PLAYWRIGHT_PRODUCTION=1`.
6. Upload `dist`.

**Current repository status:** the `verify` job has been blocked by a GitHub **billing lock** (“job was not started because your account is locked due to a billing issue”). That is an account/CI problem, not a test failure. Vercel checks pass independently. Do not treat a green Vercel preview as proof that CI ran.

Desktop (`desktop.yml`) and mobile (`mobile.yml`) are manual `workflow_dispatch` jobs; they package/build native artifacts and are not part of the push/PR gate.

## Test coverage and known gaps

### Covered

- Primitive gate truth tables (AND/OR/XOR/NOT).
- Input/Button/Constant/Output/Debug signal behavior.
- Counter rising edges; ROM bit slicing including bit 31.
- Wire fan-out, pause deferral, wire removal/undo.
- Save/export/import round trip; invalid import leaves circuit intact; empty-board persistence.
- Custom inverter before/after serialization; Clear board timer cancellation; Clock deletion/undo.
- Delay transition order and deletion cancellation.
- Touch placement/toggling, drag move/pan, pinch, double-tap, long press.
- Real pointer circuit placement and simulation through toolbar/canvas.
- Field guide search, recipe pinning, ghosts, diagnostics, contextual advice.
- Three locales, RTL alignment, authored legacy prose coverage, local Arabic font ranges.
- Popup placement/dismissal/focus, tooltip dismissal, no value application on outside close.
- Home rows/footer/nav/What’s new/quick guide, control measurement at phone/tablet/desktop widths.
- Production boot under the Vercel CSP.
- Wordmark/font regression.

### Not covered / honest limits

- **No Safari, Firefox, or WebKit run** in this environment; Playwright uses Chromium. CSS/gesture behavior on those engines is unverified.
- **No physical iOS/Android device** test. Touch is emulated in Chromium; Capacitor builds are not launched on hardware here.
- **No screen-reader or formal WCAG audit.** Keyboard focus and labels exist, but canvas editing is not fully keyboard accessible.
- **No real audio output test.** Audio tests verify Web Audio fallback/resume logic, not speakers.
- **No signed/notarized desktop installers.** Packaging config exists; platform signing was not exercised.
- **No long-duration stress test** of multi-thousand-component boards or sustained max-rate clocks.
- **No collaboration server integration test.** The WebSocket client is legacy and has no hosted server.
- **No visual regression snapshots.** Geometry is asserted numerically; pixel-perfect diffs are not.
- **No fuzzing** of the board parser beyond unit cases and hand-crafted invalid imports.
- **No automated translation quality review.** Tests prove Arabic text exists and is not English; native-speaker judgment is still required.
- The legacy `componentInfo` helper is only reached from tests; hover details are tested via `hover.js`.

If you change any of these areas, manually test the corresponding behavior and record the scope in your PR.

## Recorded baseline

The latest full local runs recorded **117 passed, 1 skipped** in dev mode and **118 passed** in production mode. `bun run check` passed with **67 unit tests (2,252 assertions)**, `build:vercel` verified 56 asset references, and `font:verify` passed. That is a historical baseline, not a substitute for re-running the suite. Update this paragraph only when you have a newer full run; do not scatter test counts through the docs.

## Browser and device matrix

Automated/measured targets:

| Viewport               | Intent                           |
| ---------------------- | -------------------------------- |
| 320 × 568              | smallest measured phone          |
| 390 × 844              | common modern phone              |
| 844 × 390              | phone landscape / short height   |
| 800 × 1280             | tablet portrait                  |
| 1366 × 768             | laptop                           |
| 1920 × 1080            | desktop                          |
| 955 × 590              | narrow desktop header breakpoint |
| 768 × 900 / 1400 × 900 | wordmark/header checks           |

For each relevant surface, check:

- English, Arabic, Egyptian Arabic.
- LTR and RTL (`html[dir]`).
- mouse/fine pointer and coarse-pointer touch layout.
- no horizontal overflow; popups inside the visual viewport.
- header/menu/toolbar/dock do not overlap.
- `Escape` and outside dismissal without saving.

The recorded measurements are enforced by `ux-measurements.spec.ts`; visual audits are described in [Visual audit](VISUAL-AUDIT.md).

## Manual smoke test

Before a release or a risky refactor:

1. Fresh profile → home loads, language switches and persists.
2. New board → welcome dialog → close.
3. Place Input → NOT → Output, wire, toggle, observe.
4. Place Clock → Counter, set delay, pause/resume, delete while running.
5. Place ROM, configure address/data widths, read two rows.
6. Build a small circuit → select → Componentize → open → edit → save component.
7. Copy/paste, undo/redo, delete and undo.
8. Save, reload, open the saved board; export and re-import.
9. Open Quick guide, search, locate a component, pin a recipe, toggle ghost, finish.
10. Switch to Arabic and Egyptian Arabic; repeat dialogs and the guide; check RTL.
11. Resize to 320 px and use touch emulation; place, move, pan, pinch, long press.
12. Run `PLAYWRIGHT_PRODUCTION=1` boot and check the console/network for CSP errors.

## Adding tests

- Unit tests: add `src/<topic>.test.ts`; keep them deterministic and fast.
- E2E: add `tests/<topic>.spec.ts`; wait for `data-reeo-ready`, prefer role/label locators for user flows, and assert no `pageerror`.
- Do not weaken Arabic coverage to make a test pass; add the missing translation.
- When fixing a bug, write the failing assertion first (or describe why it cannot be reproduced automatically).
- For persistence bugs, assert both the visible state and the stored JSON.
- For overlay bugs, assert position **and** that no edit was applied on dismissal.

## Troubleshooting tests

| Problem                             | Fix                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| Chromium fails to launch            | Install Playwright browsers/libs; set `CHROMIUM_PATH`/`LD_LIBRARY_PATH`                        |
| Dev server port busy                | Reuse it (`reuseExistingServer`) or set `PLAYWRIGHT_BASE_URL`                                  |
| Tests pass locally but CI e2e fails | Run production mode locally; check relative base/CSP and copied `app/js`                       |
| Arabic assertion fails              | Add/fix the translation; do not skip the locale                                                |
| Flaky timing test                   | Use deterministic direct updates where possible; pause the queue; avoid real-clock sleeps      |
| Font test fails                     | Run `bun run font:verify`; ensure font files are present and the wordmark markup/CSS is intact |

See [Deployment](VERCEL.md) for build/CSP details and [Troubleshooting](TROUBLESHOOTING.md) for product-level issues.
