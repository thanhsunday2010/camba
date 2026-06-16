import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSpeakingPromptText } from "@/lib/exam/speaking-audio";
import { generateListeningWav } from "@/lib/ai/listening-tts";
import type { SpeakingContent } from "@/lib/exam/scoring";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: { type: true, content: true },
  });

  if (!question || question.type !== "SPEAKING_PROMPT") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const text = getSpeakingPromptText(question.content as unknown as SpeakingContent);
  if (!text) {
    return NextResponse.json({ error: "No speaking prompt" }, { status: 404 });
  }

  try {
    const wav = await generateListeningWav(text);
    return new NextResponse(new Uint8Array(wav), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "TTS error";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
