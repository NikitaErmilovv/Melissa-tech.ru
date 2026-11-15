import { intakeDiskUrl, intakeUploadFiles } from "@/lib/intake-actions";
import { orderByIntakeToken, publicIntakeView } from "@/lib/intake-token";
import { fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const order = orderByIntakeToken(token);
    if (!order) throw new Error("ссылка недействительна");
    return Response.json({ view: publicIntakeView(order) });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const buffers: Buffer[] = [];
      for (const entry of form.getAll("files")) {
        if (entry instanceof File) buffers.push(Buffer.from(await entry.arrayBuffer()));
      }
      if (buffers.length === 0) throw new Error("выберите хотя бы одно фото");
      const result = await intakeUploadFiles(token, buffers);
      return Response.json(result);
    }
    const body = (await request.json().catch(() => ({}))) as { diskUrl?: string };
    if (!body.diskUrl?.trim()) throw new Error("нужны файлы или ссылка на диск");
    const result = await intakeDiskUrl(token, body.diskUrl);
    return Response.json(result);
  } catch (error) {
    return fail(error);
  }
}