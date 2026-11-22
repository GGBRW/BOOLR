#!/usr/bin/env python3
"""Verify the shipped REEO Circuit Display font.

Runs structural checks with fontTools and, when the optional
``opentype-sanitizer`` package is installed, the same OTS sanitizer that
browsers use. Exits non-zero on the first failed check.

    python3 scripts/verify-font.py [path/to/font.ttf]
"""

from __future__ import annotations

import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_FONT = ROOT / "public/brand/REEOCircuitDisplay.ttf"

REQUIRED_TABLES = {
    "head", "hhea", "maxp", "OS/2", "hmtx", "cmap", "loca", "glyf",
    "name", "post", "GPOS", "GSUB",
}


def check(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL  {message}")
    print(f"ok    {message}")


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_FONT
    check(path.exists(), f"font exists at {path}")
    font = TTFont(path)
    cmap = font.getBestCmap()
    glyphs = font.getGlyphOrder()

    check(len(glyphs) >= 350, f"{len(glyphs)} glyphs (expected at least 350)")
    check(len(cmap) >= 340, f"{len(cmap)} mapped codepoints (expected at least 340)")
    check(REQUIRED_TABLES <= set(font.keys()), "all required OpenType tables present")

    latin1 = [
        code
        for code in (*range(0x20, 0x7F), *range(0xA0, 0x100))
        if code not in cmap
    ]
    exta = [code for code in range(0x100, 0x180) if code not in cmap]
    check(not latin1, f"Latin-1 complete ({len(latin1)} missing)")
    check(not exta, f"Latin Extended-A complete ({len(exta)} missing)")

    for code in (0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2020,
                 0x2026, 0x20AC, 0x2212):
        check(code in cmap, f"typographic glyph U+{code:04X} present")

    digit_widths = {font["hmtx"][cmap[code]][0] for code in range(0x30, 0x3A)}
    check(len(digit_widths) == 1, f"digits are tabular at {digit_widths.pop()} units")

    os2 = font["OS/2"]
    check(os2.version >= 4, f"OS/2 version {os2.version}")
    check(os2.fsType == 0, "embedding is unrestricted (fsType 0)")
    check(os2.sCapHeight == 700, f"cap height {os2.sCapHeight}")
    check(os2.sxHeight == 500, f"x-height {os2.sxHeight}")

    names = font["name"].names
    for name_id, label in ((1, "family"), (2, "style"), (4, "full name"),
                           (6, "PostScript name"), (13, "license")):
        values = {record.toUnicode() for record in names if record.nameID == name_id}
        check(bool(values), f"name ID {name_id} ({label}) present: {sorted(values)[:1]}")

    gpos_features = {record.FeatureTag for record in font["GPOS"].table.FeatureList.FeatureRecord}
    gsub_features = {record.FeatureTag for record in font["GSUB"].table.FeatureList.FeatureRecord}
    check("kern" in gpos_features, "GPOS kern feature present")
    check("ss01" in gsub_features, "GSUB ss01 feature present")

    pair_count = 0
    for lookup in font["GPOS"].table.LookupList.Lookup:
        for subtable in lookup.SubTable:
            if hasattr(subtable, "PairSet"):
                pair_count += sum(len(pair.PairValueRecord) for pair in subtable.PairSet)
    check(pair_count >= 150, f"{pair_count} kern pairs")

    missing_components = []
    for name in glyphs:
        glyph = font["glyf"][name]
        glyph.expand(font["glyf"])
        for component in getattr(glyph, "components", []):
            if component.glyphName not in glyphs:
                missing_components.append(f"{name} -> {component.glyphName}")
    check(not missing_components, "every composite component resolves")

    try:
        import ots
    except ImportError:
        print("skip  opentype-sanitizer not installed")
    else:
        result = ots.sanitize(str(path))
        check(result.returncode == 0, "OTS sanitizer accepts the font")

    print("\nverified", path)


if __name__ == "__main__":
    main()
