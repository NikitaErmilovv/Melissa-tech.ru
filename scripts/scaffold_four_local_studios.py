#!/usr/bin/env python3
"""Scaffold 4 local D2-style prototypes (copy Klyaksa template + per-studio config)."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

from fetch_2gis_reviews import fetch_branch_reviews

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "klyaksa-tuning-noyabrsk"
CSS_V = "91"

SITES: list[dict] = [
    {
        "slug": "pervushin-avtokompleks-ekaterinburg",
        "photo_folder": "pervushin",
        "name": "Первушин",
        "logo_mark": "ПЕРВУШИН",
        "logo_word": "АВТОКОМПЛЕКС",
        "city": "Екатеринбург",
        "city_slug": "ekaterinburg",
        "firm_id": "70000001034025330",
        "phone_tel": "+79502047798",
        "phone_display": "+7 (950) 204-77-98",
        "address": "г. Екатеринбург, ул. Новосибирская, 109/4",
        "schedule": "Ежедневно · 10:00–20:00",
        "map_lat": 56.771924,
        "map_lon": 60.597459,
        "port": 8124,
        "rating": "4.9",
        "reviews_count": "112",
        "stat_extra_b": "10+",
        "stat_extra_s": "ЛЕТ НА РЫНКЕ",
        "theme": "default",
        "auto_sales": True,
        "hero_lead": "Автокомплекс в Чкаловском районе: ремонт ходовой, шиномонтаж, ТО, кузовные работы и продажа проверенных автомобилей.",
        "about": "«Первушин» — автокомплекс на Новосибирской, 109/4. Ремонт подвески и ходовой, сервисное обслуживание, шины и кузовные работы. Помогаем с подбором и продажей авто.",
        "services_section_title": ("СЕРВИС", "И АВТО."),
        "services_intro": "Ремонт, обслуживание и продажа автомобилей — стоимость после осмотра.",
        "services": [
            ("Ремонт ходовой части", "Диагностика и восстановление подвески, рулевого и тормозов.", "после осмотра", "suspension"),
            ("Шиномонтаж", "Сезонная замена, балансировка и ремонт покрышек.", "после осмотра", "tires"),
            ("Техническое обслуживание", "Регламентные работы и замена расходников.", "после осмотра", "service"),
            ("Кузовной ремонт", "Восстановление геометрии и элементов кузова.", "после осмотра", "body"),
            ("Автомойка", "Мойка кузова и салона.", "после осмотра", "wash"),
            ("Продажа автомобилей", "Подбор и продажа проверенных машин — см. раздел «Авто».", "по объявлению", "cars"),
        ],
    },
    {
        "slug": "pervyy-rul-masterskaya-novokuznetsk",
        "photo_folder": "pervyy-rul",
        "name": "Первый руль",
        "logo_mark": "ПЕРВЫЙ",
        "logo_word": "РУЛЬ",
        "city": "Новокузнецк",
        "city_slug": "novokuznetsk",
        "firm_id": "70000001111114731",
        "phone_tel": "+79993251337",
        "phone_display": "+7 (999) 325-13-37",
        "address": "г. Новокузнецк, ул. Сибиряков-Гвардейцев, 1Б",
        "schedule": "Ежедневно · 10:00–20:00",
        "map_lat": 53.750664,
        "map_lon": 87.105381,
        "port": 8125,
        "rating": "4.6",
        "reviews_count": "71",
        "stat_extra_b": "5+",
        "stat_extra_s": "ЛЕТ РАБОТЫ",
        "theme": "turquoise",
        "auto_sales": True,
        "hero_lead": "Автокомплекс на Сибиряков-Гвардейцев: ремонт и диагностика, шиномонтаж, электрика и продажа автомобилей.",
        "about": "Мастерская «Первый руль» — СТО и автокомплекс в Куйбышевском районе Новокузнецка. Ремонт, диагностика, шины и сопутствующие услуги, а также продажа авто.",
        "services_section_title": ("СТО", "И АВТО."),
        "services_intro": "Ремонт, диагностика и автомобили в продаже — уточняйте по телефону.",
        "services": [
            ("Ремонт автомобилей", "Механические и агрегатные работы по результатам диагностики.", "после осмотра", "repair"),
            ("Компьютерная диагностика", "Поиск неисправностей электронных систем.", "после осмотра", "diagnostics"),
            ("Шиномонтаж", "Замена сезонных комплектов и балансировка.", "после осмотра", "tires"),
            ("Ремонт ходовой", "Подвеска, рулевое, тормозная система.", "после осмотра", "suspension"),
            ("Автоэлектрика", "Проводка, стартер, генератор, освещение.", "после осмотра", "electrics"),
            ("Продажа автомобилей", "Актуальные предложения — в разделе «Авто» и по телефону.", "по объявлению", "cars"),
        ],
    },
    {
        "slug": "prime38-detailing-angarsk",
        "photo_folder": "prime38",
        "name": "Прайм.38",
        "logo_mark": "ПРАЙМ",
        "logo_word": "38",
        "city": "Ангарск",
        "city_slug": "angarsk",
        "firm_id": "70000001061012787",
        "phone_tel": "+79500913882",
        "phone_display": "+7 (950) 091-38-82",
        "address": "г. Ангарск, 253-й квартал, стр. 19",
        "schedule": "По предварительной записи · 10:00–20:00",
        "map_lat": 52.494004,
        "map_lon": 103.847366,
        "port": 8126,
        "rating": "5.0",
        "reviews_count": "49",
        "stat_extra_b": "5+",
        "stat_extra_s": "ЛЕТ НА РЫНКЕ",
        "theme": "prime38",
        "auto_sales": False,
        "hero_lead": "Детейлинг-центр в Ангарске: мойка, полировка, защитные покрытия, антикор и тонировка по записи.",
        "about": "«Прайм.38» — детейлинг-центр в 253-м квартале. Уход за кузовом и салоном, антикоррозийная обработка и защитные решения.",
        "services_section_title": ("ДЕТЕЙЛИНГ", "И ЗАЩИТА."),
        "services_intro": "Работаем по записи — стоимость после осмотра автомобиля.",
        "services": [
            ("Детейлинг-мойка", "Бережная мойка кузова и салона.", "после осмотра", "wash"),
            ("Полировка кузова", "Восстановление блеска ЛКП и оптики.", "после осмотра", "polish"),
            ("Антикоррозийная обработка", "Защита днища и скрытых полостей.", "после осмотра", "anticor"),
            ("Защитная плёнка", "PPF на зоны риска и элементы кузова.", "после осмотра", "ppf"),
            ("Тонировка", "Тонировка стёкол и атермальные плёнки.", "после осмотра", "tint"),
            ("Химчистка салона", "Глубокая очистка интерьера.", "после осмотра", "interior"),
        ],
    },
    {
        "slug": "proffkar-avtotekhservis-tyumen",
        "photo_folder": "proffkar",
        "name": "Проффкар",
        "logo_mark": "ПРОФФ",
        "logo_word": "КАР",
        "city": "Тюмень",
        "city_slug": "tyumen",
        "firm_id": "70000001080387917",
        "phone_tel": "+79324791212",
        "phone_display": "+7 (932) 479-12-12",
        "address": "г. Тюмень, ул. Камчатская, 192/3",
        "schedule": "Ежедневно · 10:00–20:00",
        "map_lat": 57.155096,
        "map_lon": 65.674135,
        "port": 8127,
        "rating": "5.0",
        "reviews_count": "56",
        "stat_extra_b": "6+",
        "stat_extra_s": "ЛЕТ РАБОТЫ",
        "theme": "default",
        "auto_sales": False,
        "hero_lead": "Автотехсервис на Камчатской: ремонт и ТО, шиномонтаж, детейлинг и комплексный уход за автомобилем.",
        "about": "«Проффкар» — автотехсервис в Ленинском округе Тюмени. Ремонт, обслуживание, шины и детейлинг в одном месте.",
        "services_section_title": ("СЕРВИС", "И УХОД."),
        "services_intro": "Ремонт, ТО и детейлинг — финальная цена после осмотра.",
        "services": [
            ("Ремонт автомобилей", "Механика и агрегаты по согласованному плану.", "после осмотра", "repair"),
            ("Техническое обслуживание", "Регламентные работы и замена жидкостей.", "после осмотра", "service"),
            ("Шиномонтаж", "Сезонная замена и балансировка.", "после осмотра", "tires"),
            ("Детейлинг", "Мойка, полировка и защита кузова.", "после осмотра", "detailing"),
            ("Диагностика", "Компьютерная и механическая диагностика.", "после осмотра", "diagnostics"),
            ("Автомойка", "Мойка кузова и салона.", "после осмотра", "wash"),
        ],
    },
]

OLD = {
    "slug": "klyaksa-tuning-noyabrsk",
    "photo_folder": "klyaksa",
    "name": "Клякса Tuning studio",
    "logo_mark": "КЛЯКСА",
    "logo_word": "НОЯБРЬСК",
    "city": "Ноябрьск",
    "city_slug": "noyabrsk",
    "firm_id": "70000001035583613",
    "phone_tel": "+79320590591",
    "phone_display": "+7 (932) 059-05-91",
    "address": "г. Ноябрьск, ул. Строителей, 24",
    "schedule": "Ежедневно · 10:00–20:00",
    "map_lat": 63.182081,
    "map_lon": 75.431801,
    "hero_lead": "Детейлинг-мойка, полировка, химчистка, защита кузова и салона, антигравий, антихром, тонировка и шумоизоляция в Ноябрьске.",
}


def firm_url(site: dict) -> str:
    return f"https://2gis.ru/{site['city_slug']}/firm/{site['firm_id']}"


def map_img(site: dict, size: str) -> str:
    lat, lon = site["map_lat"], site["map_lon"]
    return (
        f"https://static.maps.2gis.com/1.0?s={size}&c={lat},{lon}&z=16"
        f"&pt={lat},{lon}~k:p"
    )


def replace_site_text(text: str, site: dict) -> str:
    pairs = [
        (OLD["slug"], site["slug"]),
        (OLD["photo_folder"], site["photo_folder"]),
        (OLD["name"], site["name"]),
        (OLD["logo_mark"], site["logo_mark"]),
        (OLD["logo_word"], site["logo_word"]),
        (OLD["city"], site["city"]),
        (OLD["city_slug"], site["city_slug"]),
        (OLD["firm_id"], site["firm_id"]),
        (OLD["phone_tel"], site["phone_tel"]),
        (OLD["phone_display"], site["phone_display"]),
        (OLD["address"], site["address"]),
        (OLD["schedule"], site["schedule"]),
        (f"{OLD['map_lat']},{OLD['map_lon']}", f"{site['map_lat']},{site['map_lon']}"),
        (OLD["hero_lead"], site["hero_lead"]),
        ("Клякса Tuning studio", site["name"]),
        ("TUNING STUDIO", f"{site['logo_mark']} {site['logo_word']}".strip()),
        ("НОЯБРЬСК", site["city"].upper()),
        ("79320590591", site["phone_tel"].replace("+", "")),
        ("+79320590591", site["phone_tel"]),
    ]
    for a, b in pairs:
        text = text.replace(a, b)
    return text


def nav_html(site: dict, prefix: str = "") -> str:
    auto = (
        f'<a href="{prefix}cars.html">АВТО</a>'
        if site.get("auto_sales")
        else ""
    )
    return f"""<nav class="site-nav">
  <div class="logo"><a href="{prefix}index.html"><span class="logo-mark">{site['logo_mark']}</span><span class="logo-word">{site['logo_word']}</span></a></div>
  <div class="links"><a href="{prefix}services.html">УСЛУГИ</a>{auto}<a href="{prefix}gallery.html">РАБОТЫ</a><a href="{prefix}about.html">О НАС</a><a href="{prefix}contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:{site['phone_tel']}">{site['phone_display']}</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">
    <a href="{prefix}services.html">УСЛУГИ</a>
    {('<a href="' + prefix + 'cars.html">АВТО</a>') if site.get('auto_sales') else ''}
    <a href="{prefix}gallery.html">РАБОТЫ</a>
    <a href="{prefix}about.html">О НАС</a>
    <a href="{prefix}contact.html">КОНТАКТЫ</a>
  </div>
</nav>"""


def body_class(site: dict) -> str:
    return ""


def write_index(site: dict, dest: Path) -> None:
    t1, t2 = site["services_section_title"]
    tiles = []
    for title, _, _, slug in site["services"][:5]:
        tiles.append(
            f'    <a class="photo" href="services/{slug}.html" '
            f'style="background-image:url(\'img/hero.jpg\')"><span class="tag">{title.upper()}</span></a>'
        )
    gis = firm_url(site)
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{site['name']} — {site['name']}</title>
<link rel="stylesheet" href="styles.css?v={CSS_V}">
</head>
<body{body_class(site)}>
{nav_html(site)}

<section class="hero hero--sdc">
  <div class="heroimg" style="background-image:url('img/hero.jpg')"></div>
  <div class="hero-panel">
    <div class="hero-heading">
      <div class="eyebrow">{site['city'].upper()}</div>
      <h1>{site['logo_mark']}<br><span class="accent">{site['logo_word']}.</span></h1>
    </div>
    <div class="hero-content">
      <p>{site['hero_lead']}</p>
      <div class="actions">
        <a class="button" href="tel:{site['phone_tel']}">ЗАПИСАТЬСЯ</a>
        <a class="button dark" href="services.html">СМОТРЕТЬ УСЛУГИ</a>
      </div>
    </div>
  </div>
</section>

<div class="stats">
  <div class="stat"><b id="stat-rating">{site['rating']}</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span></div>
  <div class="stat"><b>{site['reviews_count']}</b><span>ОЦЕНОК · 2ГИС</span></div>
  <div class="stat"><b>{site['stat_extra_b']}</b><span>{site['stat_extra_s']}</span></div>
  <div class="stat"><b>2ГИС</b><span>ОТЗЫВЫ КЛИЕНТОВ</span></div>
</div>

<section class="section" id="services">
  <div class="section-head">
    <div><div class="kicker">01 / УСЛУГИ</div><h2>{t1}<br><span class="accent">{t2}</span></h2></div>
    <p class="intro">{site['services_intro']}</p>
  </div>
  <div class="photo-strip photo-strip--services photo-strip--home">
{chr(10).join(tiles)}
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
    <a class="photo" href="gallery.html" style="background-image:url('img/hero.jpg')"></a>
    <a class="photo" href="gallery.html" style="background-image:url('img/hero.jpg')"></a>
    <a class="photo" href="gallery.html" style="background-image:url('img/hero.jpg')"></a>
  </div>
  <p class="intro" style="margin-top:20px">Фото появятся в альбоме после загрузки в <code>img/works/incoming/{site['photo_folder']}/</code>.</p>
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
  <p class="intro" style="margin-top:24px"><a href="{gis}" target="_blank" rel="noopener noreferrer">Все отзывы в 2ГИС →</a></p>
</section>

<div class="site-bottom">
<section class="address-map" id="contacts">
  <div class="address-map-inner">
    <div class="address-map-grid">
      <div class="address-map-intro">
        <div class="address-map-kicker"><span class="address-map-line"></span><span class="kicker">04 / ЛОКАЦИЯ</span></div>
        <h2 class="address-map-title">ГДЕ МЫ<br><span>НАХОДИМСЯ.</span></h2>
        <p class="address-map-text">{site['address']}</p>
      </div>
      <div class="address-map-visual">
        <a href="{gis}" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="{map_img(site, '880x450')}" alt="">
          <img class="address-map-img address-map-img--mobile" src="{map_img(site, '720x720')}" alt="">
        </a>
      </div>
      <div class="address-map-details-wrap">
        <a href="{gis}" class="address-map-btn" target="_blank" rel="noopener noreferrer">Открыть в 2ГИС</a>
      </div>
    </div>
  </div>
</section>
</div>

<script src="contacts-config.js"></script>
<script src="nav.js"></script>
<script src="stats.js"></script>
<script src="ba-slider.js"></script>
<script src="reviews-carousel.js"></script>
<script src="messenger-picker.js"></script>
</body>
</html>
"""
    (dest / "index.html").write_text(html, encoding="utf-8")


def write_service_page(site: dict, dest: Path, title: str, desc: str, cost: str, slug: str) -> None:
    gis = firm_url(site)
    body = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{title} — {site['name']}</title>
<link rel="stylesheet" href="../styles.css?v={CSS_V}">
</head>
<body{body_class(site)}>
{nav_html(site, '../')}

<section class="subpage-hero subpage-hero--service">
  <div class="kicker">УСЛУГА</div>
  <h1>{title.upper()}</h1>
  <p>{desc}</p>
</section>

<section class="section">
  <p class="intro" style="max-width:720px">{desc} Стоимость: <strong>{cost}</strong>.</p>
  <div class="actions" style="margin-top:28px">
    <a class="button" href="tel:{site['phone_tel']}">ЗАПИСАТЬСЯ</a>
    <a class="button dark" href="../contact.html">КОНТАКТЫ</a>
  </div>
</section>

<div class="site-bottom">
<section class="address-map" id="contacts">
  <div class="address-map-inner">
    <div class="address-map-grid">
      <div class="address-map-intro">
        <h2 class="address-map-title">КОНТАКТЫ</h2>
        <p class="address-map-text">{site['address']}</p>
      </div>
      <div class="address-map-details-wrap">
        <a href="{gis}" class="address-map-btn" target="_blank" rel="noopener noreferrer">2ГИС</a>
      </div>
    </div>
  </div>
</section>
</div>
<script src="../nav.js"></script>
</body>
</html>
"""
    (dest / "services" / f"{slug}.html").write_text(body, encoding="utf-8")


def write_services_list(site: dict, dest: Path) -> None:
    rows = []
    for i, (title, desc, cost, slug) in enumerate(site["services"], 1):
        rows.append(
            f'    <a class="service-row" href="services/{slug}.html" id="svc-{i:02d}">'
            f'<div class="idx">{i:02d}</div>'
            f'<div><h3>{title}</h3><div class="service-desc"><p class="service-lead">{desc}</p></div></div>'
            f'<div class="cost">{cost}</div></a>'
        )
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Услуги — {site['name']}</title>
<link rel="stylesheet" href="styles.css?v={CSS_V}">
</head>
<body{body_class(site)}>
{nav_html(site)}

<section class="subpage-hero">
  <div class="kicker">01 / УСЛУГИ</div>
  <h1>УСЛУГИ<br><span class="accent">{site['city'].upper()}</span></h1>
  <p>{site['services_intro']}</p>
</section>

<section class="section">
  <div class="service-list">
{chr(10).join(rows)}
  </div>
</section>

<script src="nav.js"></script>
</body>
</html>
"""
    (dest / "services.html").write_text(html, encoding="utf-8")


def write_cars(site: dict, dest: Path) -> None:
    gis = firm_url(site)
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Авто в продаже — {site['name']}</title>
<link rel="stylesheet" href="styles.css?v={CSS_V}">
</head>
<body{body_class(site)}>
{nav_html(site)}

<section class="subpage-hero">
  <div class="kicker">АВТОМОБИЛИ</div>
  <h1>АВТО<br><span class="accent">В ПРОДАЖЕ.</span></h1>
  <p>Актуальный список — по телефону и в карточке 2ГИС. Фото автомобилей добавим в прототип позже.</p>
</section>

<section class="section">
  <div class="auto-sales-grid">
    <article class="auto-card">
      <div class="auto-card-photo" style="background-image:url('img/hero.jpg')"></div>
      <h3>Скоро в каталоге</h3>
      <p>Уточняйте наличие и комплектацию по телефону — менеджер пришлёт актуальные предложения.</p>
      <a class="button" href="tel:{site['phone_tel']}">УЗНАТЬ НАЛИЧИЕ</a>
    </article>
    <article class="auto-card auto-card--muted">
      <h3>2ГИС и звонок</h3>
      <p>В карточке компании часто публикуют объявления о продаже и спецпредложения сервиса.</p>
      <a class="button dark" href="{gis}" target="_blank" rel="noopener noreferrer">ОТКРЫТЬ 2ГИС</a>
    </article>
  </div>
</section>

<script src="nav.js"></script>
</body>
</html>
"""
    (dest / "cars.html").write_text(html, encoding="utf-8")


def _accent_vars(theme: str) -> dict[str, str] | None:
    if theme == "turquoise":
        return {
            "--accent": "#0fb5b2",
            "--accent-soft": "rgba(15,181,178,.42)",
            "--accent-hover": "#3cc9c6",
            "--accent-deep": "#0a8f8c",
            "--accent-ink": "#0a0a0a",
            "--accent-rgb": "15,181,178",
        }
    if theme == "prime38":
        return {
            "--accent": "#d4af37",
            "--accent-soft": "rgba(212,175,55,.35)",
            "--accent-hover": "#e8c85a",
            "--accent-deep": "#a88b28",
            "--accent-ink": "#0a0a0a",
            "--accent-rgb": "212,175,55",
        }
    return None


def apply_theme(dest: Path, site: dict) -> None:
    css = (dest / "styles.css").read_text(encoding="utf-8")
    vars_ = _accent_vars(site["theme"])
    if vars_:
        block = ":root{\n" + "\n".join(f"  {k}:{v};" for k, v in vars_.items()) + "\n}"
        css = re.sub(r":root\{[^}]+\}", block, css, count=1)
    css = re.sub(r"\n:root\{--accent:[^}]+\}\n", "\n", css)
    auto_css = """
.auto-sales-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:960px}
.auto-card{padding:24px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.03)}
.auto-card-photo{height:180px;border-radius:6px;background-size:cover;background-position:center;margin-bottom:16px;opacity:.85}
.auto-card--muted{display:flex;flex-direction:column;justify-content:center;gap:12px}
#works .photo:after{display:none}
"""
    if ".auto-sales-grid" not in css:
        css += auto_css
    (dest / "styles.css").write_text(css, encoding="utf-8")


def scaffold_one(site: dict) -> Path:
    dest = ROOT / site["slug"]
    if dest.exists():
        shutil.rmtree(dest)
    def _ignore(dirpath: str, names: list[str]) -> set[str]:
        ignored: set[str] = set()
        if dirpath.endswith("incoming") and "klyaksa" in names:
            ignored.add("klyaksa")
        for n in names:
            if n in {"__pycache__", "deploy-version.txt", ".deploy-ping.txt"}:
                ignored.add(n)
        return ignored

    shutil.copytree(TEMPLATE, dest, ignore=_ignore)

    inc = dest / "img" / "works" / "incoming" / site["photo_folder"]
    if inc.exists():
        shutil.rmtree(inc)
    inc.mkdir(parents=True)
    (inc / "README.txt").write_text(
        f"Фото для «{site['name']}» (jpg/png/webp).\n"
        f"2ГИС: {firm_url(site)}\n",
        encoding="utf-8",
    )

    svc_dir = dest / "services"
    if svc_dir.exists():
        shutil.rmtree(svc_dir)
    svc_dir.mkdir()

    for path in dest.rglob("*"):
        if path.suffix not in {".html", ".js", ".md", ".bat", ".py", ".json"}:
            continue
        if path.name == "server.py":
            continue
        text = path.read_text(encoding="utf-8")
        path.write_text(replace_site_text(text, site), encoding="utf-8")

    server = dest / "server.py"
    st = server.read_text(encoding="utf-8")
    st = re.sub(r"PORT = \d+", f"PORT = {site['port']}", st)
    st = re.sub(
        r'FIRM_URL = "https://2gis\.ru/[^"]+"',
        f'FIRM_URL = "{firm_url(site)}"',
        st,
    )
    server.write_text(st, encoding="utf-8")

    contacts = dest / "contacts-config.js"
    wa = site["phone_tel"].replace("+", "")
    contacts.write_text(
        f"""window.STUDIO_MESSENGERS = {{
  wa: "{wa}",
  tg: "{site['phone_tel']}",
  max: "",
  defaultMessage: "Здравствуйте! Хочу записаться в {site['name']}.",
}};
""",
        encoding="utf-8",
    )

    reviews = fetch_branch_reviews(site["firm_id"], limit=8)
    (dest / "data" / "reviews-2gis.json").write_text(
        json.dumps(reviews, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    write_index(site, dest)
    write_services_list(site, dest)
    for title, desc, cost, slug in site["services"]:
        if slug == "cars" and site.get("auto_sales"):
            continue
        write_service_page(site, dest, title, desc, cost, slug)
    if site.get("auto_sales"):
        write_cars(site, dest)

    about = dest / "about.html"
    if about.is_file():
        t = about.read_text(encoding="utf-8")
        t = re.sub(
            r"<p class=\"intro\"[^>]*>.*?</p>",
            f'<p class="intro" style="max-width:720px;font-size:16px;line-height:1.75">{site["about"]}</p>',
            t,
            count=1,
            flags=re.S,
        )
        about.write_text(t, encoding="utf-8")

    for name in ("gallery.html", "contact.html"):
        p = dest / name
        if p.is_file():
            p.write_text(replace_site_text(p.read_text(encoding="utf-8"), site), encoding="utf-8")

    apply_theme(dest, site)

    (dest / "README.md").write_text(
        f"# {site['name']}\n\n"
        f"Локально: `python server.py` → http://127.0.0.1:{site['port']}/\n\n"
        f"Фото: `img/works/incoming/{site['photo_folder']}/`\n\n"
        f"2ГИС: {firm_url(site)}\n",
        encoding="utf-8",
    )
    return dest


def main() -> None:
    lines = [
        "# Локальные прототипы (D2-шаблон)\n\n",
        "## Три студии (ранее)\n\n",
    ]
    old_doc = ROOT / "docs" / "LOCAL_THREE_STUDIOS.md"
    if old_doc.is_file():
        lines.append(old_doc.read_text(encoding="utf-8").split("## Три студии")[-1] if "##" in old_doc.read_text() else old_doc.read_text())
    lines.append("\n## Четыре новых прототипа\n\n")
    for site in SITES:
        dest = scaffold_one(site)
        extra = " · раздел **Авто** (`cars.html`)" if site.get("auto_sales") else ""
        lines.append(
            f"- **{site['name']}** — `{dest.name}/` — "
            f"http://127.0.0.1:{site['port']}/{extra}\n"
        )
        print("OK", dest.name, site["port"])
    out = ROOT / "docs" / "LOCAL_STUDIOS.md"
    out.write_text("".join(lines), encoding="utf-8")
    print("Wrote", out)


if __name__ == "__main__":
    main()
