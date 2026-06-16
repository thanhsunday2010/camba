import { NextRequest, NextResponse } from "next/server";
import { ExamLevel, Skill } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminPermission } from "@/lib/admin/access";

const LEVELS = new Set<string>([
  "STARTERS",
  "MOVERS",
  "FLYERS",
  "KET",
  "PET",
  "FCE",
]);

const SKILLS = new Set<string>([
  "READING",
  "WRITING",
  "LISTENING",
  "SPEAKING",
  "USE_OF_ENGLISH",
]);

function buildFilename(parts: string[]): string {
  const date = new Date().toISOString().slice(0, 10);
  return `camba-questions-${parts.filter(Boolean).join("-")}-${date}.json`;
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdminPermission("questions.manage");
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const levelParam = searchParams.get("level") ?? "all";
  const skillParam = searchParams.get("skill") ?? "all";
  const poolParam = searchParams.get("pool") ?? "practice";

  if (levelParam !== "all" && !LEVELS.has(levelParam)) {
    return NextResponse.json({ error: "Level không hợp lệ" }, { status: 400 });
  }
  if (skillParam !== "all" && !SKILLS.has(skillParam)) {
    return NextResponse.json({ error: "Skill không hợp lệ" }, { status: 400 });
  }
  if (!["practice", "placement", "all"].includes(poolParam)) {
    return NextResponse.json({ error: "Pool không hợp lệ" }, { status: 400 });
  }

  const where: {
    level?: ExamLevel;
    skill?: Skill;
    placementSlug?: null | { not: null };
  } = {};

  if (levelParam !== "all") where.level = levelParam as ExamLevel;
  if (skillParam !== "all") where.skill = skillParam as Skill;
  if (poolParam === "practice") where.placementSlug = null;
  else if (poolParam === "placement") where.placementSlug = { not: null };

  const questions = await db.question.findMany({
    where,
    orderBy: [{ level: "asc" }, { skill: "asc" }, { type: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      type: true,
      level: true,
      skill: true,
      title: true,
      content: true,
      correctAnswer: true,
      rubric: true,
      points: true,
      orderIndex: true,
      audioUrl: true,
      placementSlug: true,
      placementPool: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    filters: {
      level: levelParam,
      skill: skillParam,
      pool: poolParam,
    },
    count: questions.length,
    questions,
  };

  const filename = buildFilename([levelParam, skillParam, poolParam]);

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
