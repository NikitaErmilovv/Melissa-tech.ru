import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const base = process.env.SMOKE_BASE ?? "http://localhost:3000";
const secret = process.env.SESSION_SECRET ?? "aliento-local-dev-secret-change-later-32chars";
const store = JSON.parse(readFileSync("data/aliento.json", "utf8"));

function token(userId) {
  const payload = `${userId}.${Date.now() + 86_400_000}`;
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

const byRole = (role) => store.users.find((u) => u.role === role);
const student = byRole("STUDENT");
const sessions = {
  admin: token(byRole("ADMIN").id),
  teacher: token(byRole("TEACHER").id),
  student: token(student.id),
};

const checks = [
  ["/", null],
  ["/schedule", null],
  ["/halls", null],
  ["/subscriptions", null],
  ["/teachers", null],
  ["/events", null],
  ["/about", null],
  ["/contacts", null],
  ["/faq", null],
  ["/login", null],
  ["/register", null],
  ["/admin", "admin"],
  ["/admin/classes", "admin"],
  ["/admin/schedule", "admin"],
  ["/admin/halls", "admin"],
  ["/admin/students", "admin"],
  [`/admin/students/${student.id}`, "admin"],
  ["/admin/plans", "admin"],
  ["/admin/payments", "admin"],
  ["/admin/stats", "admin"],
  ["/admin/messages", "admin"],
  ["/admin/settings", "admin"],
  ["/admin", "teacher"],
  ["/admin/schedule", "teacher"],
  ["/admin/halls", "teacher"],
  ["/admin/classes", "teacher"],
  ["/admin/students", "teacher"],
  ["/cabinet", "student"],
  ["/cabinet/classes", "student"],
  ["/cabinet/subscriptions", "student"],
  ["/cabinet/profile", "student"],
  ["/cabinet/notifications", "student"],
];

let failures = 0;
for (const [path, role] of checks) {
  const headers = role ? { cookie: `aliento_session=${sessions[role]}` } : {};
  try {
    const res = await fetch(`${base}${path}`, { headers, redirect: "manual" });
    const ok = res.status === 200;
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${res.status} ${path}${role ? ` [${role}]` : ""}`);
  } catch (error) {
    failures++;
    console.log(`FAIL --- ${path} ${error.message}`);
  }
}

console.log(failures === 0 ? "\nAll routes returned 200." : `\n${failures} route(s) failed.`);
