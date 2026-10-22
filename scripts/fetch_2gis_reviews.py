"""Fetch public 2GIS branch reviews (widget API) into carousel JSON shape."""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from datetime import datetime
from typing import Any

API_KEY = "d463a78e-4d44-4198-8cd5-7fc0762032cb"
API_BASE = "https://api.reviews.2gis.com/2.0/branches"


def _format_date(iso: str) -> str:
    if not iso:
        return ""
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return dt.strftime("%d.%m.%Y")
    except ValueError:
        return ""


def fetch_branch_reviews(
    branch_id: str,
    *,
    limit: int = 8,
    min_text_len: int = 12,
) -> list[dict[str, Any]]:
    """Return up to `limit` reviews with non-empty text for a 2GIS branch."""
    want = max(limit, 8)
    collected: list[dict[str, Any]] = []
    offset = 0
    page = min(50, want * 3)

    while len(collected) < want and offset < 200:
        q = urllib.parse.urlencode(
            {
                "key": API_KEY,
                "limit": str(page),
                "offset": str(offset),
                "sort_by": "date_created",
            }
        )
        url = f"{API_BASE}/{branch_id}/reviews?{q}"
        req = urllib.request.Request(
            url, headers={"User-Agent": "MelissaTechSite/1.0"}
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            payload = json.loads(resp.read().decode("utf-8"))

        reviews = payload.get("reviews") or []
        if not reviews:
            break

        for raw in reviews:
            text = re.sub(r"\s+", " ", str(raw.get("text") or "")).strip()
            if len(text) < min_text_len:
                continue
            user = raw.get("user") or {}
            name = str(user.get("name") or user.get("first_name") or "Клиент").strip()
            item = {
                "name": name,
                "text": text,
                "rating": int(raw.get("rating") or 5),
                "date": _format_date(str(raw.get("date_created") or "")),
                "id": str(raw.get("id") or ""),
            }
            collected.append(item)
            if len(collected) >= want:
                break

        offset += len(reviews)
        if not payload.get("meta", {}).get("next_link"):
            break

    return collected[:want]


if __name__ == "__main__":
    import argparse
    import sys

    p = argparse.ArgumentParser()
    p.add_argument("branch_id")
    p.add_argument("-n", "--limit", type=int, default=8)
    p.add_argument("-o", "--out")
    args = p.parse_args()
    items = fetch_branch_reviews(args.branch_id, limit=args.limit)
    out = json.dumps(items, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        open(args.out, "w", encoding="utf-8").write(out)
    else:
        sys.stdout.write(out)
