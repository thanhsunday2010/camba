import { resolveMcqMedia } from "./question-media";

const CONTEXT_IMAGE_RE = /\(Context image:\s*[^)]+\)/i;

const VISUAL_QUESTION_TYPES = new Set([
  "look_and_read_yes_no",
  "look_and_read",
  "listen_and_choose_color",
  "listen_and_count",
  "listen_and_choose_activity",
  "listen_and_match_job",
  "listen_and_match",
  "listen_and_write_name",
  "listen_time_info",
  "vocabulary_spelling",
]);

const PICTURE_TEXT_PATTERNS = [
  /look at the picture/i,
  /look at this picture/i,
  /look at the pictures/i,
  /look at the photo/i,
  /in the picture/i,
  /can you see/i,
  CONTEXT_IMAGE_RE,
];

export type QuestionImageStatus = "not_needed" | "missing" | "complete";

export type McqContentFields = {
  question: string;
  questionType?: string;
  transcript?: string;
  imageDescription?: string;
  imageUrl?: string;
  sceneEmoji?: string;
  taskPrompt?: string;
  passage?: string;
};

export function getMcqContentFields(content: unknown): McqContentFields | null {
  if (!content || typeof content !== "object") return null;
  const c = content as Record<string, unknown>;
  return {
    question: typeof c.question === "string" ? c.question : "",
    questionType: typeof c.questionType === "string" ? c.questionType : undefined,
    transcript: typeof c.transcript === "string" ? c.transcript : undefined,
    imageDescription: typeof c.imageDescription === "string" ? c.imageDescription : undefined,
    imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : undefined,
    sceneEmoji: typeof c.sceneEmoji === "string" ? c.sceneEmoji : undefined,
    taskPrompt: typeof c.taskPrompt === "string" ? c.taskPrompt : undefined,
    passage: typeof c.passage === "string" ? c.passage : undefined,
  };
}

/** Câu hỏi cần minh họa (ảnh hoặc placeholder mô tả) */
export function questionUsesImage(type: string, content: unknown): boolean {
  if (type === "FREE_TEXT") {
    const fields = getMcqContentFields(content);
    return !!(fields?.taskPrompt && PICTURE_TEXT_PATTERNS.some((p) => p.test(fields.taskPrompt!)));
  }

  if (type !== "MCQ") return false;

  const fields = getMcqContentFields(content);
  if (!fields) return false;

  if (fields.imageDescription?.trim() || fields.imageUrl?.trim()) return true;
  if (fields.questionType && VISUAL_QUESTION_TYPES.has(fields.questionType)) return true;
  if (PICTURE_TEXT_PATTERNS.some((p) => p.test(fields.question))) return true;
  if (fields.transcript && /look at|can you see|color its/i.test(fields.transcript)) return true;

  return resolveMcqMedia(fields) !== null;
}

export function hasQuestionImage(content: unknown): boolean {
  const fields = getMcqContentFields(content);
  return Boolean(fields?.imageUrl?.trim());
}

export function getQuestionImageStatus(type: string, content: unknown): QuestionImageStatus {
  if (!questionUsesImage(type, content)) return "not_needed";
  if (hasQuestionImage(content)) return "complete";
  return "missing";
}

/** Mô tả ngắn để admin biết cần vẽ gì */
export function getQuestionImageHint(type: string, content: unknown): string | null {
  if (!questionUsesImage(type, content)) return null;

  const fields = getMcqContentFields(content);
  if (!fields) return null;

  if (fields.imageDescription?.trim()) return fields.imageDescription.trim();

  const media = resolveMcqMedia(fields);
  if (media?.imageDescription) return media.imageDescription;

  if (fields.taskPrompt?.trim()) return fields.taskPrompt.trim().slice(0, 200);

  return fields.question?.trim() || fields.transcript?.trim() || null;
}

export function summarizeImageAudit(
  items: Array<{ type: string; content: unknown }>
): { total: number; needsImage: number; missing: number; complete: number } {
  let needsImage = 0;
  let missing = 0;
  let complete = 0;

  for (const item of items) {
    const status = getQuestionImageStatus(item.type, item.content);
    if (status === "not_needed") continue;
    needsImage++;
    if (status === "missing") missing++;
    else complete++;
  }

  return { total: items.length, needsImage, missing, complete };
}
