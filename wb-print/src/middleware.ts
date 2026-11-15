import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Если задан — браузер спросит логин и пароль (логин любой, проверяется только пароль). */
function panelPassword(): string | undefined {
  const value = process.env.PANEL_PASSWORD?.trim();
  return value || undefined;
}

function authorized(request: NextRequest, password: string): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;
  try {
    const decoded = atob(auth.slice(6));
    const colon = decoded.indexOf(":");
    const pass = colon >= 0 ? decoded.slice(colon + 1) : decoded;
    return pass === password;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const password = panelPassword();
  if (!password) return NextResponse.next();
  if (authorized(request, password)) return NextResponse.next();

  return new NextResponse("Нужен пароль панели", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Печатный стол", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
