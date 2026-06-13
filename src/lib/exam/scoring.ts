import { QuestionType } from "@prisma/client";

export interface McqContent {
  passage?: string;
  question: string;
  options: string[];
  transcript?: string;
  imageUrl?: string;
  imageDescription?: string;
  sceneEmoji?: string;
  questionType?: string;
}

export interface GapFillContent {
  passage: string;
  blanks: number;
}

export interface FreeTextContent {
  taskPrompt: string;
  wordLimit?: number;
  instructions?: string;
}

export interface SpeakingContent {
  prompt: string;
  preparationTime?: number;
  speakingTime?: number;
  imageUrl?: string;
  script?: string;
}

export function gradeObjectiveAnswer(
  type: QuestionType,
  correctAnswer: unknown,
  studentAnswer: unknown
): { isCorrect: boolean; score: number; maxScore: number } {
  const maxScore = 1;

  if (studentAnswer === null || studentAnswer === undefined || studentAnswer === "") {
    return { isCorrect: false, score: 0, maxScore };
  }

  if (type === "MCQ" || type === "GAP_FILL") {
    const normalize = (v: unknown) =>
      String(v).trim().toLowerCase().replace(/\s+/g, " ");

    if (Array.isArray(correctAnswer)) {
      const studentArr = Array.isArray(studentAnswer)
        ? studentAnswer
        : [studentAnswer];
      const correctArr = correctAnswer as unknown[];
      const allCorrect =
        studentArr.length === correctArr.length &&
        studentArr.every((ans, i) => normalize(ans) === normalize(correctArr[i]));
      return { isCorrect: allCorrect, score: allCorrect ? 1 : 0, maxScore };
    }

    const isCorrect = normalize(studentAnswer) === normalize(correctAnswer);
    return { isCorrect, score: isCorrect ? 1 : 0, maxScore };
  }

  return { isCorrect: false, score: 0, maxScore: 0 };
}

export function calculateAttemptScore(
  answers: { score: number | null; question: { points: number } }[]
): { score: number; maxScore: number } {
  let score = 0;
  let maxScore = 0;
  for (const a of answers) {
    maxScore += a.question.points;
    score += a.score ?? 0;
  }
  return { score, maxScore };
}
