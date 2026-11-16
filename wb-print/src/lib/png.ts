import zlib from "zlib";

const DIGIT: Record<string, string[]> = {
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"],
  "7": ["111", "001", "001", "001", "001"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
};

const PAPERS: [number, number, number][] = [
  [214, 186, 158],
  [196, 168, 142],
  [176, 154, 132],
  [206, 176, 150],
  [188, 160, 138],
  [168, 146, 126],
];

function crc32(buf: Buffer): number {
  let c = ~0 >>> 0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const name = Buffer.from(type);
  const body = Buffer.concat([name, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function paintDigit(
  pixels: Buffer,
  width: number,
  digit: string,
  x0: number,
  y0: number,
  scale: number,
  rgb: [number, number, number],
) {
  const rows = DIGIT[digit];
  if (!rows) return;
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== "1") continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = x0 + x * scale + sx;
          const py = y0 + y * scale + sy;
          const i = (py * width + px) * 3;
          pixels[i] = rgb[0];
          pixels[i + 1] = rgb[1];
          pixels[i + 2] = rgb[2];
        }
      }
    }
  });
}

export function demoPhoto(index: number): Buffer {
  const width = 180;
  const height = 220;
  const paper = PAPERS[index % PAPERS.length];
  const ink: [number, number, number] = [42, 32, 24];
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    const shade = 1 - y / height / 6;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const edge = x < 10 || y < 10 || x > width - 11 || y > height - 11;
      pixels[i] = edge ? ink[0] : Math.round(paper[0] * shade);
      pixels[i + 1] = edge ? ink[1] : Math.round(paper[1] * shade);
      pixels[i + 2] = edge ? ink[2] : Math.round(paper[2] * shade);
    }
  }
  const label = String(index).padStart(2, "0");
  const scale = 8;
  const block = 3 * scale;
  const gap = 6;
  const total = label.length * block + (label.length - 1) * gap;
  let x = Math.round((width - total) / 2);
  const y = Math.round(height / 2 - (5 * scale) / 2);
  for (const ch of label) {
    paintDigit(pixels, width, ch, x, y, scale, ink);
    x += block + gap;
  }

  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    pixels.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return png;
}
