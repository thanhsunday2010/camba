/**
 * Tag Cambridge Speaking questions by Part + tạo đề luyện/mock theo Part (giống IELTS).
 * Usage: npm run content:migrate-cambridge-speaking
 */
import "dotenv/config";
import {
  ExamLevel,
  PaperKind,
  Prisma,
  PrismaClient,
  QuestionType,
  Skill,
} from "@prisma/client";
import {
  buildCambridgeSpeakingMockPoolKey,
  buildCambridgeSpeakingPracticePoolKey,
  CAMBRIDGE_SPEAKING_LEVELS,
  getCambridgePartDef,
  getCambridgeSpeakingMockQuestionCount,
  getCambridgeSpeakingParts,
  buildCambridgeSpeakingMockSections,
  buildCambridgeSpeakingMockTimeLimit,
} from "../src/lib/exam/cambridge-speaking-config";
import { formatExamLevel } from "../src/lib/constants";

const db = new PrismaClient();

async function tagQuestionsForLevel(level: ExamLevel) {
  const parts = getCambridgeSpeakingParts(level);
  const rows = await db.question.findMany({
    where: {
      level,
      skill: Skill.SPEAKING,
      type: QuestionType.SPEAKING_PROMPT,
      placementSlug: null,
    },
    select: { id: true, content: true },
    orderBy: { id: "asc" },
  });

  const questions = rows.filter((q) => {
    const content = q.content as Record<string, unknown> | null;
    return content?.examTrack !== "IELTS";
  });

  let tagged = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]!;
    const part = parts[i % parts.length]!;
    const content = (q.content ?? {}) as Record<string, unknown>;
    if (content.examTrack === "CAMBRIDGE" && content.cambridgePart === part) continue;

    await db.question.update({
      where: { id: q.id },
      data: {
        content: {
          ...content,
          examTrack: "CAMBRIDGE",
          cambridgePart: part,
        },
      },
    });
    tagged++;
  }

  return { total: questions.length, tagged };
}

async function countPartPool(level: ExamLevel, part: 1 | 2 | 3) {
  return db.question.count({
    where: {
      level,
      skill: Skill.SPEAKING,
      placementSlug: null,
      AND: [
        { content: { path: ["examTrack"], equals: "CAMBRIDGE" } },
        { content: { path: ["cambridgePart"], equals: part } },
      ],
    },
  });
}

async function upsertPracticePaper(level: ExamLevel, part: 1 | 2 | 3, poolCount: number) {
  const def = getCambridgePartDef(level, part);
  const poolKey = buildCambridgeSpeakingPracticePoolKey(level, part);
  const levelLabel = formatExamLevel(level);
  const title = `${levelLabel} Speaking — ${def.shortLabel} Luyện tập`;
  const description = `${def.practiceQuestionCount} câu ngẫu nhiên từ ngân hàng ${poolCount} câu · ${def.description}`;

  const existing = await db.examPaper.findUnique({ where: { practicePoolKey: poolKey } });
  if (existing) {
    await db.examPaper.update({
      where: { id: existing.id },
      data: {
        title,
        description,
        published: true,
        isMockTest: false,
        paperKind: PaperKind.PRACTICE,
        timeLimit: def.practiceTimeLimitSeconds,
        level,
        skill: Skill.SPEAKING,
      },
    });
    return "updated";
  }

  await db.examPaper.create({
    data: {
      title,
      description,
      level,
      skill: Skill.SPEAKING,
      paperKind: PaperKind.PRACTICE,
      practicePoolKey: poolKey,
      timeLimit: def.practiceTimeLimitSeconds,
      isMockTest: false,
      published: true,
    },
  });
  return "created";
}

async function upsertMockPaper(level: ExamLevel, totalPool: number) {
  const levelLabel = formatExamLevel(level);
  const poolKey = buildCambridgeSpeakingMockPoolKey(level);
  const count = getCambridgeSpeakingMockQuestionCount(level);
  const title = `${levelLabel} Speaking — Mock test full`;
  const description = `${count} câu theo format Cambridge · ngân hàng ${totalPool} câu`;
  const sections = buildCambridgeSpeakingMockSections(level);

  const existing = await db.examPaper.findUnique({ where: { mockPoolKey: poolKey } });
  if (existing) {
    await db.examPaper.update({
      where: { id: existing.id },
      data: {
        title,
        description,
        published: true,
        isMockTest: true,
        paperKind: PaperKind.MOCK_SKILL,
        timeLimit: buildCambridgeSpeakingMockTimeLimit(level),
        sections: sections as unknown as Prisma.InputJsonValue,
        level,
        skill: Skill.SPEAKING,
      },
    });
    return "updated";
  }

  await db.examPaper.create({
    data: {
      title,
      description,
      level,
      skill: Skill.SPEAKING,
      paperKind: PaperKind.MOCK_SKILL,
      mockPoolKey: poolKey,
      timeLimit: buildCambridgeSpeakingMockTimeLimit(level),
      sections: sections as unknown as Prisma.InputJsonValue,
      isMockTest: true,
      published: true,
    },
  });
  return "created";
}

async function unpublishLegacySpeakingPapers(level: ExamLevel) {
  const legacyPracticeKey = `${level}:SPEAKING`;
  const legacyMockKey = `SKILL:${level}:SPEAKING`;

  const result = await db.examPaper.updateMany({
    where: {
      OR: [{ practicePoolKey: legacyPracticeKey }, { mockPoolKey: legacyMockKey }],
    },
    data: { published: false },
  });

  const extra = await db.examPaper.updateMany({
    where: {
      level,
      skill: Skill.SPEAKING,
      published: true,
      OR: [
        { practicePoolKey: { not: null } },
        { mockPoolKey: { not: null } },
      ],
      NOT: {
        OR: [
          { practicePoolKey: { startsWith: `${level}:SPK:` } },
          { mockPoolKey: buildCambridgeSpeakingMockPoolKey(level) },
        ],
      },
    },
    data: { published: false },
  });

  return result.count + extra.count;
}

async function main() {
  console.log("\n=== Cambridge Speaking — tag questions & papers ===\n");

  for (const level of CAMBRIDGE_SPEAKING_LEVELS) {
    console.log(`\n--- ${level} ---`);
    const { total, tagged } = await tagQuestionsForLevel(level);
    console.log(`Tagged ${tagged}/${total} speaking questions`);

    const parts = getCambridgeSpeakingParts(level);
    for (const part of parts) {
      const poolCount = await countPartPool(level, part);
      const status = await upsertPracticePaper(level, part, poolCount);
      console.log(`${status} practice Part ${part}: ${poolCount} câu trong pool`);
    }

    const mockStatus = await upsertMockPaper(level, total);
    console.log(
      `${mockStatus} mock full (${getCambridgeSpeakingMockQuestionCount(level)} câu/lần)`
    );

    const hidden = await unpublishLegacySpeakingPapers(level);
    if (hidden > 0) console.log(`Ẩn ${hidden} đề Speaking cũ`);
  }

  console.log("\nXong.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
