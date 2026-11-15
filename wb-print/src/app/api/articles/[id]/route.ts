import { fail } from "@/lib/http";
import { removeArticle, saveArticle } from "@/lib/panel";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      vendorCode?: string;
      nmId?: number | string | null;
      title?: string;
      photoCount?: number;
      note?: string;
      kind?: "sticker" | "photo";
    };
    const nmRaw = body.nmId === "" || body.nmId == null ? null : Number(body.nmId);
    if (nmRaw != null && !Number.isFinite(nmRaw)) throw new Error("nmId должен быть числом");
    await saveArticle({
      id,
      vendorCode: body.vendorCode || "",
      nmId: nmRaw,
      title: body.title || "",
      photoCount: Number(body.photoCount),
      note: body.note || "",
      kind: body.kind === "photo" ? "photo" : "sticker",
    });
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await removeArticle(id);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
