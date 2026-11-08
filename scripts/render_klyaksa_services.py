#!/usr/bin/env python3
"""Inject Klyaksa price-list blocks into services.html (Pervushin-style tables)."""
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

VEH3 = D.VEH3
VEH4 = ["Мини", "Седан", "Кроссовер", "Джип"]


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def matrix_table(groups: list, cols: list[str], allow_html_name: bool = False) -> str:
    col_heads = "".join(f"<th>{esc(c)}</th>" for c in cols)
    spans = len(cols) + 1
    body: list[str] = []
    for gname, rows in groups:
        if gname:
            body.append(f'<tr class="pricelist-cat"><td colspan="{spans}">{esc(gname)}</td></tr>')
        for row in rows:
            name = row[0]
            prices = row[1] if isinstance(row[1], list) else list(row[1:])
            name_cell = name if allow_html_name else esc(name)
            cells = "".join(f"<td>{p if '<' in str(p) else esc(str(p))}</td>" for p in prices)
            body.append(f"<tr><td>{name_cell}</td>{cells}</tr>")
    return f"""<div class="pricelist-table-wrap">
<table class="pricelist-table pricelist-table--matrix">
<thead><tr><th>Вид работ</th>{col_heads}</tr></thead>
<tbody>{''.join(body)}</tbody>
</table></div>"""


def bundle_table(work_html: str, prices: list[str], cols: list[str]) -> str:
    col_heads = "".join(f"<th>{esc(c)}</th>" for c in cols)
    price_cells = "".join(f"<td>{esc(p)}</td>" for p in prices)
    return f"""<div class="pricelist-table-wrap">
<table class="pricelist-table pricelist-table--bundle">
<thead><tr><th>Вид работ</th>{col_heads}</tr></thead>
<tbody><tr><td class="pricelist-work">{work_html}</td>{price_cells}</tr></tbody>
</table></div>"""


def two_col_table(rows: list[tuple[str, str]]) -> str:
    body = "".join(f"<tr><td>{esc(a)}</td><td>{esc(b)}</td></tr>" for a, b in rows)
    return f"""<div class="pricelist-table-wrap">
<table class="pricelist-table">
<thead><tr><th>Наименование</th><th>Стоимость услуги</th></tr></thead>
<tbody>{body}</tbody>
</table></div>"""


def footnotes(*items: str) -> str:
    if not items:
        return ""
    lis = "".join(f"<li>{esc(x)}</li>" for x in items)
    return f'<ul class="pricelist-notes">{lis}</ul>'


def page(sid: str, kicker: str, title: str, inner: str, notes: list[str] | None = None, tagline: str | None = None) -> str:
    notes_html = footnotes(*(notes or []))
    tag = f'<p class="pricelist-tagline">{esc(tagline)}</p>' if tagline else ""
    return f"""<section class="section pricelist-page" id="{sid}">
  <div class="section-head"><div><div class="kicker">{esc(kicker)}</div><h2>{esc(title)}</h2></div></div>
  {inner}
  {notes_html}{tag}
</section>"""


def build_body() -> str:
    parts: list[str] = []

    wash_ext = """<ol class="pricelist-ol">
<li>Бесконтактная мойка с нанесением эмульсии</li>
<li>Ручная мойка шампунем и широкопористой губкой</li>
<li>Сушка кузова микрофибровым полотенцем</li>
<li>Продувка воздухом</li>
<li>Протирка дверных проёмов</li>
<li>Чистка, консервация (чернение) шин</li>
</ol>"""

    parts.append(
        page(
            "wash-exterior",
            "МОЙКА",
            "Наружная мойка кузова",
            bundle_table(wash_ext, ["1600", "1750", "1850"], VEH3),
            tagline="Современные технологии и высококачественные материалы!",
        )
    )

    wash_full = wash_ext + """<ol class="pricelist-ol" start="7">
<li>Чистка, консервация (чернение) шин</li>
<li><strong>Салон:</strong> коврики, педальный блок, пылесос, стёкла, влажная уборка</li>
</ol>"""
    parts.append(
        page(
            "wash-complex",
            "МОЙКА",
            "Комплексная мойка автомобиля",
            bundle_table(wash_full, ["3200", "3400", "3800"], VEH3),
            [
                "Мойка арок от льда и снега — дополнительно 400 ₽.",
                "Третий ряд сидений — дополнительно 300 ₽.",
                "Цены базовые; +20–50% от загрязнения и трудозатрат.",
            ],
            "Современные технологии и высококачественные материалы!",
        )
    )

    parts.append(
        page(
            "wash-detail-1",
            "МОЙКА",
            "Комплексная Detailing мойка-1",
            bundle_table(D.WASH_DETAIL_1_WORK, ["9000", "10000", "11000", "12500"], VEH4),
            [
                "Цены базовые; +20–50% по факту.",
                "Время до 6 часов (ориентировочно).",
                "Премиум автохимия.",
                "Третий ряд сидений +1000 ₽.",
            ],
            "Доверьте свой автомобиль профессионалам!",
        )
    )
    parts.append(
        page(
            "wash-detail-2",
            "МОЙКА",
            "Комплексная Detailing мойка-2",
            bundle_table(D.WASH_DETAIL_2_WORK, ["11700", "12100", "13000", "14500"], VEH4),
            [
                "Цены базовые; +20–50%.",
                "Третий ряд сидений +1000 ₽.",
                "Время до 10 часов (ориентировочно).",
                "Премиум автохимия.",
            ],
            "Доверьте свой автомобиль профессионалам!",
        )
    )

    interior_full = f"""{bundle_table(D.INTERIOR_FULL_WORK, ["от 33000", "от 35000", "от 37000"], VEH3)}
<h3 class="pricelist-sheet-title">Химчистка по элементам</h3>
{matrix_table([("", D.INTERIOR_ELEMENTS)], VEH3)}"""
    parts.append(
        page(
            "interior-dry",
            "САЛОН",
            "Услуги химчистки",
            interior_full,
            ["Цены базовые; +20–50% в зависимости от загрязнения."],
            "Tuning studia КЛЯКСА — Ваш автомобиль обретает будущее!",
        )
    )

    extras = f"""{matrix_table([("САЛОН", D.EXTRAS_SALON), ("КУЗОВ", D.EXTRAS_BODY)], VEH3, allow_html_name=True)}"""
    parts.append(
        page(
            "extras",
            "ДОПОЛНИТЕЛЬНО",
            "Дополнительные услуги",
            extras,
            ["Цены базовые; +20–50% в зависимости от загрязнения и трудозатрат."],
        )
    )

    detailing_groups = [
        ("ПОЛИРОВКА", [
            ("Восстановительная полировка кузова", ["28000 – 30000", "35000", "37000 – 40000"]),
            ("Восстановительная полировка одного элемента", ["от 2500", "от 2500", "от 2500"]),
            ("Частичная полировка одного элемента", ["от 1500", "от 1500", "от 1500"]),
            ("Полировка фар (2 шт.)", ["от 2000", "от 2000", "от 2000"]),
        ]),
        ("ЗАЩИТА КУЗОВА", [
            ("Q2 ONE EVO GYEON (12 мес.)", ["14000", "15000", "16000"]),
            ("Detail Basic Coat (12 мес)", ["13000", "14000", "15000"]),
            ("Detail Final Coat (12 мес)", ["13000", "14000", "15000"]),
            ("«Американский восковой пирог»", ["10000", "12000", "14000"]),
        ]),
        ("СТЕКЛО", [
            ("Aquapel (передняя полусфера + зеркала)", ["4000", "4000", "4000"]),
            ("Chemical Russian Rain — передняя полусфера", ["1000", "1000", "1000"]),
            ("Chemical Russian Rain — по кругу", ["2000", "2200", "2300"]),
            ("Ceramic Pro Rain — передняя полусфера", ["3000", "3000", "3000"]),
            ("Ceramic Pro Rain — по кругу", ["4000", "4300", "4300"]),
        ]),
        ("КОЖА", [
            ("Gyeon Q2 Leather Shield (4 шт.)", ["5000", "6000", "6000"]),
            ("Кондиционер кожи LeTech", ["2000", "2000", "2000"]),
        ]),
        ("ПЛАСТИК", [("Gyeon Q2 Preserve (до 3 мес.)", ["4000", "5000", "5000"])]),
        ("ТКАНЬ", [("Gyeon Q2 Fabric Coat (4 шт.)", ["4000", "4500", "4500"])]),
        ("РЕЗИНА, ДИСКИ", [
            ("Gyeon Q2 Rim", ["2000", "2500", "2500"]),
            ("Gyeon Q2 Tire", ["от 1000", "от 1000", "от 1000"]),
        ]),
    ]
    parts.append(
        page(
            "detailing",
            "ДЕТЕЙЛИНГ",
            "Услуги детейлинга",
            matrix_table(detailing_groups, VEH3),
            tagline="Ваш автомобиль может быть новым всегда!",
        )
    )

    tint_groups = [
        ("Тонирование стекол", [
            ("Задняя полусфера", ["от 7200", "от 8400", "от 9600"]),
            ("Передняя полусфера (75%–90%)", ["от 9600", "от 9600", "от 9600"]),
            ("Передняя полусфера (5%–50%)", ["от 7200", "от 8400", "от 8400"]),
            ("Заднее стекло", ["от 3600", "от 4800", "от 4800"]),
            ("Боковое заднее (1 шт.)", ["от 1800", "от 2400", "от 2400"]),
            ("Лобовое (75%–90%)", ["от 6000", "от 6000", "от 6000"]),
            ("Лобовое (5%–50%)", ["от 4800", "от 4800", "от 6000"]),
            ("Переднее боковое (75%–90%)", ["от 2000", "от 2760", "от 2760"]),
            ("Переднее боковое (5%–50%)", ["от 1800", "от 2400", "от 2400"]),
            ("Форточка (1 шт.)", ["от 1800", "от 1800", "от 1800"]),
        ]),
        ("Хамелеон", [
            ("Передняя полусфера", ["10000", "10000", "11000"]),
            ("Лобовое стекло", ["6000", "6000", "7000"]),
            ("Боковое стекло", ["2000", "2000", "3000"]),
        ]),
        ("Растонирование", [
            ("Заднее стекло", ["от 2700", "от 2700", "от 2700"]),
            ("Лобовое стекло", ["от 2200", "от 2200", "от 2200"]),
            ("Боковое (1 шт.)", ["от 700", "от 700", "от 700"]),
            ("Форточка (1 шт.)", ["от 400", "от 400", "от 400"]),
        ]),
        ("Фары", [
            ("Тонирование передней фары (пара)", ["от 7000", "от 7000", "от 8000"]),
            ("Тонирование задней фары (пара)", ["от 7000", "от 7000", "от 8000"]),
            ("Тонирование туманки (пара)", ["от 2000", "от 2000", "от 2000"]),
            ("Фотохром задней фары (пара)", ["от 8000", "от 8500", "от 8500"]),
            ("Фотохром передней фары (пара)", ["от 8000", "от 8500", "от 8500"]),
        ]),
    ]
    parts.append(
        page(
            "tint",
            "ТОНИРОВКА",
            "Тонирование автомобиля",
            matrix_table(tint_groups, VEH3),
            ["Цены базовые; +20–50% в зависимости от трудозатрат."],
            "Ваш автомобиль прекрасен!",
        )
    )

    ppf_inner = f"""{matrix_table([("", D.PPF_PACKAGES)], VEH3)}
<h3 class="pricelist-sheet-title">Оклейка деталей</h3>
{matrix_table([("", D.PPF_PARTS)], VEH3)}"""
    parts.append(
        page(
            "ppf",
            "ЗАЩИТА",
            "Антигравийная защита",
            ppf_inner,
            ["Цены базовые; +20–50% от трудозатрат и вида плёнки."],
            "Ваш автомобиль защищён!",
        )
    )

    anti = [
        ("Решетка радиатора", "от 15000"),
        ("Молдинги вокруг окон", "от 18000"),
        ("Молдинги багажника", "от 6000"),
        ("Молдинги дверей", "от 6000"),
        ("Молдинги бамперов", "от 8000"),
        ("Окантовка ПТФ", "от 8000"),
        ("Диффузор задний", "от 15000"),
        ("Диффузор передний", "от 12000"),
        ("Рейлинги", "от 18000"),
        ("Ручка двери (1 шт.)", "от 3000"),
        ("Зеркало (1 шт.)", "от 3500"),
        ("«Жабры» на крыле", "от 6000"),
    ]
    parts.append(
        page(
            "antichrome",
            "ТЮНИНГ",
            "Антихром",
            two_col_table(anti),
            ["Цены базовые; зависят от трудозатрат и плёнки."],
            "Ваш автомобиль преображён!",
        )
    )

    sound = [("", [
        ("Полная шумоизоляция", ["110000", "125000", "140000"]),
        ("Двери (5 шт.)", ["30000", "35000", "35000"]),
        ("Пол и колесные арки", ["45000", "50000", "55000"]),
        ("Подкрылки (4 шт.)", ["25000", "30000", "30000"]),
        ("Багажник", ["25000", "30000", "35000"]),
        ("Крыша", ["35000", "40000", "45000"]),
        ("Торпеда", ["45000", "45000", "45000"]),
    ])]
    parts.append(
        page(
            "sound",
            "САЛОН",
            "Шумоизоляция",
            matrix_table(sound, VEH3),
            ["Цены базовые; +20–50% от трудозатрат."],
            "Ваш автомобиль преображён!",
        )
    )

    nav = """<nav class="pricelist-nav" aria-label="Разделы прайса">
  <a href="#wash-exterior">Мойка</a><a href="#wash-detail-1">Detailing 1</a><a href="#wash-detail-2">Detailing 2</a>
  <a href="#interior-dry">Химчистка</a><a href="#extras">Доп. услуги</a><a href="#detailing">Детейлинг</a>
  <a href="#tint">Тонировка</a><a href="#ppf">Антигравий</a><a href="#antichrome">Антихром</a><a href="#sound">Шумоизоляция</a>
</nav>"""

    return f"""<!-- PRICELIST_BEGIN -->
<section class="section pricelist-intro">
  <p class="intro" style="max-width:780px">Актуальный прайс-лист студии. Точная стоимость — после осмотра автомобиля.</p>
  {nav}
</section>
{''.join(parts)}
<!-- PRICELIST_END -->"""


def patch_styles() -> None:
    css = STYLES.read_text(encoding="utf-8")
    new_block = """
.pricelist-intro{padding-top:32px;padding-bottom:8px}
.pricelist-nav{display:flex;flex-wrap:wrap;gap:8px 10px;margin:18px 0 8px}
.pricelist-nav a{
  font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;
  padding:10px 14px;border:1px solid rgba(255,255,255,.14);border-radius:3px;color:#d8d6cf;
}
.pricelist-nav a:hover{border-color:var(--accent-soft);color:var(--accent)}
.pricelist-page{padding-top:40px;padding-bottom:48px;scroll-margin-top:96px}
.pricelist-page .section-head{margin-bottom:22px}
.pricelist-sheet-title{margin:28px 0 10px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.pricelist-sheet-title:first-of-type{margin-top:0}
.pricelist-table-wrap{overflow-x:auto;border:1px solid rgba(255,255,255,.1);border-radius:4px;background:rgba(255,255,255,.02)}
.pricelist-table-wrap+.pricelist-table-wrap{margin-top:18px}
.pricelist-table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.45;min-width:520px}
.pricelist-table th,.pricelist-table td{padding:14px 18px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);vertical-align:top}
.pricelist-table th{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:600;background:rgba(var(--accent-rgb),.06)}
.pricelist-table tbody tr:last-child td{border-bottom:0}
.pricelist-table--matrix td:not(:first-child),.pricelist-table td:last-child{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.pricelist-table--bundle .pricelist-work{line-height:1.55;min-width:min(56vw,480px)}
.pricelist-table--bundle td:not(:first-child){vertical-align:bottom;font-weight:700;color:var(--accent)}
.pricelist-cat td{text-align:center!important;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:rgba(var(--accent-rgb),.08);color:var(--accent);font-size:11px}
.pricelist-ol,.pricelist-work-list{margin:0;padding-left:1.2em}
.pricelist-ol li,.pricelist-work-list li{margin:.3em 0}
.pricelist-note-inline{font-size:12px;color:#9a9a94;margin:.5em 0 0}
.pricelist-notes{margin:18px 0 0;padding-left:1.2em;color:#9a9a94;font-size:13px;line-height:1.6}
.pricelist-notes li{margin-bottom:6px}
.pricelist-tagline{margin:14px 0 0;text-align:center;font-style:italic;font-weight:600;color:#b8b6ae;font-size:14px}
@media(max-width:720px){
  .pricelist-table th,.pricelist-table td{padding:10px 12px;font-size:13px}
}
"""
    if ".pricelist-hub" in css:
        css = re.sub(r"\n\.pricelist-hub.*?@media\(max-width:720px\)\{[^}]+\}\n", "\n", css, flags=re.S)
    if ".pricelist-page{padding-top:40px" not in css:
        css = css.rstrip() + "\n" + new_block + "\n"
    else:
        css = re.sub(
            r"\n\.pricelist-intro.*?@media\(max-width:720px\)\{[^}]+\}\n",
            "\n" + new_block,
            css,
            flags=re.S,
            count=1,
        )
    STYLES.write_text(css, encoding="utf-8")


def patch_services() -> None:
    html_text = SERVICES.read_text(encoding="utf-8")
    body = build_body()
    a = html_text.index("<!-- PRICELIST_BEGIN -->")
    b = html_text.index("<!-- PRICELIST_END -->") + len("<!-- PRICELIST_END -->")
    html_text = html_text[:a] + body.strip() + html_text[b:]
    import re as _re

    html_text = _re.sub(r'href="styles\.css\?v=\d+"', 'href="styles.css?v=84"', html_text, count=1)
    SERVICES.write_text(html_text, encoding="utf-8")


def main() -> None:
    patch_styles()
    patch_services()
    print("klyaksa services.html updated (tables)")


if __name__ == "__main__":
    main()
