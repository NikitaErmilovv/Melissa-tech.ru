from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parent
logic_bytes = (root / "_tmp_configurator" / "_logic.js").read_bytes()

split_marker = b"function splitMercedesRearQuarters"
source_start = (
    logic_bytes.index(split_marker)
    if split_marker in logic_bytes
    else logic_bytes.index(b"function buildZones")
)
source_end = logic_bytes.index(b"function coverMercedesPlate")
replacement = logic_bytes[source_start:source_end]

legacy = root / "avtoblesk-novokuznetsk" / "wrap-configurator.js"
if legacy.is_file() and legacy.stat().st_size > 1_000_000:
    tail_size = 220_000
    with legacy.open("r+b") as stream:
        start = max(0, legacy.stat().st_size - tail_size)
        stream.seek(start)
        data = stream.read()
        target_start = (
            data.index(split_marker)
            if split_marker in data
            else data.index(b"function buildZones")
        )
        target_end = data.index(b"function coverMercedesPlate")
        data = data[:target_start] + replacement + data[target_end:]
        stream.seek(start)
        stream.write(data)
        stream.truncate()
    print("Synchronized legacy wrap-configurator.js tail")

subprocess.run([sys.executable, str(root / "_build_wrap_fast.py")], check=True)
