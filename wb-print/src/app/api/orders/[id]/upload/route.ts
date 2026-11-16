import { fail } from "@/lib/http";
import { addUploads } from "@/lib/panel";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const form = await request.formData();
    const buffers: Buffer[] = [];
    for (const entry of form.getAll("files")) {
      if (entry instanceof File) buffers.push(Buffer.from(await entry.arrayBuffer()));
    }
    if (buffers.length === 0) throw new Error("выберите фото");
    const result = await addUploads(id, buffers);
    return Response.json(result);
  } catch (error) {
    return fail(error);
  }
}
