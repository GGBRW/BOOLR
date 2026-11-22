# REEO circuit lettering

`REEOCircuitDisplay.ttf` is an original display font for the REEO wordmark, with R, E, O and space glyphs. It is not a general-purpose text font. The strokes and terminals follow circuit wiring and gate geometry; the R incorporates the existing gate-shaped bowl.

Regenerate with Python 3 and fontTools:

```sh
python -m pip install fonttools
python scripts/circuit-font.py
```

The font and its source use the repository's GPL-3.0 license. No existing third-party font was modified to make these glyphs.

`og-source.html` is the canonical 1200 × 630 social-card source. Serve the app, wait for `document.fonts.ready`, and capture its viewport at 1200 × 630 to regenerate `reeo-og.png`. The HTML loads the local circuit display font and Alan Sans; the SVG is an editable companion requiring those fonts. The PNG is used by Open Graph and Twitter metadata.
