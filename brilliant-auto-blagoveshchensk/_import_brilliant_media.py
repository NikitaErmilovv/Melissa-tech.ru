# Copy D:\Бриллиант авто -> img/works/by-service/
import json
import re
import shutil
from pathlib import Path

SRC = Path(r"D:\Бриллиант авто")
ROOT = Path(__file__).resolve().parent
DST = ROOT / "img" / "works" / "by-service"


def _norm(name: str) -> str:
    return name.lower().replace("ё", "е").strip()


def match_folder(name: str):
    n = _norm(name)
    if n.startswith("главное фото"):
        return None
    if "антихром" in n:
        return "03-antihrom", "Антихром"
    if "замена цвета" in n:
        return "02-zamena-tsveta", "Замена цвета"
    if "установка защит" in n:
        return "01-zashchitnaya-plenka", "Установка защитной плёнки"
    if "шумоизоля" in n:
        return "07-shumoisolyatsiya", "Шумоизоляция"
    if "керамик" in n:
        return "09-zashchitnye-sostavy", "Нанесение защитных составов"
    if "бронирование лобового" in n or "атермаль" in n:
        return "05-06-steklo", "Бронирование лобового стекла · атермальная плёнка"
    return None


def slugify(name: str) -> str:
    base = re.sub(r"[^\w\-]+", "-", name, flags=re.UNICODE).strip("-").lower()
    return base[:80] or "file"


def main():
    manifest = []
    if not SRC.is_dir():
        raise SystemExit(f"Source not found: {SRC}")
    if DST.exists():
        shutil.rmtree(DST)
    DST.mkdir(parents=True, exist_ok=True)

    for folder_path in sorted(p for p in SRC.iterdir() if p.is_dir()):
        pair = match_folder(folder_path.name)
        if not pair:
            print("skip:", folder_path.name.encode("unicode_escape").decode())
            continue
        slug, title = pair
        target_dir = DST / slug
        target_dir.mkdir(parents=True, exist_ok=True)
        for src_file in sorted(folder_path.iterdir()):
            if not src_file.is_file():
                continue
            dest_name = slugify(src_file.stem) + src_file.suffix.lower()
            dest = target_dir / dest_name
            shutil.copy2(src_file, dest)
            rel = dest.relative_to(ROOT).as_posix()
            kind = "video" if src_file.suffix.lower() in {".mp4", ".webm", ".mov"} else "image"
            manifest.append({"service": title, "slug": slug, "path": rel, "kind": kind})

    out = ROOT / "img" / "works" / "media-manifest.json"
    out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Copied {len(manifest)} files")


if __name__ == "__main__":
    main()
