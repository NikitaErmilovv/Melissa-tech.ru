import { NextRequest, NextResponse } from "next/server";
import { resolveLogin } from "@/lib/auth-login";
import { applySessionCookie, cookieSecureFromHeaders } from "@/lib/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const result = await resolveLogin(email, password);
  const target = new URL(result.redirectTo, request.url);

  if (!result.ok && result.error) {
    target.searchParams.set("error", result.error);
  }

  const response = NextResponse.redirect(target, 303);

  if (result.ok) {
    applySessionCookie(response, result.userId, cookieSecureFromHeaders(request.headers));
  }

  return response;
}
