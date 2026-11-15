import fs from "fs";
import { readDb } from "@/lib/db";
import { safeAbs } from "@/lib/paths";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ orderId: string; fileId: string }> }) {
  const { orderId, fileId } = await context.params;
  const order = readDb().orders.find((item) => item.id === orderId);
  const file = order?.files.find((item) => item.id === fileId);
  if (!file) return new Response("нет файла", { status: 404 });
  const abs = safeAbs(file.relPath);
  if (!abs || !fs.existsSync(abs)) return new Response("файл не найден на диске", { status: 404 });
  const bytes = fs.readFileSync(abs);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
