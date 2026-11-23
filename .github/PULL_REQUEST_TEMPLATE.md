## Summary

<!-- What changed, and why? Keep it specific. -->

## Type of change

- [ ] Bug fix
- [ ] New behavior or component
- [ ] UI/UX or accessibility change
- [ ] Localization/translation
- [ ] Documentation
- [ ] Build, CI, native, or tooling
- [ ] Refactor with no intended behavior change

## Related issue

<!-- Link with "Closes #123" when applicable. -->

## User-visible effects

<!-- What will users see or be able to do differently? -->

## Screenshots / recordings

<!-- Required for visual changes. Include phone and desktop widths, and ar/arz when relevant. -->

## Verification

<!-- Paste the actual commands/results, not just checkboxes. -->

- [ ] `bun run check`
- [ ] `bun run build:vercel`
- [ ] `bun run test:e2e`
- [ ] Production-mode e2e (`PLAYWRIGHT_PRODUCTION=1`)
- [ ] Manual: desktop
- [ ] Manual: phone width / touch emulation
- [ ] Manual: English, العربية, مصري
- [ ] Manual: RTL and keyboard/focus behavior

Notes on the environment or coverage gaps:

## Checklist

- [ ] The change preserves the existing REEO visual language and interaction model.
- [ ] New user-facing strings exist in all three locales.
- [ ] Invalid board imports still leave the current circuit intact.
- [ ] Timer/audio/nested state is disposed when a component is removed.
- [ ] Save/load and copy/paste were checked where relevant.
- [ ] Documentation was updated for user-facing or developer-facing changes.
- [ ] No secrets, generated build output, native projects, or private boards are included.
- [ ] Commits contain no bot/AI co-author trailers.

## Known limitations

<!-- Be explicit: what was not tested, what is still broken, what is out of scope. -->
