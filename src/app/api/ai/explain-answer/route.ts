import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { explainWrongAnswer } from "@/lib/ai/grading";
import { getGeminiApiKey } from "@/lib/ai/config";
import { checkAiGradingRateLimit, getAiGradingRateLimitInfo } from "@/lib/ai/rate-limit";
import { db } from "@/lib/db";
import {
  EXPLAIN_AI_SKILLS,
  paperSkillToAiGradingSkill,
  type AiGradingSkill,
} from "@/lib/subscription/plans";
import { z } from "zod";

const schema = z.object({
  question: z.string(),
  correctAnswer: z.string(),
  studentAnswer: z.string(),
  paperSkill: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!getGeminiApiKey()) {
    return NextResponse.json({ error: "GOOGLE_AI_API_KEY chưa được cấu hình" }, { status: 503 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const aiSkill: AiGradingSkill = paperSkillToAiGradingSkill(parsed.data.paperSkill ?? "READING");
  if (!EXPLAIN_AI_SKILLS.includes(aiSkill as (typeof EXPLAIN_AI_SKILLS)[number])) {
    return NextResponse.json(
      {
        error:
          "Giải thích AI chỉ áp dụng cho bài Reading, Listening và Use of English",
      },
      { status: 400 }
    );
  }

  const allowed = await checkAiGradingRateLimit(session.user.id, aiSkill);
  if (!allowed) {
    const info = await getAiGradingRateLimitInfo(session.user.id, aiSkill);
    return NextResponse.json(
      {
        error: `Đã hết ${info.limit} lượt AI ${info.skillLabel} hôm nay. Nâng cấp gói tại trang Bảng giá.`,
      },
      { status: 429 }
    );
  }

  try {
    const explanation = await explainWrongAnswer(parsed.data);
    await db.aIFeedback.create({
      data: {
        userId: session.user.id,
        feedbackType: "explain",
        inputText: `${parsed.data.question}\nĐáp án học sinh: ${parsed.data.studentAnswer}`,
        rawResponse: { explanation, skill: aiSkill },
      },
    });

    const { recordAiGradingUsage } = await import("@/lib/subscription/service");
    await recordAiGradingUsage(session.user.id, aiSkill);

    return NextResponse.json({ explanation });
  } catch (e) {
    console.error("[explain-answer]", e);
    const message =
      e instanceof Error && e.message.includes("404")
        ? "Model Gemini không khả dụng. Kiểm tra GEMINI_MODEL_EXPLAIN trong .env."
        : "Không thể gọi Gemini. Kiểm tra GOOGLE_AI_API_KEY.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
