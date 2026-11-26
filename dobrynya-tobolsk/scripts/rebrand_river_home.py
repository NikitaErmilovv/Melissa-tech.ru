#!/usr/bin/env python3
"""Rebrand dobrynya-tobolsk copy → Добрыня (2GIS 70000001051174149)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css", ".bat"}

GIS = "https://2gis.ru/tobolsk/firm/70000001051174149"
FIRM_ID = "70000001051174149"
LAT, LON = "58.276545", "68.252493"
MAP_DESKTOP = (
    f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_MOBILE = (
    f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_ALT = "Карта 2ГИС — Тобольск, Заречный пер., 9а"

REPLACEMENTS = [
    ("dobrynya-tobolsk", "dobrynya-tobolsk"),
    ("https://2gis.ru/tobolsk/firm/70000001051174149", GIS),
    ("70000001051174149", FIRM_ID),
    ("58.276545,68.252493", f"{LAT},{LON}"),
    ("58.276545,68.252493", f"{LAT},{LON}"),
    ("+79526891602", "+79526891602"),
    ("+7 (952) 689-16-02", "+7 (952) 689-16-02"),
    ("79526891602", "79526891602"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("ДОБРЫНЯ", "ДОБРЫНЯ"),
    ("«Добрыня»", "«Добрыня»"),
    ("Добрыня", "Добрыня"),
    ("Добрыня", "Добрыня"),
    ("гостевого дома", "гостевого дома"),
    ("dobrynya-", "dobrynya-"),
    ("map-dobrynya-desktop.jpg", MAP_DESKTOP),
    ("map-dobrynya-mobile.jpg", MAP_MOBILE),
    ("data-src=\"../img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("data-src=\"img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("Тобольск, Заречный пер., 9а", "Тобольск, Заречный пер., 9а"),
    ("Тобольск", "Тобольск"),
    ("Тобольск", "Тобольск"),
    ("9а", "9а"),
    ("Солнечная", "Солнечная"),
    ("Тобольск", "Тобольск"),
    ("Тобольск", "Тобольск"),
    ("Ждём вас в Тобольск, мкр. Лазурные берега.", "Ждём вас в Тобольск, мкр. Лазурные берега."),
    ("Ждём вас в Тобольск, мкр. Лазурные берега.", "Ждём вас в Тобольск, мкр. Лазурные берега."),
    ("Гостевой дом ·", "Гостевой дом ·"),
    ("Гостевой дом ", "Гостевой дом "),
    ("24–7", "24–7"),
    ("Круглосуточно", "Круглосуточно"),
    ('id="stat-reviews">123', 'id="stat-reviews">123'),
    (
        "Гостевой дом в стиле гостевого дома, Тобольск, Заречный пер., 9а — 4 комнаты, до 6 гостей, два этажа. Терраса, пергола, зона барбекю с мангалом; с середины мая — подогреваемый джакузи. Бронируем от суток.",
        "База отдыха «Добрыня» в Тобольске, Заречный пер., 9а — бани, сауны, чан и зона для спокойного отдыха компанией. Принимаем круглосуточно, бронь по телефону или в мессенджерах.",
    ),
    (
        "Гостевой дом «Добрыня» на ул. Радужной, 1.",
        "«Добрыня», Тобольск, Заречный пер., 9а.",
    ),
    (
        "Сообщение уйдёт на +7 (952) 689-16-02 — номер Добрыня (как в 2ГИС).",
        "Сообщение уйдёт на +7 (952) 689-16-02 — номер Добрыня (как в 2ГИС).",
    ),
    ('alt="Карта 2ГИС — Тобольск, Заречный пер., 9а"', f'alt="{MAP_ALT}"'),
    ("address-map-detail-label--brand\">Коттедж", "address-map-detail-label--brand\">Гостевой дом"),
    ('<b id="stat-reviews">123</b>', '<b id="stat-reviews">123</b>'),
]

MAP_LAZY = [
    (
        'loading="lazy" decoding="async" data-src="../img/map-dobrynya-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="../img/map-dobrynya-mobile.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_MOBILE}" alt="{MAP_ALT}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-dobrynya-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-dobrynya-mobile.jpg"',
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