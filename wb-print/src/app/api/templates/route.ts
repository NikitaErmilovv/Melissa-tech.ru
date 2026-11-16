import { fail } from "@/lib/http";
import { saveTemplates } from "@/lib/panel";
import type { Templates } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<Templates>;
    await saveTemplates(body);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
