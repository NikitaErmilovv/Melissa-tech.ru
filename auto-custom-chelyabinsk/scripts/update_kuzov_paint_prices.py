# -*- coding: utf-8 -*-
import json
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "data" / "kuzov-zones.json"
data = json.loads(path.read_text(encoding="utf-8"))

# Base acrylic prices (₽). Metal +5k, pearl +10k — as in the hood example.
PAINT = {
    "hood": ("Капот", 40000),
    "bumperFront": ("Передний бампер", 28000),
    "fenderFrontR": ("Переднее левое крыло", 24000),
    "fenderFrontL": ("Переднее правое крыло", 24000),
    "doorFrontR": ("Передняя левая дверь", 28000),
    "doorFrontL": ("Передняя правая дверь", 28000),
    "doorRearR": ("Задняя левая дверь", 28000),
    "doorRearL": ("Задняя правая дверь", 28000),
    "quarterR": ("Заднее левое крыло", 50000),
    "quarterL": ("Заднее правое крыло", 50000),
    "bumperRear": ("Задний бампер", 26000),
    "roof": ("Крыша", 80000),
}


def paint_block(name: str, base: int) -> dict:
    return {
        "name": name,
        "price": base,
        "note": "Окрас",
        "prices": {
            "base": base,
            "metal": base + 5000,
            "pearl": base + 10000,
        },
    }


def patch_zones(zones: dict) -> dict:
    out = {}
    for zid, z in zones.items():
        if zid in PAINT:
            name, base = PAINT[zid]
            out[zid] = paint_block(name, base)
            continue
        # Keep selectable, but no paint price sheet — after inspection
        item = {
            "name": z.get("name", zid),
            "price": 0,
            "note": "Окрас",
            "after_inspect": True,
        }
        if z.get("nopaint"):
            item["nopaint"] = True
            item["note"] = z.get("note") or "После осмотра"
        out[zid] = item
    return out


data["zones"] = patch_zones(data.get("zones") or {})
for model in data.get("models") or {}:
    mz = data["models"][model].get("zones") or {}
    data["models"][model]["zones"] = patch_zones(mz)

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("updated", path)
