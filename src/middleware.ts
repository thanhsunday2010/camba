import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getMiddlewareSession } from "@/lib/middleware-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getMiddlewareSession(req);

  const isLoggedIn = !!token;
  const role = (token?.role as string | undefined) ?? "";

  const protectedRoutes = ["/dashboard", "/practice", "/results", "/exams"];
  const adminRoutes = ["/admin", "/teacher"];
  const authRoutes = ["/login", "/register"];

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdmin && (!isLoggedIn || !["ADMIN", "TEACHER"].includes(role))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
