import { ExamLevel } from "@prisma/client";

const COMPACT_JSON_RULES = `
Rules:
- Vietnamese only in summary_vi, explanation_vi, tips_vi
- Be concise — minimize tokens
- Realistic scores; do not inflate
- Maximum 3 errors
- Maximum 2 tips in tips_vi
- summary_vi: at most 2 short sentences
- Do NOT include improvedVersion or long rewrites`;

export function buildWritingPrompt(
  examLevel: ExamLevel,
  taskPrompt: string,
  studentAnswer: string,
  wordLimit?: number
): { system: string; user: string } {
  const levelGuide: Record<ExamLevel, string> = {
    STARTERS: "YLE Starters (Pre A1). Band: 1-5 shields.",
    MOVERS: "YLE Movers (A1). Band: 1-5 shields.",
    FLYERS: "YLE Flyers (A2). Band: 1-5 shields.",
    KET: "A2 Key. Band: A1, A2, B1.",
    PET: "B1 Preliminary. Band: A2, B1, B2.",
    FCE: "B2 First. Band: B1, B2, C1.",
  };

  const system = `Cambridge ${examLevel} Writing examiner. ${levelGuide[examLevel]}

Return ONLY valid JSON:
{
  "overallScore": number (0-100),
  "cambridgeBand": string,
  "criteria": {
    "content": number (0-5),
    "communicativeAchievement": number (0-5),
    "organisation": number (0-5),
    "language": number (0-5)
  },
  "errors": [
    { "original": string, "correction": string, "type": string, "explanation_vi": string }
  ],
  "tips_vi": [string],
  "summary_vi": string
}
${COMPACT_JSON_RULES}`;

  const user = `TASK: ${taskPrompt}
${wordLimit ? `LIMIT: ${wordLimit} words` : ""}

ANSWER:
${studentAnswer}

JSON only.`;

  return { system, user };
}

export function buildSpeakingPrompt(
  examLevel: ExamLevel,
  prompt: string,
  transcript: string,
  options?: { track?: "cambridge" | "ielts"; ieltsPart?: 1 | 2 | 3 }
): { system: string; user: string } {
  if (options?.track === "ielts") {
    const partLabel = options.ieltsPart ? `Part ${options.ieltsPart}` : "Speaking";
    const system = `IELTS Speaking examiner. Grade ${partLabel} from transcript only.

Return ONLY valid JSON:
{
  "overallScore": number (0-100),
  "cambridgeBand": string (IELTS band 0-9, half bands OK e.g. "6.5"),
  "criteria": {
    "fluency": number (0-5),
    "pronunciation": number (0-5),
    "grammar": number (0-5),
    "vocabulary": number (0-5),
    "taskAchievement": number (0-5)
  },
  "errors": [
    { "original": string, "correction": string, "type": string, "explanation_vi": string }
  ],
  "tips_vi": [string],
  "summary_vi": string,
  "weakPartPractice": string
}

Rules:
- criteria map to IELTS: fluency=Fluency & Coherence, vocabulary=Lexical Resource, grammar=Grammatical Range, pronunciation=Pronunciation, taskAchievement=Task Response
- summary_vi: ONE sentence max 25 words — band estimate + main strength/weakness
- tips_vi: max 2 short tips in Vietnamese
- weakPartPractice: suggest which IELTS Speaking part to practice more (e.g. "Part 1 — câu trả lời quá ngắn") — ONE sentence max 15 words
- Maximum 2 errors
${COMPACT_JSON_RULES}`;

    const user = `PROMPT: ${prompt}

TRANSCRIPT:
${transcript}

JSON only.`;
    return { system, user };
  }

  const system = `Cambridge ${examLevel} Speaking examiner. Grade from transcript.

Return ONLY valid JSON:
{
  "overallScore": number (0-100),
  "cambridgeBand": string,
  "criteria": {
    "fluency": number (0-5),
    "pronunciation": number (0-5),
    "grammar": number (0-5),
    "vocabulary": number (0-5),
    "taskAchievement": number (0-5)
  },
  "errors": [
    { "original": string, "correction": string, "type": string, "explanation_vi": string }
  ],
  "tips_vi": [string],
  "summary_vi": string
}
${COMPACT_JSON_RULES}`;

  const user = `PROMPT: ${prompt}

TRANSCRIPT:
${transcript}

JSON only.`;

  return { system, user };
}

export function buildExplainWrongAnswerPrompt(params: {
  question: string;
  correctAnswer: string;
  studentAnswer: string;
}): { system: string; user: string } {
  const system = `You are a Cambridge English tutor. Explain why a student's answer is wrong.

Respond ONLY with valid JSON:
{
  "mistake_vi": string,
  "correct_vi": string,
  "tip_vi": string (optional)
}

Rules:
- Vietnamese only
- NO greeting or filler (never start with "Chào bạn", "Có thể bạn...", long encouragement)
- mistake_vi: ONE sentence, max 12 words — what the student got wrong
- correct_vi: ONE sentence, max 12 words — the correct answer and why (cite passage/transcript if given)
- tip_vi: optional ONE sentence, max 10 words — only if a quick study tip helps
- Do not repeat the question text verbatim
- Total under 40 words across all fields`;

  const user = `QUESTION / CONTEXT:
${params.question}

CORRECT ANSWER: ${params.correctAnswer}
STUDENT ANSWER: ${params.studentAnswer}

Return JSON only.`;

  return { system, user };
}
