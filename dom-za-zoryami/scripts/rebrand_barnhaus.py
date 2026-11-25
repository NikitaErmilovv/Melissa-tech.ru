#!/usr/bin/env python3
"""One-off rebrand pass for dom-za-zoryami copy."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css"}

REPLACEMENTS = [
    ("dom-za-zoryami", "dom-za-zoryami"),
    ("map-zoryami-desktop", "map-zoryami-desktop"),
    ("map-zoryami-mobile", "map-zoryami-mobile"),
    ("https://yandex.ru/maps/org/dom_za_zoryami/30209143045/", "https://yandex.ru/maps/org/dom_za_zoryami/30209143045/"),
    ("30209143045", "30209143045"),
    ("ZORYAMI_SITE_REVIEWS", "ZORYAMI_SITE_REVIEWS"),
    ("+7 (915) 184-33-94", "+7 (915) 184-33-94"),
    ("+79151843394", "+79151843394"),
    ("79151843394", "79151843394"),
    ("ZORI HOME", "ZORI HOME"),
    ("Zori Home", "Zori Home"),
    ("", ""),
    ("Московская обл., г.о. Щёлково, Новое Трубино, 5-я Лесная ул., 33", "Московская обл., г.о. Щёлково, Новое Трубино, 5-я Лесная ул., 33"),
    ("Московская обл., г.о. Щёлково, Новое Трубино, 5-я Лесная ул., 33", "Московская обл., г.о. Щёлково, Новое Трубино, 5-я Лесная ул., 33"),
    ("тер. Новое Трубино, Щёлково", "тер. Новое Трубино, Щёлково"),
    ("Новое Трубино", "Новое Трубино"),
    ("Ежедневно с 10:00 · по записи", "Ежедневно с 10:00 · по записи"),
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