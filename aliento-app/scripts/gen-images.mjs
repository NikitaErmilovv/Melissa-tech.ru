import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const src = "public/images/logo.png";

await mkdir("src/app", { recursive: true });
await mkdir("public/images", { recursive: true });

const targets = [
  { out: "src/app/icon.png", size: 512 },
  { out: "src/app/apple-icon.png", size: 180 },
  { out: "public/images/logo-512.png", size: 512 },
  { out: "public/images/logo-192.png", size: 192 },
  { out: "public/images/logo-32.png", size: 32 },
];

for (const t of targets) {
  await sharp(src).resize(t.size, t.size).png().toFile(t.out);
  console.log("wrote", t.out);
}
