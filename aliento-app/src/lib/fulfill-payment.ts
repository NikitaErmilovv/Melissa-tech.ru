import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function fulfillPlanPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { error: "Платёж не найден." as const };
  if (payment.status === "PAID") return { ok: true as const, alreadyPaid: true as const };
  if (!payment.planId) return { error: "Платёж не связан с абонементом." as const };

  const plan = await prisma.plan.findUnique({ where: { id: payment.planId } });
  if (!plan) return { error: "Тариф не найден." as const };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

  const subscription = await prisma.subscription.create({
    data: {
      userId: payment.userId,
      planId: plan.id,
      totalClasses: plan.classCount,
      remainingClasses: plan.classCount,
      expiresAt,
      status: "ACTIVE",
    },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      subscriptionId: subscription.id,
      purpose: `Оплата: ${plan.name}`,
    },
  });

  await prisma.notification.create({
    data: {
      userId: payment.userId,
      title: "Абонемент выдан",
      body: `${plan.name}: ${plan.classCount} ч, действует до ${expiresAt.toLocaleDateString("ru-RU")}.`,
    },
  });

  revalidatePath("/cabinet");
  revalidatePath("/cabinet/subscriptions");
  revalidatePath("/subscriptions");
  revalidatePath("/admin/payments");

  return { ok: true as const };
}
