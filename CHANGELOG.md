# Changelog

Notable changes to REEO. The app version is shown in **What’s new** and in `window.reeo.version`. This project follows semantic versioning for its own releases; the original BOOLR versioning is historical.

## [Unreleased]

### Added

- **New parts:** Buzzer, Tone, Dip Switch, RGB LED, Bar Graph, Seven Segment, Lamp, Motor, Splitter, Merger, and an expression-driven Procedural part.
- **Board code:** a Verilog-flavoured text editor (menu → Board code) that compiles named components and pin references into a wired circuit.
- **Bulk editing:** Auto-wire selected, Auto-route wires, and horizontal/vertical distribution in the selection context menu.
- **More colour and shape control:** square, diamond, bar and bulb LED/lamp shapes, plus editable on/off display colours.
- **Guide placement:** blueprints now find a clear viewport spot away from real components and the guide dock; the dock becomes click-through until hovered or focused.

### Changed

- A fresh Display is taller, and boards can hold up to 5,000 components, 25,000 wires, 1,024 ports per direction and 2,000-cell dimensions.

## [2.1.0] - 2026-11-21

### Highlights

- The in-app **What's new** dialog now loads the latest public GitHub release, parses its changelog, and keeps a local copy for offline and rate-limited sessions.
- A release pipeline builds the browser bundle, Electron desktop packages, and the Capacitor Android/iOS shells from one version tag.
- The REEO Circuit Display typeface is used for the brand wordmark and share card, with a matching accessible share image.

### Added

- Complete documentation set: user guide, component/pin reference, controls, console, troubleshooting, architecture, development, testing, release, platform, and GitHub guides.
- GitHub contribution configuration: issue forms, pull request template, code owners, Dependabot, security policy, support, and code of conduct.
- `bun run docs:verify` link checker, included in `bun run check`.

### Changed

- Component/property editing from the in-app console now coerces values to the existing property type, supports dotted property paths, and accepts multi-token expressions.
- Settings → Clear localStorage now removes all REEO-owned keys (boards, saved components, locale, and preferences), not only legacy app state.
- CI checks a single concurrency group with a timeout.

### Fixed

- Console numeric edits (for example `edit 12 properties.delay 500`) no longer silently do nothing.
- `Ctrl+O` no longer clears the current circuit after a delay; `Ctrl+N` now opens the New board form.
- Clear-local-data left board and component files behind.

## [2.0.0] — current release

### Added

- REEO identity: circuit-R mark, wordmark, app icons, brand guide, and the original REEO Circuit Display typeface.
- Browser build with Vite and Vercel hosting configuration; Electron desktop host; Capacitor Android/iOS shells.
- Strict TypeScript boundary for storage, board validation, simulation scheduling, expressions, gestures, layout, overlays, rendering, icons, diagnostics, help, and localization.
- English, Arabic, and Egyptian Arabic interfaces with persistent locale, RTL, translated legacy prose, localized diagnostics, and a Unicode-restricted bundled Arabic font.
- Searchable in-app field guide, component entries, eight worked recipes, dashed ghost diagrams, structural circuit checks, contextual tips, and a pinned recipe dock.
- Touch tools (Interact, Move, Pan, Select), pinch/two-finger navigation, double-tap/long-press, responsive dialogs, safe-area handling, and measured popup placement.
- Portable `.board` import/export with strict validation; local board library and saved custom components; periodic/lifecycle saves.
- Bounded 10,000-update simulation tick with saturation reporting; no-`eval` arithmetic parser; disposal-safe timers.
- Phosphor interface icons and per-type circuit symbols; What’s new in the navigation menu.
- Playwright suites for logic, overlays, localization, touch, measurement, the field guide, wordmark/font, and production CSP behavior.

### Changed

- The original editor interface, component model, gate toolbar, and board format are preserved rather than rewritten.
- Browser and desktop use the same local-storage adapter; legacy `saves/` files are imported explicitly.
- Prettier is the only formatter; Biome and Oxlint are linters only.

### Known limitations

- Not a from-scratch framework rewrite; approximately 8.5k lines of legacy JavaScript remain.
- No cloud sync, accounts, hosted collaboration server, formal verification, or analog simulation.
- Chromium is the tested browser; Safari/Firefox/WebKit, physical devices, screen readers, signed installers, and real audio output are not certified.
- GitHub `verify` CI can be blocked by an account billing lock.

## BOOLR lineage

REEO is derived from BOOLR by Gees Brouwer. See [NOTICE](NOTICE) for attribution and [LICENSE](LICENSE) for GPL-3.0 terms.
