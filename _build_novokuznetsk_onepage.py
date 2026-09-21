#!/usr/bin/env python3
"""Local one-page clone: АвтоБлеск Новокузнецк + training.html (no deploy)."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent

spec = importlib.util.spec_from_file_location("clone_build", ROOT / "_build_two_dark_clones.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)

_tp_spec = importlib.util.spec_from_file_location("training_page", ROOT / "_training_page.py")
tp = importlib.util.module_from_spec(_tp_spec)
_tp_spec.loader.exec_module(tp)

PHOTO_SRC_DIR = "Автоблеск"  # D:\2 in\Автоблеск — фото этой студии

FIRM_URL = "https://2gis.ru/novokuznetsk/firm/70000001098503533"
SLUG = "avtoblesk-novokuznetsk"
PORT = 8092

# 2ГИС /tab/prices (21.09.2026)
CATALOG_SERVICES = [
    ("Сколы и трещины", "Ремонт лобового и боковых стёкол: локальная работа со сколами и трещинами.", "от 50 ₽"),
    ("Полировка-шлифовка стёкол", "Полировка и шлифовка стёкол от налёта, мутности и мелких царапин.", "от 1 000 ₽"),
    ("Полировка фар", "Восстановление прозрачности и блеска фар.", "от 2 000 ₽"),
    ("Антидождь", "Гидрофобная обработка стёкол — лучше видимость в дождь.", "от 500 ₽"),
    ("Полировка кузова автомобиля", "Восстановление блеска ЛКП и устранение мелких дефектов.", "от 1 000 ₽"),
    ("Керамика", "Защитное керамическое покрытие на кузов.", "от 3 000 ₽"),
    ("Химчистка автомобиля", "Глубокая очистка салона.", "от 4 000 ₽"),
    ("Шумоизоляция", "Шумоизоляция салона и отдельных зон.", "от 2 000 ₽"),
    ("Выезд на дом", "Выезд специалиста по согласованию.", "по запросу"),
]

SITE = {
    "slug": SLUG,
    "port": PORT,
    "firm_url": FIRM_URL,
    "brand": "АвтоБлеск",
    "brand_html": '<span>АВТО</span>БЛЕСК',
    "hero_html": '<span class="accent">АВТО</span><br>БЛЕСК',
    "about_html": 'СТУДИЯ ДЕТЕЙЛИНГА<br>В <span class="accent">НОВОКУЗНЕЦКЕ.</span>',
    "city_tag": "ДЕТЕЙЛИНГ · НОВОКУЗНЕЦК",
    "city_short": "НОВОКУЗНЕЦК",
    "city_contact": "Новокузнецке",
    "category": "Студия детейлинга",
    "hero_p": (
        "АвтоБлеск в Новокузнецке — ремонт сколов и трещин на стёклах, полировка и шлифовка стёкол, "
        "полировка фар и антидождь. Осмотр, согласование и контроль результата на выдаче."
    ),
    "home_services_intro": (
        "Специализируемся на стёклах и оптике: убираем сколы и трещины, возвращаем прозрачность "
        "лобовому и боковым стёклам, полируем фары. Цены — по 2ГИС, точная сумма после осмотра."
    ),
    "services_intro": (
        "Полный каталог услуг и цены — по данным 2ГИС. Точная стоимость после осмотра автомобиля."
    ),
    "works_h2": 'РЕЗУЛЬТАТ,<br><span class="accent">КОТОРЫЙ ВИДНО.</span>',
    "works_intro": "",
    # Mercedes под гексагональным светом студии
    "hero_image": "6cc22073-521c-4589-a7fe-3be052b4efac.jpg",
    # первые три идут в полоску под цитатой: сколы → полировка стёкол → фары
    "photo_order": [
        "a04c0150-71a5-4826-a288-8790f9871686.jpg",
        "79878f9b-cd9f-425a-9568-acf6795bf202.jpg",
        "8a00032b-72bc-4514-87d4-88e8dcdfd0f2.jpg",
        "b86f10a1-6718-4440-8abb-f841240103c5.jpg",
        "eb7c2043-2213-4075-a008-9c79810f6f76.jpg",
        "664de01b-4ce9-4d5f-829d-8e0e942774a3.jpg",
        "97a15389-f119-4221-9286-eec37083576b.jpg",
        "ebd0e450-5790-4006-9e79-2dd684304d4f.jpg",
    ],
    "photo_exclude": [],
    "about_intro": (
        "АвтоБлеск — студия детейлинга в Новокузнецке: качество, понятный сервис и контроль результата перед выдачей."
    ),
    "story_lead": "АвтоБлеск — команда, которая каждый день занимается детейлингом в Новокузнецке.",
    "story_p1": (
        "Студия на Аульской улице: полировка кузова и фар, керамика, химчистка, шумоизоляция и работа со стёклами. "
        "К каждому автомобилю — осмотр и согласование объёма работ."
    ),
    "story_p2": (
        "Нам важно, чтобы клиент понимал, за что платит: без лишних обещаний, с проверкой результата при выдаче. "
        "Так формируется доверие и возвращаются снова."
    ),
    "story_p3": (
        "Позвоните или напишите — подскажем по услугам, сориентируем по стоимости и подберём удобное время."
    ),
    "story_caption": "АВТОБЛЕСК · НОВОКУЗНЕЦК",
    "founder_name": "АвтоБлеск",
    "strip_tags": ["РЕМОНТ СКОЛОВ", "ПОЛИРОВКА СТЁКОЛ", "ПОЛИРОВКА ФАР"],
    "cards": [
        ("Ремонт сколов и трещин", "Локальный ремонт лобового и боковых стёкол — останавливаем расползание трещины."),
        ("Полировка стёкол", "Шлифовка и полировка: убираем мутность, налёт и мелкие царапины на стекле."),
        ("Полировка фар и антидождь", "Возвращаем свет фарам и наносим гидрофоб на стёкла для дождя."),
    ],
    "card_alts": ["Ремонт сколов на стекле", "Полировка автомобильных стёкол", "Полировка фар"],
    "services_extra": [],
    "catalog_services": CATALOG_SERVICES,
    "social_links": [],
    "reviews": [],
    "hours_short": "Ежедневно · по записи",
    "hours_footer": "Ежедневно · по записи",
    "hours_footer_extra": "",
    "server_name": "AvtobleskNvkSite",
    "photos_dir": "_media/avtoblesk-novokuznetsk",
    "hero_bg_position": "50% 62%",
    "hero_bg_position_mobile": "50% 58%",
}


_orig_parse_firm = b.parse_firm
b.fetch_photo_urls = lambda url: []  # фото берём локальные, 2ГИС-галерея не нужна

FIRM_CACHE = ROOT / "_firm_nvk_cache.json"


def parse_firm_nvk(url: str) -> dict:
    try:
        firm = _orig_parse_firm(url)
    except Exception as exc:  # 2ГИС иногда рвёт соединение — работаем с кэшем
        if not FIRM_CACHE.is_file():
            raise
        print(f"2ГИС недоступен ({exc}), беру данные из кэша")
        return json.loads(FIRM_CACHE.read_text(encoding="utf-8"))
    raw = (firm.get("addr_raw") or "").strip()
    firm["city"] = "Новокузнецк"
    firm["addr"] = f"г. Новокузнецк, {raw}" if raw else "г. Новокузнецк"
    firm["map_alt"] = f"Карта 2ГИС — г. Новокузнецк, {raw}" if raw else "Карта 2ГИС — Новокузнецк"
    brand = (firm.get("brand") or SITE["brand"]).strip()
    if "," in brand:
        brand = brand.split(",")[0].strip()
    firm["brand"] = brand or SITE["brand"]
    FIRM_CACHE.write_text(json.dumps(firm, ensure_ascii=False, indent=2), encoding="utf-8")
    return firm


_orig_local_photo_files = b.local_photo_files


def local_photo_files(site: dict) -> list:
    files = _orig_local_photo_files(site)
    exclude = {n.lower() for n in (site.get("photo_exclude") or [])}
    return [f for f in files if f.name.lower() not in exclude]


b.local_photo_files = local_photo_files

_orig_services_block = b.services_block


def services_block(site: dict) -> str:
    catalog = site.get("catalog_services")
    if not catalog:
        return _orig_services_block(site)
    rows = []
    for idx, item in enumerate(catalog, start=1):
        title, desc, cost = item
        rows.append(
            f'    <div class="service-row"><div class="idx">{idx:02d}</div>'
            f"<div><h3>{title}</h3><p>{desc}</p></div><div class=\"cost\">{cost}</div></div>"
        )
    return "\n".join(rows)


b.services_block = services_block
b.FIRM_ID[FIRM_URL] = "70000001098503533"
b.parse_firm = parse_firm_nvk  # used inside build_site only


def extract_main_chunk(html: str) -> str:
    m = re.search(r"</nav>\s*(.*?)\s*<div class=\"site-bottom\">", html, re.DOTALL)
    return m.group(1).strip() if m else ""


def strip_subpage_hero(chunk: str) -> str:
    return re.sub(
        r"<section class=\"subpage-hero\">.*?</section>\s*",
        "",
        chunk,
        count=1,
        flags=re.DOTALL,
    )


def strip_stats(chunk: str) -> str:
    return re.sub(r"<div class=\"stats\">.*?</div>\s*", "", chunk, count=1, flags=re.DOTALL)


def extract_one_section(chunk: str, pattern: str) -> str:
    m = re.search(pattern, chunk, re.DOTALL)
    return m.group(0).strip() if m else ""


def merge_onepage(dst: Path, site: dict) -> None:
    index = (dst / "index.html").read_text(encoding="utf-8")
    services = (dst / "services.html").read_text(encoding="utf-8")
    gallery = (dst / "gallery.html").read_text(encoding="utf-8")
    about = (dst / "about.html").read_text(encoding="utf-8")
    contact = (dst / "contact.html").read_text(encoding="utf-8")

    svc = strip_stats(strip_subpage_hero(extract_main_chunk(services)))
    gal = strip_stats(strip_subpage_hero(extract_main_chunk(gallery)))
    abt = strip_stats(strip_subpage_hero(extract_main_chunk(about)))
    con = strip_stats(strip_subpage_hero(extract_main_chunk(contact)))

    catalog = extract_one_section(svc, r"<section class=\"section\">.*?service-list.*?</section>")
    reviews = extract_one_section(
        gal,
        r'<section class="section">\s*<div class="section-head">[\s\S]*?<div class="reviews">[\s\S]*?</section>',
    )
    faq = extract_one_section(abt, r"<section class=\"process\">.*?<div class=\"faq\">.*?</section>")
    contact_box = extract_one_section(con, r"<section class=\"section\">.*?contact-box.*?</section>")

    extra_parts = []
    if catalog:
        extra_parts.append(catalog.replace('<section class="section">', '<section class="section" id="catalog">', 1))
    if reviews:
        extra_parts.append(reviews.replace('<section class="section">', '<section class="section" id="reviews">', 1))
    if faq:
        extra_parts.append(faq.replace('<section class="process">', '<section class="process" id="faq">', 1))
    if contact_box:
        extra_parts.append(
            contact_box.replace('<section class="section">', '<section class="section" id="contact-details">', 1)
        )

    extra = "\n\n".join(extra_parts)
    if extra:
        index = index.replace(
            '<div class="site-bottom">',
            f"\n{extra}\n\n<div class=\"site-bottom\">",
            1,
        )

    anchor_nav = (
        '<div class="links">'
        '<a href="#services">УСЛУГИ</a>'
        '<a href="#works">РАБОТЫ</a>'
        '<a href="#story">О СТУДИИ</a>'
        '<a href="#contacts">КОНТАКТЫ</a>'
        '<a href="training.html">ОБУЧЕНИЕ</a>'
        "</div>"
    )
    index = re.sub(r'<div class="links">.*?</div>', anchor_nav, index, count=1, flags=re.DOTALL)

    mobile_nav = (
        '<div class="nav-mobile-menu">'
        '<a href="#services">УСЛУГИ</a>'
        '<a href="#works">РАБОТЫ</a>'
        '<a href="#story">О СТУДИИ</a>'
        '<a href="#contacts">КОНТАКТЫ</a>'
        '<a href="training.html">ОБУЧЕНИЕ</a>'
        "</div>"
    )
    index = re.sub(
        r'<div class="nav-mobile-menu">.*?</div>',
        mobile_nav,
        index,
        count=1,
        flags=re.DOTALL,
    )

    for old, new in (
        ('href="services.html"', 'href="#catalog"'),
        ('href="gallery.html"', 'href="#works"'),
        ('href="about.html"', 'href="#story"'),
        ('href="contact.html"', 'href="#contacts"'),
    ):
        index = index.replace(old, new)

    index = re.sub(
        r'(<footer class="site-footer">[\s\S]*?</footer>)',
        lambda m: re.sub(
            r'href="(?:services|gallery|about|contact)\.html"',
            lambda n: {
                "services.html": 'href="#catalog"',
                "gallery.html": 'href="#works"',
                "about.html": 'href="#story"',
                "contact.html": 'href="#contacts"',
            }.get(n.group(0).split('"')[1], n.group(0)),
            m.group(1),
        ),
        index,
        count=1,
    )

    intro = (site.get("home_services_intro") or "").strip()
    if intro:
        index = re.sub(
            r'(<section class="section" id="services">[\s\S]*?<p class="intro">)([\s\S]*?)(</p>)',
            lambda m: m.group(1) + intro + m.group(3),
            index,
            count=1,
        )

    index = re.sub(
        r'<section class="section" id="about-more">[\s\S]*?</section>\s*',
        "",
        index,
    )
    index = re.sub(
        r'<section class="section" id="portfolio">[\s\S]*?</section>\s*',
        "",
        index,
    )
    index = index.replace('href="#portfolio"', 'href="#works"')
    index = index.replace(
        '<a href="#contacts">Контакты</a>',
        '<a href="#contacts">Контакты</a>\n      <a href="training.html">Обучение</a>',
    )

    (dst / "index.html").write_text(index, encoding="utf-8")


def sync_local_photos() -> None:
    """Mirror D:\\2 in\\Автоблеск into _media (exact Cyrillic name, no leftovers)."""
    src = Path("D:/2 in") / PHOTO_SRC_DIR
    if not src.is_dir():
        return
    dst = ROOT / SITE["photos_dir"]
    if dst.exists():
        shutil.rmtree(dst)
    dst.mkdir(parents=True)
    for f in sorted(src.iterdir()):
        if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            shutil.copy2(f, dst / f.name)


def build() -> None:
    sync_local_photos()
    site = dict(SITE)
    firm = parse_firm_nvk(FIRM_URL)
    if firm.get("brand"):
        site["brand"] = firm["brand"]
    if firm.get("reviews"):
        site["reviews"] = firm["reviews"]

    b.build_site(site)

    dst = ROOT / SLUG
    merge_onepage(dst, site)
    tp.write_training_assets(dst, site, firm)

    # свежий стиль после правок: пробиваем кэш браузера у всех страниц
    css_ver = hashlib.md5((dst / "styles.css").read_bytes()).hexdigest()[:8]
    for page in dst.glob("*.html"):
        text = page.read_text(encoding="utf-8")
        updated = re.sub(r"styles\.css\?v=[\w.]+", f"styles.css?v={css_ver}", text)
        if updated != text:
            page.write_text(updated, encoding="utf-8")

    print(f"OK: http://127.0.0.1:{PORT}/  |  training: /training.html")


if __name__ == "__main__":
    build()
