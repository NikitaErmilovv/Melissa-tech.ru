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
    return f'<ul class="services-panel-prices">{"".join(items)}</ul>'


def media_single(photo: str) -> str:
    return (
        f'<div class="services-panel-media">'
        f'<img src="{esc(photo)}" alt="" loading="lazy" decoding="async">'
        f"</div>"
    )


def media_subphotos(items: list[tuple[str, str]]) -> str:
    figs: list[str] = []
    for src, caption in items:
        figs.append(
            f'<figure class="services-panel-subphoto">'
            f'<img src="{esc(src)}" alt="{esc(caption)}" loading="lazy" decoding="async">'
            f"<figcaption>{esc(caption)}</figcaption>"
            f"</figure>"
        )
    body = "".join(figs)
    return f'<div class="services-panel-media services-panel-media--subphotos">{body}</div>'


def services_panel(
    sid: str,
    title: str,
    lead: str,
    rows: list[tuple[str, str]],
    more_href: str,
    *,
    photo: str | None = None,
    media_html: str | None = None,
) -> str:
    if media_html is None:
        media_html = media_single(photo or "img/services/wrap.jpg")
    return f"""<section class="section services-panel-section" id="{esc(sid)}">
  <article class="services-panel">
    <div class="services-panel-copy">
      <h2 class="services-panel-title">{esc(title)}</h2>
      <p class="services-panel-lead">{esc(lead)}</p>
      {price_lines(rows)}
      <a class="button button--outline services-panel-more" href="{esc(more_href)}">Подробнее</a>
    </div>
    {media_html}
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
            "Локальная коррекция ЛКП, восстановление сколов и царапин, полировка кузова и фар.",
            [
                ("Реставрация сколов и царапин (элемент)", ot_from("от 1500")),
                ("Восстановительная полировка одного элемента", ot_from("от 2500")),
                ("Полировка кузова", ot_from(["28000 - 30000", "35000", "37000 - 40000"])),
                ("Полировка фар (пара)", ot_from("от 2000")),
            ],
            "services/polish.html",
            photo="img/services/polish.jpg",
        )
    )

    ppf_top = matrix_to_simple(D.PPF_PACKAGES)[:4] + matrix_to_simple(D.PPF_PARTS)[:2]
    parts.append(
        services_panel(
            "wrap-films",
            "Оклейка кузова всеми видами плёнок",
            "Полиуретановая бронеплёнка, винил и декоративные решения — пакеты и поэлементно.",
            ppf_top,
            "services/ppf.html",
            photo="img/services/wrap.jpg",
        )
    )

    parts.append(
        services_panel(
            "antichrome",
            "Антихром",
            "Оклеиваем хром и декоративный пластик в цвет кузова или в чёрный мат / глянец.",
            [
                ("Решётка радиатора", ot_from("от 15000")),
                ("Молдинги вокруг окон", ot_from("от 18000")),
                ("Молдинги дверей", ot_from("от 6000")),
                ("Зеркало (1 шт.)", ot_from("от 3500")),
            ],
            "services/antichrome.html",
            photo="img/services/antichrome.jpg",
        )
    )

    parts.append(
        services_panel(
            "salon-wrap",
            "Оклейка салона",
            "Защитная и декоративная плёнка на элементах интерьера.",
            [
                ("Защита дверных карт (1 шт.)", ot_from("2000")),
                ("Защита пластиковых порогов (1 шт.)", ot_from("1500")),
                ("Оклейка элементов интерьера", "После осмотра"),
            ],
            "contact.html",
            photo="img/services/salon-wrap.jpg",
        )
    )

    parts.append(
        services_panel(
            "windshield-ppf",
            "Защита лобового стекла полиуретановой плёнкой",
            "Прозрачная PPF на лобовое и смежные зоны — защита от сколов и трещин.",
            [
                ("Лобовое стекло", ot_from("от 4800")),
                ("Стойка лобового стекла (1 шт.)", ot_from("3000")),
                ("Тонировка лобового (светопропускаемость 75–90%)", ot_from("от 6000")),
            ],
            "services/ppf.html",
            photo="img/services/windshield.jpg",
        )
    )

    parts.append(
        services_panel(
            "screen-wrap",
            "Защита экранов статической плёнкой",
            "Статическая плёнка на мультимедиа и дисплеи — защита от царапин и пыли.",
            [
                ("Защита экранов статической плёнкой", "После осмотра"),
            ],
            "contact.html",
            photo="img/services/salon-wrap.jpg",
        )
    )

    interior_pick = matrix_to_simple(D.INTERIOR_ELEMENTS)[:3]
    parts.append(
        services_panel(
            "interior",
            "Химчистка салона",
            "Полная химчистка с разбором и чистка салона по элементам.",
            [
                ("Химчистка салона с разбором", ot_from("от 33000")),
                *interior_pick,
            ],
            "services/interior.html",
            photo="img/services/interior.jpg",
        )
    )

    parts.append(
        services_panel(
            "engine",
            "Химчистка двигателя",
            "Чистка ДВС и подкапотного пространства, защитная консервация.",
            [
                ("Химчистка ДВС и моторного отсека", ot_from(D.EXTRAS_BODY[0][1])),
                ("Чистка насадки глушителя", ot_from("100")),
            ],
            "services/interior.html",
            photo="img/services/engine.png",
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
                ("Шумоизоляция пола и арок", ["45000", "50000", "55000"]),
                ("Шумоизоляция багажника", ["25000", "30000", "35000"]),
            ]),
            "services/sound.html",
            photo="img/services/sound.jpg",
        )
    )

    parts.append(
        services_panel(
            "tint",
            "Тонировка",
            "Тонировочные и атермальные плёнки, хамелеон, тонировка фар.",
            matrix_to_simple([
                ("Задняя полусфера", ["от 7200", "от 8400", "от 9600"]),
                ("Передняя полусфера", ["от 9600", "от 9600", "от 9600"]),
                ("Боковое стекло (1 шт.)", ["от 1800", "от 2400", "от 2400"]),
                ("Тонирование фары (пара)", ["от 7000", "от 7000", "от 8000"]),
            ]),
            "services/tint.html",
            photo="img/services/tint.jpg",
        )
    )

    parts.append(
        services_panel(
            "wash",
            "Детейлинг мойка",
            "Наружная, комплексная и предпродажная мойка по детейлинг-регламенту.",
            [
                ("Наружная мойка кузова", ot_from("1600")),
                ("Комплексная мойка", ot_from("3200")),
                ("Detailing мойка-1", ot_from("9000")),
                ("Detailing мойка-2", ot_from("11700")),
            ],
            "services/wash.html",
            photo="img/services/wash.jpg",
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
.services-panel-media--subphotos{display:flex;flex-direction:column;gap:12px;min-height:auto}
.services-panel-subphoto{margin:0;display:flex;flex-direction:column;flex:1;min-height:0}
.services-panel-media--subphotos .services-panel-subphoto img{
  flex:1;width:100%;min-height:120px;max-height:170px;object-fit:cover;border-radius:12px;
}
.services-panel-subphoto figcaption{
  margin:6px 0 0;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;color:#9a9a94;
}
.pricelist-intro{padding-top:28px;padding-bottom:4px}
@media(max-width:860px){
  .services-panel{grid-template-columns:1fr;padding:28px 22px;gap:24px}
  .services-panel-media{order:-1;min-height:200px}
  .services-panel-media img{min-height:220px;max-height:320px}
  .services-panel-media--subphotos .services-panel-subphoto img{min-height:100px;max-height:140px}
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
    html_text = re.sub(r'href="styles\.css\?v=\d+"', 'href="styles.css?v=92"', html_text, count=1)
    SERVICES.write_text(html_text, encoding="utf-8")
    patch_styles()
    print("ok")


if __name__ == "__main__":
    main()
