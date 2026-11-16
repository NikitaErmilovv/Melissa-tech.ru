import fs from "fs";
import JSZip from "jszip";
import { readDb } from "@/lib/db";
import { fail } from "@/lib/http";
import { safeAbs } from "@/lib/paths";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const order = readDb().orders.find((item) => item.id === id);
    if (!order) return fail(new Error("заказ не найден"), 404);
    if (order.files.length === 0) return fail(new Error("в папке нет фото"));
    const zip = new JSZip();
    for (const file of order.files) {
      const abs = safeAbs(file.relPath);
      if (!abs || !fs.existsSync(abs)) continue;
      zip.file(file.name, fs.readFileSync(abs));
    }
    const out = await zip.generateAsync({ type: "nodebuffer" });
    const label = order.kind === "sticker" ? "шт" : "фото";
    const filename = `${order.wbOrderId}_${order.expectedPhotos || order.files.length}${label}.zip`;
    return new Response(new Uint8Array(out), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    return fail(error, 500);
  }
}
