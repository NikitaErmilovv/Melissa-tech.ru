#!/usr/bin/env python3
"""Fresh RP clone → Avto LuX (Магнитогорск) with custom photos and copy."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "rp-detailing-tolyatti"
DEST = ROOT / "autolux-magnitogorsk"
ASSETS = Path("/home/ubuntu/.cursor/projects/workspace/assets")

LAT, LON = "58.978295", "53.378026"
MAP_C = f"{LAT},{LON}"
FIRM_URL = "https://2gis.ru/magnitogorsk/firm/70000001048501918"
MAP_DESKTOP = (
    f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={MAP_C}&amp;z=17&amp;pt={MAP_C}~k:p"
)
MAP_MOBILE = (
    f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={MAP_C}&amp;z=17&amp;pt={MAP_C}~k:p"
)
MAP_ALT = "Карта 2ГИС — Магнитогорск, проспект Карла Маркса, 172"

PHONE_TEL = "+79128053390"
PHONE_DISPLAY = "+7 (912) 805-33-90"
ADDRESS = "ТРК Семейный парк, проспект Карла Маркса, 172, цокольный этаж"
HOURS = "Открыто · Ежедневно с 10:00 до 20:00"

# Attached JPGs in stable order (by filename)
PHOTO_SRC = sorted(ASSETS.glob("*.jpg"), key=lambda p: p.name)
assert len(PHOTO_SRC) >= 10, f"need photos in {ASSETS}"

PHOTO_PLAN = {
    "hero": PHOTO_SRC[0],
    "services": PHOTO_SRC[1:6],
    "works_index": PHOTO_SRC[6:11] if len(PHOTO_SRC) >= 11 else PHOTO_SRC[1:6],
    "about_big": PHOTO_SRC[10] if len(PHOTO_SRC) > 10 else PHOTO_SRC[0],
    "about_a": PHOTO_SRC[1],
    "about_b": PHOTO_SRC[2],
}

REPLACEMENTS: list[tuple[str, str]] = [
    ("https://2gis.ru/togliatti/firm/70000001067251376", FIRM_URL),
    ("53.534132,49.25991", MAP_C),
    ("+79626123368", PHONE_TEL),
    ("+7 (962) 612-33-68", PHONE_DISPLAY),
    ("+7 (96) 612-33-68", PHONE_DISPLAY),
    ("79626123368", "79128053390"),
    ("https://t.me/+79626123368", "https://t.me/+79128053390"),
    ("https://wa.me/79626123368", "https://wa.me/79128053390"),
    ("По предварительной записи · 10:00–20:00", HOURS),
    ("г. Тольятти, 253-й квартал, стр. 19", ADDRESS),
    ("Карта 2ГИС — г. Тольятти, 253-й квартал, стр. 19", MAP_ALT),
    ("ТОЛЬЯТТИ", "МАГНИТОГОРСК"),
    ("Тольятти", "Магнитогорск"),
    ('<span class="logo-mark">РП</span><span class="logo-word"></span>', '<span class="logo-mark">AVTO</span><span class="logo-word">LuX</span>'),
    ('<span class="logo-mark">РП</span>', '<span class="logo-mark">AVTO</span><span class="logo-word">LuX</span>'),
    ("РП", "Avto LuX"),
    ("© 2026 РП", "© 2026 Avto LuX"),
    ("ДЕТЕЙЛИНГ-СТУДИЯ · ТОЛЬЯТТИ", "AVTO LuX · МАГНИТОГОРСК"),
    (
        "Детейлинг-центр в Тольятти: мойка, полировка, защитные покрытия, антикор и тонировка по записи.",
        "Avto LuX в ТРК Семейный парк: тонировка, бронирование, полировка, детейлинг-мойка и уход за салоном.",
    ),
    (
        "детейлинг-студия на Московском проспекте в Автозаводском районе Тольятти. Уход за кузовом и салоном, полировка, плёнка и тонировка. Работаем по записи — звоните или пишите.",
        f"Центр тонирования и бронирования в Магнитогорске — {ADDRESS}. Полировка, плёнка, химчистка и детейлинг по записи.",
    ),
    ('<b id="stat-reviews">51</b>', '<b id="stat-reviews">278</b>'),
    ('reviewsEl.textContent = \'51\'', "reviewsEl.textContent = '278'"),
]

SERVICES_HOME = [
    ("polish.html", "01.jpg", "ПОЛИРОВКА"),
    ("ceramic.html", "02.jpg", "КЕРАМИКА"),
    ("ppf.html", "03.jpg", "БРОНЕПЛЁНКА"),
    ("interior.html", "04.jpg", "ХИМЧИСТКА САЛОНА"),
    ("wash.html", "05.jpg", "ДЕТЕЙЛИНГ-МОЙКА"),
]

SERVICES_PAGE = [
    ("polish.html", "Полировка", "Восстановление блеска и глубины ЛКП."),
    ("ceramic.html", "Керамика", "Защитное керамическое покрытие кузова."),
    ("ppf.html", "Бронеплёнка", "Прозрачная антигравийная плёнка на зоны риска."),
    ("interior.html", "Химчистка салона", "Глубокая очистка салона и текстиля."),
    ("wash.html", "Детейлинг-мойка", "Бережная мойка кузова и салона."),
    ("wrap.html", "Оклейка плёнкой", "Защитная и декоративная оклейка кузова."),
    ("tint.html", "Тонировка", "Тонировка стёкол и атермальные плёнки."),
    ("soundproof.html", "Шумоизоляция", "Шумо- и виброизоляция салона."),
]

REVIEWS = [
    {
        "name": "Владимир Слатин",
        "text": "Быстро и качественно все сделали👍 Порадовала цена.",
        "rating": 5,
        "date": "08.11.2026",
        "id": "lux-1",
    },
    {
        "name": "Александр Олегович",
        "text": "Сделали все отлично. Рекомендую!",
        "rating": 5,
        "date": "08.11.2026",
        "id": "lux-2",
    },
    {
        "name": "Александр Олегович",
        "text": "Обращаюсь не первый раз, делают всегда аккуратно и быстро, по приемлемым ценам. 👍",
        "rating": 5,
        "date": "07.11.2026",
        "id": "lux-3",
    },
    {
        "name": "Александр Сумароков",
        "text": "Очень качественная тонировка ребята молодцы , приезжайте не пожалеете , одним словом мастера своего дела",
        "rating": 5,
        "date": "06.11.2026",
        "id": "lux-4",
    },
    {
        "name": "Серык Тынштыкбаев",
        "text": "Хотелось бы выразить огромную благодарность команде Avto LuX за предоставленную услугу по тонированию передней полусферы и полировку фар. Обращаюсь в Avto LuX не в первый раз. Парни свое дело знают. Проверено,советую обращаться только к ним!",
        "rating": 5,
        "date": "05.11.2026",
        "id": "lux-5",
    },
    {
        "name": "Геворг Мелоян",
        "text": "Очень приятные парни работают. Подъехал, быстро соорентировали, все сделали. Вообщем я доволен",
        "rating": 5,
        "date": "04.11.2026",
        "id": "lux-6",
    },
]


def copy_site() -> None:
    if DEST.exists():
        shutil.rmtree(DEST)
    shutil.copytree(
        SRC,
        DEST,
        ignore=shutil.ignore_patterns("__pycache__", ".DS_Store"),
    )
    for junk in ("anticor.html", "engine-bay.html", "glass-polish.html"):
        p = DEST / "services" / junk
        if p.exists():
            p.unlink()


def patch_text_files() -> None:
    for path in DEST.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".html", ".js", ".json", ".css", ".py", ".txt", ".md"}:
            continue
        text = path.read_text(encoding="utf-8")
        for old, new in sorted(REPLACEMENTS, key=lambda x: -len(x[0])):
            text = text.replace(old, new)
        # Footer social: add VK
        text = text.replace(
            '<a href="https://t.me/+79128053390" target="_blank" rel="noopener noreferrer">Telegram</a><a href="'
            + FIRM_URL
            + '"',
            '<a href="https://t.me/+79128053390" target="_blank" rel="noopener noreferrer">Telegram</a>'
            '<a href="https://vk.ru/tonirovka_avto_magnitogorsk" target="_blank" rel="noopener noreferrer">VK</a><a href="'
            + FIRM_URL
            + '"',
        )
        path.write_text(text, encoding="utf-8")

    accent_block = """:root{
  --accent:#feca32;
  --accent-soft:rgba(254,202,50,.42);
  --accent-hover:#ffd65c;
  --accent-deep:#d4a820;
  --accent-ink:#0a0a0a;
  --accent-rgb:254,202,50;
}"""
    css = (DEST / "styles.css").read_text(encoding="utf-8")
    css = re.sub(
        r":root\{[^}]+\}",
        accent_block,
        css,
        count=1,
    )
    (DEST / "styles.css").write_text(css, encoding="utf-8")


def install_photos() -> None:
    ba = DEST / "img" / "works" / "before-after"
    ba.mkdir(parents=True, exist_ok=True)

    # wipe old images except before-after
    for sub in ("services-home", "works/incoming", "works/studio"):
        d = DEST / "img" / sub
        if d.exists():
            shutil.rmtree(d)
    (DEST / "img" / "hero-home.jpg").unlink(missing_ok=True)
    (DEST / "img" / "logo-hero.png").unlink(missing_ok=True)

    (DEST / "img" / "services-home").mkdir(parents=True)
    shutil.copy2(PHOTO_PLAN["hero"], DEST / "img" / "hero-home.jpg")
    for i, src in enumerate(PHOTO_PLAN["services"]):
        shutil.copy2(src, DEST / "img" / "services-home" / f"{i + 1:02d}.jpg")

    album = DEST / "img" / "works" / "incoming" / "autolux"
    album.mkdir(parents=True)
    for i, src in enumerate(PHOTO_SRC, start=1):
        shutil.copy2(src, album / f"{i:02d}.jpg")

    studio = DEST / "img" / "works" / "studio"
    studio.mkdir(parents=True)
    for i, src in enumerate(PHOTO_SRC[:6], start=1):
        shutil.copy2(src, studio / f"{i:02d}.jpg")


def patch_index() -> None:
    index = DEST / "index.html"
    html = index.read_text(encoding="utf-8")
    html = re.sub(
        r'<h1 class="hero-logo-spacer"[^>]*>.*?</h1>\s*<img class="hero-brand-logo"[^>]+>',
        '<h1 class="hero-logo-spacer">ДЕТЕЙЛИНГ-<br>СТУДИЯ<br><span class="accent">AVTO LuX</span></h1>',
        html,
        count=1,
        flags=re.S,
    )
    strip_rows = []
    for slug, img, tag in SERVICES_HOME:
        strip_rows.append(
            f'    <a class="photo" href="services/{slug}" '
            f'style="background-image:url(\'img/services-home/{img}\')">'
            f'<span class="tag">{tag}</span></a>'
        )
    html = re.sub(
        r'<div class="photo-strip photo-strip--services photo-strip--home">.*?</div>',
        "<div class=\"photo-strip photo-strip--services photo-strip--home\">\n"
        + "\n".join(strip_rows)
        + "\n  </div>",
        html,
        count=1,
        flags=re.S,
    )
    works_rows = []
    for i in range(1, min(6, len(PHOTO_SRC) + 1)):
        works_rows.append(
            f'    <a class="photo" href="gallery.html" '
            f'style="background-image:url(\'img/works/incoming/autolux/{i:02d}.jpg\')"></a>'
        )
    html = re.sub(
        r'<div class="photo-strip photo-strip--services">\s*<a class="photo" href="gallery\.html".*?</div>',
        "<div class=\"photo-strip photo-strip--services\">\n" + "\n".join(works_rows) + "\n  </div>",
        html,
        count=1,
        flags=re.S,
    )
    index.write_text(html, encoding="utf-8")


def patch_services_page() -> None:
    rows = []
    for i, (slug, title, lead) in enumerate(SERVICES_PAGE, start=1):
        rows.append(
            f'    <a class="service-row" href="services/{slug}" id="svc-{i:02d}">'
            f'<div class="idx">{i:02d}</div><div><h3>{title}</h3>'
            f'<div class="service-desc"><p class="service-lead">{lead}</p></div></div>'
            f'<div class="cost">после осмотра</div></a>'
        )
    path = DEST / "services.html"
    html = path.read_text(encoding="utf-8")
    html = re.sub(
        r'<motion class="service-list">|<div class="service-list">.*?</div>',
        lambda m: '<div class="service-list">\n' + "\n".join(rows) + "\n  </div>"
        if "service-list" in m.group(0)
        else m.group(0),
        html,
        count=1,
        flags=re.S,
    )
    # fallback if regex failed
    if "svc-09" not in html:
        html = re.sub(
            r"<div class=\"service-list\">.*?</div>",
            "<div class=\"service-list\">\n" + "\n".join(rows) + "\n  </div>",
            html,
            count=1,
            flags=re.S,
        )
    html = html.replace(
        "ДЕТЕЙЛИНГ-СТУДИЯ<br><span class=\"accent\">МАГНИТОГОРСК</span>",
        "AVTO LuX<br><span class=\"accent\">МАГНИТОГОРСК</span>",
    )
    path.write_text(html, encoding="utf-8")


def patch_about() -> None:
    path = DEST / "about.html"
    html = path.read_text(encoding="utf-8")
    html = re.sub(
        r"<div class=\"photo-strip\">.*?</div>",
        '<div class="photo-strip">\n'
        f'    <div class="photo big" style="background-image:url(\'img/works/incoming/autolux/11.jpg\')"></div>\n'
        f'    <div class="photo" style="background-image:url(\'img/works/incoming/autolux/02.jpg\')"></div>\n'
        f'    <div class="photo" style="background-image:url(\'img/works/incoming/autolux/03.jpg\')"></div>\n'
        "  </div>",
        html,
        count=1,
        flags=re.S,
    )
    path.write_text(html, encoding="utf-8")


def write_reviews_and_gallery() -> None:
    (DEST / "data" / "reviews-2gis.json").write_text(
        json.dumps(REVIEWS, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    items = [
        {"file": f"img/works/incoming/autolux/{i:02d}.jpg", "title": f"Работа {i}"}
        for i in range(1, len(PHOTO_SRC) + 1)
    ]
    (DEST / "data" / "gallery-manifest.json").write_text(
        json.dumps({"items": items}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    g = DEST / "gallery.html"
    html = g.read_text(encoding="utf-8")
    html = html.replace('data-photo-dir="rp"', 'data-photo-dir="autolux"')
    html = html.replace("img/works/incoming/rp/", "img/works/incoming/autolux/")
    g.write_text(html, encoding="utf-8")

    contacts = '''window.STUDIO_MESSENGERS = {
  wa: "79128053390",
  tg: "+79128053390",
  max: "",
  defaultMessage: "Здравствуйте! Хочу записаться в Avto LuX.",
};
'''
    (DEST / "contacts-config.js").write_text(contacts, encoding="utf-8")

    server = (DEST / "server.py").read_text(encoding="utf-8")
    server = re.sub(r"PORT = \d+", "PORT = 8148", server)
    server = server.replace(FIRM_URL, FIRM_URL).replace(
        'FIRM_URL = "https://2gis.ru/togliatti/firm/70000001067251376"',
        f'FIRM_URL = "{FIRM_URL}"',
    )
    (DEST / "server.py").write_text(server, encoding="utf-8")


def main() -> None:
    copy_site()
    install_photos()
    patch_text_files()
    patch_index()
    patch_services_page()
    patch_about()
    write_reviews_and_gallery()
  # fix titles
    for name in ("index.html", "services.html", "gallery.html", "about.html", "contact.html"):
        p = DEST / name
        if p.exists():
            t = p.read_text(encoding="utf-8")
            t = t.replace("<title>Услуги — Avto LuX</title>", "<title>Услуги — Avto LuX</title>")
            t = re.sub(
                r"<title>[^<]*РП[^<]*</title>",
                lambda m: "<title>Avto LuX — Магнитогорск</title>"
                if "index" in name
                else m.group(0).replace("РП", "Avto LuX"),
                t,
            )
            if name == "index.html":
                t = re.sub(r"<title>.*?</title>", "<title>Avto LuX — Магнитогорск</title>", t, count=1)
            elif name == "services.html":
                t = re.sub(r"<title>.*?</title>", "<title>Услуги — Avto LuX</title>", t, count=1)
            elif name == "gallery.html":
                t = re.sub(r"<title>.*?</title>", "<title>Работы — Avto LuX</title>", t, count=1)
            elif name == "about.html":
                t = re.sub(r"<title>.*?</title>", "<title>О нас — Avto LuX</title>", t, count=1)
            elif name == "contact.html":
                t = re.sub(r"<title>.*?</title>", "<title>Контакты — Avto LuX</title>", t, count=1)
            p.write_text(t, encoding="utf-8")

    print(f"OK {DEST} ({len(PHOTO_SRC)} photos)")


if __name__ == "__main__":
    main()
