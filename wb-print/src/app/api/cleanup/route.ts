import { fail } from "@/lib/http";
import { cleanupOld } from "@/lib/panel";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const removed = await cleanupOld();
    return Response.json({
      removed,
      message: removed ? `Убрано папок: ${removed}.` : "Готовых и отменённых старше недели нет.",
    });
  } catch (error) {
    return fail(error);
  }
}
