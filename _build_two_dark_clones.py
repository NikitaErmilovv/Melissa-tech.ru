#!/usr/bin/env python3
"""Clone dark-detailing for two 2GIS firms with photos and branding."""

from __future__ import annotations

import html as html_lib
import json
import os
import re
import shutil
import stat
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "dark-detailing"

COMMON_SERVICES = [
    ("Тонирование авто", "Тонировка стёкол: боковые, задняя полусфера и по задаче — комфорт и внешний вид.", "от 1 000 ₽"),
    ("Бронирование плёнкой", "Антигравийная плёнка на кузов и зоны риска — защита ЛКП от сколов и пескоструя.", "от 20 000 ₽"),
    ("Автоматическая тонировка", "Электротонировка с управлением затемнением — комфорт днём и прозрачность по необходимости.", "от 65 000 ₽"),
    ("Откидные рамки", "Установка откидных рамок номерного знака — аккуратный монтаж и проверка механизма.", "от 25 000 ₽"),
    ("Химчистка салона", "Глубокая очистка салона: сиденья, ковры, потолок и пластик без повреждения материалов.", "от 10 000 ₽"),
    ("Полировка", "Полировка кузова и оптики — убираем риски, возвращаем глубину цвета и блеск.", "от 8 000 ₽"),
    ("Установка bi-led линз", "Модернизация света: bi-led линзы в фары с настройкой пучка и герметизацией.", "от 16 000 ₽"),
    ("Установка выезжающих порогов", "Электрические выезжающие пороги: подбор, монтаж и проверка работы на автомобиле.", "от 50 000 ₽"),
    ("Шумоизоляция", "Шумоизоляция дверей, пола и арок — меньше шума дороги и вибраций в салоне.", "от 5 000 ₽"),
    ("Установка сетки в бампер", "Защитная сетка в бампер — защита радиатора от камней, пуха и насекомых.", "от 4 000 ₽"),
    ("Нанесение защитных покрытий на кузов", "Керамика и защитные составы на кузов — блеск, гидрофоб и более простой уход.", "от 5 000 ₽"),
    ("Антихром", "Чёрные акценты на решётке, молдингах и эмблемах — аккуратная оклейка или покраска.", "от 5 000 ₽"),
    ("Установка доводчиков дверей", "Доводчики дверей — плавное закрывание и комфорт в ежедневной эксплуатации.", "от 25 000 ₽"),
    ("Оклейка виниловой плёнкой", "Виниловая оклейка элементов кузова — стиль, защита и возможность сменить образ.", "от 20 000 ₽"),
]

SITES = [
    {
        "slug": "brilliant-auto-blagoveshchensk",
        "port": 8090,
        "firm_url": "https://2gis.ru/blagoveshensk/firm/70000001090035899",
        "brand": "Brilliant auto",
        "brand_html": '<span>BRILLIANT</span> AUTO',
        "hero_html": '<span class="accent">BRILLIANT</span><br>AUTO',
        "about_html": 'ДЕТЕЙЛИНГ И ТОНИРОВКА<br>В <span class="accent">БЛАГОВЕЩЕНСКЕ.</span>',
        "city_tag": "ДЕТЕЙЛИНГ · БЛАГОВЕЩЕНСК",
        "city_short": "БЛАГОВЕЩЕНСК",
        "city_contact": "Благовещенске",
        "category": "Тонировка и защита автомобиля",
        "hero_p": "Brilliant auto в Благовещенске — тонировка стёкол, бронирование плёнкой, полировка и комплексный уход. Работаем аккуратно, согласуем задачу до старта и показываем результат на выдаче.",
        "services_intro": "Специализируемся на тонировке и защите автомобиля: подбираем плёнку и режим затемнения под ваши задачи и требования.",
        "works_h2": "РАБОТЫ,<br><span class=\"accent\">КОТОРЫЕ ВИДНО.</span>",
        "works_intro": "Фото студии и реальные работы из 2ГИС — тонировка, плёнка и уход за автомобилем без лишних обещаний.",
        "about_intro": "Brilliant auto — студия в Благовещенске, где в приоритете аккуратная работа и понятный результат. Осмотр, согласование и контроль перед выдачей — без суеты.",
        "story_lead": "Brilliant auto — команда, которая каждый день занимается тонировкой и защитой автомобилей в Благовещенске.",
        "story_p1": "Студия выросла из практики: сначала — свои автомобили и знакомые, затем постоянные клиенты и рекомендации. Сегодня здесь делают тонировку, бронирование и комплексный уход под конкретную задачу.",
        "story_p2": "Главный принцип — не обещать лишнего. Сначала осмотр и согласование, потом работа и проверка результата при выдаче. Так клиенты понимают, за что платят, и возвращаются снова.",
        "story_p3": "На связи в мессенджерах и по телефону: можно уточнить стоимость, записаться и прислать фото автомобиля до визита.",
        "story_caption": "BRILLIANT AUTO · БЛАГОВЕЩЕНСК",
        "founder_name": "Brilliant auto",
        "strip_tags": ["ТОНИРОВКА", "ПЛЁНКА", "ПОЛИРОВКА"],
        "cards": [
            ("01 — TINT", "Тонировка", "Тонировка стёкол и атермальная плёнка — комфорт в салоне и аккуратный внешний вид."),
            ("02 — PPF", "Бронирование", "Антигравийная плёнка на кузов и зоны риска — защита ЛКП от сколов и пескоструя."),
            ("03 — SHINE", "Полировка", "Полировка кузова и оптики — возвращаем глубину цвета и ровный блеск."),
        ],
        "card_alts": ["Тонировка автомобиля", "Бронирование плёнкой", "Полировка кузова"],
        "services_extra": [],
        "social_links": [
            ("WhatsApp", "https://wa.me/79146055353"),
            ("Telegram", "https://t.me/+79146154914"),
        ],
        "reviews": [
            (
                "Александр Ипатов",
                "Отличное место и отзывчивые специалисты, приемлемые цены. Константин и Анастасия — профессионалы: подскажут, расскажут и посоветуют.",
            ),
            (
                "Oleg V",
                "Спасибо ребятам за качественно выполненную работу: грамотно подобранная тонировка на заднюю часть поверх заводского напыления и оклейка кузова плёнкой с вниманием к мелочам.",
            ),
            (
                "Андрей Владимирович",
                "Искал, где затонировать Nissan Elgrand — порекомендовали Brilliant auto. Затонировали плёнкой 3%, цена и качество на высшем уровне. Однозначно рекомендую.",
            ),
        ],
        "hours_short": "Ежедневно · 10:00–20:00 · по записи",
        "hours_footer": "Ежедневно · 10:00 – 20:00",
        "hours_footer_extra": "",
        "server_name": "BrilliantAutoSite",
    },
    {
        "slug": "avtoblesk138-irkutsk",
        "port": 8091,
        "firm_url": "https://2gis.ru/irkutsk/firm/70000001007523786",
        "brand": "Автоблеск138",
        "brand_html": '<span>АВТО</span>БЛЕСК138',
        "hero_html": '<span class="accent">АВТО</span><br>БЛЕСК138',
        "about_html": 'АВТОМОЙКА И УХОД<br>В <span class="accent">ИРКУТСКЕ.</span>',
        "city_tag": "АВТОМОЙКА · ИРКУТСК",
        "city_short": "ИРКУТСК",
        "city_contact": "Иркутске",
        "category": "Автомойка и комплексный уход",
        "hero_p": "Автоблеск138 в Иркутске — автомойка, химчистка салона, полировка и детейлинг-услуги. Запись по телефону, аккуратная работа и понятный результат на выдаче.",
        "services_intro": "От экспресс-мойки до глубокой химчистки и полировки — подбираем формат ухода под состояние автомобиля и ваши задачи.",
        "works_h2": "ЧИСТОТА,<br><span class=\"accent\">КОТОРАЯ ВИДНА.</span>",
        "works_intro": "Реальные фото студии из 2ГИС: мойка, салон и финишная выдача — то, как мы работаем на практике.",
        "about_intro": "Автоблеск138 — автомойка в Иркутске с акцентом на качество и сервис. Каждый автомобиль проходит подготовку и контроль перед выдачей.",
        "story_lead": "Автоблеск138 — место, куда в Иркутске приезжают за чистым автомобилем и спокойным сервисом.",
        "story_p1": "Начинали с мойки и базового ухода, со временем добавили химчистку, полировку и защитные процедуры. Сегодня это полноценная студия ухода за автомобилем.",
        "story_p2": "Мы не гонимся за количеством машин в день — важнее, чтобы клиент забрал авто в том состоянии, которое обещали. Осмотр, согласование и финальная проверка входят в каждый визит.",
        "story_p3": "Позвоните или напишите — подскажем по услугам, сориентируем по стоимости и подберём удобное время.",
        "story_caption": "АВТОБЛЕСК138 · ИРКУТСК",
        "founder_name": "Автоблеск138",
        "strip_tags": ["МОЙКА", "САЛОН", "ПОЛИРОВКА"],
        "cards": [
            ("01 — WASH", "Автомойка", "Комплексная и детальная мойка кузова и колёс — аккуратно и без повреждения ЛКП."),
            ("02 — INTERIOR", "Химчистка", "Глубокая химчистка салона: сиденья, ковры, потолок и пластик."),
            ("03 — SHINE", "Полировка", "Полировка кузова и восстановление блеска — заметный результат на свету."),
        ],
        "card_alts": ["Автомойка", "Химчистка салона", "Полировка кузова"],
        "services_extra": [
            ("Комплексная мойка", "Мойка кузова, колёс и сушка — базовый уход для ежедневной эксплуатации.", "от 500 ₽"),
            ("Детейлинг-мойка", "Детальная мойка с проработкой зон и финишной сушкой.", "от 2 000 ₽"),
        ],
        "reviews": [
            (
                "Ангелина Баськова",
                "Обращались на полную чистку салона — быстро и качественно, рекомендуем.",
            ),
            (
                "Oksana Vilkova",
                "Отличная автомойка! Комплекс кузов + салон: кузов блестит без разводов, в салоне вычистили каждый уголок. Персонал вежливый, сделали быстро и аккуратно.",
            ),
            (
                "Греческий Салат",
                "Отлично моют, часто заезжаю. Советую эту автомойку!",
            ),
        ],
        "hours_short": "Ежедневно · 09:00–22:00",
        "hours_footer": "Ежедневно · 09:00 – 22:00",
        "hours_footer_extra": "",
        "social_links": [],
        "server_name": "Avtoblesk138Site",
    },
]

PHOTO_KEY = "gYu1s9N1wP"
FIRM_ID = {
    "https://2gis.ru/blagoveshensk/firm/70000001090035899": "70000001090035899",
    "https://2gis.ru/irkutsk/firm/70000001007523786": "70000001007523786",
}

OLD_PHONE_TEL = "+79096155666"
OLD_PHONE_DISPLAY = "+7 (909) 615-56-66"
OLD_FIRM = "https://2gis.ru/orenburg/firm/70000001081193888"
OLD_COORDS = "51.819701,55.16107"
OLD_ADDR = "г. Оренбург, ул. Транспортная, 6/1"
OLD_MAP_ALT = "Карта 2ГИС — г. Оренбург, ул. Транспортная, 6/1"
OLD_TG = "https://t.me/dark_detailing"
OLD_VK = "https://vk.com/dark_detailing56"
OLD_WA = "https://wa.me/79621549668"
OLD_WA_909 = "https://wa.me/79096155666"
OLD_HERO_P = "Команда Dark Detailing профессионально занимается детейлингом в Оренбурге более 5 лет: тонировка, бронирование, полировка, оклейка и комплексный уход — без компромиссов по качеству."
OLD_FOUNDER_LEAD = "Основатель Dark Detailing. Команда занимается детейлингом в Оренбурге более пяти лет."
OLD_ABOUT_HERO = "Основатель — Виктор Дужик. Команда Dark Detailing работает в Оренбурге более 5 лет: тонировка, бронирование, полировка, оклейка и комплексный уход."
OLD_ABOUT_INTRO = "Виктор Дужик создал Dark Detailing как студию, где качество важнее скорости. Каждый автомобиль проходит осмотр, подготовку и контроль результата — поэтому клиенты возвращаются снова."
OLD_CONTACT_INTRO = "Телефон, Telegram и адрес студии в Оренбурге. Работаем по записи — связывайтесь напрямую."
OLD_SERVICES_INTRO = "Команда Dark Detailing профессионально занимается детейлингом более 5 лет. Ниже — основные направления. Финальная стоимость определяется после осмотра автомобиля."
OLD_DARK_REVIEW = "«Заклеила крышу, зеркала, фары и атермалкой лобовое стекло — машина выглядит шикарно. Виктор сам предложил, что сделать, и за полдня всё сделал. В восторге, спасибо!»"
OLD_ABOUT_H1 = 'DARK DETAILING<br>В <span class="accent">ОРЕНБУРГЕ.</span>'

# Shared template assets (same on all clone sites)
CARD_IMAGES = ["img/polish.png", "img/ppf.png", "img/interior.png"]
PORTFOLIO_MAX = 15
STRIP_PHOTOS = 3
BA_TEMPLATE_FILES = (
    "hood-before.jpg",
    "hood-after.jpg",
    "headlight-before.jpg",
    "headlight-after.jpg",
)
BA_CACHE_VER = "ba-template"


def onerror(func, path, _exc):
    os.chmod(path, stat.S_IWRITE)
    func(path)


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", "ignore")


def fetch_photo_urls(firm_url: str) -> list[str]:
    oid = FIRM_ID.get(firm_url)
    if not oid:
        return []
    api = (
        f"https://api.photo.2gis.com/3.0/objects/{oid}/albums/all/media"
        f"?key={PHOTO_KEY}&page_size=50&locale=ru_RU&preview_size=1920x1080%2C656x340"
    )
    req = urllib.request.Request(api, headers={"User-Agent": "Mozilla/5.0", "Referer": "https://2gis.ru/"})
    try:
        with urllib.request.urlopen(req, timeout=40) as resp:
            data = json.loads(resp.read().decode("utf-8", "ignore"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return []
    urls: list[str] = []
    for item in data.get("items") or []:
        photo = item.get("photo") or {}
        previews = photo.get("preview_urls") or {}
        u = previews.get("1920x1080") or previews.get("656x340") or photo.get("url")
        if u and u not in urls:
            urls.append(u)
    return urls


def normalize_phone(raw: str) -> tuple[str, str]:
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("8") and len(digits) == 11:
        digits = "7" + digits[1:]
    if not digits.startswith("7"):
        digits = "7" + digits[-10:]
    tel = "+" + digits
    if len(digits) == 11:
        disp = f"+7 ({digits[1:4]}) {digits[4:7]}-{digits[7:9]}-{digits[9:11]}"
    else:
        disp = tel
    return tel, disp


def parse_firm(url: str) -> dict:
    html = fetch_html(url)
    og_title = re.search(r'property="og:title"\s+content="([^"]+)"', html)
    title = html_lib.unescape(og_title.group(1)) if og_title else ""
    brand = title.split(" на карте")[0].strip()

    addrs = re.findall(r'"full_address_name":"([^"]+)"', html)
    addr_raw = addrs[0] if addrs else ""
    if not addr_raw:
        m = re.search(r'"address_name"\s*:\s*"([^"]+)"', html)
        addr_raw = m.group(1) if m else ""

    latlon = re.search(
        r'"point"\s*:\s*\{\s*"lat"\s*:\s*([0-9.]+)\s*,\s*"lon"\s*:\s*([0-9.]+)', html
    )
    coords = f"{latlon.group(1)},{latlon.group(2)}" if latlon else ""

    phones_raw = list(dict.fromkeys(re.findall(r'"text":"(\+7[^"]+)"', html)))
    if not phones_raw:
        phones_raw = list(dict.fromkeys(re.findall(r"\+7[\d\s\-()‒–—]{8,20}", html)))
    phone_tel, phone_display = normalize_phone(phones_raw[0]) if phones_raw else ("", "")

    photos = fetch_photo_urls(url)
    if not photos:
        for u in re.findall(r'"url"\s*:\s*"(https://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"', html, re.I):
            u = u.replace("\\u002F", "/").replace("\\/", "/")
            if "avatar" in u or "logo" in u.lower() or "profile" in u:
                continue
            if u not in photos:
                photos.append(u)
    ordered = photos

    reviews: list[tuple[str, str]] = []
    for block in re.finditer(
        r'"text"\s*:\s*"((?:\\.|[^"\\])*)".*?"user"\s*:\s*\{.*?"name"\s*:\s*"((?:\\.|[^"\\])*)"',
        html,
        re.DOTALL,
    ):
        try:
            text = json.loads(f'"{block.group(1)}"')
            author = json.loads(f'"{block.group(2)}"')
        except json.JSONDecodeError:
            continue
        if len(text) < 25:
            continue
        reviews.append((author, text))
        if len(reviews) >= 3:
            break

    city = ""
    if "благовещ" in addr_raw.lower() or "blagov" in url:
        city = "Благовещенск"
        addr = f"г. Благовещенск, {addr_raw}"
        map_alt = f"Карта 2ГИС — г. Благовещенск, {addr_raw}"
    else:
        city = "Иркутск"
        addr = f"г. Иркутск, {addr_raw}"
        map_alt = f"Карта 2ГИС — г. Иркутск, {addr_raw}"

    return {
        "brand": brand or "",
        "addr": addr,
        "addr_raw": addr_raw,
        "coords": coords,
        "phone_tel": phone_tel,
        "phone_display": phone_display,
        "photos": ordered[:24],
        "reviews": reviews,
        "map_alt": map_alt,
        "city": city,
    }


def download(url: str, path: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        data = urllib.request.urlopen(req, timeout=40).read()
        if len(data) < 3000:
            return False
        path.write_bytes(data)
        return True
    except Exception:
        return False


def download_maps(dst_img: Path, coords: str) -> None:
    lat, lon = coords.split(",")
    urls = {
        dst_img / "map-desktop.png": f"https://static.maps.2gis.com/1.0?s=880x450&c={lat},{lon}&z=18&pt={lat},{lon}~k:p",
        dst_img / "map-mobile.png": f"https://static.maps.2gis.com/1.0?s=720x720&c={lat},{lon}&z=18&pt={lat},{lon}~k:p",
    }
    for path, url in urls.items():
        download(url, path)


def copy_template_works(works: Path) -> None:
    """Keep template hero, strip, and before/after sliders — not 2GIS photos."""
    src_works = SRC / "img" / "works"
    if not src_works.is_dir():
        return
    if works.exists():
        shutil.rmtree(works, onerror=onerror)
    shutil.copytree(src_works, works, dirs_exist_ok=True)


def ensure_template_before_after(works: Path) -> None:
    """Always restore Dark Detailing slider frames (never 2GIS)."""
    src_ba = SRC / "img" / "works" / "before-after"
    if not src_ba.is_dir():
        return
    dst_ba = works / "before-after"
    dst_ba.mkdir(parents=True, exist_ok=True)
    for name in BA_TEMPLATE_FILES:
        src = src_ba / name
        if src.is_file():
            shutil.copy2(src, dst_ba / name)


def apply_ba_slider_cache_bust(text: str) -> str:
    for name in BA_TEMPLATE_FILES:
        plain = f'img/works/before-after/{name}'
        busted = f"{plain}?v={BA_CACHE_VER}"
        text = text.replace(f'src="{plain}?v={BA_CACHE_VER}"', f'src="{busted}"')
        text = text.replace(f'src="{plain}"', f'src="{busted}"')
    return text


def setup_photos(dst: Path, urls: list[str]) -> list[str]:
    works = dst / "img" / "works"
    copy_template_works(works)
    portfolio = works / "portfolio"
    portfolio.mkdir(parents=True, exist_ok=True)

    names: list[str] = []
    for i, url in enumerate(urls[:PORTFOLIO_MAX], start=1):
        ext = ".jpg" if ".jpg" in url.lower() else ".png"
        fname = f"gallery-{i:02d}{ext}"
        path = portfolio / fname
        if download(url, path):
            names.append(fname)

    if not names and (works / "hero.jpg").is_file():
        # Fallback: reuse template work files for gallery if 2GIS download fails
        for j, p in enumerate(sorted(works.glob("work-*.jpg"))[:PORTFOLIO_MAX], start=1):
            dest = portfolio / f"gallery-{j:02d}.jpg"
            shutil.copy2(p, dest)
            names.append(dest.name)

    ensure_template_before_after(works)
    return names


def services_block(site: dict) -> str:
    rows = []
    services = site["services_extra"] + COMMON_SERVICES
    for idx, (title, desc, cost) in enumerate(services, start=1):
        rows.append(
            f'    <div class="service-row"><div class="idx">{idx:02d}</div><div><h3>{title}</h3><p>{desc}</p></div><div class="cost">{cost}</div></div>'
        )
    return "\n".join(rows)


def cards_block(site: dict) -> str:
    cards = []
    for i, (num, title, desc) in enumerate(site["cards"]):
        alt = site["card_alts"][i]
        img = CARD_IMAGES[i] if i < len(CARD_IMAGES) else CARD_IMAGES[0]
        cards.append(
            f"""    <article class="card">
      <div class="card-media"><img src="{img}" alt="{alt}"></div>
      <div class="card-body"><div class="num">{num}</div><div><h3>{title}</h3><p>{desc}</p></div></div>
    </article>"""
        )
    return "\n".join(cards)


def gallery_block(portfolio_names: list[str]) -> str:
    items = []
    layouts = [
        "wide",
        "tall",
        "",
        "",
        "wide",
        "",
        "wide",
        "tall",
        "",
        "tall",
        "wide",
        "",
        "",
        "wide",
        "",
    ]
    for i, name in enumerate(portfolio_names[:PORTFOLIO_MAX]):
        cls = layouts[i % len(layouts)]
        extra = f" {cls}" if cls else ""
        items.append(
            f"    <div class=\"g{extra}\" style=\"background-image:url('img/works/portfolio/{name}')\"></div>"
        )
    return "\n".join(items)


def strip_block(site: dict, portfolio_names: list[str]) -> str:
    """Photo strip under the quote — real 2GIS photos, not template stock."""
    sizes = ["big", "", ""]
    pool = portfolio_names[:STRIP_PHOTOS]
    while len(pool) < STRIP_PHOTOS and portfolio_names:
        pool.append(portfolio_names[len(pool) % len(portfolio_names)])
    rows = []
    for i, tag in enumerate(site["strip_tags"]):
        cls = f"photo {sizes[i]}" if sizes[i] else "photo"
        if i < len(pool):
            img = f"img/works/portfolio/{pool[i]}"
        else:
            img = "img/works/hero.jpg"
        rows.append(
            f'    <div class="{cls}" style="background-image:url(\'{img}\')"><span class="tag">{tag}</span></div>'
        )
    return "\n".join(rows)


def reviews_block(site: dict, firm: dict) -> str:
    brand = site.get("brand") or firm.get("brand") or ""
    rows = []
    for author, review in (site.get("reviews") or firm.get("reviews") or [])[:3]:
        snippet = review if len(review) <= 220 else review[:217] + "…"
        rows.append(
            f'    <div class="review"><div class="stars">★★★★★</div><p>«{snippet}»</p><small>{author} · 2ГИС</small></div>'
        )
    fallbacks = [
        f"«Обратился в {brand} — быстро сориентировали по цене и сделали аккуратно. Результатом доволен.»",
        f"«Приятный сервис и понятная коммуникация. Автомобиль забрал в срок, всё чисто и ровно.»",
        f"«Рекомендую — объяснили нюансы до начала работ и показали результат на выдаче.»",
    ]
    while len(rows) < 3:
        rows.append(
            f'    <div class="review"><div class="stars">★★★★★</div><p>{fallbacks[len(rows)]}</p><small>Клиент · 2ГИС</small></div>'
        )
    return "\n".join(rows)


def contact_links(site: dict, firm_url: str) -> str:
    parts = [f'<a href="tel:{site.get("_phone_tel", "")}">{site.get("_phone_display", "")}</a>']
    for label, href in site.get("social_links") or []:
        parts.append(
            f'<a href="{href}" target="_blank" rel="noopener noreferrer">{label}</a>'
        )
    parts.append(f'<a href="{firm_url}" target="_blank" rel="noopener noreferrer">2ГИС</a>')
    return " · ".join(parts)


def footer_social(site: dict, firm_url: str) -> str:
    links = list(site.get("social_links") or [])
    links.append(("2ГИС", firm_url))
    parts = []
    for label, href in links:
        parts.append(f'<a href="{href}" target="_blank" rel="noopener noreferrer">{label}</a>')
    return "".join(parts)


def apply_file(
    text: str, filename: str, site: dict, firm: dict, portfolio_names: list[str]
) -> str:
    brand = site["brand"] or firm["brand"]
    hero = "hero.jpg"
    site = {
        **site,
        "_phone_tel": firm["phone_tel"],
        "_phone_display": firm["phone_display"],
    }
    services_intro = (
        f"{brand} — {site['category'].lower()}. "
        "Ниже основные направления. Финальная стоимость определяется после осмотра автомобиля."
    )
    about_hero = (
        f"{brand} в {site['city_contact']}: {site['category'].lower()}. "
        "Работаем по записи — звоните или пишите в мессенджер."
    )
    faq_contact = site["social_links"][0][1] if site.get("social_links") else site["firm_url"]
    faq_label = site["social_links"][0][0] if site.get("social_links") else "2ГИС"

    text = text.replace(OLD_HERO_P, site["hero_p"])
    text = text.replace(OLD_FOUNDER_LEAD, site["story_lead"])
    text = text.replace(OLD_ABOUT_HERO, about_hero)
    text = text.replace(OLD_ABOUT_INTRO, site["about_intro"])
    text = text.replace(OLD_CONTACT_INTRO, f"Телефон и адрес в {site['city_contact']}. Работаем по записи — связывайтесь напрямую.")
    text = text.replace(OLD_SERVICES_INTRO, services_intro)
    text = text.replace(
        OLD_DARK_REVIEW,
        f"«Рекомендую {brand} — аккуратная работа и понятный результат на выдаче.»",
    )
    text = text.replace(OLD_WA_909, faq_contact)
    text = text.replace(OLD_WA, faq_contact)

    text = text.replace("Dark Detailing — детейлинг", f"{brand} — детейлинг")
    text = text.replace("Dark Detailing", brand)
    text = text.replace("<span>DARK</span> DETAILING", site["brand_html"])
    text = text.replace("© 2026 Dark Detailing", f"© 2026 {brand}")
    text = text.replace("ДЕТЕЙЛИНГ · ОРЕНБУРГ", site["city_tag"])
    text = text.replace('<span class="accent">DARK</span><br>DETAILING', site["hero_html"])
    text = text.replace(
        "ДЕТЕЙЛИНГ-СТУДИЯ<br>В <span class=\"accent\">ОРЕНБУРГЕ.</span>",
        site["about_html"],
    )
    text = text.replace(OLD_ABOUT_H1, site["about_html"])
    text = text.replace("<h2><span class=\"accent\">Виктор Дужик</span></h2>", f'<h2><span class="accent">{site["founder_name"]}</span></h2>')
    text = text.replace("Виктор Дужик", brand)
    text = text.replace("в Оренбурге", f"в {site['city_contact']}")
    text = text.replace("Оренбурге", site["city_contact"])
    text = text.replace("Оренбург", site["city_short"].title())
    text = text.replace("адрес студии в Оренбурге", f"адрес в {site['city_contact']}")
    text = text.replace("<h2>ОРЕНБУРГ</h2>", f"<h2>{site['city_short']}</h2>")
    text = text.replace(OLD_ADDR, firm["addr"])
    text = text.replace(f"г. {site['city_short'].title()}, ул. Транспортная, 6/1", firm["addr"])
    text = text.replace(f"Карта 2ГИС — г. {site['city_short'].title()}, ул. Транспортная, 6/1", firm["map_alt"])
    text = text.replace(OLD_FIRM, site["firm_url"])
    text = text.replace(OLD_COORDS, firm["coords"])
    text = text.replace(OLD_MAP_ALT, firm["map_alt"])
    text = text.replace(OLD_PHONE_TEL, firm["phone_tel"])
    text = text.replace(OLD_PHONE_DISPLAY, firm["phone_display"])
    text = text.replace("https://t.me/dark_detailing", site["social_links"][0][1] if site.get("social_links") else site["firm_url"])
    text = text.replace("https://vk.com/dark_detailing56", site["firm_url"])
    text = text.replace("Telegram", site["social_links"][0][0] if site.get("social_links") else "2ГИС")
    text = text.replace("ВКонтакте", "2ГИС")
    text = text.replace("Пн–Пт · 10:00–20:00 · по записи", site["hours_short"])
    text = text.replace("Пн–Пт 10:00–20:00 · по записи", site["hours_short"])
    text = text.replace("Пн–Пт · 10:00 – 20:00", site["hours_footer"])
    text = text.replace("Пн–Сб · 10:00 – 20:00", site["hours_footer"])
    hours_map = site["hours_footer"].replace(" · ", " ")
    text = text.replace("Ежедневно 10:00–20:00", hours_map)
    text = text.replace("Ежедневно · 10:00–20:00", site["hours_short"])
    text = text.replace("<span>Сб–Вс · выходной</span>", site["hours_footer_extra"])
    text = text.replace(
        "Каждая услуга начинается с диагностики состояния автомобиля. Подбираем решение под конкретный кузов, салон и задачу владельца.",
        site["services_intro"],
    )
    text = text.replace(
        "<h2>БЛЕСК,<br><span class=\"accent\">КОТОРЫЙ ВИДНО.</span></h2>",
        f"<h2>{site['works_h2']}</h2>",
    )
    text = text.replace(
        "Мы показываем не обещания, а результат: отражение света, чистоту линий и фактуру покрытия.",
        site["works_intro"],
    )
    text = text.replace(
        "Мы не гонимся за количеством машин в день. Каждый автомобиль проходит диагностику, подготовку и контроль результата. Именно поэтому процесс может занимать больше времени — и именно поэтому результат заметен.",
        site["about_intro"],
    )
    text = text.replace("DARK DETAILING · ОРЕНБУРГ", site["story_caption"])
    text = text.replace(
        f'Позвоните или напишите в <a href="{faq_contact}">{faq_label}</a> / <a href="{faq_contact}">{faq_label}</a>',
        f'Позвоните или напишите в <a href="{faq_contact}">{faq_label}</a>',
    )

    text = re.sub(
        r"(<div class=\"founder-story\">).*?(</div>\s*</div>\s*<div class=\"founder-visual\">)",
        lambda m: m.group(1)
        + f"\n          <p>{site['story_p1']}</p>\n          <p>{site['story_p2']}</p>\n          <p>{site['story_p3']}</p>\n        "
        + m.group(2),
        text,
        count=1,
        flags=re.DOTALL,
    )

    # Remove 2GIS nominee block (specific to Dark Detailing)
    text = re.sub(
        r'\s*<div class="award-panel">.*?</div>\s*(?=</div>\s*</section>\s*<div class="site-bottom">)',
        "\n",
        text,
        count=1,
        flags=re.DOTALL,
    )

    map_desktop = f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={firm['coords']}&amp;z=18&amp;pt={firm['coords']}~k:p"
    map_mobile = f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={firm['coords']}&amp;z=18&amp;pt={firm['coords']}~k:p"
    text = text.replace(
        "https://static.maps.2gis.com/1.0?s=880x450&amp;c=51.819701,55.16107&amp;z=18&amp;pt=51.819701,55.16107~k:p",
        map_desktop,
    )
    text = text.replace(
        "https://static.maps.2gis.com/1.0?s=720x720&amp;c=51.819701,55.16107&amp;z=18&amp;pt=51.819701,55.16107~k:p",
        map_mobile,
    )

    social_html = footer_social(site, site["firm_url"])
    text = re.sub(
        r'<div class="footer-social">.*?</div>',
        f'<div class="footer-social">{social_html}</div>',
        text,
    )

    if filename == "index.html":
        text = re.sub(
            r"<div class=\"cards\">.*?</div>\s*</section>",
            f'<div class="cards">\n{cards_block(site)}\n  </div>\n</section>',
            text,
            count=1,
            flags=re.DOTALL,
        )
        text = re.sub(
            r'<div class="photo-strip">.*?</div>\s*(?=</section>)',
            f'<div class="photo-strip">\n{strip_block(site, portfolio_names)}\n  </div>\n',
            text,
            count=1,
            flags=re.DOTALL,
        )

    if filename == "gallery.html":
        text = re.sub(
            r'<div class="gallery[^"]*">.*?</div>\s*(?=</section>)',
            f'<div class="gallery gallery--portfolio">\n{gallery_block(portfolio_names)}\n  </div>\n',
            text,
            count=1,
            flags=re.DOTALL,
        )
        text = re.sub(
            r'<div class="reviews">.*?</div>\s*(?=</section>)',
            f'<div class="reviews">\n{reviews_block(site, firm)}\n  </div>\n',
            text,
            count=1,
            flags=re.DOTALL,
        )

    if filename == "contact.html":
        text = re.sub(r'\s*<p><a href="mailto:[^"]+">[^<]+</a></p>', "", text)
        links_line = contact_links(site, site["firm_url"])
        text = re.sub(
            r"<div class=\"contact-info\">.*?</div>",
            f'<div class="contact-info">\n        <p>{links_line}</p>\n      </div>',
            text,
            count=1,
            flags=re.DOTALL,
        )

    if filename == "about.html":
        text = re.sub(
            r'<div class="photo-strip">.*?</div>\s*(?=</section>)',
            f'<div class="photo-strip">\n{strip_block(site, portfolio_names)}\n  </div>\n',
            text,
            count=1,
            flags=re.DOTALL,
        )

    if filename == "services.html":
        text = re.sub(
            r'<div class="service-list">.*?</div>\s*</section>',
            f'<div class="service-list">\n{services_block(site)}\n  </div>\n</section>',
            text,
            count=1,
            flags=re.DOTALL,
        )

    if filename == "styles.css":
        text = re.sub(
            r"background:url\('img/works/[^']+'\)",
            f"background:url('img/works/{hero}')",
            text,
            count=1,
        )

    if filename == "server.py":
        text = re.sub(r"PORT = \d+", f"PORT = {site['port']}", text)
        text = re.sub(r'FIRM_URL = "[^"]+"', f'FIRM_URL = "{site["firm_url"]}"', text)
        text = text.replace("Dark DetailingSite", site["server_name"])

    if filename == "start.bat":
        text = text.replace("8089", str(site["port"]))
        text = text.replace("Dark Detailing", brand)

    for old_port in ("8089", "8083"):
        if filename == f"open-firewall-{old_port}.bat":
            pass

    if filename.startswith("open-firewall-"):
        text = text.replace("8089", str(site["port"])).replace("8083", str(site["port"]))
        text = text.replace("Dark Detailing", brand)

    if filename.endswith(".html"):
        text = re.sub(r"styles\.css\?v=\d+", "styles.css?v=1", text)
        text = apply_ba_slider_cache_bust(text)

    return text


def build_site(site: dict) -> None:
    firm = parse_firm(site["firm_url"])
    if firm["brand"]:
        site = {**site, "brand": firm["brand"]}
    site = {
        **site,
        "_phone_tel": firm["phone_tel"],
        "_phone_display": firm["phone_display"],
    }

    dst = ROOT / site["slug"]
    if dst.exists():
        shutil.rmtree(dst, onerror=onerror)
    shutil.copytree(SRC, dst, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))

    portfolio_names = setup_photos(dst, firm["photos"])
    download_maps(dst / "img", firm["coords"])

    for path in list(dst.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix not in {".html", ".py", ".bat", ".md", ".css"}:
            continue
        updated = apply_file(
            path.read_text(encoding="utf-8"), path.name, site, firm, portfolio_names
        )
        path.write_text(updated, encoding="utf-8")

    readme = f"""# {site['brand']} — {firm['city']}

- **Адрес:** {firm['addr']}
- **Телефон:** {firm['phone_display']}
- **2ГИС:** {site['firm_url']}

## Локальный запуск

`start.bat` или `python server.py` → http://127.0.0.1:{site['port']}/
"""
    (dst / "README.md").write_text(readme, encoding="utf-8")
    print(
        f"built {site['slug']} -> http://127.0.0.1:{site['port']}/ "
        f"({len(portfolio_names)} portfolio photos from 2GIS)"
    )


def main() -> None:
    for site in SITES:
        build_site(site)


if __name__ == "__main__":
    main()
