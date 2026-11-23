# REEO documentation

This directory is the written source of truth for using, running, testing, and extending REEO. Start with the audience table below; each guide links to the next one.

## Start by audience

| I want to…                                               | Read                                    |
| -------------------------------------------------------- | --------------------------------------- |
| Build a circuit and understand the editor                | [User guide](USER-GUIDE.md)             |
| Look up a component, pin, or property                    | [Component reference](COMPONENTS.md)    |
| Learn mouse, keyboard, and touch controls                | [Controls and shortcuts](SHORTCUTS.md)  |
| Use the built-in console and variables                   | [Console reference](CONSOLE.md)         |
| Fix a problem                                            | [Troubleshooting](TROUBLESHOOTING.md)   |
| Understand how the code fits together                    | [Architecture](ARCHITECTURE.md)         |
| Set up the repository and make a change                  | [Development guide](DEVELOPMENT.md)     |
| Run or write tests                                       | [Testing guide](TESTING.md)             |
| Package desktop/mobile builds or cut a release           | [Releasing and platforms](RELEASING.md) |
| Configure GitHub issues, checks, and repository settings | [GitHub setup](GITHUB.md)               |
| Work on the identity, typeface, or visual language       | [Brand guide](BRAND.md)                 |
| Review the modernization boundary and known gaps         | [Modernization audit](MODERNIZATION.md) |
| Review UI/UX measurements, logic, overlays, localization | [Audit records](#audit-records)         |
| Deploy the web build to Vercel                           | [Vercel guide](VERCEL.md)               |
| Build for Windows, macOS, Linux, Android, or iOS         | [Platform guide](PLATFORMS.md)          |

## Quick command reference

```sh
bun install
bun run dev             # browser development server
bun run check           # types, linters, formatting, docs, unit tests
bun run build:vercel    # static production build + asset verification
bun run test:e2e        # Playwright browser tests
bun run desktop:dev     # build and open Electron
```

The canonical command list, prerequisites, and environment notes live in [Development](DEVELOPMENT.md#everyday-commands).

## What REEO is

REEO is an incremental modernization of the original **BOOLR** digital logic simulator. It keeps the original dark menu, white grid canvas, gate toolbar, component behavior, and local board format, while adding:

- browser, Electron desktop, and Capacitor Android/iOS targets;
- strict TypeScript modules around the legacy simulator (storage, validation, simulation scheduling, gestures, i18n, help, rendering, layout, overlays);
- English, Arabic, and Egyptian Arabic UI with RTL;
- touch tools, pinch/pan gestures, responsive dialogs, and measured overlay placement;
- an in-app searchable field guide, worked-circuit recipes, structural diagnostics, and contextual tips;
- an original display typeface and a circuit-R identity.

It is **not** a from-scratch React/Solid rewrite, an analog circuit simulator, a formally verified HDL, or a cloud service. See [Scope, guarantees, and limits](USER-GUIDE.md#scope-guarantees-and-limits).

## Documentation rules

When behavior changes:

1. Update the affected page(s) here and [CHANGELOG](../CHANGELOG.md).
2. Keep commands and paths executable; `bun run docs:verify` checks that internal links resolve.
3. Do not hardcode transient test counts in more than one place. Put the latest recorded baseline in [Testing](TESTING.md#recorded-baseline) and link to it.
4. Keep screenshots out of the repository unless they are deliberate, licensed brand assets. Local QA screenshots are not documentation.
5. Preserve the distinction between “tested in this repository” and “guaranteed on every device.” Do not turn a Chromium check into a Safari/Android claim.

## Audit records

These documents record how specific areas were inspected. They are historical evidence, not marketing claims. Re-run the commands before relying on their numbers.

- [Modernization audit](MODERNIZATION.md) — what was migrated, what remains legacy, compatibility rules.
- [Component guide and UX](COMPONENT-GUIDE-AND-UX.md) — field guide content, renderer delegation, diagnostics scope.
- [Logic audit](LOGIC-AUDIT.md) — truth tables, timers, counters, ROM, custom components, serialization.
- [Localization and icons](LOCALIZATION-AND-ICONS.md) — translations, RTL, IBM Plex Arabic, Phosphor icons, tips.
- [Overlay behavior](OVERLAY-BEHAVIOR.md) — popup dismissal, release dialog, field guide sizing.
- [Visual audit](VISUAL-AUDIT.md) — reproduced UI problems, fixes, measured viewports.
- [Vercel](VERCEL.md) — static deployment contract, headers, caching, rollback.

## Repository files outside this directory

- [README](../README.md) — project overview and quick start.
- [CONTRIBUTING](../CONTRIBUTING.md) — contribution workflow and review expectations.
- [SECURITY](../SECURITY.md) — private vulnerability reporting and security scope.
- [SUPPORT](../SUPPORT.md) — where to ask for help and what to include.
- [CODE_OF_CONDUCT](../CODE_OF_CONDUCT.md) — participation standards.
- [CHANGELOG](../CHANGELOG.md) — released and unreleased changes.
- [Type specimen](../public/brand/font-specimen.html) — live font proof, served at `/brand/font-specimen.html`.
- [Brand typeface notes](../public/brand/README.md) — font tables, coverage, rebuild commands.

## Keeping this set honest

Documentation is part of the product. If you find a statement that is no longer true, fix it in the same pull request as the behavior change or open a documentation issue. The `docs:verify` script catches broken file links, not stale prose; reviewers still need to check accuracy.
