import { QuestionType } from "@prisma/client";

export type QuestionPickMeta = {
  id: string;
  type: QuestionType;
  title: string | null;
  content: unknown;
};

export type SeedDifficulty = "easy" | "medium" | "hard";

export function seedToQuestionContent(
  type: QuestionType,
  seed: Record<string, unknown>
): Record<string, unknown> {
  const content: Record<string, unknown> = { ...seed };
  delete content.title;
  delete content.answer;
  delete content.audioSlug;
  if (type === QuestionType.MCQ) {
    return {
      passage: content.passage ?? content.transcript,
      question: content.question,
      options: content.options,
      questionType: content.questionType,
      difficulty: content.difficulty,
    };
  }
  if (type === QuestionType.GAP_FILL) {
    return { passage: content.passage, difficulty: content.difficulty };
  }
  if (type === QuestionType.FREE_TEXT) {
    return {
      taskPrompt: content.taskPrompt,
      wordLimit: content.wordLimit,
      instructions: content.instructions,
      difficulty: content.difficulty,
    };
  }
  if (type === QuestionType.SPEAKING_PROMPT) {
    return {
      prompt: content.prompt,
      preparationTime: content.preparationTime,
      speakingTime: content.speakingTime,
      difficulty: content.difficulty,
    };
  }
  return content;
}

export function getSeedDiversityKey(
  type: QuestionType,
  seed: { title: string } & Record<string, unknown>
): string {
  return getQuestionDiversityKey({
    id: seed.title,
    type,
    title: seed.title,
    content: seedToQuestionContent(type, seed),
  });
}

function asRecord(content: unknown): Record<string, unknown> {
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return content as Record<string, unknown>;
  }
  return {};
}

function textField(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

const NAME_PATTERN =
  /\b(tom|anna|ben|lily|sara|jack|emma|leo|mia|noah|olivia|lucas|sophie|daniel|chloe|minh|lan|huy|linh|an)\b/gi;
const PLACE_PATTERN =
  /\b(school|park|library|museum|beach|zoo|market|hospital|cinema|restaurant|station|airport|garden|supermarket|cafe|café)\b/gi;

/** Chuẩn hóa văn bản để so khớp mẫu (bỏ tên, số, địa điểm cụ thể). */
export function normalizeTemplateText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[\d]+(:\d+)?/g, "#")
    .replace(NAME_PATTERN, "@")
    .replace(PLACE_PATTERN, "%")
    .replace(/\([^)]*\)/g, "()")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(text: string): string {
  if (!text.trim()) return "";
  return normalizeTemplateText(text);
}

/** Nhóm câu cùng bộ đọc (KET R1a/b/c). */
function getTitleGroupKey(title: string | null): string | null {
  if (!title) return null;

  const passageSet = title.match(/^(KET|PET|FCE|STARTERS|MOVERS|FLYERS)\s+R\d+[a-z]?$/i);
  if (passageSet) {
    return passageSet[0]!.replace(/[a-z]$/i, "").trim().toUpperCase();
  }

  const grammarSet = title.match(/^Grammar\s+\d+$/i);
  if (grammarSet) {
    return null;
  }

  return null;
}

function getPrimaryContentText(q: QuestionPickMeta): string {
  const content = asRecord(q.content);

  switch (q.type) {
    case QuestionType.MCQ: {
      const passage = textField(content, "passage", "transcript");
      if (passage) return passage;
      return textField(content, "question");
    }
    case QuestionType.GAP_FILL:
      return textField(content, "passage");
    case QuestionType.FREE_TEXT:
      return textField(content, "taskPrompt");
    case QuestionType.SPEAKING_PROMPT:
      return textField(content, "prompt");
    default:
      return textField(content, "passage", "transcript", "taskPrompt", "prompt", "question");
  }
}

function getStructureText(q: QuestionPickMeta): string {
  const content = asRecord(q.content);
  const questionType = typeof content.questionType === "string" ? content.questionType : "";

  if (q.type === QuestionType.MCQ) {
    const question = textField(content, "question");
    return `${questionType}|${fingerprint(question)}`;
  }

  if (q.type === QuestionType.GAP_FILL) {
    const passage = textField(content, "passage").replace(/_{2,}|\.{3,}|\[\s*\]/g, "___");
    return `${questionType}|${fingerprint(passage)}`;
  }

  if (q.type === QuestionType.FREE_TEXT || q.type === QuestionType.SPEAKING_PROMPT) {
    return `${q.type}|${questionType}`;
  }

  return `${q.type}|${questionType}`;
}

/**
 * Khóa đa dạng: tối đa một câu mỗi khóa trong một lần làm bài.
 * - Cùng đoạn văn / transcript / prompt (nội dung)
 * - Cùng tiêu đề bộ đọc (KET R1a/b/c)
 * - Cùng mẫu câu hỏi khi không có nội dung riêng (MCQ không passage)
 */
export function getQuestionDiversityKey(q: QuestionPickMeta): string {
  const titleKey = getTitleGroupKey(q.title);
  if (titleKey) return `title:${titleKey}`;

  const contentText = getPrimaryContentText(q);
  const contentFp = fingerprint(contentText);
  if (contentFp) {
    const content = asRecord(q.content);
    const hasPassageLikeBody = !!textField(content, "passage", "transcript", "taskPrompt", "prompt");
    if (q.type === QuestionType.MCQ && hasPassageLikeBody) {
      const question = textField(content, "question");
      return `content:${contentFp}|q:${fingerprint(question)}`;
    }
    if (hasPassageLikeBody || q.type === QuestionType.GAP_FILL) {
      return `content:${contentFp}`;
    }

    const structureFp = getStructureText(q);
    return `mcq:${contentFp}|${structureFp}`;
  }

  return `structure:${getStructureText(q)}`;
}

export function questionsAreSimilar(a: QuestionPickMeta, b: QuestionPickMeta): boolean {
  return getQuestionDiversityKey(a) === getQuestionDiversityKey(b);
}

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Chọn câu ngẫu nhiên, ưu tiên không trùng nhóm nội dung/cấu trúc. */
export function pickDiverseQuestionIds(
  pool: QuestionPickMeta[],
  exclude: Set<string>,
  count: number
): string[] {
  if (pool.length === 0) return [];

  const target = Math.min(count, pool.length);
  let available = pool.filter((q) => !exclude.has(q.id));
  if (available.length < target) {
    available = [...pool];
  }

  const shuffled = shuffle(available);
  const picked: QuestionPickMeta[] = [];
  const usedKeys = new Set<string>();

  for (const candidate of shuffled) {
    if (picked.length >= target) break;
    const key = getQuestionDiversityKey(candidate);
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    picked.push(candidate);
  }

  if (picked.length < target) {
    for (const candidate of shuffled) {
      if (picked.length >= target) break;
      if (picked.some((p) => p.id === candidate.id)) continue;
      picked.push(candidate);
    }
  }

  return picked.map((q) => q.id);
}

function extractPassageText(q: QuestionPickMeta): string {
  const content = asRecord(q.content);
  return textField(content, "passage");
}

/** Nhóm câu Reading cùng đoạn văn (Cambridge-style passage set). */
export function getReadingPassageGroupKey(q: QuestionPickMeta): string {
  const passage = extractPassageText(q);
  if (passage) return `passage:${fingerprint(passage)}`;
  if (q.title?.trim()) return `title:${q.title.trim().toLowerCase()}`;
  return `solo:${q.id}`;
}

function groupReadingByPassage(pool: QuestionPickMeta[]): Map<string, QuestionPickMeta[]> {
  const groups = new Map<string, QuestionPickMeta[]>();
  for (const q of pool) {
    if (q.type !== QuestionType.MCQ && q.type !== QuestionType.GAP_FILL) continue;
    const key = getReadingPassageGroupKey(q);
    const list = groups.get(key) ?? [];
    list.push(q);
    groups.set(key, list);
  }
  return groups;
}

/**
 * Chọn một đoạn văn và tất cả câu hỏi thuộc đoạn đó (format thi thật).
 * Ưu tiên bộ có nhiều câu; fallback pickDiverseQuestionIds nếu không có passage.
 */
export function pickReadingPassageQuestionIds(
  pool: QuestionPickMeta[],
  exclude: Set<string>,
  maxQuestions: number
): string[] {
  const groups = groupReadingByPassage(pool);
  if (groups.size === 0) {
    return pickDiverseQuestionIds(pool, exclude, maxQuestions);
  }

  type GroupEntry = [string, QuestionPickMeta[]];
  const available: GroupEntry[] = [...groups.entries()].filter(([, qs]) =>
    qs.some((q) => !exclude.has(q.id))
  );

  if (available.length === 0) {
    return pickDiverseQuestionIds(pool, exclude, maxQuestions);
  }

  available.sort((a, b) => b[1].length - a[1].length);
  const multi = available.filter(([, qs]) => qs.length >= 2);
  const candidates = multi.length > 0 ? multi : available;
  const [, group] = shuffle(candidates)[0]!;

  const unused = group.filter((q) => !exclude.has(q.id));
  const source = unused.length > 0 ? unused : group;
  return source.slice(0, maxQuestions).map((q) => q.id);
}
