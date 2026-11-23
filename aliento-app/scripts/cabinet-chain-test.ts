/**
 * End-to-end check of admin → student → teacher flows using the JSON store API.
 * Run after: npx tsx scripts/reset-clean.ts
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../src/lib/db";
import {
  classDurationHours,
  deductHoursFromActiveSubscription,
  roundHours,
} from "../src/lib/subscription-balance";

const dataFile = join(process.cwd(), "data", "aliento.json");

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

async function main() {
  if (!existsSync(dataFile)) {
    execSync("npx tsx scripts/reset-clean.ts", { stdio: "inherit", cwd: process.cwd() });
  } else {
    console.log("Using existing data/aliento.json (run reset-clean.ts for empty slate)");
  }

  const student = await prisma.user.findUnique({ where: { email: "student@aliento.test" } });
  const admin = await prisma.user.findUnique({ where: { email: "admin@aliento.test" } });
  const teacherUser = await prisma.user.findUnique({ where: { email: "anastasia@aliento.test" } });
  assert(student && admin && teacherUser, "Test users missing — run reset-clean.ts");

  const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUser.id } });
  assert(teacher, "Teacher profile missing");

  const settings = await prisma.settings.get();
  assert(settings.demoMode === false, "demoMode should be off in clean store");

  // Admin: тариф
  const plan = await prisma.plan.create({
    data: {
      name: "Тест 4 часа",
      classCount: 4,
      durationDays: 30,
      priceRub: 5000,
      popular: false,
      description: "Для проверки цепочки.",
      isDemo: false,
    },
  });

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

  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 1);
  startsAt.setHours(19, 0, 0, 0);
  const endsAt = new Date(startsAt.getTime() + 90 * 60_000);

  const danceClass = await prisma.danceClass.create({
    data: {
      teacherId: teacher.id,
      title: "Bachata Sensual",
      level: "Начальный уровень",
      description: "Тестовое занятие",
      startsAt,
      endsAt,
      room: "Зал 1",
      capacity: 20,
      venueId: "venue-dekadance",
      isDemo: false,
    },
  });

  const booking = await prisma.booking.create({
    data: {
      userId: student.id,
      classId: danceClass.id,
      status: "BOOKED",
      isDemo: false,
    },
  });

  // Same side effects as markAttendanceAction (PRESENT)
  const subBefore = await prisma.subscription.findFirst({
    where: { userId: student.id, status: "ACTIVE", remainingClasses: { gt: 0 } },
  });
  assert(subBefore?.remainingClasses === 4, "Subscription should start at 4");

  await prisma.attendance.create({
    data: {
      bookingId: booking.id,
      userId: student.id,
      classId: danceClass.id,
      status: "PRESENT",
    },
  });

  const deduct = classDurationHours(danceClass.startsAt, danceClass.endsAt);
  await deductHoursFromActiveSubscription(student.id, deduct);

  const subAfter = await prisma.subscription.findFirst({
    where: { userId: student.id, status: "ACTIVE" },
  });
  const expected = roundHours(4 - deduct);
  assert(
    subAfter?.remainingClasses === expected,
    `Expected ${expected} hours left, got ${subAfter?.remainingClasses}`
  );

  const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
  assert(students.length === 1, `Expected 1 student, got ${students.length}`);

  console.log("\nCabinet chain OK:");
  console.log("  ✓ clean store / demoMode off");
  console.log("  ✓ plan + subscription (admin flow)");
  console.log("  ✓ class + booking (student)");
  console.log(`  ✓ attendance → списание часов (осталось ${expected} ч)`);
  console.log(`\nSmoke student id: ${student.id}, class id: ${danceClass.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
