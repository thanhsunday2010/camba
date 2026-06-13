import { ExamLevel } from "@prisma/client";

export function buildWritingPrompt(
  examLevel: ExamLevel,
  taskPrompt: string,
  studentAnswer: string,
  wordLimit?: number
): { system: string; user: string } {
  const levelGuide: Record<ExamLevel, string> = {
    STARTERS:
      "YLE Starters (Pre A1). Use simplified criteria: vocabulary range, basic grammar, task completion. Band: 1-5 shields equivalent.",
    MOVERS:
      "YLE Movers (A1). Simplified Cambridge criteria for young learners. Band: 1-5 shields equivalent.",
    FLYERS:
      "YLE Flyers (A2). Simplified criteria with short paragraph writing. Band: 1-5 shields equivalent.",
    KET: "A2 Key (KET). Use Cambridge A2 Writing scale. Band: A1, A2, B1.",
    PET: "B1 Preliminary (PET). Use Cambridge B1 Writing scale. Band: A2, B1, B2.",
    FCE: "B2 First (FCE). Use Cambridge B2 Writing scale. Band: B1, B2, C1.",
  };

  const system = `You are an official Cambridge English examiner grading a ${examLevel} Writing task.

${levelGuide[examLevel]}

Evaluate fairly using Cambridge criteria:
- Content: relevance and development of ideas
- Communicative Achievement: appropriate register, purpose, reader
- Organisation: coherence, linking, paragraphing
- Language: range and accuracy of grammar and vocabulary

Respond ONLY with valid JSON matching this exact schema:
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
  "improvedVersion": string,
  "tips_vi": [string, string, string],
  "summary_vi": string
}

Rules:
- Explain errors in Vietnamese (explanation_vi)
- Give realistic scores; do not inflate
- improvedVersion should improve the student's text, not replace with unrelated content
- If answer is off-topic or too short, score accordingly and explain in summary_vi
- Maximum 8 errors listed`;

  const user = `TASK PROMPT:
${taskPrompt}

${wordLimit ? `WORD LIMIT: ${wordLimit} words` : ""}

STUDENT ANSWER:
${studentAnswer}

Grade this writing and return JSON only.`;

  return { system, user };
}

export function buildSpeakingPrompt(
  examLevel: ExamLevel,
  prompt: string,
  transcript: string
): { system: string; user: string } {
  const system = `You are a Cambridge English Speaking examiner for ${examLevel}.

Evaluate the student's spoken response based on transcript (pronunciation is estimated from text quality).

Respond ONLY with valid JSON:
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
  "tips_vi": [string, string, string],
  "summary_vi": string
}

Explain feedback in Vietnamese. Be encouraging but accurate.`;

  const user = `SPEAKING PROMPT:
${prompt}

TRANSCRIPT:
${transcript}

Grade and return JSON only.`;

  return { system, user };
}
