#!/usr/bin/env python3
"""Apply Pervushin D2 shell to Prime.38 (detailing), keeping Prime photos & 2 BA sliders."""

from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "pervushin-avtokompleks-ekaterinburg"
DST = ROOT / "prime38-detailing-angarsk"

CFG = {
    "css_v": "110",
    "phone_tel": "+79500913882",
    "phone_display": "+7 (950) 091-38-82",
    "wa": "79500913882",
    "tg": "+79500913882",
    "address": "г. Ангарск, 253-й квартал, стр. 19",
    "schedule": "По предварительной записи · 10:00–20:00",
    "city": "Ангарск",
    "firm_url": "https://2gis.ru/angarsk/firm/70000001061012787",
    "map_c": "52.494004,103.847366",
    "map_alt": "Карта 2ГИС — г. Ангарск, 253-й квартал, стр. 19",
    "rating": "5.0",
    "reviews": "45",
    "years": "5+",
    "photo_dir": "prime38",
    "about_lead": (
        "«Прайм.38» — детейлинг-центр в 253-м квартале Ангарска. "
        "Мойка и детейлинг, полировка, защитные покрытия и плёнка, тонировка, химчистка салона и антикор. "
        "Работаем по предварительной записи с 10:00 до 20:00 — звоните или пишите в мессенджерах."
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

NAV_ROOT = """<nav class="site-nav">
  <div class="logo"><a href="index.html"><span class="logo-mark">ПРАЙМ.</span><span class="logo-word">38</span></a></div>
  <div class="links"><a href="services.html">УСЛУГИ</a><a href="gallery.html">РАБОТЫ</a><a href="about.html">О НАС</a><a href="contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:+79500913882">+7 (950) 091-38-82</a>
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
        <p class="address-map-text">Приезжайте по записи. Адрес и маршрут — в 2ГИС.</p>
        <div class="address-map-divider" aria-hidden="true"></div>
      </div>
      <div class="address-map-visual">
        <a href="{CFG['firm_url']}" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="https://static.maps.2gis.com/1.0?s=880x450&amp;c={CFG['map_c']}&amp;z=16&amp;pt={CFG['map_c']}~k:p" alt="">
          <img class="address-map-img address-map-img--mobile" src="https://static.maps.2gis.com/1.0?s=720x720&amp;c={CFG['map_c']}&amp;z=16&amp;pt={CFG['map_c']}~k:p" alt="{CFG['map_alt']}">
          <div class="address-map-pin-label" aria-hidden="true">
            <span class="address-map-pin-label-text"><span class="logo-mark">ПРАЙМ.</span><span class="logo-word">38</span></span>
          </div>
        </a>
        <div class="address-map-decor"></div>
      </div>
      <div class="address-map-details-wrap">
        <div class="address-map-details">
          <div class="address-map-detail">
            <span class="address-map-detail-label">СТУДИЯ</span>
            <p class="address-map-brand"><span class="logo-mark">ПРАЙМ.</span><span class="logo-word">38</span></p>
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
        <div class="footer-logo"><span class="logo-mark">ПРАЙМ.</span><span class="logo-word">38</span></div>
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
        <div class="footer-logo"><span class="logo-mark">ПРАЙМ.</span><span class="logo-word">38</span></div>
        <div class="footer-social"><a href="https://wa.me/{CFG['wa']}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://t.me/{CFG['tg']}" target="_blank" rel="noopener noreferrer">Telegram</a><a href="{CFG['firm_url']}" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>{CFG['schedule']}</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Прайм.38</span>
    <span>ДЕТЕЙЛИНГ · АНГАРСК</span>
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


def sync_styles() -> None:
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    css = re.sub(r":root\{[^}]+\}", PRIME_ROOT.strip(), css, count=1)
    css = css.replace(
        ".site-nav .logo .logo-word{display:none}",
        ".site-nav .logo .logo-word{color:#fff}",
    )
    css = css.replace(
        "background:url('img/works/hero-raptor.jpg?v=raptor')",
        "background:url('img/works/incoming/prime38/01-2gis.jpg')",
    )
    css = re.sub(
        r"(\.hero--sdc \.hero-heading h1\{[^}]*?)line-height:\.87;",
        r"\1line-height:1.05;",
        css,
        count=1,
    )
    (DST / "styles.css").write_text(css, encoding="utf-8")


def sync_js() -> None:
    for name in ("nav.js", "ba-slider.js", "stats.js", "reviews-carousel.js", "messenger-picker.js", "gallery-load.js"):
        shutil.copy2(SRC / name, DST / name)


def write_index() -> None:
    v = CFG["css_v"]
    content = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Прайм.38 — детейлинг Ангарск</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body>
{NAV_ROOT}

<section class="hero hero--sdc">
  <div class="heroimg" style="background-image:url('img/works/incoming/prime38/01-2gis.jpg')"></div>
  <div class="hero-panel">
    <div class="hero-heading">
      <div class="eyebrow hero-eyebrow-city">АНГАРСК</div>
      <h1>ДЕТЕЙЛИНГ<br>ЦЕНТР<br><span class="accent">ПРАЙМ.38</span></h1>
    </div>
    <div class="hero-content">
      <p>Детейлинг-центр в Ангарске: мойка, полировка, защитные покрытия, антикор и тонировка по записи.</p>
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

<section class="section" id="services">
  <div class="section-head">
    <div><div class="kicker">01 / УСЛУГИ</div><h2>ДЕТЕЙЛИНГ<br><span class="accent">И ЗАЩИТА. КУЗОВА</span></h2></div>
    <p class="intro">Работаем по записи — стоимость после осмотра автомобиля.</p>
  </div>
  <div class="photo-strip photo-strip--services photo-strip--home">
    <a class="photo" href="services/wash.html" style="background-image:url('img/works/incoming/prime38/06-2gis.jpg')"><span class="tag">ДЕТЕЙЛИНГ-МОЙКА</span></a>
    <a class="photo photo-pos-polish" href="services/polish.html" style="background-image:url('img/works/incoming/prime38/07-2gis.jpg')"><span class="tag">ПОЛИРОВКА</span></a>
    <a class="photo" href="services/anticor.html" style="background-image:url('img/works/incoming/prime38/08-2gis.jpg')"><span class="tag">АНТИКОР</span></a>
    <a class="photo" href="services/ppf.html" style="background-image:url('img/works/incoming/prime38/09-2gis.jpg')"><span class="tag">ЗАЩИТНАЯ ПЛЁНКА</span></a>
    <a class="photo" href="services/tint.html" style="background-image:url('img/works/incoming/prime38/10-2gis.jpg')"><span class="tag">ТОНИРОВКА</span></a>
    <a class="photo" href="services/interior.html" style="background-image:url('img/works/incoming/prime38/11-2gis.jpg')"><span class="tag">ХИМЧИСТКА</span></a>
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
    <a class="photo" href="gallery.html" style="background-image:url('img/works/incoming/prime38/01-2gis.jpg')"></a>
    <a class="photo" href="gallery.html" style="background-image:url('img/works/incoming/prime38/02-2gis.jpg')"></a>
    <a class="photo" href="gallery.html" style="background-image:url('img/works/incoming/prime38/03-2gis.jpg')"></a>
    <a class="photo" href="gallery.html" style="background-image:url('img/works/incoming/prime38/04-2gis.jpg')"></a>
    <a class="photo" href="gallery.html" style="background-image:url('img/works/incoming/prime38/05-2gis.jpg')"></a>
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
    rows = """    <a class="service-row" href="services/wash.html" id="svc-01"><div class="idx">01</div><div><h3>Детейлинг-мойка</h3><div class="service-desc"><p class="service-lead">Бережная мойка кузова и салона.</p></div></div><div class="cost">после осмотра</div></a>
    <a class="service-row" href="services/polish.html" id="svc-02"><div class="idx">02</div><div><h3>Полировка кузова</h3><div class="service-desc"><p class="service-lead">Восстановление блеска ЛКП и оптики.</p></div></div><div class="cost">после осмотра</div></a>
    <a class="service-row" href="services/anticor.html" id="svc-03"><div class="idx">03</div><div><h3>Антикоррозийная обработка</h3><div class="service-desc"><p class="service-lead">Защита днища и скрытых полостей.</p></div></div><div class="cost">после осмотра</div></a>
    <a class="service-row" href="services/ppf.html" id="svc-04"><div class="idx">04</div><div><h3>Защитная плёнка</h3><div class="service-desc"><p class="service-lead">PPF на зоны риска и элементы кузова.</p></div></div><div class="cost">после осмотра</div></a>
    <a class="service-row" href="services/tint.html" id="svc-05"><div class="idx">05</div><div><h3>Тонировка</h3><div class="service-desc"><p class="service-lead">Тонировка стёкол и атермальные плёнки.</p></div></div><div class="cost">после осмотра</div></a>
    <a class="service-row" href="services/interior.html" id="svc-06"><div class="idx">06</div><div><h3>Химчистка салона</h3><div class="service-desc"><p class="service-lead">Глубокая очистка интерьера.</p></div></div><div class="cost">после осмотра</div></a>"""
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Услуги — Прайм.38</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body class="page-sub">
{NAV_ROOT}

<section class="subpage-hero">
  <div class="kicker">01 / УСЛУГИ</div>
  <h1>ДЕТЕЙЛИНГ-ЦЕНТР<br><span class="accent">АНГАРСК</span></h1>
  <p>Работаем по записи — стоимость после осмотра автомобиля.</p>
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
<title>О нас — Прайм.38</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body class="page-sub">
{NAV_ROOT}

<section class="subpage-hero subpage-hero--about">
  <div class="kicker">03 / О НАС</div>
  <h1>ДЕТЕЙЛИНГ-ЦЕНТР<br><span class="accent">ПРАЙМ.38</span></h1>
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
<title>Контакты — Прайм.38</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body class="page-sub">
{NAV_ROOT}

<section class="subpage-hero">
  <div class="kicker">04 / КОНТАКТЫ</div>
  <h1>СВЯЗАТЬСЯ<br><span class="accent">С НАМИ</span></h1>
  <p>{CFG['city']} · работаем по записи</p>
</section>

<section class="section">
  <div class="contact-panel">
    <div class="contact-panel-card">
      <div class="kicker">АДРЕС</div>
      <h2>ДЕТЕЙЛИНГ-ЦЕНТР<br>ПРАЙМ.38</h2>
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
<title>Работы — Прайм.38</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body class="page-sub">
{NAV_ROOT}

<section class="subpage-hero">
  <div class="kicker">02 / РАБОТЫ</div>
  <h1>НАШИ<br><span class="accent">РАБОТЫ</span></h1>
  <p>Фото работ детейлинг-центра: мойка, полировка, защита и уход за салоном.</p>
</section>

<section class="section work-block" id="work-album">
  <div class="section-head">
    <div><div class="kicker">АЛЬБОМ</div><h2>РАБОТЫ ДЕТЕЙЛИНГ-ЦЕНТРА</h2></div>
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
    "wash.html": ("Детейлинг-мойка", "ДЕТЕЙЛИНГ-МОЙКА", "Бережная мойка кузова и салона."),
    "polish.html": ("Полировка кузова", "ПОЛИРОВКА КУЗОВА", "Восстановление блеска ЛКП и оптики."),
    "anticor.html": ("Антикоррозийная обработка", "АНТИКОРРОЗИЙНАЯ ОБРАБОТКА", "Защита днища и скрытых полостей."),
    "ppf.html": ("Защитная плёнка", "ЗАЩИТНАЯ ПЛЁНКА", "PPF на зоны риска и элементы кузова."),
    "tint.html": ("Тонировка", "ТОНИРОВКА", "Тонировка стёкол и атермальные плёнки."),
    "interior.html": ("Химчистка салона", "ХИМЧИСТКА САЛОНА", "Глубокая очистка интерьера."),
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
<title>{title} — Прайм.38</title>
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
    sync_styles()
    sync_js()
    (DST / "partials").mkdir(exist_ok=True)
    (DST / "partials/site-bottom-root.html").write_text(site_bottom(), encoding="utf-8")
    write_index()
    write_services_page()
    write_about()
    write_contact()
    write_gallery()
    write_service_pages()
    print("Prime.38 synced from Pervushin shell.")


if __name__ == "__main__":
    main()
