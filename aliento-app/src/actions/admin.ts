"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/actions/auth";
import { isAdmin } from "@/lib/format";
import { randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/db";
import { isValidDateOfBirth, normalizeDateOfBirth } from "@/lib/birthdays";
import { isValidRuPhone, normalizePhone } from "@/lib/phone";
import {
  buildRecurringClassStarts,
  DEFAULT_RECURRING_WEEKS,
} from "@/lib/recurring-classes";
import { setNewStudentFlash } from "@/lib/student-issue-flash";
import {
  classDurationHours,
  deductHoursFromActiveSubscription,
  roundHours,
} from "@/lib/subscription-balance";

function makeStudentLoginEmail() {
  return `uch-${randomBytes(4).toString("hex")}@aliento.test`;
}

function makeStudentPassword() {
  return randomBytes(5).toString("hex");
}

export async function createStudentByAdminAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/students?error=Недостаточно прав.");

  const name = String(formData.get("name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const dateOfBirthRaw = String(formData.get("dateOfBirth") || "").trim();
  let email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!name || !phoneRaw) {
    redirect("/admin/students?error=Укажите имя и телефон.");
  }

  let dateOfBirth: string | undefined;
  if (dateOfBirthRaw) {
    const normalized = normalizeDateOfBirth(dateOfBirthRaw);
    if (!normalized || !isValidDateOfBirth(normalized)) {
      redirect("/admin/students?error=Некорректная дата рождения (ДД.ММ.ГГГГ или ГГГГ-ММ-ДД).");
    }
    dateOfBirth = normalized;
  }

  if (!isValidRuPhone(phoneRaw)) {
    redirect("/admin/students?error=Укажите корректный номер телефона.");
  }

  const phone = normalizePhone(phoneRaw);
  if (!email) email = makeStudentLoginEmail();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) redirect("/admin/students?error=Этот email уже занят.");

  const plainPassword = makeStudentPassword();

  const passwordHash = hashPassword(plainPassword);
  if (!verifyPassword(plainPassword, passwordHash)) {
    redirect("/admin/students?error=Не удалось сохранить пароль. Попробуйте ещё раз.");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      ...(dateOfBirth ? { dateOfBirth } : {}),
      passwordHash,
      role: "STUDENT",
      blocked: false,
      isDemo: false,
      emailVerified: true,
    },
  });

  await setNewStudentFlash({
    studentId: user.id,
    name: user.name,
    login: email,
    pass: plainPassword,
  });

  revalidatePath("/admin/students");
  redirect("/admin/students?created=1");
}

export async function updateStudentProfileAction(formData: FormData) {
  const staff = await requireStaff();
  const studentId = String(formData.get("studentId") || "");
  if (!studentId) redirect("/admin/students?error=Ученик не найден.");

  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student || student.role !== "STUDENT") {
    redirect("/admin/students?error=Ученик не найден.");
  }

  const staffIsAdmin = isAdmin(staff.role);
  const name = String(formData.get("name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const dateOfBirthRaw = String(formData.get("dateOfBirth") || "").trim();
  const emailRaw = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const newPassword = String(formData.get("newPassword") || "");

  if (!name || !phoneRaw) {
    redirect(`/admin/students/${studentId}?error=Укажите имя и телефон.`);
  }

  if (!isValidRuPhone(phoneRaw)) {
    redirect(`/admin/students/${studentId}?error=Некорректный номер телефона.`);
  }

  const phone = normalizePhone(phoneRaw);
  const data: {
    name: string;
    phone: string;
    email?: string;
    dateOfBirth?: string;
    passwordHash?: string;
  } = { name, phone };

  if (staffIsAdmin) {
    if (!emailRaw) {
      redirect(`/admin/students/${studentId}?error=Укажите email для входа.`);
    }
    if (emailRaw !== student.email) {
      const taken = await prisma.user.findUnique({ where: { email: emailRaw } });
      if (taken) redirect(`/admin/students/${studentId}?error=Этот email уже занят.`);
      data.email = emailRaw;
    }

    if (dateOfBirthRaw) {
      const normalized = normalizeDateOfBirth(dateOfBirthRaw);
      if (!normalized || !isValidDateOfBirth(normalized)) {
        redirect(`/admin/students/${studentId}?error=Некорректная дата рождения.`);
      }
      data.dateOfBirth = normalized;
    } else {
      data.dateOfBirth = undefined;
    }

    if (newPassword.length > 0) {
      if (newPassword.length < 6) {
        redirect(`/admin/students/${studentId}?error=Новый пароль — не короче 6 символов.`);
      }
      data.passwordHash = hashPassword(newPassword);
    }
  }

  await prisma.user.update({ where: { id: studentId }, data });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/profile");
  redirect(`/admin/students/${studentId}?saved=1`);
}

export async function grantTeacherRoleAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/settings?error=Недостаточно прав.");

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const title = String(formData.get("title") || "Преподаватель").trim();
  const description = String(formData.get("description") || "Преподаватель школы Aliento.").trim();

  if (!email) redirect("/admin/settings?error=Укажите email пользователя.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect("/admin/settings?error=Пользователь с таким email не найден.");
  if (user.role === "OWNER") redirect("/admin/settings?error=Нельзя изменить роль владельца.");

  await prisma.user.update({ where: { id: user.id }, data: { role: "TEACHER" } });
  const existing = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (!existing) {
    await prisma.teacher.create({ data: { userId: user.id, title, description } });
  }

  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function markClassStudentAttendanceAction(
  classId: string,
  userId: string,
  status: "PRESENT" | "ABSENT"
) {
  const staff = await requireStaff();
  const danceClass = await prisma.danceClass.findUnique({
    where: { id: classId },
    include: { teacher: true },
  });
  if (!danceClass) return { error: "Занятие не найдено." };
  if (staff.role === "TEACHER" && danceClass.teacher.userId !== staff.id) {
    return { error: "Можно отмечать только свои занятия." };
  }

  const student = await prisma.user.findUnique({ where: { id: userId } });
  if (!student || student.role !== "STUDENT") return { error: "Ученик не найден." };

  const marked = await prisma.attendance.findMany({ where: { classId, userId } });
  if (marked.length > 0) return { error: "Посещение уже отмечено." };

  let booking = await prisma.booking.findFirst({
    where: { classId, userId, status: "BOOKED" },
  });
  if (!booking) {
    booking = await prisma.booking.create({
      data: { userId, classId, status: "BOOKED" },
    });
  }

  await prisma.attendance.create({
    data: {
      bookingId: booking.id,
      userId,
      classId,
      status,
    },
  });

  if (status === "PRESENT") {
    const hours = classDurationHours(danceClass.startsAt, danceClass.endsAt);
    await deductHoursFromActiveSubscription(userId, hours);
  }

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${classId}`);
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/classes");
  revalidatePath("/cabinet/subscriptions");
  return { ok: true };
}

export async function markAttendanceAction(bookingId: string, status: "PRESENT" | "ABSENT") {
  const staff = await requireStaff();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { class: { include: { teacher: true } }, attendance: true },
  });
  if (!booking || booking.status !== "BOOKED") return { error: "Запись не найдена." };
  if (staff.role === "TEACHER" && booking.class.teacher.userId !== staff.id) {
    return { error: "Можно отмечать только свои занятия." };
  }
  if (booking.attendance) return { error: "Посещение уже отмечено." };

  await prisma.attendance.create({
    data: {
      bookingId: booking.id,
      userId: booking.userId,
      classId: booking.classId,
      status,
    },
  });

  if (status === "PRESENT") {
    const hours = classDurationHours(booking.class.startsAt, booking.class.endsAt);
    await deductHoursFromActiveSubscription(booking.userId, hours);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/classes");
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/subscriptions");
  return { ok: true };
}

export async function toggleBlockUserAction(userId: string) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) return { error: "Недостаточно прав." };
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Ученик не найден." };
  await prisma.user.update({ where: { id: userId }, data: { blocked: !user.blocked } });
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${userId}`);
  return { ok: true };
}

export async function createClassAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/classes?error=Недостаточно прав.");

  const title = String(formData.get("title") || "").trim();
  const level = String(formData.get("level") || "").trim();
  const teacherId = String(formData.get("teacherId") || "");
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const duration = Number(formData.get("duration") || 90);
  const room = String(formData.get("room") || "").trim();
  const capacity = Number(formData.get("capacity") || 20);

  if (!title || !level || !teacherId || !date || !time || !room) {
    redirect("/admin/classes?error=Заполните все поля занятия.");
  }

  const weekdays = formData
    .getAll("weekdays")
    .map((v) => Number(v))
    .filter((d) => d >= 0 && d <= 6);
  const weeksAhead = Math.min(
    52,
    Math.max(1, Number(formData.get("weeksAhead") || DEFAULT_RECURRING_WEEKS))
  );

  const startsList =
    weekdays.length > 0
      ? buildRecurringClassStarts({ anchorDateIso: date, time, weekdays, weeksAhead })
      : [];

  if (weekdays.length > 0 && startsList.length === 0) {
    redirect("/admin/classes?error=Не удалось построить расписание по выбранным дням.");
  }

  const base = {
    teacherId,
    title,
    level,
    description: `${title} — ${level.toLowerCase()}.`,
    room,
    capacity,
    venueId: "venue-dekadance",
    isDemo: false,
  };

  if (startsList.length > 0) {
    const now = Date.now();
    const slots = startsList.filter((startsAt) => startsAt.getTime() >= now - duration * 60_000);
    if (slots.length === 0) {
      redirect("/admin/classes?error=Все слоты в прошлом — укажите дату ближе к сегодня.");
    }
    for (const startsAt of slots) {
      const endsAt = new Date(startsAt.getTime() + duration * 60_000);
      await prisma.danceClass.create({
        data: { ...base, startsAt, endsAt },
      });
    }
    revalidatePath("/admin/classes");
    revalidatePath("/schedule");
    revalidatePath("/");
    redirect(`/admin/classes?created=1&count=${slots.length}`);
  }

  const startsAt = new Date(`${date}T${time}`);
  if (Number.isNaN(startsAt.getTime())) {
    redirect("/admin/classes?error=Некорректная дата или время.");
  }
  const endsAt = new Date(startsAt.getTime() + duration * 60_000);

  await prisma.danceClass.create({
    data: { ...base, startsAt, endsAt },
  });

  revalidatePath("/admin/classes");
  revalidatePath("/schedule");
  revalidatePath("/");
  redirect("/admin/classes?created=1");
}

export async function deleteClassAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/classes?error=Недостаточно прав.");
  const id = String(formData.get("classId") || "");
  if (!id) redirect("/admin/classes?error=Занятие не найдено.");
  await prisma.danceClass.delete({ where: { id } });
  revalidatePath("/admin/classes");
  revalidatePath("/schedule");
  redirect("/admin/classes?deleted=1");
}

export async function createPlanAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/plans?error=Недостаточно прав.");

  const name = String(formData.get("name") || "").trim();
  const classCount = Number(formData.get("classCount") || 0);
  const durationDays = Number(formData.get("durationDays") || 0);
  const priceRub = Number(formData.get("priceRub") || 0);
  const description = String(formData.get("description") || "").trim();
  const popular = formData.get("popular") === "on";

  if (!name || classCount <= 0 || durationDays <= 0 || priceRub <= 0) {
    redirect("/admin/plans?error=Проверьте название, количество занятий, срок и цену.");
  }

  await prisma.plan.create({
    data: { name, classCount, durationDays, priceRub, popular, description },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/subscriptions");
  revalidatePath("/");
  redirect("/admin/plans?created=1");
}

export async function togglePlanPopularAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/plans?error=Недостаточно прав.");
  const id = String(formData.get("planId") || "");
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) redirect("/admin/plans?error=Тариф не найден.");
  await prisma.plan.update({ where: { id }, data: { popular: !plan.popular } });
  revalidatePath("/admin/plans");
  revalidatePath("/subscriptions");
  redirect("/admin/plans");
}

export async function deletePlanAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/plans?error=Недостаточно прав.");
  const id = String(formData.get("planId") || "");
  await prisma.plan.delete({ where: { id } });
  revalidatePath("/admin/plans");
  revalidatePath("/subscriptions");
  redirect("/admin/plans?deleted=1");
}

export async function grantSubscriptionAction(formData: FormData) {
  const staff = await requireStaff();

  const studentId = String(formData.get("studentId") || "");
  const planId = String(formData.get("planId") || "");
  if (!studentId || !planId) {
    redirect(`/admin/students/${studentId || ""}?error=Выберите тариф.`);
  }

  const [student, plan] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId } }),
    prisma.plan.findUnique({ where: { id: planId } }),
  ]);
  if (!student || student.role !== "STUDENT") {
    redirect(`/admin/students?error=Ученик не найден.`);
  }
  if (!plan) redirect(`/admin/students/${studentId}?error=Тариф не найден.`);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

  await prisma.subscription.create({
    data: {
      userId: student.id,
      planId: plan.id,
      totalClasses: plan.classCount,
      remainingClasses: plan.classCount,
      expiresAt,
      status: "ACTIVE",
    },
  });

  await prisma.notification.create({
    data: {
      userId: student.id,
      title: "Абонемент выдан",
      body: `Школа выдала «${plan.name}»: ${plan.classCount} ч до ${expiresAt.toLocaleDateString("ru-RU")}.`,
    },
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/plans");
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/subscriptions");
  redirect(`/admin/students/${studentId}?granted=1`);
}

export async function adjustSubscriptionHoursAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/students?error=Недостаточно прав.");

  const subscriptionId = String(formData.get("subscriptionId") || "");
  const studentId = String(formData.get("studentId") || "");
  const addHours = Number(formData.get("addHours") || 0);
  if (!subscriptionId || addHours <= 0) {
    redirect(`/admin/students/${studentId}?error=Укажите количество часов.`);
  }

  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) redirect(`/admin/students/${studentId}?error=Абонемент не найден.`);

  const remaining = roundHours(sub.remainingClasses + addHours);
  const total = roundHours(Math.max(sub.totalClasses, remaining));
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      remainingClasses: remaining,
      totalClasses: total,
      status: "ACTIVE",
    },
  });

  await prisma.notification.create({
    data: {
      userId: sub.userId,
      title: "Начислены часы",
      body: `На абонемент добавлено ${addHours} ч. Остаток: ${remaining} ч.`,
    },
  });

  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/subscriptions");
  redirect(`/admin/students/${studentId}?granted=1`);
}

export async function renewSubscriptionAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/students?error=Недостаточно прав.");

  const subscriptionId = String(formData.get("subscriptionId") || "");
  const studentId = String(formData.get("studentId") || "");
  const extendDays = Number(formData.get("extendDays") || 0);
  const refillHours = formData.get("refillHours") === "1";

  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) redirect(`/admin/students/${studentId}?error=Абонемент не найден.`);
  const plan = await prisma.plan.findUnique({ where: { id: sub.planId } });
  if (!plan) redirect(`/admin/students/${studentId}?error=Тариф не найден.`);
  if (extendDays <= 0) redirect(`/admin/students/${studentId}?error=Укажите срок продления.`);

  const base = sub.expiresAt.getTime() < Date.now() ? new Date() : new Date(sub.expiresAt);
  const expiresAt = new Date(base);
  expiresAt.setDate(expiresAt.getDate() + extendDays);

  const remaining = refillHours ? plan.classCount : sub.remainingClasses;
  const total = refillHours ? plan.classCount : roundHours(Math.max(sub.totalClasses, remaining));

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      expiresAt: expiresAt.toISOString(),
      remainingClasses: roundHours(remaining),
      totalClasses: roundHours(total),
      status: remaining > 0 ? "ACTIVE" : "EXHAUSTED",
    },
  });

  await prisma.notification.create({
    data: {
      userId: sub.userId,
      title: "Абонемент продлён",
      body: `Срок действия до ${expiresAt.toLocaleDateString("ru-RU")}. Остаток: ${roundHours(remaining)} ч.`,
    },
  });

  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/subscriptions");
  redirect(`/admin/students/${studentId}?granted=1`);
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) return { error: "Недостаточно прав." };

  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) return { error: "Абонемент не найден." };
  if (sub.status !== "ACTIVE") return { error: "Можно деактивировать только активный абонемент." };

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELLED", remainingClasses: 0 },
  });

  await prisma.notification.create({
    data: {
      userId: sub.userId,
      title: "Абонемент отменён",
      body: `Абонемент «${sub.plan.name}» деактивирован администратором школы.`,
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${sub.userId}`);
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/subscriptions");
  return { ok: true };
}

export async function deleteSubscriptionAction(subscriptionId: string) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) return { error: "Недостаточно прав." };

  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) return { error: "Абонемент не найден." };

  await prisma.subscription.delete({ where: { id: subscriptionId } });

  revalidatePath("/admin/plans");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${sub.userId}`);
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/subscriptions");
  return { ok: true };
}

export async function broadcastMessageAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/messages?error=Недостаточно прав.");

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const audience = String(formData.get("audience") || "students");

  if (!title || !body) redirect("/admin/messages?error=Заполните заголовок и текст.");

  const recipients = await prisma.user.findMany(
    audience === "staff" ? { where: { roleIn: ["TEACHER", "ADMIN", "OWNER"] } } : { where: { role: "STUDENT" } }
  );

  for (const person of recipients) {
    await prisma.notification.create({ data: { userId: person.id, title, body } });
  }

  revalidatePath("/admin/messages");
  revalidatePath("/cabinet/notifications");
  redirect(`/admin/messages?sent=${recipients.length}`);
}

export async function updateSettingsAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/settings?error=Недостаточно прав.");

  await prisma.settings.update({
    data: {
      schoolName: String(formData.get("schoolName") || "").trim(),
      slogan: String(formData.get("slogan") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      hours: String(formData.get("hours") || "").trim(),
      cancelHours: Number(formData.get("cancelHours") || 4),
      trialPriceRub: Number(formData.get("trialPriceRub") || 0),
    },
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

import { fulfillPlanPayment } from "@/lib/fulfill-payment";

export async function confirmPaymentAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) redirect("/admin/payments?error=Недостаточно прав.");
  const id = String(formData.get("paymentId") || "");
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) redirect("/admin/payments?error=Платёж не найден.");

  if (payment.planId && payment.status === "PENDING") {
    const result = await fulfillPlanPayment(id);
    if ("error" in result) {
      redirect(`/admin/payments?error=${encodeURIComponent(result.error ?? "Ошибка")}`);
    }
  } else {
    await prisma.payment.update({ where: { id }, data: { status: "PAID" } });
  }

  revalidatePath("/admin/payments");
  redirect("/admin/payments?confirmed=1");
}
