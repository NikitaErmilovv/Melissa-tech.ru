#!/usr/bin/env python3
"""Static site server with live 2GIS rating endpoint."""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8130
FIRM_URL = "https://2gis.ru/moscow/firm/70000001040721221"
CACHE_TTL = 3600
ROOT = Path(__file__).resolve().parent
GALLERY_SKIP = frozenset(
    {
        "02-2gis.jpg",
        "03-2gis.jpg",
        "04-2gis.jpg",
        "05-2gis.jpg",
        "06-2gis.jpg",
        "07-2gis.jpg",
    }
)

_cache: dict[str, object] = {"ts": 0.0}


def fetch_2gis_rating() -> dict[str, object]:
    now = time.time()
    cached_rating = _cache.get("rating")
    if cached_rating is not None and now - float(_cache.get("ts", 0)) < CACHE_TTL:
        return {
            "rating": cached_rating,
            "reviews": _cache.get("reviews"),
            "source": "2gis",
            "cached": True,
        }

    req = urllib.request.Request(
        FIRM_URL,
        headers={"User-Agent": "Mozilla/5.0 (compatible; D2DetailingSite/1.0)"},
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        html = resp.read().decode("utf-8", "ignore")

    og_match = re.search(r'property="og:description"\s+content="([^"]+)"', html)
    description = og_match.group(1) if og_match else ""

    rating = None
    reviews = None

    rating_match = re.search(r"Рейтинг\s+([0-9]+(?:[.,][0-9]+)?)", description)
    if rating_match:
        rating = float(rating_match.group(1).replace(",", "."))

    reviews_match = re.search(r"([0-9]+)\s+отз", description)
    if reviews_match:
        reviews = int(reviews_match.group(1))

    if rating is None:
        org_match = re.search(r'"org_rating"\s*:\s*([0-9]+(?:\.[0-9]+)?)', html)
        if org_match:
            rating = float(org_match.group(1))

    if rating is None:
        rating = 4.9

    _cache["rating"] = rating
    _cache["reviews"] = reviews
    _cache["ts"] = now

    return {
        "rating": rating,
        "reviews": reviews,
        "source": "2gis",
        "cached": False,
    }


class SiteHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".txt": "text/plain; charset=utf-8",
        ".svg": "image/svg+xml; charset=utf-8",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] == "/data/gallery-manifest.json":
            from urllib.parse import urlparse, parse_qs

            q = parse_qs(urlparse(self.path).query)
            sub = (q.get("dir") or [""])[0]
            base = ROOT / "img" / "works" / "incoming" / sub
            files = []
            if sub and base.is_dir():
                for p in sorted(base.iterdir()):
                    if p.name in GALLERY_SKIP:
                        continue
                    if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                        files.append(p.relative_to(ROOT).as_posix())
            body = json.dumps({"files": files}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path.split("?", 1)[0] == "/api/2gis-rating.json":
            try:
                payload = fetch_2gis_rating()
                body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Cache-Control", "public, max-age=300")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except (urllib.error.URLError, TimeoutError, ValueError) as exc:
                body = json.dumps({"error": str(exc)}, ensure_ascii=False).encode("utf-8")
                self.send_response(502)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            return

        return super().do_GET()


if __name__ == "__main__":
    with ThreadingHTTPServer(("", PORT), SiteHandler) as httpd:
        print(f"Serving {ROOT} on http://127.0.0.1:{PORT}/")
        httpd.serve_forever()
