from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
m = json.loads((ROOT / "img/works/media-manifest.json").read_text(encoding="utf-8"))
by = {}
for x in m:
    by.setdefault(x["slug"], []).append(x)

steklo = by.get("05-06-steklo", [])


def img_cell(path):
    return (
        f'<a class="g g--media" href="{path}" data-lightbox="works">'
        f'<img src="{path}" alt="" loading="lazy" decoding="async"></a>'
    )


def cells(items):
    out = []
    for it in items:
        if it["kind"] == "video":
            out.append(
                f'<div class="g g--video"><video src="{it["path"]}" controls playsinline preload="metadata"></video></div>'
            )
        else:
            out.append(img_cell(it["path"]))
    return "\n    ".join(out)


def section(num, title, items):
    if not items:
        return ""
    gal = cells(items)
    return f"""<section class="section work-block">
  <div class="section-head">
    <div><div class="kicker">{num}</div><h2>{title}</h2></div>
  </div>
  <div class="gallery gallery--portfolio">
    {gal}
  </div>
</section>"""


parts = []

parts.append(section("01", "Установка защитной плёнки", by.get("01-zashchitnaya-plenka", [])))
parts.append(section("02", "Замена цвета", by.get("02-zamena-tsveta", [])))
parts.append(section("03", "Антихром", by.get("03-antihrom", [])))
parts.append(section("04", "Тонировка стёкол", by.get("04-tonirovka", [])))
parts.append(section("05", "Атермальная плёнка", steklo[:2]))
parts.append(section("06", "Бронирование лобового стекла", steklo[2:]))
parts.append(section("07", "Шумоизоляция", by.get("07-shumoisolyatsiya", [])))
parts.append(section("08", "Полировка", by.get("08-polirovka", [])))
parts.append(section("09", "Керамика", by.get("09-zashchitnye-sostavy", [])))
parts.append(section("10", "Ремонт сколов и царапин без покраски", by.get("10-remont-skolov", [])))

(ROOT / "_gallery_body.html").write_text("\n".join(p for p in parts if p), encoding="utf-8")
print("ok", sum(1 for p in parts if p))
