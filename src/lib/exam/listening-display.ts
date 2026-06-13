const SPEAKER_QUOTED =
  /^Speaker:\s*['"]([^'"]+)['"]\.?\s*(.*)$/i;
const SAYS_QUOTED =
  /^(.+?\s+says):\s*['"]([^'"]+)['"]\.?\s*(.*)$/i;
const FOLLOW_UP =
  /^(.+?\.)\s+((?:What|Who|Where|When|Why|How|Which)\b.+)$/i;

const DEFAULT_LISTENING_PROMPT =
  "Listen to the audio and choose the best answer.";

/** Normalize stored transcript (strip Speaker: wrapper for TTS). */
export function normalizeListeningTranscript(transcript: string): string {
  const trimmed = transcript.trim();
  const speaker = trimmed.match(/^Speaker:\s*['"]([^'"]+)['"]\.?$/i);
  if (speaker) return speaker[1].trim();
  return trimmed;
}

/** Remove embedded speaker/script lines from text shown to students. */
export function stripListeningScriptFromQuestion(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  const speaker = trimmed.match(SPEAKER_QUOTED);
  if (speaker) {
    const rest = speaker[2].trim();
    return rest || DEFAULT_LISTENING_PROMPT;
  }

  const says = trimmed.match(SAYS_QUOTED);
  if (says) {
    const rest = says[3].trim();
    return rest || DEFAULT_LISTENING_PROMPT;
  }

  const followUp = trimmed.match(FOLLOW_UP);
  if (followUp) {
    return followUp[2].trim();
  }

  return trimmed;
}

/** Split raw placement/listening text into audio script + student-facing question. */
export function splitListeningScriptAndQuestion(
  raw: string,
  audioScript?: string
): { transcript: string; displayQuestion: string } {
  const trimmed = raw.trim();

  if (audioScript?.trim()) {
    return {
      transcript: audioScript.trim(),
      displayQuestion: stripListeningScriptFromQuestion(trimmed),
    };
  }

  const speaker = trimmed.match(SPEAKER_QUOTED);
  if (speaker) {
    const rest = speaker[2].trim();
    return {
      transcript: speaker[1].trim(),
      displayQuestion: rest || DEFAULT_LISTENING_PROMPT,
    };
  }

  const says = trimmed.match(SAYS_QUOTED);
  if (says) {
    const rest = says[3].trim();
    return {
      transcript: `${says[1]} '${says[2].trim()}'`,
      displayQuestion: rest || DEFAULT_LISTENING_PROMPT,
    };
  }

  const followUp = trimmed.match(FOLLOW_UP);
  if (followUp) {
    return {
      transcript: followUp[1].trim(),
      displayQuestion: followUp[2].trim(),
    };
  }

  return {
    transcript: trimmed,
    displayQuestion: trimmed,
  };
}
