import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateListeningWav } from "@/lib/ai/listening-tts";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: { skill: true, content: true },
  });

  if (!question || question.skill !== "LISTENING") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = question.content as { transcript?: string } | null;
  const transcript = content?.transcript?.trim();
  if (!transcript) {
    return NextResponse.json({ error: "No transcript" }, { status: 404 });
  }

  try {
    const wav = await generateListeningWav(transcript);
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
