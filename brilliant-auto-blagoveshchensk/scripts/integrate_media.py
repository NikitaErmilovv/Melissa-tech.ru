#!/usr/bin/env python3
"""Copy uploaded media into img/works and emit gallery fragment + manifest."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = Path("/cursor/stores/self/media/brilliant-auto/Бриллиант авто")
IMG = ROOT / "img" / "works"

FOLDER_MAP = {
    "Главное фото первого фрейма": ("hero", None),
    "Установка защитной плёнки": ("zashchitnaya-plenka", "Установка защитной плёнки"),
    "Замена цвета": ("zamena-tsveta", "Замена цвета"),
    "Антихром": ("antikhrom", "Антихром"),
    "Шумоизоляция": ("shumoizolyatsiya", "Шумоизоляция"),
    "Керамика": ("keramika", "Нанесение защитных составов"),
}

COMBINED = "Бронирование лobового стекла и атермальная пленка"
# typo fix - actual folder name from filesystem
COMBINED_ACTUAL = "Бронирование лобового стекла и атермальная пленка"

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
VIDEO_EXT = {".mp4", ".webm", ".mov"}


def slug_name(name: str, idx: int) -> str:
    base = re.sub(r"[^a-zA-Z0-9._-]+", "-", Path(name).stem).strip("-").lower()
    if not base:
        base = f"file-{idx:02d}"
    ext = Path(name).suffix.lower()
    return f"{base[:48]}{ext}"


def optimize_image(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(src),
                "-vf",
                "scale='min(1920,iw)':-2",
                "-q:v",
                "3",
                str(dest),
            ],
            check=True,
            capture_output=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        shutil.copy2(src, dest)


def copy_file(src: Path, dest_dir: Path, idx: int) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / slug_name(src.name, idx)
    if src.suffix.lower() in IMAGE_EXT:
        if src.suffix.lower() in {".jpg", ".jpeg"}:
            optimize_image(src, dest)
        else:
            shutil.copy2(src, dest)
    else:
        shutil.copy2(src, dest)
    return dest


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def main() -> None:
    manifest: dict = {"copied": [], "sections": []}

    if not SRC_ROOT.is_dir():
        raise SystemExit(f"Source not found: {SRC_ROOT}")

    # Hero
    hero_src_dir = SRC_ROOT / "Главное фото первого фрейма"
    if hero_src_dir.is_dir():
        imgs = sorted(
            p for p in hero_src_dir.iterdir() if p.suffix.lower() in IMAGE_EXT
        )
        if imgs:
            hero_dest = IMG / "hero.jpg"
            optimize_image(imgs[0], hero_dest)
            manifest["hero"] = rel(hero_dest)

    # Standard folders
    sections: list[dict] = []
    for folder_name, (slug, title) in FOLDER_MAP.items():
        if folder_name.startswith("Глав"):
            continue
        src_dir = SRC_ROOT / folder_name
        if not src_dir.is_dir():
            continue
        dest_dir = IMG / slug
        items: list[dict] = []
        for i, f in enumerate(sorted(src_dir.iterdir()), 1):
            if not f.is_file():
                continue
            if f.suffix.lower() not in IMAGE_EXT | VIDEO_EXT:
                continue
            out = copy_file(f, dest_dir, i)
            kind = "video" if f.suffix.lower() in VIDEO_EXT else "image"
            entry = {"kind": kind, "path": rel(out), "source": str(f.name)}
            items.append(entry)
            manifest["copied"].append(entry)
        if items:
            sections.append({"title": title, "slug": slug, "items": items})

    # Combined windshield + athermal
    comb_dir = SRC_ROOT / COMBINED_ACTUAL
    if comb_dir.is_dir():
        files = sorted(
            f
            for f in comb_dir.iterdir()
            if f.is_file() and f.suffix.lower() in IMAGE_EXT | VIDEO_EXT
        )
        mid = (len(files) + 1) // 2
        splits = [
            ("bronirovanie-lobovogo", "Бронирование лобового стекла", files[:mid]),
            ("atermalnaya-plenka", "Атермальная плёнка", files[mid:]),
        ]
        for slug, title, chunk in splits:
            dest_dir = IMG / slug
            items = []
            for i, f in enumerate(chunk, 1):
                out = copy_file(f, dest_dir, i)
                kind = "video" if f.suffix.lower() in VIDEO_EXT else "image"
                entry = {"kind": kind, "path": rel(out), "source": str(f.name)}
                items.append(entry)
                manifest["copied"].append(entry)
            if items:
                sections.append({"title": title, "slug": slug, "items": items})

    manifest["sections"] = sections
    out_json = ROOT / "img" / "media-manifest.json"
    out_json.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Copied {len(manifest['copied'])} files")
    print(f"Manifest: {out_json}")


if __name__ == "__main__":
    main()
