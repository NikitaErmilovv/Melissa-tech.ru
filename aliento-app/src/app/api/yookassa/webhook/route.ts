import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fulfillPlanPayment } from "@/lib/fulfill-payment";
import { fetchYooKassaPayment, isYooKassaConfigured } from "@/lib/yookassa";

type WebhookBody = {
  event?: string;
  object?: { id?: string; status?: string; paid?: boolean };
};

export async function POST(request: Request) {
  if (!isYooKassaConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let body: WebhookBody;
  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = body.event;
  const externalId = body.object?.id;
  if (!externalId) return NextResponse.json({ ok: true });

  if (event !== "payment.succeeded" && event !== "payment.waiting_for_capture") {
    return NextResponse.json({ ok: true });
  }

  const payment = await prisma.payment.findUnique({ where: { externalId } });
  if (!payment) return NextResponse.json({ ok: true });

  try {
    const remote = await fetchYooKassaPayment(externalId);
    if (remote.paid || remote.status === "succeeded") {
      await fulfillPlanPayment(payment.id);
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
