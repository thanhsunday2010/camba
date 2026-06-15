import type {
  GapSeed,
  ListeningSeed,
  McqSeed,
  SpeakingSeed,
  WritingSeed,
} from "./helpers";

const NAME_SETS = [
  ["Tom", "Anna", "Ben", "Lily", "Emma", "Jack", "Sara", "David"],
  ["Sam", "Mia", "Leo", "Zoe", "Noah", "Eva", "Kate", "Paul"],
  ["Max", "Luna", "Finn", "Ivy", "Oscar", "Ruby", "Nina", "Alex"],
] as const;

function swapNames(text: string, formIndex: number): string {
  const from = NAME_SETS[0];
  const to = NAME_SETS[formIndex % NAME_SETS.length];
  let out = text;
  for (let i = 0; i < from.length; i++) {
    out = out.replaceAll(from[i], to[i]!);
  }
  return out;
}

function rotateOptions(options: string[], answer: string, shift: number) {
  const n = options.length;
  const rotated = [...options.slice(shift % n), ...options.slice(0, shift % n)];
  const answerIdx = options.indexOf(answer);
  const newIdx = (answerIdx - (shift % n) + n) % n;
  return { options: rotated, answer: rotated[newIdx]! };
}

export function variantMcqs(items: McqSeed[], formIndex: number): McqSeed[] {
  if (formIndex === 0) return items;
  return items.map((item, i) => {
    const { options, answer } = rotateOptions(item.options, item.answer, formIndex + i);
    return {
      ...item,
      title: `${item.title}·F${formIndex + 1}`,
      question: swapNames(item.question, formIndex),
      options,
      answer,
      passage: item.passage ? swapNames(item.passage, formIndex) : undefined,
    };
  });
}

export function variantGaps(items: GapSeed[], formIndex: number): GapSeed[] {
  if (formIndex === 0) return items;
  return items.map((item, i) => ({
    ...item,
    title: `${item.title}·F${formIndex + 1}`,
    passage: swapNames(item.passage, formIndex + i),
    answer: item.answer,
  }));
}

export function variantListenings(
  items: ListeningSeed[],
  formIndex: number
): ListeningSeed[] {
  if (formIndex === 0) return items;
  return items.map((item, i) => {
    const { options, answer } = rotateOptions(item.options, item.answer, formIndex + i);
    return {
      ...item,
      title: `${item.title}·F${formIndex + 1}`,
      transcript: swapNames(item.transcript, formIndex),
      question: swapNames(item.question, formIndex),
      options,
      answer,
    };
  });
}

const WRITING_VARIANTS: WritingSeed[][] = [
  [],
  [
    {
      title: "W2-alt",
      taskPrompt:
        "Many people prefer to shop online rather than in physical stores. What are the advantages and disadvantages of this trend?",
      wordLimit: 250,
      instructions:
        "Write at least 250 words. Give reasons and examples from your knowledge or experience.",
    },
    {
      title: "W1-alt",
      taskPrompt:
        "You recently bought a product online that arrived damaged. Write a letter to the company. Explain what you ordered, describe the damage, and say what you want them to do.",
      wordLimit: 150,
      instructions: "Write at least 150 words. You do NOT need to write any addresses.",
    },
  ],
  [
    {
      title: "W2-alt",
      taskPrompt:
        "Some believe that learning a foreign language is essential in the modern world. Do you agree or disagree?",
      wordLimit: 250,
      instructions:
        "Write at least 250 words. Give reasons and examples from your knowledge or experience.",
    },
    {
      title: "W1-alt",
      taskPrompt:
        "The table below shows the number of visitors to three museums in 2019 and 2023. Summarise the information by selecting and reporting the main features.",
      wordLimit: 150,
      instructions: "Write at least 150 words. (Imagine a table with visitor numbers.)",
    },
  ],
];

export function variantWritings(items: WritingSeed[], formIndex: number): WritingSeed[] {
  if (formIndex === 0) return items;
  const alts = WRITING_VARIANTS[formIndex % WRITING_VARIANTS.length] ?? [];
  return items.map((item, i) => {
    const alt = alts[i];
    if (!alt) {
      return {
        ...item,
        title: `${item.title}·F${formIndex + 1}`,
        taskPrompt: swapNames(item.taskPrompt, formIndex),
      };
    }
    return {
      ...alt,
      title: `${item.title.replace(/\s*·F\d+$/, "")}·F${formIndex + 1}`,
      wordLimit: item.wordLimit,
      instructions: item.instructions,
    };
  });
}

const SPEAKING_VARIANTS: SpeakingSeed[][] = [
  [],
  [
    {
      title: "SP2-alt",
      prompt:
        "Describe a place you visited that you found interesting. You should say: where it is, when you went there, what you did there, and explain why you found it interesting.",
      preparationTime: 60,
      speakingTime: 120,
    },
    {
      title: "SP1-alt",
      prompt:
        "Let's talk about hobbies. What hobbies do you enjoy? How often do you do them? Is there a hobby you would like to try in the future?",
      preparationTime: 15,
      speakingTime: 120,
    },
  ],
  [
    {
      title: "SP2-alt",
      prompt:
        "Describe a person who has influenced you. You should say: who the person is, how you know them, what they have done, and explain why they influenced you.",
      preparationTime: 60,
      speakingTime: 120,
    },
    {
      title: "SP1-alt",
      prompt:
        "Let's talk about food. What kind of food do you like? Do you prefer eating at home or in restaurants? Who cooks in your family?",
      preparationTime: 15,
      speakingTime: 120,
    },
  ],
];

export function variantSpeakings(items: SpeakingSeed[], formIndex: number): SpeakingSeed[] {
  if (formIndex === 0) return items;
  const alts = SPEAKING_VARIANTS[formIndex % SPEAKING_VARIANTS.length] ?? [];
  return items.map((item, i) => {
    const alt = alts[i];
    if (!alt) {
      return {
        ...item,
        title: `${item.title}·F${formIndex + 1}`,
        prompt: swapNames(item.prompt, formIndex),
      };
    }
    return {
      ...alt,
      title: `${item.title.replace(/\s*·F\d+$/, "")}·F${formIndex + 1}`,
      preparationTime: item.preparationTime,
      speakingTime: item.speakingTime,
    };
  });
}

export const PLACEMENT_BANK_FORMS = 3;
