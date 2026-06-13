import { getGeminiApiKey, GEMINI_MODELS } from "./config";
import { pcmToWav } from "@/lib/audio/pcm-to-wav";

const TTS_MODEL = GEMINI_MODELS.tts;

const cache = new Map<string, Buffer>();

function formatListeningPrompt(transcript: string): string {
  const trimmed = transcript.trim().slice(0, 1200);
  if (/^\w+\s*:/m.test(trimmed)) {
    return `Read the following English dialogue clearly at a natural pace, using a British English accent. Pause briefly between speakers:\n\n${trimmed}`;
  }
  return `Read the following English text clearly at a natural pace, using a British English accent:\n\n${trimmed}`;
}

export async function generateListeningWav(transcript: string): Promise<Buffer> {
  const key = transcript.trim();
  const cached = cache.get(key);
  if (cached) return cached;

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Thiếu GOOGLE_AI_API_KEY cho TTS");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: formatListeningPrompt(key) }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini TTS failed: ${res.status} ${err.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data?: string } }> };
    }>;
  };

  const b64 = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) {
    throw new Error("Gemini TTS không trả về audio");
  }

  const pcm = Buffer.from(b64, "base64");
  const wav = pcmToWav(pcm);
  cache.set(key, wav);
  return wav;
}
