#!/usr/bin/env python3
"""Rebrand u-kremlya-tobolsk copy → У Кремля (2GIS 70000001047635862)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css", ".bat"}

GIS = "https://2gis.ru/tobolsk/firm/70000001047635862"
FIRM_ID = "70000001047635862"
LAT, LON = "58.209204", "68.253582"
MAP_DESKTOP = (
    f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_MOBILE = (
    f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_ALT = "Карта 2ГИС — Тобольск, ул. Свердлова, 55"

REPLACEMENTS = [
    ("u-kremlya-tobolsk", "u-kremlya-tobolsk"),
    ("https://2gis.ru/tobolsk/firm/70000001047635862", GIS),
    ("70000001047635862", FIRM_ID),
    ("58.209204,68.253582", f"{LAT},{LON}"),
    ("58.209204,68.253582", f"{LAT},{LON}"),
    ("+79123803538", "+79123803538"),
    ("+7 (912) 380-35-38", "+7 (912) 380-35-38"),
    ("79123803538", "79123803538"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("У КРЕМЛЯ", "У КРЕМЛЯ"),
    ("«У Кремля»", "«У Кремля»"),
    ("У Кремля", "У Кремля"),
    ("У Кремля", "У Кремля"),
    ("гостевого дома", "гостевого дома"),
    ("u-kremlya-", "u-kremlya-"),
    ("map-u-kremlya-desktop.jpg", MAP_DESKTOP),
    ("map-u-kremlya-mobile.jpg", MAP_MOBILE),
    ("data-src=\"../img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("data-src=\"img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("Тобольск, ул. Свердлова, 55", "Тобольск, ул. Свердлова, 55"),
    ("Тобольск", "Тобольск"),
    ("Тобольск", "Тобольск"),
    ("55", "55"),
    ("Солнечная", "Солнечная"),
    ("Тобольск", "Тобольск"),
    ("Тобольск", "Тобольск"),
    ("Ждём вас в Тобольск, мкр. Лазурные берега.", "Ждём вас в Тобольск, мкр. Лазурные берега."),
    ("Ждём вас в Тобольск, мкр. Лазурные берега.", "Ждём вас в Тобольск, мкр. Лазурные берега."),
    ("Гостевой дом ·", "Гостевой дом ·"),
    ("Гостевой дом ", "Гостевой дом "),
    ("24–7", "24–7"),
    ("Круглосуточно", "Круглосуточно"),
    ('id="stat-reviews">130', 'id="stat-reviews">130'),
    (
        "Гостевой дом в стиле гостевого дома, Тобольск, ул. Свердлова, 55 — 4 комнаты, до 6 гостей, два этажа. Терраса, пергола, зона барбекю с мангалом; с середины мая — подогреваемый джакузи. Бронируем от суток.",
        "Гостевой дом «У Кремля» в Тобольске, ул. Свердлова, 55 — уютное размещение рядом с историческим центром, тёплый приём и всё для спокойного отдыха. Круглосуточно, бронь от суток.",
    ),
    (
        "Гостевой дом «У Кремля» на ул. Радужной, 1.",
        "«У Кремля», Тобольск, ул. Свердлова, 55.",
    ),
    (
        "Сообщение уйдёт на +7 (912) 380-35-38 — номер У Кремля (как в 2ГИС).",
        "Сообщение уйдёт на +7 (912) 380-35-38 — номер У Кремля (как в 2ГИС).",
    ),
    ('alt="Карта 2ГИС — Тобольск, ул. Свердлова, 55"', f'alt="{MAP_ALT}"'),
    ("address-map-detail-label--brand\">Коттедж", "address-map-detail-label--brand\">Гостевой дом"),
    ('<b id="stat-reviews">130</b>', '<b id="stat-reviews">130</b>'),
]

MAP_LAZY = [
    (
        'loading="lazy" decoding="async" data-src="../img/map-u-kremlya-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="../img/map-u-kremlya-mobile.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_MOBILE}" alt="{MAP_ALT}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-u-kremlya-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-u-kremlya-mobile.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_MOBILE}" alt="{MAP_ALT}"',
    ),
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
        for old, new in MAP_LAZY:
            text = text.replace(old, new)
        if text != orig:
            path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()