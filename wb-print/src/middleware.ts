import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Если задан пароль — браузер спросит логин и пароль. Логин из PANEL_USER (если задан — только он). */
function panelAuth(): { user?: string; password?: string } {
  const password = process.env.PANEL_PASSWORD?.trim();
  const user =
    process.env.PANEL_USER?.trim() ||
    process.env.PANEL_LOGIN?.trim() ||
    undefined;
  if (!password) return {};
  return { user, password };
}

function authorized(request: NextRequest, expected: { user?: string; password: string }): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;
  try {
    const decoded = atob(auth.slice(6));
    const colon = decoded.indexOf(":");
    const login = colon >= 0 ? decoded.slice(0, colon) : "";
    const pass = colon >= 0 ? decoded.slice(colon + 1) : decoded;
    if (expected.user && login !== expected.user) return false;
    return pass === expected.password;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const expected = panelAuth();
  if (!expected.password) return NextResponse.next();
  if (authorized(request, expected as { user?: string; password: string })) return NextResponse.next();

  return new NextResponse("Нужен пароль панели", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Печатный стол", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
