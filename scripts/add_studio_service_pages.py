#!/usr/bin/env python3
"""Add per-service HTML pages to the three local studio prototypes (D2-style)."""

from __future__ import annotations

import re
from pathlib import Path

from scaffold_three_d2_studios import CSS_V, SITES, firm_url, footer, map_block

ROOT = Path(__file__).resolve().parents[1]

# slug -> extra fields per site (order matches SITES[].services)
SERVICE_META: dict[str, list[dict[str, str]]] = {
    "klyaksa-tuning-noyabrsk": [
        {"slug": "wash", "home_img": "img/works/home/wash.jpg"},
        {"slug": "polish", "home_img": "img/works/home/polish.jpg"},
        {"slug": "interior", "home_img": "img/works/home/interior.jpg"},
        {"slug": "protection", "home_img": "img/works/home/protection.jpg"},
        {"slug": "ppf", "home_img": "img/works/home/ppf.jpg"},
        {"slug": "antichrome", "home_img": "img/works/incoming/klyaksa/02-studio-interior-work.jpg"},
        {"slug": "tint", "home_img": "img/works/incoming/klyaksa/09-tint-kia-sportage.jpg"},
        {"slug": "sound", "home_img": "img/works/home/sound.jpg"},
    ],
    "mir-tonirovki-tobolsk": [
        {"slug": "tint", "home_img": "img/works/home/tint.jpg"},
        {"slug": "wrap", "home_img": "img/works/home/wrap.jpg"},
        {"slug": "polish", "home_img": "img/works/home/polish.jpg"},
        {"slug": "ppf", "home_img": "img/works/home/ppf.jpg"},
        {"slug": "sound", "home_img": "img/works/home/sound.jpg"},
        {"slug": "anticor", "home_img": "img/works/home/anticor.jpg"},
    ],
    "imperiya-avtokompleks-chelyabinsk": [
        {"slug": "wash", "home_img": "img/works/home/wash.jpg"},
        {"slug": "tires", "home_img": "img/works/home/tires.jpg"},
        {"slug": "interior", "home_img": "img/works/home/interior.jpg"},
        {"slug": "tire-storage", "home_img": "img/works/home/storage.jpg"},
        {"slug": "body", "home_img": "img/works/home/body.jpg"},
        {"slug": "paint", "home_img": "img/works/home/paint.jpg"},
        {"slug": "detailing", "home_img": "img/works/incoming/imperiya/03-bmw-wash-bay.jpg"},
        {"slug": "anticor", "home_img": "img/works/incoming/imperiya/11-landcruiser-v8-engine.jpg"},
        {"slug": "minor-repair", "home_img": "img/works/incoming/imperiya/06-compression-test.jpg"},
    ],
}

STAGE_BLURBS: dict[str, list[tuple[str, str]]] = {
    "default": [
        ("Осмотр и согласование", "Оцениваем состояние автомобиля, обсуждаем задачу и фиксируем объём работ."),
        ("Подготовка", "Подготавливаем поверхности и рабочую зону, подбираем материалы под ваш случай."),
        ("Выполнение", "Делаем работу по согласованному регламенту с контролем качества на каждом этапе."),
        ("Выдача", "Показываем результат, даём рекомендации по уходу и оформляем гарантийные условия, если они предусмотрены."),
    ],
}


def nav_sub(site: dict) -> str:
    return f"""<nav class="site-nav">
  <div class="logo"><a href="../index.html"><span class="logo-mark">{site['logo_mark']}</span><span class="logo-word">{site['logo_word']}</span></a></div>
  <div class="links"><a href="../services.html">УСЛУГИ</a><a href="../gallery.html">РАБОТЫ</a><a href="../about.html">О НАС</a><a href="../contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:{site['phone_tel']}">{site['phone_display']}</a>
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
</nav>"""


def h1_html(title: str) -> str:
    parts = title.split(" ", 1)
    if len(parts) == 2 and len(parts[0]) <= 12:
        return f"{parts[0].upper()}<br><span class=\"accent\">{parts[1].upper()}</span>"
    return f"<span class=\"accent\">{title.upper()}</span>"


def timeline_html(steps: list[tuple[str, str]]) -> str:
    items = []
    for i, (h, p) in enumerate(steps, 1):
        side = "left" if i % 2 == 1 else "right"
        items.append(
            f'<div class="service-timeline-item service-timeline-item--{side}">'
            f'<div class="service-timeline-content"><h3>{h}</h3><p>{p}</p></div>'
            f'<span class="service-timeline-dot" aria-hidden="true">{i}</span></div>'
        )
    inner = "\n".join(items)
    return (
        '<section class="section service-page service-page--stages">\n'
        '  <h2 class="service-stages-title">Этапы работ</h2>\n'
        '  <div class="service-timeline"><div class="service-timeline-line" aria-hidden="true"></div>\n'
        f"{inner}\n"
        "  </div>\n"
        "</section>\n"
    )


def service_page(site: dict, idx: int, slug: str, title: str, lead: str, cost: str, home_img: str, all_slugs: list[tuple[str, str]]) -> str:
    steps = STAGE_BLURBS.get(slug, STAGE_BLURBS["default"])
    nav_links = "".join(
        f'<a href="{s}.html">{t}</a>' for s, t in all_slugs if s != slug
    )
    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{title} — {site['name']}</title>
<link rel="stylesheet" href="../styles.css?v={CSS_V}">
</head>
<body>
{nav_sub(site)}

<section class="subpage-hero subpage-hero--service">
  <div class="kicker">{idx:02d} / УСЛУГА</div>
  <h1>{h1_html(title)}</h1>
  <p>{lead}</p>
  <div class="actions" style="margin-top:28px">
    <a class="button" href="tel:{site['phone_tel']}">ЗАПИСАТЬСЯ</a>
  </div>
</section>

{timeline_html(steps)}

<section class="section service-page service-page--price" id="price">
  <div class="service-price-title-wrap"><h2 class="service-price-title">СТОИМОСТЬ</h2></div>
  <p class="service-stages-lead">Ориентир: <strong style="color:var(--accent)">{cost}</strong>. Точную цену назовём после осмотра автомобиля в студии.</p>
  <div class="actions service-page-actions">
    <a class="button" href="tel:{site['phone_tel']}">ПОЗВОНИТЬ</a>
    <a class="button dark" href="tel:{site['phone_tel']}">ЗАПИСАТЬСЯ</a>
  </div>
</section>

<section class="section service-page-nav">
  <div class="kicker">ДРУГИЕ УСЛУГИ</div>
  <div class="service-page-links">{nav_links}</div>
</section>

<div class="site-bottom">
{map_block(site)}
{footer(site)}
</div>
<script src="../nav.js"></script>
</body>
</html>
"""


def service_rows_linked(site: dict, slugs: list[str]) -> str:
    rows = []
    for i, ((title, desc, cost), slug) in enumerate(zip(site["services"], slugs, strict=True), 1):
        rows.append(
            f'    <a class="service-row" href="services/{slug}.html" id="svc-{i:02d}">'
            f'<div class="idx">{i:02d}</div>'
            f"<div><h3>{title}</h3><div class=\"service-desc\"><p class=\"service-lead\">{desc}</p></div></div>"
            f'<div class="cost">{cost}</div></a>'
        )
    return "\n".join(rows)


def patch_index_strip(site: dict, dest: Path, slugs: list[str], meta: list[dict]) -> None:
    path = dest / "index.html"
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    out: list[str] = []
    tile_i = 0
    in_strip = False
    for line in lines:
        if "photo-strip--home" in line:
            in_strip = True
        if in_strip and line.strip().startswith("<a class=\"photo") and tile_i < 6:
            slug = slugs[tile_i]
            line = re.sub(r'href="[^"]*"', f'href="services/{slug}.html"', line, count=1)
            tile_i += 1
        if in_strip and line.strip() == "</div>" and tile_i >= 6:
            in_strip = False
        out.append(line)
    path.write_text("\n".join(out) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")


def write_services_html(site: dict, dest: Path, slugs: list[str]) -> None:
    from scaffold_three_d2_studios import head

    body = f"""{head(site, "Услуги")}

<section class="subpage-hero">
  <div class="kicker">01 / УСЛУГИ</div>
  <h1>РАБОТАЕМ<br>С КАЖДОЙ<br><span class="accent">ДЕТАЛЬЮ</span></h1>
  <p>{site['name']} — {site['city']}. Финальная стоимость после осмотра.</p>
</section>

<section class="section">
  <div class="service-list">
{service_rows_linked(site, slugs)}
  </div>
</section>

<div class="site-bottom">
{map_block(site)}
{footer(site)}
</div>
<script src="nav.js"></script>
</body>
</html>
"""
    (dest / "services.html").write_text(body, encoding="utf-8")


def append_css(dest: Path) -> None:
    css = dest / "styles.css"
    extra = """
.service-list a.service-row{display:grid}
.subpage-hero--service{min-height:min(72vh,640px);display:flex;flex-direction:column;justify-content:flex-end}
@media(max-width:800px){.subpage-hero--service{min-height:auto}}
"""
    text = css.read_text(encoding="utf-8")
    text = re.sub(
        r"\n\.service-page-hero-photo[^\n]*\n\.service-page-hero-photo-inner\{[^}]+\}\n?",
        "\n",
        text,
    )
    if "subpage-hero--service" not in text:
        css.write_text(text + extra, encoding="utf-8")
    else:
        css.write_text(text, encoding="utf-8")


def process_site(site: dict) -> None:
    dest = ROOT / site["slug"]
    meta = SERVICE_META[site["slug"]]
    if len(meta) != len(site["services"]):
        raise ValueError(f"slug count mismatch for {site['slug']}")

    slugs = [m["slug"] for m in meta]
    svc_dir = dest / "services"
    svc_dir.mkdir(exist_ok=True)

    pairs = [(m["slug"], t) for m, (t, _, _) in zip(meta, site["services"], strict=True)]

    for i, (m, (title, lead, cost)) in enumerate(zip(meta, site["services"], strict=True), 1):
        html = service_page(site, i, m["slug"], title, lead, cost, m["home_img"], pairs)
        (svc_dir / f"{m['slug']}.html").write_text(html, encoding="utf-8")

    write_services_html(site, dest, slugs)
    patch_index_strip(site, dest, slugs, meta)
    append_css(dest)
    print("OK", site["slug"], len(slugs), "service pages")


def main() -> None:
    for site in SITES:
        process_site(site)


if __name__ == "__main__":
    main()
