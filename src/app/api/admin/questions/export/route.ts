import { NextRequest, NextResponse } from "next/server";
import { ExamLevel, Skill } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminPermission } from "@/lib/admin/access";
import {
  buildExportFilename,
  questionToExportRow,
  questionsToCsv,
} from "@/lib/admin/question-export";

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

export async function GET(req: NextRequest) {
  const { error } = await requireAdminPermission("questions.manage");
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const levelParam = searchParams.get("level") ?? "all";
  const skillParam = searchParams.get("skill") ?? "all";
  const poolParam = searchParams.get("pool") ?? "practice";
  const formatParam = searchParams.get("format") ?? "csv";

  if (levelParam !== "all" && !LEVELS.has(levelParam)) {
    return NextResponse.json({ error: "Level không hợp lệ" }, { status: 400 });
  }
  if (skillParam !== "all" && !SKILLS.has(skillParam)) {
    return NextResponse.json({ error: "Skill không hợp lệ" }, { status: 400 });
  }
  if (!["practice", "placement", "all"].includes(poolParam)) {
    return NextResponse.json({ error: "Pool không hợp lệ" }, { status: 400 });
  }
  if (!["csv", "json"].includes(formatParam)) {
    return NextResponse.json({ error: "Định dạng không hợp lệ (csv hoặc json)" }, { status: 400 });
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

  const nameParts = [levelParam, skillParam, poolParam];
  const filename = buildExportFilename(
    nameParts,
    formatParam === "csv" ? "csv" : "json"
  );

  if (formatParam === "csv") {
    const rows = questions.map(questionToExportRow);
    return new NextResponse(questionsToCsv(rows), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    filters: {
      level: levelParam,
      skill: skillParam,
      pool: poolParam,
      format: formatParam,
    },
    count: questions.length,
    questions,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
