import {
  PrismaClient,
  ExamLevel,
  Skill,
  QuestionType,
  PaperKind,
  Prisma,
} from "@prisma/client";
import type { PaperSection } from "../../src/lib/exam/paper-sections";
import { generatePlacementPool, generatePlacementPoolYle } from "./generators/bulk-data";

export type McqSeed = {
  title: string;
  passage?: string;
  question: string;
  options: string[];
  answer: string;
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
};

export type SpeakingSeed = {
  title: string;
  prompt: string;
  preparationTime?: number;
  speakingTime?: number;
};

export async function createMcqs(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill,
  items: McqSeed[]
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
        },
        correctAnswer: item.answer,
        points: 1,
        orderIndex: i,
      },
    });
    ids.push(q.id);
  }
  return ids;
}

export async function createGaps(
  db: PrismaClient,
  level: ExamLevel,
  items: GapSeed[]
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
      },
    });
    ids.push(q.id);
  }
  return ids;
}

export async function createWritings(
  db: PrismaClient,
  level: ExamLevel,
  items: WritingSeed[]
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
  startIndex = 0
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
        },
        correctAnswer: item.answer,
        points: 1,
        orderIndex: startIndex + i,
      },
    });
    ids.push(q.id);
  }
  return ids;
}

export async function createSpeakings(
  db: PrismaClient,
  level: ExamLevel,
  items: SpeakingSeed[]
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
      sections: opts.sections
        ? (opts.sections as unknown as Prisma.InputJsonValue)
        : undefined,
      published: true,
      questions: {
        create: questionIds.map((questionId, orderIndex) => ({
          questionId,
          orderIndex,
        })),
      },
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

  await createFullMockForLevel(db, level, data, isYle);
}

async function createFullMockForLevel(
  db: PrismaClient,
  level: ExamLevel,
  data: {
    reading: McqSeed[];
    listening: ListeningSeed[];
    writing: WritingSeed[];
    uoe: GapSeed[];
  },
  isYle: boolean
) {
  const readingPart = data.reading.slice(-15);
  const listenPart = data.listening.slice(-10);
  const uoePart = isYle ? [] : data.uoe.slice(-10);
  const writingPart = data.writing.slice(-1);

  const readingIds = await createMcqs(db, level, Skill.READING, readingPart);
  const listenIds = await createListenings(db, level, listenPart, 200);
  const uoeIds = uoePart.length ? await createGaps(db, level, uoePart) : [];
  const writingIds = await createWritings(db, level, writingPart);

  const allIds = [...readingIds, ...listenIds, ...uoeIds, ...writingIds];
  const sections: PaperSection[] = [];
  let idx = 0;

  sections.push({
    skill: Skill.READING,
    label: "Reading",
    startIndex: idx,
    endIndex: idx + readingIds.length,
    timeLimit: isYle ? 1200 : 1800,
  });
  idx += readingIds.length;

  sections.push({
    skill: Skill.LISTENING,
    label: "Listening",
    startIndex: idx,
    endIndex: idx + listenIds.length,
    timeLimit: 900,
  });
  idx += listenIds.length;

  if (uoeIds.length) {
    sections.push({
      skill: Skill.USE_OF_ENGLISH,
      label: "Use of English",
      startIndex: idx,
      endIndex: idx + uoeIds.length,
      timeLimit: 900,
    });
    idx += uoeIds.length;
  }

  sections.push({
    skill: Skill.WRITING,
    label: "Writing",
    startIndex: idx,
    endIndex: idx + writingIds.length,
    timeLimit: 1200,
  });

  const totalTime = sections.reduce((s, sec) => s + (sec.timeLimit ?? 600), 0);

  await createPaper(
    db,
    level,
    Skill.READING,
    `${level} Full Mock Test (All Skills)`,
    allIds,
    {
      description: `Thi thử tổng hợp ${level}: Reading + Listening${uoeIds.length ? " + Use of English" : ""} + Writing`,
      timeLimit: totalTime,
      isMockTest: true,
      paperKind: PaperKind.MOCK_FULL,
      sections,
    }
  );
}

export async function seedPlacementTests(db: PrismaClient) {
  const secondary = generatePlacementPool();
  const ylePool = generatePlacementPoolYle();

  const readingIds = await createMcqs(
    db,
    ExamLevel.KET,
    Skill.READING,
    secondary.reading.slice(0, 20)
  );
  const listenIds = await createListenings(
    db,
    ExamLevel.KET,
    secondary.listening.slice(0, 14),
    300
  );
  const uoeIds = await createGaps(
    db,
    ExamLevel.KET,
    secondary.uoe.slice(0, 14)
  );

  const allIds = [...readingIds, ...listenIds, ...uoeIds];
  const sections: PaperSection[] = [
    { skill: Skill.READING, label: "Reading", startIndex: 0, endIndex: 20, timeLimit: 1500 },
    { skill: Skill.LISTENING, label: "Listening", startIndex: 20, endIndex: 34, timeLimit: 900 },
    {
      skill: Skill.USE_OF_ENGLISH,
      label: "Use of English",
      startIndex: 34,
      endIndex: 48,
      timeLimit: 900,
    },
  ];

  await createPaper(
    db,
    ExamLevel.KET,
    Skill.READING,
    "Placement Test — Secondary (KET/PET/FCE)",
    allIds,
    {
      description:
        "Bài test trình độ tổng hợp: đánh giá Reading, Listening, Use of English theo CEFR & Cambridge",
      timeLimit: 3300,
      isMockTest: true,
      paperKind: PaperKind.PLACEMENT,
      sections,
    }
  );

  const yleReadingIds = await createMcqs(db, ExamLevel.MOVERS, Skill.READING, ylePool.reading);
  const yleListenIds = await createListenings(db, ExamLevel.MOVERS, ylePool.listening, 400);
  const yleAll = [...yleReadingIds, ...yleListenIds];
  const yleSections: PaperSection[] = [
    { skill: Skill.READING, label: "Reading", startIndex: 0, endIndex: 25, timeLimit: 1200 },
    { skill: Skill.LISTENING, label: "Listening", startIndex: 25, endIndex: 45, timeLimit: 900 },
  ];

  await createPaper(
    db,
    ExamLevel.MOVERS,
    Skill.READING,
    "Placement Test — YLE (Starters/Movers/Flyers)",
    yleAll,
    {
      description: "Bài test trình độ YLE: đánh giá Reading & Listening theo CEFR Pre A1–A2",
      timeLimit: 2100,
      isMockTest: true,
      paperKind: PaperKind.PLACEMENT,
      sections: yleSections,
    }
  );
}
