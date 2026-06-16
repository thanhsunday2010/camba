/**
 * Seed 100 câu Speaking IELTS + tạo đề luyện tập (Part 1–3) & mock full speaking.
 * Usage: npm run content:migrate-ielts-speaking
 */
import "dotenv/config";
import { ExamLevel, PaperKind, Prisma, PrismaClient, QuestionType, Skill } from "@prisma/client";
import {
  buildIeltsSpeakingMockSections,
  buildIeltsSpeakingMockTimeLimit,
  buildIeltsSpeakingPracticePoolKey,
  getIeltsSpeakingMockQuestionCount,
  IELTS_SPEAKING_LEVEL,
  IELTS_SPEAKING_MOCK_POOL_KEY,
  IELTS_SPEAKING_PART_DEFS,
  IELTS_SPEAKING_PARTS,
} from "../src/lib/exam/ielts-speaking-config";
import { getIeltsSpeakingBankSeeds } from "../prisma/seed/ielts-speaking-content";

const db = new PrismaClient();

async function seedQuestions() {
  const existing = await db.question.count({
    where: {
      skill: Skill.SPEAKING,
      placementSlug: null,
      content: { path: ["examTrack"], equals: "IELTS" },
    },
  });

  if (existing >= 100) {
    console.log(`Ngân hàng IELTS Speaking đã có ${existing} câu — bỏ qua seed`);
    return existing;
  }

  if (existing > 0) {
    console.log(`Xóa ${existing} câu IELTS Speaking cũ để seed lại...`);
    await db.question.deleteMany({
      where: {
        skill: Skill.SPEAKING,
        placementSlug: null,
        content: { path: ["examTrack"], equals: "IELTS" },
      },
    });
  }

  const seeds = getIeltsSpeakingBankSeeds();
  console.log(`Tạo ${seeds.length} câu IELTS Speaking`);

  for (const item of seeds) {
    await db.question.create({
      data: {
        type: QuestionType.SPEAKING_PROMPT,
        level: IELTS_SPEAKING_LEVEL,
        skill: Skill.SPEAKING,
        title: item.title,
        content: {
          prompt: item.prompt,
          preparationTime: item.preparationTime,
          speakingTime: item.speakingTime,
          examTrack: "IELTS",
          ieltsPart: item.ieltsPart,
        },
        points: 10,
      },
    });
  }

  return seeds.length;
}

async function countPartPool(part: 1 | 2 | 3) {
  return db.question.count({
    where: {
      level: IELTS_SPEAKING_LEVEL,
      skill: Skill.SPEAKING,
      placementSlug: null,
      AND: [
        { content: { path: ["examTrack"], equals: "IELTS" } },
        { content: { path: ["ieltsPart"], equals: part } },
      ],
    },
  });
}

async function upsertPracticePaper(part: 1 | 2 | 3, poolCount: number) {
  const def = IELTS_SPEAKING_PART_DEFS[part];
  const poolKey = buildIeltsSpeakingPracticePoolKey(part);
  const title = `IELTS Speaking — ${def.shortLabel} Luyện tập`;
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
        level: ExamLevel.FCE,
        skill: Skill.SPEAKING,
      },
    });
    return "updated";
  }

  await db.examPaper.create({
    data: {
      title,
      description,
      level: ExamLevel.FCE,
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

async function upsertMockPaper(totalPool: number) {
  const title = "IELTS Speaking — Mock test full";
  const count = getIeltsSpeakingMockQuestionCount();
  const description = `${count} câu theo format thi thật (Part 1: 8 · Part 2: 1 cue card · Part 3: 5) — ngân hàng ${totalPool} câu`;
  const sections = buildIeltsSpeakingMockSections();

  const existing = await db.examPaper.findUnique({
    where: { mockPoolKey: IELTS_SPEAKING_MOCK_POOL_KEY },
  });

  if (existing) {
    await db.examPaper.update({
      where: { id: existing.id },
      data: {
        title,
        description,
        published: true,
        isMockTest: true,
        paperKind: PaperKind.MOCK_SKILL,
        timeLimit: buildIeltsSpeakingMockTimeLimit(),
        sections: sections as unknown as Prisma.InputJsonValue,
        level: ExamLevel.FCE,
        skill: Skill.SPEAKING,
      },
    });
    return "updated";
  }

  await db.examPaper.create({
    data: {
      title,
      description,
      level: ExamLevel.FCE,
      skill: Skill.SPEAKING,
      paperKind: PaperKind.MOCK_SKILL,
      mockPoolKey: IELTS_SPEAKING_MOCK_POOL_KEY,
      timeLimit: buildIeltsSpeakingMockTimeLimit(),
      sections: sections as unknown as Prisma.InputJsonValue,
      isMockTest: true,
      published: true,
    },
  });
  return "created";
}

async function main() {
  console.log("\n=== IELTS Speaking — seed & papers ===\n");
  const seeded = await seedQuestions();

  for (const part of IELTS_SPEAKING_PARTS) {
    const poolCount = await countPartPool(part);
    const status = await upsertPracticePaper(part, poolCount);
    console.log(`${status} practice Part ${part}: ${poolCount} câu trong pool`);
  }

  const mockStatus = await upsertMockPaper(seeded);
  console.log(`${mockStatus} mock full speaking (${getIeltsSpeakingMockQuestionCount()} câu/lần)`);
  console.log("\nXong.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
