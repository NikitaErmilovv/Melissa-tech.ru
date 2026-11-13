#!/usr/bin/env python3
"""Klyaksa services page: minimal catalog + single base price (от) per line."""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import klyaksa_pricelist_data as D  # noqa: E402

SITE = ROOT / "klyaksa-tuning-noyabrsk"
SERVICES = SITE / "services.html"
STYLES = SITE / "styles.css"


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def money(raw: str) -> str:
    def repl(m: re.Match[str]) -> str:
        n = m.group(0)
        if len(n) < 4:
            return n
        return f"{int(n):,}".replace(",", " ")

    return re.sub(r"\d+", repl, raw)


def ot_from(raw: str | list[str]) -> str:
    if isinstance(raw, list):
        raw = raw[0] if raw else ""
    s = str(raw).strip()
    if not s:
        return "после осмотра"
    low = s.lower()
    if low in {"после осмотра", "договорная"}:
        return s
    if low.startswith("от"):
        chunk = s[2:].strip()
    elif " - " in s:
        chunk = s.split(" - ", 1)[0].strip()
    else:
        chunk = s
    digits = re.sub(r"\D", "", chunk.split()[0] if chunk else "")
    if not digits:
        return "после осмотра"
    return f"от {money(digits)} ₽"


def matrix_to_simple(rows: list[tuple[str, list[str]]]) -> list[tuple[str, str]]:
    return [(name, ot_from(prices)) for name, prices in rows]


def simple_table(rows: list[tuple[str, str]]) -> str:
    body = "\n".join(
        f'        <tr><td>{esc(a)}</td><td class="pricelist-price">{esc(b)}</td></tr>'
        for a, b in rows
    )
    return f"""  <div class="pricelist-table-wrap pricelist-table-wrap--simple">
    <table class="pricelist-table pricelist-table--simple">
      <thead><tr><th>Наименование</th><th>Стоимость</th></tr></thead>
      <tbody>
{body}
      </tbody>
    </table>
  </div>
"""


def composition(items: list[str]) -> str:
    lis = "\n".join(f"      <li>{esc(item)}</li>" for item in items)
    return f"""  <div class="pricelist-includes">
    <h3 class="pricelist-includes-title">Что входит в услугу</h3>
    <ol class="pricelist-composition">
{lis}
    </ol>
  </div>
"""


def notes(items: list[str]) -> str:
    if not items:
        return ""
    lis = "".join(f"    <li>{esc(x)}</li>\n" for x in items)
    return f'  <ul class="pricelist-notes">\n{lis}  </ul>\n'


def tagline(text: str) -> str:
    return f'  <p class="pricelist-tagline">{esc(text)}</p>\n'


def photos_block(slugs: list[str], labels: list[str] | None = None) -> str:
    figures: list[str] = []
    for i, slug in enumerate(slugs):
        src = f"img/services/{slug}.jpg"
        cap = ""
        if labels and i < len(labels):
            cap = f'<figcaption class="service-block-photo-cap">{esc(labels[i])}</figcaption>'
        figures.append(
            f"""<figure class="service-block-photo-item">
      <div class="service-block-photo" data-service-photo="{esc(slug)}" style="background-image:url('{src}')"></div>
      {cap}
    </figure>"""
        )
    multi = " service-block-photos--multi" if len(slugs) > 1 else ""
    return f'<div class="service-block-photos{multi}">\n    ' + "\n    ".join(figures) + "\n    </div>"


def service_block(
    sid: str,
    kicker: str,
    title: str,
    inner: str,
    *,
    intro: str | None = None,
    from_price: str | None = None,
    photo_slug: str | list[str] | None = None,
    photo_labels: list[str] | None = None,
    note_items: list[str] | None = None,
    works: list[str] | None = None,
    sign: str | None = None,
) -> str:
    intro_html = f'\n        <p class="intro">{esc(intro)}</p>' if intro else ""
    price_html = (
        f'<p class="service-block-from">{esc(from_price)}</p>' if from_price else ""
    )
    photo_html = ""
    if photo_slug:
        slugs = [photo_slug] if isinstance(photo_slug, str) else photo_slug
        labels = photo_labels if photo_labels and len(photo_labels) == len(slugs) else None
        photo_html = photos_block(slugs, labels)
    works_html = composition(works) if works else ""
    return f"""<section class="section pricelist-page service-block" id="{sid}">
  <div class="service-block-grid">
    {photo_html}
    <div class="service-block-main">
      <div class="section-head">
        <div><div class="kicker">{esc(kicker)}</div><h2>{esc(title)}</h2></div>{intro_html}
        {price_html}
      </div>
{inner}{works_html}{notes(note_items or [])}{tagline(sign) if sign else ""}    </div>
  </div>
</section>
"""


def catalog_card(
    anchor: str, kicker: str, title: str, lead: str, price: str, photo_slug: str
) -> str:
    src = f"img/services/{photo_slug}.jpg"
    return f"""<a class="service-catalog-card" href="#{esc(anchor)}">
  <div class="service-catalog-photo" data-service-photo="{esc(photo_slug)}" style="background-image:url('{src}')"></div>
  <span class="service-catalog-kicker">{esc(kicker)}</span>
  <h3 class="service-catalog-title">{esc(title)}</h3>
  <p class="service-catalog-lead">{esc(lead)}</p>
  <span class="service-catalog-price">{esc(price)}</span>
</a>"""


def build_catalog() -> str:
    featured = [
        ("restore", "КУЗОВ", "Реставрация сколов и царапин", "Локальная коррекция ЛКП без перекраски.", ot_from("от 1500"), "restore-scratches"),
        ("wrap-films", "ПЛЁНКА", "Оклейка кузова", "Полиуретан, винил, декоративные и защитные плёнки.", ot_from("20000"), "wrap"),
        ("antichrome", "ТЮНИНГ", "Антихром", "Оклейка хрома в цвет кузова или чёрный.", ot_from("от 15000"), "antichrome"),
        ("salon-wrap", "САЛОН", "Оклейка салона", "Элементы интерьера защитной и декоративной плёнкой.", "после осмотра", "salon-wrap"),
        ("windshield-ppf", "СТЁКЛА", "Защита лобового стекла", "Полиуретановая антигравийная плёнка на лобовое.", ot_from("от 4800"), "windshield"),
        ("screen-static", "САЛОН", "Защита экранов", "Статическая плёнка на дисплеи и мониторы.", "после осмотра", "screens"),
        ("interior-engine", "САЛОН", "Химчистка салона и двигателя", "Глубокая чистка салона и моторного отсека.", ot_from("от 33000"), "interior"),
        ("sound", "КОМФОРТ", "Шумоизоляция", "Снижение шума и вибраций в салоне.", ot_from("110000"), "sound"),
        ("tint", "СТЁКЛА", "Тонировка", "Тонировка и атермальные плёнки на стёкла.", ot_from("от 1800"), "tint"),
        ("wash-detail-1", "МОЙКА", "Детейлинг-мойка", "Предпродажная и поддерживающая мойка премиум-класса.", ot_from("9000"), "detailing-wash"),
    ]
    cards = "\n".join(catalog_card(*item) for item in featured)
    nav = " ".join(
        f'<a href="#{a}">{esc(t.split()[0] if " " in t else t)}</a>'
        for a, _, t, *_ in featured
    )
    more = (
        '<a href="#wash-exterior">Мойка</a><a href="#polish">Полировка</a>'
        '<a href="#extras-body">Доп. кузов</a><a href="#extras-salon">Доп. салон</a>'
    )
    return f"""<section class="section pricelist-intro" id="catalog-top">
  <p class="intro" style="max-width:780px">Базовые цены — от минимального класса и объёма работ. Точная стоимость после осмотра. Фото к услугам добавим на следующем этапе.</p>
  <nav class="pricelist-nav" aria-label="Основные услуги">{nav} {more}</nav>
  <div class="service-catalog" aria-label="Каталог услуг">
{cards}
  </div>
</section>
"""


def build() -> str:
    parts: list[str] = [build_catalog()]

    parts.append(
        service_block(
            "restore",
            "КУЗОВ",
            "РЕСТАВРАЦИЯ СКОЛОВ И ЦАРАПИН",
            simple_table([
                ("Частичная полировка одного элемента", ot_from("от 1500")),
                ("Восстановительная полировка одного элемента", ot_from("от 2500")),
                ("Полировка фар (2 шт.)", ot_from("от 2000")),
                ("Восстановительная полировка кузова", ot_from("28000 - 30000")),
            ]),
            intro="Локальное восстановление ЛКП и оптики.",
            from_price=ot_from("от 1500"),
            photo_slug=["restore-scratches", "restore-chips"],
            photo_labels=["Царапины", "Сколы"],
            note_items=["Финальная цена зависит от глубины повреждений и площади."],
        )
    )

    parts.append(
        service_block(
            "wash-detail-1",
            "МОЙКА",
            "ДЕТЕЙЛИНГ-МОЙКА",
            simple_table([
                ("Detailing мойка-1 (предпродажная)", ot_from("9000")),
                ("Detailing мойка-2 (расширенная)", ot_from("11700")),
            ]),
            intro="Глубокая мойка кузова и салона с консервацией.",
            from_price=ot_from("9000"),
            photo_slug="detailing-wash",
            works=[
                "Чистка дисков и дверных петель",
                "Двухфазная мойка кузова и арок",
                "Полимерная защита и уход за салоном по регламенту",
            ],
            note_items=[
                "Цены базовые; +20–50% при сильном загрязнении.",
                "Третий ряд сидений — доплата.",
            ],
        )
    )

    parts.append(
        service_block(
            "wash-exterior",
            "МОЙКА",
            "НАРУЖНАЯ МОЙКА КУЗОВА",
            simple_table([("Наружная мойка", ot_from("1600"))]),
            from_price=ot_from("1600"),
            photo_slug="wash",
            works=[
                "Бесконтактная мойка с эмульсией",
                "Ручная мойка, сушка, чернение шин",
            ],
        )
    )
    parts.append(
        service_block(
            "wash-complex",
            "МОЙКА",
            "КОМПЛЕКСНАЯ МОЙКА",
            simple_table([("Комплексная мойка", ot_from("3200"))]),
            from_price=ot_from("3200"),
            works=[
                "Мойка кузова и базовый уход за салоном",
            ],
            note_items=[
                "Мойка арок от льда — доп. 400 ₽.",
                "Цены базовые; +20–50% при сильном загрязнении.",
            ],
        )
    )

    interior_rows = matrix_to_simple(D.INTERIOR_ELEMENTS)
    engine_row = ("Химчистка ДВС и подкапотного пространства", ot_from(D.EXTRAS_BODY[0][1]))
    parts.append(
        service_block(
            "interior-engine",
            "САЛОН",
            "ХИМЧИСТКА САЛОНА И ДВИГАТЕЛЯ",
            simple_table([
                ("Химчистка салона с разбором (полная)", ot_from("от 33000")),
                engine_row,
                *interior_rows[:6],
            ])
            + '  <h3 class="pricelist-sheet-title">По элементам</h3>\n'
            + simple_table(interior_rows[6:]),
            intro="Салон, багажник и моторный отсек.",
            from_price=ot_from("от 33000"),
            photo_slug="interior",
            note_items=["Светлый салон — до +20% к стоимости."],
        )
    )

    parts.append(
        service_block(
            "wrap-films",
            "ПЛЁНКА",
            "ОКЛЕЙКА КУЗОВА ВСЕМИ ВИДАМИ ПЛЁНОК",
            '  <h3 class="pricelist-sheet-title">Пакеты</h3>\n'
            + simple_table(matrix_to_simple(D.PPF_PACKAGES))
            + '  <h3 class="pricelist-sheet-title">По деталям</h3>\n'
            + simple_table(matrix_to_simple(D.PPF_PARTS)),
            intro="Полиуретановая защита, винил, декоративные решения.",
            from_price=ot_from("20000"),
            photo_slug="wrap",
            note_items=["+20–50% от площади, вида плёнки и сложности."],
        )
    )
    parts.append(
        service_block(
            "windshield-ppf",
            "СТЁКЛА",
            "ЗАЩИТА ЛОБОВОГО СТЕКЛА ПОЛИУРЕТАНОВОЙ ПЛЁНКОЙ",
            simple_table([
                ("Лобовое стекло (тонировка / базовая сетка — ориентир)", ot_from("от 4800")),
                ("Стойка лобового стекла (1 шт.)", ot_from("3000")),
                ("Заднее стекло", ot_from("от 3600")),
            ]),
            from_price=ot_from("от 4800"),
            photo_slug="windshield",
        )
    )

    parts.append(
        service_block(
            "screen-static",
            "САЛОН",
            "ЗАЩИТА ЭКРАНОВ СТАТИЧЕСКОЙ ПЛЁНКОЙ",
            simple_table([
                ("Мультимедиа и приборная панель", "после осмотра"),
                ("Дополнительные дисплеи (1 шт.)", "после осмотра"),
            ]),
            intro="Антибликовая плёнка без клея — легко снимается.",
            from_price="после осмотра",
            photo_slug="screens",
        )
    )

    parts.append(
        service_block(
            "salon-wrap",
            "САЛОН",
            "ОКЛЕЙКА САЛОНА",
            simple_table([
                ("Защита дверных карт (1 шт.)", ot_from("2000")),
                ("Защита пластиковых порогов (1 шт.)", ot_from("1500")),
                ("Декоративная / защитная оклейка элементов", "после осмотра"),
            ]),
            from_price="после осмотра",
            photo_slug="salon-wrap",
        )
    )

    polish_rows = matrix_to_simple([
        ("Восстановительная полировка кузова", ["28000 - 30000", "35000", "37000 - 40000"]),
        ("Восстановительная полировка одного элемента", ["от 2500", "от 2500", "от 2500"]),
        ("Частичная полировка одного элемента", ["от 1500", "от 1500", "от 1500"]),
        ("Полировка фар (2 шт.)", ["от 2000", "от 2000", "от 2000"]),
    ])
    protect_rows = matrix_to_simple([
        ("Покрытие кузова Q2 ONE EVO GYEON (12 мес.)", ["14000", "15000", "16000"]),
        ("Покрытие кузова Detail Basic Coat (керамика, 12 мес.)", ["13000", "14000", "15000"]),
        ("Покрытие кузова Detail Final Coat (жидкое стекло, 12 мес.)", ["13000", "14000", "15000"]),
        ("Многослойная восковая защита ЛКП (Chemical Guys, Dodo Juice)", ["10000", "12000", "14000"]),
    ])
    parts.append(
        service_block(
            "polish",
            "ДЕТЕЙЛИНГ",
            "ПОЛИРОВКА",
            simple_table(polish_rows),
            from_price=ot_from("от 1500"),
            photo_slug="polish",
        )
    )
    parts.append(
        service_block(
            "protect",
            "ДЕТЕЙЛИНГ",
            "ЗАЩИТА КУЗОВА И САЛОНА",
            simple_table(protect_rows),
            from_price=ot_from("10000"),
            photo_slug="protection",
        )
    )

    glass_rows = matrix_to_simple([
        ("Aquapel — передняя полусфера + зеркала", ["4000", "4000", "4000"]),
        ("Chemical Russian Rain — передняя полусфера", ["1000", "1000", "1000"]),
        ("Chemical Russian Rain — по кругу", ["2000", "2200", "2300"]),
        ("Ceramic Pro Rain — передняя полусфера", ["3000", "3000", "3000"]),
        ("Ceramic Pro Rain — по кругу", ["4000", "4300", "4300"]),
    ])
    parts.append(
        service_block("glass", "ДЕТЕЙЛИНГ", "СТЁКЛА И «АНТИДОЖДЬ»", simple_table(glass_rows), from_price=ot_from("1000"))
    )
    parts.append(
        service_block(
            "leather",
            "ДЕТЕЙЛИНГ",
            "КОЖА",
            simple_table(matrix_to_simple([
                ("Консервация кожаных сидений Gyeon Q2 Leather Shield (4 шт.)", ["5000", "6000", "6000"]),
                ("Кондиционер кожи LeTech", ["2000", "2000", "2000"]),
            ])),
            from_price=ot_from("2000"),
        )
    )
    parts.append(
        service_block(
            "wheels",
            "ДЕТЕЙЛИНГ",
            "ДИСКИ И ШИНЫ",
            simple_table(matrix_to_simple([
                ("Покрытие дисков Gyeon Q2 Rim", ["2000", "2500", "2500"]),
                ("Глубокая чистка и покрытие шин Gyeon Q2 Tire", ["от 1000", "от 1000", "от 1000"]),
            ])),
            from_price=ot_from("от 1000"),
        )
    )
    parts.append(
        service_block(
            "extras-salon",
            "ДОПОЛНИТЕЛЬНО",
            "САЛОН",
            simple_table(matrix_to_simple(D.EXTRAS_SALON)),
            from_price=ot_from("200"),
        )
    )
    parts.append(
        service_block(
            "extras-body",
            "ДОПОЛНИТЕЛЬНО",
            "КУЗОВ",
            simple_table(matrix_to_simple(D.EXTRAS_BODY)),
            from_price=ot_from("50"),
        )
    )

    tint_windows = matrix_to_simple([
        ("Задняя полусфера", ["от 7200", "от 8400", "от 9600"]),
        ("Передняя полусфера (75%–90%)", ["от 9600", "от 9600", "от 9600"]),
        ("Заднее стекло", ["от 3600", "от 4800", "от 4800"]),
        ("Боковое заднее стекло (1 шт.)", ["от 1800", "от 2400", "от 2400"]),
        ("Лобовое стекло (75%–90%)", ["от 6000", "от 6000", "от 6000"]),
        ("Форточка (1 шт.)", ["от 1800", "от 1800", "от 1800"]),
    ])
    tint_extra = matrix_to_simple([
        ("Хамелеон — передняя полусфера", ["10000", "10000", "11000"]),
        ("Растонирование бокового стекла (1 шт.)", ["от 700", "от 700", "от 700"]),
        ("Тонирование передней фары (пара)", ["от 7000", "от 7000", "от 8000"]),
    ])
    parts.append(
        service_block(
            "tint",
            "ТОНИРОВКА",
            "ТОНИРОВКА",
            simple_table(tint_windows)
            + '  <h3 class="pricelist-sheet-title">Дополнительно</h3>\n'
            + simple_table(tint_extra),
            from_price=ot_from("от 1800"),
            photo_slug="tint",
            note_items=["Цены базовые; +20–50% от трудозатрат."],
        )
    )

    anti = [
        ("Решетка радиатора", ot_from("от 15000")),
        ("Молдинги вокруг окон", ot_from("от 18000")),
        ("Молдинги дверей", ot_from("от 6000")),
        ("Ручка двери (1 шт.)", ot_from("от 3000")),
        ("Зеркало (1 шт.)", ot_from("от 3500")),
    ]
    parts.append(
        service_block(
            "antichrome",
            "ТЮНИНГ",
            "АНТИХРОМ",
            simple_table(anti)
            + simple_table([
                ("Молдинги багажника", ot_from("от 6000")),
                ("Молдинги бамперов", ot_from("от 8000")),
                ("Диффузор задний", ot_from("от 15000")),
                ("Рейлинги", ot_from("от 18000")),
            ]),
            from_price=ot_from("от 15000"),
            photo_slug="antichrome",
        )
    )

    sound_rows = matrix_to_simple([
        ("Полная шумоизоляция", ["110000", "125000", "140000"]),
        ("Шумоизоляция дверей (5 шт.)", ["30000", "35000", "35000"]),
        ("Шумоизоляция пола и колёсных арок", ["45000", "50000", "55000"]),
        ("Шумоизоляция багажника", ["25000", "30000", "35000"]),
    ])
    parts.append(
        service_block(
            "sound",
            "САЛОН",
            "ШУМОИЗОЛЯЦИЯ",
            simple_table(sound_rows),
            from_price=ot_from("110000"),
            photo_slug="sound",
            note_items=["Цены базовые; +20–50% от объёма работ."],
        )
    )

    # alias anchor for legacy #ppf links
    parts.append(
        service_block(
            "ppf",
            "ЗАЩИТА",
            "БРОНЕПЛЁНКА",
            '<p class="intro">См. раздел <a href="#wrap-films">оклейка кузова всеми видами плёнок</a> — полный прайс по пакетам и деталям.</p>',
            from_price=ot_from("20000"),
            photo_slug="wrap",
        )
    )

    return "<!-- PRICELIST_BEGIN -->\n" + "\n".join(parts) + "\n<!-- PRICELIST_END -->"


def patch_styles() -> None:
    block = """
.service-catalog{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin-top:28px}
.service-catalog-card{display:flex;flex-direction:column;gap:8px;padding:0;border:1px solid rgba(255,255,255,.1);border-radius:6px;background:rgba(255,255,255,.02);text-decoration:none;color:inherit;overflow:hidden;transition:border-color .2s,transform .2s}
.service-catalog-card:hover{border-color:var(--accent-soft);transform:translateY(-2px)}
.service-catalog-photo{min-height:140px;background:#1a1a17 center/cover no-repeat;background-color:rgba(255,255,255,.04)}
.service-catalog-kicker{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);padding:14px 16px 0}
.service-catalog-title{margin:0;padding:0 16px;font-size:18px;line-height:1.25}
.service-catalog-lead{margin:0;padding:0 16px;font-size:12px;line-height:1.45;color:#9a9a94}
.service-catalog-price{margin:12px 16px 16px;font-size:15px;font-weight:700;color:var(--accent)}
.pricelist-intro{padding-top:24px;padding-bottom:8px}
.pricelist-nav{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 4px}
.pricelist-nav a{font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:8px 12px;border:1px solid rgba(255,255,255,.12);border-radius:3px;color:#c8c6be;text-decoration:none}
.pricelist-nav a:hover{border-color:var(--accent-soft);color:var(--accent)}
.service-block-grid{display:grid;grid-template-columns:minmax(0,280px) 1fr;gap:28px;align-items:start}
.service-catalog-photo{min-height:140px;background:#1a1a17 center/cover no-repeat;background-color:rgba(255,255,255,.04)}
.service-block-photos{display:flex;flex-direction:column;gap:12px}
.service-block-photos--multi .service-block-photo-item{margin:0}
.service-block-photo-item{display:flex;flex-direction:column;gap:6px;margin:0}
.service-block-photo-cap{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#9a9a94;text-align:center}
.service-block-photo{min-height:200px;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:#161614 center/cover no-repeat;background-color:rgba(255,255,255,.03)}
.service-block-from{margin:12px 0 0;font-size:22px;font-weight:700;color:var(--accent)}
.pricelist-table--simple{min-width:0}
.pricelist-table--simple td.pricelist-price{font-weight:600;color:var(--accent);white-space:nowrap}
.pricelist-table-wrap--simple+.pricelist-table-wrap--simple{margin-top:16px}
@media(max-width:800px){
  .service-block-grid{grid-template-columns:1fr}
  .service-block-photo{min-height:160px;max-height:220px}
}
"""
    css = STYLES.read_text(encoding="utf-8")
    marker = "/* KLYSAKA_SERVICE_CATALOG */"
    if marker in css:
        css = re.sub(
            re.escape(marker) + r".*?" + re.escape(marker) + r"_END",
            marker + block + marker + "_END",
            css,
            flags=re.S,
        )
    else:
        css = css.rstrip() + f"\n{marker}{block}{marker}_END\n"
    STYLES.write_text(css, encoding="utf-8")


def main() -> None:
    html_text = SERVICES.read_text(encoding="utf-8")
    a = html_text.index("<!-- PRICELIST_BEGIN -->")
    b = html_text.index("<!-- PRICELIST_END -->") + len("<!-- PRICELIST_END -->")
    html_text = html_text[:a] + build() + html_text[b:]
    html_text = re.sub(r'href="styles\.css\?v=\d+"', 'href="styles.css?v=89"', html_text, count=1)
    SERVICES.write_text(html_text, encoding="utf-8")
    patch_styles()
    print("ok")


if __name__ == "__main__":
    main()
