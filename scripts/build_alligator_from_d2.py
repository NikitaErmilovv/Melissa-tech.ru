# -*- coding: utf-8 -*-
"""Build Alligator site from D2 (delaikuzov) copy. Does not touch delaikuzov."""
from __future__ import annotations

import re
import shutil
import urllib.request
from pathlib import Path

ROOT = Path(r"c:\Users\Никита\Work\Melissa-tech.ru\alligator")
PHOTO_SRC = Path(r"C:\Users\Никита\Work\Фото для прототипов\Аллигатор")
PHOTO_DST = ROOT / "img" / "works" / "alligator"

PHONE_DISP = "+7 (904) 589-09-89"
PHONE_TEL = "+79045890989"
PHONE_TG = "https://t.me/+79045890989"
PHONE_MAX = "https://max.ru/"
FIRM = "https://2gis.ru/omsk/firm/70000001062761810"
ADDR = "г. Омск, 2-я Солнечная ул., 46/3"
HOURS = "Пн–Пт · 10:00–20:00 · по записи"

SERVICES = [
    ("Нанесение плёнки", "Оклейка кузова и элементов защитной / цветной плёнкой."),
    ("Тюнинг внедорожников", "Доработки и оснащение внедорожников под ваши задачи."),
    ("Тюнинг выхлопной системы", "Установка и доработка выхлопа."),
    ("Тюнинг дисков", "Подбор, покраска и подготовка дисков."),
    ("Обвесы и спойлеры", "Установка обвесов, спойлеров и внешних элементов."),
    ("Установка ксенона", "Установка ксенона и сопутствующего света."),
    ("Шумоизоляция салона", "Шумо- и виброизоляция для тишины в салоне."),
    ("Парктроники и камеры", "Установка парковочных радаров и камер заднего вида."),
    ("Утепление салона", "Утепление салона для комфорта в холода."),
    ("Полировка / детейлинг", "Полировка и полный детейлинг кузова."),
]


def fetch_coords() -> tuple[str, str]:
    try:
        req = urllib.request.Request(
            FIRM, headers={"User-Agent": "Mozilla/5.0 (compatible; AlligatorSite/1.0)"}
        )
        html = urllib.request.urlopen(req, timeout=25).read().decode("utf-8", "ignore")
        m = re.search(r'"point"\s*:\s*\{\s*"lat"\s*:\s*([0-9.]+)\s*,\s*"lon"\s*:\s*([0-9.]+)', html)
        if m:
            return m.group(1), m.group(2)
        m = re.search(r"c=([0-9.]+),([0-9.]+)", html)
        if m:
            return m.group(1), m.group(2)
    except Exception as e:
        print("coords fetch failed", e)
    return "54.9580", "73.3860"  # Omsk approx Solnechnaya


def sync_photos() -> list[str]:
    PHOTO_DST.mkdir(parents=True, exist_ok=True)
    for old in PHOTO_DST.glob("*"):
        if old.is_file():
            old.unlink()
    names: list[str] = []
    files = sorted(PHOTO_SRC.glob("*"))
    for i, src in enumerate(files, 1):
        if not src.is_file():
            continue
        ext = src.suffix.lower() or ".jpg"
        name = f"ag-{i:02d}{ext}"
        shutil.copy2(src, PHOTO_DST / name)
        names.append(f"img/works/alligator/{name}")
    print("photos", len(names))
    return names


def logo_html(tag: str = "a", href: str = "index.html") -> str:
    if tag == "div":
        return '<div class="footer-logo"><span class="logo-mark">АЛЛИГАТОР</span></div>'
    return f'<div class="logo"><{tag} href="{href}"><span class="logo-mark">АЛЛИГАТОР</span></{tag}></div>'


NAV = f"""<nav class="site-nav">
  {logo_html()}
  <div class="links"><a href="services.html">УСЛУГИ</a><a href="gallery.html">РАБОТЫ</a><a href="about.html">О СТУДИИ</a><a href="contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:{PHONE_TEL}">{PHONE_DISP}</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">
    <a href="services.html">УСЛУГИ</a>
    <a href="gallery.html">РАБОТЫ</a>
    <a href="about.html">О СТУДИИ</a>
    <a href="contact.html">КОНТАКТЫ</a>
  </div>
</nav>"""


def address_map(lat: str, lon: str) -> str:
    return f"""<section class="address-map" id="contacts">
  <div class="address-map-bg">
    <div class="address-map-glow address-map-glow--tr"></div>
    <div class="address-map-glow address-map-glow--bl"></div>
  </div>
  <div class="address-map-inner">
    <div class="address-map-grid">
      <div class="address-map-intro">
        <div class="address-map-kicker">
          <span class="address-map-line"></span>
          <span class="kicker">ЛОКАЦИЯ</span>
        </div>
        <h2 class="address-map-title">ГДЕ МЫ<br><span>НАХОДИМСЯ.</span></h2>
        <p class="address-map-text">Адрес и маршрут — в 2ГИС.</p>
        <div class="address-map-divider" aria-hidden="true"></div>
      </div>
      <div class="address-map-visual">
        <a href="{FIRM}" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="https://static.maps.2gis.com/1.0?s=880x450&amp;c={lat},{lon}&amp;z=17&amp;pt={lat},{lon}~k:p" alt="">
          <img class="address-map-img address-map-img--mobile" src="https://static.maps.2gis.com/1.0?s=720x720&amp;c={lat},{lon}&amp;z=17&amp;pt={lat},{lon}~k:p" alt="Карта 2ГИС — {ADDR}">
          <div class="address-map-pin-label" aria-hidden="true">
            <span class="address-map-pin-label-text"><span class="logo-mark">АЛЛИГАТОР</span></span>
          </div>
        </a>
        <div class="address-map-decor"></div>
      </div>
      <div class="address-map-details-wrap">
        <div class="address-map-details">
          <div class="address-map-detail">
            <span class="address-map-detail-label">СТУДИЯ</span>
            <p class="address-map-brand"><span class="logo-mark">АЛЛИГАТОР</span></p>
            <p class="address-map-muted">{ADDR}</p>
            <p class="address-map-muted-sm">{HOURS}</p>
          </div>
          <div class="address-map-detail">
            <span class="address-map-detail-label">СВЯЗЬ</span>
            <a href="tel:{PHONE_TEL}" class="address-map-phone">{PHONE_DISP}</a>
            <p class="address-map-muted-sm" style="margin-top:10px"><a href="{PHONE_TG}" target="_blank" rel="noopener noreferrer">Telegram</a> · <a href="{PHONE_MAX}" target="_blank" rel="noopener noreferrer">Max</a></p>
          </div>
        </div>
        <a href="{FIRM}" class="address-map-btn" target="_blank" rel="noopener noreferrer">Как добраться</a>
      </div>
    </div>
  </div>
</section>"""


def footer() -> str:
    return f"""<footer class="site-footer">
  <div class="footer-grid footer-desktop-only">
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-brand-block">
        <div class="footer-logo"><span class="logo-mark">АЛЛИГАТОР</span></div>
        <div class="footer-social"><a href="{PHONE_MAX}" target="_blank" rel="noopener noreferrer">Max</a><a href="{PHONE_TG}" target="_blank" rel="noopener noreferrer">Telegram</a><a href="{FIRM}" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>{HOURS}</span>
      </div>
    </div>
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="index.html">Главная</a>
      <a href="services.html">Услуги</a>
      <a href="gallery.html">Работы</a>
      <a href="about.html">О студии</a>
      <a href="contact.html">Контакты</a>
    </div>
    <div class="footer-col footer-col--phones">
      <b>КОНТАКТЫ</b>
      <a class="footer-phone-inline" href="tel:{PHONE_TEL}">{PHONE_DISP}</a>
    </div>
  </div>
  <div class="footer-grid footer-mobile-only">
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="index.html">Главная</a>
      <a href="services.html">Услуги</a>
      <a href="gallery.html">Работы</a>
      <a href="about.html">О студии</a>
      <a href="contact.html">Контакты</a>
    </div>
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-phones-block">
        <b>КОНТАКТЫ</b>
        <a class="footer-phone-inline" href="tel:{PHONE_TEL}">{PHONE_DISP}</a>
      </div>
      <div class="footer-brand-divider" aria-hidden="true"></div>
      <div class="footer-brand-block">
        <div class="footer-logo"><span class="logo-mark">АЛЛИГАТОР</span></div>
        <div class="footer-social"><a href="{PHONE_MAX}" target="_blank" rel="noopener noreferrer">Max</a><a href="{PHONE_TG}" target="_blank" rel="noopener noreferrer">Telegram</a><a href="{FIRM}" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>{HOURS}</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Аллигатор</span>
    <span>ТЮНИНГ · ОМСК</span>
  </div>
</footer>"""


def page_shell(title: str, body: str, build: str = "alligator-2026-10-13") -> str:
    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta name="site-build" content="{build}">
<title>{title}</title>
<link rel="stylesheet" href="styles.css?v=ag1">
</head>
<body>
{NAV}
{body}
<div class="site-bottom">
{{{{MAP}}}}
{footer()}
</div>
<script src="nav.js"></script>
<script src="stats.js"></script>
</body>
</html>
"""


def write_index(photos: list[str], lat: str, lon: str) -> None:
    hero = photos[0] if photos else ""
    strip = photos[1:7] if len(photos) > 1 else photos
    works = photos[7:12] if len(photos) > 7 else photos[:5]

    svc_cards = []
    for i, (title, desc) in enumerate(SERVICES[:6]):
        img = photos[i % len(photos)] if photos else ""
        svc_cards.append(
            f"""    <a class="photo" href="services.html" style="background-image:url('{img}')"><span class="tag">{title.upper()}</span></a>"""
        )

    work_cards = []
    tags = ["ПЛЁНКА", "ТЮНИНГ", "ДЕТЕЙЛИНГ", "ВЫХЛОП", "ДИСКИ"]
    for i, img in enumerate(works[:5] or photos[:5]):
        work_cards.append(
            f"""    <a class="photo" href="gallery.html" style="background-image:url('{img}')"><span class="tag">{tags[i % len(tags)]}</span></a>"""
        )

    body = f"""
<section class="hero">
  <div class="heroimg" style="background-image:url('{hero}')"></div>
  <div class="hero-stack">
    <h1 class="hero-brand">
      <span class="hero-brand-word" style="letter-spacing:.12em;text-indent:0">АЛЛИГАТОР</span>
    </h1>
    <div class="hero-content">
      <p>Студия тюнинга и детейлинга в Омске: плёнка, внедорожники, выхлоп, диски, обвесы, свет, шумоизоляция и полировка.</p>
      <div class="actions"><a class="button" href="tel:{PHONE_TEL}">ЗАПИСАТЬСЯ</a><a class="button dark" href="services.html">УСЛУГИ</a></div>
    </div>
    <div class="stats stats--hero">
      <div class="stat"><b>4.9</b><span>ОЦЕНКА · 2ГИС</span></div>
      <div class="stat"><b>50+</b><span>ОЦЕНОК</span></div>
      <div class="stat"><b id="stat-rating">4.9</b><span>СРЕДНЯЯ · 2ГИС</span></div>
      <div class="stat"><b>ОМСК</b><span>2-Я СОЛНЕЧНАЯ</span></div>
    </div>
  </div>
</section>

<section class="section" id="services">
  <div class="section-head">
    <div><div class="kicker">01 / УСЛУГИ</div><h2>ТЮНИНГ<br><span class="accent">И ДЕТЕЙЛИНГ.</span></h2></div>
    <p class="intro">Плёнка, доработки внедорожников, выхлоп, диски, обвесы, свет, шумоизоляция, парктроники, утепление и полировка.</p>
  </div>
  <div class="photo-strip photo-strip--services photo-strip--home">
{chr(10).join(svc_cards)}
  </div>
  <p class="intro" style="margin-top:24px"><a href="services.html" style="color:var(--accent);text-decoration:underline">Полный список услуг</a></p>
</section>

<section class="section" id="works">
  <div class="section-head">
    <div><div class="kicker">02 / РАБОТЫ</div><h2>НАШИ<br><span class="accent">РАБОТЫ.</span></h2></div>
    <p class="intro">Примеры работ студии Аллигатор.</p>
  </div>
  <div class="photo-strip photo-strip--services">
{chr(10).join(work_cards)}
  </div>
</section>

<section class="process" id="process">
  <div class="kicker">03 / ПРОЦЕСС</div>
  <h2>КАК МЫ<br><span class="accent">РАБОТАЕМ.</span></h2>
  <div class="steps">
    <div class="step"><b>01</b><h3>Осмотр</h3><p>Смотрим задачу, согласуем объём и стоимость.</p></div>
    <div class="step"><b>02</b><h3>Подготовка</h3><p>Готовим авто и материалы под выбранные работы.</p></div>
    <div class="step"><b>03</b><h3>Работа</h3><p>Делаем тюнинг, плёнку, шумоизоляцию или детейлинг.</p></div>
    <div class="step"><b>04</b><h3>Выдача</h3><p>Проверяем результат и отдаём автомобиль.</p></div>
  </div>
</section>
"""
    html = page_shell("Аллигатор — тюнинг и детейлинг · Омск", body).replace("{{MAP}}", address_map(lat, lon))
    # hero uses inline background; keep .heroimg CSS but override
    (ROOT / "index.html").write_text(html, encoding="utf-8")
    print("wrote index.html")


def write_services(lat: str, lon: str) -> None:
    rows = []
    for i, (title, desc) in enumerate(SERVICES, 1):
        rows.append(
            f"""    <div class="service-row"><div class="idx">{i:02d}</div><div><h3>{title}</h3><div class="service-desc"><p class="service-lead">{desc}</p></div></div><div class="cost">по осмотру</div></div>"""
        )
    body = f"""
<section class="subpage-hero">
  <div class="kicker">01 / УСЛУГИ</div>
  <h1>ТЮНИНГ,<br>ПЛЁНКА,<br><span class="accent">ДЕТЕЙЛИНГ.</span></h1>
  <p>Основные направления студии Аллигатор в Омске. Стоимость — после осмотра.</p>
</section>

<section class="section">
  <div class="section-head service-catalog-head">
    <div><div class="kicker">КАТАЛОГ</div><h2>УСЛУГИ</h2></div>
  </div>
  <div class="service-list">
{chr(10).join(rows)}
  </div>
</section>

<section class="process services-process">
  <div class="kicker">ПРОЦЕСС</div>
  <h2>КАК МЫ<br><span class="accent">РАБОТАЕМ.</span></h2>
  <div class="steps-track">
    <div class="steps">
      <div class="step"><b>01</b><h3>Осмотр</h3><p>Фиксируем задачу и согласуем объём.</p></div>
      <div class="step"><b>02</b><h3>Подготовка</h3><p>Готовим поверхности и материалы.</p></div>
      <div class="step"><b>03</b><h3>Работа</h3><p>Выполняем согласованные работы.</p></div>
      <div class="step"><b>04</b><h3>Выдача</h3><p>Проверяем результат перед выдачей.</p></div>
    </div>
  </div>
</section>
"""
    html = page_shell("Услуги — Аллигатор", body).replace("{{MAP}}", address_map(lat, lon))
    (ROOT / "services.html").write_text(html, encoding="utf-8")
    print("wrote services.html")


def write_gallery(photos: list[str], lat: str, lon: str) -> None:
    items = []
    for img in photos:
        items.append(
            f"""    <a class="g g--media" href="{img}" data-lightbox="works"><img src="{img}" alt="" loading="lazy" decoding="async"></a>"""
        )
    body = f"""
<section class="subpage-hero">
  <div class="kicker">02 / РАБОТЫ</div>
  <h1>ГАЛЕРЕЯ<br><span class="accent">РАБОТ.</span></h1>
  <p>Фотографии работ студии Аллигатор.</p>
</section>

<section class="section">
  <div class="gallery-grid">
{chr(10).join(items)}
  </div>
</section>
"""
    html = page_shell("Работы — Аллигатор", body).replace("{{MAP}}", address_map(lat, lon))
    html = html.replace(
        '<script src="stats.js"></script>',
        '<script src="gallery-lightbox.js"></script>\n<script src="stats.js"></script>',
    )
    (ROOT / "gallery.html").write_text(html, encoding="utf-8")
    print("wrote gallery.html")


def write_about(lat: str, lon: str) -> None:
    body = f"""
<section class="subpage-hero">
  <div class="kicker">03 / О СТУДИИ</div>
  <h1>АЛЛИГАТОР<br><span class="accent">ОМСК.</span></h1>
  <p>Тюнинг и детейлинг на 2-й Солнечной, 46/3. Плёнка, внедорожники, выхлоп, диски, свет, шумоизоляция и полировка.</p>
</section>

<div class="stats">
  <div class="stat"><b>4.9</b><span>ОЦЕНКА · 2ГИС</span></div>
  <div class="stat"><b>50+</b><span>ОЦЕНОК</span></div>
  <div class="stat"><b>ОМСК</b><span>КИРОВСКИЙ ОКРУГ</span></div>
  <div class="stat"><b>10:00</b><span>ОТКРЫВАЕМСЯ</span></div>
</div>

<section class="section">
  <div class="section-head">
    <div><div class="kicker">ПОДХОД</div><h2>ЧТО<br><span class="accent">ДЕЛАЕМ.</span></h2></div>
    <p class="intro">Работаем по записи. Можно прислать фото — сориентируем по объёму и стоимости.</p>
  </div>
  <div class="faq">
    <details open><summary>Как узнать стоимость?</summary><p>Позвоните или напишите в Telegram / Max — пришлите фото. Точная цена после осмотра.</p></details>
    <details><summary>Какие услуги есть?</summary><p>Плёнка, тюнинг внедорожников, выхлоп, диски, обвесы, ксенон, шумоизоляция, парктроники и камеры, утепление салона, полировка и детейлинг.</p></details>
    <details><summary>Где вы находитесь?</summary><p>{ADDR}. Маршрут — в <a href="{FIRM}" target="_blank" rel="noopener noreferrer">2ГИС</a>.</p></details>
  </div>
</section>
"""
    html = page_shell("О студии — Аллигатор", body).replace("{{MAP}}", address_map(lat, lon))
    (ROOT / "about.html").write_text(html, encoding="utf-8")
    print("wrote about.html")


def write_contact(lat: str, lon: str) -> None:
    body = f"""
<section class="subpage-hero">
  <div class="kicker">04 / КОНТАКТЫ</div>
  <h1>СВЯЗАТЬСЯ<br><span class="accent">С НАМИ.</span></h1>
  <p>Телефон, Telegram, Max и адрес студии в Омске.</p>
</section>

<section class="section">
  <div class="contact-box">
    <div>
      <div class="kicker">СТУДИЯ</div>
      <h2>ОМСК</h2>
      <div class="contact-info">
        <p>{ADDR}</p>
        <p>{HOURS}</p>
        <p><a href="{FIRM}" target="_blank" rel="noopener noreferrer">Маршрут в 2ГИС →</a></p>
      </div>
    </div>
    <div class="contact-form">
      <div class="kicker">СВЯЗЬ</div>
      <h3>ЗВОНИТЕ<br>ИЛИ ПИШИТЕ.</h3>
      <div class="contact-info">
        <p><a href="tel:{PHONE_TEL}">{PHONE_DISP}</a></p>
        <p><a href="{PHONE_TG}" target="_blank" rel="noopener noreferrer">Telegram →</a></p>
        <p><a href="{PHONE_MAX}" target="_blank" rel="noopener noreferrer">Max →</a></p>
        <p><a href="{FIRM}" target="_blank" rel="noopener noreferrer">Отзывы и карта в 2ГИС →</a></p>
      </div>
      <p class="contact-note">Позвоните или напишите — расскажем об услугах и сориентируем по стоимости.</p>
    </div>
  </div>
</section>
"""
    html = page_shell("Контакты — Аллигатор", body).replace("{{MAP}}", address_map(lat, lon))
    (ROOT / "contact.html").write_text(html, encoding="utf-8")
    print("wrote contact.html")


def patch_css() -> None:
    css_path = ROOT / "styles.css"
    css = css_path.read_text(encoding="utf-8")
    # green accent
    css = re.sub(r"--accent:#[0-9a-fA-F]+;", "--accent:#4caf50;", css, count=1)
    css = re.sub(
        r"--accent-soft:rgba\([^)]+\);",
        "--accent-soft:rgba(76,175,80,.42);",
        css,
        count=1,
    )
    css = re.sub(r"--accent-hover:#[0-9a-fA-F]+;", "--accent-hover:#6ddb72;", css, count=1)
    css = re.sub(r"--accent-deep:#[0-9a-fA-F]+;", "--accent-deep:#2e7d32;", css, count=1)
    css = re.sub(r"--accent-rgb:[0-9,\s]+;", "--accent-rgb:76,175,80;", css, count=1)
    # soften D2 cream process if needed — keep process block
    # hero without D2 logo halves dependency
    if ".heroimg{" in css and "background-size" not in css.split(".heroimg{")[1][:200]:
        css = css.replace(
            ".heroimg{",
            ".heroimg{background-size:cover;background-position:center;",
            1,
        )
    css_path.write_text(css, encoding="utf-8")
    print("patched styles.css accent")


def patch_server() -> None:
    sp = ROOT / "server.py"
    t = sp.read_text(encoding="utf-8")
    t = t.replace("PORT = 8110", "PORT = 8090")
    t = t.replace(
        'FIRM_URL = "https://2gis.ru/novosibirsk/firm/70000001061278508"',
        f'FIRM_URL = "{FIRM}"',
    )
    t = t.replace("D2DetailingSite", "AlligatorSite")
    sp.write_text(t, encoding="utf-8")
    (ROOT / "start.bat").write_text(
        """@echo off
setlocal
cd /d "%~dp0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8090" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)
echo.
echo Аллигатор — http://127.0.0.1:8090/
echo Press Ctrl+C to stop.
echo.
python -u server.py
if errorlevel 1 (
  echo.
  echo If python is missing, try: py -3 -u server.py
  pause
)
""",
        encoding="utf-8",
    )
    (ROOT / "deploy-version.txt").write_text(
        "site=alligator\n"
        "prod=https://melissa-tech.ru/alligator/\n"
        "deploy=git-push-timeweb-hook\n"
        "deploy-trigger=alligator-from-d2-v1\n",
        encoding="utf-8",
    )
    (ROOT / "README.md").write_text(
        "# Аллигатор — Омск\n\n"
        "Сайт студии тюнинга и детейлинга. Основан на шаблоне D2 (копия, D2 не менялся).\n\n"
        f"- [2ГИС]({FIRM})\n"
        f"- Адрес: {ADDR}\n"
        f"- Телефон: {PHONE_DISP}\n\n"
        "Локально: `start.bat` → http://127.0.0.1:8090/\n",
        encoding="utf-8",
    )
    print("patched server/start/readme")


def main() -> None:
    assert ROOT.exists(), ROOT
    photos = sync_photos()
    lat, lon = fetch_coords()
    print("coords", lat, lon)
    patch_css()
    patch_server()
    write_index(photos, lat, lon)
    write_services(lat, lon)
    write_gallery(photos, lat, lon)
    write_about(lat, lon)
    write_contact(lat, lon)
    # ensure no kuzov / wrap leftovers
    for p in ROOT.rglob("*"):
        if p.is_file() and re.search(r"kuzov|wrap-boot|wrap-config|three\.module", p.name, re.I):
            print("leftover", p)
    print("done")


if __name__ == "__main__":
    main()
