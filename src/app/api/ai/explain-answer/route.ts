import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { explainWrongAnswer } from "@/lib/ai/grading";
import { getGeminiApiKey } from "@/lib/ai/config";
import { z } from "zod";

const schema = z.object({
  question: z.string(),
  correctAnswer: z.string(),
  studentAnswer: z.string(),
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

  try {
    const explanation = await explainWrongAnswer(parsed.data);
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
