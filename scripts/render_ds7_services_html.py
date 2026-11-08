#!/usr/bin/env python3
"""Regenerate ds7/services.html price table from data/ds7-pricelist.json."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "ds7/data/ds7-pricelist.json"
OUT = ROOT / "ds7/services.html"


def fmt_price(v: int | None, contract: bool = False) -> str:
    if contract or v is None:
        return "договорная"
    return f"{v:,}".replace(",", " ") + " ₽"


def fmt_from(prices: list[int] | None, contract: bool = False) -> str:
    if contract or not prices:
        return "договорная"
    return "от " + fmt_price(min(prices))


def build_table(services: list, classes: list[str]) -> str:
    head = "".join(f"<th>{c}</th>" for c in classes)
    rows = []
    for s in services:
        sid = s["id"]
        contract = s.get("contract", False)
        prices = s.get("prices")
        cells = "".join(
            f"<td>{fmt_price(p, contract) if prices else 'договорная'}</td>"
            for p in (prices or [None] * len(classes))
        )
        rows.append(
            f'<tr id="{sid}"><td><a href="#{sid}">{s["name"]}</a></td>{cells}</tr>'
        )
    return f"""<div class="pricelist-table-wrap">
<table class="pricelist-table pricelist-table--matrix">
<thead><tr><th>Перечень услуг</th>{head}</tr></thead>
<tbody>
{"".join(rows)}
</tbody>
</table>
</div>"""


def main() -> None:
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    services = payload["services"]
    classes = payload["classes"]

    rows_catalog = []
    for i, s in enumerate(services, 1):
        contract = s.get("contract", False)
        cost = fmt_from(s.get("prices"), contract)
        rows_catalog.append(
            f'<a class="service-row" id="row-{s["id"]}" href="#{s["id"]}">'
            f'<div class="idx">{i:02d}</div>'
            f"<div><h3>{s['name']}</h3>"
            f'<p class="service-lead">Цены зависят от класса автомобиля — см. таблицу ниже.</p></div>'
            f'<div class="cost">{cost}</div></a>'
        )

    catalog = "\n".join(rows_catalog)
    table = build_table(services, classes)

    html = OUT.read_text(encoding="utf-8")
    start = html.find('<div class="service-list">')
    end = html.find("</section>", start)
    section_end = html.find('<section class="process', start)
    new_block = f"""<section class="section pricelist-page" id="catalog">
  <div class="kicker">КАТАЛОГ</div>
  <p class="intro" style="max-width:720px;margin-bottom:28px">{payload['note']}</p>
  <motion-placeholder />
  <div class="service-list service-list--ds7">
{catalog}
  </div>
</section>

<section class="section pricelist-page" id="prices">
  <div class="kicker">ПРАЙС</div>
  <p class="intro" style="max-width:820px;margin-bottom:20px">Шесть классов авто — как в студии: компактные, седан, бизнес, кроссовер, внедорожник, микроавтобус.</p>
  <div class="pricelist-vehicle-key" aria-hidden="true">
    <span>Компакт</span><span>Средний</span><span>Бизнес</span><span>Кроссовер</span><span>Внедорожник</span><span>Микроавтобус</span>
  </div>
  {table}
  <ul class="pricelist-notes">
    <li>Позиции «договорная» — считаем после осмотра и согласования объёма.</li>
    <li>Запись по телефону <a href="tel:+79108724004">+7 (910) 872-40-04</a>.</li>
  </ul>
</section>

"""
    # Replace catalog section through end of first section after subpage hero
    marker = '<section class="section">'
    idx = html.find(marker)
    if idx == -1:
        raise SystemExit("section marker missing")
    idx2 = html.find('<section class="process', idx)
    html = html[:idx] + new_block + html[idx2:]
    OUT.write_text(html, encoding="utf-8")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
