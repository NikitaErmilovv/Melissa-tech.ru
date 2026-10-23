#!/usr/bin/env python3
"""Rebuild Первый руль: копия Prime.38 + 2ГИС + бирюза + cars.html."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "prime38-detailing-angarsk"
DST = ROOT / "pervyy-rul-masterskaya-novokuznetsk"
DATA_JSON = ROOT / "scripts/studio-data/pervyy-rul-2gis.json"

_CFG = json.loads(DATA_JSON.read_text(encoding="utf-8"))
IMG = f"img/works/incoming/{_CFG['photo_dir']}"
CFG = {
    "css_v": "14",
    **_CFG,
    "reviews": _CFG["reviews_count"],
    "map_alt": f"Карта 2ГИС — {_CFG['address']}",
    "years": "5+",
    "about_lead": (
        "Мастерская «Первый руль» — СТО и автокомплекс в Куйбышевском районе Новокузнецка. "
        "Ремонт и диагностика, шиномонтаж, ходовая и автоэлектрика, а также продажа автомобилей. "
        f"{_CFG['schedule']}."
    ),
}

TURQUOISE = """:root{
  --accent:#0fb5b2;
  --accent-soft:rgba(15,181,178,.42);
  --accent-hover:#3cc9c6;
  --accent-deep:#0a8f8c;
  --accent-ink:#0a0a0a;
  --accent-rgb:15,181,178;
}
"""

LOGO_PIN = '<span class="logo-mark">ПЕРВЫЙ</span><span class="logo-word">РУЛЬ</span>'

NAV = f"""<nav class="site-nav">
  <div class="logo"><a href="index.html">{LOGO_PIN}</a></div>
  <div class="links"><a href="services.html">УСЛУГИ</a><a href="cars.html">АВТО</a><a href="gallery.html">РАБОТЫ</a><a href="about.html">О НАС</a><a href="contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:{CFG['phone_tel']}">{CFG['phone_display']}</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span><span class="nav-burger-line"></span><span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">
    <a href="services.html">УСЛУГИ</a><a href="cars.html">АВТО</a><a href="gallery.html">РАБОТЫ</a>
    <a href="about.html">О НАС</a><a href="contact.html">КОНТАКТЫ</a>
  </div>
</nav>"""

NAV_SVC = (
    NAV.replace('href="index.html"', 'href="../index.html"')
    .replace('href="services.html"', 'href="../services.html"')
    .replace('href="cars.html"', 'href="../cars.html"')
    .replace('href="gallery.html"', 'href="../gallery.html"')
    .replace('href="about.html"', 'href="../about.html"')
    .replace('href="contact.html"', 'href="../contact.html"')
)

# Без 02, 03, 05 — мото на фото с 2ГИС
HOME_WORKS_PHOTOS = ["01", "04", "06", "09", "11"]

HOME_TILES = [
    ("repair.html", "РЕМОНТ", "06"),
    ("diagnostics.html", "ДИАГНОСТИКА", "07", " photo-pos-polish"),
    ("tires.html", "ШИНОМОНТАЖ", "08"),
    ("suspension.html", "ХОДОВАЯ", "09"),
    ("electrics.html", "АВТОЭЛЕКТРИКА", "10"),
]

SERVICES = [
    ("repair.html", "01", "Ремонт автомобилей", "Механические и агрегатные работы по результатам диагностики."),
    ("diagnostics.html", "02", "Компьютерная диагностика", "Поиск неисправностей электронных систем."),
    ("tires.html", "03", "Шиномонтаж", "Замена сезонных комплектов и балансировка."),
    ("suspension.html", "04", "Ремонт ходовой", "Подвеска, рулевое, тормозная система."),
    ("electrics.html", "05", "Автоэлектрика", "Проводка, стартер, генератор, освещение."),
]

SERVICE_PAGES = {
    "repair.html": ("Ремонт автомобилей", "РЕМОНТ АВТОМОБИЛЕЙ", SERVICES[0][3]),
    "diagnostics.html": ("Компьютерная диагностика", "КОМПЬЮТЕРНАЯ ДИАГНОСТИКА", SERVICES[1][3]),
    "tires.html": ("Шиномонтаж", "ШИНОМОНТАЖ", SERVICES[2][3]),
    "suspension.html": ("Ремонт ходовой", "РЕМОНТ ХОДОВОЙ", SERVICES[3][3]),
    "electrics.html": ("Автоэлектрика", "АВТОЭЛЕКТРИКА", SERVICES[4][3]),
}


def photo(n: str) -> str:
    return f"{IMG}/{n}-2gis.jpg"


def scripts(pre: str = "") -> str:
    return f"""<script src="{pre}contacts-config.js"></script>
<script src="{pre}nav.js"></script>
<script src="{pre}stats.js"></script>
<script src="{pre}messenger-picker.js"></script>"""


def site_bottom(pre: str = "") -> str:
    p = pre
    return f"""<div class="site-bottom">
<section class="address-map" id="contacts">
  <div class="address-map-bg"><div class="address-map-glow address-map-glow--tr"></div><div class="address-map-glow address-map-glow--bl"></div></div>
  <div class="address-map-inner">
    <div class="address-map-grid">
      <div class="address-map-intro">
        <div class="address-map-kicker"><span class="address-map-line"></span><span class="kicker">04 / ЛОКАЦИЯ</span></div>
        <h2 class="address-map-title">ГДЕ МЫ<br><span>НАХОДИМСЯ.</span></h2>
        <p class="address-map-text">Приезжайте в сервис. Адрес и маршрут — в 2ГИС.</p>
        <div class="address-map-divider" aria-hidden="true"></div>
      </div>
      <div class="address-map-visual">
        <a href="{CFG['firm_url']}" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="https://static.maps.2gis.com/1.0?s=880x450&amp;c={CFG['map_c']}&amp;z=16&amp;pt={CFG['map_c']}~k:p" alt="">
          <img class="address-map-img address-map-img--mobile" src="https://static.maps.2gis.com/1.0?s=720x720&amp;c={CFG['map_c']}&amp;z=16&amp;pt={CFG['map_c']}~k:p" alt="{CFG['map_alt']}">
          <div class="address-map-pin-label" aria-hidden="true"><span class="address-map-pin-label-text">{LOGO_PIN}</span></div>
        </a>
        <div class="address-map-decor"></div>
      </div>
      <div class="address-map-details-wrap">
        <div class="address-map-details">
          <div class="address-map-detail">
            <span class="address-map-detail-label">СЕРВИС</span>
            <p class="address-map-brand">{LOGO_PIN}</p>
            <p class="address-map-muted">{CFG['address']}</p>
            <p class="address-map-muted-sm">{CFG['schedule']}</p>
          </div>
          <div class="address-map-detail">
            <span class="address-map-detail-label">ТЕЛЕФОН</span>
            <a href="tel:{CFG['phone_tel']}" class="address-map-phone">{CFG['phone_display']}</a>
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
      <div class="footer-brand-block"><div class="footer-logo">{LOGO_PIN}</div>
        <div class="footer-social"><a href="https://wa.me/{CFG['wa']}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://t.me/{CFG['tg']}" target="_blank" rel="noopener noreferrer">Telegram</a><a href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block"><b>РЕЖИМ РАБОТЫ</b><span>{CFG['schedule']}</span></div>
    </div>
    <div class="footer-col"><b>НАВИГАЦИЯ</b>
      <a href="{p}index.html">Главная</a><a href="{p}services.html">Услуги</a><a href="{p}cars.html">Авто</a>
      <a href="{p}gallery.html">Работы</a><a href="{p}about.html">О нас</a><a href="{p}contact.html">Контакты</a>
    </div>
    <div class="footer-col footer-col--phones"><b>КОНТАКТЫ</b><a class="footer-phone-inline" href="tel:{CFG['phone_tel']}">{CFG['phone_display']}</a></div>
  </div>
  <div class="footer-bottom"><span>© 2026 Первый руль</span><span>АВТОКОМПЛЕКС · {CFG['city'].upper()}</span></div>
</footer>
</div>"""


def rebuild() -> None:
    inc = DST / "img/works/incoming" / _CFG["photo_dir"]
    tmp = ROOT / ".tmp-pervyy-rul-incoming"
    if inc.is_dir():
        if tmp.exists():
            shutil.rmtree(tmp)
        shutil.copytree(inc, tmp)
    if DST.exists():
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
    if tmp.is_dir():
        dest = DST / "img/works/incoming" / _CFG["photo_dir"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(tmp, dest)
        shutil.rmtree(tmp)
    for f in (DST / "services").glob("*.html"):
        f.unlink()


def sync_styles() -> None:
    css_src = (SRC / "styles.css").read_text(encoding="utf-8")
    heroimg_m = re.search(r"\.heroimg\{[^}]+\}", css_src)
    heroimg_rule = heroimg_m.group(0) if heroimg_m else ""
    css = (DST / "styles.css").read_text(encoding="utf-8")
    css = re.sub(
        r":root\{[^}]+\}",
        TURQUOISE.strip(),
        css,
        count=1,
    )
    css = css.replace("incoming/prime38/", f"incoming/{_CFG['photo_dir']}/")
    if heroimg_rule:
        heroimg_rule = heroimg_rule.replace(
            "incoming/prime38/",
            f"incoming/{_CFG['photo_dir']}/",
        )
        css = re.sub(r"\.heroimg\{[^}]+\}", heroimg_rule, css, count=1)
    css = css.replace(
        ".site-nav .logo .logo-word{display:none}",
        ".site-nav .logo .logo-word{color:#fff}",
    )
    (DST / "styles.css").write_text(css, encoding="utf-8")


def sync_js() -> None:
    for name in ("nav.js", "ba-slider.js", "stats.js", "reviews-carousel.js", "messenger-picker.js", "gallery-load.js"):
        shutil.copy2(SRC / name, DST / name)


def write_config() -> None:
    (DST / "contacts-config.js").write_text(
        f"""window.STUDIO_MESSENGERS = {{
  wa: "{CFG['wa']}",
  tg: "{CFG['tg']}",
  max: "",
  defaultMessage: "Здравствуйте! Хочу записаться в Первый руль.",
}};""",
        encoding="utf-8",
    )
    srv = (DST / "server.py").read_text(encoding="utf-8")
    srv = re.sub(r"^PORT = \d+", f"PORT = {CFG['port']}", srv, count=1)
    srv = re.sub(r'^FIRM_URL = ".*"', f'FIRM_URL = "{CFG["firm_url"]}"', srv, count=1)
    srv = srv.replace(
        "                    if p.suffix.lower() in {\".jpg\", \".jpeg\", \".png\", \".webp\"}:\n"
        "                        files.append(p.relative_to(ROOT).as_posix())",
        "                    if p.suffix.lower() not in {\".jpg\", \".jpeg\", \".png\", \".webp\"}:\n"
        "                        continue\n"
        "                    if p.name.startswith(\"hero-\"):\n"
        "                        continue\n"
        "                    files.append(p.relative_to(ROOT).as_posix())",
    )
    (DST / "server.py").write_text(srv, encoding="utf-8")


def sync_site_bottom_partial() -> None:
    partial_dir = DST / "partials"
    partial_dir.mkdir(parents=True, exist_ok=True)
    (partial_dir / "site-bottom-root.html").write_text(site_bottom(""), encoding="utf-8")


def fetch_reviews() -> None:
    out = DST / "data/reviews-2gis.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["python3", str(ROOT / "scripts/fetch_2gis_reviews.py"), CFG["firm_id"], "-n", "8", "-o", str(out)],
        check=False,
        cwd=ROOT,
    )


def tiles_html() -> str:
    lines = []
    for row in HOME_TILES:
        href, tag, num = row[0], row[1], row[2]
        extra = row[3] if len(row) > 3 else ""
        lines.append(
            f'    <a class="photo{extra}" href="services/{href}" style="background-image:url(\'{photo(num)}\')"><span class="tag">{tag}</span></a>'
        )
    return "\n".join(lines)


def works_html() -> str:
    return "\n".join(
        f'    <a class="photo" href="gallery.html" style="background-image:url(\'{photo(n)}\')"></a>'
        for n in HOME_WORKS_PHOTOS
    )


def service_rows() -> str:
    return "\n".join(
        f'    <a class="service-row" href="services/{h}" id="svc-{i}"><div class="idx">{i}</div>'
        f"<div><h3>{t}</h3><div class=\"service-desc\"><p class=\"service-lead\">{d}</p></div></div>"
        f'<div class="cost">после осмотра</div></a>'
        for h, i, t, d in SERVICES
    )


def pervyy_hero_html() -> str:
    return f"""
<section class="hero hero--sdc">
  <div class="heroimg" style="background-image:url('{photo('01')}')"></div>
  <div class="hero-panel">
    <div class="hero-heading">
      <div class="eyebrow hero-eyebrow-city">{CFG['city'].upper()}</div>
      <h1>ПЕРВЫЙ<br><span class="accent">РУЛЬ</span></h1>
    </div>
    <div class="hero-content">
      <p>Автокомплекс на Сибиряков-Гвардейцев: ремонт и диагностика, шиномонтаж, электрика и продажа автомобилей.</p>
      <div class="actions">
        <a class="button" href="tel:{CFG['phone_tel']}">ЗАПИСАТЬСЯ</a>
        <a class="button dark" href="services.html">СМОТРЕТЬ УСЛУГИ</a>
      </div>
    </div>
  </div>
  <div class="stats stats--hero">
    <div class="stat"><b>{CFG['years']}</b><span>ЛЕТ НА РЫНКЕ</span></div>
    <div class="stat"><b id="stat-reviews">{CFG['reviews']}</b><span>ОЦЕНКИ · 2ГИС</span></div>
    <div class="stat"><b id="stat-rating">{CFG['rating']}</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span></div>
    <div class="stat"><b id="stat-reviews-foot">{CFG['reviews']}</b><span>ОТЗЫВОВ</span></div>
  </div>
</section>
"""


def write_index() -> None:
    v = CFG["css_v"]
    hero = pervyy_hero_html()
    (DST / "index.html").write_text(
        f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Первый руль — Новокузнецк</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body>
{NAV}
{hero}<section class="section" id="services">
  <div class="section-head">
    <div><div class="kicker">01 / УСЛУГИ</div><h2>ДЕТЕЙЛИНГ<br><span class="accent">И ЗАЩИТА КУЗОВА</span></h2></div>
    <p class="intro">Ремонт, диагностика и автомобили в продаже — уточняйте по телефону.</p>
  </div>
  <div class="photo-strip photo-strip--services photo-strip--home">
{tiles_html()}
  </div>
</section>
<section class="section" id="compare">
  <div class="section-head"><div><div class="kicker">ДО / ПОСЛЕ</div><h2>РЕЗУЛЬТАТ,<br><span class="accent">КОТОРЫЙ ВИДНО.</span></h2></div></div>
  <div class="ba-grid">
    <figure class="ba-item"><div class="ba-slider" data-ba>
      <img class="ba-after" src="img/works/before-after/hood-after.jpg" alt="">
      <div class="ba-before-wrap"><img class="ba-before" src="img/works/before-after/hood-before.jpg" alt=""></div>
      <div class="ba-handle" aria-hidden="true"><span></span></div></div><figcaption>Работа с кузовом</figcaption></figure>
    <figure class="ba-item"><div class="ba-slider" data-ba>
      <img class="ba-after" src="img/works/before-after/headlight-after.jpg" alt="">
      <div class="ba-before-wrap"><img class="ba-before" src="img/works/before-after/headlight-before.jpg" alt=""></div>
      <div class="ba-handle" aria-hidden="true"><span></span></div></div><figcaption>Оптика и детали</figcaption></figure>
  </div>
</section>
<section class="section" id="works">
  <div class="section-head"><div><div class="kicker">02 / РАБОТЫ</div><h2>НАШИ<br><span class="accent">РАБОТЫ.</span></h2></div></div>
  <div class="photo-strip photo-strip--services">
{works_html()}
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
  <div class="section-head"><div><div class="kicker">ОТЗЫВЫ</div><h2>ОТЗЫВЫ<br><span class="accent">КЛИЕНТОВ.</span></h2></div></div>
  <div class="reviews-carousel" data-reviews-carousel data-reviews-src="data/reviews-2gis.json">
    <button type="button" class="reviews-nav reviews-nav--prev" aria-label="Предыдущие отзывы">‹</button>
    <div class="reviews-viewport"><div class="reviews-track"></div></div>
    <button type="button" class="reviews-nav reviews-nav--next" aria-label="Следующие отзывы">›</button>
  </div>
  <p class="intro" style="margin-top:24px"><a href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">Все отзывы в 2ГИС →</a></p>
</section>
{site_bottom()}
{scripts()}
<script src="ba-slider.js"></script><script src="reviews-carousel.js"></script>
</body></html>""",
        encoding="utf-8",
    )


def write_subpages() -> None:
    v = CFG["css_v"]
    for name, writer in (
        ("services.html", _write_services),
        ("about.html", _write_about),
        ("contact.html", _write_contact),
        ("gallery.html", _write_gallery),
        ("cars.html", _write_cars),
    ):
        writer(v)


def _write_services(v: str) -> None:
    (DST / "services.html").write_text(
        f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Услуги — Первый руль</title>
<link rel="stylesheet" href="styles.css?v={v}"></head><body class="page-sub">{NAV}
<section class="subpage-hero"><div class="kicker">01 / УСЛУГИ</div>
<h1>АВТОКОМПЛЕКС<br><span class="accent">{CFG['city'].upper()}</span></h1>
<p>Ремонт и диагностика — стоимость после осмотра автомобиля.</p></section>
<section class="section"><div class="service-list">{service_rows()}</div></section>
{site_bottom()}{scripts()}</body></html>""",
        encoding="utf-8",
    )


def _write_about(v: str) -> None:
    (DST / "about.html").write_text(
        f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>О нас — Первый руль</title><link rel="stylesheet" href="styles.css?v={v}"></head><body class="page-sub">{NAV}
<section class="subpage-hero subpage-hero--about"><div class="kicker">03 / О НАС</div>
<h1>АВТОКОМПЛЕКС<br><span class="accent">ПЕРВЫЙ РУЛЬ</span></h1>
<p class="subpage-hero-lead">{CFG['about_lead']}</p>
<p class="subpage-hero-meta"><a href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">Карточка в 2ГИС →</a></p></section>
{site_bottom()}{scripts()}</body></html>""",
        encoding="utf-8",
    )


def _write_contact(v: str) -> None:
    (DST / "contact.html").write_text(
        f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Контакты — Первый руль</title><link rel="stylesheet" href="styles.css?v={v}"></head><body class="page-sub">{NAV}
<section class="subpage-hero"><div class="kicker">КОНТАКТЫ</div><h1>СВЯЗАТЬСЯ<br><span class="accent">С НАМИ</span></h1></section>
<section class="section contact-box"><h2>АВТОКОМПЛЕКС<br>ПЕРВЫЙ РУЛЬ</h2>
<p>{CFG['address']}</p><p>{CFG['schedule']}</p>
<p><a href="tel:{CFG['phone_tel']}">{CFG['phone_display']}</a></p>
<p><a href="https://wa.me/{CFG['wa']}">WhatsApp</a> · <a href="https://t.me/{CFG['tg']}">Telegram</a> · <a href="{CFG['firm_url']}">2ГИС</a></p></section>
{site_bottom()}{scripts()}</body></html>""",
        encoding="utf-8",
    )


def _write_gallery(v: str) -> None:
    (DST / "gallery.html").write_text(
        f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Работы — Первый руль</title><link rel="stylesheet" href="styles.css?v={v}"></head><body class="page-sub">{NAV}
<section class="subpage-hero"><div class="kicker">02 / РАБОТЫ</div><h1>НАШИ<br><span class="accent">РАБОТЫ</span></h1></section>
<section class="section"><div class="gallery gallery--portfolio" id="gallery-grid" data-photo-dir="{CFG['photo_dir']}">
<p class="gallery-empty">Пока нет фото. Положите JPG/PNG в <strong>{IMG}/</strong>.</p></div></section>
{site_bottom()}{scripts()}<script src="gallery-load.js"></script></body></html>""",
        encoding="utf-8",
    )


def _write_cars(v: str) -> None:
    (DST / "cars.html").write_text(
        f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Авто в продаже — Первый руль</title><link rel="stylesheet" href="styles.css?v={v}"></head><body class="page-sub">{NAV}
<section class="subpage-hero"><div class="kicker">АВТОМОБИЛИ</div><h1>АВТО<br><span class="accent">В ПРОДАЖЕ.</span></h1>
<p>Актуальный список — по телефону и в карточке 2ГИС.</p></section>
<section class="section"><div class="auto-sales-grid">
<article class="auto-card"><div class="auto-card-photo" style="background-image:url('{photo('01')}')"></div>
<h3>Скоро в каталоге</h3><p>Уточняйте наличие и комплектацию по телефону.</p>
<a class="button" href="tel:{CFG['phone_tel']}">УЗНАТЬ НАЛИЧИЕ</a></article>
<article class="auto-card auto-card--muted"><h3>2ГИС и звонок</h3>
<p>В карточке компании публикуют объявления о продаже и спецпредложения сервиса.</p>
<a class="button dark" href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">ОТКРЫТЬ 2ГИС</a></article>
</div></section>{scripts()}<script src="nav.js"></script></body></html>""",
        encoding="utf-8",
    )


def write_service_pages() -> None:
    v = CFG["css_v"]
    for fname, (title, h1, lead) in SERVICE_PAGES.items():
        (DST / "services" / fname).write_text(
            f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — Первый руль</title><link rel="stylesheet" href="../styles.css?v={v}"></head><body class="page-sub">{NAV_SVC}
<section class="subpage-hero subpage-hero--service"><div class="kicker">УСЛУГА</div><h1>{h1}</h1><p>{lead}</p></section>
<section class="section"><p class="intro" style="max-width:720px">{lead} Стоимость: <strong>после осмотра</strong>.</p>
<div class="actions" style="margin-top:28px"><a class="button" href="tel:{CFG['phone_tel']}">ЗАПИСАТЬСЯ</a>
<a class="button dark" href="../contact.html">КОНТАКТЫ</a></div></section>
{site_bottom('../')}{scripts('../')}</body></html>""",
            encoding="utf-8",
        )


def main() -> None:
    rebuild()
    sync_styles()
    sync_js()
    write_config()
    fetch_reviews()
    write_index()
    sync_site_bottom_partial()
    write_subpages()
    write_service_pages()
    (DST / "README.md").write_text(
        f"# Первый руль\n\nЛокально: `python server.py` → http://127.0.0.1:{CFG['port']}/\n\n"
        f"2ГИС: {CFG['firm_url']}\n\nПересборка: `python scripts/sync_pervyyrul_from_prime38.py`\n",
        encoding="utf-8",
    )
    print("Первый руль rebuilt from Prime.38")


if __name__ == "__main__":
    main()
