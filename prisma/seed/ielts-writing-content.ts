/** Ngân hàng IELTS Writing — Academic & General Training */

import { buildVarContext, difficultyForIndex } from "./generators/seed-vars";
import type { SeedDifficulty } from "../../src/lib/exam/question-diversity";
import type { IeltsModule } from "../../src/lib/exam/ielts-module";

export type IeltsWritingSeed = {
  title: string;
  taskPrompt: string;
  wordLimit: number;
  instructions: string;
  task: 1 | 2;
  difficulty?: SeedDifficulty;
  ieltsTask1Format?: "chart" | "map" | "process" | "letter";
};

const T1_CHART_TOPICS = [
  "household internet access",
  "international student enrolment",
  "renewable energy use",
  "urban population growth",
  "average daily screen time",
  "public transport usage",
  "tourist arrivals by season",
  "online shopping spending",
  "unemployment rates",
  "car ownership",
  "water consumption",
  "smartphone ownership among teenagers",
  "coffee consumption per capita",
  "library membership",
  "recycling rates",
  "electric vehicle sales",
  "part-time employment",
  "housing prices",
  "food waste",
  "language course enrolment",
];

const T1_MAP_TOPICS = [
  "a town centre before and after redevelopment",
  "a university campus in 1990 and today",
  "a coastal area affected by tourism",
  "an industrial zone converted into a park",
  "a village that expanded into a small town",
  "a transport hub with new facilities",
  "a harbour area with marina development",
  "a residential district with new amenities",
];

const T1_PROCESS_TOPICS = [
  "how chocolate is produced",
  "how rainwater is collected and filtered",
  "how a newspaper is printed and distributed",
  "how solar panels generate electricity",
  "how olive oil is made",
  "how glass is recycled",
  "how honey is harvested and packaged",
  "how bricks are manufactured",
];

const T1_LETTER_SCENARIOS = [
  {
    prompt:
      "You recently attended a course and were dissatisfied with the facilities. Write a letter to the course organiser.",
    bullets: "explain which course you took, describe the problems, and say what you would like them to do",
  },
  {
    prompt: "You saw an advertisement for a volunteer programme abroad. Write a letter to the organisation.",
    bullets: "explain why you are interested, describe your relevant experience, and ask about dates and costs",
  },
  {
    prompt: "You are moving to a new apartment. Write a letter to your landlord.",
    bullets: "confirm your move-in date, mention a repair that is needed, and ask about parking",
  },
  {
    prompt: "You borrowed equipment from a friend and damaged it accidentally. Write a letter to your friend.",
    bullets: "apologise, explain what happened, and say how you will fix the situation",
  },
  {
    prompt: "You want to change your gym membership plan. Write a letter to the manager.",
    bullets: "say which plan you have now, explain why you want to change, and ask about options",
  },
];

const T2_ESSAY_TOPICS = [
  "Some people believe technology has made life more complicated. To what extent do you agree or disagree?",
  "Many think that working from home is better for employees and employers. Others disagree. Discuss both views and give your opinion.",
  "Some governments spend large amounts on space exploration. Is this a good use of public money?",
  "In many countries, young people are leaving rural areas to live in cities. What problems does this cause? What can be done?",
  "Some people say that advertising encourages us to buy things we do not need. Do you agree or disagree?",
  "Many schools replace sports and arts with academic subjects. Is this a positive or negative development?",
  "Some believe that children should be taught how to manage money at school. To what extent do you agree?",
  "International tourism can harm local cultures. Do the benefits outweigh the disadvantages?",
  "Some people think that the best way to reduce crime is to give longer prison sentences. Do you agree?",
  "Climate change can only be solved by international cooperation. To what extent do you agree?",
  "Some argue that social media does more harm than good for teenagers. Discuss both views and give your opinion.",
  "Universities should accept the same number of male and female students in every subject. Do you agree or disagree?",
  "Some people prefer to live in a house, while others prefer an apartment. Discuss both views and give your preference.",
  "The best way to learn a language is to live in a country where it is spoken. Do you agree or disagree?",
  "Many employers now value soft skills more than academic qualifications. Is this a positive trend?",
  "Some think that zoos should be closed because they are cruel. Others say they protect endangered species. Discuss both views.",
  "Governments should provide free public transport in cities. Do you agree or disagree?",
  "Some people believe that reading fiction is a waste of time. To what extent do you agree?",
  "The rise of artificial intelligence will create more jobs than it destroys. Do you agree or disagree?",
  "Children today spend too much time on screens. What are the causes and what solutions can you suggest?",
];

function withDifficulty(
  item: Omit<IeltsWritingSeed, "difficulty">,
  difficulty: SeedDifficulty
): IeltsWritingSeed {
  return { ...item, difficulty };
}

function buildAcademicTask1Seed(idx: number): IeltsWritingSeed {
  const difficulty = difficultyForIndex(idx, idx % 3);
  const kind = idx % 3;

  if (kind === 0) {
    const topic = T1_CHART_TOPICS[idx % T1_CHART_TOPICS.length]!;
    return withDifficulty(
      {
        title: `IELTS AC WT1-${idx + 1}`,
        task: 1,
        ieltsTask1Format: "chart",
        taskPrompt: `The chart below shows ${topic} in three countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.`,
        wordLimit: 150,
        instructions: `Write at least 150 words. (Imagine a line or bar chart about ${topic} in Country A, B and C.)`,
      },
      difficulty
    );
  }

  if (kind === 1) {
    const topic = T1_MAP_TOPICS[idx % T1_MAP_TOPICS.length]!;
    return withDifficulty(
      {
        title: `IELTS AC WT1-${idx + 1}`,
        task: 1,
        ieltsTask1Format: "map",
        taskPrompt: `The maps show changes in ${topic}. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.`,
        wordLimit: 150,
        instructions: "Write at least 150 words. (Imagine two maps showing before/after changes.)",
      },
      difficulty
    );
  }

  const topic = T1_PROCESS_TOPICS[idx % T1_PROCESS_TOPICS.length]!;
  return withDifficulty(
    {
      title: `IELTS AC WT1-${idx + 1}`,
      task: 1,
      ieltsTask1Format: "process",
      taskPrompt: `The diagram below shows ${topic}. Summarise the information by selecting and reporting the main features.`,
      wordLimit: 150,
      instructions: "Write at least 150 words. (Imagine a process diagram with 5–8 stages.)",
    },
    difficulty
  );
}

function buildGeneralTask1Seed(idx: number): IeltsWritingSeed {
  const difficulty = difficultyForIndex(idx, idx % 5);
  const scenario = T1_LETTER_SCENARIOS[idx % T1_LETTER_SCENARIOS.length]!;
  return withDifficulty(
    {
      title: `IELTS GT WT1-${idx + 1}`,
      task: 1,
      ieltsTask1Format: "letter",
      taskPrompt: `${scenario.prompt} In your letter: ${scenario.bullets}.`,
      wordLimit: 150,
      instructions: "Write at least 150 words. You do NOT need to write any addresses.",
    },
    difficulty
  );
}

function buildTask2Seed(idx: number, module: IeltsModule): IeltsWritingSeed {
  const difficulty = difficultyForIndex(idx, idx % 3);
  const topic = T2_ESSAY_TOPICS[idx % T2_ESSAY_TOPICS.length]!;
  const v = buildVarContext(idx, difficulty, idx % 3);

  const variants = [
    topic,
    `${topic.replace(/\?$/, "")} Use examples from ${v.place}s or your own experience.`,
    topic.includes("Discuss")
      ? topic
      : `${topic} Consider how this affects young people in particular.`,
  ];

  const prefix = module === "GENERAL" ? "GT" : "AC";

  return withDifficulty(
    {
      title: `IELTS ${prefix} WT2-${idx + 1}`,
      task: 2,
      taskPrompt: variants[idx % variants.length]!,
      wordLimit: 250,
      instructions: "Write at least 250 words. Give reasons and examples from your knowledge or experience.",
    },
    difficulty
  );
}

export function buildIeltsWritingSeeds(
  task: 1 | 2,
  count: number,
  startOffset = 0,
  module: IeltsModule = "ACADEMIC"
): IeltsWritingSeed[] {
  const seeds: IeltsWritingSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startOffset + i;
    if (task === 1) {
      seeds.push(
        module === "GENERAL" ? buildGeneralTask1Seed(idx) : buildAcademicTask1Seed(idx)
      );
    } else {
      seeds.push(buildTask2Seed(idx, module));
    }
  }
  return seeds;
}

export function getIeltsWritingBankSeeds(module: IeltsModule = "ACADEMIC"): IeltsWritingSeed[] {
  return [
    ...buildIeltsWritingSeeds(1, 50, 0, module),
    ...buildIeltsWritingSeeds(2, 50, 0, module),
  ];
}
