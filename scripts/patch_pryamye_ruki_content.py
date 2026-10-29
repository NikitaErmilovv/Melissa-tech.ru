#!/usr/bin/env python3
"""One-off content sync for pryamye-ruki-55-omsk (services + contacts)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "pryamye-ruki-55-omsk"

NAV_OLD = """  <div class="nav-actions">
    <a class="phone" href="tel:+79087939563">+7 (908) 793-95-63</a>"""

NAV_NEW = """  <div class="nav-actions">
    <div class="nav-phones nav-phones--desktop">
      <a class="nav-phone" href="tel:+79136273852"><span class="nav-phone-label">Автосигнализации · Сергей</span>+7 (913) 627-38-52</a>
      <a class="nav-phone" href="tel:+79087939563"><span class="nav-phone-label">Бронирование / тонирование · Артём</span>+7 (908) 793-95-63</a>
      <a class="nav-phone" href="tel:+79681022224"><span class="nav-phone-label">Автосвет · Анатолий</span>+7 (968) 102-22-24</a>
    </div>
    <a class="phone phone--nav-mobile" href="tel:+79087939563">+7 (908) 793-95-63</a>"""

PHONES_BLOCK = """            <div class="address-map-phones">
              <div class="address-map-phone-entry">
                <span class="address-map-phone-label">Автосигнализации · Сергей</span>
                <a href="tel:+79136273852" class="address-map-phone">+7 (913) 627-38-52</a>
              </div>
              <div class="address-map-phone-entry">
                <span class="address-map-phone-label">Бронирование / тонирование · Артём</span>
                <a href="tel:+79087939563" class="address-map-phone">+7 (908) 793-95-63</a>
              </div>
              <div class="address-map-phone-entry">
                <span class="address-map-phone-label">Автосвет · Анатолий</span>
                <a href="tel:+79681022224" class="address-map-phone">+7 (968) 102-22-24</a>
              </div>
            </div>"""

PHONES_OLD_RE = re.compile(
    r'<div class="address-map-phones">\s*'
    r'<a href="tel:\+79087939563" class="address-map-phone">\+7 \(908\) 793-95-63</a>\s*'
    r"</div>",
    re.MULTILINE,
)

FOOTER_PHONES = """      <div class="footer-phone-stack">
        <span class="footer-phone-line"><b>Автосигнализации</b> · <a class="footer-phone-inline" href="tel:+79136273852">+7 (913) 627-38-52</a> Сергей</span>
        <span class="footer-phone-line"><b>Бронирование / тонирование</b> · <a class="footer-phone-inline" href="tel:+79087939563">+7 (908) 793-95-63</a> Артём</span>
        <span class="footer-phone-line"><b>Автосвет</b> · <a class="footer-phone-inline" href="tel:+79681022224">+7 (968) 102-22-24</a> Анатолий</span>
      </div>"""

FOOTER_OLD = re.compile(
    r'<div class="footer-col footer-col--phones">\s*<b>КОНТАКТЫ</b>\s*'
    r'<a class="footer-phone-inline" href="tel:\+79087939563">\+7 \(908\) 793-95-63</a>\s*</div>',
    re.MULTILINE,
)

FOOTER_MOB_OLD = re.compile(
    r'<div class="footer-phones-block">\s*<b>КОНТАКТЫ</b>\s*'
    r'<a class="footer-phone-inline" href="tel:\+79087939563">\+7 \(908\) 793-95-63</a>\s*</div>',
    re.MULTILINE,
)

FOOTER_MOB_NEW = """      <div class="footer-phones-block">
        <b>КОНТАКТЫ</b>
""" + FOOTER_PHONES.replace("      ", "        ") + """
      </div>"""

FOOTER_DESK_NEW = """    <div class="footer-col footer-col--phones">
      <b>КОНТАКТЫ</b>
""" + FOOTER_PHONES + """
    </div>"""

MAP_COORDS = "54.9852,73.3338"


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text
    if NAV_OLD in text:
        text = text.replace(NAV_OLD, NAV_NEW)
    text = PHONES_OLD_RE.sub(PHONES_BLOCK, text)
    text = text.replace("г. Омск, 253-й квартал, стр. 19", "г. Омск, ул. Енисейская, 3в")
    text = text.replace("г. Омск, 253-й квартал, стр. 19", "г. Омск, ул. Енисейская, 3в")
    text = text.replace("По предварительной записи · 10:00–20:00", "Пн.–Сб. 10:00–18:00 · вс выходной")
    text = text.replace("54.976351,73.341101", MAP_COORDS)
    text = text.replace("Карта 2ГИС — г. Омск, 253-й квартал, стр. 19", "Карта — г. Омск, ул. Енисейская, 3в")
    text = FOOTER_OLD.sub(FOOTER_DESK_NEW, text)
    text = FOOTER_MOB_OLD.sub(FOOTER_MOB_NEW, text)
    text = text.replace(
        '<span>По предварительной записи · 10:00–20:00</span>',
        "<span>Пн.–Сб. 10:00–18:00 · вс выходной</span>",
    )
    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    n = 0
    for path in sorted(SITE.rglob("*.html")):
        if patch_file(path):
            print("patched", path.relative_to(ROOT))
            n += 1
    print("total", n)


if __name__ == "__main__":
    main()
