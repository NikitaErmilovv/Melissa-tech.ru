#!/usr/bin/env python3
"""One-off rebrand pass for river-home-terentievo copy."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css"}

REPLACEMENTS = [
    ("river-home-terentievo", "river-home-terentievo"),
    ("map-river-home-desktop", "map-river-home-desktop"),
    ("map-river-home-mobile", "map-river-home-mobile"),
    ("https://2gis.ru/krasnoyarsk/firm/70000001100637525", "https://2gis.ru/krasnoyarsk/firm/70000001100637525"),
    ("70000001100637525", "70000001100637525"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("+7 (983) 504-51-16", "+7 (983) 504-51-16"),
    ("+79835045116", "+79835045116"),
    ("79835045116", "79835045116"),
    ("RIVER HOME", "RIVER HOME"),
    ("River home", "River home"),
    ("", ""),
    ("д. Терентьево, Солнечная ул., 14", "д. Терентьево, Солнечная ул., 14"),
    ("д. Терентьево, Солнечная ул., 14", "д. Терентьево, Солнечная ул., 14"),
    ("д. Терентьево", "д. Терентьево"),
    ("Терентьево", "Терентьево"),
    ("Круглосуточно", "Круглосуточно"),
    ("ежедневно", "ежедневно"),
]


def main() -> None:
    for path in ROOT.rglob("*"):
        if path.suffix not in TEXT_SUFFIXES or path.is_dir():
            continue
        if "node_modules" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        orig = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text != orig:
            path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()