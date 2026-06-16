import { ExamLevel } from "@prisma/client";
import type {
  GapSeed,
  ListeningSeed,
  McqSeed,
  SpeakingSeed,
  WritingSeed,
} from "../helpers";

const NAMES = [
  "Tom", "Anna", "Ben", "Lily", "Sara", "Jack", "Emma", "Leo", "Mia", "Noah",
  "Olivia", "Lucas", "Sophie", "Daniel", "Chloe", "Minh", "Lan", "Huy", "Linh", "An",
];

const PLACES = [
  "school", "park", "library", "museum", "beach", "zoo", "market", "hospital",
  "cinema", "restaurant", "station", "airport", "garden", "supermarket", "café",
];

const ANIMALS = ["cat", "dog", "bird", "fish", "rabbit", "horse", "lion", "monkey", "penguin", "elephant"];
const COLORS = ["red", "blue", "green", "yellow", "orange", "purple", "black", "white", "brown", "pink"];
const FOODS = ["apple", "banana", "bread", "rice", "pizza", "soup", "salad", "chicken", "fish", "cake"];
const TIMES = ["7:30", "8:00", "8:15", "9:30", "10:45", "12:00", "2:30", "4:15", "5:00", "6:30"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function mcq(
  title: string,
  question: string,
  options: string[],
  answer: string,
  passage?: string
): McqSeed {
  return { title, question, options, answer, passage };
}

function gap(title: string, passage: string, answer: string): GapSeed {
  return { title, passage, question: "", answer };
}

function listen(
  title: string,
  transcript: string,
  question: string,
  options: string[],
  answer: string
): ListeningSeed {
  return { title, transcript, question, options, answer };
}

function write(title: string, taskPrompt: string, wordLimit: number, instructions: string): WritingSeed {
  return { title, taskPrompt, wordLimit, instructions };
}

function speak(title: string, prompt: string, prep = 15, speakTime = 60): SpeakingSeed {
  return { title, prompt, preparationTime: prep, speakingTime: speakTime };
}

export function isYleLevel(level: ExamLevel): boolean {
  return level === "STARTERS" || level === "MOVERS" || level === "FLYERS";
}

export function questionCounts(level: ExamLevel) {
  if (isYleLevel(level)) {
    return { reading: 55, listening: 25, writing: 10, speaking: 10, uoe: 20 };
  }
  return { reading: 50, listening: 25, writing: 10, speaking: 10, uoe: 30 };
}

export function generateReading(
  level: ExamLevel,
  count: number,
  startOffset = 0
): McqSeed[] {
  const items: McqSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startOffset + i;
    const name = pick(NAMES, idx);
    const place = pick(PLACES, idx + 3);
    const age = 6 + (idx % 12);

    if (isYleLevel(level)) {
      const passage = `${name} is ${age}. ${name} likes the ${place}. Every day ${name} goes there with friends.`;
      items.push(
        mcq(
          `Reading ${idx + 1}`,
          `How old is ${name}?`,
          [`${age - 1}`, `${age}`, `${age + 1}`, `${age + 2}`],
          `${age}`,
          passage
        )
      );
    } else if (level === "KET") {
      const passage = `${name} is ${age} years old and lives near the ${place}. Last weekend ${name} visited the ${pick(PLACES, idx + 5)} with family. They had lunch at a small ${pick(PLACES, idx + 7)} and bought souvenirs. ${name} enjoyed the trip because the weather was sunny.`;
      const qs = [
        mcq(`KET R${idx + 1}a`, `Where does ${name} live?`, [`In a ${place}`, `Near a ${place}`, `At the ${place}`, `Behind the ${place}`], `Near a ${place}`, passage),
        mcq(`KET R${idx + 1}b`, `Why did ${name} enjoy the trip?`, ["It was cheap", "The weather was sunny", "It was short", "They stayed home"], "The weather was sunny", passage),
        mcq(`KET R${idx + 1}c`, `Who did ${name} travel with?`, ["Friends", "Family", "Teachers", "Neighbours"], "Family", passage),
      ];
      items.push(qs[idx % qs.length]);
    } else if (level === "PET") {
      const passage = `Many teenagers, including ${name}, spend time at the ${place} after school. While some parents worry about screen time, ${name} argues that online communities help students practise English and share study tips. However, ${name} also recognises that too much time online can affect sleep and concentration.`;
      const qs = [
        mcq(`PET R${idx + 1}a`, `What is ${name}'s opinion about online communities?`, ["They are always harmful", "They can help language practice", "They replace teachers", "They are banned at school"], "They can help language practice", passage),
        mcq(`PET R${idx + 1}b`, `What problem does ${name} mention?`, ["High costs", "Poor internet", "Sleep and concentration", "No friends"], "Sleep and concentration", passage),
        mcq(`PET R${idx + 1}c`, `When does ${name} go to the ${place}?`, ["Before school", "After school", "At midnight", "On holidays only"], "After school", passage),
      ];
      items.push(qs[idx % qs.length]);
    } else {
      const passage = `Researchers studying urban ${place}s have found that access to green areas correlates with improved mental health among residents like ${name}, a ${age}-year-old volunteer. Critics claim maintenance budgets are excessive, yet longitudinal data suggest reduced healthcare spending may offset initial investment. Policymakers in several cities are now prioritising sustainable design.`;
      const qs = [
        mcq(`FCE R${idx + 1}a`, `What benefit is mentioned?`, ["Cheaper transport", "Improved mental health", "More shopping", "Higher taxes"], "Improved mental health", passage),
        mcq(`FCE R${idx + 1}b`, `What do critics argue?`, ["Parks are unnecessary", "Maintenance budgets are excessive", "Volunteers are unpaid", "Data is unreliable"], "Maintenance budgets are excessive", passage),
        mcq(`FCE R${idx + 1}c`, `What are policymakers prioritising?`, ["Road expansion", "Sustainable design", "Private gardens", "Car parks"], "Sustainable design", passage),
      ];
      items.push(qs[idx % qs.length]);
    }
  }
  return items;
}

export function generateListening(
  level: ExamLevel,
  count: number,
  startOffset = 0
): ListeningSeed[] {
  const items: ListeningSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startOffset + i;
    const name = pick(NAMES, idx + 1);
    const time = pick(TIMES, idx);
    const place = pick(PLACES, idx + 2);
    const food = pick(FOODS, idx);
    const animal = pick(ANIMALS, idx);

    if (isYleLevel(level)) {
      const transcript = `Hello. My name is ${name}. I am ${6 + (idx % 8)}. I have a ${pick(COLORS, idx)} ${animal}.`;
      items.push(
        listen(
          `Listening ${idx + 1}`,
          transcript,
          `What animal does ${name} have?`,
          [pick(ANIMALS, idx + 1), animal, pick(ANIMALS, idx + 2), pick(ANIMALS, idx + 3)],
          animal
        )
      );
    } else if (level === "KET") {
      const transcript = `Speaker: Good morning. The meeting at the ${place} starts at ${time}. Please bring your notebook and ID card.`;
      items.push(
        listen(
          `KET L${idx + 1}`,
          transcript,
          "What time does the meeting start?",
          [pick(TIMES, idx + 2), time, pick(TIMES, idx + 4), pick(TIMES, idx + 6)],
          time
        )
      );
    } else if (level === "PET") {
      const transcript = `Interviewer: ${name}, why did you choose to volunteer at the ${place}? ${name}: I wanted to improve my communication skills and help the community. We serve ${food} on Saturdays.`;
      items.push(
        listen(
          `PET L${idx + 1}`,
          transcript,
          "What food is mentioned?",
          [pick(FOODS, idx + 1), food, pick(FOODS, idx + 3), pick(FOODS, idx + 5)],
          food
        )
      );
    } else {
      const transcript = `Lecturer: Today's seminar on sustainable transport will examine how cities like ours can reduce emissions. ${name} will present case studies from Europe at ${time} in Room 4.`;
      items.push(
        listen(
          `FCE L${idx + 1}`,
          transcript,
          "When will the case studies be presented?",
          [pick(TIMES, idx + 1), time, pick(TIMES, idx + 3), pick(TIMES, idx + 5)],
          time
        )
      );
    }
  }
  return items;
}

export function generateUoe(
  level: ExamLevel,
  count: number,
  startOffset = 0
): GapSeed[] {
  const templates: GapSeed[] = [];
  const verbs = [
    ["go", "goes"],
    ["have", "has"],
    ["do", "does"],
    ["watch", "watches"],
    ["study", "studies"],
    ["play", "plays"],
    ["like", "likes"],
    ["want", "wants"],
    ["need", "needs"],
    ["enjoy", "enjoys"],
  ];
  const preps = [
    ["interested", "in"],
    ["good", "at"],
    ["afraid", "of"],
    ["proud", "of"],
    ["keen", "on"],
  ];

  for (let i = 0; i < count; i++) {
    const idx = startOffset + i;
    const name = pick(NAMES, idx);
    const animal = pick(ANIMALS, idx);
    const food = pick(FOODS, idx);

    if (level === "STARTERS") {
      const starters = [
        gap(`Grammar ${idx + 1}`, `I ___ a ${animal}.`, "have"),
        gap(`Grammar ${idx + 1}`, `She ___ happy.`, "is"),
        gap(`Grammar ${idx + 1}`, `They ___ ${food}.`, "like"),
        gap(`Grammar ${idx + 1}`, `It ___ a ${pick(COLORS, idx)} ball.`, "is"),
        gap(`Grammar ${idx + 1}`, `We ___ to school.`, "go"),
        gap(`Grammar ${idx + 1}`, `The ${animal} ___ on the table.`, "is"),
        gap(`Grammar ${idx + 1}`, `I can ___ a bike.`, "ride"),
        gap(`Grammar ${idx + 1}`, `This is my ___.`, "bag"),
      ];
      templates.push(starters[idx % starters.length]);
    } else if (level === "MOVERS") {
      const movers = [
        gap(`Grammar ${idx + 1}`, `${name} ___ (${pick(verbs, idx)[0]}) to school every day.`, pick(verbs, idx)[1]),
        gap(`Grammar ${idx + 1}`, `There ___ two ${animal}s in the garden.`, "are"),
        gap(`Grammar ${idx + 1}`, `I ___ (not like) ${food}.`, "don't like"),
        gap(`Grammar ${idx + 1}`, `${name} is ___ (tall) than me.`, "taller"),
        gap(`Grammar ${idx + 1}`, `We ___ (play) football now.`, "are playing"),
        gap(`Grammar ${idx + 1}`, `She ___ (watch) TV every evening.`, "watches"),
        gap(`Grammar ${idx + 1}`, `The book is ___ the bag.`, "in"),
        gap(`Grammar ${idx + 1}`, `Can you ___ (${pick(verbs, idx + 2)[0]}) English?`, pick(verbs, idx + 2)[0]),
      ];
      templates.push(movers[idx % movers.length]);
    } else if (level === "FLYERS") {
      const flyers = [
        gap(`Grammar ${idx + 1}`, `${name} ___ (visit) London last year.`, "visited"),
        gap(`Grammar ${idx + 1}`, `If it rains, we ___ (stay) at home.`, "will stay"),
        gap(`Grammar ${idx + 1}`, `This is the ___ (good) film I've seen.`, "best"),
        gap(`Grammar ${idx + 1}`, `${name} has ___ (live) here since 2020.`, "lived"),
        gap(`Grammar ${idx + 1}`, `They ___ (not finish) their homework yet.`, "haven't finished"),
        gap(`Grammar ${idx + 1}`, `I was ___ (read) when you called.`, "reading"),
        gap(`Grammar ${idx + 1}`, `${name} is ${pick(preps, idx)[0]} ___ maths.`, pick(preps, idx)[1]),
        gap(`Grammar ${idx + 1}`, `We ___ (go) to the beach tomorrow.`, "are going"),
      ];
      templates.push(flyers[idx % flyers.length]);
    } else if (level === "KET" || idx % 3 === 0) {
      const [base, form] = pick(verbs, idx);
      templates.push(
        gap(
          `Grammar ${idx + 1}`,
          `${name} ___ (${base}) to school every day.`,
          form
        )
      );
    } else if (level === "PET" || idx % 3 === 1) {
      const [adj, prep] = pick(preps, idx);
      templates.push(
        gap(
          `Grammar ${idx + 1}`,
          `${name} is ${adj} ___ learning English.`,
          prep
        )
      );
    } else {
      templates.push(
        gap(
          `Grammar ${idx + 1}`,
          `If ${name} ___ (study) harder, the results would improve.`,
          "studied"
        )
      );
    }
  }
  return templates;
}

export function generateWriting(
  level: ExamLevel,
  count: number,
  startOffset = 0
): WritingSeed[] {
  const items: WritingSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startOffset + i;
    const name = pick(NAMES, idx);
    if (isYleLevel(level)) {
      items.push(
        write(
          `Writing ${idx + 1}`,
          `Write about your ${pick(ANIMALS, idx)}. Say what it looks like and what it likes to do.`,
          30,
          "Write 3–5 sentences in English."
        )
      );
    } else if (level === "KET") {
      items.push(
        write(
          `KET W${idx + 1}`,
          `Your English friend ${name} wants to know about your favourite place. Write an email. Tell ${name} where it is, what you do there, and why you like it.`,
          50,
          "Write 25–35 words."
        )
      );
    } else if (level === "PET") {
      items.push(
        write(
          `PET W${idx + 1}`,
          `In your English class you have been talking about technology. Write an article about whether students should use phones at school.`,
          100,
          "Write about 100 words."
        )
      );
    } else {
      items.push(
        write(
          `FCE W${idx + 1}`,
          `Your teacher has asked you to write an essay discussing the advantages and disadvantages of living in a big city.`,
          190,
          "Write your essay in 140–190 words."
        )
      );
    }
  }
  return items;
}

export function generateSpeaking(
  level: ExamLevel,
  count: number,
  startOffset = 0
): SpeakingSeed[] {
  const items: SpeakingSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startOffset + i;
    const topic = pick(PLACES, idx);
    if (isYleLevel(level)) {
      items.push(speak(`Speaking ${idx + 1}`, `Tell me about your ${pick(FOODS, idx)}. Do you like it?`, 10, 30));
    } else if (level === "KET") {
      items.push(speak(`KET S${idx + 1}`, `Describe your favourite ${topic}. Say where it is and how often you go there.`, 15, 60));
    } else if (level === "PET") {
      items.push(speak(`PET S${idx + 1}`, `Talk about a time you helped someone. What happened and how did you feel?`, 15, 90));
    } else {
      items.push(speak(`FCE S${idx + 1}`, `Discuss how social media has changed the way people communicate.`, 60, 120));
    }
  }
  return items;
}

/** Mixed-difficulty items for global placement test */
export function generatePlacementPool(): {
  reading: McqSeed[];
  listening: ListeningSeed[];
  uoe: GapSeed[];
} {
  return {
    reading: [
      ...generateReading("STARTERS", 5),
      ...generateReading("MOVERS", 5),
      ...generateReading("FLYERS", 5),
      ...generateReading("KET", 5),
      ...generateReading("PET", 5),
      ...generateReading("FCE", 5),
    ],
    listening: [
      ...generateListening("MOVERS", 5),
      ...generateListening("FLYERS", 5),
      ...generateListening("KET", 5),
      ...generateListening("PET", 5),
      ...generateListening("FCE", 5),
    ],
    uoe: [
      ...generateUoe("KET", 5),
      ...generateUoe("PET", 5),
      ...generateUoe("FCE", 5),
    ],
  };
}

export function generatePlacementPoolYle(): {
  reading: McqSeed[];
  listening: ListeningSeed[];
} {
  return {
    reading: [
      ...generateReading("STARTERS", 8),
      ...generateReading("MOVERS", 8),
      ...generateReading("FLYERS", 9),
    ],
    listening: [
      ...generateListening("STARTERS", 7),
      ...generateListening("MOVERS", 7),
      ...generateListening("FLYERS", 6),
    ],
  };
}
