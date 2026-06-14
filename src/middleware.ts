import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getMiddlewareSession } from "@/lib/middleware-auth";
import {
  normalizeReferralCode,
  REFERRAL_COOKIE_MAX_AGE,
  REFERRAL_COOKIE_NAME,
} from "@/lib/referral/constants";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const refRaw = req.nextUrl.searchParams.get("ref");
  const refCode = refRaw ? normalizeReferralCode(refRaw) : "";

  const token = await getMiddlewareSession(req);

  const isLoggedIn = !!token;
  const role = (token?.role as string | undefined) ?? "";

  const protectedRoutes = ["/dashboard", "/practice", "/results", "/exams"];
  const adminRoutes = ["/admin"];
  const teacherRoutes = ["/teacher"];
  const authRoutes = ["/login", "/register"];

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r));
  const isTeacher = teacherRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  function withReferralCookie(response: NextResponse) {
    if (refCode) {
      response.cookies.set(REFERRAL_COOKIE_NAME, refCode, {
        maxAge: REFERRAL_COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return response;
  }

  if (isProtected && !isLoggedIn) {
    return withReferralCookie(NextResponse.redirect(new URL("/login", req.url)));
  }

  if (isAdmin && (!isLoggedIn || role !== "ADMIN")) {
    return withReferralCookie(NextResponse.redirect(new URL("/dashboard", req.url)));
  }

  if (isTeacher && (!isLoggedIn || !["TEACHER", "ADMIN"].includes(role))) {
    return withReferralCookie(NextResponse.redirect(new URL("/dashboard", req.url)));
  }

  if (isAuthRoute && isLoggedIn) {
    return withReferralCookie(NextResponse.redirect(new URL("/dashboard", req.url)));
  }

  return withReferralCookie(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
