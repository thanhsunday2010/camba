import { QuestionType } from "@prisma/client";
import { formatCorrectAnswerDisplay } from "@/lib/exam/question-explanation";
import { formatExamLevel, formatSkill } from "@/lib/constants";

export type QuestionExportRow = {
  id: string;
  level: string;
  skill: string;
  type: string;
  title: string;
  content: string;
  correctAnswer: string;
  points: number;
  audioUrl: string;
};

export function formatQuestionContentForExport(
  type: QuestionType,
  content: unknown,
  title?: string | null
): string {
  const parts: string[] = [];
  if (title?.trim()) parts.push(title.trim());

  if (!content || typeof content !== "object") {
    return parts.join("\n\n");
  }

  const c = content as Record<string, unknown>;

  switch (type) {
    case QuestionType.MCQ: {
      if (typeof c.passage === "string" && c.passage.trim()) parts.push(c.passage.trim());
      if (typeof c.transcript === "string" && c.transcript.trim()) {
        parts.push(`[Transcript]\n${c.transcript.trim()}`);
      }
      if (typeof c.question === "string" && c.question.trim()) {
        parts.push(c.question.trim());
      }
      if (Array.isArray(c.options)) {
        const options = c.options
          .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
          .map((o, i) => `${String.fromCharCode(65 + i)}. ${o.trim()}`);
        if (options.length) parts.push(options.join("\n"));
      }
      break;
    }
    case QuestionType.GAP_FILL: {
      if (typeof c.passage === "string" && c.passage.trim()) parts.push(c.passage.trim());
      break;
    }
    case QuestionType.FREE_TEXT: {
      if (typeof c.taskPrompt === "string" && c.taskPrompt.trim()) parts.push(c.taskPrompt.trim());
      if (typeof c.instructions === "string" && c.instructions.trim()) {
        parts.push(`[Hướng dẫn]\n${c.instructions.trim()}`);
      }
      if (c.wordLimit != null) parts.push(`[Giới hạn từ] ${String(c.wordLimit)}`);
      break;
    }
    case QuestionType.SPEAKING_PROMPT: {
      if (typeof c.prompt === "string" && c.prompt.trim()) parts.push(c.prompt.trim());
      if (typeof c.script === "string" && c.script.trim()) {
        parts.push(`[Script]\n${c.script.trim()}`);
      }
      const times: string[] = [];
      if (c.preparationTime != null) times.push(`Chuẩn bị ${c.preparationTime}s`);
      if (c.speakingTime != null) times.push(`Nói ${c.speakingTime}s`);
      if (times.length) parts.push(`[Thời gian] ${times.join(" · ")}`);
      break;
    }
    default:
      parts.push(JSON.stringify(content, null, 2));
  }

  return parts.filter(Boolean).join("\n\n");
}

export function questionToExportRow(q: {
  id: string;
  type: QuestionType;
  level: string;
  skill: string;
  title: string | null;
  content: unknown;
  correctAnswer: unknown;
  points: number;
  audioUrl: string | null;
}): QuestionExportRow {
  return {
    id: q.id,
    level: formatExamLevel(q.level),
    skill: formatSkill(q.skill),
    type: q.type,
    title: q.title?.trim() ?? "",
    content: formatQuestionContentForExport(q.type, q.content, q.title),
    correctAnswer: q.correctAnswer
      ? formatCorrectAnswerDisplay(q.type, q.correctAnswer)
      : "",
    points: q.points,
    audioUrl: q.audioUrl ?? "",
  };
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

const CSV_HEADERS = [
  "ID",
  "Level",
  "Kỹ năng",
  "Loại",
  "Tiêu đề",
  "Nội dung câu hỏi",
  "Đáp án đúng",
  "Điểm",
  "Audio URL",
] as const;

export function questionsToCsv(rows: QuestionExportRow[]): string {
  const lines = [
    CSV_HEADERS.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.level,
        row.skill,
        row.type,
        row.title,
        row.content,
        row.correctAnswer,
        row.points,
        row.audioUrl,
      ]
        .map(csvCell)
        .join(",")
    ),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

export function buildExportFilename(
  parts: string[],
  ext: "json" | "csv"
): string {
  const date = new Date().toISOString().slice(0, 10);
  return `camba-questions-${parts.filter(Boolean).join("-")}-${date}.${ext}`;
}
