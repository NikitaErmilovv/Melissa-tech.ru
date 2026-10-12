# -*- coding: utf-8 -*-
"""Restore double-encoded UTF-8 (cp1251 mojibake) HTML files."""
from pathlib import Path

dk = Path(__file__).resolve().parents[1]
report = Path(__file__).resolve().parent / "_enc_report.txt"


def undo_cp1251_mojibake(data: bytes) -> str:
    if data.startswith(b"\xef\xbb\xbf"):
        data = data[3:]
    text = data.decode("utf-8")
    out = bytearray()
    skipped = []
    for i, ch in enumerate(text):
        try:
            out.extend(ch.encode("cp1251"))
        except UnicodeEncodeError:
            # common leftovers from UTF-8 punctuation mis-decoded
            repl = {
                "\u0080": b"\x80",
                "\u0081": b"\x81",
                "\u0082": b"\x82",
                "\u0083": b"\x83",
                "\u0084": b"\x84",
                "\u0085": b"\x85",
                "\u0086": b"\x86",
                "\u0087": b"\x87",
                "\u0088": b"\x88",
                "\u0089": b"\x89",
                "\u008a": b"\x8a",
                "\u008b": b"\x8b",
                "\u008c": b"\x8c",
                "\u008d": b"\x8d",
                "\u008e": b"\x8e",
                "\u008f": b"\x8f",
                "\u0090": b"\x90",
                "\u0091": b"\x91",
                "\u0092": b"\x92",
                "\u0093": b"\x93",
                "\u0094": b"\x94",
                "\u0095": b"\x95",
                "\u0096": b"\x96",
                "\u0097": b"\x97",
                "\u0098": b"\x98",
                "\u0099": b"\x99",
                "\u009a": b"\x9a",
                "\u009b": b"\x9b",
                "\u009c": b"\x9c",
                "\u009d": b"\x9d",
                "\u009e": b"\x9e",
                "\u009f": b"\x9f",
            }.get(ch)
            if repl is not None:
                out.extend(repl)
            else:
                skipped.append((i, ch, hex(ord(ch))))
    fixed = out.decode("utf-8")
    return fixed, skipped


def fix_file(path: Path) -> None:
    raw = path.read_bytes()
    fixed, skipped = undo_cp1251_mojibake(raw)
    ok = ("Делай" in fixed) and (("Услуг" in fixed) or ("ДЕТЕЙЛИНГ" in fixed) or ("ДЕЛАЙ" in fixed))
    lines = [
        f"FILE {path.name}",
        f"ok={ok}",
        f"skipped={len(skipped)} sample={skipped[:5]}",
    ]
    if "<title>" in fixed:
        lines.append("title=" + fixed[fixed.find("<title>") + 7 : fixed.find("</title>")])
    lines.append(f"has_РАБОТАЕМ={'РАБОТАЕМ' in fixed}")
    lines.append(f"has_Детейлинг-мойка={'Детейлинг-мойка' in fixed}")
    lines.append(f"has_services/polish={'services/polish.html' in fixed}")
    with report.open("a", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n\n")
    if ok:
        path.write_text(fixed, encoding="utf-8", newline="\n")
        with report.open("a", encoding="utf-8") as f:
            f.write(f"WROTE {path.name}\n\n")
    else:
        with report.open("a", encoding="utf-8") as f:
            f.write(f"FAILED {path.name}\n\n")


def main() -> None:
    report.write_text("", encoding="utf-8")
    for name in ("services.html", "index.html", "gallery.html"):
        p = dk / name
        if p.exists():
            fix_file(p)

    # ensure server sends charset
    sp = dk / "server.py"
    txt = sp.read_text(encoding="utf-8", errors="replace")
    if "charset=utf-8" not in txt:
        # patch extensions_map / guess type via end_headers override
        needle = "class SiteHandler(SimpleHTTPRequestHandler):"
        if needle in txt and "def end_headers" not in txt:
            inject = '''class SiteHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".txt": "text/plain; charset=utf-8",
    }

'''
            txt = txt.replace(needle + "\n", inject, 1)
            # server.py itself may be mojibake in comments - write carefully
            sp.write_text(txt, encoding="utf-8", newline="\n")
            with report.open("a", encoding="utf-8") as f:
                f.write("patched server.py charset\n")


if __name__ == "__main__":
    main()
