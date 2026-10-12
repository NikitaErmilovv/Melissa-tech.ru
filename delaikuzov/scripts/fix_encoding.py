# -*- coding: utf-8 -*-
from pathlib import Path
import subprocess
import re

root = Path(__file__).resolve().parents[2]
dk = root / "delaikuzov"

REAL_USLUGI = "Услуги".encode("utf-8")
REAL_DELAI = "Делай".encode("utf-8")
REAL_RABOTAEM = "РАБОТАЕМ".encode("utf-8")


def git_show(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"HEAD:{path}"], cwd=root)


def git_show_prev(path: str, rev: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{rev}:{path}"], cwd=root)


def analyze(label: str, data: bytes) -> None:
    print(
        label,
        "len=",
        len(data),
        "bom=",
        data.startswith(b"\xef\xbb\xbf"),
        "real_Услуги=",
        REAL_USLUGI in data,
        "real_Делай=",
        REAL_DELAI in data,
        "real_РАБОТАЕМ=",
        REAL_RABOTAEM in data,
    )


def fix_double_utf8(data: bytes) -> bytes:
    """If text was UTF-8 mis-decoded as cp1251 and re-encoded as UTF-8, undo once."""
    bom = data.startswith(b"\xef\xbb\xbf")
    body = data[3:] if bom else data
    try:
        as_text = body.decode("utf-8")
    except UnicodeDecodeError:
        return data
    # Heuristic: lots of mojibake Cyrillic starting with Р/С and missing normal words
    if REAL_DELAI in body and REAL_USLUGI in body:
        return data
    try:
        fixed = as_text.encode("cp1251").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return data
    out = fixed.encode("utf-8")
    return out


def main() -> None:
    for rel in ["delaikuzov/services.html", "delaikuzov/index.html"]:
        analyze(f"HEAD {rel}", git_show(rel))
        analyze(f"WT   {rel}", (root / rel).read_bytes())

    # Find last commit where index had real UTF-8 Делай
    log = subprocess.check_output(
        ["git", "log", "--oneline", "-20", "--", "delaikuzov/index.html"],
        cwd=root,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    print("LOG:\n", log)
    good_rev = None
    for line in log.splitlines():
        rev = line.split()[0]
        blob = git_show_prev("delaikuzov/index.html", rev)
        if REAL_DELAI in blob and REAL_USLUGI.encode("utf-8") if False else REAL_DELAI in blob:
            if REAL_DELAI in blob:
                # confirm not double-encoded: double has Делай as longer sequence
                # Real "Делай" is 10 bytes; check title contains proper short form
                if blob.count(REAL_DELAI) > 0 and b"\xd0\xa0\xe2\x80\x9d\xd0\xa0\xc2\xb5" not in blob[:2000]:
                    good_rev = rev
                    analyze(f"GOOD {rev} index", blob)
                    break
    print("good_rev=", good_rev)

    # Try auto-fix WT files
    for name in ["services.html", "index.html"]:
        path = dk / name
        raw = path.read_bytes()
        fixed = fix_double_utf8(raw)
        analyze(f"FIX try {name}", fixed)
        if REAL_DELAI in fixed or REAL_USLUGI in fixed or REAL_RABOTAEM in fixed:
            path.write_bytes(fixed)
            print("WROTE fixed", name)
        else:
            print("FIX FAILED for", name)


if __name__ == "__main__":
    main()
