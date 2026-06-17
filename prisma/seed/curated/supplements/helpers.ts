import { listen, mcq, gap, write, speak } from "../types";
import type { GapSeed, ListeningSeed, McqSeed, SpeakingSeed, WritingSeed } from "../../helpers";

type Opt4 = [string, string, string, string];
export type ListenRow = [string, string, string, Opt4, string];

export function listeningFromRows(rows: ListenRow[]): ListeningSeed[] {
  return rows.map(([title, transcript, question, options, answer]) =>
    listen(title, transcript, question, [...options], answer)
  );
}

export function readingFromSets(
  sets: {
    title: string;
    passage: string;
    questions: { question: string; options: Opt4; answer: string }[];
  }[]
): McqSeed[] {
  const out: McqSeed[] = [];
  for (const set of sets) {
    for (const q of set.questions) {
      out.push(mcq(set.title, q.question, [...q.options], q.answer, set.passage));
    }
  }
  return out;
}

export function gapsFromRows(rows: [string, string, string][]): GapSeed[] {
  return rows.map(([title, passage, answer]) => gap(title, passage, answer));
}

export function writingsFromRows(
  rows: [string, string, number, string][]
): WritingSeed[] {
  return rows.map(([title, taskPrompt, wordLimit, instructions]) =>
    write(title, taskPrompt, wordLimit, instructions)
  );
}

export function speakingsFromRows(
  rows: [string, string, number, number][]
): SpeakingSeed[] {
  return rows.map(([title, prompt, prep, speakTime]) =>
    speak(title, prompt, prep, speakTime)
  );
}
