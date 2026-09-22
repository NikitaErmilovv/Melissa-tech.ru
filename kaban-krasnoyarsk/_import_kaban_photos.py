#!/usr/bin/env python3
"""Import photos from D:\\кбн детейл into kaban-krasnoyarsk/img/works."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

SRC = Path(r"D:\кбн детейл")
ROOT = Path(__file__).resolve().parent
CLIENT = ROOT / "img" / "works" / "client"

# До/после в слайдерах — шаблонные кадры из dark-detailing (hood-*, headlight-*), не альбом клиента.


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Source folder not found: {SRC}")

    CLIENT.mkdir(parents=True, exist_ok=True)

    files = sorted(SRC.glob("*.jpg")) + sorted(SRC.glob("*.jpeg")) + sorted(SRC.glob("*.png"))
    if not files:
        raise SystemExit(f"No images in {SRC}")

    works: list[Path] = []
    for i, src in enumerate(files, start=1):
        out = CLIENT / f"work-{i:02d}.jpg"
        im = Image.open(src).convert("RGB")
        im.save(out, quality=92)
        works.append(out)
        print(f"work {out.name} <= {src.name} {im.size}")

    meta = ROOT / "img" / "works" / "_import_meta.txt"
    lines = [
        f"works={len(works)}",
        "sliders=template (dark-detailing): hood-before/after, headlight-before/after",
    ]
    meta.write_text("\n".join(lines), encoding="utf-8")
    print("done")


if __name__ == "__main__":
    main()
