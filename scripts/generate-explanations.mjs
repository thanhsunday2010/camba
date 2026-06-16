/**
 * Batch-generate explanationVi for objective questions (Reading, Listening, UoE).
 * Usage: npm run content:generate-explanations [-- --limit=50] [-- --force]
 *
 * Requires GOOGLE_AI_API_KEY and DATABASE_URL in .env
 */
import "dotenv/config";
import { PrismaClient, QuestionType, Skill } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

const db = new PrismaClient();
const CONCURRENCY = 2;
const MODEL = process.env.GEMINI_MODEL_EXPLAIN?.replace(/^models\//, "") ?? "gemini-2.5-flash";

const args = process.argv.slice(2);
const force = args.includes("--force");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

function getApiKey() {
  return (
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim()
  );
}

function buildContext(type, content, correctAnswer) {
  const parts = [];
  if (content.passage?.trim()) parts.push(`Passage:\n${content.passage.trim()}`);
  if (content.transcript?.trim()) parts.push(`Transcript:\n${content.transcript.trim()}`);
  if (content.question?.trim()) parts.push(`Question: ${content.question.trim()}`);
  if (Array.isArray(content.options) && content.options.length > 0) {
    parts.push(`Options:\n${content.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}`);
  }
  if (type === "GAP_FILL") parts.push(`Gap-fill passage:\n${content.passage ?? ""}`);
  parts.push(`Correct answer: ${JSON.stringify(correctAnswer)}`);
  return parts.join("\n\n");
}

function parseJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonStr);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateExplanation(ai, type, content, correctAnswer) {
  const system = `You are a Cambridge English tutor writing explanations for Vietnamese K12 students.

Return ONLY valid JSON:
{
  "explanationVi": string,
  "distractorNotes": { "exact wrong option text": "one short Vietnamese sentence why it is wrong" }
}

Rules:
- explanationVi: 1-3 short Vietnamese sentences; cite passage/transcript when provided; explain why the correct answer is right
- distractorNotes: only for MCQ with options; keys MUST match option text exactly; skip correct option; max 4 entries
- No greeting, no markdown outside JSON`;

  const user = `Question type: ${type}\n\n${buildContext(type, content, correctAnswer)}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: user,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 768,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty Gemini response");

  const parsed = parseJson(text);
  if (!parsed.explanationVi || typeof parsed.explanationVi !== "string") {
    throw new Error("Missing explanationVi in response");
  }

  return {
    explanationVi: parsed.explanationVi.trim(),
    distractorNotes:
      parsed.distractorNotes && typeof parsed.distractorNotes === "object"
        ? parsed.distractorNotes
        : undefined,
  };
}

async function runPool(jobs, ai) {
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let done = 0;
  const queue = [...jobs];

  async function worker() {
    while (queue.length > 0) {
      const job = queue.shift();
      if (!job) return;

      const { question, index, total } = job;

      try {
        const content = question.content;
        const existing = content?.explanationVi;
        if (existing && !force) {
          skipped++;
          done++;
          continue;
        }

        let result;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            result = await generateExplanation(
              ai,
              question.type,
              content,
              question.correctAnswer
            );
            break;
          } catch (e) {
            const msg = String(e.message ?? e);
            if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
              const wait = 60_000 * (attempt + 1);
              console.log(`Quota — chờ ${wait / 1000}s rồi thử lại (${index}/${total})...`);
              await sleep(wait);
              continue;
            }
            throw e;
          }
        }

        if (!result) throw new Error("Quota exceeded after retries");

        await db.question.update({
          where: { id: question.id },
          data: {
            content: {
              ...content,
              explanationVi: result.explanationVi,
              ...(result.distractorNotes ? { distractorNotes: result.distractorNotes } : {}),
            },
          },
        });

        updated++;
        if (done % 10 === 0 || done === total - 1) {
          console.log(`[${done + 1}/${total}] OK ${question.level} ${question.skill} ${question.id.slice(0, 8)}`);
        }
      } catch (e) {
        failed++;
        console.log(
          `FAIL [${index}/${total}] ${question.id}: ${e instanceof Error ? e.message.slice(0, 120) : e}`
        );
      }

      done++;
      await sleep(400);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return { updated, skipped, failed };
}

async function main() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Thiếu GOOGLE_AI_API_KEY trong .env");
    process.exit(1);
  }

  console.log(`Model: ${MODEL} | force=${force} | limit=${limit ?? "all"}`);

  const questions = await db.question.findMany({
    where: {
      type: { in: [QuestionType.MCQ, QuestionType.GAP_FILL] },
      skill: { in: [Skill.READING, Skill.LISTENING, Skill.USE_OF_ENGLISH] },
    },
    orderBy: [{ level: "asc" }, { skill: "asc" }, { createdAt: "asc" }],
    ...(limit ? { take: limit } : {}),
  });

  const needsWork = force
    ? questions
    : questions.filter((q) => {
        const c = q.content;
        return !c || typeof c !== "object" || !c.explanationVi;
      });

  console.log(`Tổng ${questions.length} câu · cần generate: ${needsWork.length}`);

  if (needsWork.length === 0) {
    console.log("Không có câu nào cần generate. Dùng --force để ghi đè.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const jobs = needsWork.map((question, i) => ({
    question,
    index: i + 1,
    total: needsWork.length,
  }));

  const { updated, skipped, failed } = await runPool(jobs, ai);
  console.log(`\nXong: ${updated} cập nhật · ${skipped} bỏ qua · ${failed} lỗi`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
