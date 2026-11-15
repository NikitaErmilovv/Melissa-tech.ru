import { forceRemind } from "@/lib/bot";
import { fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await forceRemind(id);
    return Response.json(result);
  } catch (error) {
    return fail(error);
  }
}
