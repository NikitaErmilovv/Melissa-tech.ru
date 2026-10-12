# -*- coding: utf-8 -*-
"""Replace site photos (except hero) with D2_detailing set and rebrand to 2GIS org."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(r"C:\Users\Никита\Work\Фото для прототипов\D2_detailing")
DST = ROOT / "img" / "works" / "d2"
HERO_KEEP = "img/works/hero-raptor.jpg"

FIRM_OLD = "70000001033514700"
FIRM_NEW = "70000001061278508"
FIRM_URL = f"https://2gis.ru/novosibirsk/firm/{FIRM_NEW}"
MAP_PT = "55.026031,82.943016"

# Keep phone — same as 2GIS (+79130052315)
# Address stays Покатная 30


def copy_photos() -> list[str]:
    DST.mkdir(parents=True, exist_ok=True)
    files = sorted(
        [p for p in SRC.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}],
        key=lambda p: p.name.lower(),
    )
    if not files:
        raise SystemExit(f"No photos in {SRC}")
    out = []
    for i, src in enumerate(files, 1):
        name = f"d2-{i:02d}{src.suffix.lower()}"
        shutil.copy2(src, DST / name)
        out.append(f"img/works/d2/{name}")
    print(f"copied {len(out)} photos -> {DST}")
    return out


def collect_image_urls(text: str) -> list[str]:
    urls = []
    for m in re.finditer(r"(?:url\(['\"]?([^'\")\s]+)['\"]?\)|src=['\"]([^'\"]+)['\"]|href=['\"]([^'\"]+\.(?:jpg|jpeg|png|webp)(?:\?[^'\"]*)?)['\"])", text, re.I):
        u = m.group(1) or m.group(2) or m.group(3)
        if not u:
            continue
        if u.startswith("http") or u.startswith("data:"):
            continue
        if "hero-raptor" in u:
            continue
        if any(u.lower().endswith(ext) or f"{ext}?" in u.lower() for ext in (".jpg", ".jpeg", ".png", ".webp")):
            urls.append(u)
    # also background-image inline without url() already covered
    return urls


def replace_images_in_text(text: str, photos: list[str], counter: list[int]) -> str:
    def next_photo() -> str:
        p = photos[counter[0] % len(photos)]
        counter[0] += 1
        return p

    def repl_url(m: re.Match) -> str:
        full = m.group(0)
        u = m.group(1)
        if "hero-raptor" in u:
            return full
        if u.startswith("http") or "static.maps.2gis" in u:
            return full
        if not re.search(r"\.(jpg|jpeg|png|webp)(\?|$)", u, re.I):
            return full
        # keep path style relative as in original (../img or img)
        new = next_photo()
        if u.startswith("../"):
            new = "../" + new
        return full.replace(u, new, 1)

    text = re.sub(r"url\(['\"]?([^'\")\s]+)['\"]?\)", repl_url, text)
    text = re.sub(r"""(src=["'])([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)(["'])""", lambda m: m.group(1) + (("../" + next_photo()) if m.group(2).startswith("../") else next_photo()) if "hero-raptor" not in m.group(2) and not m.group(2).startswith("http") else m.group(0), text, flags=re.I)
    # gallery href to images
    text = re.sub(
        r"""(href=["'])([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)(["'])""",
        lambda m: (
            m.group(0)
            if ("hero-raptor" in m.group(2) or m.group(2).startswith("http"))
            else m.group(1)
            + (("../" + next_photo()) if m.group(2).startswith("../") else next_photo())
            + m.group(3)
        ),
        text,
        flags=re.I,
    )
    return text


def rebrand_text(text: str) -> str:
    # firm id / map
    text = text.replace(FIRM_OLD, FIRM_NEW)
    text = text.replace("55.026024,82.942959", MAP_PT)
    text = text.replace("c=55.026024,82.942959", f"c={MAP_PT}")
    text = text.replace("pt=55.026024,82.942959", f"pt={MAP_PT}")

    # brand name patterns
    text = text.replace("<span>ДЕЛАЙ</span>КУЗОВ", "D2<span>_detailing</span>")
    text = text.replace("Делайкузов", "D2_detailing")
    text = text.replace("делайкузов", "d2_detailing")
    text = text.replace("ДЕЛАЙКУЗОВ", "D2_detailing")
    # titles like "— Делайкузов" already covered
    # hero eyebrow / copy tweaks if still old brand
    text = re.sub(r"ДЕТЕЙЛИНГ\s*·\s*КУЗОВ\s*·\s*НОВОСИБИРСК", "ДЕТЕЙЛИНГ · НОВОСИБИРСК", text)
    text = text.replace("КУЗОВНОЙ РЕМОНТ · НОВОСИБИРСК", "ДЕТЕЙЛИНГ · НОВОСИБИРСК")

    # stats from 2GIS
    text = text.replace("<b>52</b><span>ОЦЕНКИ · 2ГИС</span>", "<b>219</b><span>ОЦЕНКИ · 2ГИС</span>")
    text = text.replace("<b>46</b><span>ОТЗЫВОВ</span>", "<b>198</b><span>ОТЗЫВОВ</span>")
    text = re.sub(r'(id="stat-rating">)[0-9.]+', r"\g<1>5.0", text)
    text = text.replace("<b>4.9</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span>", '<b id="stat-rating">5.0</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span>')

    return text


def process_file(path: Path, photos: list[str], counter: list[int]) -> bool:
    raw = path.read_bytes()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("utf-8-sig")
    original = text
    if path.suffix.lower() in {".html", ".css", ".js", ".md", ".txt"}:
        text = rebrand_text(text)
    if path.suffix.lower() in {".html", ".css"}:
        text = replace_images_in_text(text, photos, counter)
    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def rebuild_gallery(photos: list[str]) -> None:
    gallery = ROOT / "gallery.html"
    if not gallery.exists():
        return
    text = gallery.read_text(encoding="utf-8")
    # replace portfolio gallery block images
    block = []
    for p in photos:
        block.append(
            f'    <a class="g g--media" href="{p}" data-lightbox="studio">'
            f'<img src="{p}" alt="" loading="lazy" decoding="async"></a>'
        )
    new_gallery = (
        '  <div class="gallery gallery--portfolio">\n'
        + "\n".join(block)
        + "\n  </div>"
    )
    text2, n = re.subn(
        r'<div class="gallery gallery--portfolio">[\s\S]*?</div>',
        new_gallery,
        text,
        count=1,
    )
    if n:
        gallery.write_text(rebrand_text(text2), encoding="utf-8", newline="\n")
        print("gallery rebuilt", n)
    else:
        gallery.write_text(rebrand_text(text), encoding="utf-8", newline="\n")
        print("gallery rebrand only")


def update_server() -> None:
    sp = ROOT / "server.py"
    t = sp.read_text(encoding="utf-8")
    t = t.replace(FIRM_OLD, FIRM_NEW)
    t = t.replace("DelaikuzovSite", "D2DetailingSite")
    sp.write_text(t, encoding="utf-8", newline="\n")
    print("server.py firm updated")


def update_gen_script() -> None:
    gen = ROOT / "scripts" / "gen_service_pages.py"
    if not gen.exists():
        return
    t = gen.read_text(encoding="utf-8")
    t = rebrand_text(t)
    # logo in generator
    t = t.replace("<span>ДЕЛАЙ</span>КУЗОВ", "D2<span>_detailing</span>")
    t = t.replace("Делайкузов", "D2_detailing")
    t = t.replace(FIRM_OLD, FIRM_NEW)
    t = t.replace("55.026024,82.942959", MAP_PT)
    gen.write_text(t, encoding="utf-8", newline="\n")
    print("gen_service_pages.py updated")


def main() -> None:
    photos = copy_photos()
    counter = [0]
    changed = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if "vendor" in path.parts or "models" in path.parts or "scripts" in path.parts and path.suffix == ".py" and path.name.startswith("_"):
            if path.suffix == ".py" and path.name.startswith("_"):
                continue
        if path.suffix.lower() not in {".html", ".css", ".js", ".md", ".txt", ".py"}:
            continue
        if "vendor" in path.parts:
            continue
        if path.name in {"rebrand_d2.py", "update_kuzov_paint_prices.py"}:
            continue
        if process_file(path, photos, counter):
            changed.append(str(path.relative_to(ROOT)))
    rebuild_gallery(photos)
    update_server()
    update_gen_script()
    # ensure hero CSS still points to raptor
    css = ROOT / "styles.css"
    css_t = css.read_text(encoding="utf-8")
    if "hero-raptor.jpg" not in css_t:
        print("WARNING: hero image missing from CSS")
    else:
        print("hero kept:", HERO_KEEP)
    print("files changed:", len(changed))
    print("photo assignments used:", counter[0])


if __name__ == "__main__":
    main()
