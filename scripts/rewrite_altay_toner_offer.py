#!/usr/bin/env python3
"""Rewrite Altay Toner copy: glass / armor / sound, no detailing/wash offer."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(r"c:\Users\Никита\Work\Melissa-tech.ru\altay-toner")
CSS_V = "15"
TG = "https://t.me/+79130843999"
WA = "https://wa.me/79130843999"
PHONE_HREF = "tel:+79130843999"
PHONE_TXT = "+7 (913) 084-39-99"
GIS = "https://2gis.ru/novoaltajsk/firm/70000001078690287"

FOOTER_SOCIAL = (
    f'<div class="footer-social">'
    f'<a href="{WA}" target="_blank" rel="noopener noreferrer">WhatsApp</a>'
    f'<a href="{TG}" target="_blank" rel="noopener noreferrer">Telegram</a>'
    f'<a href="{GIS}" target="_blank" rel="noopener noreferrer">2ГИС</a>'
    f"</div>"
)

FOOTER_BOTTOM = (
    '    <span>© 2026 <span>АЛТАЙ</span> ТОНЕР</span>\n'
    "    <span>ТОНИРОВКА · БРОНЯ · НОВОАЛТАЙСК</span>"
)


def patch_common(html: str) -> str:
    html = re.sub(r"styles\.css\?v=\d+", f"styles.css?v={CSS_V}", html)
    html = re.sub(
        r'<div class="footer-social">.*?</div>',
        FOOTER_SOCIAL,
        html,
        flags=re.S,
    )
    html = re.sub(
        r'    <span>© 2026 <span>АЛТАЙ</span> ТОНЕР</span>\n    <span>[^<]*</span>',
        FOOTER_BOTTOM,
        html,
    )
    html = html.replace("ДЕТЕЙЛИНГ · НОВОАЛТАЙСК", "ТОНИРОВКА · БРОНЯ · НОВОАЛТАЙСК")
    return html


INDEX = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="site-build" content="altay-toner-2026-10-13-glass">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Алтай тонер — тонирование, бронирование стёкол и кузова, ремонт и замена автостёкол, шумоизоляция в Новоалтайске. ул. Анатолия, 55. +7 (913) 084-39-99.">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<title>Алтай тонер — тонирование и бронирование · Новоалтайск</title>
<link rel="stylesheet" href="styles.css?v={CSS_V}">
</head>
<body>
<nav class="site-nav">
  <div class="logo"><a href="./"><span>АЛТАЙ</span> ТОНЕР</a></div>
  <div class="links"><a href="services.html">УСЛУГИ</a><a href="gallery.html">РАБОТЫ</a><a href="about.html">О СТУДИИ</a><a href="contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="{PHONE_HREF}">{PHONE_TXT}</a>
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
</nav>

<section class="hero">
  <div class="heroimg"></div>
  <div class="hero-head">
    <div class="eyebrow">ТОНИРОВКА · БРОНЯ · НОВОАЛТАЙСК</div>
    <h1>АЛТАЙ<br><span class="accent">ТОНЕР</span></h1>
  </div>
  <div class="hero-lead">
    <p>Студия тонирования и бронирования в Новоалтайске: автостёкла, защита кузова и шумоизоляция. Упор на бронирование — работаем аккуратно и по записи.</p>
    <div class="actions"><a class="button" href="{PHONE_HREF}">ЗАПИСАТЬСЯ</a><a class="button dark" href="#services">СМОТРЕТЬ УСЛУГИ</a></div>
  </div>
</section>

<div class="stats">
  <div class="stat"><b>14</b><span>ЛЕТ РАБОТЫ</span></div>
  <div class="stat"><b>5000+</b><span>АВТОМОБИЛЕЙ</span></div>
  <div class="stat"><b id="stat-rating">5.0</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span></div>
  <div class="stat"><b>100%</b><span>ПО ЗАПИСИ</span></div>
</div>

<section class="section" id="services">
  <div class="section-head">
    <div><div class="kicker">01 / УСЛУГИ</div><h2>БРОНИРОВАНИЕ<br><span class="accent">В ПРИОРИТЕТЕ.</span></h2></div>
    <p class="intro">Тонирование, защита стёкол и кузова, ремонт и замена автостёкол, полировка фар, шумоизоляция. Сначала осмотр — затем работа в боксе.</p>
  </div>
  <div class="cards">
    <article class="card">
      <div class="card-media"><img src="img/ppf.png" alt="Бронирование автостёкол и кузова"></div>
      <div class="card-body"><div class="num">01</div><div><h3>Бронирование</h3><p>Бронирование автостёкол и кузова — основной акцент студии. Защита от сколов и ударов с аккуратной установкой.</p></div></div>
    </article>
    <article class="card">
      <div class="card-media"><img src="img/works/tint-suv.jpg" alt="Тонирование стёкол"></div>
      <div class="card-body"><div class="num">02</div><div><h3>Тонирование</h3><p>Тонирование стёкол: ровная установка, подбор светопропускания под задачу.</p></div></div>
    </article>
    <article class="card">
      <div class="card-media"><img src="img/polish.png" alt="Ремонт и замена автостёкол"></div>
      <div class="card-body"><div class="num">03</div><div><h3>Автостёкла</h3><p>Ремонт и замена автостёкол, в том числе работа с двойным стеклопакетом. Полировка фар.</p></div></div>
    </article>
  </div>
  <p class="intro" style="margin-top:28px;max-width:560px">Полный список направлений — на странице <a href="services.html" style="color:var(--accent);text-decoration:underline">Услуги</a>. Также делаем шумоизоляцию кузова.</p>
</section>

<section class="section" id="works">
  <div class="section-head">
    <div><div class="kicker">02 / РАБОТЫ</div><h2>РЕЗУЛЬТАТ,<br><span class="accent">КОТОРЫЙ ВИДНО.</span></h2></div>
    <p class="intro">Показываем то, что видно сразу: тонировку, защиту стёкол и кузова, чистоту линий.</p>
  </div>
  <div class="photo-strip">
    <div class="photo big" style="background-image:url('img/works/tint-suv.jpg?v=1')"><span class="tag">ТОНИРОВАНИЕ</span></div>
    <div class="photo" style="background-image:url('img/works/hero.jpg?v=8')"><span class="tag">БРОНИРОВАНИЕ</span></div>
    <div class="photo" style="background-image:url('img/works/altay-06.jpg')"><span class="tag">ПОЛИРОВКА ФАР</span></div>
  </div>
  <div class="quote">«Хорошая защита стёкол и кузова — это когда результат <span>виден сразу и держится в работе.</span>»</div>
</section>

<section class="process" id="process">
  <div class="kicker">03 / ПОДХОД</div>
  <h2>ТОЧНОСТЬ<br><span class="accent">В КАЖДОМ ДВИЖЕНИИ.</span></h2>
  <div class="steps">
    <div class="step"><b>01</b><h3>Осмотр</h3><p>Смотрим стёкла и кузов, фиксируем задачу и согласуем объём работ.</p></div>
    <div class="step"><b>02</b><h3>Подготовка</h3><p>Готовим поверхности и материалы под выбранную услугу.</p></div>
    <div class="step"><b>03</b><h3>Работа</h3><p>Тонируем, бронируем, ремонтируем или меняем стёкла, шумоизолируем — по согласованному плану.</p></div>
    <div class="step"><b>04</b><h3>Контроль</h3><p>Проверяем результат при студийном освещении перед выдачей.</p></div>
  </div>
</section>

<div class="site-bottom">
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
        <p class="address-map-text">Приезжайте в студию по записи. Адрес и маршрут — в 2ГИС.</p>
        <div class="address-map-divider" aria-hidden="true"></div>
      </div>
      <div class="address-map-visual">
        <a href="{GIS}" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="https://static.maps.2gis.com/1.0?s=880x450&amp;c=53.406193,83.939082&amp;z=18&amp;pt=53.406193,83.939082~k:p" alt="">
          <img class="address-map-img address-map-img--mobile" src="https://static.maps.2gis.com/1.0?s=720x720&amp;c=53.406193,83.939082&amp;z=18&amp;pt=53.406193,83.939082~k:p" alt="Карта 2ГИС — г. Новоалтайск, ул. Анатолия, 55, бокс 8">
          <div class="address-map-pin-label" aria-hidden="true">
            <span class="address-map-pin-label-text"><span>АЛТАЙ</span> ТОНЕР</span>
          </div>
        </a>
        <div class="address-map-decor"></div>
      </div>
      <div class="address-map-details-wrap">
        <div class="address-map-details">
          <div class="address-map-detail">
            <span class="address-map-detail-label">СТУДИЯ</span>
            <p class="address-map-brand"><span>АЛТАЙ</span> ТОНЕР</p>
            <p class="address-map-muted">г. Новоалтайск, ул. Анатолия, 55, бокс 8</p>
            <p class="address-map-muted-sm">с 10:00 · по записи</p>
          </div>
          <div class="address-map-detail">
            <span class="address-map-detail-label">СВЯЗЬ</span>
            <a href="{PHONE_HREF}" class="address-map-phone">{PHONE_TXT}</a>
            <p class="address-map-muted-sm" style="margin-top:10px"><a href="{TG}" target="_blank" rel="noopener noreferrer">Telegram</a> · <a href="{WA}" target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
          </div>
        </div>
        <a href="{GIS}" class="address-map-btn" target="_blank" rel="noopener noreferrer">Как добраться</a>
      </div>
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="footer-grid footer-desktop-only">
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-brand-block">
        <div class="footer-logo"><span>АЛТАЙ</span> ТОНЕР</div>
        {FOOTER_SOCIAL}
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>Пн–Пт · 10:00 – 20:00</span><span>уточняйте по телефону</span>
      </div>
    </div>
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="./">Главная</a>
      <a href="services.html">Услуги</a>
      <a href="gallery.html">Работы</a>
      <a href="about.html">О студии</a>
      <a href="contact.html">Контакты</a>
    </div>
    <div class="footer-col">
      <b>КОНТАКТЫ</b>
      <a class="footer-phone-inline" href="{PHONE_HREF}">{PHONE_TXT}</a>
      </div>
  </div>
  <div class="footer-grid footer-mobile-only">
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="./">Главная</a>
      <a href="services.html">Услуги</a>
      <a href="gallery.html">Работы</a>
      <a href="about.html">О студии</a>
      <a href="contact.html">Контакты</a>
    </div>
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-phones-block">
        <b>КОНТАКТЫ</b>
        <a class="footer-phone-inline" href="{PHONE_HREF}">{PHONE_TXT}</a>
        </div>
      <div class="footer-brand-divider" aria-hidden="true"></div>
      <div class="footer-brand-block">
        <div class="footer-logo"><span>АЛТАЙ</span> ТОНЕР</div>
        {FOOTER_SOCIAL}
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>Пн–Пт · 10:00 – 20:00</span><span>уточняйте по телефону</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
{FOOTER_BOTTOM}
  </div>
</footer>
</div>
<script src="nav.js"></script>
<script src="stats.js"></script>
</body>
</html>
"""

SERVICES_ROWS = """
    <div class="service-row"><div class="idx">01</div><div><h3>Бронирование автостёкол</h3><p>Защитная плёнка на стёкла — приоритетное направление студии.</p></div><div class="meta">стёкла<br>по осмотру</div><div class="cost">по расчёту</div></div>
    <div class="service-row"><div class="idx">02</div><div><h3>Бронирование кузова</h3><p>Защита кузова плёнкой в зонах риска и по согласованному объёму.</p></div><div class="meta">кузов<br>по осмотру</div><div class="cost">по расчёту</div></div>
    <div class="service-row"><div class="idx">03</div><div><h3>Тонирование</h3><p>Тонирование стёкол с подбором светопропускания и аккуратной установкой.</p></div><div class="meta">стёкла<br>по осмотру</div><div class="cost">по расчёту</div></div>
    <div class="service-row"><div class="idx">04</div><div><h3>Ремонт автостёкол</h3><p>Ремонт сколов и повреждений на автостёклах.</p></div><div class="meta">стёкла<br>по осмотру</div><div class="cost">по расчёту</div></div>
    <div class="service-row"><div class="idx">05</div><div><h3>Ремонт двойного стеклопакета</h3><p>Ремонт автостёкол в конструкциях с двойным стеклопакетом.</p></div><div class="meta">стеклопакет<br>по осмотру</div><div class="cost">по расчёту</div></div>
    <div class="service-row"><div class="idx">06</div><div><h3>Замена автостёкол</h3><p>Замена автостёкол всех типов — подбираем стекло и выполняем установку.</p></div><div class="meta">все типы<br>по осмотру</div><div class="cost">по расчёту</div></div>
    <div class="service-row"><div class="idx">07</div><div><h3>Полировка фар</h3><p>Восстановление прозрачности и внешнего вида оптики.</p></div><div class="meta">оптика<br>по осмотру</div><div class="cost">по расчёту</div></div>
    <div class="service-row"><div class="idx">08</div><div><h3>Шумоизоляция кузова</h3><p>Шумоизоляция кузова для снижения шума в салоне.</p></div><div class="meta">кузов<br>по осмотру</div><div class="cost">по расчёту</div></div>
"""


def rewrite_services(html: str) -> str:
    html = re.sub(r"<title>[^<]*</title>", "<title>Услуги — Алтай тонер</title>", html)
    html = re.sub(
        r'<section class="subpage-hero">.*?</section>',
        f"""<section class="subpage-hero">
  <div class="kicker">01 / УСЛУГИ</div>
  <h1>БРОНИРОВАНИЕ,<br>ТОНИРОВАНИЕ,<br><span class="accent">АВТОСТЁКЛА.</span></h1>
  <p>Основные направления студии. Стоимость — после осмотра. Упор на бронирование стёкол и кузова.</p>
</section>""",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'<div class="service-list">.*?</div>\s*</section>',
        f'<div class="service-list">{SERVICES_ROWS}</div>\n</section>',
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'<div class="step"><b>01</b><h3>Осмотр</h3><p>[^<]*</p></div>',
        '<div class="step"><b>01</b><h3>Осмотр</h3><p>Смотрим стёкла и кузов, фиксируем задачу и согласуем объём.</p></div>',
        html,
    )
    html = re.sub(
        r'<div class="step"><b>02</b><h3>Подготовка</h3><p>[^<]*</p></div>',
        '<div class="step"><b>02</b><h3>Подготовка</h3><p>Готовим поверхности и материалы под выбранную услугу.</p></div>',
        html,
    )
    html = re.sub(
        r'<div class="step"><b>03</b><h3>Работа</h3><p>[^<]*</p></div>',
        '<div class="step"><b>03</b><h3>Работа</h3><p>Тонируем, бронируем, ремонтируем или меняем стёкла, шумоизолируем.</p></div>',
        html,
    )
    return patch_common(html)


def rewrite_about(html: str) -> str:
    html = re.sub(
        r'<section class="subpage-hero">.*?</section>',
        f"""<section class="subpage-hero">
  <div class="kicker">03 / О СТУДИИ</div>
  <h1>СТУДИЯ В<br><span class="accent">НОВОАЛТАЙСКЕ.</span></h1>
  <p>Тонирование, бронирование стёкол и кузова, ремонт и замена автостёкол, шумоизоляция. Работаем в боксе на ул. Анатолия, 55 — по записи.</p>
</section>""",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'<div class="stats">.*?</div>\s*<section class="section">',
        f"""<div class="stats">
  <div class="stat"><b>14</b><span>ЛЕТ РАБОТЫ</span></div>
  <div class="stat"><b>5000+</b><span>АВТОМОБИЛЕЙ</span></div>
  <div class="stat"><b>5.0</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span></div>
  <div class="stat"><b>100%</b><span>ПО ЗАПИСИ</span></div>
</div>

<section class="section">""",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'<p class="intro">Мы не гонимся.*?</p>',
        '<p class="intro">14 лет работы и тысячи автомобилей. Не обещаем «всё подряд»: фокус на тонировании, бронировании, автостёклах и шумоизоляции — с контролем результата перед выдачей.</p>',
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'<div class="faq">.*?</div>\s*</section>',
        f"""<div class="faq">
    <details open><summary>Как узнать точную стоимость?</summary><p>Позвоните, напишите в WhatsApp или Telegram — пришлите фото. Можно приехать на осмотр: после оценки назовём стоимость.</p></details>
    <details><summary>Сколько времени занимает работа?</summary><p>Зависит от услуги: тонирование и бронирование стёкол часто в день обращения, замена стекла и шумоизоляция — по объёму. Сроки согласуем на осмотре.</p></details>
    <details><summary>Можно ли оставить автомобиль на ночь?</summary><p>Да, для длительных работ автомобиль остаётся в закрытом боксе.</p></details>
    <details><summary>Чем вы занимаетесь?</summary><p>Тонирование, бронирование автостёкол и кузова, ремонт и замена автостёкол (включая двойной стеклопакет), полировка фар, шумоизоляция кузова.</p></details>
  </div>
</section>""",
        html,
        count=1,
        flags=re.S,
    )
    return patch_common(html)


def rewrite_gallery(html: str) -> str:
    html = re.sub(
        r'<section class="section work-block" id="work-02">.*?</section>',
        f"""<section class="section work-block" id="work-02">
  <div class="section-head">
    <div><div class="kicker">02</div><h2>Бронирование и кузов</h2>
      <div class="service-desc">
        <p class="service-lead">Защита стёкол и кузова, работа в закрытом боксе.</p>
        <p>Свет в студии позволяет контролировать результат на каждом этапе — от подготовки до выдачи автомобиля.</p>
      </div>
    </div>
  </div>
  <div class="gallery gallery--portfolio">
    <a class="g g--media" href="img/works/altay-extra-01.jpg" data-lightbox="work-02"><img src="img/works/altay-extra-01.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/work-01.jpg" data-lightbox="work-02"><img src="img/works/work-01.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/altay-05.jpg" data-lightbox="work-02"><img src="img/works/altay-05.jpg" alt="" loading="lazy" decoding="async"></a>
  </div>
</section>""",
        html,
        count=1,
        flags=re.S,
    )
    html = html.replace(
        "Разные классы и задачи — от тонировки до комплексного ухода.",
        "Разные классы и задачи — тонирование, бронирование, стёкла.",
    )
    html = html.replace("<h2>Тонировка LLumar</h2>", "<h2>Тонирование</h2>")
    return patch_common(html)


def rewrite_contact(html: str) -> str:
    html = html.replace(
        "Телефон, WhatsApp и адрес студии в Новоалтайске. Работаем по записи — связывайтесь напрямую.",
        "Телефон, WhatsApp, Telegram и адрес студии в Новоалтайске. Работаем по записи.",
    )
    html = html.replace(
        f'<p><a href="{WA}" target="_blank" rel="noopener noreferrer">WhatsApp →</a></p>',
        f'<p><a href="{WA}" target="_blank" rel="noopener noreferrer">WhatsApp →</a></p>\n'
        f'        <p><a href="{TG}" target="_blank" rel="noopener noreferrer">Telegram →</a></p>',
    )
    return patch_common(html)


def main() -> None:
    (ROOT / "index.html").write_text(INDEX, encoding="utf-8")

    for name, fn in [
        ("services.html", rewrite_services),
        ("about.html", rewrite_about),
        ("gallery.html", rewrite_gallery),
        ("contact.html", rewrite_contact),
    ]:
        path = ROOT / name
        path.write_text(fn(path.read_text(encoding="utf-8")), encoding="utf-8")
        print("updated", name)

    # deploy trigger
    (ROOT / "deploy-version.txt").write_text(
        "site=altay-toner\n"
        "prod=https://melissa-tech.ru/altay-toner/\n"
        "deploy=git-push-timeweb-hook\n"
        "deploy-trigger=altay-toner-glass-armor-v15\n",
        encoding="utf-8",
    )

    # audit forbidden words
    bad = []
    for path in ROOT.glob("*.html"):
        t = path.read_text(encoding="utf-8").lower()
        for w in ["детейлинг", "детальная мойка", "не просто\nмойка", "мойка,"]:
            if w in t:
                # allow none
                bad.append((path.name, w))
        if "мойк" in t:
            # find contexts
            for m in re.finditer(r".{0,40}мойк.{0,40}", t):
                bad.append((path.name, m.group(0)))
        if "детейл" in t:
            for m in re.finditer(r".{0,40}детейл.{0,40}", t):
                bad.append((path.name, m.group(0)))
    print("audit hits", bad)
    print("done")


if __name__ == "__main__":
    main()
