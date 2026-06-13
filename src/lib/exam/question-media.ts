const CONTEXT_IMAGE_RE = /\(Context image:\s*([^)]+)\)/i;

const VISUAL_QUESTION_TYPES = new Set([
  "look_and_read_yes_no",
  "look_and_read",
  "listen_and_choose_color",
  "listen_and_count",
  "listen_and_choose_activity",
  "listen_and_match_job",
  "listen_and_match",
  "listen_and_write_name",
  "listen_time_info",
  "vocabulary_spelling",
]);

const KEYWORD_EMOJI: [RegExp, string][] = [
  [/crocodile|alligator/i, "🐊"],
  [/dog|puppy/i, "🐕"],
  [/cat|kitten|cats/i, "🐱"],
  [/monkey/i, "🐒"],
  [/whale/i, "🐋"],
  [/fish|fishing/i, "🐟"],
  [/bird/i, "🐦"],
  [/book|books/i, "📚"],
  [/tomato|tomatoes/i, "🍅"],
  [/soccer|football/i, "⚽"],
  [/scarf|jacket|clothes/i, "🧣"],
  [/doll/i, "🪆"],
  [/sandcastle|beach/i, "🏖️"],
  [/lake|water/i, "💧"],
  [/sofa/i, "🛋️"],
  [/ruler|pencil case|school/i, "📏"],
  [/sandwich|food|kitchen/i, "🍽️"],
  [/job|doctor|teacher|nurse/i, "💼"],
];

export type QuestionMedia = {
  question: string;
  imageDescription?: string;
  imageUrl?: string;
  sceneEmoji?: string;
};

export function pickSceneEmoji(text: string): string {
  for (const [pattern, emoji] of KEYWORD_EMOJI) {
    if (pattern.test(text)) return emoji;
  }
  return "🖼️";
}

export function parseContextImageFromText(text: string): QuestionMedia {
  const match = text.match(CONTEXT_IMAGE_RE);
  if (!match) {
    return { question: text.trim() };
  }

  const imageDescription = match[1].trim();
  const question = text.replace(match[0], "").trim();

  return {
    question,
    imageDescription,
    sceneEmoji: pickSceneEmoji(imageDescription),
  };
}

export function inferQuestionMedia(input: {
  question: string;
  questionType?: string;
  audioScript?: string;
  imageDescription?: string;
  imageUrl?: string;
}): QuestionMedia {
  let media = parseContextImageFromText(input.question);

  if (input.imageDescription) {
    media = {
      ...media,
      imageDescription: input.imageDescription,
      sceneEmoji: pickSceneEmoji(input.imageDescription),
    };
  }

  if (input.imageUrl) {
    media = { ...media, imageUrl: input.imageUrl };
  }

  const needsVisual =
    (input.questionType && VISUAL_QUESTION_TYPES.has(input.questionType)) ||
    Boolean(media.imageDescription);

  if (needsVisual && !media.imageDescription && input.audioScript) {
    media = {
      ...media,
      imageDescription: input.audioScript.replace(/\s+/g, " ").trim(),
      sceneEmoji: pickSceneEmoji(`${input.audioScript} ${media.question}`),
    };
  }

  if (needsVisual && !media.imageDescription) {
    media = {
      ...media,
      imageDescription: media.question,
      sceneEmoji: pickSceneEmoji(media.question),
    };
  }

  return media;
}

export function resolveMcqMedia(content: {
  question?: string;
  passage?: string;
  imageDescription?: string;
  imageUrl?: string;
  sceneEmoji?: string;
  questionType?: string;
  transcript?: string;
}): QuestionMedia | null {
  const base = content.question ?? "";
  const parsed = inferQuestionMedia({
    question: base,
    questionType: content.questionType,
    audioScript: content.transcript,
    imageDescription: content.imageDescription,
    imageUrl: content.imageUrl,
  });

  if (!parsed.imageDescription && !parsed.imageUrl) {
    if (content.transcript && /look at|can you see|color its/i.test(content.transcript)) {
      return inferQuestionMedia({
        question: base,
        audioScript: content.transcript,
      });
    }
    return null;
  }

  if (content.sceneEmoji) {
    parsed.sceneEmoji = content.sceneEmoji;
  }

  return parsed;
}
