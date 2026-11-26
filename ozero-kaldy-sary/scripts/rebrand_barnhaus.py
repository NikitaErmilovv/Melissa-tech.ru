#!/usr/bin/env python3
"""One-off rebrand pass for ozero-kaldy-sary copy."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css"}

REPLACEMENTS = [
    ("ozero-kaldy-sary", "ozero-kaldy-sary"),
    ("map-ozero-kaldy-desktop", "map-ozero-kaldy-desktop"),
    ("map-ozero-kaldy-mobile", "map-ozero-kaldy-mobile"),
    ("https://2gis.ru/chelyabinsk/firm/70000001101369405", "https://2gis.ru/chelyabinsk/firm/70000001101369405"),
    ("70000001101369405", "70000001101369405"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("+7 (922) 999-92-75", "+7 (922) 999-92-75"),
    ("+79229999275", "+79229999275"),
    ("79229999275", "79229999275"),
    ("ОЗЕРО КАЛДЫ", "ОЗЕРО КАЛДЫ"),
    ("На берегу озера Калды", "На берегу озера Калды"),
    ("", ""),
    ("с. Сары, Полевая ул., 35", "с. Сары, Полевая ул., 35"),
    ("с. Сары, Полевая ул., 35", "с. Сары, Полевая ул., 35"),
    ("с. Сары", "с. Сары"),
    ("с. Сары", "с. Сары"),
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