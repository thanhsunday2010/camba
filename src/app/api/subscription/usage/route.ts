import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDailyUsageSnapshot } from "@/lib/subscription/service";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDailyUsageSnapshot(session.user.id);
  return NextResponse.json(snapshot);
}
