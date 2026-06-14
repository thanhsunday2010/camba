import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ attempts: [] });
  }

  const attempts = await db.attempt.findMany({
    where: {
      userId: session.user.id,
      paper: { paperKind: "PLACEMENT" },
      status: { in: ["SUBMITTED", "GRADED"] },
    },
    include: { paper: true },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    attempts: attempts.map((a) => ({
      id: a.id,
      title: a.paper.title,
      score: a.score,
      maxScore: a.maxScore,
      submittedAt: a.submittedAt?.toISOString() ?? null,
    })),
  });
}
