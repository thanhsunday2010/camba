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
} from "../../src/lib/exam/cambridge-mock-formats";
import {
  getPlacementTests,
} from "./placement-content";
import { PLACEMENT_SLUG_BY_TITLE } from "../../src/lib/placement/placement-config";
import { poolCountForTest, seedPlacementQuestionBank } from "./placement-bank";
import {
  computeRequiredPoolSizes,
  getPracticePaperCounts,
  MOCK_FULL_PAPERS_PER_LEVEL,
  MOCK_SKILL_PAPERS_PER_SKILL,
  PRACTICE_QUESTIONS_PER_PAPER,
  SKILL_MOCK_QUESTION_COUNTS,
  skillMockTimeLimit,
} from "./seed-targets";

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

type MockContentPools = {
  reading: McqSeed[];
  listening: ListeningSeed[];
  writing: WritingSeed[];
  speaking: SpeakingSeed[];
  uoe: GapSeed[];
};

type PoolCursor = {
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
  uoe: number;
};

function takeFromPool<T>(pool: T[], cursor: number, count: number, label: string): T[] {
  const items = pool.slice(cursor, cursor + count);
  if (items.length < count) {
    throw new Error(`${label}: cần ${count} câu, còn ${items.length} (cursor ${cursor})`);
  }
  return items;
}

function validateExpandedPools(level: ExamLevel, data: MockContentPools) {
  const required = computeRequiredPoolSizes(level);
  const keys = ["reading", "listening", "writing", "speaking", "uoe"] as const;
  for (const key of keys) {
    if (data[key].length < required[key]) {
      throw new Error(
        `${level}: ngân hàng ${key} cần ${required[key]} câu, chỉ có ${data[key].length}`
      );
    }
  }
}

export async function seedBulkLevel(
  db: PrismaClient,
  level: ExamLevel,
  data: MockContentPools
) {
  validateExpandedPools(level, data);

  const isYle =
    level === ExamLevel.STARTERS ||
    level === ExamLevel.MOVERS ||
    level === ExamLevel.FLYERS;

  const practice = getPracticePaperCounts(level);
  const mockSizes = SKILL_MOCK_QUESTION_COUNTS[level];
  const cursors: PoolCursor = {
    reading: 0,
    listening: 0,
    writing: 0,
    speaking: 0,
    uoe: 0,
  };
  let listenAudioOffset = 0;

  for (let i = 0; i < practice.reading; i++) {
    const items = takeFromPool(
      data.reading,
      cursors.reading,
      PRACTICE_QUESTIONS_PER_PAPER.reading,
      `${level} reading practice ${i + 1}`
    );
    cursors.reading += items.length;
    const ids = await createMcqs(db, level, Skill.READING, items);
    await createPaper(db, level, Skill.READING, `${level} Reading Practice ${i + 1}`, ids, {
      description: `Luyện đọc hiểu ${level} — ${items.length} câu`,
      timeLimit: isYle ? 900 : 1200,
    });
  }

  for (let m = 0; m < MOCK_SKILL_PAPERS_PER_SKILL; m++) {
    const size = mockSizes[Skill.READING] ?? 0;
    if (size === 0) continue;
    const items = takeFromPool(
      data.reading,
      cursors.reading,
      size,
      `${level} reading mock ${m + 1}`
    );
    cursors.reading += items.length;
    const ids = await createMcqs(db, level, Skill.READING, items);
    await createPaper(
      db,
      level,
      Skill.READING,
      `${level} Reading Mock Test ${m + 1}`,
      ids,
      {
        description: `Thi thử Reading ${level} — đề ${m + 1}`,
        timeLimit: skillMockTimeLimit(level, Skill.READING),
        isMockTest: true,
        paperKind: PaperKind.MOCK_SKILL,
      }
    );
  }

  for (let i = 0; i < practice.listening; i++) {
    const items = takeFromPool(
      data.listening,
      cursors.listening,
      PRACTICE_QUESTIONS_PER_PAPER.listening,
      `${level} listening practice ${i + 1}`
    );
    cursors.listening += items.length;
    const ids = await createListenings(db, level, items, listenAudioOffset);
    listenAudioOffset += ids.length;
    await createPaper(
      db,
      level,
      Skill.LISTENING,
      `${level} Listening Practice ${i + 1}`,
      ids,
      {
        description: "Nghe audio và chọn đáp án đúng",
        timeLimit: 600,
      }
    );
  }

  for (let m = 0; m < MOCK_SKILL_PAPERS_PER_SKILL; m++) {
    const size = mockSizes[Skill.LISTENING] ?? 0;
    if (size === 0) continue;
    const items = takeFromPool(
      data.listening,
      cursors.listening,
      size,
      `${level} listening mock ${m + 1}`
    );
    cursors.listening += items.length;
    const ids = await createListenings(db, level, items, listenAudioOffset);
    listenAudioOffset += ids.length;
    await createPaper(
      db,
      level,
      Skill.LISTENING,
      `${level} Listening Mock Test ${m + 1}`,
      ids,
      {
        description: `Thi thử Listening ${level} — đề ${m + 1}`,
        timeLimit: skillMockTimeLimit(level, Skill.LISTENING),
        isMockTest: true,
        paperKind: PaperKind.MOCK_SKILL,
      }
    );
  }

  if (practice.uoe > 0) {
    for (let i = 0; i < practice.uoe; i++) {
      const items = takeFromPool(
        data.uoe,
        cursors.uoe,
        PRACTICE_QUESTIONS_PER_PAPER.uoe,
        `${level} grammar practice ${i + 1}`
      );
      cursors.uoe += items.length;
      const ids = await createGaps(db, level, items);
      await createPaper(
        db,
        level,
        Skill.USE_OF_ENGLISH,
        `${level} Grammar & UoE Practice ${i + 1}`,
        ids,
        { description: "Ngữ pháp & Use of English", timeLimit: 900 }
      );
    }

    for (let m = 0; m < MOCK_SKILL_PAPERS_PER_SKILL; m++) {
      const size = mockSizes[Skill.USE_OF_ENGLISH] ?? 0;
      if (size === 0) continue;
      const items = takeFromPool(
        data.uoe,
        cursors.uoe,
        size,
        `${level} grammar mock ${m + 1}`
      );
      cursors.uoe += items.length;
      const ids = await createGaps(db, level, items);
      await createPaper(
        db,
        level,
        Skill.USE_OF_ENGLISH,
        `${level} Grammar & UoE Mock Test ${m + 1}`,
        ids,
        {
          description: `Thi thử Grammar & UoE ${level} — đề ${m + 1}`,
          timeLimit: skillMockTimeLimit(level, Skill.USE_OF_ENGLISH),
          isMockTest: true,
          paperKind: PaperKind.MOCK_SKILL,
        }
      );
    }
  }

  for (let i = 0; i < practice.writing; i++) {
    const items = takeFromPool(
      data.writing,
      cursors.writing,
      PRACTICE_QUESTIONS_PER_PAPER.writing,
      `${level} writing practice ${i + 1}`
    );
    cursors.writing += items.length;
    const ids = await createWritings(db, level, items);
    await createPaper(
      db,
      level,
      Skill.WRITING,
      `${level} Writing Practice ${i + 1}`,
      ids,
      {
        description: "AI chấm theo rubric Cambridge",
        timeLimit: 900,
      }
    );
  }

  for (let m = 0; m < MOCK_SKILL_PAPERS_PER_SKILL; m++) {
    const size = mockSizes[Skill.WRITING] ?? 0;
    if (size === 0) continue;
    const items = takeFromPool(
      data.writing,
      cursors.writing,
      size,
      `${level} writing mock ${m + 1}`
    );
    cursors.writing += items.length;
    const ids = await createWritings(db, level, items);
    await createPaper(
      db,
      level,
      Skill.WRITING,
      `${level} Writing Mock Test ${m + 1}`,
      ids,
      {
        description: `Thi thử Writing ${level} — đề ${m + 1}`,
        timeLimit: skillMockTimeLimit(level, Skill.WRITING),
        isMockTest: true,
        paperKind: PaperKind.MOCK_SKILL,
      }
    );
  }

  for (let i = 0; i < practice.speaking; i++) {
    const items = takeFromPool(
      data.speaking,
      cursors.speaking,
      PRACTICE_QUESTIONS_PER_PAPER.speaking,
      `${level} speaking practice ${i + 1}`
    );
    cursors.speaking += items.length;
    const ids = await createSpeakings(db, level, items);
    await createPaper(
      db,
      level,
      Skill.SPEAKING,
      `${level} Speaking Practice ${i + 1}`,
      ids,
      {
        description: "Web Speech + AI chấm Speaking",
        timeLimit: 300,
      }
    );
  }

  for (let m = 0; m < MOCK_SKILL_PAPERS_PER_SKILL; m++) {
    const size = mockSizes[Skill.SPEAKING] ?? 0;
    if (size === 0) continue;
    const items = takeFromPool(
      data.speaking,
      cursors.speaking,
      size,
      `${level} speaking mock ${m + 1}`
    );
    cursors.speaking += items.length;
    const ids = await createSpeakings(db, level, items);
    await createPaper(
      db,
      level,
      Skill.SPEAKING,
      `${level} Speaking Mock Test ${m + 1}`,
      ids,
      {
        description: `Thi thử Speaking ${level} — đề ${m + 1}`,
        timeLimit: skillMockTimeLimit(level, Skill.SPEAKING),
        isMockTest: true,
        paperKind: PaperKind.MOCK_SKILL,
      }
    );
  }

  await createFullMocksForLevel(db, level, data, cursors, listenAudioOffset);
}

async function createFullMocksForLevel(
  db: PrismaClient,
  level: ExamLevel,
  data: MockContentPools,
  cursors: PoolCursor,
  listenAudioOffset: number
) {
  const format = getCambridgeMockFormat(level);
  let listenOffset = listenAudioOffset;

  for (let m = 0; m < MOCK_FULL_PAPERS_PER_LEVEL; m++) {
    const allIds: string[] = [];
    const sections: PaperSection[] = [];

    for (const spec of format.sections) {
      const sectionStart = allIds.length;

      for (const slice of spec.slices) {
        const label = `${level} full mock ${m + 1} ${slice.skill}`;
        let ids: string[];

        switch (slice.skill) {
          case Skill.READING: {
            const items = takeFromPool(
              data.reading,
              cursors.reading,
              slice.count,
              label
            );
            cursors.reading += items.length;
            ids = await createMcqs(db, level, slice.skill, items);
            break;
          }
          case Skill.LISTENING: {
            const items = takeFromPool(
              data.listening,
              cursors.listening,
              slice.count,
              label
            );
            cursors.listening += items.length;
            ids = await createListenings(db, level, items, listenOffset);
            listenOffset += ids.length;
            break;
          }
          case Skill.WRITING: {
            const items = takeFromPool(
              data.writing,
              cursors.writing,
              slice.count,
              label
            );
            cursors.writing += items.length;
            ids = await createWritings(db, level, items);
            break;
          }
          case Skill.SPEAKING: {
            const items = takeFromPool(
              data.speaking,
              cursors.speaking,
              slice.count,
              label
            );
            cursors.speaking += items.length;
            ids = await createSpeakings(db, level, items);
            break;
          }
          case Skill.USE_OF_ENGLISH: {
            const items = takeFromPool(data.uoe, cursors.uoe, slice.count, label);
            cursors.uoe += items.length;
            ids = await createGaps(db, level, items);
            break;
          }
          default:
            ids = [];
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

    const title =
      m === 0
        ? format.paperTitle
        : `${level} Full Mock Test ${m + 1} — Cambridge Format`;

    await createPaper(db, level, Skill.READING, title, allIds, {
      description: cambridgeMockDescription(format),
      timeLimit: cambridgeMockTotalSeconds(format),
      isMockTest: true,
      paperKind: PaperKind.MOCK_FULL,
      sections,
    });
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
