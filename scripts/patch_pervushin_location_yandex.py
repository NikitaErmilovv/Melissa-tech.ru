#!/usr/bin/env python3
"""Align Pervushin location block + footer with index (2GIS + Yandex)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "pervushin-avtokompleks-ekaterinburg"

OLD_TEXT = "        <p class=\"address-map-text\">Приезжайте по записи. Адрес и маршрут — в 2ГИС.</p>"
NEW_TEXT = """        <p class="address-map-text">Приезжайте по записи. Маршрут — в 2ГИС или Яндекс Картах.</p>
        <p class="address-map-ratings">2ГИС: <span id="location-gis-rating">4.9</span> · <span id="location-gis-count">112</span> оценок<br>Яндекс Карты: <span id="location-yandex-rating">4.4</span> · <span id="location-yandex-count">245</span> оценок</p>"""

OLD_BTN = (
    '        <a href="https://2gis.ru/ekaterinburg/firm/70000001034025330" '
    'class="address-map-btn" target="_blank" rel="noopener noreferrer">Как добраться</a>'
)
NEW_BTNS = """        <div class="address-map-actions">
          <a href="https://2gis.ru/ekaterinburg/firm/70000001034025330" class="address-map-btn" target="_blank" rel="noopener noreferrer">2ГИС</a>
          <a href="https://yandex.ru/maps/org/pervushin/204322764886/" class="address-map-btn address-map-btn--alt" target="_blank" rel="noopener noreferrer">Яндекс Карты</a>
        </div>"""

FOOTER_2GIS = (
    '<a href="https://2gis.ru/ekaterinburg/firm/70000001034025330" target="_blank" rel="noopener noreferrer">2ГИС</a></div>'
)
FOOTER_BOTH = (
    '<a href="https://2gis.ru/ekaterinburg/firm/70000001034025330" target="_blank" rel="noopener noreferrer">2ГИС</a>'
    '<a href="https://yandex.ru/maps/org/pervushin/204322764886/" target="_blank" rel="noopener noreferrer">Яндекс Карты</a></div>'
)

MAP_LINK_OPEN = (
    '        <a href="https://2gis.ru/ekaterinburg/firm/70000001034025330" class="address-map-frame" '
    'target="_blank" rel="noopener noreferrer">'
)
MAP_DIV_OPEN = '        <div class="address-map-frame">'

ALT_OLD = 'alt="Карта 2ГИС — г. Екатеринбург, ул. Новосибирская, 109/4"'
ALT_NEW = 'alt="Карта — г. Екатеринбург, ул. Новосибирская, 109/4"'


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text
    if OLD_TEXT in text:
        text = text.replace(OLD_TEXT, NEW_TEXT)
    if OLD_BTN in text:
        text = text.replace(OLD_BTN, NEW_BTNS)
    if FOOTER_2GIS in text and "Яндекс Карты" not in text.split("footer-social")[1][:400] if "footer-social" in text else True:
        text = text.replace(FOOTER_2GIS, FOOTER_BOTH)
    if MAP_LINK_OPEN in text:
        text = text.replace(MAP_LINK_OPEN, MAP_DIV_OPEN)
        # close frame link -> div (first </a> before address-map-decor in visual block)
        text = re.sub(
            r"(<div class=\"address-map-visual\">[\s\S]*?<div class=\"address-map-frame\">[\s\S]*?)\n        </a>\n        <div class=\"address-map-decor\">",
            r"\1\n        </div>\n        <div class=\"address-map-decor\">",
            text,
            count=1,
        )
    text = text.replace(ALT_OLD, ALT_NEW)
    if path.name != "index.html" and "stats.js" not in text and "contacts-config.js" in text:
        text = text.replace(
            '<script src="contacts-config.js"></script>',
            '<script src="contacts-config.js"></script>\n<script src="stats.js"></script>',
        )
    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for path in sorted(SITE.rglob("*.html")):
        if patch_file(path):
            print("patched", path.relative_to(ROOT))
            changed += 1
    partial = SITE / "partials" / "site-bottom-root.html"
    if partial.is_file() and patch_file(partial):
        print("patched", partial.relative_to(ROOT))
        changed += 1
    print(f"Total: {changed} files")


if __name__ == "__main__":
    main()
