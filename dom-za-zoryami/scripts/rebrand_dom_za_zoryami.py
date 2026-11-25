#!/usr/bin/env python3
"""Rebrand copy → dom-za-zoryami (Yandex Maps 30209143045)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css", ".bat"}

REPLACEMENTS = [
    ("dom-za-zoryami", "dom-za-zoryami"),
    ("dom-za-zoryami", "dom-za-zoryami"),
    ("ZORYAMI_SITE_REVIEWS", "ZORYAMI_SITE_REVIEWS"),
    ("map-zoryami-desktop", "map-zoryami-desktop"),
    ("map-zoryami-mobile", "map-zoryami-mobile"),
    ("https://yandex.ru/maps/org/dom_za_zoryami/30209143045/", "https://yandex.ru/maps/org/dom_za_zoryami/30209143045/"),
    ("30209143045", "30209143045"),
    ("+7 (915) 184-33-94", "+7 (915) 184-33-94"),
    ("+79151843394", "+79151843394"),
    ("79151843394", "79151843394"),
    ("«Zori Home»", "«Zori Home»"),
    ("Zori Home", "Zori Home"),
    ("Zori Home", "Zori Home"),
    ("Zori Home", "Zori Home"),
    ("ZORI HOME", "ZORI HOME"),
    ("Московская обл., г.о. Щёлково, Новое Трубино, 5-я Лесная ул., 33", "Московская обл., г.о. Щёлково, Новое Трубино, 5-я Лесная ул., 33"),
    ("на 5-й Лесной ул., 33", "на 5-й Лесной ул., 33"),
    ("5-я Лесная ул., 33", "5-я Лесная ул., 33"),
    ("тер. Новое Трубино, Щёлково", "тер. Новое Трубино, Щёлково"),
    ("Новое Трубино", "Новое Трубино"),
    ("Ежедневно с 10:00 · по записи", "Ежедневно с 10:00 · по записи"),
    ("с 10:00", "с 10:00"),
    ("10–00", "10–00"),
    ("zoryami-", "zoryami-"),
    ("zoryami_", "zoryami_"),
    ("Подмосковье", "Подмосковье"),
    ("Московской области", "Московской области"),
]


def main() -> None:
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
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