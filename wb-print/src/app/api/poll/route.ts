import { fail } from "@/lib/http";
import { tick } from "@/lib/worker";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const count = await tick();
    return Response.json({ ok: true, count });
  } catch (error) {
    return fail(error);
  }
}
