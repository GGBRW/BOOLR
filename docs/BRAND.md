# REEO identity

**Name:** REEO (always uppercase in product identity).  
**Tagline:** Digital logic. Limitless curiosity.  
**Personality:** curious, precise, approachable; a tool for learning through experimentation.

## The mark

The circuit-R is an open signal path: an R-shaped conductor, input terminals, and an output terminal. Signal green adds life to the original monochrome interface without replacing its palette. The R remains recognizable without color.

- `public/brand/reeo-mark.svg`: scalable application mark.
- `public/brand/reeo-r-mark.svg`: transparent circuit R with signal-green pins; used inline, on the text baseline, in the home wordmark.
- `public/brand/reeo-wordmark.svg`: standalone circuit mark plus outlined Righteous lettering, kept for exports that cannot use the live typeface.
- `public/brand/reeo-icon.png`: 512px raster application icon.
- `public/brand/reeo-icon.ico`: Windows multi-size icon.

The home wordmark is a lockup, not an image of a wordmark: the circuit R sits immediately before live `EEO` set in REEO Circuit Display (`public/brand/REEOCircuitDisplay.ttf`). Cap heights and baselines are matched so the R reads as the first letter. If the typeface is unavailable, the same lockup falls back to Righteous so the name remains legible.

## Palette and typography

| Role                                | Value               |
| ----------------------------------- | ------------------- |
| Ink / original menu background      | `#111111`           |
| Chalk / original menu text          | `#DDDDDD`           |
| Signal / restrained identity accent | `#B8E986`           |
| Canvas                              | original white grid |

The home wordmark uses REEO Circuit Display for `EEO` and the circuit-R glyph for the first letter; Righteous remains only as its fallback and in the standalone export. Retain the Ubuntu UI, monospaced circuit/console labels, gate symbols, and Material icon font. Arabic uses the bundled, Unicode-restricted IBM Plex Sans Arabic with system Arabic fallbacks where needed. Keep the circuit geometry, formulae, gate symbols, and technical identifiers left-to-right, even inside an RTL interface.

Keep at least one terminal-dot diameter of clear space around the mark. Do not stretch it, obscure terminals, or recolor the original circuit editor just to match the logo. The identity should renew the product, not erase its recognizable interface or its original authors' credit.

## Related

- [User guide](USER-GUIDE.md) — how the identity appears in the product.
- [Component reference](COMPONENTS.md) — the circuit symbols used by the guide.
- [Brand assets README](../public/brand/README.md) — font tables and rebuild commands.
- [Testing](TESTING.md) — wordmark/font regression coverage.
