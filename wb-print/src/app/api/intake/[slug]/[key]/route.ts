import { intakeUploadFiles } from "@/lib/intake-actions";
import { orderByIntakeRoute, publicIntakeView } from "@/lib/intake-token";
import { fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string; key: string }> }) {
  try {
    const { slug, key } = await context.params;
    const order = orderByIntakeRoute(slug, key);
    if (!order) throw new Error("ссылка недействительна");
    return Response.json({ view: publicIntakeView(order) });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ slug: string; key: string }> }) {
  try {
    const { slug, key } = await context.params;
    const order = orderByIntakeRoute(slug, key);
    if (!order) throw new Error("ссылка недействительна");
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      throw new Error("отправьте фотографии файлами");
    }
    const form = await request.formData();
    const buffers: Buffer[] = [];
    for (const entry of form.getAll("files")) {
      if (entry instanceof File) buffers.push(Buffer.from(await entry.arrayBuffer()));
    }
    if (buffers.length === 0) throw new Error("выберите хотя бы одно фото");
    const result = await intakeUploadFiles(order.id, buffers);
    return Response.json(result);
  } catch (error) {
    return fail(error);
  }
}