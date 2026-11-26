#!/usr/bin/env python3
"""One-off rebrand pass for dobrynya-tobolsk copy."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css"}

REPLACEMENTS = [
    ("dobrynya-tobolsk", "dobrynya-tobolsk"),
    ("map-dobrynya-desktop", "map-dobrynya-desktop"),
    ("map-dobrynya-mobile", "map-dobrynya-mobile"),
    ("https://2gis.ru/tobolsk/firm/70000001051174149", "https://2gis.ru/tobolsk/firm/70000001051174149"),
    ("70000001051174149", "70000001051174149"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("+7 (952) 689-16-02", "+7 (952) 689-16-02"),
    ("+79526891602", "+79526891602"),
    ("79526891602", "79526891602"),
    ("ДОБРЫНЯ", "ДОБРЫНЯ"),
    ("Добрыня", "Добрыня"),
    ("", ""),
    ("Тобольск, Заречный пер., 9а", "Тобольск, Заречный пер., 9а"),
    ("Тобольск, Заречный пер., 9а", "Тобольск, Заречный пер., 9а"),
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