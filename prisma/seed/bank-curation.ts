import {
  ExamLevel,
  PaperKind,
  PrismaClient,
  QuestionType,
  Skill,
} from "@prisma/client";
import {
  generateListening,
  generateReading,
  generateSpeaking,
  generateUoe,
  generateWriting,
} from "./generators/bulk-data";
import {
  createGaps,
  createListenings,
  createMcqs,
  createSpeakings,
  createWritings,
  type GapSeed,
  type ListeningSeed,
  type McqSeed,
  type SpeakingSeed,
  type WritingSeed,
} from "./helpers";
import { computeRequiredPoolSizes } from "./seed-targets";
import {
  getQuestionDiversityKey,
  getSeedDiversityKey,
  type QuestionPickMeta,
} from "../../src/lib/exam/question-diversity";

export function skillToQuestionType(skill: Skill): QuestionType {
  switch (skill) {
    case Skill.READING:
    case Skill.LISTENING:
      return QuestionType.MCQ;
    case Skill.USE_OF_ENGLISH:
      return QuestionType.GAP_FILL;
    case Skill.WRITING:
      return QuestionType.FREE_TEXT;
    case Skill.SPEAKING:
      return QuestionType.SPEAKING_PROMPT;
    default:
      return QuestionType.MCQ;
  }
}

function asRecord(content: unknown): Record<string, unknown> {
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return content as Record<string, unknown>;
  }
  return {};
}

function questionDifficulty(content: unknown): string {
  const d = asRecord(content).difficulty;
  return typeof d === "string" ? d : "unknown";
}

function toPickMeta(q: {
  id: string;
  type: QuestionType;
  title: string | null;
  content: unknown;
}): QuestionPickMeta {
  return { id: q.id, type: q.type, title: q.title, content: q.content };
}

export function keepCountForGroupSize(n: number): number {
  return Math.max(1, Math.floor(n / 3));
}

export function pickQuestionsToKeep<T extends { id: string; content: unknown }>(
  group: T[],
  keepCount: number,
  referenced: Set<string>
): T[] {
  const sorted = [...group].sort((a, b) => {
    const aRef = referenced.has(a.id) ? 0 : 1;
    const bRef = referenced.has(b.id) ? 0 : 1;
    if (aRef !== bRef) return aRef - bRef;
    return a.id.localeCompare(b.id);
  });

  const kept: T[] = [];
  const keptDifficulties = new Set<string>();

  for (const q of sorted) {
    if (kept.length >= keepCount) break;
    const d = questionDifficulty(q.content);
    if (referenced.has(q.id) || !keptDifficulties.has(d)) {
      kept.push(q);
      keptDifficulties.add(d);
    }
  }

  for (const q of sorted) {
    if (kept.length >= keepCount) break;
    if (kept.some((k) => k.id === q.id)) continue;
    kept.push(q);
  }

  return kept;
}

type PruneStats = {
  before: number;
  after: number;
  deleted: number;
  skippedReferenced: number;
  groups: number;
};

export async function pruneSimilarPoolQuestions(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill,
  dryRun: boolean
): Promise<PruneStats> {
  const questions = await db.question.findMany({
    where: { level, skill, placementSlug: null },
    select: { id: true, type: true, title: true, content: true },
  });

  const groups = new Map<string, typeof questions>();
  for (const q of questions) {
    const key = getQuestionDiversityKey(toPickMeta(q));
    const list = groups.get(key) ?? [];
    list.push(q);
    groups.set(key, list);
  }

  const allIds = questions.map((q) => q.id);
  const referenced = await getReferencedQuestionIds(db, allIds);

  const keepIds = new Set<string>();
  for (const group of groups.values()) {
    const keepN = keepCountForGroupSize(group.length);
    const kept = pickQuestionsToKeep(group, keepN, referenced);
    for (const q of kept) keepIds.add(q.id);
  }

  const deleteCandidates = questions.filter((q) => !keepIds.has(q.id));
  const safeDelete = deleteCandidates.filter((q) => !referenced.has(q.id));
  const skippedReferenced = deleteCandidates.length - safeDelete.length;

  if (!dryRun && safeDelete.length > 0) {
    const ids = safeDelete.map((q) => q.id);
    await db.paperQuestion.deleteMany({ where: { questionId: { in: ids } } });
    await db.question.deleteMany({ where: { id: { in: ids } } });
  }

  return {
    before: questions.length,
    after: questions.length - (dryRun ? 0 : safeDelete.length),
    deleted: dryRun ? safeDelete.length : safeDelete.length,
    skippedReferenced,
    groups: groups.size,
  };
}

function isLegacyUnpublishedPaper(paper: {
  paperKind: PaperKind;
  practicePoolKey: string | null;
  mockPoolKey: string | null;
  published: boolean;
}): boolean {
  if (paper.published) return false;
  if (paper.practicePoolKey || paper.mockPoolKey) return false;
  return (
    paper.paperKind === PaperKind.PRACTICE ||
    paper.paperKind === PaperKind.MOCK_SKILL ||
    paper.paperKind === PaperKind.MOCK_FULL
  );
}

async function getReferencedQuestionIds(
  db: PrismaClient,
  questionIds: string[]
): Promise<Set<string>> {
  if (questionIds.length === 0) return new Set();

  const [attemptLinks, paperLinks] = await Promise.all([
    db.attemptQuestion.findMany({
      where: { questionId: { in: questionIds } },
      select: { questionId: true },
    }),
    db.paperQuestion.findMany({
      where: { questionId: { in: questionIds } },
      select: {
        questionId: true,
        paper: {
          select: {
            paperKind: true,
            practicePoolKey: true,
            mockPoolKey: true,
            published: true,
          },
        },
      },
    }),
  ]);

  const referenced = new Set<string>();
  for (const link of attemptLinks) referenced.add(link.questionId);
  for (const link of paperLinks) {
    if (isLegacyUnpublishedPaper(link.paper)) continue;
    referenced.add(link.questionId);
  }
  return referenced;
}

type ReplenishStats = { before: number; after: number; created: number };

export async function replenishPoolToTarget(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill,
  dryRun: boolean
): Promise<ReplenishStats> {
  const required = computeRequiredPoolSizes(level);
  const targetKey = skillKey(skill);
  const target = required[targetKey];

  const existing = await db.question.findMany({
    where: { level, skill, placementSlug: null },
    select: { id: true, type: true, title: true, content: true },
  });

  const keys = new Set(existing.map((q) => getQuestionDiversityKey(toPickMeta(q))));
  const before = existing.length;
  if (before >= target) {
    return { before, after: before, created: 0 };
  }

  const need = target - before;
  const qType = skillToQuestionType(skill);
  const batch: Array<
    McqSeed | ListeningSeed | GapSeed | WritingSeed | SpeakingSeed
  > = [];

  let offset = before;
  const maxAttempts = Math.max(need * 80, 8000);
  for (let attempt = 0; batch.length < need && attempt < maxAttempts; attempt++) {
    const probe = before + attempt + Math.floor(attempt / 40) * 997;
    const item = generateOneSeed(level, skill, probe);
    if (!item) continue;
    const key = getSeedDiversityKey(qType, item as { title: string } & Record<string, unknown>);
    if (keys.has(key)) continue;
    keys.add(key);
    batch.push(item);
  }

  if (batch.length < need) {
    console.warn(
      `[replenish] ${level} ${skill}: chỉ tạo được ${batch.length}/${need} câu mới (hết mẫu).`
    );
  }

  if (!dryRun && batch.length > 0) {
    await insertSeeds(db, level, skill, batch, before);
  }

  return {
    before,
    after: before + (dryRun ? 0 : batch.length),
    created: batch.length,
  };
}

function skillKey(skill: Skill): "reading" | "listening" | "writing" | "speaking" | "uoe" {
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
      return "reading";
  }
}

function generateOneSeed(
  level: ExamLevel,
  skill: Skill,
  offset: number
):
  | McqSeed
  | ListeningSeed
  | GapSeed
  | WritingSeed
  | SpeakingSeed
  | null {
  switch (skill) {
    case Skill.READING:
      return generateReading(level, 1, offset)[0] ?? null;
    case Skill.LISTENING:
      return generateListening(level, 1, offset)[0] ?? null;
    case Skill.WRITING:
      return generateWriting(level, 1, offset)[0] ?? null;
    case Skill.SPEAKING:
      return generateSpeaking(level, 1, offset)[0] ?? null;
    case Skill.USE_OF_ENGLISH:
      return generateUoe(level, 1, offset)[0] ?? null;
    default:
      return null;
  }
}

async function insertSeeds(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill,
  batch: Array<McqSeed | ListeningSeed | GapSeed | WritingSeed | SpeakingSeed>,
  startIndex: number
) {
  switch (skill) {
    case Skill.READING:
      await createMcqs(db, level, Skill.READING, batch as McqSeed[]);
      break;
    case Skill.LISTENING:
      await createListenings(db, level, batch as ListeningSeed[], startIndex);
      break;
    case Skill.WRITING:
      await createWritings(db, level, batch as WritingSeed[]);
      break;
    case Skill.SPEAKING:
      await createSpeakings(db, level, batch as SpeakingSeed[]);
      break;
    case Skill.USE_OF_ENGLISH:
      await createGaps(db, level, batch as GapSeed[]);
      break;
  }
}

export async function countDifficultyMix(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill
): Promise<Record<string, number>> {
  const questions = await db.question.findMany({
    where: { level, skill, placementSlug: null },
    select: { content: true },
  });
  const mix: Record<string, number> = { easy: 0, medium: 0, hard: 0, unknown: 0 };
  for (const q of questions) {
    const d = questionDifficulty(q.content);
    if (d in mix) mix[d]!++;
    else mix.unknown!++;
  }
  return mix;
}
