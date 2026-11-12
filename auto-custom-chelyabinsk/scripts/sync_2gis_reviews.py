#!/usr/bin/env python3
"""Sync D2 2GIS reviews + firm stats into data/*.json (for static site)."""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
REVIEWS_PATH = DATA / "reviews-2gis.json"
META_PATH = DATA / "2gis-meta.json"

FIRM_ID = "70000001034460339"
FIRM_SLUG = f"https://2gis.ru/novosibirsk/firm/{FIRM_ID}"
REVIEWS_URL = f"{FIRM_SLUG}/tab/reviews"
MIN_INTERVAL = timedelta(hours=48)
USER_AGENT = "Mozilla/5.0 (compatible; D2DetailingReviewsSync/1.0; +https://d2detailing.ru)"

REVIEW_BLOCK = re.compile(r'"id":"(\d{6,})","is_hidden"')
API_URL_RE = re.compile(
    r"(https://public-api\.reviews\.2gis\.com/3\.0/branches/"
    + re.escape(FIRM_ID)
    + r"/reviews[^\"']+)"
)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "ru-RU,ru;q=0.9"})
    with urllib.request.urlopen(req, timeout=45) as resp:
        return resp.read().decode("utf-8", "ignore")


def fetch_json(url: str) -> dict[str, Any]:
    req = urllib.request.Request(
        url.replace("&amp;", "&"),
        headers={"User-Agent": USER_AGENT, "Accept": "application/json", "Accept-Language": "ru-RU,ru;q=0.9"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def extract_reviews_api_url(reviews_html: str) -> str:
    m = API_URL_RE.search(reviews_html)
    if not m:
        raise RuntimeError("2GIS reviews API URL not found in page HTML")
    url = m.group(1).replace("&amp;", "&")
    if "sort_by=" in url:
        url = re.sub(r"sort_by=[^&]+", "sort_by=date_created", url)
    else:
        url += "&sort_by=date_created"
    url = re.sub(r"offset=\d+", "offset=0", url)
    return url


def review_from_api(item: dict[str, Any]) -> dict | None:
    text = (item.get("text") or "").strip()
    if not text:
        return None
    user = item.get("user") or {}
    name = (user.get("name") or user.get("first_name") or "").strip()
    if not name:
        first = (user.get("first_name") or "").strip()
        last = (user.get("last_name") or "").strip()
        name = f"{first} {last}".strip()
    date_iso = item.get("date_created") or ""
    return {
        "name": name or "Клиент",
        "text": text,
        "rating": int(item.get("rating") or 5),
        "date": format_date(date_iso) if date_iso else "",
        "dateIso": date_iso,
        "id": str(item.get("id") or ""),
    }


def fetch_all_reviews_via_api(reviews_html: str) -> tuple[list[dict], dict]:
    url = extract_reviews_api_url(reviews_html)
    seen: set[str] = set()
    reviews: list[dict] = []
    api_meta: dict[str, Any] = {}
    pages = 0

    while url:
        data = fetch_json(url)
        api_meta = data.get("meta") or api_meta
        for raw in data.get("reviews") or []:
            rid = str(raw.get("id") or "")
            if not rid or rid in seen:
                continue
            seen.add(rid)
            parsed = review_from_api(raw)
            if parsed:
                reviews.append(parsed)
        pages += 1
        next_link = (api_meta.get("next_link") or "").replace("&amp;", "&")
        if next_link:
            if "sort_by=" in next_link:
                next_link = re.sub(r"sort_by=[^&]+", "sort_by=date_created", next_link)
            else:
                next_link += "&sort_by=date_created"
        url = next_link or ""
        if url:
            time.sleep(0.15)

    def sort_key(item: dict) -> tuple:
        dt = parse_date_iso(item.get("dateIso") or "")
        ts = dt.timestamp() if dt else 0.0
        return (-ts, -int(item.get("id") or "0"))

    reviews.sort(key=sort_key)
    return reviews, api_meta


def unescape(s: str) -> str:
    try:
        return json.loads(f'"{s}"')
    except json.JSONDecodeError:
        return s.replace("\\n", "\n").replace('\\"', '"').replace("\\\\", "\\")


def format_date(iso: str) -> str:
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return dt.strftime("%d.%m.%Y")
    except ValueError:
        return ""


def parse_date_iso(iso: str) -> datetime | None:
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def strip_official_answer_blocks(chunk: str) -> str:
    """Remove nested official_answer objects so their text is not picked as review body."""
    out: list[str] = []
    pos = 0
    while pos < len(chunk):
        m = re.search(r'"official_answer"\s*:\s*\{', chunk[pos:])
        if not m:
            out.append(chunk[pos:])
            break
        out.append(chunk[pos : pos + m.start()])
        brace = pos + m.end() - 1
        depth = 0
        k = brace
        while k < len(chunk):
            if chunk[k] == "{":
                depth += 1
            elif chunk[k] == "}":
                depth -= 1
                if depth == 0:
                    pos = k + 1
                    break
            k += 1
        else:
            out.append(chunk[pos:])
            break
    return "".join(out)


def parse_firm_meta(html: str) -> dict:
    rating = 5.0
    reviews_count = None
    ratings_count = None

    og = re.search(r'property="og:description"\s+content="([^"]+)"', html)
    if og:
        m = re.search(r"Оценка\s+([\d.,]+),\s*\d+\s*фото,\s*(\d+)\s*отзыв", og.group(1), re.I)
        if m:
            rating = float(m.group(1).replace(",", "."))
            reviews_count = int(m.group(2))

    m_rating = re.search(r"general_rating\":([\d.]+)", html)
    if m_rating:
        rating = float(m_rating.group(1))

    m_ratings = re.search(r"(\d{2,4})\s*оцен", html, re.I)
    if m_ratings:
        ratings_count = int(m_ratings.group(1))

    if reviews_count is None:
        m = re.search(r"(\d{2,4})\s*отзыв", html, re.I)
        if m:
            reviews_count = int(m.group(1))

    return {
        "rating": rating,
        "reviewsCount": reviews_count,
        "ratingsCount": ratings_count,
        "firmUrl": FIRM_SLUG,
        "reviewsUrl": f"{FIRM_SLUG}/tab/reviews",
    }


def parse_reviews(html: str) -> list[dict]:
    reviews: list[dict] = []
    seen: set[str] = set()

    for m in REVIEW_BLOCK.finditer(html):
        rid = m.group(1)
        if rid in seen:
            continue
        seen.add(rid)

        chunk = html[m.start() : m.start() + 15000]
        chunk_clean = strip_official_answer_blocks(chunk)

        rating_m = re.search(r'"rating":(\d)', chunk_clean)
        name = ""
        name_m = re.search(r'"user":\{.*?"name":"((?:\\.|[^"\\])*)"', chunk_clean, re.DOTALL)
        if name_m:
            name = unescape(name_m.group(1)).strip()
        else:
            first_m = re.search(r'"first_name":"((?:\\.|[^"\\])*)"', chunk_clean)
            last_m = re.search(r'"last_name":"((?:\\.|[^"\\])*)"', chunk_clean)
            if first_m:
                first = unescape(first_m.group(1)).strip()
                last = unescape(last_m.group(1)).strip() if last_m else ""
                name = f"{first} {last}".strip()

        text_m = re.search(r'"rating":\d,.*?"text":"((?:\\.|[^"\\])*)"', chunk_clean, re.DOTALL)
        if not text_m:
            text_m = re.search(r'"text":"((?:\\.|[^"\\])*)"', chunk_clean)
        text = unescape(text_m.group(1)).strip() if text_m else ""

        date_m = re.search(r'"date_created":"([^"]+)"', chunk_clean)
        date_iso = date_m.group(1) if date_m else ""
        date_label = format_date(date_iso) if date_iso else ""

        if not text and not rating_m:
            continue

        reviews.append(
            {
                "name": name or "Клиент",
                "text": text,
                "rating": int(rating_m.group(1)) if rating_m else 5,
                "date": date_label,
                "dateIso": date_iso,
                "id": rid,
            }
        )

    def sort_key(item: dict) -> tuple:
        dt = parse_date_iso(item.get("dateIso") or "")
        ts = dt.timestamp() if dt else 0.0
        return (-ts, -int(item.get("id") or "0"))

    reviews.sort(key=sort_key)
    return reviews


def should_skip() -> bool:
    if not META_PATH.exists():
        return False
    try:
        meta = json.loads(META_PATH.read_text(encoding="utf-8"))
        synced = meta.get("syncedAt")
        if not synced:
            return False
        last = datetime.fromisoformat(synced.replace("Z", "+00:00"))
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) - last < MIN_INTERVAL
    except (json.JSONDecodeError, ValueError):
        return False


def main() -> int:
    force = "--force" in sys.argv
    if not force and should_skip():
        print("Skip: last sync was less than 48h ago (use --force to override).")
        return 0

    print("Fetching 2GIS firm page…")
    firm_html = fetch(FIRM_SLUG)
    meta = parse_firm_meta(firm_html)

    print("Fetching 2GIS reviews…")
    reviews_html = fetch(REVIEWS_URL)
    try:
        reviews, api_meta = fetch_all_reviews_via_api(reviews_html)
        if api_meta.get("branch_rating") is not None:
            meta["rating"] = float(api_meta["branch_rating"])
        if api_meta.get("branch_reviews_count") is not None:
            meta["reviewsCount"] = int(api_meta["branch_reviews_count"])
        meta["reviewsWithText"] = len(reviews)
        meta["apiTotalCount"] = api_meta.get("total_count")
        print(f"  API pages loaded, {len(reviews)} reviews with text")
    except (RuntimeError, urllib.error.URLError, json.JSONDecodeError) as exc:
        print(f"  API failed ({exc}), falling back to HTML parse…", file=sys.stderr)
        reviews = parse_reviews(reviews_html)

    if not reviews:
        print("ERROR: no reviews parsed", file=sys.stderr)
        return 1

    meta["syncedAt"] = datetime.now(timezone.utc).isoformat()
    meta["reviewsInCarousel"] = len(reviews)

    DATA.mkdir(parents=True, exist_ok=True)
    REVIEWS_PATH.write_text(json.dumps(reviews, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    META_PATH.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"OK: {len(reviews)} reviews, rating={meta.get('rating')}, reviewsCount={meta.get('reviewsCount')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
