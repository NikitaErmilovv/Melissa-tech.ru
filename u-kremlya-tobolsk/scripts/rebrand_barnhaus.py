#!/usr/bin/env python3
"""One-off rebrand pass for u-kremlya-tobolsk copy."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css"}

REPLACEMENTS = [
    ("u-kremlya-tobolsk", "u-kremlya-tobolsk"),
    ("map-u-kremlya-desktop", "map-u-kremlya-desktop"),
    ("map-u-kremlya-mobile", "map-u-kremlya-mobile"),
    ("https://2gis.ru/tobolsk/firm/70000001047635862", "https://2gis.ru/tobolsk/firm/70000001047635862"),
    ("70000001047635862", "70000001047635862"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("+7 (912) 380-35-38", "+7 (912) 380-35-38"),
    ("+79123803538", "+79123803538"),
    ("79123803538", "79123803538"),
    ("У КРЕМЛЯ", "У КРЕМЛЯ"),
    ("У Кремля", "У Кремля"),
    ("", ""),
    ("Тобольск, ул. Свердлова, 55", "Тобольск, ул. Свердлова, 55"),
    ("Тобольск, ул. Свердлова, 55", "Тобольск, ул. Свердлова, 55"),
    ("Тобольск", "Тобольск"),
    ("Тобольск", "Тобольск"),
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