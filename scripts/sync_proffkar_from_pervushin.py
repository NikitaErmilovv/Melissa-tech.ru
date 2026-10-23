#!/usr/bin/env python3
"""Rebuild Проффкар: полная копия Первушина + 2ГИС Проффкар (без оборудования, 2 слайдера)."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "pervushin-avtokompleks-ekaterinburg"
DST = ROOT / "proffkar-avtotekhservis-tyumen"
DATA_JSON = ROOT / "scripts/studio-data/proffkar-2gis.json"
PRIME_STATS = ROOT / "prime38-detailing-angarsk/stats.js"

_CFG_BASE = json.loads(DATA_JSON.read_text(encoding="utf-8"))
CFG = {
    "css_v": "120",
    "phone_tel": _CFG_BASE["phone_tel"],
    "phone_display": _CFG_BASE["phone_display"],
    "wa": _CFG_BASE["wa"],
    "tg": _CFG_BASE["tg"],
    "address": _CFG_BASE["address"],
    "schedule": _CFG_BASE["schedule"],
    "city": _CFG_BASE["city"],
    "firm_url": _CFG_BASE["firm_url"],
    "map_c": _CFG_BASE["map_c"],
    "map_alt": f"Карта 2ГИС — {_CFG_BASE['address']}",
    "rating": _CFG_BASE["rating"],
    "reviews": _CFG_BASE["reviews_count"],
    "years": "6+",
    "years_label": "ЛЕТ РАБОТЫ",
    "photo_dir": _CFG_BASE["photo_dir"],
    "about_lead": (
        "«Проффкар» — автотехсервис на Камчатской в Ленинском округе Тюмени. "
        "Ремонт и техническое обслуживание, шиномонтаж, диагностика, детейлинг и мойка — "
        "в одном месте. Работаем ежедневно с 10:00 до 20:00."
    ),
}

PRIME_ROOT = """:root{
  --accent:#fbeda3;
  --accent-soft:rgba(251,237,163,.42);
  --accent-hover:#fff1bc;
  --accent-deep:#d4c27a;
  --accent-ink:#0a0a0a;
  --accent-rgb:251,237,163;
}
"""

BRAND = "ПРОФФКАР"
IMG_DIR = "img/works/incoming/proffkar"
HERO_IMG = f"{IMG_DIR}/hero-home.png"
PHOTOS = {
    "kia": f"{IMG_DIR}/01-kia-quoris.png",
    "paint": f"{IMG_DIR}/09-paint-bumper.png",
    "motion": f"{IMG_DIR}/03-honda-motion.png",
    "mini": f"{IMG_DIR}/04-mini-countryman.png",
    "headlight": f"{IMG_DIR}/05-headlight.png",
    "wheel": f"{IMG_DIR}/06-wheel-rim.png",
    "mercedes": f"{IMG_DIR}/07-mercedes.png",
    "macan": f"{IMG_DIR}/08-macan.png",
}

HOME_SERVICE_TILES = [
    ("paint.html", "ПОКРАСКА", "paint", ""),
    ("polish.html", "ПОЛИРОВКА", "kia", " photo-pos-polish"),
    ("repair.html", "РЕМОНТ", "macan", ""),
    ("diagnostics.html", "ДИАГНОСТИКА", "headlight", ""),
    ("tint.html", "ТОНИРОВКА", "mini", ""),
]
HOME_WORKS_PHOTOS = ["kia", "mercedes", "macan", "motion", "paint"]

SERVICES_LIST = [
    ("repair.html", "01", "Ремонт автомобилей", "Механика и агрегаты по согласованному плану."),
    ("paint.html", "02", "Покраска", "Кузовной ремонт и подбор цвета ЛКП."),
    ("polish.html", "03", "Полировка", "Восстановление блеска и устранение дефектов ЛКП."),
    ("service.html", "04", "Техническое обслуживание", "Регламентные работы и замена жидкостей."),
    ("tires.html", "05", "Шиномонтаж", "Сезонная замена и балансировка."),
    ("diagnostics.html", "06", "Диагностика", "Компьютерная и механическая диагностика."),
    ("tint.html", "07", "Тонировка", "Тонирование стёкол по нормам."),
    ("detailing.html", "08", "Детейлинг", "Мойка, защита кузова и уход за салоном."),
    ("wash.html", "09", "Автомойка", "Мойка кузова и салона."),
]

NAV_ROOT = f"""<nav class="site-nav">
  <div class="logo"><a href="index.html">{BRAND}</a></div>
  <div class="links"><a href="services.html">УСЛУГИ</a><a href="gallery.html">РАБОТЫ</a><a href="about.html">О НАС</a><a href="contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:+79324791212">+7 (932) 479-12-12</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">
    <a href="services.html">УСЛУГИ</a>
    <a href="gallery.html">РАБОТЫ</a>
    <a href="about.html">О НАС</a>
    <a href="contact.html">КОНТАКТЫ</a>
  </div>
</nav>"""

NAV_SERVICES = NAV_ROOT.replace('href="index.html"', 'href="../index.html"').replace(
    'href="services.html"', 'href="../services.html"'
).replace('href="gallery.html"', 'href="../gallery.html"').replace(
    'href="about.html"', 'href="../about.html"'
).replace('href="contact.html"', 'href="../contact.html"')


def site_bottom(prefix: str = "") -> str:
    p = prefix
    return f"""<div class="site-bottom">
<section class="address-map" id="contacts">
  <div class="address-map-bg">
    <div class="address-map-glow address-map-glow--tr"></div>
    <div class="address-map-glow address-map-glow--bl"></div>
  </div>
  <div class="address-map-inner">
    <div class="address-map-grid">
      <div class="address-map-intro">
        <div class="address-map-kicker">
          <span class="address-map-line"></span>
          <span class="kicker">04 / ЛОКАЦИЯ</span>
        </div>
        <h2 class="address-map-title">ГДЕ МЫ<br><span>НАХОДИМСЯ.</span></h2>
        <p class="address-map-text">Приезжайте в сервис. Адрес и маршрут — в 2ГИС.</p>
        <div class="address-map-divider" aria-hidden="true"></div>
      </div>
      <div class="address-map-visual">
        <a href="{CFG['firm_url']}" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="https://static.maps.2gis.com/1.0?s=880x450&amp;c={CFG['map_c']}&amp;z=16&amp;pt={CFG['map_c']}~k:p" alt="">
          <img class="address-map-img address-map-img--mobile" src="https://static.maps.2gis.com/1.0?s=720x720&amp;c={CFG['map_c']}&amp;z=16&amp;pt={CFG['map_c']}~k:p" alt="{CFG['map_alt']}">
          <div class="address-map-pin-label" aria-hidden="true">
            <span class="address-map-pin-label-text">{BRAND}</span>
          </div>
        </a>
        <div class="address-map-decor"></div>
      </div>
      <div class="address-map-details-wrap">
        <div class="address-map-details">
          <div class="address-map-detail">
            <span class="address-map-detail-label">СЕРВИС</span>
            <p class="address-map-brand">{BRAND}</p>
            <p class="address-map-muted">{CFG['address']}</p>
            <p class="address-map-muted-sm">{CFG['schedule']}</p>
          </div>
          <div class="address-map-detail">
            <span class="address-map-detail-label">ТЕЛЕФОН</span>
            <div class="address-map-phones">
              <a href="tel:{CFG['phone_tel']}" class="address-map-phone">{CFG['phone_display']}</a>
            </div>
          </div>
        </div>
        <a href="{CFG['firm_url']}" class="address-map-btn" target="_blank" rel="noopener noreferrer">Как добраться</a>
      </div>
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="footer-grid footer-desktop-only">
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-brand-block">
        <div class="footer-logo">{BRAND}</div>
        <div class="footer-social"><a href="https://wa.me/{CFG['wa']}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://t.me/{CFG['tg']}" target="_blank" rel="noopener noreferrer">Telegram</a><a href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>{CFG['schedule']}</span>
      </div>
    </div>
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="{p}index.html">Главная</a>
      <a href="{p}services.html">Услуги</a>
      <a href="{p}gallery.html">Работы</a>
      <a href="{p}about.html">О нас</a>
      <a href="{p}contact.html">Контакты</a>
    </div>
    <div class="footer-col footer-col--phones">
      <b>КОНТАКТЫ</b>
      <a class="footer-phone-inline" href="tel:{CFG['phone_tel']}">{CFG['phone_display']}</a>
    </div>
  </div>
  <div class="footer-grid footer-mobile-only">
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="{p}index.html">Главная</a>
      <a href="{p}services.html">Услуги</a>
      <a href="{p}gallery.html">Работы</a>
      <a href="{p}about.html">О нас</a>
      <a href="{p}contact.html">Контакты</a>
    </div>
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-phones-block">
        <b>КОНТАКТЫ</b>
        <a class="footer-phone-inline" href="tel:{CFG['phone_tel']}">{CFG['phone_display']}</a>
      </div>
      <div class="footer-brand-divider" aria-hidden="true"></div>
      <div class="footer-brand-block">
        <div class="footer-logo">{BRAND}</div>
        <div class="footer-social"><a href="https://wa.me/{CFG['wa']}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://t.me/{CFG['tg']}" target="_blank" rel="noopener noreferrer">Telegram</a><a href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>{CFG['schedule']}</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Проффкар</span>
    <span>АВТОТЕХСЕРВИС · ТЮМЕНЬ</span>
  </div>
</footer>
</div>
"""


def scripts_block(root: bool = True) -> str:
    pre = "" if root else "../"
    return f"""<script src="{pre}contacts-config.js"></script>
<script src="{pre}nav.js"></script>
<script src="{pre}stats.js"></script>
<script src="{pre}messenger-picker.js"></script>
"""


def rebuild_from_pervushin_copy() -> None:
    incoming = DST / "img/works/incoming/proffkar"
    tmp = ROOT / ".tmp-proffkar-incoming-backup"
    if incoming.is_dir():
        if tmp.exists():
            shutil.rmtree(tmp)
        shutil.copytree(incoming, tmp)
    if DST.exists():
        shutil.rmtree(DST)
    shutil.copytree(
        SRC,
        DST,
        ignore=shutil.ignore_patterns("__pycache__", "*.pyc"),
    )
    if tmp.is_dir():
        dest = DST / "img/works/incoming/proffkar"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(tmp, dest)
        shutil.rmtree(tmp)
    prune_foreign_assets()


def prune_foreign_assets() -> None:
    for rel in (
        "img/works/incoming/pervushin",
        "img/works/equipment",
        "img/works/home",
    ):
        p = DST / rel
        if p.is_dir():
            shutil.rmtree(p)
    for name in (
        "img/works/hero-home.jpg",
        "img/hero.jpg",
        "img/works/before-after/door-after.jpg",
        "img/works/before-after/door-before.jpg",
        "img/works/before-after/interior-after.jpg",
        "img/works/before-after/interior-before.jpg",
        "img/works/before-after/mini-floor-after.jpg",
        "img/works/before-after/mini-floor-before.jpg",
    ):
        p = DST / name
        if p.is_file():
            p.unlink()
    svc = DST / "services"
    if svc.is_dir():
        for f in svc.glob("*.html"):
            f.unlink()


def sync_styles() -> None:
    css = (DST / "styles.css").read_text(encoding="utf-8")
    css = css.replace(
        ".site-nav .logo .logo-word{display:none}",
        ".site-nav .logo a{color:#fff}",
    )
    css = css.replace(".address-map-brand span{color:var(--accent)}", "")
    css = css.replace(".address-map-pin-label-text span{color:var(--accent)}", "")
    css = css.replace(
        "background:url('img/works/hero-raptor.jpg?v=raptor')",
        f"background:url('{HERO_IMG}') 62% 38% / cover no-repeat",
    )
    css = css.replace(
        "background-image:url('img/works/hero-home.jpg?v=1')",
        f"background-image:url('{HERO_IMG}')",
    )
    css = re.sub(
        r"(\.hero--sdc \.heroimg\{[^}]*?)background-position:[^;]+;",
        r"\1background-position:62% 38%;",
        css,
        count=1,
    )
    css = re.sub(
        r"(\.hero--sdc \.hero-heading h1\{[^}]*?)line-height:\.87;",
        r"\1line-height:1.05;",
        css,
        count=1,
    )
    if ".hero--sdc > .stats.stats--hero" not in css:
        css = css.replace(
            ".hero--sdc{\n  min-height:760px;padding:82px 6vw 70px;align-items:stretch;\n}",
            ".hero--sdc{\n  min-height:880px;padding:82px 6vw 0;align-items:stretch;flex-direction:column;\n}",
        )
        css = re.sub(
            r"\.hero--sdc \.heroimg\{[^}]+\}",
            ".hero--sdc .heroimg{\n  top:82px;height:calc(100% - 82px);min-height:798px;width:65%;opacity:.85;\n  background-position:62% 38%;\n}",
            css,
            count=1,
        )
        css = css.replace(
            "flex:1;min-height:calc(760px - 152px);max-width:720px;",
            "flex:1;min-height:0;max-width:720px;",
        )
        css = css.replace(
            ".hero--sdc .hero-content{max-width:720px;margin-top:auto}\n#works .photo:after{display:none}",
            ".hero--sdc .hero-content{max-width:720px;margin-top:auto}\n"
            ".hero--sdc > .stats.stats--hero{\n"
            "  position:relative;z-index:1;flex-shrink:0;\n"
            "  margin:88px 0 0;width:100%;align-self:stretch;\n"
            "  background:transparent;\n"
            "}\n#works .photo:after{display:none}",
        )
    css = re.sub(
        r"\n\.photo-strip--home\.photo-strip--six\{[^}]+\}\n"
        r"@media\(max-width:900px\)\{\.photo-strip--home\.photo-strip--six\{[^}]+\}\}\n?",
        "\n",
        css,
    )
    (DST / "styles.css").write_text(css, encoding="utf-8")


def sync_js() -> None:
    for name in ("nav.js", "ba-slider.js", "reviews-carousel.js", "messenger-picker.js", "gallery-load.js"):
        shutil.copy2(SRC / name, DST / name)
    if PRIME_STATS.is_file():
        shutil.copy2(PRIME_STATS, DST / "stats.js")


def write_contacts_config() -> None:
    text = f"""window.STUDIO_MESSENGERS = {{
  wa: "{CFG['wa']}",
  tg: "{CFG['tg']}",
  max: "",
  defaultMessage: "Здравствуйте! Хочу записаться в Проффкар.",
}};
"""
    (DST / "contacts-config.js").write_text(text, encoding="utf-8")


def write_server() -> None:
    src = (SRC / "server.py").read_text(encoding="utf-8")
    src = re.sub(r"^PORT = \d+", f"PORT = {_CFG_BASE['port']}", src, count=1)
    src = re.sub(
        r'^FIRM_URL = ".*"',
        f'FIRM_URL = "{CFG["firm_url"]}"',
        src,
        count=1,
    )
    src = src.replace(
        "                    if p.suffix.lower() in {\".jpg\", \".jpeg\", \".png\", \".webp\"}:\n"
        "                        files.append(p.relative_to(ROOT).as_posix())",
        "                    if p.suffix.lower() not in {\".jpg\", \".jpeg\", \".png\", \".webp\"}:\n"
        "                        continue\n"
        "                    if p.name.startswith(\"hero-\"):\n"
        "                        continue\n"
        "                    files.append(p.relative_to(ROOT).as_posix())",
    )
    (DST / "server.py").write_text(src, encoding="utf-8")


def fetch_reviews() -> None:
    out = DST / "data/reviews-2gis.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "python3",
            str(ROOT / "scripts/fetch_2gis_reviews.py"),
            _CFG_BASE["firm_id"],
            "-n",
            "8",
            "-o",
            str(out),
        ],
        check=False,
        cwd=ROOT,
    )


def _home_service_tiles_html() -> str:
    lines = []
    for href, tag, key, extra in HOME_SERVICE_TILES:
        lines.append(
            f'    <a class="photo{extra}" href="services/{href}" '
            f"style=\"background-image:url('{PHOTOS[key]}')\"><span class=\"tag\">{tag}</span></a>"
        )
    return "\n".join(lines)


def _home_works_strip_html() -> str:
    lines = []
    for key in HOME_WORKS_PHOTOS:
        lines.append(
            f'    <a class="photo" href="gallery.html" '
            f"style=\"background-image:url('{PHOTOS[key]}')\"></a>"
        )
    return "\n".join(lines)


def _services_rows_html() -> str:
    lines = []
    for href, idx, title, lead in SERVICES_LIST:
        lines.append(
            f'    <a class="service-row" href="services/{href}" id="svc-{idx}">'
            f'<div class="idx">{idx}</div><div><h3>{title}</h3>'
            f'<div class="service-desc"><p class="service-lead">{lead}</p></div></div>'
            f'<div class="cost">после осмотра</div></a>'
        )
    return "\n".join(lines)


def write_index() -> None:
    v = CFG["css_v"]
    home_tiles = _home_service_tiles_html()
    works_strip = _home_works_strip_html()
    content = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Проффкар — автотехсервис Тюмень</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body>
{NAV_ROOT}

<section class="hero hero--sdc">
  <div class="heroimg" style="background-image:url('{HERO_IMG}')"></div>
  <div class="hero-panel">
    <div class="hero-heading">
      <div class="eyebrow hero-eyebrow-city">ТЮМЕНЬ</div>
      <h1>АВТО<br>ТЕХСЕРВИС<br><span class="accent">{BRAND}</span></h1>
    </div>
    <div class="hero-content">
      <p>Автотехсервис на Камчатской: ремонт и ТО, шиномонтаж, детейлинг и комплексный уход за автомобилем.</p>
      <div class="actions">
        <a class="button" href="tel:{CFG['phone_tel']}">ЗАПИСАТЬСЯ</a>
        <a class="button dark" href="services.html">СМОТРЕТЬ УСЛУГИ</a>
      </div>
    </div>
  </div>
  <div class="stats stats--hero">
    <div class="stat"><b id="stat-rating">{CFG['rating']}</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span></div>
    <div class="stat"><b id="stat-reviews">{CFG['reviews']}</b><span>ОЦЕНОК · 2ГИС</span></div>
    <div class="stat"><b>{CFG['years']}</b><span>{CFG['years_label']}</span></div>
    <div class="stat"><b>2ГИС</b><span>ОТЗЫВЫ КЛИЕНТОВ</span></div>
  </div>
</section>

<section class="section" id="services">
  <div class="section-head">
    <div><div class="kicker">01 / УСЛУГИ</div><h2>СЕРВИС<br><span class="accent">АВТОМОБИЛЯ.</span></h2></div>
    <p class="intro">Кузов, ТО, детейлинг и уход — финальная цена после осмотра.</p>
  </div>
  <div class="photo-strip photo-strip--services photo-strip--home">
{home_tiles}
  </div>
</section>

<section class="section" id="compare">
  <div class="section-head">
    <div><div class="kicker">ДО / ПОСЛЕ</div><h2>РЕЗУЛЬТАТ,<br><span class="accent">КОТОРЫЙ ВИДНО.</span></h2></div>
  </div>
  <div class="ba-grid">
    <figure class="ba-item">
      <div class="ba-slider" data-ba>
        <img class="ba-after" src="img/works/before-after/hood-after.jpg" alt="">
        <div class="ba-before-wrap"><img class="ba-before" src="img/works/before-after/hood-before.jpg" alt=""></div>
        <div class="ba-handle" aria-hidden="true"><span></span></div>
      </div>
      <figcaption>Работа с кузовом</figcaption>
    </figure>
    <figure class="ba-item">
      <div class="ba-slider" data-ba>
        <img class="ba-after" src="img/works/before-after/headlight-after.jpg" alt="">
        <div class="ba-before-wrap"><img class="ba-before" src="img/works/before-after/headlight-before.jpg" alt=""></div>
        <div class="ba-handle" aria-hidden="true"><span></span></div>
      </div>
      <figcaption>Оптика и детали</figcaption>
    </figure>
  </div>
</section>

<section class="section" id="works">
  <div class="section-head">
    <div><div class="kicker">02 / РАБОТЫ</div><h2>НАШИ<br><span class="accent">РАБОТЫ.</span></h2></div>
  </div>
  <div class="photo-strip photo-strip--services">
{works_strip}
  </div>
</section>

<section class="process" id="process">
  <div class="kicker">03 / ПРОЦЕСС</div>
  <h2>КАК МЫ<br><span class="accent">РАБОТАЕМ.</span></h2>
  <div class="steps">
    <div class="step"><b>01</b><h3>Заявка</h3><p>Звоните или пишите — уточняем задачу и удобное время.</p></div>
    <div class="step"><b>02</b><h3>Осмотр</h3><p>Оцениваем автомобиль и согласуем объём работ.</p></div>
    <div class="step"><b>03</b><h3>Работа</h3><p>Выполняем сервис по согласованному плану.</p></div>
    <div class="step"><b>04</b><h3>Выдача</h3><p>Показываем результат и отвечаем на вопросы.</p></div>
  </div>
</section>

<section class="section" id="reviews">
  <div class="section-head">
    <div><div class="kicker">ОТЗЫВЫ</div><h2>ОТЗЫВЫ<br><span class="accent">КЛИЕНТОВ.</span></h2></div>
  </div>
  <div class="reviews-carousel" data-reviews-carousel data-reviews-src="data/reviews-2gis.json">
    <button type="button" class="reviews-nav reviews-nav--prev" aria-label="Предыдущие отзывы">‹</button>
    <div class="reviews-viewport"><div class="reviews-track"></div></div>
    <button type="button" class="reviews-nav reviews-nav--next" aria-label="Следующие отзывы">›</button>
  </div>
  <p class="intro" style="margin-top:24px"><a href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">Все отзывы в 2ГИС →</a></p>
</section>

{site_bottom()}
{scripts_block()}
<script src="ba-slider.js"></script>
<script src="reviews-carousel.js"></script>
</body>
</html>
"""
    (DST / "index.html").write_text(content, encoding="utf-8")


def write_services_page() -> None:
    v = CFG["css_v"]
    rows = _services_rows_html()
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Услуги — Проффкар</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body class="page-sub">
{NAV_ROOT}

<section class="subpage-hero">
  <div class="kicker">01 / УСЛУГИ</div>
  <h1>АВТОТЕХСЕРВИС<br><span class="accent">ТЮМЕНЬ</span></h1>
  <p>Кузов, ТО, детейлинг и сервис — стоимость после осмотра.</p>
</section>

<section class="section">
  <div class="service-list">
{rows}
  </div>
</section>

{site_bottom()}
{scripts_block()}
</body>
</html>
"""
    (DST / "services.html").write_text(html, encoding="utf-8")


def write_about() -> None:
    v = CFG["css_v"]
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>О нас — Проффкар</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body class="page-sub">
{NAV_ROOT}

<section class="subpage-hero subpage-hero--about">
  <div class="kicker">03 / О НАС</div>
  <h1>АВТОТЕХСЕРВИС<br>{BRAND}</h1>
  <p class="subpage-hero-lead">{CFG['about_lead']}</p>
  <p class="subpage-hero-meta"><a href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">Карточка в 2ГИС →</a></p>
</section>

{site_bottom()}
{scripts_block()}
</body>
</html>
"""
    (DST / "about.html").write_text(html, encoding="utf-8")


def write_contact() -> None:
    v = CFG["css_v"]
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Контакты — Проффкар</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body class="page-sub">
{NAV_ROOT}

<section class="subpage-hero">
  <div class="kicker">04 / КОНТАКТЫ</div>
  <h1>СВЯЗАТЬСЯ<br><span class="accent">С НАМИ</span></h1>
  <p>{CFG['city']} · {CFG['schedule']}</p>
</section>

<section class="section">
  <div class="contact-panel">
    <div class="contact-panel-card">
      <div class="kicker">АДРЕС</div>
      <h2>АВТОТЕХСЕРВИС<br>ПРОФФКАР</h2>
      <p class="contact-panel-lead">{CFG['address']}</p>
      <p>{CFG['schedule']}</p>
    </div>
    <div class="contact-panel-card">
      <div class="kicker">СВЯЗЬ</div>
      <a class="contact-phone" href="tel:{CFG['phone_tel']}">{CFG['phone_display']}</a>
      <div class="contact-chips">
        <a href="https://wa.me/{CFG['wa']}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href="https://t.me/{CFG['tg']}" target="_blank" rel="noopener noreferrer">Telegram</a>
        <a href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">2ГИС</a>
      </div>
    </div>
  </div>
</section>

{site_bottom()}
{scripts_block()}
</body>
</html>
"""
    (DST / "contact.html").write_text(html, encoding="utf-8")


def write_gallery() -> None:
    v = CFG["css_v"]
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Работы — Проффкар</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body class="page-sub">
{NAV_ROOT}

<section class="subpage-hero">
  <div class="kicker">02 / РАБОТЫ</div>
  <h1>НАШИ<br><span class="accent">РАБОТЫ</span></h1>
  <p>Фото работ автотехсервиса: ремонт, ТО, шины и уход за автомобилем.</p>
</section>

<section class="section work-block" id="work-album">
  <div class="section-head">
    <div><div class="kicker">АЛЬБОМ</div><h2>РАБОТЫ АВТОТЕХСЕРВИСА</h2></div>
  </div>
  <div class="gallery gallery--portfolio" id="gallery-grid" data-photo-dir="{CFG['photo_dir']}">
    <p class="gallery-empty">Пока нет фото. Положите JPG/PNG в <strong>img/works/incoming/{CFG['photo_dir']}/</strong> и перезагрузите страницу.</p>
  </div>
</section>

{site_bottom()}
{scripts_block()}
<script src="gallery-load.js"></script>
</body>
</html>
"""
    (DST / "gallery.html").write_text(html, encoding="utf-8")


SERVICE_PAGES = {
    "repair.html": ("Ремонт автомобилей", "РЕМОНТ АВТОМОБИЛЕЙ", "Механика и агрегаты по согласованному плану."),
    "paint.html": ("Покраска", "ПОКРАСКА", "Кузовной ремонт и подбор цвета ЛКП."),
    "polish.html": ("Полировка", "ПОЛИРОВКА", "Восстановление блеска и устранение дефектов ЛКП."),
    "service.html": ("Техническое обслуживание", "ТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ", "Регламентные работы и замена жидкостей."),
    "tires.html": ("Шиномонтаж", "ШИНОМОНТАЖ", "Сезонная замена и балансировка."),
    "diagnostics.html": ("Диагностика", "ДИАГНОСТИКА", "Компьютерная и механическая диагностика."),
    "tint.html": ("Тонировка", "ТОНИРОВКА", "Тонирование стёкол по нормам."),
    "detailing.html": ("Детейлинг", "ДЕТЕЙЛИНГ", "Мойка, защита кузова и уход за салоном."),
    "wash.html": ("Автомойка", "АВТОМОЙКА", "Мойка кузова и салона."),
}


def write_service_pages() -> None:
    v = CFG["css_v"]
    for fname, (title, h1, lead) in SERVICE_PAGES.items():
        html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{title} — Проффкар</title>
<link rel="stylesheet" href="../styles.css?v={v}">
</head>
<body class="page-sub">
{NAV_SERVICES}

<section class="subpage-hero subpage-hero--service">
  <div class="kicker">УСЛУГА</div>
  <h1>{h1}</h1>
  <p>{lead}</p>
</section>

<section class="section">
  <p class="intro" style="max-width:720px">{lead} Стоимость: <strong>после осмотра</strong>.</p>
  <div class="actions" style="margin-top:28px">
    <a class="button" href="tel:{CFG['phone_tel']}">ЗАПИСАТЬСЯ</a>
    <a class="button dark" href="../contact.html">КОНТАКТЫ</a>
  </div>
</section>

{site_bottom("../")}
{scripts_block(False)}
</body>
</html>
"""
        (DST / "services" / fname).write_text(html, encoding="utf-8")


def main() -> None:
    rebuild_from_pervushin_copy()
    sync_styles()
    sync_js()
    write_contacts_config()
    write_server()
    fetch_reviews()
    (DST / "partials").mkdir(exist_ok=True)
    (DST / "partials/site-bottom-root.html").write_text(site_bottom(), encoding="utf-8")
    write_index()
    write_services_page()
    write_about()
    write_contact()
    write_gallery()
    write_service_pages()
    print("Проффкар rebuilt from Pervushin (2ГИС сохранён).")


if __name__ == "__main__":
    main()
