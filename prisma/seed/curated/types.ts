import type {
  GapSeed,
  ListeningSeed,
  McqSeed,
  SpeakingSeed,
  WritingSeed,
} from "../helpers";

export type LevelBank = {
  reading: McqSeed[];
  listening: ListeningSeed[];
  writing: WritingSeed[];
  speaking: SpeakingSeed[];
  uoe: GapSeed[];
};

export function mcq(
  title: string,
  question: string,
  options: string[],
  answer: string,
  passage?: string
): McqSeed {
  return { title, question, options, answer, passage };
}

export function listen(
  title: string,
  transcript: string,
  question: string,
  options: string[],
  answer: string
): ListeningSeed {
  return { title, transcript, question, options, answer };
}

export function gap(title: string, passage: string, answer: string): GapSeed {
  return { title, passage, question: "", answer };
}

export function write(
  title: string,
  taskPrompt: string,
  wordLimit: number,
  instructions: string
): WritingSeed {
  return { title, taskPrompt, wordLimit, instructions };
}

export function speak(
  title: string,
  prompt: string,
  prep = 15,
  speakTime = 60
): SpeakingSeed {
  return { title, prompt, preparationTime: prep, speakingTime: speakTime };
}

/** Build N MCQs from shared passages (Cambridge-style sets). */
export function fromPassageSets(
  sets: { title: string; passage: string; questions: Omit<McqSeed, "passage">[] }[]
): McqSeed[] {
  const out: McqSeed[] = [];
  for (const set of sets) {
    for (const q of set.questions) {
      out.push({ ...q, passage: set.passage });
    }
  }
  return out;
}
