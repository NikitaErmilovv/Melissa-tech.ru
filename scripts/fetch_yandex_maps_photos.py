#!/usr/bin/env python3
"""Download org photos from Yandex Maps HTML (gallery + reviews pages)."""

from __future__ import annotations

import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORG_URL = "https://yandex.ru/maps/org/pervushin/204322764886/"
USER_AGENT = "Mozilla/5.0 (compatible; MelissaGallerySync/1.0)"
PHOTO_RE = re.compile(
    r"(https://avatars\.mds\.yandex\.net/get-[a-z]+/\d+/[a-f0-9]+)/",
    re.I,
)


def fetch_html(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept-Language": "ru-RU,ru;q=0.9"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", "ignore")


def collect_photo_bases() -> list[str]:
    bases: set[str] = set()
    for suffix in ("", "gallery/", "reviews/"):
        html = fetch_html(ORG_URL + suffix)
        bases.update(PHOTO_RE.findall(html))
        time.sleep(0.2)
    return sorted(bases)


def download_jpeg(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Referer": "https://yandex.ru/"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: fetch_yandex_maps_photos.py <site-dir> [start-index]", file=sys.stderr)
        return 1
    site = Path(sys.argv[1]).resolve()
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 17
    out_dir = site / "img" / "works" / "incoming" / "pervushin"
    out_dir.mkdir(parents=True, exist_ok=True)

    bases = collect_photo_bases()
    print(f"Found {len(bases)} unique Yandex photo IDs")
    ok = 0
    for i, base in enumerate(bases, start=start):
        dest = out_dir / f"{i:02d}-yandex.jpg"
        if dest.exists() and dest.stat().st_size > 10_000:
            ok += 1
            continue
        url = base + "/XXL_height"
        try:
            data = download_jpeg(url)
        except Exception as exc:
            print(f"skip {dest.name}: {exc}", file=sys.stderr)
            continue
        if len(data) < 5000 or data[:2] != b"\xff\xd8":
            print(f"skip {dest.name}: not a JPEG ({len(data)} bytes)", file=sys.stderr)
            continue
        dest.write_bytes(data)
        ok += 1
        print(f"saved {dest.name} ({len(data)//1024} KB)")
        time.sleep(0.12)
    print(f"Done: {ok} files in {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
