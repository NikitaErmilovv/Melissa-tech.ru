import fs from "fs";
import path from "path";

export function dataRoot(): string {
  return path.join(process.cwd(), "data");
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function safeAbs(rel: string): string | null {
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) return null;
  const root = path.resolve(dataRoot());
  const abs = path.resolve(root, rel);
  if (abs !== root && !abs.startsWith(root + path.sep)) return null;
  return abs;
}

export function ensureDir(abs: string) {
  fs.mkdirSync(abs, { recursive: true });
}
