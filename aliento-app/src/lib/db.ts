import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { filterDemo, isDemoMode } from "@/lib/demo-filter";
import { DEFAULT_HALL_ACTIVITY_TYPES } from "@/lib/hall-activity-types";
import { catalogToEventItems } from "@/lib/party-events";

export type DemoEntity = { isDemo?: boolean };

export type User = DemoEntity & {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  passwordHash: string;
  role: string;
  blocked: boolean;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiresAt?: string;
  passwordResetToken?: string;
  passwordResetExpiresAt?: string;
  createdAt: string;
};
export type Teacher = { id: string; userId: string; title: string; description: string };
export type Venue = {
  id: string;
  name: string;
  halls: string[];
};
export type HallRental = DemoEntity & {
  id: string;
  venueId: string;
  hall: string;
  title?: string;
  activityTypeId?: string;
  color?: string;
  clientName: string;
  peopleCount: number;
  notes?: string;
  startsAt: string;
  endsAt: string;
};
export type DanceClass = DemoEntity & {
  id: string;
  teacherId: string;
  title: string;
  level: string;
  description: string;
  startsAt: string;
  endsAt: string;
  room: string;
  venueId?: string;
  activityTypeId?: string;
  color?: string;
  capacity: number;
};
export type Booking = DemoEntity & {
  id: string;
  userId: string;
  classId: string;
  status: string;
  createdAt: string;
};
export type Plan = DemoEntity & {
  id: string;
  name: string;
  classCount: number;
  durationDays: number;
  priceRub: number;
  popular: boolean;
  description: string;
};
export type Subscription = DemoEntity & {
  id: string;
  userId: string;
  planId: string;
  totalClasses: number;
  remainingClasses: number;
  expiresAt: string;
  status: string;
  createdAt: string;
};
export type Attendance = DemoEntity & {
  id: string;
  bookingId: string;
  userId: string;
  classId: string;
  status: string;
  createdAt: string;
};
export type Payment = DemoEntity & {
  id: string;
  userId: string;
  subscriptionId: string | null;
  planId?: string | null;
  externalId?: string | null;
  amountRub: number;
  status: string;
  purpose: string;
  createdAt: string;
};
export type EventItem = DemoEntity & {
  id: string;
  number?: number;
  title: string;
  description: string;
  startsAt: string;
  place: string;
  imageUrl?: string;
};
export type Notification = DemoEntity & {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  tag?: string;
  createdAt: string;
};
export type InviteCode = {
  id: string;
  code: string;
  createdAt: string;
  usedBy: string | null;
  usedAt: string | null;
};
export type Announcement = {
  id: string;
  tag: string;
  title: string;
  body: string;
  createdAt: string;
};
export type Settings = {
  schoolName: string;
  slogan: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  cancelHours: number;
  trialPriceRub: number;
  demoMode?: boolean;
  hallActivityTypes?: import("@/lib/hall-activity-types").HallActivityType[];
};

type Store = {
  users: User[];
  teachers: Teacher[];
  venues: Venue[];
  hallRentals: HallRental[];
  classes: DanceClass[];
  bookings: Booking[];
  plans: Plan[];
  subscriptions: Subscription[];
  attendances: Attendance[];
  payments: Payment[];
  events: EventItem[];
  notifications: Notification[];
  inviteCodes: InviteCode[];
  announcements: Announcement[];
  settings: Settings;
};

const DEFAULT_VENUES: Venue[] = [
  { id: "venue-dekadance", name: "проспект Карла Маркса, 53а", halls: ["Зал 1", "Зал 2", "Зал 3"] },
];

function seedAnnouncements(now: Date): Announcement[] {
  const iso = now.toISOString();
  return [
    {
      id: uid(),
      tag: "Набор",
      title: "Кизомба — набор открыт",
      body: "Среда 19:00–20:30. Если хотите место в группе — напишите заранее.",
      createdAt: iso,
    },
    {
      id: uid(),
      tag: "Набор",
      title: "Бачата Ladies с нуля",
      body: "Воскресенье 12:00–13:30. Можно зайти с первого занятия.",
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: uid(),
      tag: "Сезон",
      title: "Тематические вечеринки",
      body: "Даты и образы — в блоке ниже. Действующим ученикам вход обычно свободный.",
      createdAt: new Date(now.getTime() - 172800000).toISOString(),
    },
  ];
}

function startOfWeekDate(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function seedDemoRentals(now: Date): HallRental[] {
  const weekStart = startOfWeekDate(now);
  const samples = [
    { dayOffset: 1, venueId: "venue-dekadance", hall: "Зал 3", hour: 10, minutes: 120, clientName: "Цукеров Андрей", peopleCount: 2 },
    { dayOffset: 2, venueId: "venue-dekadance", hall: "Зал 2", hour: 14, minutes: 90, clientName: "Лисовская группа", peopleCount: 8 },
    { dayOffset: 3, venueId: "venue-dekadance", hall: "Зал 3", hour: 11, minutes: 60, clientName: "Гасанов Рустам", peopleCount: 6 },
    { dayOffset: 1, venueId: "venue-dekadance", hall: "Зал 1", hour: 9, minutes: 90, clientName: "Студия Move", peopleCount: 12 },
    { dayOffset: 4, venueId: "venue-dekadance", hall: "Зал 2", hour: 16, minutes: 120, clientName: "Команда Salsa", peopleCount: 10 },
    { dayOffset: 5, venueId: "venue-dekadance", hall: "Зал 3", hour: 13, minutes: 60, clientName: "Частная аренда", peopleCount: 4 },
  ];
  return samples.map((item) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + item.dayOffset);
    day.setHours(item.hour, 0, 0, 0);
    const end = new Date(day.getTime() + item.minutes * 60_000);
    return {
      id: uid(),
      venueId: item.venueId,
      hall: item.hall,
      title: item.clientName,
      activityTypeId: "other",
      clientName: item.clientName,
      peopleCount: item.peopleCount,
      startsAt: day.toISOString(),
      endsAt: end.toISOString(),
      isDemo: true,
    };
  });
}

const dataDir = join(process.cwd(), "data");
const dataFile = join(dataDir, "aliento.json");
const initialDataFile = join(dataDir, "aliento.initial.json");

function uid() {
  return randomBytes(12).toString("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function atHour(dayOffset: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, hour = 12) {
  return atHour(-days, hour);
}

/** Deterministic generator so the demo dataset stays stable between reseeds. */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const CLASS_TEMPLATES = [
  { weekday: 1, hour: 19, minutes: 90, title: "Bachata Sensual", level: "Средний уровень", room: "Зал 1", capacity: 20, teacher: 0 },
  { weekday: 1, hour: 20, minutes: 90, title: "Bachata Partnerwork", level: "Средний уровень", room: "Зал 1", capacity: 20, teacher: 1 },
  { weekday: 1, hour: 21, minutes: 60, title: "Практика", level: "Все уровни", room: "Зал 2", capacity: 24, teacher: 1 },
  { weekday: 2, hour: 19, minutes: 90, title: "Бачата для новичков", level: "Начальный уровень", room: "Зал 2", capacity: 18, teacher: 0 },
  { weekday: 2, hour: 20, minutes: 90, title: "Bachata Sensual", level: "Продолжающие", room: "Зал 1", capacity: 20, teacher: 0 },
  { weekday: 3, hour: 19, minutes: 90, title: "Bachata Sensual", level: "Начальный уровень", room: "Зал 1", capacity: 20, teacher: 0 },
  { weekday: 3, hour: 20, minutes: 60, title: "Практика", level: "Все уровни", room: "Зал 2", capacity: 24, teacher: 1 },
  { weekday: 4, hour: 19, minutes: 90, title: "Ladies styling", level: "Все уровни", room: "Зал 2", capacity: 16, teacher: 0 },
  { weekday: 4, hour: 20, minutes: 90, title: "Bachata Partnerwork", level: "Начальный уровень", room: "Зал 1", capacity: 20, teacher: 1 },
  { weekday: 5, hour: 20, minutes: 90, title: "Bachata Partnerwork", level: "Продолжающие", room: "Зал 1", capacity: 20, teacher: 1 },
  { weekday: 5, hour: 21, minutes: 90, title: "Вечеринка-практика", level: "Все уровни", room: "Зал 1", capacity: 40, teacher: 0 },
  { weekday: 6, hour: 12, minutes: 120, title: "Интенсив по бачате", level: "Все уровни", room: "Зал 1", capacity: 24, teacher: 0 },
  { weekday: 6, hour: 15, minutes: 90, title: "Бачата для новичков", level: "Начальный уровень", room: "Зал 2", capacity: 18, teacher: 0 },
];

function seed(): Store {
  const passwordHash = hashPassword("aliento123");
  const now = new Date();

  function birthDateFromNow(daysUntilBirthday: number, birthYear: number) {
    const next = new Date(now);
    next.setDate(next.getDate() + daysUntilBirthday);
    const month = String(next.getMonth() + 1).padStart(2, "0");
    const day = String(next.getDate()).padStart(2, "0");
    return `${birthYear}-${month}-${day}`;
  }

  const staffUser = (
    name: string,
    email: string,
    phone: string,
    role: string,
    createdDaysAgo: number,
    dateOfBirth?: string
  ) => ({
    id: uid(),
    name,
    email,
    phone,
    passwordHash,
    role,
    blocked: false,
    isDemo: false,
    createdAt: daysAgo(createdDaysAgo, 10),
    ...(dateOfBirth ? { dateOfBirth } : {}),
  });

  const owner = staffUser("Владелец Aliento", "owner@aliento.test", "+7 900 000-00-01", "OWNER", 400);
  const admin = staffUser("Администратор", "admin@aliento.test", "+7 900 000-00-02", "ADMIN", 380);
  const anastasiaUser = staffUser("Анастасия Ромова", "anastasia@aliento.test", "+7 900 000-00-03", "TEACHER", 360);
  const alexanderUser = staffUser("Александр Дин", "alexander@aliento.test", "+7 900 000-00-04", "TEACHER", 350);

  const students = [
    staffUser("Анна Петрова", "anna@aliento.test", "+7 900 111-22-33", "STUDENT", 150, birthDateFromNow(3, 1998)),
    staffUser("Мария Иванова", "maria@aliento.test", "+7 900 222-33-44", "STUDENT", 120, birthDateFromNow(0, 2001)),
    staffUser("Дмитрий Смирнов", "dmitry@aliento.test", "+7 900 333-44-55", "STUDENT", 64, birthDateFromNow(10, 1995)),
    staffUser("Елена Кузнецова", "elena@aliento.test", "+7 900 444-55-66", "STUDENT", 40, "1992-06-15"),
    staffUser("Алексей Волков", "alexey@aliento.test", "+7 900 555-66-77", "STUDENT", 21, "1989-11-02"),
    staffUser("Ольга Соколова", "olga@aliento.test", "+7 900 666-77-88", "STUDENT", 9, birthDateFromNow(7, 2003)),
  ];

  const anastasia = {
    id: uid(),
    userId: anastasiaUser.id,
    title: "Bachata Sensual · Ladies styling",
    description:
      "Ведёт sensual bachata и ladies styling. Спокойно объясняет базу новичкам и собирает продолжающих вокруг музыкальности.",
  };
  const alexander = {
    id: uid(),
    userId: alexanderUser.id,
    title: "Bachata Partnerwork · Практика",
    description: "Разбирает ведение, рамку и уверенность в паре. Отвечает за практики и социальные вечеринки школы.",
  };
  const teachers = [anastasia, alexander];

  const plan1: Plan = { id: uid(), name: "Разовое занятие", classCount: 1, durationDays: 14, priceRub: 1500, popular: false, description: "Одно посещение любого занятия по расписанию.", isDemo: true };
  const plan4: Plan = { id: uid(), name: "Абонемент 4 занятия", classCount: 4, durationDays: 30, priceRub: 5000, popular: false, description: "Срок действия — 1 месяц. Удобно, если ходите раз в неделю.", isDemo: true };
  const plan8: Plan = { id: uid(), name: "Абонемент 8 занятий", classCount: 8, durationDays: 45, priceRub: 9000, popular: true, description: "Действует 45 дней. Экономия 3 000 ₽ против разовых занятий.", isDemo: true };
  const plans = [plan1, plan4, plan8];

  // Recurring grid from three months back to three weeks ahead.
  const classes: DanceClass[] = [];
  for (let offset = -95; offset <= 21; offset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const template = CLASS_TEMPLATES.filter((t) => t.weekday === date.getDay());
    for (const item of template) {
      const start = new Date(date);
      start.setHours(item.hour, 0, 0, 0);
      const end = new Date(start.getTime() + item.minutes * 60_000);
      classes.push({
        id: uid(),
        teacherId: teachers[item.teacher].id,
        title: item.title,
        level: item.level,
        description: `${item.title} — ${item.level.toLowerCase()}. Продолжительность ${item.minutes} минут.`,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        room: item.room,
        venueId: "venue-dekadance",
        capacity: item.capacity,
        isDemo: true,
      });
    }
  }

  const rng = makeRng(20240501);
  const bookings: Booking[] = [];
  const attendances: Attendance[] = [];

  for (const item of classes) {
    const startsAt = new Date(item.startsAt);
    const past = startsAt < now;
    for (const student of students) {
      const joined = new Date(student.createdAt);
      if (startsAt < joined) continue;
      if (rng() > (past ? 0.34 : 0.22)) continue;

      const booking: Booking = {
        id: uid(),
        userId: student.id,
        classId: item.id,
        status: "BOOKED",
        createdAt: new Date(startsAt.getTime() - 2 * 86_400_000).toISOString(),
        isDemo: true,
      };
      bookings.push(booking);

      if (past) {
        attendances.push({
          id: uid(),
          bookingId: booking.id,
          userId: student.id,
          classId: item.id,
          status: rng() > 0.16 ? "PRESENT" : "ABSENT",
          createdAt: item.endsAt,
          isDemo: true,
        });
      }
    }
  }

  // Subscriptions: an active one per student plus a finished history entry.
  const subscriptions: Subscription[] = [];
  const payments: Payment[] = [];

  students.forEach((student, index) => {
    const plan = [plan8, plan4, plan1, plan8, plan4, plan1][index % 6];
    const created = daysAgo(12 - index, 11);
    const expires = new Date(new Date(created).getTime() + plan.durationDays * 86_400_000);
    const used = Math.min(plan.classCount - 1, Math.round(rng() * (plan.classCount - 1)));
    const sub: Subscription = {
      id: uid(),
      userId: student.id,
      planId: plan.id,
      totalClasses: plan.classCount,
      remainingClasses: plan.classCount - used,
      expiresAt: expires.toISOString(),
      status: "ACTIVE",
      createdAt: created,
      isDemo: true,
    };
    subscriptions.push(sub);
    payments.push({
      id: uid(),
      userId: student.id,
      subscriptionId: sub.id,
      amountRub: plan.priceRub,
      status: "PAID",
      purpose: plan.name,
      createdAt: created,
      isDemo: true,
    });

    // Renewal history so month-over-month revenue has something to compare with.
    const memberDays = Math.round((now.getTime() - new Date(student.createdAt).getTime()) / 86_400_000);
    for (let back = 45; back <= Math.min(memberDays, 150); back += 35) {
      const oldPlan = rng() > 0.5 ? plan8 : plan4;
      const oldCreated = daysAgo(back, 14);
      const oldSub: Subscription = {
        id: uid(),
        userId: student.id,
        planId: oldPlan.id,
        totalClasses: oldPlan.classCount,
        remainingClasses: 0,
        expiresAt: new Date(new Date(oldCreated).getTime() + oldPlan.durationDays * 86_400_000).toISOString(),
        status: "EXHAUSTED",
        createdAt: oldCreated,
        isDemo: true,
      };
      subscriptions.push(oldSub);
      payments.push({
        id: uid(),
        userId: student.id,
        subscriptionId: oldSub.id,
        amountRub: oldPlan.priceRub,
        status: "PAID",
        purpose: oldPlan.name,
        createdAt: oldCreated,
        isDemo: true,
      });
    }
  });

  payments.push({
    id: uid(),
    userId: students[5].id,
    subscriptionId: null,
    amountRub: plan1.priceRub,
    status: "PENDING",
    purpose: "Разовое занятие",
    createdAt: daysAgo(1, 18),
    isDemo: true,
  });

  const demoStudents = students.map((s) => ({ ...s, isDemo: true }));

  return {
    users: [owner, admin, anastasiaUser, alexanderUser, ...demoStudents],
    teachers,
    venues: DEFAULT_VENUES,
    hallRentals: seedDemoRentals(now),
    classes,
    bookings,
    plans,
    subscriptions,
    attendances,
    payments,
    events: catalogToEventItems(),
    notifications: [
      { id: uid(), userId: demoStudents[0].id, title: "Абонемент активирован", body: "Абонемент 8 занятий активен. Записывайтесь на занятия из расписания.", read: false, createdAt: daysAgo(12, 11), isDemo: true },
      { id: uid(), userId: demoStudents[0].id, title: "Напоминание о занятии", body: "Ждём вас на Bachata Sensual в Зале 1. Приходите за 10 минут до начала.", read: false, createdAt: daysAgo(2, 9), isDemo: true },
      { id: uid(), userId: demoStudents[1].id, title: "Осталось 2 занятия", body: "По абонементу осталось 2 занятия. Можно продлить в личном кабинете.", read: true, createdAt: daysAgo(4, 15), isDemo: true },
      { id: uid(), userId: demoStudents[3].id, title: "Вечеринка школы", body: "В субботу Bachata Night. Вход для учеников школы свободный.", read: false, createdAt: daysAgo(3, 12), isDemo: true },
    ],
    inviteCodes: [],
    announcements: seedAnnouncements(now),
    settings: {
      schoolName: "Aliento",
      slogan: "Танец, который чувствуется сердцем",
      phone: "+7 913 270-45-06",
      email: "info@aliento.dance",
      address: "проспект Карла Маркса, 53а",
      hours: "Ежедневно 10:00 — 22:00",
      cancelHours: 4,
      trialPriceRub: 1500,
      demoMode: true,
    },
  };
}

/** Тарифы как на главной: часы, не самостоятельная покупка в кабинете. */
export function defaultSchoolPlans(): Plan[] {
  return [
    {
      id: uid(),
      name: "6 часов",
      classCount: 6,
      durationDays: 30,
      priceRub: 2800,
      popular: false,
      description: "Абонемент на 6 часов занятий по расписанию.",
      isDemo: false,
    },
    {
      id: uid(),
      name: "8 часов",
      classCount: 8,
      durationDays: 45,
      priceRub: 3600,
      popular: false,
      description: "Абонемент на 8 часов — удобный средний объём.",
      isDemo: false,
    },
    {
      id: uid(),
      name: "12 часов",
      classCount: 12,
      durationDays: 60,
      priceRub: 4100,
      popular: true,
      description: "Максимум часов по выгодной цене.",
      isDemo: false,
    },
  ];
}

/** Empty operational data; keeps test staff logins (password aliento123). demoMode off. */
export function seedClean(): Store {
  const passwordHash = hashPassword("aliento123");
  const now = new Date().toISOString();

  const staffUser = (
    name: string,
    email: string,
    phone: string,
    role: string,
    dateOfBirth?: string
  ): User => ({
    id: uid(),
    name,
    email,
    phone,
    passwordHash,
    role,
    blocked: false,
    isDemo: false,
    emailVerified: true,
    createdAt: now,
    ...(dateOfBirth ? { dateOfBirth } : {}),
  });

  const owner = staffUser("Владелец Aliento", "owner@aliento.test", "+7 900 000-00-01", "OWNER");
  const admin = staffUser("Администратор", "admin@aliento.test", "+7 900 000-00-02", "ADMIN");
  const anastasiaUser = staffUser("Анастасия Ромова", "anastasia@aliento.test", "+7 900 000-00-03", "TEACHER");
  const alexanderUser = staffUser("Александр Дин", "alexander@aliento.test", "+7 900 000-00-04", "TEACHER");
  const student = staffUser("Тестовый ученик", "student@aliento.test", "+7 900 111-22-33", "STUDENT", "1998-03-15");

  const anastasia: Teacher = {
    id: uid(),
    userId: anastasiaUser.id,
    title: "Bachata Sensual · Ladies styling",
    description: "Преподаватель sensual bachata и ladies styling.",
  };
  const alexander: Teacher = {
    id: uid(),
    userId: alexanderUser.id,
    title: "Bachata Partnerwork · Практика",
    description: "Ведение, рамка и практики школы.",
  };

  return {
    users: [owner, admin, anastasiaUser, alexanderUser, student],
    teachers: [anastasia, alexander],
    venues: DEFAULT_VENUES,
    hallRentals: [],
    classes: [],
    bookings: [],
    plans: defaultSchoolPlans(),
    subscriptions: [],
    attendances: [],
    payments: [],
    events: catalogToEventItems(),
    notifications: [],
    inviteCodes: [],
    announcements: [],
    settings: {
      schoolName: "Aliento",
      slogan: "Танец, который чувствуется сердцем",
      phone: "+7 913 270-45-06",
      email: "info@aliento.dance",
      address: "проспект Карла Маркса, 53а",
      hours: "Ежедневно 10:00 — 22:00",
      cancelHours: 4,
      trialPriceRub: 1500,
      demoMode: false,
      hallActivityTypes: DEFAULT_HALL_ACTIVITY_TYPES,
    },
  };
}

function dropDemoRows<T extends { isDemo?: boolean }>(rows: T[] | undefined): T[] {
  return (rows ?? []).filter((row) => row.isDemo !== true);
}

function stripDemoFromStore(store: Store) {
  store.settings.demoMode = false;
  store.users = dropDemoRows(store.users);
  store.teachers = store.teachers.filter((t) => store.users.some((u) => u.id === t.userId));
  store.classes = dropDemoRows(store.classes);
  store.bookings = dropDemoRows(store.bookings);
  store.plans = dropDemoRows(store.plans);
  store.subscriptions = dropDemoRows(store.subscriptions);
  store.attendances = dropDemoRows(store.attendances);
  store.payments = dropDemoRows(store.payments);
  store.notifications = dropDemoRows(store.notifications);
  store.hallRentals = dropDemoRows(store.hallRentals);
}

function migrateStore(raw: Partial<Store>): Store {
  const store = raw as Store;
  if (!store.settings) {
    store.settings = {
      schoolName: "Aliento",
      slogan: "",
      phone: "",
      email: "",
      address: "",
      hours: "",
      cancelHours: 4,
      trialPriceRub: 1500,
      demoMode: false,
    };
  }
  store.settings.demoMode = false;
  stripDemoFromStore(store);
  if (!store.inviteCodes) store.inviteCodes = [];
  if (store.announcements === undefined) store.announcements = seedAnnouncements(new Date());
  if (!store.venues?.length) store.venues = DEFAULT_VENUES;
  if (store.hallRentals === undefined) {
    store.hallRentals = store.settings.demoMode === false ? [] : seedDemoRentals(new Date());
  }
  for (const item of store.classes ?? []) {
    if (!item.venueId) item.venueId = store.venues[0]?.id;
  }
  for (const item of store.hallRentals ?? []) {
    if (item.isDemo === undefined) item.isDemo = true;
    if (!item.title?.trim()) item.title = item.clientName;
  }
  if (!store.settings.hallActivityTypes?.length) {
    store.settings.hallActivityTypes = DEFAULT_HALL_ACTIVITY_TYPES;
  }
  if (!(store.events ?? []).some((e) => e.id === "party-1")) {
    store.events = catalogToEventItems();
  }
  if (!store.plans?.length) {
    store.plans = defaultSchoolPlans();
  }

  for (const user of store.users ?? []) {
    if (user.isDemo === undefined) user.isDemo = false;
    if (user.emailVerified === undefined) {
      user.emailVerified = user.role !== "STUDENT";
    }
  }

  for (const list of [
    store.classes,
    store.bookings,
    store.plans,
    store.subscriptions,
    store.attendances,
    store.payments,
    store.notifications,
    store.hallRentals,
  ]) {
    if (!list) continue;
    for (const item of list) {
      if (item.isDemo === undefined) item.isDemo = false;
    }
  }

  return store;
}

function demoOn(store: Store) {
  return isDemoMode(store.settings);
}

function load(): Store {
  if (!existsSync(dataFile)) {
    mkdirSync(dataDir, { recursive: true });
    let created: Store;
    if (existsSync(initialDataFile)) {
      created = migrateStore(JSON.parse(readFileSync(initialDataFile, "utf8")) as Partial<Store>);
    } else if (process.env.ALIENTO_INITIAL_SEED === "demo") {
      created = migrateStore(seed());
    } else {
      created = seedClean();
    }
    writeFileSync(dataFile, JSON.stringify(created, null, 2));
    return created;
  }
  const raw = JSON.parse(readFileSync(dataFile, "utf8")) as Partial<Store>;
  const store = migrateStore(raw);
  const needsSave =
    !raw.venues?.length ||
    raw.hallRentals === undefined ||
    (raw.classes ?? []).some((c) => !c.venueId) ||
    !(raw.events ?? []).some((e) => e.id === "party-1") ||
    raw.settings?.demoMode !== false;
  if (needsSave) save(store);
  return store;
}

function save(store: Store) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

function hydrateUser(store: Store, user: User) {
  const on = demoOn(store);
  return {
    ...user,
    createdAt: new Date(user.createdAt),
    teacher: store.teachers.find((t) => t.userId === user.id) || null,
    subscriptions: filterDemo(
      store.subscriptions
        .filter((s) => s.userId === user.id)
        .sort((a, b) => Number(b.status === "ACTIVE") - Number(a.status === "ACTIVE")),
      on
    ).map((s) => hydrateSub(store, s)),
    bookings: filterDemo(store.bookings.filter((b) => b.userId === user.id), on).map((b) =>
      hydrateBooking(store, b)
    ),
    payments: filterDemo(store.payments.filter((p) => p.userId === user.id), on).map(hydratePayment),
  };
}

function hydrateTeacher(store: Store, teacher: Teacher) {
  const user = store.users.find((u) => u.id === teacher.userId)!;
  return { ...teacher, user: { ...user, createdAt: new Date(user.createdAt) } };
}

function hydrateClass(store: Store, item: DanceClass, bookingWhere?: { status?: string }) {
  const on = demoOn(store);
  const bookings = filterDemo(
    store.bookings.filter(
      (b) => b.classId === item.id && (!bookingWhere?.status || b.status === bookingWhere.status)
    ),
    on
  ).map((b) => hydrateBooking(store, b));
  return {
    ...item,
    startsAt: new Date(item.startsAt),
    endsAt: new Date(item.endsAt),
    teacher: hydrateTeacher(store, store.teachers.find((t) => t.id === item.teacherId)!),
    bookings,
  };
}

function hydrateBooking(store: Store, booking: Booking) {
  const cls = store.classes.find((c) => c.id === booking.classId)!;
  const user = store.users.find((u) => u.id === booking.userId)!;
  const attendance = store.attendances.find((a) => a.bookingId === booking.id);
  return {
    ...booking,
    createdAt: new Date(booking.createdAt),
    class: {
      ...cls,
      startsAt: new Date(cls.startsAt),
      endsAt: new Date(cls.endsAt),
      teacher: hydrateTeacher(store, store.teachers.find((t) => t.id === cls.teacherId)!),
    },
    user: { ...user, createdAt: new Date(user.createdAt) },
    attendance: attendance ? { ...attendance, createdAt: new Date(attendance.createdAt) } : null,
  };
}

function hydrateSub(store: Store, sub: Subscription) {
  return {
    ...sub,
    expiresAt: new Date(sub.expiresAt),
    createdAt: new Date(sub.createdAt),
    plan: store.plans.find((p) => p.id === sub.planId)!,
    user: (() => {
      const user = store.users.find((u) => u.id === sub.userId)!;
      return { ...user, createdAt: new Date(user.createdAt) };
    })(),
  };
}

function hydratePayment(p: Payment) {
  return { ...p, createdAt: new Date(p.createdAt) };
}

function hydrateEvent(e: EventItem) {
  return { ...e, startsAt: new Date(e.startsAt) };
}

function hydrateAttendance(store: Store, row: Attendance) {
  const cls = store.classes.find((c) => c.id === row.classId)!;
  const user = store.users.find((u) => u.id === row.userId)!;
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    user: { ...user, createdAt: new Date(user.createdAt) },
    class: hydrateClass(store, cls),
  };
}

export const prisma = {
  user: {
    async findUnique({ where, include }: { where: { id?: string; email?: string }; include?: object }) {
      void include;
      const store = load();
      const user = store.users.find((u) => (where.id && u.id === where.id) || (where.email && u.email === where.email));
      if (!user) return null;
      if (!demoOn(store) && user.role === "STUDENT" && user.isDemo) return null;
      return hydrateUser(store, user);
    },
    async findUniqueOrThrow({ where }: { where: { id: string } }) {
      const user = await prisma.user.findUnique({ where });
      if (!user) throw new Error("User not found");
      return user;
    },
    async findMany({ where, include, orderBy }: { where?: { role?: string; roleIn?: string[] }; include?: object; orderBy?: object } = {}) {
      const store = load();
      const on = demoOn(store);
      let rows = store.users;
      if (where?.role) rows = rows.filter((u) => u.role === where.role);
      if (where?.roleIn) rows = rows.filter((u) => where.roleIn!.includes(u.role));
      if (!on) rows = rows.filter((u) => u.role !== "STUDENT" || !u.isDemo);
      rows = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      void include;
      void orderBy;
      return rows.map((u) => hydrateUser(store, u));
    },
    async findByVerificationToken(token: string) {
      const store = load();
      const user = store.users.find((u) => u.emailVerificationToken === token);
      if (!user) return null;
      if (!demoOn(store) && user.role === "STUDENT" && user.isDemo) return null;
      return hydrateUser(store, user);
    },
    async findByPasswordResetToken(token: string) {
      const store = load();
      const user = store.users.find((u) => u.passwordResetToken === token);
      if (!user) return null;
      if (!demoOn(store) && user.role === "STUDENT" && user.isDemo) return null;
      return hydrateUser(store, user);
    },
    async create({ data }: { data: Omit<User, "id" | "createdAt" | "blocked" | "isDemo"> & { blocked?: boolean; isDemo?: boolean; emailVerified?: boolean; dateOfBirth?: string } }) {
      const store = load();
      const user: User = {
        id: uid(),
        blocked: false,
        isDemo: data.isDemo ?? false,
        createdAt: new Date().toISOString(),
        ...data,
      };
      store.users.push(user);
      save(store);
      return hydrateUser(store, user);
    },
    async update({ where, data }: { where: { id: string }; data: Partial<User> }) {
      const store = load();
      const user = store.users.find((u) => u.id === where.id);
      if (!user) throw new Error("User not found");
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) {
          delete user[key as keyof User];
        } else {
          (user as Record<string, unknown>)[key] = value;
        }
      }
      save(store);
      return hydrateUser(store, user);
    },
    async count({ where }: { where?: { role?: string; createdAt?: { gte: Date } } } = {}) {
      const store = load();
      const on = demoOn(store);
      return store.users.filter((u) => {
        if (where?.role && u.role !== where.role) return false;
        if (where?.createdAt?.gte && new Date(u.createdAt) < where.createdAt.gte) return false;
        if (!on && u.role === "STUDENT" && u.isDemo) return false;
        return true;
      }).length;
    },
  },
  teacher: {
    async findMany({ include }: { include?: object } = {}) {
      const store = load();
      void include;
      return store.teachers.map((t) => hydrateTeacher(store, t));
    },
    async findUnique({ where }: { where: { id?: string; userId?: string } }) {
      const store = load();
      const teacher = store.teachers.find(
        (t) => (where.id && t.id === where.id) || (where.userId && t.userId === where.userId)
      );
      return teacher ? hydrateTeacher(store, teacher) : null;
    },
    async create({ data }: { data: { userId: string; title: string; description: string } }) {
      const store = load();
      const teacher: Teacher = { id: uid(), ...data };
      store.teachers.push(teacher);
      save(store);
      return hydrateTeacher(store, teacher);
    },
  },
  danceClass: {
    async findMany({ where, include, orderBy, take }: { where?: Record<string, unknown>; include?: object; orderBy?: object; take?: number } = {}) {
      const store = load();
      void include;
      void orderBy;
      let rows = filterDemo(store.classes, demoOn(store));
      const startsAt = where?.startsAt as { gte?: Date; lt?: Date } | undefined;
      if (startsAt?.gte) rows = rows.filter((c) => new Date(c.startsAt) >= startsAt.gte!);
      if (startsAt?.lt) rows = rows.filter((c) => new Date(c.startsAt) < startsAt.lt!);
      const teacher = where?.teacher as { userId?: string } | undefined;
      if (teacher?.userId) {
        const ids = store.teachers.filter((t) => t.userId === teacher.userId).map((t) => t.id);
        rows = rows.filter((c) => ids.includes(c.teacherId));
      }
      rows = [...rows].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      if (take) rows = rows.slice(0, take);
      const bookingWhere = (include as { bookings?: { where?: { status?: string } } } | undefined)?.bookings?.where;
      return rows.map((c) => hydrateClass(store, c, bookingWhere));
    },
    async findUnique({ where, include }: { where: { id: string }; include?: object }) {
      const store = load();
      void include;
      const item = filterDemo(store.classes, demoOn(store)).find((c) => c.id === where.id);
      if (!item) return null;
      return hydrateClass(store, item, { status: "BOOKED" });
    },
    async create({ data }: { data: Omit<DanceClass, "id" | "startsAt" | "endsAt" | "isDemo"> & { startsAt: Date | string; endsAt: Date | string; isDemo?: boolean } }) {
      const store = load();
      const item: DanceClass = {
        ...data,
        id: uid(),
        isDemo: data.isDemo ?? false,
        startsAt: data.startsAt instanceof Date ? data.startsAt.toISOString() : data.startsAt,
        endsAt: data.endsAt instanceof Date ? data.endsAt.toISOString() : data.endsAt,
      };
      store.classes.push(item);
      save(store);
      return hydrateClass(store, item);
    },
    async delete({ where }: { where: { id: string } }) {
      const store = load();
      store.classes = store.classes.filter((c) => c.id !== where.id);
      store.bookings = store.bookings.filter((b) => b.classId !== where.id);
      store.attendances = store.attendances.filter((a) => a.classId !== where.id);
      save(store);
      return { id: where.id };
    },
  },
  booking: {
    async findMany({ where, include, orderBy }: { where?: { userId?: string; status?: string; classId?: string }; include?: object; orderBy?: object } = {}) {
      const store = load();
      void include;
      void orderBy;
      let rows = filterDemo(store.bookings, demoOn(store));
      if (where?.userId) rows = rows.filter((b) => b.userId === where.userId);
      if (where?.status) rows = rows.filter((b) => b.status === where.status);
      if (where?.classId) rows = rows.filter((b) => b.classId === where.classId);
      rows = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return rows.map((b) => hydrateBooking(store, b));
    },
    async findFirst({ where, include, orderBy }: { where?: Record<string, unknown>; include?: object; orderBy?: object }) {
      const store = load();
      void include;
      void orderBy;
      let rows = filterDemo(store.bookings, demoOn(store));
      if (where?.userId) rows = rows.filter((b) => b.userId === where.userId);
      if (where?.status) rows = rows.filter((b) => b.status === where.status);
      if (where?.classId) rows = rows.filter((b) => b.classId === where.classId);
      const cls = where?.class as { startsAt?: { gte?: Date } } | undefined;
      if (cls?.startsAt?.gte) {
        rows = rows.filter((b) => {
          const dance = store.classes.find((c) => c.id === b.classId);
          return dance && new Date(dance.startsAt) >= cls.startsAt!.gte!;
        });
      }
      rows = [...rows].sort((a, b) => {
        const ca = store.classes.find((c) => c.id === a.classId)!;
        const cb = store.classes.find((c) => c.id === b.classId)!;
        return ca.startsAt.localeCompare(cb.startsAt);
      });
      return rows[0] ? hydrateBooking(store, rows[0]) : null;
    },
    async findUnique({ where, include }: { where: { id: string }; include?: object }) {
      const store = load();
      void include;
      const booking = store.bookings.find((b) => b.id === where.id);
      if (!booking) return null;
      if (!demoOn(store) && booking.isDemo) return null;
      return hydrateBooking(store, booking);
    },
    async create({ data }: { data: { userId: string; classId: string; status: string; isDemo?: boolean } }) {
      const store = load();
      const booking: Booking = {
        id: uid(),
        createdAt: new Date().toISOString(),
        isDemo: data.isDemo ?? false,
        ...data,
      };
      store.bookings.push(booking);
      save(store);
      return hydrateBooking(store, booking);
    },
    async update({ where, data }: { where: { id: string }; data: Partial<Booking> }) {
      const store = load();
      const booking = store.bookings.find((b) => b.id === where.id);
      if (!booking) throw new Error("Booking not found");
      Object.assign(booking, data);
      save(store);
      return hydrateBooking(store, booking);
    },
    async count({ where }: { where?: { status?: string } } = {}) {
      const store = load();
      return filterDemo(store.bookings, demoOn(store)).filter((b) => !where?.status || b.status === where.status)
        .length;
    },
  },
  plan: {
    async findMany({ orderBy }: { orderBy?: object } = {}) {
      const store = load();
      void orderBy;
      return [...filterDemo(store.plans, demoOn(store))].sort((a, b) => a.classCount - b.classCount);
    },
    async findUnique({ where }: { where: { id: string } }) {
      const store = load();
      return filterDemo(store.plans, demoOn(store)).find((p) => p.id === where.id) || null;
    },
    async create({ data }: { data: Omit<Plan, "id" | "isDemo"> & { isDemo?: boolean } }) {
      const store = load();
      const plan: Plan = { ...data, id: uid(), isDemo: data.isDemo ?? false };
      store.plans.push(plan);
      save(store);
      return plan;
    },
    async update({ where, data }: { where: { id: string }; data: Partial<Plan> }) {
      const store = load();
      const plan = store.plans.find((p) => p.id === where.id);
      if (!plan) throw new Error("Plan not found");
      Object.assign(plan, data);
      save(store);
      return plan;
    },
    async delete({ where }: { where: { id: string } }) {
      const store = load();
      store.plans = store.plans.filter((p) => p.id !== where.id);
      save(store);
      return { id: where.id };
    },
  },
  subscription: {
    async findFirst({ where, include, orderBy }: { where?: Record<string, unknown>; include?: object; orderBy?: object }) {
      const store = load();
      void include;
      void orderBy;
      let rows = filterDemo(store.subscriptions, demoOn(store));
      if (where?.userId) rows = rows.filter((s) => s.userId === where.userId);
      if (where?.status) rows = rows.filter((s) => s.status === where.status);
      const remaining = where?.remainingClasses as { gt?: number } | undefined;
      if (remaining?.gt !== undefined) rows = rows.filter((s) => s.remainingClasses > remaining.gt!);
      const expires = where?.expiresAt as { gt?: Date } | undefined;
      if (expires?.gt) rows = rows.filter((s) => new Date(s.expiresAt) > expires.gt!);
      rows = [...rows].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
      return rows[0] ? hydrateSub(store, rows[0]) : null;
    },
    async findMany({ where, include, orderBy }: { where?: { userId?: string; status?: string }; include?: object; orderBy?: object } = {}) {
      const store = load();
      void include;
      void orderBy;
      let rows = filterDemo(store.subscriptions, demoOn(store));
      if (where?.userId) rows = rows.filter((s) => s.userId === where.userId);
      if (where?.status) rows = rows.filter((s) => s.status === where.status);
      rows = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return rows.map((s) => hydrateSub(store, s));
    },
    async findUnique({ where }: { where: { id: string } }) {
      const store = load();
      const sub = store.subscriptions.find((s) => s.id === where.id);
      return sub ? hydrateSub(store, sub) : null;
    },
    async create({ data }: { data: Omit<Subscription, "id" | "createdAt" | "expiresAt" | "isDemo"> & { expiresAt: Date | string; isDemo?: boolean } }) {
      const store = load();
      const sub: Subscription = {
        ...data,
        id: uid(),
        isDemo: data.isDemo ?? false,
        createdAt: new Date().toISOString(),
        expiresAt: data.expiresAt instanceof Date ? data.expiresAt.toISOString() : data.expiresAt,
      };
      store.subscriptions.push(sub);
      save(store);
      return hydrateSub(store, sub);
    },
    async update({ where, data }: { where: { id: string }; data: Partial<Subscription> }) {
      const store = load();
      const sub = store.subscriptions.find((s) => s.id === where.id);
      if (!sub) throw new Error("Subscription not found");
      Object.assign(sub, data);
      save(store);
      return hydrateSub(store, sub);
    },
    async delete({ where }: { where: { id: string } }) {
      const store = load();
      const exists = store.subscriptions.some((s) => s.id === where.id);
      if (!exists) throw new Error("Subscription not found");
      store.subscriptions = store.subscriptions.filter((s) => s.id !== where.id);
      save(store);
      return { id: where.id };
    },
    async count({ where }: { where?: { status?: string } } = {}) {
      const store = load();
      return filterDemo(store.subscriptions, demoOn(store)).filter((s) => !where?.status || s.status === where.status)
        .length;
    },
  },
  attendance: {
    async findMany({ where, include, orderBy }: { where?: { userId?: string; status?: string; classId?: string; createdAt?: { gte?: Date; lt?: Date } }; include?: object; orderBy?: object } = {}) {
      const store = load();
      void include;
      void orderBy;
      let rows = filterDemo(store.attendances, demoOn(store));
      if (where?.userId) rows = rows.filter((a) => a.userId === where.userId);
      if (where?.status) rows = rows.filter((a) => a.status === where.status);
      if (where?.classId) rows = rows.filter((a) => a.classId === where.classId);
      if (where?.createdAt?.gte) rows = rows.filter((a) => new Date(a.createdAt) >= where.createdAt!.gte!);
      if (where?.createdAt?.lt) rows = rows.filter((a) => new Date(a.createdAt) < where.createdAt!.lt!);
      rows = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return rows.map((a) => hydrateAttendance(store, a));
    },
    async create({ data }: { data: Omit<Attendance, "id" | "createdAt" | "isDemo"> & { isDemo?: boolean } }) {
      const store = load();
      const row: Attendance = {
        ...data,
        id: uid(),
        isDemo: data.isDemo ?? false,
        createdAt: new Date().toISOString(),
      };
      store.attendances.push(row);
      save(store);
      return { ...row, createdAt: new Date(row.createdAt) };
    },
    async count({ where }: { where?: { userId?: string; status?: string; createdAt?: { gte: Date } } } = {}) {
      const store = load();
      return filterDemo(store.attendances, demoOn(store)).filter((a) => {
        if (where?.userId && a.userId !== where.userId) return false;
        if (where?.status && a.status !== where.status) return false;
        if (where?.createdAt?.gte && new Date(a.createdAt) < where.createdAt.gte) return false;
        return true;
      }).length;
    },
  },
  payment: {
    async findUnique({
      where,
      include,
    }: {
      where: { id?: string; externalId?: string };
      include?: object;
    }) {
      void include;
      const store = load();
      const row = store.payments.find((p) => {
        if (where.id && p.id === where.id) return true;
        if (where.externalId && p.externalId === where.externalId) return true;
        return false;
      });
      if (!row) return null;
      return hydratePayment(row);
    },
    async findMany({ where, include, orderBy, take }: { where?: { userId?: string; status?: string }; include?: object; orderBy?: object; take?: number } = {}) {
      const store = load();
      void include;
      void orderBy;
      let rows = filterDemo(store.payments, demoOn(store));
      if (where?.userId) rows = rows.filter((p) => p.userId === where.userId);
      if (where?.status) rows = rows.filter((p) => p.status === where.status);
      rows = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (take) rows = rows.slice(0, take);
      return rows.map((p) => {
        const user = store.users.find((u) => u.id === p.userId)!;
        return { ...hydratePayment(p), user: { ...user, createdAt: new Date(user.createdAt) } };
      });
    },
    async create({ data }: { data: Omit<Payment, "id" | "createdAt" | "isDemo"> & { isDemo?: boolean } }) {
      const store = load();
      const row: Payment = {
        ...data,
        id: uid(),
        isDemo: data.isDemo ?? false,
        createdAt: new Date().toISOString(),
      };
      store.payments.push(row);
      save(store);
      return hydratePayment(row);
    },
    async update({ where, data }: { where: { id: string }; data: Partial<Payment> }) {
      const store = load();
      const row = store.payments.find((p) => p.id === where.id);
      if (!row) throw new Error("Payment not found");
      Object.assign(row, data);
      save(store);
      return hydratePayment(row);
    },
    async aggregate({ _sum, where }: { _sum: { amountRub: true }; where?: { status?: string; createdAt?: { gte?: Date; lt?: Date } } }) {
      void _sum;
      const store = load();
      const total = filterDemo(store.payments, demoOn(store))
        .filter((p) => {
          if (where?.status && p.status !== where.status) return false;
          if (where?.createdAt?.gte && new Date(p.createdAt) < where.createdAt.gte) return false;
          if (where?.createdAt?.lt && new Date(p.createdAt) >= where.createdAt.lt) return false;
          return true;
        })
        .reduce((sum, p) => sum + p.amountRub, 0);
      return { _sum: { amountRub: total } };
    },
  },
  event: {
    async findMany({ where, orderBy, take }: { where?: { startsAt?: { gte: Date } }; orderBy?: object; take?: number } = {}) {
      const store = load();
      void orderBy;
      let rows = filterDemo(store.events, demoOn(store));
      if (where?.startsAt?.gte) rows = rows.filter((e) => new Date(e.startsAt) >= where.startsAt!.gte!);
      rows = [...rows].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      if (take) rows = rows.slice(0, take);
      return rows.map(hydrateEvent);
    },
  },
  notification: {
    async findMany({ where, orderBy, take }: { where?: { userId?: string; read?: boolean; tag?: string }; orderBy?: object; take?: number } = {}) {
      const store = load();
      void orderBy;
      let rows = filterDemo(store.notifications, demoOn(store));
      if (where?.userId) rows = rows.filter((n) => n.userId === where.userId);
      if (where?.read !== undefined) rows = rows.filter((n) => n.read === where.read);
      if (where?.tag) rows = rows.filter((n) => n.tag === where.tag);
      rows = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (take) rows = rows.slice(0, take);
      const users = store.users;
      return rows.map((n) => {
        const user = users.find((u) => u.id === n.userId);
        return {
          ...n,
          createdAt: new Date(n.createdAt),
          user: user ? { ...user, createdAt: new Date(user.createdAt) } : null,
        };
      });
    },
    async findFirst({ where }: { where?: { userId?: string; tag?: string } } = {}) {
      const store = load();
      let rows = filterDemo(store.notifications, demoOn(store));
      if (where?.userId) rows = rows.filter((n) => n.userId === where.userId);
      if (where?.tag) rows = rows.filter((n) => n.tag === where.tag);
      const row = rows[0];
      if (!row) return null;
      const user = store.users.find((u) => u.id === row.userId);
      return {
        ...row,
        createdAt: new Date(row.createdAt),
        user: user ? { ...user, createdAt: new Date(user.createdAt) } : null,
      };
    },
    async create({ data }: { data: Omit<Notification, "id" | "createdAt" | "read" | "isDemo"> & { read?: boolean; isDemo?: boolean } }) {
      const store = load();
      const row: Notification = {
        ...data,
        id: uid(),
        read: false,
        isDemo: data.isDemo ?? false,
        createdAt: new Date().toISOString(),
      };
      store.notifications.push(row);
      save(store);
      return { ...row, createdAt: new Date(row.createdAt) };
    },
    async updateMany({ where, data }: { where: { userId?: string }; data: Partial<Notification> }) {
      const store = load();
      let count = 0;
      for (const row of store.notifications) {
        if (where.userId && row.userId !== where.userId) continue;
        Object.assign(row, data);
        count++;
      }
      save(store);
      return { count };
    },
    async count({ where }: { where?: { userId?: string; read?: boolean } } = {}) {
      const store = load();
      return filterDemo(store.notifications, demoOn(store)).filter((n) => {
        if (where?.userId && n.userId !== where.userId) return false;
        if (where?.read !== undefined && n.read !== where.read) return false;
        return true;
      }).length;
    },
  },
  venue: {
    async findMany() {
      return load().venues;
    },
    async findUnique({ where }: { where: { id: string } }) {
      return load().venues.find((v) => v.id === where.id) ?? null;
    },
  },
  hallRental: {
    async findMany({ where }: { where?: { startsAt?: { gte?: Date; lt?: Date }; venueId?: string } } = {}) {
      const store = load();
      let rows = filterDemo(store.hallRentals, demoOn(store));
      if (where?.venueId) rows = rows.filter((r) => r.venueId === where.venueId);
      if (where?.startsAt?.gte) rows = rows.filter((r) => new Date(r.endsAt) > where.startsAt!.gte!);
      if (where?.startsAt?.lt) rows = rows.filter((r) => new Date(r.startsAt) < where.startsAt!.lt!);
      return rows.map((r) => ({
        ...r,
        startsAt: new Date(r.startsAt),
        endsAt: new Date(r.endsAt),
      }));
    },
    async create({
      data,
    }: {
      data: Omit<HallRental, "id" | "startsAt" | "endsAt" | "isDemo"> & {
        startsAt: Date | string;
        endsAt: Date | string;
        isDemo?: boolean;
      };
    }) {
      const store = load();
      const row: HallRental = {
        ...data,
        id: uid(),
        isDemo: data.isDemo ?? false,
        startsAt: data.startsAt instanceof Date ? data.startsAt.toISOString() : data.startsAt,
        endsAt: data.endsAt instanceof Date ? data.endsAt.toISOString() : data.endsAt,
      };
      store.hallRentals.push(row);
      save(store);
      return { ...row, startsAt: new Date(row.startsAt), endsAt: new Date(row.endsAt) };
    },
    async delete({ where }: { where: { id: string } }) {
      const store = load();
      store.hallRentals = store.hallRentals.filter((r) => r.id !== where.id);
      save(store);
      return { id: where.id };
    },
  },
  inviteCode: {
    async findMany() {
      const store = load();
      return [...store.inviteCodes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async findUnique({ where }: { where: { code: string } }) {
      const store = load();
      const row = store.inviteCodes.find((c) => c.code.toLowerCase() === where.code.toLowerCase());
      return row ?? null;
    },
    async create({ data }: { data: { code: string } }) {
      const store = load();
      const row: InviteCode = {
        id: uid(),
        code: data.code,
        createdAt: new Date().toISOString(),
        usedBy: null,
        usedAt: null,
      };
      store.inviteCodes.push(row);
      save(store);
      return row;
    },
    async update({ where, data }: { where: { id: string }; data: Partial<InviteCode> }) {
      const store = load();
      const row = store.inviteCodes.find((c) => c.id === where.id);
      if (!row) throw new Error("Invite code not found");
      Object.assign(row, data);
      save(store);
      return row;
    },
  },
  settings: {
    async get() {
      return load().settings;
    },
    async update({ data }: { data: Partial<Settings> }) {
      const store = load();
      store.settings = { ...store.settings, ...data };
      save(store);
      return store.settings;
    },
  },
  announcement: {
    async findMany({ orderBy, take }: { orderBy?: { createdAt?: "desc" | "asc" }; take?: number } = {}) {
      const store = load();
      let rows = [...store.announcements];
      if (orderBy?.createdAt === "desc") {
        rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      } else if (orderBy?.createdAt === "asc") {
        rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      }
      if (take) rows = rows.slice(0, take);
      return rows;
    },
    async create({ data }: { data: Omit<Announcement, "id" | "createdAt"> }) {
      const store = load();
      const row: Announcement = {
        ...data,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      store.announcements.unshift(row);
      save(store);
      return row;
    },
    async delete({ where }: { where: { id: string } }) {
      const store = load();
      store.announcements = store.announcements.filter((a) => a.id !== where.id);
      save(store);
      return { id: where.id };
    },
  },
};

export { uid };
