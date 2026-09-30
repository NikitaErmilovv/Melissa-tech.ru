#!/usr/bin/env python3
"""Emit gallery service blocks from manifest + legacy assets."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "img/media-manifest.json").read_text(encoding="utf-8"))

LEGACY: dict[str, list[tuple[str, str]]] = {
    "Установка защитной плёнки": [
        ("image", "img/works/porsche-white.png"),
        ("image", "img/works/cayenne-black.png"),
    ],
    "Замена цвета": [
        ("image", "img/works/camry-black.png"),
        ("image", "img/works/chery-grey.png"),
        ("image", "img/works/landcruiser-black.png"),
    ],
    "Антихром": [("image", "img/works/audi-grey.png")],
    "Тонировка стёкол": [("image", "img/works/portfolio/gallery-03.jpg")],
    "Полировка": [
        ("image", "img/works/sonata-polish.jpg"),
        ("image", "img/works/before-after/hood-after.jpg"),
        ("image", "img/works/before-after/headlight-after.jpg"),
    ],
    "Ремонт сколов и царапин без покраски": [
        ("image", "img/works/portfolio/gallery-02.jpg"),
    ],
}

ORDER = [
    "Установка защитной плёнки",
    "Замена цвета",
    "Антихром",
    "Тонировка стёкол",
    "Атермальная плёнка",
    "Бронирование лобового стекла",
    "Шумоизоляция",
    "Полировка",
    "Нанесение защитных составов",
    "Ремонт сколов и царапин без покраски",
]

by_title = {s["title"]: s["items"] for s in manifest.get("sections", [])}


def item_html(kind: str, path: str, wide: bool = False) -> str:
    cls = "g wide" if wide else "g"
    if kind == "video":
        return (
            f'      <div class="{cls} g--video">'
            f'<video class="gallery-video" src="{path}" controls playsinline preload="metadata"></video></div>'
        )
    return f'      <div class="{cls}" style="background-image:url(\'{path}\')" role="img" aria-label=""></div>'


blocks = []
for i, title in enumerate(ORDER):
    items = list(by_title.get(title, []))
    for kind, path in LEGACY.get(title, []):
        if not any(x.get("path") == path for x in items):
            items.append({"kind": kind, "path": path})
    if not items:
        continue
    lines = [
        '  <div class="gallery-block">',
        '    <div class="kicker">УСЛУГА</div>',
        f"    <h3>{title}</h3>",
        '    <div class="gallery gallery--portfolio">',
    ]
    for j, it in enumerate(items):
        wide = j == 0 and it["kind"] == "image"
        lines.append(item_html(it["kind"], it["path"], wide=wide))
    lines.extend(["    </div>", "  </div>", ""])
    blocks.append("\n".join(lines))

reviews = """  <div class="gallery-block">
    <div class="kicker">ОТЗЫВЫ</div>
    <h3>Наши отзывы</h3>
    <div class="gallery gallery--portfolio">
      <div class="g wide" style="background-image:url('img/works/portfolio/gallery-01.jpg')" role="img" aria-label="Отзыв клиента"></div>
      <div class="g" style="background-image:url('img/works/portfolio/gallery-02.jpg')" role="img" aria-label="Отзыв клиента"></div>
      <div class="g tall" style="background-image:url('img/works/portfolio/gallery-03.jpg')" role="img" aria-label="Отзыв клиента"></div>
      <div class="g" style="background-image:url('img/works/portfolio/gallery-04.jpg')" role="img" aria-label="Отзыв клиента"></div>
      <div class="g" style="background-image:url('img/works/portfolio/gallery-05.jpg')" role="img" aria-label="Отзыв клиента"></div>
      <div class="g" style="background-image:url('img/works/2gis-1.jpg')" role="img" aria-label="Скриншот отзыва 2ГИС"></div>
      <div class="g" style="background-image:url('img/works/2gis-review-1.jpg')" role="img" aria-label="Скриншот отзыва 2ГИС"></div>
      <div class="g" style="background-image:url('img/works/0cab2266-aeb2-4f7c-ad19-99d92179da99.jpg')" role="img" aria-label="Фото от клиента"></div>
      <div class="g" style="background-image:url('img/works/9abecc95-b7ba-42ab-a823-b14c09ba0044.jpg')" role="img" aria-label="Фото от клиента"></div>
    </div>
  </div>
"""

out = reviews + "\n" + "\n".join(blocks)
(ROOT / "scripts/gallery-body.fragment.html").write_text(out, encoding="utf-8")
print("Wrote gallery fragment", len(blocks), "sections")
