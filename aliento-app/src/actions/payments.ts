"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { fulfillPlanPayment } from "@/lib/fulfill-payment";
import {
  buildPaymentReturnUrl,
  createYooKassaPayment,
  fetchYooKassaPayment,
  isYooKassaConfigured,
} from "@/lib/yookassa";
import { requireUser } from "@/actions/auth";

export async function buyPlanAction(planId: string) {
  const user = await requireUser();
  if (user.role === "STUDENT") {
    return {
      error:
        "Абонемент оформляет администратор школы. Напишите в Telegram или на ресепшене — после оплаты часы появятся в кабинете.",
    };
  }
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Тариф не найден." };

  if (!isYooKassaConfigured()) {
    return {
      error:
        "Онлайн-оплата временно недоступна. Напишите администратору в Telegram — поможем оформить абонемент.",
    };
  }

  const purpose = `Абонемент: ${plan.name}`;
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      subscriptionId: null,
      planId: plan.id,
      amountRub: plan.priceRub,
      status: "PENDING",
      purpose,
    },
  });

  try {
    const { externalId, confirmationUrl } = await createYooKassaPayment({
      amountRub: plan.priceRub,
      description: purpose,
      returnUrl: buildPaymentReturnUrl(payment.id),
      metadata: {
        payment_id: payment.id,
        user_id: user.id,
        plan_id: plan.id,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { externalId },
    });

    revalidatePath("/admin/payments");
    return { ok: true as const, confirmationUrl };
  } catch {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return { error: "Не удалось создать платёж. Попробуйте позже или свяжитесь с администратором." };
  }
}

export async function syncPaymentAction(paymentId: string) {
  const user = await requireUser();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.userId !== user.id) return { error: "Платёж не найден." };

  if (payment.status === "PAID") {
    return { ok: true as const, status: "PAID" as const };
  }

  if (!payment.externalId || !isYooKassaConfigured()) {
    return { error: "Статус платежа пока не подтверждён." };
  }

  try {
    const remote = await fetchYooKassaPayment(payment.externalId);
    if (remote.paid || remote.status === "succeeded") {
      const result = await fulfillPlanPayment(payment.id);
      if ("error" in result) return result;
      return { ok: true as const, status: "PAID" as const };
    }
    if (remote.status === "canceled") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "CANCELLED" } });
      return { ok: true as const, status: "CANCELLED" as const };
    }
    return { ok: true as const, status: "PENDING" as const };
  } catch {
    return { error: "Не удалось проверить статус оплаты. Обновите страницу через минуту." };
  }
}
