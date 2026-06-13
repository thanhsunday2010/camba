import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function dbHostHint(url: string | undefined): string {
  if (!url) return "missing";
  const match = url.match(/@([^/?]+)/);
  return match?.[1] ?? "unknown";
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  const env = {
    databaseHost: dbHostHint(databaseUrl),
    databasePort: databaseUrl?.includes(":6543")
      ? "6543"
      : databaseUrl?.includes(":5432")
        ? "5432"
        : "unknown",
    hasPgbouncer: databaseUrl?.includes("pgbouncer=true") ?? false,
    hasDirectUrl: Boolean(process.env.DIRECT_URL),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
    nextAuthUrl: process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? null,
    vercelUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  };

  try {
    const users = await db.user.count();
    return NextResponse.json({ ok: true, users, env });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message, env }, { status: 500 });
  }
}
