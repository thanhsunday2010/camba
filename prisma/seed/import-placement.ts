import fs from "node:fs";
import path from "node:path";
import {
  ExamLevel,
  PaperKind,
  PrismaClient,
  Skill,
} from "@prisma/client";
import type { PaperSection } from "../../src/lib/exam/paper-sections";
import {
  createGaps,
  createListenings,
  createMcqs,
  createPaper,
  type GapSeed,
  type ListeningSeed,
  type McqSeed,
} from "./helpers";
import { inferQuestionMedia } from "../../src/lib/exam/question-media";
import { splitListeningScriptAndQuestion } from "../../src/lib/exam/listening-display";

const VALID_LEVELS = new Set<string>([
  "STARTERS",
  "MOVERS",
  "FLYERS",
  "KET",
  "PET",
  "FCE",
]);

type SectionInput = {
  skill: string;
  label: string;
  questionCount?: number;
  timeLimit?: number;
  startIndex?: number;
  endIndex?: number;
};

type PlacementJson = {
  paper: {
    title: string;
    description?: string;
    level: string;
    track?: string;
    timeLimit?: number;
    sections: SectionInput[];
  };
  reading?: McqSeed[];
  listening?: ListeningSeed[];
  useOfEnglish?: GapSeed[];
  writing?: McqSeed[];
};

type ExternalOption = {
  id?: string;
  text: string;
  is_correct: boolean;
};

type ExternalQuestion = {
  id: string;
  level?: string;
  skill: string;
  question_type?: string;
  audio_script?: string;
  question_text: string;
  image_description?: string;
  image_url?: string;
  options: ExternalOption[];
  points?: number;
};

type ExternalPlacementJson = {
  test_metadata: {
    test_id: string;
    title: string;
    duration_minutes: number;
    total_questions?: number;
    target_audience?: string;
    skills_covered?: string[];
  };
  questions: ExternalQuestion[];
};

type ProductionQuestion = {
  id: number | string;
  section: string;
  type: string;
  question: string;
  options: string[];
  answer: string;
  level?: string;
  audio_script?: string;
  image_description?: string;
  image_url?: string;
  passage?: string;
};

type ProductionPlacementJson = {
  id: string;
  title: string;
  durationMinutes: number;
  totalQuestions?: number;
  questions: ProductionQuestion[];
  placementRules?: unknown[];
};

function isLegacyFormat(data: unknown): data is PlacementJson {
  const d = data as PlacementJson;
  return Boolean(d?.paper?.title && d?.paper?.sections?.length);
}

function isExternalFormat(data: unknown): data is ExternalPlacementJson {
  const d = data as ExternalPlacementJson;
  return Boolean(d?.test_metadata?.title && Array.isArray(d?.questions));
}

function isProductionFormat(data: unknown): data is ProductionPlacementJson {
  const d = data as ProductionPlacementJson;
  return Boolean(
    d?.id &&
      d?.title &&
      Array.isArray(d?.questions) &&
      d.questions.length > 0 &&
      typeof d.questions[0]?.section === "string" &&
      !("test_metadata" in (data as object)) &&
      !("paper" in (data as object))
  );
}

function inferTrack(filePath: string, testId: string, title?: string): string {
  const hay = `${path.basename(filePath, ".json")} ${testId} ${title ?? ""}`.toLowerCase();
  if (
    hay.includes("yle") ||
    hay.includes("starters") ||
    hay.includes("movers") ||
    hay.includes("flyers")
  ) {
    return "YLE";
  }
  if (hay.includes("adult")) return "ADULT";
  if (hay.includes("secondary") || hay.includes("ket") || hay.includes("pet")) {
    return "SECONDARY";
  }
  if (hay.includes("cambridge")) return "YLE";
  return "SECONDARY";
}

function defaultPaperLevel(track: string): ExamLevel {
  if (track === "YLE") return "MOVERS";
  if (track === "ADULT") return "FCE";
  return "KET";
}

function paperTitle(track: string, metaTitle: string): string {
  if (track === "YLE") return `Camba Placement — YLE (${metaTitle})`;
  if (track === "ADULT") return `Camba Placement — Adult (${metaTitle})`;
  return `Camba Placement — Secondary (${metaTitle})`;
}

function externalToMcq(q: ExternalQuestion): McqSeed {
  const correct = q.options.find((o) => o.is_correct);
  if (!correct) {
    throw new Error(`Câu ${q.id}: không có đáp án is_correct: true`);
  }

  const media = inferQuestionMedia({
    question: q.question_text,
    questionType: q.question_type,
    audioScript: q.audio_script,
    imageDescription: q.image_description,
    imageUrl: q.image_url,
  });

  return {
    title: q.question_type ? `${q.id} — ${q.question_type}` : q.id,
    question: media.question,
    options: q.options.map((o) => o.text),
    answer: correct.text,
    imageUrl: media.imageUrl,
    imageDescription: media.imageDescription,
    sceneEmoji: media.sceneEmoji,
    questionType: q.question_type,
  };
}

function externalToListening(q: ExternalQuestion): ListeningSeed {
  if (!q.audio_script?.trim()) {
    throw new Error(`Câu ${q.id}: thiếu audio_script`);
  }
  const mcq = externalToMcq(q);
  return {
    ...mcq,
    transcript: q.audio_script,
  };
}

function resolveOptionAnswer(
  options: string[],
  answer: string,
  qid: string | number
): string {
  const trimmed = answer.trim();
  if (/^[A-D]$/i.test(trimmed)) {
    const idx = trimmed.toUpperCase().charCodeAt(0) - 65;
    if (idx >= 0 && idx < options.length) return options[idx];
  }
  const match = options.find(
    (o) => o.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (match) return match;
  throw new Error(`Câu ${qid}: đáp án "${answer}" không khớp options`);
}

function productionToMcq(q: ProductionQuestion): McqSeed {
  const answer = resolveOptionAnswer(q.options, q.answer, q.id);
  const media = inferQuestionMedia({
    question: q.question,
    questionType: q.type,
    audioScript: q.audio_script,
    imageDescription: q.image_description,
    imageUrl: q.image_url,
  });

  return {
    title: `${q.id} — ${q.section} / ${q.type}`,
    ...(q.passage ? { passage: q.passage } : {}),
    question: media.question,
    options: q.options,
    answer,
    imageUrl: media.imageUrl,
    imageDescription: media.imageDescription,
    sceneEmoji: media.sceneEmoji,
    questionType: q.type,
  };
}

function productionToListening(q: ProductionQuestion): ListeningSeed {
  const { transcript, displayQuestion } = splitListeningScriptAndQuestion(
    q.question,
    q.audio_script
  );
  const mcq = productionToMcq({ ...q, question: displayQuestion });
  return {
    ...mcq,
    question: displayQuestion,
    transcript,
  };
}

function buildSectionsFromCounts(
  totalMinutes: number,
  blocks: { skill: string; label: string; count: number }[]
): SectionInput[] {
  const totalCount = blocks.reduce((sum, b) => sum + b.count, 0);
  return blocks
    .filter((b) => b.count > 0)
    .map((b) => ({
      skill: b.skill,
      label: b.label,
      questionCount: b.count,
      timeLimit:
        totalCount > 0
          ? Math.round((b.count / totalCount) * totalMinutes * 60)
          : undefined,
    }));
}

function convertProductionFormat(
  data: ProductionPlacementJson,
  filePath: string
): PlacementJson {
  const track = inferTrack(filePath, data.id, data.title);
  const paperLevel = defaultPaperLevel(track);

  const readingQs = data.questions.filter(
    (q) => q.section.toLowerCase() === "reading"
  );
  const grammarQs = data.questions.filter((q) => {
    const section = q.section.toLowerCase();
    return (
      section === "grammar" ||
      section === "use of english" ||
      section === "writing"
    );
  });
  const listeningQs = data.questions.filter(
    (q) => q.section.toLowerCase() === "listening"
  );

  const totalMinutes = data.durationMinutes ?? 25;
  const sections = buildSectionsFromCounts(totalMinutes, [
    { skill: "READING", label: "Reading", count: readingQs.length },
    {
      skill: "USE_OF_ENGLISH",
      label: "Grammar & Use of English",
      count: grammarQs.length,
    },
    { skill: "LISTENING", label: "Listening", count: listeningQs.length },
  ]);

  return {
    paper: {
      title: paperTitle(track, data.title),
      description: `${data.id} · ${data.totalQuestions ?? data.questions.length} câu`,
      level: paperLevel,
      track,
      timeLimit: totalMinutes * 60,
      sections,
    },
    reading: readingQs.map(productionToMcq),
    listening: listeningQs.map(productionToListening),
    writing: grammarQs.map(productionToMcq),
  };
}

function convertExternalFormat(
  data: ExternalPlacementJson,
  filePath: string
): PlacementJson {
  const track = inferTrack(filePath, data.test_metadata.test_id, data.test_metadata.title);
  const paperLevel = defaultPaperLevel(track);

  const readingQs = data.questions.filter((q) => q.skill === "Reading");
  const listeningQs = data.questions.filter((q) => q.skill === "Listening");
  const writingQs = data.questions.filter(
    (q) => q.skill === "Writing" || q.skill === "Use of English"
  );

  const totalMinutes = data.test_metadata.duration_minutes ?? 25;
  const totalSeconds = totalMinutes * 60;
  const totalCount = readingQs.length + listeningQs.length + writingQs.length;

  function sectionTime(count: number) {
    if (totalCount === 0) return undefined;
    return Math.round((count / totalCount) * totalSeconds);
  }

  const sections: SectionInput[] = [];
  if (readingQs.length) {
    sections.push({
      skill: "READING",
      label: "Reading",
      questionCount: readingQs.length,
      timeLimit: sectionTime(readingQs.length),
    });
  }
  if (listeningQs.length) {
    sections.push({
      skill: "LISTENING",
      label: "Listening",
      questionCount: listeningQs.length,
      timeLimit: sectionTime(listeningQs.length),
    });
  }
  if (writingQs.length) {
    sections.push({
      skill: "USE_OF_ENGLISH",
      label: "Writing & Grammar",
      questionCount: writingQs.length,
      timeLimit: sectionTime(writingQs.length),
    });
  }

  return {
    paper: {
      title: paperTitle(track, data.test_metadata.title),
      description: data.test_metadata.target_audience,
      level: paperLevel,
      track,
      timeLimit: totalSeconds,
      sections,
    },
    reading: readingQs.map(externalToMcq),
    listening: listeningQs.map(externalToListening),
    writing: writingQs.map(externalToMcq),
  };
}

function normalizePlacementJson(raw: unknown, filePath: string): PlacementJson {
  if (isLegacyFormat(raw)) return raw;
  if (isProductionFormat(raw)) return convertProductionFormat(raw, filePath);
  if (isExternalFormat(raw)) return convertExternalFormat(raw, filePath);
  throw new Error(
    `${filePath}: format không hợp lệ — hỗ trợ: { paper }, { test_metadata, questions }, hoặc { id, title, durationMinutes, questions }`
  );
}

function resolveLevel(raw: string | undefined, fallback: ExamLevel): ExamLevel {
  const u = (raw ?? fallback).toUpperCase();
  if (VALID_LEVELS.has(u)) return u as ExamLevel;
  const map: Record<string, ExamLevel> = {
    A2: "KET",
    B1: "PET",
    B2: "FCE",
    PRE_A1: "STARTERS",
    "PRE A1": "STARTERS",
  };
  return map[u] ?? fallback;
}

function buildSections(sections: SectionInput[]): PaperSection[] {
  let idx = 0;
  return sections.map((s) => {
    const count =
      s.questionCount ??
      (s.endIndex !== undefined && s.startIndex !== undefined
        ? s.endIndex - s.startIndex
        : 0);
    const startIndex = s.startIndex ?? idx;
    const endIndex = s.endIndex ?? startIndex + count;
    idx = endIndex;
    return {
      skill: s.skill as Skill,
      label: s.label,
      startIndex,
      endIndex,
      timeLimit: s.timeLimit,
    };
  });
}

function validateMcq(items: McqSeed[], label: string) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.options?.includes(item.answer)) {
      throw new Error(
        `${label}[${i}] "${item.title}": answer không nằm trong options`
      );
    }
  }
}

function validateListening(items: ListeningSeed[]) {
  for (let i = 0; i < items.length; i++) {
    if (!items[i].transcript?.trim()) {
      throw new Error(`listening[${i}]: thiếu transcript`);
    }
    validateMcq([items[i] as McqSeed], "listening");
  }
}

export async function importPlacementFile(db: PrismaClient, filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = normalizePlacementJson(JSON.parse(raw), filePath);

  if (!data.paper?.title || !data.paper.sections?.length) {
    throw new Error(`${filePath}: thiếu paper.title hoặc paper.sections`);
  }

  const paperLevel = resolveLevel(data.paper.level, "KET");
  const reading = data.reading ?? [];
  const listening = data.listening ?? [];
  const uoe = data.useOfEnglish ?? [];
  const writing = data.writing ?? [];

  validateMcq(reading, "reading");
  validateMcq(writing, "writing");
  if (listening.length) validateListening(listening);
  for (const g of uoe) {
    if (!g.passage?.includes("___")) {
      throw new Error(`useOfEnglish "${g.title}": passage phải có ___`);
    }
  }

  const expected = reading.length + listening.length + uoe.length + writing.length;
  const sections = buildSections(data.paper.sections);
  const sectionTotal = sections[sections.length - 1]?.endIndex ?? 0;
  if (sectionTotal !== expected) {
    throw new Error(
      `${filePath}: tổng câu ${expected} ≠ sections endIndex ${sectionTotal}`
    );
  }

  const existing = await db.examPaper.findFirst({
    where: { paperKind: PaperKind.PLACEMENT, title: data.paper.title },
    include: { questions: true, attempts: { select: { id: true } } },
  });

  if (existing) {
    if (existing.attempts.length > 0) {
      await db.examPaper.update({
        where: { id: existing.id },
        data: { published: false, title: `${existing.title} (archived ${Date.now()})` },
      });
    } else {
      await db.examPaper.delete({ where: { id: existing.id } });
    }
  }

  const trackSlug = (data.paper.track ?? paperLevel).toLowerCase().replace(/\s+/g, "-");

  const readingIds = await createMcqs(db, paperLevel, Skill.READING, reading);
  const listenItems = listening.map((item, i) => ({
    ...item,
    audioSlug: item.audioSlug ?? `placement-${trackSlug}-${String(i + 1).padStart(3, "0")}`,
  }));
  const listenIds = await createListenings(db, paperLevel, listenItems, 500);
  const uoeIds = uoe.length ? await createGaps(db, paperLevel, uoe) : [];
  const writingIds = writing.length
    ? await createMcqs(db, paperLevel, Skill.USE_OF_ENGLISH, writing)
    : [];

  const allIds = [...readingIds, ...listenIds, ...uoeIds, ...writingIds];

  await createPaper(db, paperLevel, Skill.READING, data.paper.title, allIds, {
    description: data.paper.description,
    timeLimit: data.paper.timeLimit,
    isMockTest: true,
    paperKind: PaperKind.PLACEMENT,
    sections,
  });

  console.log(
    `  ✓ ${path.basename(filePath)} → "${data.paper.title}" (${allIds.length} câu)`
  );
}

export async function importPlacementFromDir(db: PrismaClient, dir: string, files?: string[]) {
  const targets =
    files ??
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(dir, f));

  if (targets.length === 0) {
    console.log("Không có file JSON nào để import.");
    return;
  }

  for (const file of targets) {
    await importPlacementFile(db, file);
  }
}
