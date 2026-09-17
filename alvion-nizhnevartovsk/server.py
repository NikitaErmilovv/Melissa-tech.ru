#!/usr/bin/env python3
"""Static site server with 2GIS rating and Alvion auth/applications API."""

from __future__ import annotations

import hashlib
import json
import re
import secrets
import time
import urllib.error
import urllib.request
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8102
FIRM_URL = "https://2gis.ru/nizhnevartovsk/firm/70000001110415870"
CACHE_TTL = 3600
ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "_data"
USERS_FILE = DATA_DIR / "users.json"
APPLICATIONS_FILE = DATA_DIR / "applications.json"
SESSIONS_FILE = DATA_DIR / "sessions.json"

ADMIN_EMAIL = "admin@alvion.ru"
ADMIN_PASSWORD = "alvion123"
SESSION_TTL = 60 * 60 * 24 * 14

_cache: dict[str, object] = {"ts": 0.0}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def load_json(path: Path, default: object) -> object:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def save_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)


def ensure_seed_data() -> None:
    users = load_json(USERS_FILE, [])
    if not isinstance(users, list):
        users = []
    if not any(u.get("email") == ADMIN_EMAIL for u in users):
        users.append(
            {
                "id": str(uuid.uuid4()),
                "name": "Администратор",
                "phone": "+7 (922) 420-02-38",
                "email": ADMIN_EMAIL,
                "passwordHash": hash_password(ADMIN_PASSWORD),
                "role": "admin",
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
        )
        save_json(USERS_FILE, users)
    if not APPLICATIONS_FILE.exists():
        save_json(APPLICATIONS_FILE, [])
    if not SESSIONS_FILE.exists():
        save_json(SESSIONS_FILE, {})


def read_body(handler: SimpleHTTPRequestHandler) -> dict[str, object]:
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length) if length else b"{}"
    try:
        data = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError("Некорректный JSON") from exc
    if not isinstance(data, dict):
        raise ValueError("Некорректный JSON")
    return data


def json_response(handler: SimpleHTTPRequestHandler, status: int, payload: object) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def get_bearer_token(handler: SimpleHTTPRequestHandler) -> str | None:
    auth = handler.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:].strip()
    return None


def get_current_user(token: str | None) -> dict[str, object] | None:
    if not token:
        return None
    sessions = load_json(SESSIONS_FILE, {})
    if not isinstance(sessions, dict):
        sessions = {}
    session = sessions.get(token)
    if not session:
        return None
    if float(session.get("expiresAt", 0)) < time.time():
        sessions.pop(token, None)
        save_json(SESSIONS_FILE, sessions)
        return None
    users = load_json(USERS_FILE, [])
    for user in users:
        if user.get("id") == session.get("userId"):
            return user
    return None


def public_user(user: dict[str, object]) -> dict[str, object]:
    return {
        "id": user.get("id"),
        "name": user.get("name"),
        "phone": user.get("phone"),
        "email": user.get("email"),
        "car": user.get("car", ""),
        "role": user.get("role", "user"),
        "createdAt": user.get("createdAt"),
    }


def create_session(user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    sessions = load_json(SESSIONS_FILE, {})
    if not isinstance(sessions, dict):
        sessions = {}
    sessions[token] = {
        "userId": user_id,
        "expiresAt": time.time() + SESSION_TTL,
    }
    save_json(SESSIONS_FILE, sessions)
    return token


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
        headers={"User-Agent": "Mozilla/5.0 (compatible; AlvionSite/1.0)"},
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
        path = self.path.split("?", 1)[0]

        if path == "/api/2gis-rating.json":
            try:
                payload = fetch_2gis_rating()
                json_response(self, 200, payload)
            except (urllib.error.URLError, TimeoutError, ValueError) as exc:
                json_response(self, 502, {"error": str(exc)})
            return

        if path == "/api/auth/me":
            user = get_current_user(get_bearer_token(self))
            if not user:
                json_response(self, 401, {"error": "Требуется авторизация"})
                return
            json_response(self, 200, {"user": public_user(user)})
            return

        if path == "/api/applications/mine":
            user = get_current_user(get_bearer_token(self))
            if not user:
                json_response(self, 401, {"error": "Требуется авторизация"})
                return
            apps = load_json(APPLICATIONS_FILE, [])
            mine = [a for a in apps if a.get("userId") == user.get("id")]
            mine.sort(key=lambda item: item.get("createdAt", ""), reverse=True)
            json_response(self, 200, {"items": mine})
            return

        if path == "/api/admin/applications":
            user = get_current_user(get_bearer_token(self))
            if not user or user.get("role") != "admin":
                json_response(self, 403, {"error": "Доступ только для администратора"})
                return
            apps = load_json(APPLICATIONS_FILE, [])
            users = {u.get("id"): u for u in load_json(USERS_FILE, [])}
            items = []
            for app in sorted(apps, key=lambda item: item.get("createdAt", ""), reverse=True):
                owner = users.get(app.get("userId"), {})
                items.append(
                    {
                        **app,
                        "userName": owner.get("name", "—"),
                        "userPhone": owner.get("phone", "—"),
                        "userEmail": owner.get("email", "—"),
                    }
                )
            json_response(self, 200, {"items": items})
            return

        if path == "/api/admin/users":
            user = get_current_user(get_bearer_token(self))
            if not user or user.get("role") != "admin":
                json_response(self, 403, {"error": "Доступ только для администратора"})
                return
            apps = load_json(APPLICATIONS_FILE, [])
            counts: dict[str, int] = {}
            for app in apps:
                uid = str(app.get("userId") or "")
                counts[uid] = counts.get(uid, 0) + 1
            users = []
            for item in load_json(USERS_FILE, []):
                if item.get("role") == "admin":
                    continue
                users.append(
                    {
                        **public_user(item),
                        "applications": counts.get(str(item.get("id")), 0),
                    }
                )
            users.sort(key=lambda item: str(item.get("createdAt") or ""), reverse=True)
            json_response(self, 200, {"items": users})
            return

        if path == "/api/admin/stats":
            user = get_current_user(get_bearer_token(self))
            if not user or user.get("role") != "admin":
                json_response(self, 403, {"error": "Доступ только для администратора"})
                return
            apps = load_json(APPLICATIONS_FILE, [])
            clients = [u for u in load_json(USERS_FILE, []) if u.get("role") != "admin"]
            stats = {"total": len(apps), "new": 0, "progress": 0, "done": 0, "cancelled": 0, "clients": len(clients)}
            for app in apps:
                status = str(app.get("status") or "new")
                if status in stats:
                    stats[status] += 1
            json_response(self, 200, stats)
            return

        return super().do_GET()

    def do_POST(self) -> None:
        path = self.path.split("?", 1)[0]
        try:
            data = read_body(self)
        except ValueError as exc:
            json_response(self, 400, {"error": str(exc)})
            return

        if path == "/api/auth/register":
            name = str(data.get("name", "")).strip()
            phone = str(data.get("phone", "")).strip()
            email = str(data.get("email", "")).strip().lower()
            password = str(data.get("password", ""))

            if len(name) < 2:
                json_response(self, 400, {"error": "Укажите имя."})
                return
            if not email or "@" not in email:
                json_response(self, 400, {"error": "Укажите корректный email."})
                return
            if len(password) < 6:
                json_response(self, 400, {"error": "Пароль — минимум 6 символов."})
                return

            users = load_json(USERS_FILE, [])
            if any(u.get("email") == email for u in users):
                json_response(self, 409, {"error": "Пользователь с таким email уже зарегистрирован."})
                return

            user = {
                "id": str(uuid.uuid4()),
                "name": name,
                "phone": phone,
                "email": email,
                "passwordHash": hash_password(password),
                "role": "user",
                "car": "",
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            users.append(user)
            save_json(USERS_FILE, users)
            token = create_session(user["id"])
            json_response(self, 201, {"token": token, "user": public_user(user)})
            return

        if path == "/api/auth/login":
            email = str(data.get("email", "")).strip().lower()
            password = str(data.get("password", ""))
            users = load_json(USERS_FILE, [])
            user = next((u for u in users if u.get("email") == email), None)
            if not user or user.get("passwordHash") != hash_password(password):
                json_response(self, 401, {"error": "Неверный email или пароль."})
                return
            token = create_session(str(user.get("id")))
            json_response(self, 200, {"token": token, "user": public_user(user)})
            return

        if path == "/api/auth/logout":
            token = get_bearer_token(self)
            if token:
                sessions = load_json(SESSIONS_FILE, {})
                if isinstance(sessions, dict):
                    sessions.pop(token, None)
                    save_json(SESSIONS_FILE, sessions)
            json_response(self, 200, {"ok": True})
            return

        if path == "/api/applications":
            user = get_current_user(get_bearer_token(self))
            if not user:
                json_response(self, 401, {"error": "Войдите, чтобы отправить заявку."})
                return
            service = str(data.get("service", "")).strip()
            service_label = str(data.get("serviceLabel", "")).strip() or service
            if not service:
                json_response(self, 400, {"error": "Выберите услугу."})
                return
            app = {
                "id": str(uuid.uuid4()),
                "userId": user.get("id"),
                "service": service,
                "serviceLabel": service_label,
                "date": str(data.get("date", "")).strip(),
                "time": str(data.get("time", "")).strip(),
                "car": str(data.get("car", "")).strip(),
                "comment": str(data.get("comment", "")).strip(),
                "status": "new",
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            apps = load_json(APPLICATIONS_FILE, [])
            apps.append(app)
            save_json(APPLICATIONS_FILE, apps)
            car = str(app.get("car") or "").strip()
            if car:
                users = load_json(USERS_FILE, [])
                for item in users:
                    if item.get("id") == user.get("id"):
                        item["car"] = car
                        break
                save_json(USERS_FILE, users)
            json_response(self, 201, {"item": app})
            return

        json_response(self, 404, {"error": "Not found"})

    def do_PATCH(self) -> None:
        path = self.path.split("?", 1)[0]
        user = get_current_user(get_bearer_token(self))
        if not user:
            json_response(self, 401, {"error": "Требуется авторизация"})
            return

        try:
            data = read_body(self)
        except ValueError as exc:
            json_response(self, 400, {"error": str(exc)})
            return

        if path == "/api/auth/profile":
            name = str(data.get("name", user.get("name", ""))).strip()
            phone = str(data.get("phone", user.get("phone", ""))).strip()
            car = str(data.get("car", user.get("car", ""))).strip()
            if len(name) < 2:
                json_response(self, 400, {"error": "Укажите имя."})
                return
            users = load_json(USERS_FILE, [])
            updated = None
            for item in users:
                if item.get("id") == user.get("id"):
                    item["name"] = name
                    item["phone"] = phone
                    item["car"] = car
                    updated = item
                    break
            if not updated:
                json_response(self, 404, {"error": "Пользователь не найден."})
                return
            save_json(USERS_FILE, users)
            json_response(self, 200, {"user": public_user(updated)})
            return

        if user.get("role") != "admin":
            json_response(self, 403, {"error": "Доступ только для администратора"})
            return

        match = re.match(r"^/api/admin/applications/([^/]+)$", path)
        if not match:
            json_response(self, 404, {"error": "Not found"})
            return

        app_id = match.group(1)
        status = str(data.get("status", "")).strip()
        allowed = {"new", "progress", "done", "cancelled"}
        if status not in allowed:
            json_response(self, 400, {"error": "Некорректный статус."})
            return

        apps = load_json(APPLICATIONS_FILE, [])
        updated = None
        for app in apps:
            if app.get("id") == app_id:
                app["status"] = status
                updated = app
                break
        if not updated:
            json_response(self, 404, {"error": "Заявка не найдена."})
            return
        save_json(APPLICATIONS_FILE, apps)
        json_response(self, 200, {"item": updated})


if __name__ == "__main__":
    import sys

    ensure_seed_data()
    try:
        with ThreadingHTTPServer(("", PORT), SiteHandler) as httpd:
            print(f"Serving {ROOT} on http://127.0.0.1:{PORT}/", flush=True)
            httpd.serve_forever()
    except OSError as exc:
        print(f"Cannot start on port {PORT}: {exc}", file=sys.stderr, flush=True)
        print("Close the other process on this port or change PORT in server.py.", file=sys.stderr, flush=True)
        sys.exit(1)
