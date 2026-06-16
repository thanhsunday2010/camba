/**
 * Seed IELTS Writing tasks + tạo đề luyện/mock theo Task.
 * Usage: npm run content:migrate-ielts-writing
 */
import "dotenv/config";
import { PaperKind, Prisma, PrismaClient, QuestionType, Skill } from "@prisma/client";
import {
  buildIeltsWritingPracticePoolKey,
  buildIeltsWritingMockSections,
  buildIeltsWritingMockTimeLimit,
  getIeltsWritingMockQuestionCount,
  IELTS_WRITING_LEVEL,
  IELTS_WRITING_MOCK_POOL_KEY,
  IELTS_WRITING_TASK_DEFS,
  IELTS_WRITING_TASKS,
} from "../src/lib/exam/ielts-writing-config";

const db = new PrismaClient();

const IELTS_WRITING_SEEDS = [
  {
    task: 1 as const,
    title: "IELTS W T1 — Chart summary",
    taskPrompt:
      "The chart below shows the percentage of households with internet access in three countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    wordLimit: 150,
    instructions:
      "Write at least 150 words. (Imagine a line chart showing rising internet use in Country A, B and C.)",
  },
  {
    task: 2 as const,
    title: "IELTS W T2 — Opinion essay",
    taskPrompt:
      "Some people believe technology has made life more complicated. To what extent do you agree or disagree?",
    wordLimit: 250,
    instructions: "Write at least 250 words. Give reasons and examples from your knowledge or experience.",
  },
  {
    task: 1 as const,
    title: "IELTS W T1 — Formal letter",
    taskPrompt:
      "You recently attended a course and were dissatisfied with the facilities. Write a letter to the course organiser. In your letter: explain which course you took, describe the problems, and say what you would like them to do.",
    wordLimit: 150,
    instructions: "Write at least 150 words. You do NOT need to write any addresses.",
  },
  {
    task: 2 as const,
    title: "IELTS W T2 — Discussion",
    taskPrompt:
      "Some people think that working from home is better for employees and employers. Others disagree. Discuss both views and give your own opinion.",
    wordLimit: 250,
    instructions: "Write at least 250 words.",
  },
];

async function ensureQuestionBank() {
  let created = 0;
  for (const seed of IELTS_WRITING_SEEDS) {
    const exists = await db.question.findFirst({
      where: {
        level: IELTS_WRITING_LEVEL,
        skill: Skill.WRITING,
        title: seed.title,
      },
    });
    if (exists) continue;

    await db.question.create({
      data: {
        type: QuestionType.FREE_TEXT,
        level: IELTS_WRITING_LEVEL,
        skill: Skill.WRITING,
        title: seed.title,
        content: {
          taskPrompt: seed.taskPrompt,
          wordLimit: seed.wordLimit,
          instructions: seed.instructions,
          examTrack: "IELTS",
          ieltsWritingTask: seed.task,
        },
        points: 10,
        orderIndex: created,
      },
    });
    created++;
  }
  return created;
}

async function countTaskPool(task: 1 | 2) {
  return db.question.count({
    where: {
      level: IELTS_WRITING_LEVEL,
      skill: Skill.WRITING,
      placementSlug: null,
      AND: [
        { content: { path: ["examTrack"], equals: "IELTS" } },
        { content: { path: ["ieltsWritingTask"], equals: task } },
      ],
    },
  });
}

async function upsertPracticePaper(task: 1 | 2, poolCount: number) {
  const def = IELTS_WRITING_TASK_DEFS[task];
  const poolKey = buildIeltsWritingPracticePoolKey(task);
  const title = `IELTS Writing — ${def.shortLabel} Luyện tập`;
  const description = `1 câu ngẫu nhiên/lần · AI chấm band ngay · ngân hàng ${poolCount} câu · ${def.description}`;

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
        level: IELTS_WRITING_LEVEL,
        skill: Skill.WRITING,
      },
    });
    return "updated";
  }

  await db.examPaper.create({
    data: {
      title,
      description,
      level: IELTS_WRITING_LEVEL,
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

async function upsertMockPaper(totalPool: number) {
  const count = getIeltsWritingMockQuestionCount();
  const title = "IELTS Writing — Mock test full";
  const description = `${count} câu (Task 1 + Task 2) · ngân hàng ${totalPool} câu · AI chấm band IELTS`;
  const sections = buildIeltsWritingMockSections();

  const existing = await db.examPaper.findUnique({
    where: { mockPoolKey: IELTS_WRITING_MOCK_POOL_KEY },
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
        timeLimit: buildIeltsWritingMockTimeLimit(),
        sections: sections as unknown as Prisma.InputJsonValue,
        level: IELTS_WRITING_LEVEL,
        skill: Skill.WRITING,
      },
    });
    return "updated";
  }

  await db.examPaper.create({
    data: {
      title,
      description,
      level: IELTS_WRITING_LEVEL,
      skill: Skill.WRITING,
      paperKind: PaperKind.MOCK_SKILL,
      mockPoolKey: IELTS_WRITING_MOCK_POOL_KEY,
      timeLimit: buildIeltsWritingMockTimeLimit(),
      sections: sections as unknown as Prisma.InputJsonValue,
      isMockTest: true,
      published: true,
    },
  });
  return "created";
}

async function main() {
  console.log("\n=== IELTS Writing — seed & papers ===\n");

  const created = await ensureQuestionBank();
  console.log(`Created ${created} new IELTS writing questions`);

  for (const task of IELTS_WRITING_TASKS) {
    const poolCount = await countTaskPool(task);
    const status = await upsertPracticePaper(task, poolCount);
    console.log(`${status} practice Task ${task}: ${poolCount} câu trong pool`);
  }

  const total = await db.question.count({
    where: {
      level: IELTS_WRITING_LEVEL,
      skill: Skill.WRITING,
      placementSlug: null,
      content: { path: ["examTrack"], equals: "IELTS" },
    },
  });

  const mockStatus = await upsertMockPaper(total);
  console.log(`${mockStatus} mock full (${getIeltsWritingMockQuestionCount()} câu/lần)`);
  console.log("\nXong.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
