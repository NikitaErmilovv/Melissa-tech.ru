#!/usr/bin/env python3
"""Klyaksa services.html — card panels (title, lead, price rows, photo, Подробнее)."""
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
        return "После осмотра"
    low = s.lower()
    if low in {"после осмотра", "договорная"}:
        return "После осмотра"
    if low.startswith("от"):
        chunk = s[2:].strip()
    elif " - " in s:
        chunk = s.split(" - ", 1)[0].strip()
    else:
        chunk = s
    digits = re.sub(r"\D", "", chunk.split()[0] if chunk else "")
    if not digits:
        return "После осмотра"
    return f"От {money(digits)} ₽"


def matrix_to_simple(rows: list[tuple[str, list[str]]]) -> list[tuple[str, str]]:
    return [(name, ot_from(prices)) for name, prices in rows]


def price_lines(rows: list[tuple[str, str]]) -> str:
    items: list[str] = []
    for name, label in rows:
        items.append(
            f'<li class="services-panel-row">'
            f'<span class="services-panel-name">{esc(name)}</span>'
            f'<span class="services-panel-price">{esc(label)}</span>'
            f"</li>"
        )
    long_cls = " services-panel-prices--long" if len(rows) > 8 else ""
    return f'<ul class="services-panel-prices{long_cls}">{"".join(items)}</ul>'


def tint_rows() -> list[tuple[str, list[str]]]:
    return [
        ("Задняя полусфера", ["от 7200", "от 8400", "от 9600"]),
        ("Передняя полусфера (светопропускаемость 75%–90%)", ["от 9600", "от 9600", "от 9600"]),
        ("Передняя полусфера (светопропускаемость 5%–50%)", ["от 7200", "от 8400", "от 8400"]),
        ("Заднее стекло", ["от 3600", "от 4800", "от 4800"]),
        ("Боковое заднее стекло (1 шт.)", ["от 1800", "от 2400", "от 2400"]),
        ("Лобовое стекло (75%–90%)", ["от 6000", "от 6000", "от 6000"]),
        ("Лобовое стекло (5%–50%)", ["от 4800", "от 4800", "от 6000"]),
        ("Переднее боковое стекло (75%–90%)", ["от 2000", "от 2760", "от 2760"]),
        ("Переднее боковое стекло (5%–50%)", ["от 1800", "от 2400", "от 2400"]),
        ("Форточка (1 шт.)", ["от 1800", "от 1800", "от 1800"]),
        ("Хамелеон — передняя полусфера", ["10000", "10000", "11000"]),
        ("Хамелеон — лобовое стекло", ["6000", "6000", "7000"]),
        ("Хамелеон — боковое стекло", ["2000", "2000", "3000"]),
        ("Растонирование заднего стекла", ["от 2700", "от 2700", "от 2700"]),
        ("Растонирование лобового стекла", ["от 2200", "от 2200", "от 2200"]),
        ("Растонирование бокового стекла (1 шт.)", ["от 700", "от 700", "от 700"]),
        ("Растонирование форточки (1 шт.)", ["от 400", "от 400", "от 400"]),
        ("Тонирование передней фары (пара)", ["от 7000", "от 7000", "от 8000"]),
        ("Тонирование задней фары (пара)", ["от 7000", "от 7000", "от 8000"]),
        ("Тонирование туманки (пара)", ["от 2000", "от 2000", "от 2000"]),
        ("Фотохром задней фары (пара)", ["от 8000", "от 8500", "от 8500"]),
        ("Фотохром передней фары (пара)", ["от 8000", "от 8500", "от 8500"]),
    ]


def antichrome_rows() -> list[tuple[str, str]]:
    raw = [
        ("Решетка радиатора", "от 15000"),
        ("Молдинги вокруг окон", "от 18000"),
        ("Молдинги багажника", "от 6000"),
        ("Молдинги дверей", "от 6000"),
        ("Молдинги бамперов", "от 8000"),
        ("Окантовка противотуманных фонарей", "от 8000"),
        ("Диффузор задний", "от 15000"),
        ("Диффузор передний", "от 12000"),
        ("Рейлинги", "от 18000"),
        ("Ручка двери (1 шт.)", "от 3000"),
        ("Зеркало (1 шт.)", "от 3500"),
        ("«Жабры» на крыле", "от 6000"),
    ]
    return [(a, ot_from(b)) for a, b in raw]


def services_panel(
    sid: str,
    title: str,
    lead: str,
    rows: list[tuple[str, str]],
    photo: str,
    more_href: str,
) -> str:
    return f"""<section class="section services-panel-section" id="{esc(sid)}">
  <article class="services-panel">
    <div class="services-panel-copy">
      <h2 class="services-panel-title">{esc(title)}</h2>
      <p class="services-panel-lead">{esc(lead)}</p>
      {price_lines(rows)}
      <a class="button button--outline services-panel-more" href="{esc(more_href)}">Подробнее</a>
    </div>
    <div class="services-panel-media">
      <img src="{esc(photo)}" alt="" loading="lazy" decoding="async">
    </div>
  </article>
</section>
"""


def build_intro() -> str:
    return """<section class="section pricelist-intro">
  <p class="intro services-intro">Базовые цены — от минимального объёма работ. Точная стоимость после осмотра автомобиля в студии.</p>
</section>
"""


def build() -> str:
    parts: list[str] = [build_intro()]

    parts.append(
        services_panel(
            "restore",
            "Реставрация сколов и царапин",
            "Локальная коррекция ЛКП, заливка сколов и работа с царапинами без перекраски всего элемента.",
            matrix_to_simple([
                ("Частичная полировка одного элемента", ["от 1500", "от 1500", "от 1500"]),
                ("Восстановительная полировка одного элемента", ["от 2500", "от 2500", "от 2500"]),
                ("Полировка фар (2 шт.)", ["от 2000", "от 2000", "от 2000"]),
                ("Удаление металлических вкраплений с ЛКП", ["от 3000", "от 3500", "от 4000"]),
            ]),
            "img/services/restore-scratches.jpg",
            "services/polish.html",
        )
    )

    parts.append(
        services_panel(
            "polish",
            "Полировка и восстановление внешнего вида",
            "Восстановительная полировка кузова целиком и восстановление глубины цвета.",
            matrix_to_simple([
                ("Восстановительная полировка кузова", ["28000 - 30000", "35000", "37000 - 40000"]),
            ]),
            "img/services/polish.jpg",
            "services/polish.html",
        )
    )

    ppf_all = matrix_to_simple(D.PPF_PACKAGES) + matrix_to_simple(D.PPF_PARTS)
    parts.append(
        services_panel(
            "wrap-films",
            "Оклейка кузова всеми видами плёнок",
            "Полиуретановая бронеплёнка, винил и декоративные решения — пакеты и поэлементно.",
            ppf_all,
            "img/services/wrap.jpg",
            "services/ppf.html",
        )
    )

    parts.append(
        services_panel(
            "antichrome",
            "Антихром",
            "Оклеиваем хром и декоративный пластик в цвет кузова или в чёрный мат / глянец.",
            antichrome_rows(),
            "img/services/antichrome.jpg",
            "services/antichrome.html",
        )
    )

    parts.append(
        services_panel(
            "salon-wrap",
            "Оклейка салона и защита экранов",
            "Защитная и декоративная плёнка в салоне, статическая плёнка на дисплеи.",
            [
                ("Защита дверных карт (1 шт.)", ot_from("2000")),
                ("Защита пластиковых порогов (1 шт.)", ot_from("1500")),
                ("Оклейка элементов интерьера", "После осмотра"),
                ("Защита экранов статической плёнкой", "После осмотра"),
            ],
            "img/services/salon-wrap.jpg",
            "contact.html",
        )
    )

    parts.append(
        services_panel(
            "windshield-ppf",
            "Защита лобового стекла полиуретановой плёнкой",
            "Прозрачная PPF на лобовое и смежные зоны — защита от сколов и трещин.",
            [
                ("Лобовое стекло (PPF / ориентир)", ot_from("от 4800")),
                ("Стойка лобового стекла (1 шт.)", ot_from("3000")),
                ("Тонировка лобового (75%–90%)", ot_from("от 6000")),
            ],
            "img/services/windshield.jpg",
            "services/tint.html",
        )
    )

    interior_rows = [
        ("Химчистка салона с разбором (полная)", ot_from("от 33000")),
        ("Химчистка ДВС и подкапотного пространства", ot_from(D.EXTRAS_BODY[0][1])),
        *matrix_to_simple(D.INTERIOR_ELEMENTS),
    ]
    parts.append(
        services_panel(
            "interior-engine",
            "Химчистка салона и двигателя",
            "Глубокая чистка салона с разбором, по элементам и обработка моторного отсека.",
            interior_rows,
            "img/services/interior.jpg",
            "services/interior.html",
        )
    )

    parts.append(
        services_panel(
            "sound",
            "Шумоизоляция",
            "Комплексная или точечная шумоизоляция салона, дверей, пола и багажника.",
            matrix_to_simple([
                ("Полная шумоизоляция", ["110000", "125000", "140000"]),
                ("Шумоизоляция дверей (5 шт.)", ["30000", "35000", "35000"]),
                ("Шумоизоляция пола и колёсных арок", ["45000", "50000", "55000"]),
                ("Шумоизоляция подкрылков (4 шт.)", ["25000", "30000", "30000"]),
                ("Шумоизоляция багажника", ["25000", "30000", "35000"]),
                ("Шумоизоляция крыши", ["35000", "40000", "45000"]),
                ("Шумоизоляция торпеды", ["45000", "45000", "45000"]),
            ]),
            "img/services/sound.jpg",
            "services/sound.html",
        )
    )

    parts.append(
        services_panel(
            "tint",
            "Тонировка",
            "Тонировочные и атермальные плёнки, хамелеон, растонирование и тонировка фар.",
            matrix_to_simple(tint_rows()),
            "img/services/tint.jpg",
            "services/tint.html",
        )
    )

    parts.append(
        services_panel(
            "wash",
            "Детейлинг-мойка",
            "Наружная, комплексная и предпродажная мойка по детейлинг-регламенту.",
            [
                ("Наружная мойка кузова", ot_from("1600")),
                ("Комплексная мойка", ot_from("3200")),
                ("Detailing мойка-1", ot_from("9000")),
                ("Detailing мойка-2", ot_from("11700")),
            ],
            "img/services/wash.jpg",
            "services/wash.html",
        )
    )

    parts.append(
        services_panel(
            "protect",
            "Защита кузова",
            "Керамика, жидкое стекло и многослойная восковая защита ЛКП.",
            matrix_to_simple([
                ("Покрытие кузова Q2 ONE EVO GYEON (12 мес.)", ["14000", "15000", "16000"]),
                ("Покрытие кузова Detail Basic Coat (керамика, 12 мес.)", ["13000", "14000", "15000"]),
                ("Покрытие кузова Detail Final Coat (жидкое стекло, 12 мес.)", ["13000", "14000", "15000"]),
                (
                    "«Американский восковой пирог» (глейз + силант + воск)",
                    ["10000", "12000", "14000"],
                ),
            ]),
            "img/services/protection.jpg",
            "services/protection.html",
        )
    )

    parts.append(
        services_panel(
            "detailing-care",
            "Детейлинг-уход: стёкла, кожа, пластик, ткань, диски",
            "Защитные и консервирующие составы для салона, стёкол и колёс.",
            matrix_to_simple([
                ("Aquapel — передняя полусфера + зеркала", ["4000", "4000", "4000"]),
                ("Chemical Russian Rain — передняя полусфера", ["1000", "1000", "1000"]),
                ("Chemical Russian Rain — по кругу", ["2000", "2200", "2300"]),
                ("Ceramic Pro Rain — передняя полусфера", ["3000", "3000", "3000"]),
                ("Ceramic Pro Rain — по кругу", ["4000", "4300", "4300"]),
                ("Gyeon Q2 Leather Shield (4 шт.)", ["5000", "6000", "6000"]),
                ("Кондиционер кожи LeTech", ["2000", "2000", "2000"]),
                ("Gyeon Q2 Preserve — пластик салона (до 3 мес.)", ["4000", "5000", "5000"]),
                ("Gyeon Q2 Fabric Coat (4 шт.)", ["4000", "4500", "4500"]),
                ("Gyeon Q2 Rim — диски", ["2000", "2500", "2500"]),
                ("Gyeon Q2 Tire — шины", ["от 1000", "от 1000", "от 1000"]),
            ]),
            "img/services/protection.jpg",
            "services/protection.html",
        )
    )

    parts.append(
        services_panel(
            "extras-salon",
            "Дополнительно — салон",
            "Точечные работы по салону при мойке и химчистке.",
            matrix_to_simple(D.EXTRAS_SALON),
            "img/services/interior.jpg",
            "services/interior.html",
        )
    )

    parts.append(
        services_panel(
            "extras-body",
            "Дополнительно — кузов",
            "Очистка, консервация и отдельные операции по кузову и колёсам.",
            matrix_to_simple(D.EXTRAS_BODY),
            "img/services/wash.jpg",
            "services/wash.html",
        )
    )

    return "<!-- PRICELIST_BEGIN -->\n" + "\n".join(parts) + "\n<!-- PRICELIST_END -->"


def patch_styles() -> None:
    block = """
.services-intro{max-width:640px;margin-bottom:8px}
.services-panel-section{padding-top:20px;padding-bottom:20px;scroll-margin-top:96px}
.services-panel-section:first-of-type{padding-top:12px}
.services-panel{
  display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,42%);
  gap:40px 48px;align-items:stretch;
  padding:36px 40px;border:1px solid rgba(255,255,255,.09);
  border-radius:16px;background:rgba(255,255,255,.02);
}
.services-panel-title{
  margin:0 0 14px;font-size:clamp(22px,3vw,30px);font-weight:700;letter-spacing:-.03em;line-height:1.2;color:#fff;
}
.services-panel-lead{margin:0 0 22px;font-size:14px;line-height:1.55;color:#9a9a94;max-width:52ch}
.services-panel-prices{list-style:none;margin:0 0 28px;padding:0}
.services-panel-row{
  display:flex;align-items:baseline;justify-content:space-between;gap:16px;
  padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08);
}
.services-panel-row:last-child{border-bottom:0}
.services-panel-prices--long{max-height:min(56vh,480px);overflow-y:auto;padding-right:6px;scrollbar-width:thin}
.services-panel-prices--long::-webkit-scrollbar{width:6px}
.services-panel-prices--long::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px}
.services-panel-name{font-size:14px;line-height:1.45;color:#e2e0d8;flex:1;min-width:0}
.services-panel-price{font-size:14px;font-weight:700;color:#fff;white-space:nowrap;font-variant-numeric:tabular-nums}
.button.button--outline{
  background:transparent;color:var(--accent);
  border:1px solid var(--accent);border-radius:999px;
  padding:12px 26px;font-size:13px;letter-spacing:.04em;font-weight:700;
}
.button.button--outline:hover{background:rgba(var(--accent-rgb),.1);color:var(--accent-hover)}
.services-panel-media{align-self:stretch;min-height:260px}
.services-panel-media img{
  width:100%;height:100%;min-height:260px;max-height:520px;
  object-fit:cover;border-radius:14px;display:block;
}
.pricelist-intro{padding-top:28px;padding-bottom:4px}
@media(max-width:860px){
  .services-panel{grid-template-columns:1fr;padding:28px 22px;gap:24px}
  .services-panel-media{order:-1;min-height:200px}
  .services-panel-media img{min-height:220px;max-height:320px}
  .services-panel-row{flex-direction:column;gap:6px;align-items:flex-start}
  .services-panel-price{align-self:flex-start}
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
    html_text = re.sub(r'href="styles\.css\?v=\d+"', 'href="styles.css?v=90"', html_text, count=1)
    SERVICES.write_text(html_text, encoding="utf-8")
    patch_styles()
    print("ok")


if __name__ == "__main__":
    main()
