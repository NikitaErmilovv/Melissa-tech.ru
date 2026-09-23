from pathlib import Path

root = Path(r"D:\Работа\Работы\Детейлинг\Var Second (GPT1)\Melissa-tech.ru")
path = root / "avtoblesk-novokuznetsk" / "wrap-configurator.js"
logic = (root / "_tmp_configurator" / "_logic.js").read_bytes()

split_marker = b"function splitMercedesRearQuarters"
source_start = (
    logic.index(split_marker)
    if split_marker in logic
    else logic.index(b"function buildZones")
)
source_end = logic.index(b"function coverMercedesPlate")
replacement = logic[source_start:source_end]

tail_size = 220_000
with path.open("r+b") as stream:
    start = max(0, path.stat().st_size - tail_size)
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

print("Synchronized Mercedes zone mapping")
