import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { PublicUser, Role } from "./format";

const COOKIE = "aliento_session";

function secret() {
  return process.env.SESSION_SECRET || "aliento-local-dev-secret-change-later-32chars";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export async function createSession(userId: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = `${userId}.${exp}`;
  const token = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

function readToken(token: string): { userId: string; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expRaw, sig] = parts;
  const payload = `${userId}.${expRaw}`;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  return { userId, exp };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const parsed = readToken(token);
  if (!parsed) return null;
  const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
  if (!user || user.blocked) return null;
  const emailVerified =
    user.emailVerified ?? (user.role !== "STUDENT" || user.isDemo === true);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as Role,
    emailVerified,
  };
}
