# Contributing to REEO

Thanks for helping. REEO is an original-interface digital logic simulator; changes must preserve the existing editor, its theme, and its interaction model while making the app more correct, accessible, documented, and maintainable.

## Before you start

- Read the [user guide](docs/USER-GUIDE.md) to understand the product.
- Read the [architecture](docs/ARCHITECTURE.md) and [development guide](docs/DEVELOPMENT.md) before changing code.
- Search existing issues and pull requests. If issues are unavailable, open a pull request with a clear description or contact the maintainer.
- For a large feature or a new visual direction, open an issue/proposal first. Do not rebuild the app in a different framework or replace the established UI.
- Security problems go through [SECURITY.md](SECURITY.md), not public issues.

## Ways to contribute

- Fix a reproducible bug with a regression test.
- Improve component behavior, validation, or diagnostics without changing the visual identity.
- Add or correct English/Arabic/Egyptian Arabic copy — native-speaker review is especially valuable.
- Improve accessibility without replacing the canvas interaction model.
- Add docs, worked circuits, or beginner explanations.
- Test on a browser/device that is not yet in the [tested matrix](docs/TESTING.md#browser-and-device-matrix).

Good first contributions are usually a documentation fix, a missing translation, a small validation bug, or a test that exposes a real issue.

## Development setup

```bash
git clone https://github.com/abdou-da0wew/REEO.git
cd REEO
bun install
bunx playwright install chromium
bun run dev
```

Requirements and commands are detailed in [Development](docs/DEVELOPMENT.md#setup). Bun is the package manager; do not add a second lockfile.

## Coding expectations

- Keep the existing UI language: colors, fonts, dialog/menu styles, grid symbols, and layout. No new design system or framework migration.
- TypeScript is strict; no explicit `any`, no non-erasable syntax (`enum`, `namespace`, parameter properties).
- Prettier formats; Biome and Oxlint lint. Do not reformat legacy `app/**` files wholesale.
- Preserve the fixed classic-script load order in `app/index.html`.
- New user-facing strings must exist in English, Arabic, and Egyptian Arabic.
- Do not commit generated output (`dist/`, `node_modules/`, `releases/`, `android/`, `ios/`, coverage, test reports) or local saves.
- Do not add remote font/API/CDN dependencies without a CSP and offline-build review.
- Never include credentials, signing certificates, personal board data, or `.env` files.

## Testing

Run at minimum:

```bash
bun run check
bun run build:vercel
bun run test:e2e
```

For UI/layout changes, also test:

- 320 px and 390 px phone widths, tablet, and desktop;
- English, العربية, and مصري;
- RTL, keyboard focus, outside-click dismissal, and `Escape`;
- real pointer interaction plus touch emulation.

See [Testing](docs/TESTING.md) for the suite, environment variables, and known gaps. If something cannot be tested in your environment, say so explicitly in the PR instead of implying coverage.

## Commits

- Make focused commits with clear messages (what and why).
- Do not add bot/AI co-author trailers, generated signatures, or unrelated formatting.
- Rebase or merge `master` as needed; do not force-push a shared branch.
- Keep the author identity you control. Do not impersonate another contributor.

## Pull requests

1. Branch from `master`.
2. Fill in the PR template: summary, motivation, user-visible effects, screenshots for UI, test evidence, linked issue, known gaps.
3. Keep the diff reviewable. Separate refactors from behavior changes where practical.
4. Make sure invalid imports still leave the current board intact and local data is not silently destroyed.
5. Update the relevant `docs/` page and `What's new`/translations if behavior changes.
6. Wait for review. The `verify` check may be unavailable during a GitHub billing lock; include local results and note the limitation.

A maintainer may ask for changes to preserve the original interface or to reduce scope. That is normal; it is not a rejection of the underlying idea.

## Documentation contributions

- Use the page that already owns the topic; do not create a near-duplicate.
- Document what the code actually does. If a feature is limited, untested, or experimental, say so.
- Keep internal links relative and working.
- Run the docs link check (see [docs/README.md](docs/README.md)) and `bun run format:check`.
- Use the user’s vocabulary for user docs and precise module/function names for developer docs.

## Translations

- Arabic (`ar`) is Modern Standard Arabic; Egyptian (`arz`) is Egyptian Arabic. Do not mix them.
- Translate meaning, not word-for-word. Keep technical identifiers, shortcuts, commands, and file extensions LTR.
- Add all three locales; an English-only entry is a test failure.
- Report a bad translation with the exact screen, source string, and suggested text.

## License

By contributing, you agree that your contribution is licensed under the repository’s **GPL-3.0-only** license and that you have the right to submit it. There is no separate CLA. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Code of conduct

Participation is covered by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be direct about code, kind about people, and respectful of the project’s history and its original author.

## Questions

See [SUPPORT.md](SUPPORT.md). For security, use [SECURITY.md](SECURITY.md).
