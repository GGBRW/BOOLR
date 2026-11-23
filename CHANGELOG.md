# Changelog

All notable changes to REEO are recorded here. The app reads the latest public
GitHub release body, parses this same structure, and caches the result locally.

## [2.1.0] - 2026-11-21

### Highlights

- The in-app **What's new** dialog now loads the latest public GitHub release, parses its changelog, and keeps a local copy for offline and rate-limited sessions.
- A release pipeline builds the browser bundle, Electron desktop packages, and the Capacitor Android/iOS shells from one version tag.
- The REEO Circuit Display typeface is used for the brand wordmark and share card, with a matching accessible share image.

### Added

- Dynamic release notes with a parsed, cached fallback in the app.
- `CHANGELOG.md`, `scripts/release-notes.ts`, and `.github/workflows/release.yml` for repeatable releases.
- Release metadata exposed through the typed `window.reeoRelease` bridge.

### Changed

- Version `2.1.0` across the browser UI, runtime, types, and package metadata.
- The share card tagline now uses REEO Circuit Display instead of the previous fallback rendering.
- The Content Security Policy allows the public GitHub Releases API used by the dialog.

### Fixed

- Release notes no longer ship as a hardcoded bullet list that can drift from the actual release.
- The generated Open Graph image now embeds the brand typeface before rasterising, so headless renders cannot silently fall back.

### Platforms

- **Web:** static Vite build for the hosted app and self-hosting.
- **Desktop:** Electron packages for Windows (NSIS), macOS (DMG/ZIP), and Linux (AppImage/DEB).
- **Mobile:** Capacitor Android debug APK and an unsigned iOS simulator build produced by CI.

## [2.0.0]

### Highlights

- Introduced the clearer REEO identity, circuit-grid symbols, and the REEO Circuit Display typeface.
- Added English, Arabic, and Egyptian Arabic UI support with right-to-left layouts.
- Added touch tools, circuit ghosts, zoom controls, and a searchable component guide.

### Platforms

- Web, Electron desktop, and Capacitor Android/iOS shells.
