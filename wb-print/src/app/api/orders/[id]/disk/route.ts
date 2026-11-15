import { downloadIntoOrder } from "@/lib/bot";
import { fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const result = await downloadIntoOrder(id, body.url);
    return Response.json(result);
  } catch (error) {
    return fail(error);
  }
}
