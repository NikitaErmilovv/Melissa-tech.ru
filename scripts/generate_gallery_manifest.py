#!/usr/bin/env python3
"""Статический manifest для gallery-load.js (Timeweb без Python API)."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}
SKIP_NAMES = {"source.txt", "readme.txt", ".gitkeep"}
GALLERY_SKIP_FILENAMES = {"hero-home.jpg", "tint-home.jpg"}


def include_in_gallery_album(path: Path) -> bool:
    if not path.is_file():
        return False
    name = path.name.lower()
    if name in SKIP_NAMES or name in GALLERY_SKIP_FILENAMES:
        return False
    if name.endswith("-client.jpg"):
        return False
    return path.suffix.lower() in IMAGE_EXT


def photo_dir_from_gallery(site_dir: Path) -> str | None:
    html = site_dir / "gallery.html"
    if not html.is_file():
        return None
    text = html.read_text(encoding="utf-8")
    m = re.search(r'data-photo-dir="([^"]+)"', text)
    return m.group(1) if m else None


def collect_files(site_dir: Path, sub: str) -> list[str]:
    incoming = site_dir / "img" / "works" / "incoming" / sub
    if not incoming.is_dir():
        return []
    paths: list[str] = []
    for p in sorted(incoming.iterdir()):
        if not include_in_gallery_album(p):
            continue
        paths.append(p.relative_to(site_dir).as_posix())
    return paths


def write_manifest(site_dir: Path) -> tuple[bool, str]:
    sub = photo_dir_from_gallery(site_dir)
    if not sub:
        return False, "no gallery.html or data-photo-dir"
    files = collect_files(site_dir, sub)
    out = site_dir / "data" / "gallery-manifest.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"files": files}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return True, f"{len(files)} files -> {out.relative_to(ROOT)}"


def main(argv: list[str]) -> int:
    if len(argv) > 1:
        sites = [ROOT / name for name in argv[1:]]
    else:
        sites = sorted(
            p
            for p in ROOT.iterdir()
            if p.is_dir() and (p / "gallery-load.js").is_file() and (p / "gallery.html").is_file()
        )
    ok = 0
    for site in sites:
        if not site.is_dir():
            print(f"skip missing {site}")
            continue
        success, msg = write_manifest(site)
        print(f"{'ok' if success else 'skip'} {site.name}: {msg}")
        if success:
            ok += 1
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
