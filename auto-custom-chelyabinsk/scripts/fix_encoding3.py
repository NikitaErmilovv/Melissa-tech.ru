# -*- coding: utf-8 -*-
from pathlib import Path
import subprocess
import re

root = Path(__file__).resolve().parents[2]
dk = root / "delaikuzov"
report = dk / "scripts" / "_enc_report.txt"


def log(msg: str) -> None:
    with report.open("a", encoding="utf-8") as f:
        f.write(msg + "\n")


def main() -> None:
    report.write_text("", encoding="utf-8")
    wt = (dk / "services.html").read_bytes()
    log(f"len={len(wt)} bom={wt[:3]==bytes([0xEF,0xBB,0xBF])}")

    # strip bom
    body = wt[3:] if wt[:3] == bytes([0xEF, 0xBB, 0xBF]) else wt
    text = body.decode("utf-8")
    log("first_title_chars=" + text[text.find("<title>") + 7 : text.find("</title>")])

    # Try: mojibake string is utf-8 interpreted chars that should be re-decoded
    # Method: encode to latin1 (get original bytes if they were <256) then decode utf-8
    for name, enc in [("latin1", "latin1"), ("cp1251", "cp1251"), ("cp1252", "cp1252")]:
        try:
            raw2 = text.encode(enc)
            fixed = raw2.decode("utf-8")
            ok = ("Делай" in fixed) and ("Услуг" in fixed)
            log(f"undo via {name}: ok={ok} title_snip={fixed[fixed.find('<title>')+7:fixed.find('</title>')] if ok else fixed[200:260]!r}")
            if ok:
                (dk / "services.html").write_text(fixed, encoding="utf-8", newline="\n")
                log("WROTE services.html fixed")
                break
        except Exception as e:
            log(f"undo via {name}: ERR {type(e).__name__}: {e}")

    # Rebuild from good base + current structure using wash pages as template for Russian OK
    good_services = subprocess.check_output(
        ["git", "show", "64e0787:delaikuzov/services.html"], cwd=root
    )
    log(f"good64 title={(re.search(br'<title>(.*?)</title>', good_services).group(1).decode('utf-8'))}")
    log(f"good64 Делай count={good_services.count('Делай'.encode())}")

    # Current wash is good — use as proof
    wash = (dk / "services/wash.html").read_text(encoding="utf-8")
    log(f"wash title ok={'Детейлинг-мойка' in wash}")


if __name__ == "__main__":
    main()
