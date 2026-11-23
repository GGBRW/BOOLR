# Popup and guide behavior

The editor retains its existing monochrome dialog/menu styling.

- **What's new** is in the bottom navigation menu, not a separate version button in the bottom-right action strip. Its content-sized 420px maximum-width release dialog reads the latest public GitHub release, parses the changelog into text sections, and caches the result locally; bundled fallback notes keep it useful offline.
- **Quick guide** is a 52px square icon-only header button with a localized accessible label and native hover title. The icon remains 24px, matching other editor icons.
- The **Circuit field guide** is centered, up to 760×660 CSS px, bounded by the visual viewport, with a scrollable reference area and adjusted section spacing.
- `src/overlays.ts` coordinates the existing show/hide APIs rather than replacing the UI. Opening a popup dismisses the previous transient surface. The pinned recipe checklist is persistent editor guidance and intentionally not treated as a popup.
- Outside pointer-down handles mouse, pen and touch. Escape dismisses open surfaces and temporary tooltips. Form dismissal calls hide, not the confirm action, and does not apply edited values.
- Dismissal also covers grid hover details, component information, toolbar/credits tips, component picker, navigation/context/waypoint menus, custom toolbar menu, console, tutorial and main-menu subforms. Hover advice is suppressed until pointer movement after dismissal. Delayed entrance animations are guarded so they cannot resurrect dismissed component details.

## Verification

`bun run check` passed TypeScript, both linters, formatting, and 67 unit tests (2,068 assertions). `bun run build:vercel` passed. The full production Chromium suite passed **96/96**, including 13 new popup/release/guide tests and the existing 18 viewport×locale geometry cases. Screenshots of the release dialog and compact component guide were visually inspected at 1100×800. Physical touch devices, Safari and screen readers were not tested in this revision.

## Related

- [User guide](USER-GUIDE.md#the-field-guide-tutorials-and-help) — the surfaces users see.
- [Controls](SHORTCUTS.md#dialog-and-popup-keys) — dismissal keys and gestures.
- [Testing → Overlays](TESTING.md) — popup/dismissal coverage.
