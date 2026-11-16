import { fail } from "@/lib/http";
import { saveSettings } from "@/lib/panel";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      clearToken?: boolean;
      silenceMin?: number;
      remindMin?: number;
      liveReplies?: boolean;
    };
    await saveSettings(body);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
