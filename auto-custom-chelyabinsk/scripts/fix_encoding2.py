# -*- coding: utf-8 -*-
from pathlib import Path
import subprocess
import re

root = Path(__file__).resolve().parents[2]
dk = root / "delaikuzov"
out = dk / "scripts" / "_enc_report.txt"


def git_bytes(rev_path: str) -> bytes:
    return subprocess.check_output(["git", "show", rev_path], cwd=root)


def try_undo(data: bytes) -> bytes | None:
    bom = data.startswith(b"\xef\xbb\xbf")
    body = data[3:] if bom else data
    text = body.decode("utf-8")
    for enc in ("cp1251", "cp866", "latin1"):
        try:
            fixed = text.encode(enc).decode("utf-8")
        except Exception:
            continue
        fb = fixed.encode("utf-8")
        if "Делай".encode("utf-8") in fb and "Услуг".encode("utf-8") in fb:
            return fb
    return None


def main() -> None:
    lines = []
    bom3 = b"\xef\xbb\xbf"
    wt = (dk / "services.html").read_bytes()
    lines.append(f"WT services len={len(wt)} bom={wt.startswith(bom3)}")
    # extract visible title via utf-8
    m = re.search(br"<title>(.*?)</title>", wt, re.S)
    if m:
        tb = m.group(1)
        lines.append(f"title_bytes_hex={tb[:40].hex()}")
        lines.append(f"title_as_utf8={tb.decode('utf-8', 'replace')}")
    fixed = try_undo(wt)
    lines.append(f"undo_ok={fixed is not None}")
    if fixed:
        m2 = re.search(br"<title>(.*?)</title>", fixed, re.S)
        lines.append(f"fixed_title={m2.group(1).decode('utf-8') if m2 else '?'}")
        lines.append(f"fixed_has_РАБОТАЕМ={'РАБОТАЕМ'.encode() in fixed}")

    good = git_bytes("64e0787:delaikuzov/services.html")
    lines.append(f"good64 services len={len(good)} has_Делай={'Делай'.encode() in good}")
    m3 = re.search(br"<title>(.*?)</title>", good, re.S)
    if m3:
        lines.append(f"good_title={m3.group(1).decode('utf-8')}")

    # Also check wash which should be good
    wash = (dk / "services" / "wash.html").read_bytes()
    lines.append(f"wash has_Делай={'Делай'.encode() in wash} has_Детейлинг={'Детейлинг'.encode() in wash}")

    out.write_text("\n".join(lines), encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()
