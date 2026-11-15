import { ingest } from "@/lib/bot";
import { fail } from "@/lib/http";
import { demoPhoto } from "@/lib/png";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderId?: string;
      articleId?: string;
      text?: string;
      clientName?: string;
      photoCount?: number;
      wbOrderId?: string;
    };
    const count = Math.max(0, Math.min(40, Math.round(Number(body.photoCount) || 0)));
    const text = (body.text || "").trim();
    if (!text && count === 0) throw new Error("напишите текст или укажите, сколько фото приложить");
    const images = Array.from({ length: count }, (_, index) => ({
      bytes: demoPhoto(index + 1),
      source: "demo" as const,
    }));
    const result = await ingest({
      source: "demo",
      orderId: body.orderId,
      articleId: body.articleId,
      text,
      clientName: body.clientName || "Покупатель",
      wbOrderId: body.wbOrderId,
      chatId: body.orderId ? undefined : `demo:${Date.now().toString(36)}`,
      images,
    });
    return Response.json(result);
  } catch (error) {
    return fail(error);
  }
}
