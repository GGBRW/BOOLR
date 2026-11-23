# Tips, circuit symbols, UI icons and Arabic localization

The original layout, dark controls, white canvas, component frames and circuit interaction model are retained.

## Tip toasts

Tips now appear in a physical bottom-right stack, above the fixed toolbar and navigation buttons, in both LTR and RTL layouts. They no longer follow the mouse. Each tip has a keyboard-accessible dismiss button and Escape handling. An eight-second timer pauses on hover/focus and restarts on leaving. Reduced-motion preferences disable the entrance animation. Toolbar notices use the same stack.

The original persisted once-per-tip preference remains in place. The connection-edge condition now correctly respects the disabled flag for every edge; straight-wire tips require eight actual positions before triggering. Chat/network notifications retain their separate original behavior.

## Icons

- Interface actions use the official MIT-licensed **Phosphor Icons** regular SVGs, bundled in `public/icons/phosphor/` from the locked `@phosphor-icons/core` package. No icon CDN or remote font is required.
- `src/icons.ts` maps the original action tokens to SVG masks, preserving existing event handlers and button dimensions. It observes dynamically created menus/dialogs and state changes such as pause/play.
- Gate and component icons are REEO-authored vector circuit paths, separate from general UI icons. NOT uses a triangle and inversion bubble; AND, OR and XOR use recognizable gate silhouettes. I/O, buttons, clocks, delays, counters, displays, LEDs, ROM and custom circuits have distinct symbols.
- The toolbar, component picker and truth-table dialogs use these symbols. Canvas gates and icon-based components draw the paths with `Path2D`; value components retain live numeric readouts, and specialized LED/display rendering remains intact.
- Old tutorial screenshots containing English labels and outdated glyphs are replaced with language-neutral vector circuit/command diagrams. Executable command examples remain unchanged.

## Translation audit

`src/i18n.ts` retains the typed core dictionaries. `src/legacy-messages.ts` adds explicit English-source/Arabic/Egyptian-Arabic entries for the original interface's authored copy, including the full tutorial, welcome flow, tips, editor labels, validation guidance, saved-component empty state, console help, and diagnostic labels. Dynamic templates preserve inserted names, filenames, URLs and coordinates.

The DOM adapter supports newly created dialogs as well as immediate language changes. Complete tutorial paragraphs are translated together rather than splitting sentences at italic/code elements; switching back to English restores the original rich markup. User-created board/component names and command input are not translation keys. Numeric/hex editor fields stay LTR in RTL interfaces.

Browser regression coverage includes:

- Every nonempty tutorial paragraph containing Arabic in both `ar` and `arz`, then reversible switching back to English.
- Seventeen original dialog flows in both Arabic locales, checking for leftover English authored prose (brand name, file extension and explicit fixture names are exempt).
- Dynamic component selection notices, console help and saved-component states.
- Phone, tablet-Arabic and laptop-Egyptian tip placement, stacking and dismissal.
- Paused toast lifetime and reduced-motion behavior.
- Phosphor asset loading, real gate placement and truth-table symbols.

Technical notation such as NOT/AND, ROM, LED, shortcuts, units, file extensions, command syntax and user content deliberately stays intact. Expanded raw JavaScript object/property dumps and external server/browser/OS error details are technical diagnostics, not translated prose. This is not a human linguistic certification; native-speaker review remains valuable.

## IBM Plex Sans Arabic

All seven requested weights (100–700) of **IBM Plex Sans Arabic** are self-hosted from the Google Fonts `google/fonts` repository, with the SIL OFL license included under `public/fonts/ibm-plex-sans-arabic/` and attribution in `NOTICE`.

The `REEO Arabic` CSS face uses Arabic-only Unicode ranges, prepended to existing font stacks. Arabic glyphs use IBM Plex even in mixed-language text, while Latin text keeps Ubuntu, Ubuntu Mono or the original font appropriate to that control. Canvas labels use the same Arabic fallback. Self-hosting avoids a third-party font request and keeps the existing Vercel CSP and offline-capable native asset packaging compatible.

## Verification and limits

The audit was visually checked at 390×844 (English), 800×1280 (Arabic) and 1366×768 (Egyptian Arabic), including editor toasts/circuit symbols, Arabic tutorial and Egyptian editor dialog. Physical Android/iOS/Electron runtimes and a native-speaker language review were not performed in this pass.

## Related

- [User guide → Languages and RTL](USER-GUIDE.md#languages-and-rtl) — user-facing behavior.
- [Controls](SHORTCUTS.md) — untranslated commands and shortcuts.
- [Development → Internationalization](DEVELOPMENT.md#internationalization-workflow) — adding translations.
