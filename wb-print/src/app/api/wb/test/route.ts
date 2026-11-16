import { readDb } from "@/lib/db";
import { pullEvents } from "@/lib/wb";

export const dynamic = "force-dynamic";

export async function POST() {
  const token = readDb().settings.token.trim();
  if (!token) {
    return Response.json({ ok: false, message: "Сначала вставьте токен и сохраните." });
  }
  try {
    await pullEvents(token, Date.now());
    const market = await fetch("https://marketplace-api.wildberries.ru/api/v3/orders/new", {
      headers: { Authorization: token },
      signal: AbortSignal.timeout(20000),
    });
    if (!market.ok) {
      return Response.json({
        ok: true,
        message: "Чат отвечает. Маркетплейс этим токеном не открылся: для номера заказа и отмен нужна категория «Маркетплейс». Старые чаты не забираем.",
      });
    }
    return Response.json({
      ok: true,
      message: "Токен подходит. Старые переписки и заказы без сообщения не забираем. Папка появится, когда покупатель напишет.",
    });
  } catch (error) {
    return Response.json({
      ok: false,
      message: error instanceof Error ? error.message : "токен не подошёл",
    });
  }
}
