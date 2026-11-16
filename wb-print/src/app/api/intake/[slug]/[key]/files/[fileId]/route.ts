import fs from "fs";
import { intakeRemoveFile } from "@/lib/intake-actions";
import { fail } from "@/lib/http";
import { orderByIntakeRoute } from "@/lib/intake-token";
import { safeAbs } from "@/lib/paths";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string; key: string; fileId: string }> },
) {
  const { slug, key, fileId } = await context.params;
  const order = orderByIntakeRoute(slug, key);
  if (!order) return new Response("нет доступа", { status: 404 });
  const file = order.files.find((item) => item.id === fileId);
  if (!file) return new Response("нет файла", { status: 404 });
  const abs = safeAbs(file.relPath);
  if (!abs || !fs.existsSync(abs)) return new Response("файл не найден", { status: 404 });
  const bytes = fs.readFileSync(abs);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string; key: string; fileId: string }> },
) {
  try {
    const { slug, key, fileId } = await context.params;
    const order = orderByIntakeRoute(slug, key);
    if (!order) throw new Error("ссылка недействительна");
    const result = await intakeRemoveFile(order.id, fileId);
    return Response.json(result);
  } catch (error) {
    return fail(error);
  }
}