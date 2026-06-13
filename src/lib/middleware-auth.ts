import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** Read session JWT in middleware — must use secure cookie name on HTTPS (Vercel). */
export async function getMiddlewareSession(req: NextRequest) {
  const isSecure =
    req.nextUrl.protocol === "https:" || process.env.VERCEL === "1";

  return getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: isSecure,
  });
}
