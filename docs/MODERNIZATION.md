# Modernization audit

## Preservation rule

The original main menu, typography, palette, circuit renderer, toolbar, gate catalog, custom components, console, and editing conventions are the starting point. New features are small layers around those systems. Do not replace the interface with a framework dashboard or silently change circuit behavior.

## Completed

| Old implementation                              | Current improvement                                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Electron 1.7-only application                   | Current Electron dependency plus browser/Vercel and Capacitor targets                                          |
| Renderer `require('fs')` and shell invocation   | Strict TypeScript browser-storage adapter; no OS shell access                                                  |
| Old Electron main process                       | Typed main/preload with isolated, sandboxed renderer                                                           |
| Inconsistent BOOLR naming                       | REEO identity and platform metadata; historical authorship retained                                            |
| No browser entry                                | Vite builds the original HTML and classic script order                                                         |
| Mouse/modifier-only editing                     | Touch-to-mouse compatibility boundary plus Move, Pan, Select and zoom buttons                                  |
| Fixed-size menus/dialogs                        | Additive responsive sizing and safe-area support                                                               |
| English-only core UI                            | Typed English, Arabic, Egyptian Arabic dictionaries and RTL                                                    |
| Arithmetic `eval`                               | Restricted TypeScript parser supporting numeric variables, parentheses, +, −, ×, ÷, %                          |
| Obsolete duplicate parsers/console/context menu | Unused files removed; Git retains their history                                                                |
| Busy simulation timer                           | 16 ms interval and typed bounded update scheduler                                                              |
| Empty boards not saved                          | Empty board saves allowed; synchronous lifecycle persistence                                                   |
| Ad-hoc dependencies                             | Bun lockfile, strict TS7, separate Prettier/Oxlint/Biome responsibilities                                      |
| No tests or CI                                  | Bun unit tests; Playwright original-gate, storage, language, responsive and touch checks; manual native builds |

The removed files were unused `console.js`, `contextmenu.js`, and `localStorage.js`, plus the obsolete `stringifier.js` parser exposing `eval`-based `parse_old`/`stringify_old`. The active `console2.js`, `contextmenu2.js`, and `localStorage2.js` remain so their behavior is not rewritten merely for naming aesthetics.

## Compatibility

- Current original-format `.board` save objects and raw `[components, wires]` arrays remain the portable format.
- Very old unsupported constructor formats, executable payloads, malformed structures, oversized files, and extreme nesting are rejected rather than guessed or evaluated.
- Saves in an original desktop filesystem directory are **not automatically discovered** by the browser/Electron sandbox. Import files manually.
- UI state and boards are local to an origin/profile. Vercel preview URLs and production domains have different browser storage.
- The original event-driven gate simulation is retained. This is not a transistor-level, analog, propagation-delay-accurate, or formally verified HDL simulator. Feedback work is bounded, not physically modeled.
- Language changes translate UI, not user-created circuit labels or numerical expressions. Core messages, full tutorial prose, dialogs, validation messages, console help, tips, and built-in diagnostic labels have Arabic and Egyptian Arabic translations. Command syntax, technical identifiers, and external/browser-generated errors remain verbatim. See `LOCALIZATION-AND-ICONS.md` for audit coverage.

## Remaining incremental work

1. Migrate component classes and ports to strict TypeScript in small, behavior-tested slices.
2. Extract rendering, hit testing, wire routing, selection, and undo from global state without changing the visual/editor model.
3. Expand board schema validation to every legacy component-specific field and wire invariant; audit all legacy HTML-producing dialogs/console output. The new import boundary is not a complete security audit of all old rendering paths.
4. Have native speakers review Arabic and Egyptian Arabic wording, and extend localization coverage as new UI or diagnostics are added.
5. Add exhaustive tests for custom-component nesting, timers, ROM, sockets, and complex feedback circuits.
6. Add WebKit/Firefox and physical-device testing, especially tablets and low-memory mobile devices. Expand keyboard and screen-reader editing beyond the original canvas limitations.
7. Review native icon/splash assets on devices; test Capacitor projects in Android Studio/Xcode; obtain signing identities and perform store release review.
8. Decide whether a separately maintained collaboration server should be modernized. No active backend is included here.

The TypeScript boundary is intentionally real production code, not `@ts-nocheck`, bulk file renaming, or an unused parallel simulator. Legacy files are explicitly outside the new-code lint/type boundary until migrated.

## Dependency audit

The current Bun audit reports one moderate, build-tool-only `minimatch` denial-of-service advisory through Electron packaging dependencies. `bun audit fix` cannot resolve it within upstream dependency ranges. Do not apply a blanket major-version override: older glob callers use different minimatch APIs. Track upstream Electron builder/universal updates, and run packaging only against trusted project sources. This is not a claim of a zero-vulnerability dependency tree.

## Related

- [Architecture](ARCHITECTURE.md) — the current two-layer design and known debts.
- [Development](DEVELOPMENT.md) — setup, extension rules, and checks.
- [Testing](TESTING.md) — the verification matrix.
