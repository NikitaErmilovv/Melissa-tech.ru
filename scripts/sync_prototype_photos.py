# -*- coding: utf-8 -*-
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
PHOTOS = Path(r"C:\Users\Никита\Work\Фото для прототипов")


def sync_project(name: str, prefix: str, src_folder: str):
    src = PHOTOS / src_folder
    dest = ROOT / name / "img" / "works"
    dest.mkdir(parents=True, exist_ok=True)
    files = sorted(src.iterdir(), key=lambda p: p.name.lower())
    files = [f for f in files if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
    if not files:
        raise SystemExit(f"No images in {src}")

    keep = set()
    for i, f in enumerate(files, start=1):
        target = dest / f"{prefix}-{i:02d}.jpg"
        shutil.copy2(f, target)
        keep.add(target.name)

    shutil.copy2(dest / f"{prefix}-01.jpg", dest / "hero.jpg")
    keep.add("hero.jpg")
    for n, key in enumerate(["work-01.jpg", "work-02.jpg", "work-03.jpg"], start=2):
        if n <= len(files):
            shutil.copy2(dest / f"{prefix}-{n:02d}.jpg", dest / key)
            keep.add(key)

    for p in list(dest.iterdir()):
        if p.is_file() and p.name not in keep:
            p.unlink()
    print(f"{name}: {len(files)} photos from {src}")


if __name__ == "__main__":
    sync_project("altay-toner", "altay", "АлтайТонер")
    sync_project("brooklyn-detailing", "brooklyn", "Бруклин")
