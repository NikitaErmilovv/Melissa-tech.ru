# -*- coding: utf-8 -*-
"""Build clean vehicle icons (Material Design Icons + Tabler/FA)."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
src = root / "img" / "icons" / "preview"
dst = root / "img" / "icons" / "vehicles"
dst.mkdir(parents=True, exist_ok=True)

# Material Design Icons (filled) + Tabler SUV — one visual language, recognizable types.
# https://pictogrammers.com/library/mdi/
mapping = {
    "moto": ("mdi_motorbike.svg", "0 0 24 24"),
    "hatch": ("mdi_car-hatchback.svg", "0 0 24 24"),
    "sedan": ("mdi_car-side.svg", "0 0 24 24"),
    "wagon": ("mdi_car-estate.svg", "0 0 24 24"),
    "crossover": ("mdi_van-passenger.svg", "0 0 24 24"),
    "jeep": ("tabler_car_suv_filled.svg", "0 0 24 24"),
}

skip = {"M0 0h24v24H0z"}

for key, (fname, view) in mapping.items():
    raw = (src / fname).read_text(encoding="utf-8")
    paths = re.findall(r'<path[^>]*\sd="([^"]+)"', raw)
    paths = [p for p in paths if p not in skip]
    body = "".join(f'<path fill="currentColor" d="{p}"/>' for p in paths)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" class="price-sil" '
        f'viewBox="{view}" aria-hidden="true">{body}</svg>\n'
    )
    (dst / f"{key}.svg").write_text(svg, encoding="utf-8", newline="\n")
    print(key, "ok")

print("written to", dst)
