#!/usr/bin/env python3
"""One-off rebrand pass for belaya-bereza-tyumen copy."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css"}

REPLACEMENTS = [
    ("belaya-bereza-tyumen", "belaya-bereza-tyumen"),
    ("map-belaya-bereza-desktop", "map-belaya-bereza-desktop"),
    ("map-belaya-bereza-mobile", "map-belaya-bereza-mobile"),
    ("https://2gis.ru/tyumen/firm/70000001117255594", "https://2gis.ru/tyumen/firm/70000001117255594"),
    ("70000001117255594", "70000001117255594"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("+7 (982) 918-70-31", "+7 (982) 918-70-31"),
    ("+79829187031", "+79829187031"),
    ("79829187031", "79829187031"),
    ("БЕЛАЯ БЕРЕЗА", "БЕЛАЯ БЕРЕЗА"),
    ("Белая береза", "Белая береза"),
    ("", ""),
    ("Тюмень, ул. Степана Третьякова, 58а", "Тюмень, ул. Степана Третьякова, 58а"),
    ("Тюмень, ул. Степана Третьякова, 58а", "Тюмень, ул. Степана Третьякова, 58а"),
    ("Тюмень", "Тюмень"),
    ("Тюмень", "Тюмень"),
    ("По предварительной записи", "По предварительной записи"),
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