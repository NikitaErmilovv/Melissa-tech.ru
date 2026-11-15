import { fail } from "@/lib/http";
import { removeOrder, updateOrder } from "@/lib/panel";
import type { PrintStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      printStatus?: PrintStatus;
      expectedPhotos?: number;
      wbOrderId?: string;
      diskUrl?: string;
      articleId?: string;
    };
    await updateOrder(id, body);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await removeOrder(id);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
