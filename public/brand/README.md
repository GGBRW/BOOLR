# REEO Circuit Display

`REEOCircuitDisplay.ttf` is an original display typeface for REEO. Its
construction comes from the R in the wordmark: one 56-unit monoline stroke,
round caps and joins, and short square port stubs where a terminal meets a
curve. The rest of the alphabet keeps that grammar rather than copying the
three wordmark letters.

## What is in the font

|                            |                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Family / style             | REEO Circuit Display, Regular 400                                                        |
| Glyphs / mapped codepoints | 359 / 344                                                                                |
| Coverage                   | Latin-1 Supplement, Latin Extended-A, General Punctuation, currency, math, fractions     |
| Figures                    | Tabular, 620 units                                                                       |
| OpenType                   | `kern` (GPOS, 161 pairs), `ss01` (slashed zero)                                          |
| UPM                        | 1000; cap 700, x-height 500, ascender 880, descender −240                                |
| Tables                     | `head` `hhea` `maxp` `OS/2` (v4) `hmtx` `cmap` `loca` `glyf` `name` `post` `GPOS` `GSUB` |
| License                    | GPL-3.0-only, the repository's license                                                   |

The face covers the Latin script only. Arabic UI text continues to use IBM Plex
Sans Arabic; no Arabic, Greek or Cyrillic glyphs are claimed.

The font is a display face, not a text face: it is designed for the wordmark,
headlines, share cards and the specimen, not for long paragraphs at small
sizes.

## Files

- `REEOCircuitDisplay.ttf` — the installable font.
- `reeo-r-mark.svg` — the transparent circuit R with signal-green pin tips,
  placed inline before live `EEO` in the home wordmark.
- `reeo-mark.svg` — compact standalone circuit-R mark.
- `reeo-wordmark.svg` — static wordmark lockup for contexts without the live font.
- `reeo-icon.png` / `reeo-icon.ico` — application and packaging icons.
- `font-specimen.html` — live specimen, character sets, language samples and
  technical details. Open it through the dev server:
  `http://localhost:5173/brand/font-specimen.html`.
- `og-source.html` / `og-source.svg` — 1200 × 630 share-card sources.
- `reeo-og.png` — rendered share card used by the Open Graph tags.

## Rebuild and verify

The generator uses Python 3, fontTools and skia-pathops:

```sh
python3 -m pip install fonttools skia-pathops
python3 scripts/circuit-font.py      # or: bun run font:build
python3 scripts/verify-font.py       # or: bun run font:verify
```

`verify-font.py` checks coverage, metrics, tables, features, tabular figures,
composite components and, when `opentype-sanitizer` is installed, runs the same
OTS sanitizer that browsers use. The checked-in font passes OTS.

The accents are composites: the drawn base plus a zero-advance combining mark.
Uppercase marks sit at 736 units, lowercase marks at 536, and the d/l/t
ascenders use the uppercase position. The `i` and `j` bases switch to
`dotlessi`/`dotlessj` for above marks. Add new characters through the tables in
`scripts/circuit-font.py`; never hand-edit the TTF.

## Share card

`og-source.svg` is the canonical 1200 × 630 artwork and `og-source.html` is its
live preview. Render the PNG through resvg so the brand fonts are loaded from
their files rather than discovered from the host system:

```sh
bun run og:render
```

The script passes `REEOCircuitDisplay.ttf` and `AlanSans-Variable.ttf` directly
to resvg. Do not rely on a headless browser's `@font-face` support: when the
font fails to load it silently substitutes a generic sans, which is how the
previous share card lost the circuit lettering.

No third-party font was modified to make these glyphs. Alan Sans and IBM Plex
Sans Arabic are bundled separately for the UI under their own OFL licenses.

## Using the identity

- The home wordmark is **not** an image: the R is `reeo-r-mark.svg`, tight against live
  `EEO` rendered in `REEOCircuitDisplay.ttf`. Keep `gap: 0` and baseline alignment;
  changing the font on the surrounding `h1` without re-declaring `.reeo-wordmark`
  will silently fall back to the UI font.
- Use the mark on a dark (`#111111`) or neutral background with clear space around
  it. Do not recolor, outline, stretch, rotate, or rebuild the R from a different
  font.
- The wordmark's R is the logo; the `EEO` letters are type, not separately drawn
  glyphs. Do not trace them into new artwork.
- These assets are GPL-3.0-only like the repository. They are not a trademark
  registration or a separate brand license.

The full rationale, palette, geometry, and regression checks are in
[docs/BRAND.md](../../docs/BRAND.md).
