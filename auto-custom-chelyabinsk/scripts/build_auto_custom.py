#!/usr/bin/env python3
"""Rebrand D2 copy → Auto Custom (Челябинск)."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_LOGO = Path(
    "/home/ubuntu/.cursor/projects/workspace/assets/4e9474d8-f9db-4cb2-8610-66ce66805a4a.png"
)

PHONE_DISPLAY = "+7 (900) 062-32-77"
PHONE_TEL = "tel:+79000623277"
PHONE_RAW = "79000623277"
EMAIL = "auto.custom174@gmail.com"
FIRM_ID = "70000001034460339"
FIRM_URL = f"https://2gis.ru/chelyabinsk/firm/{FIRM_ID}"
LAT, LON = 55.184049, 61.263874
MAP_Q = f"c={LAT},{LON}&z=17&pt={LAT},{LON}~k:p"
ADDRESS_LINE = "Градский Прииск пос., Курчатовский район, Челябинск"
CITY = "Челябинск"
BUILD_TAG = "auto-custom-chelyabinsk-2026-11-12"

OLD_MAP = "55.184049,61.263874"
NEW_MAP = f"{LAT},{LON}"

SERVICES = [
    ("wrap", "01", "Оклейка плёнкой", "Защитная и цветная плёнка на кузов и отдельные элементы.", "от 8 000 ₽"),
    ("risk", "02", "Зоны риска", "Антигравийная плёнка на капот, бампер, зеркала и пороги.", "от 75 000 ₽"),
    ("armor", "03", "Бронирование", "Бронирование лобового и боковых стёкол.", "после осмотра"),
    ("polish", "04", "Полировка", "Восстановление блеска и цвета лакокрасочного покрытия.", "от 26 000 ₽"),
    ("ceramic", "05", "Керамика", "Защитное керамическое покрытие после подготовки кузова.", "от 18 000 ₽"),
    ("antichrome", "06", "Антихром", "Декоративное матирование или оклейка хромированных деталей.", "от 12 000 ₽"),
    ("sound", "07", "Шумка", "Шумо- и виброизоляция салона и дверей.", "после осмотра"),
    ("wash", "08", "Детейлинг мойка", "Комплексная бережная мойка кузова и салона.", "от 3 000 ₽"),
]

SERVICE_LINKS_HTML = (
    '<div class="service-page-links">'
    + "".join(f'<a href="{slug}.html">{title}</a>' for slug, _n, title, _l, _c in SERVICES)
    + "</div>"
)

WRAP_BAND = """<section class="wrap-band" id="wrap">
  <div class="section-head">
    <div>
      <div class="kicker">КОНФИГУРАТОР</div>
      <h2>СОБЕРИТЕ<br><span class="accent">ОКЛЕЙКУ.</span></h2>
    </div>
    <p class="intro">Выберите автомобиль, детали и финиш. Цифра на карточке — ориентир, точный расчёт даст студия.</p>
  </div>
  <div id="wrap-cfg">
    <section class="wrap-viewer">
      <div id="canvas" class="canvas"></div>
      <div class="wrap-hero">
        <h3>Оклейка <span>плёнкой</span></h3>
      </div>
      <div class="wrap-badge"><b id="status">Загрузка модели</b></div>
      <div class="wrap-view-actions">
        <button id="rotate" class="tool active" type="button">↻ Автовращение</button>
        <button id="reset" class="tool" type="button">⟲ Сброс</button>
      </div>
      <div id="marker" class="marker" style="display:none"></div>
    </section>
    <aside class="sidebar">
      <h2 class="side-title">Оклейка</h2>
      <div class="wrap-block">
        <div class="label">Автомобиль</div>
        <div class="tools" style="grid-template-columns:repeat(2,1fr)">
          <button class="tool active" data-model="mercedes" type="button">Седан</button>
          <button class="tool" data-model="mazda" type="button">Кроссовер</button>
        </div>
      </div>
      <div class="wrap-block">
        <div class="label">Готовые варианты</div>
        <div class="presets">
          <button class="preset active" data-preset="0" type="button"><i class="stock"></i><span>Сток<small>Заводской цвет</small></span></button>
          <button class="preset" data-preset="1" type="button"><i style="background:#0b0d10"></i><span>Obsidian Black<small>сатин · Перламутр</small></span></button>
          <button class="preset" data-preset="2" type="button"><i style="background:#63351f"></i><span>Cocoa Brown<small>Глянец · Металлик</small></span></button>
          <button class="preset" data-preset="3" type="button"><i style="background:#f5f5f2"></i><span>Pearl White<small>Глянец · Металлик</small></span></button>
        </div>
      </div>
      <div class="wrap-block" hidden>
        <div class="label">Зоны кузова</div>
        <div class="zones" id="zones"></div>
      </div>
      <div class="wrap-block">
        <div class="label">Выбранная деталь</div>
        <div id="selectedInfo" class="selectedInfo">Нажмите на деталь автомобиля</div>
      </div>
      <div class="wrap-block">
        <div class="label">Инструмент</div>
        <div class="tools" style="grid-template-columns:repeat(3,1fr)">
          <button class="tool active" data-tool="select" type="button">Выбор</button>
          <button class="tool" data-tool="fill" type="button">Заливка</button>
          <button class="tool" data-tool="remove" type="button">Отмена</button>
        </div>
      </div>
      <div class="wrap-block">
        <div class="label">Цвет плёнки</div>
        <div id="swatches" class="swatches"></div>
      </div>
      <div class="wrap-block">
        <div class="label">Финиш</div>
        <div class="finish">
          <button class="active" data-finish="gloss" type="button">Глянец</button>
          <button data-finish="satin" type="button">сатин</button>
          <button data-finish="matte" type="button">Матовый</button>
        </div>
      </div>
      <div class="wrap-block">
        <div class="label">Материал / эффект</div>
        <div class="finish">
          <button class="active" data-effect="solid" type="button">Однотон</button>
          <button data-effect="metal" type="button">Металлик</button>
          <button data-effect="pearl" type="button">Перламутр</button>
        </div>
      </div>
      <div class="wrap-block" hidden>
        <div class="label">Детали</div>
        <div id="parts" class="parts"></div>
      </div>
    </aside>
    <div class="summary">
      <div class="summary-row">
        <div>
          <div class="sumlabel">Ваш подбор</div>
          <div id="total" class="total">0 ₽</div>
        </div>
        <a class="cta" id="quote" href="TEL_REPLACE">ПОЛУЧИТЬ РАСЧЁТ</a>
      </div>
    </div>
  </div>
</section>""".replace("TEL_REPLACE", PHONE_TEL)


def logo_html() -> str:
    return '<span class="logo-mark">Auto</span><span class="logo-word">Custom</span>'


def rebrand_text(text: str) -> str:
    text = text.replace(OLD_MAP, NEW_MAP)
    text = text.replace("55.184049,61.263874", NEW_MAP)
    text = re.sub(
        r"2gis\.ru/novosibirsk/firm/70000001034460339",
        f"2gis.ru/chelyabinsk/firm/{FIRM_ID}",
        text,
    )
    text = text.replace("70000001034460339", FIRM_ID)
    text = text.replace("79000623277", PHONE_RAW)
    text = text.replace("79000623277", PHONE_RAW)
    text = text.replace("tel:79000623277", PHONE_TEL)
    text = text.replace("+7 (900) 062-32-77", PHONE_DISPLAY)
    text = text.replace("Градский Прииск пос., Курчатовский район, Челябинск", ADDRESS_LINE)
    text = text.replace("Градский Прииск пос., Курчатовский район, Челябинск", ADDRESS_LINE)
    text = text.replace("ЧЕЛЯБИНСК", CITY.upper())
    text = text.replace("Челябинск", CITY)
    text = re.sub(
        r'<span class="logo-mark">Auto</span><span class="logo-word">Custom</span>',
        logo_html(),
        text,
    )
    text = text.replace("Auto Custom", "Auto Custom")
    text = text.replace("Auto Custom", "Auto Custom")
    text = text.replace("Auto Custom", "Auto Custom")
    text = text.replace("© 2026 Auto Custom", "© 2026 Auto Custom")
    text = text.replace("ДЕТЕЙЛИНГ · ЧЕЛЯБИНСК", f"ДЕТЕЙЛИНГ · {CITY.upper()}")
    text = re.sub(r'href="https://wa\.me/\d+"', f'href="https://wa.me/{PHONE_RAW}"', text)
    text = re.sub(
        r'href="https://t\.me/[^"]+"',
        f'href="mailto:{EMAIL}"',
        text,
    )
    text = text.replace(">Почта<", ">Почта<")
    text = re.sub(r'href="https://web\.max\.ru/[^"]+"', f'href="mailto:{EMAIL}"', text)
    text = text.replace(">Email<", ">Email<")
    return text


def patch_all_files() -> None:
    for path in list(ROOT.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix not in {".html", ".js", ".py", ".css", ".txt", ".json", ".md"}:
            continue
        if "vendor/three" in str(path):
            continue
        raw = path.read_text(encoding="utf-8", errors="replace")
        if "D2" not in raw and "79000623277" not in raw and "novosibirsk" not in raw:
            continue
        path.write_text(rebrand_text(raw), encoding="utf-8")


def patch_styles() -> None:
    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    css = re.sub(
        r"--accent:#[0-9a-fA-F]+;",
        "--accent:#d4a82b;",
        css,
        count=1,
    )
    css = re.sub(
        r"--accent-soft:[^;]+;",
        "--accent-soft:rgba(212,168,43,.38);",
        css,
        count=1,
    )
    css = re.sub(
        r"--accent-hover:[^;]+;",
        "--accent-hover:#e8bb3a;",
        css,
        count=1,
    )
    css = re.sub(
        r"--accent-deep:[^;]+;",
        "--accent-deep:#a8841f;",
        css,
        count=1,
    )
    css = re.sub(
        r"--accent-rgb:[^;]+;",
        "--accent-rgb:212,168,43;",
        css,
        count=1,
    )
    if ".logo-mark{color:var(--accent)" in css:
        css = css.replace(
            ".logo-mark{color:var(--accent)",
            ".logo-mark{color:#c8c8c8",
            1,
        )
    if ".site-nav .logo .logo-mark{color:var(--accent)}" in css:
        css = css.replace(
            ".site-nav .logo .logo-mark{color:var(--accent)}",
            ".site-nav .logo .logo-mark{color:#c8c8c8}",
        )
    hero_css = """
.hero-logo-text{display:flex;flex-wrap:wrap;align-items:baseline;gap:.12em;font-size:clamp(2.4rem,7vw,4.6rem);line-height:1;font-weight:900;letter-spacing:-.03em}
.hero-logo-auto{color:#c8c8c8}
.hero-logo-custom{color:var(--accent)}
.hero-brand-word{display:none}
"""
    if ".hero-logo-text" not in css:
        css += hero_css
    css = css.replace(
        "background:url('img/works/hero-raptor.jpg?v=raptor')",
        "background:url('img/works/services/color-change/02.jpg')",
    )
    (ROOT / "styles.css").write_text(css, encoding="utf-8")


def patch_server() -> None:
    sp = ROOT / "server.py"
    text = sp.read_text(encoding="utf-8")
    text = re.sub(r"PORT = \d+", "PORT = 8114", text)
    text = re.sub(
        r'FIRM_URL = "[^"]+"',
        f'FIRM_URL = "{FIRM_URL}"',
        text,
    )
    text = text.replace("D2DetailingSite", "AutoCustomSite")
    sp.write_text(text, encoding="utf-8")


def replace_service_links(text: str) -> str:
    return re.sub(
        r'<div class="service-page-links">.*?</div>',
        SERVICE_LINKS_HTML,
        text,
        flags=re.DOTALL,
    )


def strip_wrap_configurator(html: str) -> str:
    html = re.sub(
        r'<section class="wrap-band" id="wrap">.*?</section>',
        f"""<section class="section service-page service-page--price" id="wrap-config">
  <div class="section-head">
    <div><div class="kicker">КОНФИГУРАТОР</div><h2>СОБЕРИТЕ<br><span class="accent">ОКЛЕЙКУ</span></h2></div>
    <p class="intro">3D-подбор оклейки — на главной странице: соберите вариант и позвоните для точного расчёта.</p>
  </div>
  <div class="actions service-page-actions"><a class="button" href="../index.html#wrap">ОТКРЫТЬ КОНФИГУРАТОР</a><a class="button dark" href="{PHONE_TEL}">ЗАПИСАТЬСЯ</a></div>
</section>""",
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = re.sub(
        r'<script type="importmap">.*?</script>\s*<script src="../nav\.js[^"]*"></script>\s*<script type="module" src="../wrap-boot\.js[^"]*"></script>',
        '<script src="../nav.js?v=book16"></script>',
        html,
        flags=re.DOTALL,
    )
    html = re.sub(r'<link rel="stylesheet" href="../wrap-configurator\.css[^"]*">\s*', "", html)
    return html


def patch_index() -> None:
    path = ROOT / "index.html"
    html = path.read_text(encoding="utf-8")
    html = re.sub(
        r"<title>[^<]+</title>",
        "<title>Auto Custom — детейлинг, Челябинск</title>",
        html,
        count=1,
    )
    if 'wrap-configurator.css' not in html:
        html = html.replace(
            '<link rel="stylesheet" href="styles.css?v=78">',
            '<link rel="stylesheet" href="styles.css?v=78">\n<link rel="stylesheet" href="wrap-configurator.css?v=prices8">',
        )
    hero_block = """<section class="hero">
  <div class="heroimg"></div>
  <div class="hero-stack">
    <h1 class="hero-brand">
      <span class="visually-hidden">Auto Custom</span>
      <span class="hero-logo-text" aria-hidden="true"><span class="hero-logo-auto">Auto</span><span class="hero-logo-custom">Custom</span></span>
    </h1>
    <div class="hero-content">
      <p>Auto Custom в Челябинске: оклейка плёнкой, PPF, керамика, полировка и детейлинг. На главной — 3D-конфигуратор оклейки: соберите вариант и получите ориентир по стоимости.</p>
      <div class="actions"><a class="button" href="{tel}">ЗАПИСАТЬСЯ</a><a class="button dark" href="#wrap">СОБРАТЬ ОКЛЕЙКУ</a></div>
    </div>
    <div class="stats stats--hero">
      <div class="stat"><b>5.0</b><span>РЕЙТИНГ · 2ГИС</span></div>
      <div class="stat"><b id="stat-ratings-count">262</b><span>ОЦЕНКИ · 2ГИС</span></div>
      <div class="stat"><b id="stat-rating">5.0</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span></div>
      <div class="stat"><b id="stat-reviews-count">230</b><span>ОТЗЫВОВ</span></div>
    </div>
  </div>
</section>""".format(tel=PHONE_TEL)
    html = re.sub(r"<section class=\"hero\">.*?</section>", hero_block, html, count=1, flags=re.DOTALL)
    html = re.sub(
        r'<section class="section tesla-band" id="transfer">.*?</section>\s*',
        "",
        html,
        count=1,
        flags=re.DOTALL,
    )
    if 'id="wrap"' not in html or "wrap-band" not in html:
        html = html.replace(
            '<section class="section" id="services">',
            WRAP_BAND + '\n\n<section class="section" id="services">',
            1,
        )
    photos = """  <div class="photo-strip photo-strip--services photo-strip--home">
    <a class="photo" href="services/wrap.html" style="background-image:url('img/works/d2/d2-08.jpg')"><span class="tag">ОКЛЕЙКА</span></a>
    <a class="photo" href="services/risk.html" style="background-image:url('img/works/d2/d2-02.jpg')"><span class="tag tag-split"><span>ЗОНЫ</span><span>РИСКА</span></span></a>
    <a class="photo" href="services/armor.html" style="background-image:url('img/works/services/windshield-thermal/01.jpg')"><span class="tag">БРОНИРОВАНИЕ</span></a>
    <a class="photo photo-pos-polish" href="services/polish.html" style="background-image:url('img/works/d2/d2-09.jpg')"><span class="tag">ПОЛИРОВКА</span></a>
    <a class="photo" href="services/ceramic.html" style="background-image:url('img/works/d2/d2-18.jpg')"><span class="tag">КЕРАМИКА</span></a>
    <a class="photo" href="services/antichrome.html" style="background-image:url('img/works/services/color-change/01.jpg')"><span class="tag">АНТИХРОМ</span></a>
    <a class="photo" href="services/sound.html" style="background-image:url('img/works/d2/d2-11.jpg')"><span class="tag">ШУМКА</span></a>
    <a class="photo" href="services/wash.html" style="background-image:url('img/works/d2/d2-07.jpg')"><span class="tag tag-split"><span>DETAILING</span><span>МОЙКА</span></span></a>
  </div>"""
    html = re.sub(
        r'  <div class="photo-strip photo-strip--services photo-strip--home">.*?</div>',
        photos,
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = re.sub(
        r"<div class=\"kicker\">03 / ПРОЦЕСС</div>\s*<h2>КАК МЫ<br><span class=\"accent\">РАБОТАЕМ\.</span></h2>\s*<div class=\"steps\">.*?</div>",
        """<div class="kicker">03 / ПРОЦЕСС</div>
  <h2>КАК МЫ<br><span class="accent">РАБОТАЕМ.</span></h2>
  <div class="steps">
    <div class="step"><b>01</b><h3>Заявка</h3><p>Звоните или пишите в WhatsApp — обсудим задачу и запишем на осмотр.</p></div>
    <div class="step"><b>02</b><h3>Осмотр</h3><p>Оцениваем состояние кузова и согласуем объём: оклейка, полировка, керамика или мойка.</p></div>
    <div class="step"><b>03</b><h3>Работа</h3><p>Выполняем услугу по согласованному плану в студии на Градском Прииске.</p></div>
    <div class="step"><b>04</b><h3>Выдача</h3><p>Показываем результат, даём рекомендации по уходу и передаём автомобиль.</p></div>
  </div>""",
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = html.replace(
        '<p class="intro">Мойка, оклейка, полировка, химчистка, шумоизоляция, покраска и кузовные работы. Трансфер на Tesla — пока автомобиль в студии.</p>',
        '<p class="intro">Оклейка, зоны риска, бронирование, полировка, керамика, антихром, шумка и детейлинг-мойка — в одной студии Auto Custom.</p>',
    )
    html = html.replace(
        "<h2>ДЕТЕЙЛИНГ<br><span class=\"accent\">И КУЗОВ.</span></h2>",
        "<h2>УСЛУГИ<br><span class=\"accent\">СТУДИИ.</span></h2>",
    )
    if "wrap-boot.js" not in html:
        html = html.replace(
            "</body>",
            '<script type="importmap">{"imports":{"three":"vendor/three/build/three.module.js","three/addons/":"vendor/three/examples/jsm/"}}</script>\n'
            '<script type="module" src="wrap-boot.js?v=prices8"></script>\n</body>',
        )
    path.write_text(rebrand_text(html), encoding="utf-8")


def patch_services_index() -> None:
    path = ROOT / "services.html"
    rows = []
    for slug, num, title, lead, cost in SERVICES:
        href = f"services/{slug}.html"
        cfg = (
            ' <p class="service-extra">Конфигуратор 3D — на <a href="index.html#wrap">главной</a>.</p>'
            if slug == "wrap"
            else ""
        )
        rows.append(
            f'    <a class="service-row" href="{href}" id="{slug}"><div class="idx">{num}</div>'
            f"<div><h3>{title}</h3><div class=\"service-desc\"><p class=\"service-lead\">{lead}</p>{cfg}</div></div>"
            f'<div class="cost">{cost}</div></a>'
        )
    list_html = "\n".join(rows)
    html = path.read_text(encoding="utf-8")
    html = re.sub(r"<title>[^<]+</title>", "<title>Услуги — Auto Custom</title>", html)
    html = re.sub(
        r'<section class="subpage-hero">.*?</section>',
        f"""<section class="subpage-hero">
  <div class="kicker">01 / УСЛУГИ</div>
  <h1>AUTO CUSTOM<br><span class="accent">ЧЕЛЯБИНСК</span></h1>
  <p>Оклейка, защита кузова и детейлинг. Финальная стоимость — после осмотра. 3D-конфигуратор оклейки на главной странице.</p>
</section>""",
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = re.sub(
        r'  <div class="service-list">.*?</div>\n</section>',
        f'  <div class="service-list">\n{list_html}\n  </div>\n</section>',
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = replace_service_links(html)
    path.write_text(rebrand_text(html), encoding="utf-8")


def simple_service_page(
    slug: str,
    num: str,
    title: str,
    h1: str,
    lead: str,
    stages: list[tuple[str, str]],
    price_html: str,
) -> str:
    timeline = ['<div class="service-timeline"><div class="service-timeline-line" aria-hidden="true"></div>']
    for i, (h, p) in enumerate(stages, 1):
        side = "left" if i % 2 == 1 else "right"
        timeline.append(
            f'<div class="service-timeline-item service-timeline-item--{side}">'
            f'<div class="service-timeline-content"><h3>{h}</h3>'
            + (f"<p>{p}</p>" if p else "")
            + f'</div><span class="service-timeline-dot" aria-hidden="true">{i}</span></div>'
        )
    timeline.append("</div>")
    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="site-build" content="{BUILD_TAG}">
<title>{title} — Auto Custom</title>
<link rel="stylesheet" href="../styles.css?v=78">
</head>
<body>
<nav class="site-nav">
  <div class="logo"><a href="../index.html">{logo_html()}</a></div>
  <div class="links"><a href="../services.html">УСЛУГИ</a><a href="../gallery.html">РАБОТЫ</a><a href="../about.html">О НАС</a><a href="../contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="{PHONE_TEL}">{PHONE_DISPLAY}</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">
    <a href="../services.html">УСЛУГИ</a>
    <a href="../gallery.html">РАБОТЫ</a>
    <a href="../about.html">О НАС</a>
    <a href="../contact.html">КОНТАКТЫ</a>
  </div>
</nav>

<section class="subpage-hero">
  <div class="kicker">{num} / УСЛУГА</div>
  <h1>{h1}</h1>
  <p>{lead}</p>
  <div class="actions" style="margin-top:28px">
    <a class="button" href="{PHONE_TEL}">ОНЛАЙН ЗАПИСЬ</a>
  </div>
</section>

<section class="section service-page service-page--stages">
  <h2 class="service-stages-title">Как проходит услуга</h2>
  {''.join(timeline)}
</section>

<section class="section service-page service-page--price" id="price">
  {price_html}
  <div class="actions service-page-actions"><a class="button" href="{PHONE_TEL}">ПОЗВОНИТЬ</a><a class="button dark" href="{PHONE_TEL}">ЗАПИСАТЬСЯ</a></div>
</section>

<section class="section service-page-nav">
  <div class="kicker">ДРУГИЕ УСЛУГИ</div>
  {SERVICE_LINKS_HTML}
</section>

<script src="../nav.js?v=book16"></script>
</body>
</html>
"""


def create_missing_services() -> None:
    defs = {
        "risk": (
            "Зоны риска",
            'ЗОНЫ<br><span class="accent">РИСКА.</span>',
            "Антигравийная плёнка защищает капот, бампер, крылья и зеркала от сколов, песка и реагентов.",
            [
                ("Осмотр и разметка зон", "Определяем набор элементов под защиту."),
                ("Подготовка поверхности", "Мойка, обезжиривание, полировка при необходимости."),
                ("Раскрой и монтаж PPF", "Наклейка плёнки с прогревом и выгонкой."),
                ("Контроль и выдача", "Проверяем кромки и даём рекомендации по уходу."),
            ],
            '<div class="service-price-title-wrap"><h2 class="service-price-title">ПРАЙС</h2></div><div class="service-price-pack-grid"><div class="service-price-pack-card"><span class="service-price-type">Комплект зон риска</span><b class="service-price-value">от 75 000 ₽</b></div><div class="service-price-pack-card"><span class="service-price-type">Отдельный элемент</span><b class="service-price-value">от 8 000 ₽</b></div></div>',
        ),
        "armor": (
            "Бронирование",
            'БРОНИРОВАНИЕ<br><span class="accent">СТЁКОЛ.</span>',
            "Бронируем лобовое и боковые стёкла защитной плёнкой — меньше рисков от сколов и трещин.",
            [
                ("Подбор плёнки", "Подбираем класс защиты под ваш стиль езды."),
                ("Подготовка стёкол", "Тщательная очистка и обезжиривание."),
                ("Нанесение", "Монтаж без пузырей с прогревом."),
                ("Проверка", "Осмотр и рекомендации по эксплуатации."),
            ],
            '<div class="service-price-title-wrap"><h2 class="service-price-title">ПРАЙС</h2></div><div class="service-price-simple"><b class="service-price-value">после осмотра</b><span class="service-price-simple-label">зависит от автомобиля и объёма</span></div>',
        ),
        "ceramic": (
            "Керамика",
            'КЕРАМИЧЕСКОЕ<br><span class="accent">ПОКРЫТИЕ.</span>',
            "Гидрофобная защита ЛКП после мойки и полировки: блеск держится дольше, уход проще.",
            [
                ("Подготовка кузова", "Мойка, деконтаминация, при необходимости полировка."),
                ("Нанесение керамики", "Покрываем кузов выбранным составом в несколько слоёв."),
                ("Полимеризация", "Выдержка и контроль равномерности."),
                ("Выдача", "Инструкция по уходу в первые недели."),
            ],
            '<div class="service-price-title-wrap"><h2 class="service-price-title">ПРАЙС</h2></div><div class="service-price-simple"><b class="service-price-value">от 18 000 ₽</b><span class="service-price-simple-label">за слой</span></div>',
        ),
        "antichrome": (
            "Антихром",
            'АНТИХРОМ<br><span class="accent">И ДЕКОР.</span>',
            "Матирование или оклейка хромированных накладок — аккуратный тёмный образ без лишнего блеска.",
            [
                ("Разбор и оценка", "Смотрим какие элементы снимаются и в каком состоянии хром."),
                ("Подготовка", "Мойка, обезжиривание, локальная защита кузова."),
                ("Обработка / плёнка", "Матирование или оклейка по согласованному варианту."),
                ("Сборка и контроль", "Возвращаем элементы, смотрим стыки и кромки."),
            ],
            '<div class="service-price-title-wrap"><h2 class="service-price-title">ПРАЙС</h2></div><div class="service-price-simple"><b class="service-price-value">от 12 000 ₽</b><span class="service-price-simple-label">зависит от объёма хрома</span></div>',
        ),
    }
    num_map = {s: n for s, n, *_ in SERVICES}
    for slug, payload in defs.items():
        title, h1, lead, stages, price = payload
        html = simple_service_page(slug, num_map[slug], title, h1, lead, stages, price)
        (ROOT / "services" / f"{slug}.html").write_text(rebrand_text(html), encoding="utf-8")


def cleanup() -> None:
    for name in (
        "kuzov.html",
        "kuzov-boot.js",
        "kuzov-configurator.core.js",
        "kuzov-configurator.css",
    ):
        p = ROOT / name
        if p.exists():
            p.unlink()
    for name in (
        "anticor.html",
        "bay.html",
        "chips.html",
        "interior.html",
        "optics.html",
        "pdr.html",
        "paint.html",
    ):
        p = ROOT / "services" / name
        if p.exists():
            p.unlink()


def patch_remaining_services() -> None:
    wrap = ROOT / "services/wrap.html"
    if wrap.exists():
        t = wrap.read_text(encoding="utf-8")
        t = strip_wrap_configurator(t)
        t = replace_service_links(t)
        t = re.sub(r"<title>[^<]+</title>", "<title>Оклейка плёнкой — Auto Custom</title>", t)
        wrap.write_text(rebrand_text(t), encoding="utf-8")

    for slug in ("polish", "sound", "wash"):
        path = ROOT / "services" / f"{slug}.html"
        if not path.exists():
            continue
        t = path.read_text(encoding="utf-8")
        t = replace_service_links(t)
        if slug == "sound":
            t = t.replace("Шумоизоляция", "Шумка")
            t = t.replace("ШУМОИЗОЛЯЦИЯ", "ШУМКА")
        if slug == "wash":
            t = t.replace("Детейлинг-мойка", "Детейлинг мойка")
        path.write_text(rebrand_text(t), encoding="utf-8")


def copy_logo() -> None:
    dest_dir = ROOT / "img" / "brand"
    dest_dir.mkdir(parents=True, exist_ok=True)
    if ASSET_LOGO.exists():
        shutil.copy(ASSET_LOGO, dest_dir / "logo-auto-custom.png")


def deploy_version() -> None:
    (ROOT / "deploy-version.txt").write_text(
        f"site=auto-custom-chelyabinsk\n"
        f"local=http://127.0.0.1:8114/\n"
        f"2gis={FIRM_URL}\n"
        f"deploy-trigger={BUILD_TAG}\n",
        encoding="utf-8",
    )


def main() -> None:
    patch_all_files()
    patch_styles()
    patch_server()
    copy_logo()
    cleanup()
    create_missing_services()
    patch_remaining_services()
    patch_services_index()
    patch_index()
    deploy_version()
    print("Auto Custom build complete:", ROOT)


if __name__ == "__main__":
    main()
