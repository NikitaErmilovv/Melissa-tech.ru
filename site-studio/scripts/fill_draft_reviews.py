"""One-shot 2GIS review snapshot into site-studio workspace drafts (static only)."""

from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

STUDIO = Path(__file__).resolve().parents[1]
REPO = STUDIO.parent
sys.path.insert(0, str(REPO / "scripts"))

from fetch_2gis_catalog_branch import fetch_branch_catalog  # noqa: E402
from fetch_2gis_reviews import fetch_branch_reviews  # noqa: E402

WORKSPACE = STUDIO / "workspace"
DEFAULT_SLUGS = [
    "nashe-mesto-tyumen",
    "molly-house-tyumen",
    "tishiny-hochu-tyumen",
    "abazhur-tyumen",
    "dom-uyuta-365-tyumen",
    "dom-vyhodnogo-dnya",
    "sun-village-tyumen",
]
LIMIT = 12


def slug_to_prefix(slug: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", slug.lower())[:24].strip("-")


def load_cfg(slug: str) -> dict:
    p = WORKSPACE / slug / "site.config.json"
    if not p.is_file():
        raise FileNotFoundError(p)
    return json.loads(p.read_text(encoding="utf-8"))


def save_cfg(slug: str, cfg: dict) -> None:
    p = WORKSPACE / slug / "site.config.json"
    p.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def firm_id_from(cfg: dict, slug: str) -> str:
    fid = str(cfg.get("contacts", {}).get("firmId") or "").strip()
    if not fid:
        m = re.search(r"/firm/(\d+)", str(cfg.get("contacts", {}).get("gisFirm") or ""))
        fid = m.group(1) if m else ""
    if not fid:
        raise RuntimeError(f"{slug}: no firmId in site.config.json")
    return fid


def main() -> int:
    slugs = sys.argv[1:] or DEFAULT_SLUGS
    snapshot_at = date.today().isoformat()
    report = []

    for slug in slugs:
        cfg = load_cfg(slug)
        firm_id = firm_id_from(cfg, slug)
        prefix = slug_to_prefix(slug)

        cat = fetch_branch_catalog(firm_id, city_slug="tyumen")
        rating = float(cat.get("rating") or cfg.get("stats", {}).get("rating") or 5)
        ratings_count = int(
            cat.get("review_count")
            or cfg.get("stats", {}).get("reviewsCount")
            or 0
        )

        raw = fetch_branch_reviews(firm_id, limit=LIMIT)
        items = []
        for r in raw:
            rid = str(r.get("id") or "").strip()
            safe = re.sub(r"[^a-zA-Z0-9_-]", "", rid)[:20] or str(len(items))
            items.append(
                {
                    "id": f"{prefix}-{safe}",
                    "name": str(r.get("name") or "Гость").strip(),
                    "text": str(r.get("text") or "").strip(),
                    "rating": int(r.get("rating") or 5),
                    "date": str(r.get("date") or ""),
                }
            )

        payload = {
            "meta": {
                "source": "2GIS snapshot (static, no live fetch)",
                "firmId": firm_id,
                "slug": slug,
                "snapshotAt": snapshot_at,
                "rating": round(rating, 1) if rating != int(rating) else int(rating),
                "ratingsCount": ratings_count,
                "carouselCount": len(items),
            },
            "reviews": items,
        }

        data_dir = WORKSPACE / slug / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        (data_dir / "reviews-2gis.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

        cfg["reviews"] = {"meta": payload["meta"], "items": items}
        cfg.setdefault("stats", {})
        cfg["stats"]["rating"] = str(payload["meta"]["rating"])
        cfg["stats"]["reviewsCount"] = str(ratings_count)
        save_cfg(slug, cfg)

        report.append(
            {
                "slug": slug,
                "firmId": firm_id,
                "fetched": len(items),
                "ratingsCount": ratings_count,
                "rating": payload["meta"]["rating"],
            }
        )
        print(f"OK {slug}: firm={firm_id} reviews={len(items)} meta={ratings_count}@{rating}")

    (STUDIO / "scripts" / "last-reviews-snapshot.json").write_text(
        json.dumps({"at": snapshot_at, "sites": report}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())