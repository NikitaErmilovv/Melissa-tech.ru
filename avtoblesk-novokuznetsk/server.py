#!/usr/bin/env python3
"""Static site server with live 2GIS rating endpoint."""

from __future__ import annotations

import json
import re
import secrets
import time
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = int(__import__("os").environ.get("PORT", "8092"))
FIRM_URL = "https://2gis.ru/novokuznetsk/firm/70000001098503533"
CACHE_TTL = 3600
ROOT = Path(__file__).resolve().parent
CMS_DIR = ROOT / "cms"
CMS_CONTENT = CMS_DIR / "content.json"
WRAP_ZONES = ROOT / "data" / "wrap-zones.json"
CMS_CONFIG = CMS_DIR / "config.local.json"
CMS_CONFIG_EXAMPLE = CMS_DIR / "config.example.json"
CMS_UPLOADS = ROOT / "img" / "cms" / "uploads"
CMS_UPLOADS.mkdir(parents=True, exist_ok=True)

_cache: dict[str, object] = {"ts": 0.0}
_cms_tokens: dict[str, float] = {}
CMS_TOKEN_TTL = 86400


def cms_password() -> str:
    if CMS_CONFIG.is_file():
        data = json.loads(CMS_CONFIG.read_text(encoding="utf-8"))
        return str(data.get("password", ""))
    if CMS_CONFIG_EXAMPLE.is_file():
        data = json.loads(CMS_CONFIG_EXAMPLE.read_text(encoding="utf-8"))
        return str(data.get("password", ""))
    return ""


def cms_check_token(header: str | None) -> bool:
    if not header or not header.startswith("Bearer "):
        return False
    token = header[7:].strip()
    exp = _cms_tokens.get(token)
    if exp is None:
        return False
    if time.time() > exp:
        _cms_tokens.pop(token, None)
        return False
    return True


def cms_read_content() -> dict:
    if not CMS_CONTENT.is_file():
        return {}
    return json.loads(CMS_CONTENT.read_text(encoding="utf-8"))


def cms_write_content(data: dict) -> None:
    CMS_CONTENT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


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
        headers={"User-Agent": "Mozilla/5.0 (compatible; АвтоБлескSite/1.0)"},
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
        rating = 5.0

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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
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

    def do_POST(self) -> None:
        path = self.path.split("?", 1)[0]
        if path == "/api/cms/login":
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length) if length else b"{}"
            try:
                payload = json.loads(body.decode("utf-8"))
            except json.JSONDecodeError:
                payload = {}
            pwd = str(payload.get("password", ""))
            expected = cms_password()
            if not expected or not secrets.compare_digest(pwd, expected):
                self.send_error(401, "Unauthorized")
                return
            token = secrets.token_urlsafe(32)
            _cms_tokens[token] = time.time() + CMS_TOKEN_TTL
            out = json.dumps({"token": token}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(out)))
            self.end_headers()
            self.wfile.write(out)
            return

        if path == "/api/cms/save":
            if not cms_check_token(self.headers.get("Authorization")):
                self.send_error(401, "Unauthorized")
                return
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length)
            try:
                payload = json.loads(body.decode("utf-8"))
            except json.JSONDecodeError:
                self.send_error(400, "Bad JSON")
                return
            page = str(payload.get("page", ""))
            if not page:
                self.send_error(400, "Missing page")
                return
            store = cms_read_content()
            page_store = store.setdefault(page, {"text": {}, "images": {}, "backgrounds": {}})
            page_store.setdefault("text", {})
            page_store.setdefault("images", {})
            page_store.setdefault("backgrounds", {})
            page_store["text"].update(payload.get("text") or {})
            page_store["images"].update(payload.get("images") or {})
            page_store["backgrounds"].update(payload.get("backgrounds") or {})
            if payload.get("lists"):
                page_store["lists"] = payload.get("lists")
            meta = payload.get("meta")
            if isinstance(meta, dict):
                def clean_meta(value: object, limit: int) -> str:
                    text = " ".join(str(value or "").replace("<", " ").replace(">", " ").split())
                    return text[:limit]

                page_store["meta"] = {
                    "title": clean_meta(meta.get("title"), 180),
                    "description": clean_meta(meta.get("description"), 320),
                }
            cms_write_content(store)
            out = json.dumps({"ok": True}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(out)))
            self.end_headers()
            self.wfile.write(out)
            return

        if path == "/api/wrap-zones/save":
            if not cms_check_token(self.headers.get("Authorization")):
                self.send_error(401, "Unauthorized")
                return
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length)
            try:
                payload = json.loads(body.decode("utf-8"))
            except json.JSONDecodeError:
                self.send_error(400, "Bad JSON")
                return
            has_zones = isinstance(payload.get("zones"), dict)
            has_models = isinstance(payload.get("models"), dict)
            if not isinstance(payload, dict) or (not has_zones and not has_models):
                self.send_error(400, "Missing zones")
                return
            raw = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
            tmp = WRAP_ZONES.with_suffix(".json.tmp")
            tmp.write_text(raw, encoding="utf-8")
            tmp.replace(WRAP_ZONES)
            out = json.dumps({"ok": True}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(out)))
            self.end_headers()
            self.wfile.write(out)
            return

        if path == "/api/cms/upload":
            if not cms_check_token(self.headers.get("Authorization")):
                self.send_error(401, "Unauthorized")
                return
            ctype = self.headers.get("Content-Type", "")
            if "multipart/form-data" not in ctype:
                self.send_error(400, "Expected multipart")
                return
            import cgi

            form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={"REQUEST_METHOD": "POST"})
            file_item = form["file"] if "file" in form else None
            if file_item is None or not getattr(file_item, "file", None):
                self.send_error(400, "Missing file")
                return
            filename = Path(getattr(file_item, "filename", "upload.jpg")).name
            safe = re.sub(r"[^a-zA-Z0-9._-]", "_", filename) or "upload.jpg"
            dest = CMS_UPLOADS / f"{int(time.time())}_{safe}"
            dest.write_bytes(file_item.file.read())
            url = f"img/cms/uploads/{dest.name}"
            out = json.dumps({"url": url}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(out)))
            self.end_headers()
            self.wfile.write(out)
            return

        self.send_error(404)


if __name__ == "__main__":
    with ThreadingHTTPServer(("", PORT), SiteHandler) as httpd:
        print(f"Serving {ROOT} on http://127.0.0.1:{PORT}/")
        httpd.serve_forever()
