"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isValidRuPhone, normalizePhone } from "@/lib/phone";
import { requireUser } from "@/actions/auth";

async function activeSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      remainingClasses: { gt: 0 },
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "asc" },
  });
}

export async function bookClassAction(classId: string) {
  const user = await requireUser();
  if (user.role === "STUDENT") {
    return {
      error: "Запись на занятия в школе не нужна — просто приходите по расписанию.",
    };
  }
  const danceClass = await prisma.danceClass.findUnique({
    where: { id: classId },
    include: { bookings: { where: { status: "BOOKED" } } },
  });
  if (!danceClass) return { error: "Занятие не найдено." };
  if (danceClass.startsAt < new Date()) return { error: "Это занятие уже прошло." };
  if (danceClass.bookings.some((b) => b.userId === user.id)) {
    return { error: "Вы уже записаны." };
  }
  if (danceClass.bookings.length >= danceClass.capacity) {
    return { error: "Свободных мест нет." };
  }
  const sub = await activeSubscription(user.id);
  if (!sub) return { error: "Нужен активный абонемент с оставшимися занятиями." };

  await prisma.booking.create({
    data: { userId: user.id, classId, status: "BOOKED" },
  });
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Вы записаны",
      body: `Бронь на «${danceClass.title}» подтверждена. Занятие спишется после отметки посещения.`,
    },
  });
  revalidatePath("/schedule");
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/classes");
  return { ok: true };
}

export async function cancelBookingAction(bookingId: string) {
  const user = await requireUser();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { class: true, attendance: true },
  });
  if (!booking || booking.userId !== user.id) return { error: "Запись не найдена." };
  if (booking.attendance) return { error: "Посещение уже отмечено — отменить нельзя." };
  await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/classes");
  revalidatePath("/schedule");
  return { ok: true };
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  if (!name || !phoneRaw) return;
  if (!isValidRuPhone(phoneRaw)) return;
  const phone = normalizePhone(phoneRaw);
  await prisma.user.update({ where: { id: user.id }, data: { name, phone } });
  revalidatePath("/cabinet/profile");
  revalidatePath("/cabinet");
}

export async function markNotificationsReadAction() {
  const user = await requireUser();
  await prisma.notification.updateMany({ where: { userId: user.id }, data: { read: true } });
  revalidatePath("/cabinet/notifications");
}
