/**
 * Tag Cambridge Writing questions by Part + tạo đề luyện/mock theo Part.
 * Usage: npm run content:migrate-cambridge-writing
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
  buildCambridgeWritingMockPoolKey,
  buildCambridgeWritingPracticePoolKey,
  CAMBRIDGE_WRITING_LEVELS,
  getCambridgeWritingMockQuestionCount,
  getCambridgeWritingParts,
  getCambridgeWritingPartDef,
  buildCambridgeWritingMockSections,
  buildCambridgeWritingMockTimeLimit,
} from "../src/lib/exam/cambridge-writing-config";
import { formatExamLevel } from "../src/lib/constants";

const db = new PrismaClient();

async function tagQuestionsForLevel(level: ExamLevel) {
  const parts = getCambridgeWritingParts(level);
  const rows = await db.question.findMany({
    where: {
      level,
      skill: Skill.WRITING,
      type: QuestionType.FREE_TEXT,
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
    if (content.examTrack === "CAMBRIDGE" && content.cambridgeWritingPart === part) continue;

    await db.question.update({
      where: { id: q.id },
      data: {
        content: {
          ...content,
          examTrack: "CAMBRIDGE",
          cambridgeWritingPart: part,
        },
      },
    });
    tagged++;
  }

  return { total: questions.length, tagged };
}

async function countPartPool(level: ExamLevel, part: 1 | 2) {
  return db.question.count({
    where: {
      level,
      skill: Skill.WRITING,
      placementSlug: null,
      AND: [
        { content: { path: ["examTrack"], equals: "CAMBRIDGE" } },
        { content: { path: ["cambridgeWritingPart"], equals: part } },
      ],
    },
  });
}

async function upsertPracticePaper(level: ExamLevel, part: 1 | 2, poolCount: number) {
  const def = getCambridgeWritingPartDef(level, part);
  const poolKey = buildCambridgeWritingPracticePoolKey(level, part);
  const levelLabel = formatExamLevel(level);
  const title = `${levelLabel} Writing — ${def.shortLabel} Luyện tập`;
  const description = `1 câu ngẫu nhiên/lần · AI chấm ngay · ngân hàng ${poolCount} câu · ${def.description}`;

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
        skill: Skill.WRITING,
      },
    });
    return "updated";
  }

  await db.examPaper.create({
    data: {
      title,
      description,
      level,
      skill: Skill.WRITING,
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
  const poolKey = buildCambridgeWritingMockPoolKey(level);
  const count = getCambridgeWritingMockQuestionCount(level);
  const title = `${levelLabel} Writing — Mock test full`;
  const description = `${count} câu theo format Cambridge · ngân hàng ${totalPool} câu`;
  const sections = buildCambridgeWritingMockSections(level);

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
        timeLimit: buildCambridgeWritingMockTimeLimit(level),
        sections: sections as unknown as Prisma.InputJsonValue,
        level,
        skill: Skill.WRITING,
      },
    });
    return "updated";
  }

  await db.examPaper.create({
    data: {
      title,
      description,
      level,
      skill: Skill.WRITING,
      paperKind: PaperKind.MOCK_SKILL,
      mockPoolKey: poolKey,
      timeLimit: buildCambridgeWritingMockTimeLimit(level),
      sections: sections as unknown as Prisma.InputJsonValue,
      isMockTest: true,
      published: true,
    },
  });
  return "created";
}

async function unpublishLegacyWritingPapers(level: ExamLevel) {
  const legacyPracticeKey = `${level}:WRITING`;
  const legacyMockKey = `SKILL:${level}:WRITING`;

  const result = await db.examPaper.updateMany({
    where: {
      OR: [{ practicePoolKey: legacyPracticeKey }, { mockPoolKey: legacyMockKey }],
    },
    data: { published: false },
  });

  const extra = await db.examPaper.updateMany({
    where: {
      level,
      skill: Skill.WRITING,
      published: true,
      OR: [{ practicePoolKey: { not: null } }, { mockPoolKey: { not: null } }],
      NOT: {
        OR: [
          { practicePoolKey: { startsWith: `${level}:WRT:` } },
          { mockPoolKey: buildCambridgeWritingMockPoolKey(level) },
        ],
      },
    },
    data: { published: false },
  });

  return result.count + extra.count;
}

async function main() {
  console.log("\n=== Cambridge Writing — tag questions & papers ===\n");

  for (const level of CAMBRIDGE_WRITING_LEVELS) {
    console.log(`\n--- ${level} ---`);
    const { total, tagged } = await tagQuestionsForLevel(level);
    console.log(`Tagged ${tagged}/${total} writing questions`);

    for (const part of getCambridgeWritingParts(level)) {
      const poolCount = await countPartPool(level, part);
      const status = await upsertPracticePaper(level, part, poolCount);
      console.log(`${status} practice Part ${part}: ${poolCount} câu trong pool`);
    }

    const mockStatus = await upsertMockPaper(level, total);
    console.log(
      `${mockStatus} mock full (${getCambridgeWritingMockQuestionCount(level)} câu/lần)`
    );

    const hidden = await unpublishLegacyWritingPapers(level);
    if (hidden > 0) console.log(`Ẩn ${hidden} đề Writing cũ`);
  }

  console.log("\nXong.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
