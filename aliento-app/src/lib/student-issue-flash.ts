import { cookies } from "next/headers";

const FLASH_COOKIE = "aliento-new-student-last";

export type NewStudentFlash = {
  studentId: string;
  name: string;
  login: string;
  pass: string;
};

export async function setNewStudentFlash(data: NewStudentFlash) {
  const jar = await cookies();
  jar.set(FLASH_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/admin",
  });
}

/** Read-only: safe in Server Components. */
export async function readNewStudentFlash(): Promise<NewStudentFlash | null> {
  const jar = await cookies();
  const raw = jar.get(FLASH_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as NewStudentFlash;
    if (!parsed.studentId || !parsed.login || !parsed.pass) return null;
    return parsed;
  } catch {
    return null;
  }
}
