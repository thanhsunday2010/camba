/**
 * Gắn module Academic cho câu hỏi & đề IELTS hiện có; chuyển pool key legacy → IELTS:AC:*.
 * Usage: npm run content:migrate-ielts-academic-module
 */
import "dotenv/config";
import { PrismaClient, Skill } from "@prisma/client";
import {
  buildIeltsSpeakingMockPoolKey,
  buildIeltsSpeakingPracticePoolKey,
  getIeltsSpeakingPartDef,
  IELTS_SPEAKING_PARTS,
} from "../src/lib/exam/ielts-speaking-config";
import {
  buildIeltsWritingMockPoolKey,
  buildIeltsWritingPracticePoolKey,
  getIeltsWritingTaskDef,
  IELTS_WRITING_TASKS,
} from "../src/lib/exam/ielts-writing-config";

const db = new PrismaClient();
const MODULE = "ACADEMIC" as const;

const LETTER_HINTS = [
  "Write a letter",
  "write a letter",
  "Formal letter",
  "formal letter",
];

function isLetterPrompt(text: string): boolean {
  return LETTER_HINTS.some((h) => text.includes(h));
}

async function tagSpeakingQuestions() {
  const questions = await db.question.findMany({
    where: {
      skill: Skill.SPEAKING,
      placementSlug: null,
      content: { path: ["examTrack"], equals: "IELTS" },
    },
    select: { id: true, content: true },
  });

  let tagged = 0;
  for (const q of questions) {
    const content = q.content as Record<string, unknown>;
    if (content.ieltsModule === MODULE) continue;
    await db.question.update({
      where: { id: q.id },
      data: {
        content: { ...content, ieltsModule: MODULE },
      },
    });
    tagged++;
  }
  console.log(`Speaking: gắn ieltsModule=ACADEMIC cho ${tagged} câu`);
}

async function tagWritingQuestions() {
  const questions = await db.question.findMany({
    where: {
      skill: Skill.WRITING,
      placementSlug: null,
      content: { path: ["examTrack"], equals: "IELTS" },
    },
    select: { id: true, title: true, content: true },
  });

  let academic = 0;
  let general = 0;
  for (const q of questions) {
    const content = q.content as Record<string, unknown>;
    const prompt = String(content.taskPrompt ?? "");
    const format = content.ieltsTask1Format;
    const isLetter =
      format === "letter" ||
      (q.title?.toLowerCase().includes("letter") ?? false) ||
      isLetterPrompt(prompt);

    const ieltsModuleTag = isLetter ? "GENERAL" : MODULE;
    if (content.ieltsModule === ieltsModuleTag) continue;

    await db.question.update({
      where: { id: q.id },
      data: {
        content: {
          ...content,
          ieltsModule: ieltsModuleTag,
          ...(isLetter ? { ieltsTask1Format: "letter" } : {}),
        },
      },
    });
    if (isLetter) general++;
    else academic++;
  }
  console.log(`Writing: ${academic} câu Academic · ${general} câu General (letter)`);
}

async function migrateSpeakingPapers() {
  for (const part of IELTS_SPEAKING_PARTS) {
    const newKey = buildIeltsSpeakingPracticePoolKey(part, MODULE);
    const legacyKey = `IELTS:SPK:P${part}`;
    const def = getIeltsSpeakingPartDef(part, MODULE);
    const title = `IELTS Academic Speaking — ${def.shortLabel} Luyện tập`;

    const paper = await db.examPaper.findFirst({
      where: { practicePoolKey: { in: [newKey, legacyKey] } },
    });
    if (!paper) continue;

    await db.examPaper.update({
      where: { id: paper.id },
      data: {
        practicePoolKey: newKey,
        title,
        description: `${def.practiceQuestionCount} câu ngẫu nhiên · ${def.description}`,
      },
    });
    console.log(`Speaking practice Part ${part} → ${newKey}`);
  }

  const mockKey = buildIeltsSpeakingMockPoolKey(MODULE);
  const mockPaper = await db.examPaper.findFirst({
    where: { mockPoolKey: { in: [mockKey, "IELTS:SPK:MOCK"] } },
  });
  if (mockPaper) {
    await db.examPaper.update({
      where: { id: mockPaper.id },
      data: {
        mockPoolKey: mockKey,
        title: "IELTS Academic Speaking — Mock test full",
      },
    });
    console.log(`Speaking mock → ${mockKey}`);
  }
}

async function migrateWritingPapers() {
  for (const task of IELTS_WRITING_TASKS) {
    const newKey = buildIeltsWritingPracticePoolKey(task, MODULE);
    const legacyKey = `IELTS:WRT:T${task}`;
    const def = getIeltsWritingTaskDef(task, MODULE);
    const title = `IELTS Academic Writing — ${def.shortLabel} Luyện tập`;

    const paper = await db.examPaper.findFirst({
      where: { practicePoolKey: { in: [newKey, legacyKey] } },
    });
    if (!paper) continue;

    await db.examPaper.update({
      where: { id: paper.id },
      data: {
        practicePoolKey: newKey,
        title,
        description: `1 câu ngẫu nhiên/lần · AI chấm band ngay · ${def.description}`,
      },
    });
    console.log(`Writing practice Task ${task} → ${newKey}`);
  }

  const mockKey = buildIeltsWritingMockPoolKey(MODULE);
  const mockPaper = await db.examPaper.findFirst({
    where: { mockPoolKey: { in: [mockKey, "IELTS:WRT:MOCK"] } },
  });
  if (mockPaper) {
    await db.examPaper.update({
      where: { id: mockPaper.id },
      data: {
        mockPoolKey: mockKey,
        title: "IELTS Academic Writing — Mock test full",
      },
    });
    console.log(`Writing mock → ${mockKey}`);
  }
}

async function main() {
  console.log("\n=== Migrate IELTS → Academic module ===\n");
  await tagSpeakingQuestions();
  await tagWritingQuestions();
  await migrateSpeakingPapers();
  await migrateWritingPapers();
  console.log("\nXong.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
