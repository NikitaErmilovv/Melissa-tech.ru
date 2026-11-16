import { readDb } from "@/lib/db";
import type { PublicOrder, PublicState } from "@/lib/types";
import { startWorker, workerSnapshot } from "@/lib/worker";

export const dynamic = "force-dynamic";

export function GET() {
  startWorker();
  const db = readDb();
  const orders: PublicOrder[] = db.orders.map(({ replySign: _sign, pendingDownloads, ...order }) => ({
    ...order,
    pending: pendingDownloads.length,
  }));
  const token = db.settings.token.trim();
  const body: PublicState = {
    now: new Date().toISOString(),
    orders,
    articles: db.articles,
    templates: db.templates,
    settings: {
      tokenSet: Boolean(token),
      tokenTail: token ? token.slice(-4) : "",
      silenceMin: db.settings.silenceMin,
      remindMin: db.settings.remindMin,
      liveReplies: Boolean(db.settings.liveReplies),
      fbsCount: db.fbsOrders.length,
      eventsReady: Boolean(db.settings.eventCaughtUp),
    },
    worker: workerSnapshot(),
  };
  return Response.json(body);
}
