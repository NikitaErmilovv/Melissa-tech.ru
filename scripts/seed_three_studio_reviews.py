#!/usr/bin/env python3
"""Refresh data/reviews-2gis.json for the three D2 studio prototypes."""

from __future__ import annotations

import json
from pathlib import Path

from fetch_2gis_reviews import fetch_branch_reviews

ROOT = Path(__file__).resolve().parents[1]

STUDIOS = (
    ("klyaksa-tuning-noyabrsk", "70000001035583613"),
    ("mir-tonirovki-tobolsk", "70000001030915203"),
    ("imperiya-avtokompleks-chelyabinsk", "70000001019425061"),
    ("pervushin-avtokompleks-ekaterinburg", "70000001034025330"),
    ("pervyy-rul-masterskaya-novokuznetsk", "70000001111114731"),
    ("prime38-detailing-angarsk", "70000001061012787"),
    ("proffkar-avtotekhservis-tyumen", "70000001080387917"),
)


def main() -> None:
    for slug, branch_id in STUDIOS:
        items = fetch_branch_reviews(branch_id, limit=8)
        if len(items) < 6:
            raise SystemExit(f"{slug}: only {len(items)} reviews fetched")
        path = ROOT / slug / "data" / "reviews-2gis.json"
        path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(slug, len(items), "reviews ->", path)


if __name__ == "__main__":
    main()
