import {
  PrismaClient,
  ExamLevel,
  Skill,
  QuestionType,
  PaperKind,
  Prisma,
} from "@prisma/client";
import type { PaperSection } from "../../src/lib/exam/paper-sections";
import {
  cambridgeMockDescription,
  cambridgeMockTotalSeconds,
  getCambridgeMockFormat,
  validateMockContentPools,
} from "../../src/lib/exam/cambridge-mock-formats";
import {
  getPlacementTests,
} from "./placement-content";
import { PLACEMENT_SLUG_BY_TITLE } from "../../src/lib/placement/placement-config";
import { poolCountForTest, seedPlacementQuestionBank } from "./placement-bank";

export type McqSeed = {
  title: string;
  passage?: string;
  question: string;
  options: string[];
  answer: string;
  imageUrl?: string;
  imageDescription?: string;
  sceneEmoji?: string;
  questionType?: string;
};

export type GapSeed = {
  title: string;
  passage: string;
  question: string;
  answer: string;
};

export type WritingSeed = {
  title: string;
  taskPrompt: string;
  wordLimit: number;
  instructions: string;
};

export type ListeningSeed = {
  title: string;
  transcript: string;
  question: string;
  options: string[];
  answer: string;
  audioSlug?: string;
  imageUrl?: string;
  imageDescription?: string;
  sceneEmoji?: string;
  questionType?: string;
};

export type SpeakingSeed = {
  title: string;
  prompt: string;
  preparationTime?: number;
  speakingTime?: number;
};

export type QuestionBankMeta = {
  placementSlug: string;
  placementPool: string;
};

export async function createMcqs(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill,
  items: McqSeed[],
  bank?: QuestionBankMeta
) {
  const ids: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const q = await db.question.create({
      data: {
        type: QuestionType.MCQ,
        level,
        skill,
        title: item.title,
        content: {
          ...(item.passage ? { passage: item.passage } : {}),
          question: item.question,
          options: item.options,
          ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
          ...(item.imageDescription ? { imageDescription: item.imageDescription } : {}),
          ...(item.sceneEmoji ? { sceneEmoji: item.sceneEmoji } : {}),
          ...(item.questionType ? { questionType: item.questionType } : {}),
        },
        correctAnswer: item.answer,
        points: 1,
        orderIndex: i,
        placementSlug: bank?.placementSlug,
        placementPool: bank?.placementPool,
      },
    });
    ids.push(q.id);
  }
  return ids;
}

export async function createGaps(
  db: PrismaClient,
  level: ExamLevel,
  items: GapSeed[],
  bank?: QuestionBankMeta
) {
  const ids: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const passage = item.passage.includes("___")
      ? item.passage
      : `${item.passage} ___`;
    const q = await db.question.create({
      data: {
        type: QuestionType.GAP_FILL,
        level,
        skill: Skill.USE_OF_ENGLISH,
        title: item.title,
        content: { passage, blanks: 1 },
        correctAnswer: item.answer,
        points: 1,
        orderIndex: i,
        placementSlug: bank?.placementSlug,
        placementPool: bank?.placementPool,
      },
    });
    ids.push(q.id);
  }
  return ids;
}

export async function createWritings(
  db: PrismaClient,
  level: ExamLevel,
  items: WritingSeed[],
  bank?: QuestionBankMeta
) {
  const ids: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const q = await db.question.create({
      data: {
        type: QuestionType.FREE_TEXT,
        level,
        skill: Skill.WRITING,
        title: item.title,
        content: {
          taskPrompt: item.taskPrompt,
          wordLimit: item.wordLimit,
          instructions: item.instructions,
        },
        points: 10,
        orderIndex: i,
        placementSlug: bank?.placementSlug,
        placementPool: bank?.placementPool,
      },
    });
    ids.push(q.id);
  }
  return ids;
}

export async function createListenings(
  db: PrismaClient,
  level: ExamLevel,
  items: ListeningSeed[],
  startIndex = 0,
  bank?: QuestionBankMeta
) {
  const ids: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const slug = item.audioSlug ?? String(startIndex + i + 1).padStart(3, "0");
    const audioUrl = `/audio/listening/${level}/${slug}.mp3`;
    const q = await db.question.create({
      data: {
        type: QuestionType.MCQ,
        level,
        skill: Skill.LISTENING,
        title: item.title,
        audioUrl,
        content: {
          question: item.question,
          options: item.options,
          transcript: item.transcript,
          ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
          ...(item.imageDescription ? { imageDescription: item.imageDescription } : {}),
          ...(item.sceneEmoji ? { sceneEmoji: item.sceneEmoji } : {}),
          ...(item.questionType ? { questionType: item.questionType } : {}),
        },
        correctAnswer: item.answer,
        points: 1,
        orderIndex: startIndex + i,
        placementSlug: bank?.placementSlug,
        placementPool: bank?.placementPool,
      },
    });
    ids.push(q.id);
  }
  return ids;
}

export async function createSpeakings(
  db: PrismaClient,
  level: ExamLevel,
  items: SpeakingSeed[],
  bank?: QuestionBankMeta
) {
  const ids: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const q = await db.question.create({
      data: {
        type: QuestionType.SPEAKING_PROMPT,
        level,
        skill: Skill.SPEAKING,
        title: item.title,
        content: {
          prompt: item.prompt,
          preparationTime: item.preparationTime ?? 15,
          speakingTime: item.speakingTime ?? 60,
        },
        points: 10,
        orderIndex: i,
        placementSlug: bank?.placementSlug,
        placementPool: bank?.placementPool,
      },
    });
    ids.push(q.id);
  }
  return ids;
}

type PaperOpts = {
  description?: string;
  timeLimit?: number;
  isMockTest?: boolean;
  paperKind?: PaperKind;
  sections?: PaperSection[];
  placementSlug?: string;
};

export async function createPaper(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill,
  title: string,
  questionIds: string[],
  opts: PaperOpts = {}
) {
  return db.examPaper.create({
    data: {
      title,
      description: opts.description,
      level,
      skill,
      timeLimit: opts.timeLimit,
      isMockTest: opts.isMockTest ?? false,
      paperKind: opts.paperKind ?? PaperKind.PRACTICE,
      placementSlug: opts.placementSlug,
      sections: opts.sections
        ? (opts.sections as unknown as Prisma.InputJsonValue)
        : undefined,
      published: true,
      ...(questionIds.length > 0
        ? {
            questions: {
              create: questionIds.map((questionId, orderIndex) => ({
                questionId,
                orderIndex,
              })),
            },
          }
        : {}),
    },
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export async function seedBulkLevel(
  db: PrismaClient,
  level: ExamLevel,
  data: {
    reading: McqSeed[];
    listening: ListeningSeed[];
    writing: WritingSeed[];
    speaking: SpeakingSeed[];
    uoe: GapSeed[];
  }
) {
  const isYle =
    level === ExamLevel.STARTERS ||
    level === ExamLevel.MOVERS ||
    level === ExamLevel.FLYERS;

  const readingChunks = chunk(data.reading, 10);
  for (let i = 0; i < readingChunks.length; i++) {
    const ids = await createMcqs(db, level, Skill.READING, readingChunks[i]);
    await createPaper(db, level, Skill.READING, `${level} Reading Practice ${i + 1}`, ids, {
      description: `Luyện đọc hiểu ${level} — ${readingChunks[i].length} câu`,
      timeLimit: isYle ? 900 : 1200,
    });
  }

  const readingMockIds = await createMcqs(
    db,
    level,
    Skill.READING,
    data.reading.slice(0, Math.min(20, data.reading.length))
  );
  await createPaper(db, level, Skill.READING, `${level} Reading Mock Test`, readingMockIds, {
    description: `Thi thử Reading ${level}`,
    timeLimit: level === "FCE" ? 3600 : level === "PET" ? 2700 : 1800,
    isMockTest: true,
    paperKind: PaperKind.MOCK_SKILL,
  });

  const listenChunks = chunk(data.listening, 12);
  for (let i = 0; i < listenChunks.length; i++) {
    const ids = await createListenings(db, level, listenChunks[i], i * 12);
    await createPaper(db, level, Skill.LISTENING, `${level} Listening Practice ${i + 1}`, ids, {
      description: "Nghe audio và chọn đáp án đúng",
      timeLimit: 600,
    });
  }

  const listenMockIds = await createListenings(
    db,
    level,
    data.listening.slice(0, Math.min(15, data.listening.length)),
    100
  );
  await createPaper(db, level, Skill.LISTENING, `${level} Listening Mock Test`, listenMockIds, {
    description: "Thi thử Listening có audio",
    timeLimit: 900,
    isMockTest: true,
    paperKind: PaperKind.MOCK_SKILL,
  });

  if (data.uoe.length > 0) {
    const uoeChunks = chunk(data.uoe, 10);
    for (let i = 0; i < uoeChunks.length; i++) {
      const ids = await createGaps(db, level, uoeChunks[i]);
      await createPaper(
        db,
        level,
        Skill.USE_OF_ENGLISH,
        `${level} Use of English Practice ${i + 1}`,
        ids,
        { description: "Ngữ pháp & từ vựng", timeLimit: 900 }
      );
    }
    const uoeMockIds = await createGaps(db, level, data.uoe.slice(0, Math.min(15, data.uoe.length)));
    await createPaper(
      db,
      level,
      Skill.USE_OF_ENGLISH,
      `${level} Use of English Mock Test`,
      uoeMockIds,
      {
        description: "Thi thử Use of English",
        timeLimit: 1200,
        isMockTest: true,
        paperKind: PaperKind.MOCK_SKILL,
      }
    );
  }

  for (let i = 0; i < data.writing.length; i++) {
    const ids = await createWritings(db, level, [data.writing[i]]);
    await createPaper(db, level, Skill.WRITING, `${level} Writing Practice ${i + 1}`, ids, {
      description: "AI chấm theo rubric Cambridge",
      timeLimit: 900,
    });
  }

  const writingMockIds = await createWritings(
    db,
    level,
    data.writing.slice(0, Math.min(2, data.writing.length))
  );
  for (let i = 0; i < writingMockIds.length; i++) {
    await createPaper(
      db,
      level,
      Skill.WRITING,
      `${level} Writing Mock Test ${i + 1}`,
      [writingMockIds[i]],
      {
        description: "Thi thử Writing có AI chấm",
        timeLimit: 1200,
        isMockTest: true,
        paperKind: PaperKind.MOCK_SKILL,
      }
    );
  }

  for (let i = 0; i < data.speaking.length; i++) {
    const ids = await createSpeakings(db, level, [data.speaking[i]]);
    await createPaper(db, level, Skill.SPEAKING, `${level} Speaking ${i + 1}`, ids, {
      description: "Web Speech + AI chấm Speaking",
      timeLimit: 300,
      isMockTest: i === data.speaking.length - 1,
      paperKind: i === data.speaking.length - 1 ? PaperKind.MOCK_SKILL : PaperKind.PRACTICE,
    });
  }

  await createFullMockForLevel(db, level, data);
}

type MockContentPools = {
  reading: McqSeed[];
  listening: ListeningSeed[];
  writing: WritingSeed[];
  speaking: SpeakingSeed[];
  uoe: GapSeed[];
};

async function createSkillQuestions(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill,
  items: McqSeed[] | ListeningSeed[] | WritingSeed[] | SpeakingSeed[] | GapSeed[],
  listenOffset: number
): Promise<string[]> {
  switch (skill) {
    case Skill.READING:
      return createMcqs(db, level, skill, items as McqSeed[]);
    case Skill.LISTENING:
      return createListenings(db, level, items as ListeningSeed[], listenOffset);
    case Skill.WRITING:
      return createWritings(db, level, items as WritingSeed[]);
    case Skill.SPEAKING:
      return createSpeakings(db, level, items as SpeakingSeed[]);
    case Skill.USE_OF_ENGLISH:
      return createGaps(db, level, items as GapSeed[]);
    default:
      return [];
  }
}

async function createFullMockForLevel(db: PrismaClient, level: ExamLevel, data: MockContentPools) {
  const format = getCambridgeMockFormat(level);
  validateMockContentPools(level, {
    [Skill.READING]: data.reading.length,
    [Skill.LISTENING]: data.listening.length,
    [Skill.WRITING]: data.writing.length,
    [Skill.SPEAKING]: data.speaking.length,
    [Skill.USE_OF_ENGLISH]: data.uoe.length,
  });

  const poolIndex: Partial<Record<Skill, number>> = {};
  const allIds: string[] = [];
  const sections: PaperSection[] = [];
  let listenOffset = 300;

  for (const spec of format.sections) {
    const sectionStart = allIds.length;

    for (const slice of spec.slices) {
      const start = poolIndex[slice.skill] ?? 0;
      const pool = data[skillPoolKey(slice.skill)];
      const items = pool.slice(start, start + slice.count);
      if (items.length < slice.count) {
        throw new Error(
          `${level} full mock: thiếu câu ${slice.skill} (cần ${slice.count}, có ${items.length})`
        );
      }
      poolIndex[slice.skill] = start + slice.count;

      const ids = await createSkillQuestions(
        db,
        level,
        slice.skill,
        items,
        listenOffset
      );
      if (slice.skill === Skill.LISTENING) {
        listenOffset += ids.length;
      }
      allIds.push(...ids);
    }

    sections.push({
      skill: spec.slices[0].skill,
      label: spec.label,
      startIndex: sectionStart,
      endIndex: allIds.length,
      timeLimit: spec.timeLimitSeconds,
    });
  }

  const totalTime = cambridgeMockTotalSeconds(format);

  await createPaper(db, level, Skill.READING, format.paperTitle, allIds, {
    description: cambridgeMockDescription(format),
    timeLimit: totalTime,
    isMockTest: true,
    paperKind: PaperKind.MOCK_FULL,
    sections,
  });
}

function skillPoolKey(skill: Skill): keyof MockContentPools {
  switch (skill) {
    case Skill.READING:
      return "reading";
    case Skill.LISTENING:
      return "listening";
    case Skill.WRITING:
      return "writing";
    case Skill.SPEAKING:
      return "speaking";
    case Skill.USE_OF_ENGLISH:
      return "uoe";
    default:
      throw new Error(`Unsupported skill pool: ${skill}`);
  }
}

export async function seedPlacementTests(db: PrismaClient) {
  await seedPlacementQuestionBank(db);

  for (const test of getPlacementTests()) {
    const slug = PLACEMENT_SLUG_BY_TITLE[test.title];
    if (!slug) {
      throw new Error(`Missing placement slug for "${test.title}"`);
    }

    const sections: PaperSection[] = [];
    let idx = 0;

    for (const spec of test.sectionOrder) {
      const count = poolCountForTest(test, spec.pool);
      if (count === 0) continue;
      const sectionStart = idx;
      idx += count;
      const meta = test.sections.find((s) => s.pool === spec.pool);
      sections.push({
        skill: meta?.skill ?? Skill.READING,
        label: spec.label,
        startIndex: sectionStart,
        endIndex: idx,
        timeLimit: spec.timeLimitSeconds,
      });
    }

    await createPaper(db, test.level, Skill.READING, test.title, [], {
      description: test.description,
      timeLimit: test.totalTimeSeconds,
      isMockTest: true,
      paperKind: PaperKind.PLACEMENT,
      placementSlug: slug,
      sections,
    });

    console.log(
      `  ✓ ${test.title} (template · ${idx} câu/lượt · ${test.totalTimeSeconds / 60} phút)`
    );
  }
}
