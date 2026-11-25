import { validateIntakeBatchUpload } from "@/lib/intake-batch";
import { intakeUploadFiles } from "@/lib/intake-actions";
import { orderByIntakeRoute, publicIntakeView } from "@/lib/intake-token";
import { fail } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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
    const planned: File[] = [];
    const seen = new Set<string>();
    for (const [, entry] of form.entries()) {
      if (!(entry instanceof File) || entry.size < 1) continue;
      const dedupe = `${entry.name}:${entry.size}:${entry.lastModified}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      planned.push(entry);
    }
    const batchErr = validateIntakeBatchUpload(order, planned.length);
    if (batchErr) throw new Error(batchErr);
    const buffers: Buffer[] = [];
    for (const file of planned) {
      buffers.push(Buffer.from(await file.arrayBuffer()));
    }
    const result = await intakeUploadFiles(order.id, buffers);
    return Response.json(result);
  } catch (error) {
    return fail(error);
  }
}