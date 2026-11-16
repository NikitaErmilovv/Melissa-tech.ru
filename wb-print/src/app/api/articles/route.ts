import { fail } from "@/lib/http";
import { saveArticle } from "@/lib/panel";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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
