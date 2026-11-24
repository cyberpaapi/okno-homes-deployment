#!/usr/bin/env python3
"""Build owner-approved public OKNO faces with 108% glyph height.

Requires fontTools with Brotli support. Sources are the existing, corrected WOFF2
faces; original files and their copyright/license name records are never edited.
Only glyph y coordinates change. Advances, bearings, kerning and all line metrics
remain identical. Separate family names allow public pages to opt in while the
admin and configurator continue to use their original faces.

Run from any directory: python3 scripts/build-okno-height-fonts.py [--check]
"""

import argparse
import json
from pathlib import Path

from fontTools.misc.roundTools import otRound
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "public/fonts"
SCALE = 1.08
CUTS = [
    ("kento-light", "kento-h108-light", "Kento OKNO 108", "Light", "woff"),
    ("kento-regular", "kento-h108-regular", "Kento OKNO 108", "Regular", "woff"),
    ("kento-bold", "kento-h108-bold", "Kento OKNO 108", "Bold", "woff"),
    ("govandi-adhiwan-regular", "govandi-adhiwan-h108-regular", "Govandi OKNO 108", "Regular", "ttf"),
]


def verify(source: TTFont, result: TTFont) -> int:
    """Check every outline point and the layout tables, not just sample letters."""
    assert source.getGlyphOrder() == result.getGlyphOrder()
    for table in ("hmtx", "hhea", "OS/2", "GPOS", "GSUB"):
        assert source[table].compile(source) == result[table].compile(result), table
    points = 0
    for name in source.getGlyphOrder():
        original = source["glyf"][name]
        derived = result["glyf"][name]
        assert not original.isComposite(), f"Composite needs explicit transform: {name}"
        if not original.numberOfContours:
            continue
        assert original.endPtsOfContours == derived.endPtsOfContours, name
        assert original.flags == derived.flags, name
        for (x, y), (new_x, new_y) in zip(original.coordinates, derived.coordinates, strict=True):
            assert new_x == x and new_y == otRound(y * SCALE), name
            points += 1
    return points


def build() -> None:
    inventory_path = ROOT / "config/public-assets.json"
    inventory = json.loads(inventory_path.read_text())
    for source_name, target, family, style, fallback in CUTS:
        source_path = FONTS / f"{source_name}.woff2"
        # Recompute outline bounds explicitly; automatic hhea recalculation can
        # normalize the supplied side-bearing extrema despite unchanged widths.
        font = TTFont(source_path, recalcTimestamp=False, recalcBBoxes=False)
        bounds = []
        for name in font.getGlyphOrder():
            glyph = font["glyf"][name]
            if glyph.isComposite():
                raise ValueError(f"Unexpected composite in supplied font: {name}")
            if glyph.numberOfContours:
                if glyph.program.getBytecode():
                    raise ValueError(f"Unexpected hinted outline in supplied font: {name}")
                for point in range(len(glyph.coordinates)):
                    x, y = glyph.coordinates[point]
                    glyph.coordinates[point] = (x, otRound(y * SCALE))
                glyph.recalcBounds(font["glyf"])
                bounds.append((glyph.xMin, glyph.yMin, glyph.xMax, glyph.yMax))
        font["head"].xMin = min(bound[0] for bound in bounds)
        font["head"].yMin = min(bound[1] for bound in bounds)
        font["head"].xMax = max(bound[2] for bound in bounds)
        font["head"].yMax = max(bound[3] for bound in bounds)
        # Preserve original copyright, attribution and license records. Distinct
        # names avoid cached originals being mistaken for the public derivative.
        names = {1: family, 2: style, 3: f"{family}-{style}-108", 4: f"{family} {style}",
                 6: f"{family.replace(' ', '')}-{style}", 16: family, 17: style}
        for record in font["name"].names:
            if record.nameID in names:
                record.string = names[record.nameID].encode(record.getEncoding())
        for extension in ("woff2", fallback):
            font.flavor = None if extension == "ttf" else extension
            output = FONTS / f"{target}.{extension}"
            font.save(output)
            verify(TTFont(source_path), TTFont(output))
            inventory[f"/fonts/{output.name}"] = output.stat().st_size
    inventory_path.write_text(json.dumps(inventory, indent=2) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify existing derivatives without writing files")
    args = parser.parse_args()
    if not args.check:
        build()
    report = []
    for source, target, _, _, fallback in CUTS:
        for extension in ("woff2", fallback):
            count = verify(TTFont(FONTS / f"{source}.woff2"), TTFont(FONTS / f"{target}.{extension}"))
            report.append({"font": f"{target}.{extension}", "verified_points": count,
                           "y_scale": SCALE, "horizontal_and_line_metrics": "unchanged"})
    print(json.dumps(report, indent=2))
