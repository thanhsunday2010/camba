import { ExamLevel, Skill } from "@prisma/client";
import type { ListeningSeed, McqSeed, SpeakingSeed, WritingSeed } from "./helpers";
import { PLACEMENT_TITLE_PREFIX } from "../../src/lib/placement/paper-titles";
import type { PlacementSectionDef, PlacementTestContent } from "./placement-content";
import {
  IELTS_FULL,
  IELTS_SHORT,
  ieltsDescription,
  ieltsSectionOrder,
  ieltsTotalSeconds,
  type IeltsFormat,
} from "../../src/lib/placement/ielts-formats";

function mcq(
  title: string,
  question: string,
  options: string[],
  answer: string,
  passage?: string
): McqSeed {
  return { title, question, options, answer, passage };
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

const LISTENING_PARTS = [
  {
    name: "Section 1",
    context: "everyday conversation",
    topics: [
      "hotel booking",
      "car rental",
      "language course registration",
      "gym membership",
    ],
  },
  {
    name: "Section 2",
    context: "monologue in a social context",
    topics: [
      "museum tour",
      "community centre activities",
      "local festival",
      "public library services",
    ],
  },
  {
    name: "Section 3",
    context: "conversation in an educational context",
    topics: [
      "group project on climate",
      "presentation preparation",
      "field trip planning",
      "research methods tutorial",
    ],
  },
  {
    name: "Section 4",
    context: "academic lecture",
    topics: [
      "urban beekeeping",
      "memory and learning",
      "renewable energy storage",
      "ancient trade routes",
    ],
  },
];

function buildIeltsListening(count: number, prefix: string): ListeningSeed[] {
  const perPart = count / 4;
  const items: ListeningSeed[] = [];
  let n = 0;

  for (let p = 0; p < 4; p++) {
    const part = LISTENING_PARTS[p];
    for (let i = 0; i < perPart; i++) {
      n++;
      const topic = part.topics[i % part.topics.length];
      const qNum = n;
      if (p === 0) {
        items.push(
          listen(
            `${prefix} L${qNum}`,
            `Receptionist: Good morning. How can I help you? Caller: I'd like to enquire about ${topic}. Receptionist: Certainly. The fee is forty-five pounds per week and the course starts on Monday.`,
            `What is the conversation mainly about?`,
            ["a job interview", `a ${topic}`, "a medical appointment", "a flight delay"],
            `a ${topic}`
          )
        );
      } else if (p === 1) {
        items.push(
          listen(
            `${prefix} L${qNum}`,
            `Guide: Welcome to our ${topic}. Please note that photography is not allowed in the main hall. Tours run every hour from ten a.m.`,
            `What are visitors NOT allowed to do?`,
            ["take photos in the main hall", "ask questions", "buy tickets", "leave early"],
            "take photos in the main hall"
          )
        );
      } else if (p === 2) {
        items.push(
          listen(
            `${prefix} L${qNum}`,
            `Student A: We need to finish the ${topic} by Friday. Student B: I'll write the introduction if you find the sources.`,
            `What does Student B agree to do?`,
            ["write the introduction", "cancel the project", "book the room", "mark the essays"],
            "write the introduction"
          )
        );
      } else {
        items.push(
          listen(
            `${prefix} L${qNum}`,
            `Lecturer: Today we'll examine ${topic}. Research shows that public awareness has increased significantly over the last decade.`,
            `What has increased according to the lecturer?`,
            ["public awareness", "ticket prices", "unemployment", "rainfall"],
            "public awareness"
          )
        );
      }
    }
  }
  return items;
}

const ACADEMIC_PASSAGES = [
  {
    title: "The science of sleep",
    text: "Scientists have found that adults need between seven and nine hours of sleep. During deep sleep, the brain consolidates memories and repairs tissue. Shift workers often report poorer concentration.",
  },
  {
    title: "Urban green roofs",
    text: "Green roofs reduce city heat and absorb rainwater. Several European cities now offer tax incentives for buildings that install them. Maintenance costs remain a concern for older structures.",
  },
  {
    title: "Early printing technology",
    text: "The printing press spread across Europe within fifty years of its invention. Books became cheaper, literacy rates rose, and universities expanded their libraries rapidly.",
  },
  {
    title: "Marine plastic research",
    text: "Microplastics have been detected in deep ocean trenches. Researchers warn that the food chain may be affected, though the full impact on human health is still being studied.",
  },
];

const GT_PASSAGES = [
  {
    title: "Staff notice — flexible working",
    text: "From next month, staff may work from home up to two days per week. Please submit requests through the HR portal by the fifteenth. Managers must approve all arrangements.",
  },
  {
    title: "Community college — evening courses",
    text: "New evening classes include photography, business English and IT skills. Registration opens on 3 September. Fees are reduced for local residents who bring proof of address.",
  },
  {
    title: "Travel insurance leaflet",
    text: "This policy covers medical emergencies and lost luggage up to two thousand pounds. Adventure sports require an additional premium. Claims must be submitted within thirty days.",
  },
  {
    title: "Housing association newsletter",
    text: "The annual residents' meeting will be held in the community hall on 12 May at 6 p.m. Agenda items include parking, recycling bins and playground repairs.",
  },
];

function buildIeltsReading(count: number, prefix: string, gt: boolean): McqSeed[] {
  const pool = gt ? GT_PASSAGES : ACADEMIC_PASSAGES;
  const perPassage = Math.ceil(count / 3);
  const items: McqSeed[] = [];
  let n = 0;

  for (let p = 0; p < 3; p++) {
    const passage = pool[p % pool.length];
    for (let i = 0; i < perPassage && n < count; i++) {
      n++;
      const qTypes = gt
        ? [
            {
              q: "What is the text mainly about?",
              opts: [passage.title, "a sports event", "a recipe book", "a film review"],
              a: passage.title,
            },
            {
              q: "Who is the intended audience?",
              opts: ["general staff or public", "children only", "medical specialists", "tour guides"],
              a: "general staff or public",
            },
          ]
        : [
            {
              q: "What is the passage mainly concerned with?",
              opts: [passage.title, "holiday travel tips", "cooking methods", "sports results"],
              a: passage.title,
            },
            {
              q: "The passage suggests that research in this area is:",
              opts: ["ongoing or significant", "finished and ignored", "illegal", "unrelated to science"],
              a: "ongoing or significant",
            },
          ];
      const pick = qTypes[i % qTypes.length];
      items.push(
        mcq(`${prefix} R${n}`, pick.q, pick.opts, pick.a, passage.text)
      );
    }
  }
  return items.slice(0, count);
}

function buildIeltsWriting(gt: boolean, format: IeltsFormat, prefix: string): WritingSeed[] {
  const task2: WritingSeed = {
    title: `${prefix} W2`,
    taskPrompt: gt
      ? "Some people think that working from home is better for employees and employers. Others disagree. Discuss both views and give your own opinion."
      : "Some people believe technology has made life more complicated. To what extent do you agree or disagree?",
    wordLimit: 250,
    instructions:
      "Write at least 250 words. Give reasons and examples from your knowledge or experience.",
  };

  if (format.writingTasks === 1) {
    return [task2];
  }

  const task1: WritingSeed = gt
    ? {
        title: `${prefix} W1`,
        taskPrompt:
          "You recently attended a course and were dissatisfied with the facilities. Write a letter to the course organiser. In your letter: explain which course you took, describe the problems, and say what you would like them to do.",
        wordLimit: 150,
        instructions: "Write at least 150 words. You do NOT need to write any addresses.",
      }
    : {
        title: `${prefix} W1`,
        taskPrompt:
          "The chart below shows the percentage of households with internet access in three countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        wordLimit: 150,
        instructions:
          "Write at least 150 words. (Imagine a line chart showing rising internet use in Country A, B and C.)",
      };

  return [task1, task2];
}

function buildIeltsSpeaking(format: IeltsFormat, prefix: string): SpeakingSeed[] {
  const part2: SpeakingSeed = {
    title: `${prefix} SP2`,
    prompt:
      "Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how it would be useful to you.",
    preparationTime: 60,
    speakingTime: 120,
  };

  if (format.speakingParts === 1) {
    return [part2];
  }

  const part1: SpeakingSeed = {
    title: `${prefix} SP1`,
    prompt:
      "Let's talk about your daily routine. What time do you usually get up? What do you do in the evening? Is there anything you would like to change about your routine?",
    preparationTime: 15,
    speakingTime: 120,
  };

  return [part1, part2];
}

function makeIeltsTest(
  id: string,
  title: string,
  variantLabel: string,
  gt: boolean,
  format: IeltsFormat
): PlacementTestContent {
  const readingLabel = gt
    ? "Reading — General Training (3 sections)"
    : "Reading — Academic (3 passages)";
  const order = ieltsSectionOrder(format, readingLabel, gt);
  const sectionDefs: PlacementSectionDef[] = order.map((s) => ({
    skill:
      s.pool === "listening"
        ? Skill.LISTENING
        : s.pool === "reading"
          ? Skill.READING
          : s.pool === "writing"
            ? Skill.WRITING
            : Skill.SPEAKING,
    label: s.label,
    timeLimitSeconds: s.timeLimitSeconds,
    pool: s.pool,
  }));

  return {
    track: "IELTS",
    title,
    description: ieltsDescription(variantLabel, format),
    level: ExamLevel.FCE,
    reading: buildIeltsReading(format.readingQuestions, id, gt),
    listening: buildIeltsListening(format.listeningQuestions, id),
    grammar: [],
    writing: buildIeltsWriting(gt, format, id),
    speaking: buildIeltsSpeaking(format, id),
    sections: sectionDefs,
    totalTimeSeconds: ieltsTotalSeconds(format),
    sectionOrder: order.map((s) => ({
      pool: s.pool,
      label: s.label,
      timeLimitSeconds: s.timeLimitSeconds,
    })),
  };
}

export const IELTS_PLACEMENT_TITLES = {
  ACADEMIC_FULL: `${PLACEMENT_TITLE_PREFIX} IELTS Academic (Full)`,
  GT_FULL: `${PLACEMENT_TITLE_PREFIX} IELTS General Training (Full)`,
  ACADEMIC_SHORT: `${PLACEMENT_TITLE_PREFIX} IELTS Academic (Rút gọn)`,
  GT_SHORT: `${PLACEMENT_TITLE_PREFIX} IELTS General Training (Rút gọn)`,
} as const;

export function getIeltsPlacementTests(): PlacementTestContent[] {
  return [
    makeIeltsTest("IELTS-AF", IELTS_PLACEMENT_TITLES.ACADEMIC_FULL, "IELTS Academic Full", false, IELTS_FULL),
    makeIeltsTest("IELTS-GF", IELTS_PLACEMENT_TITLES.GT_FULL, "IELTS General Training Full", true, IELTS_FULL),
    makeIeltsTest("IELTS-AS", IELTS_PLACEMENT_TITLES.ACADEMIC_SHORT, "IELTS Academic Rút gọn", false, IELTS_SHORT),
    makeIeltsTest("IELTS-GS", IELTS_PLACEMENT_TITLES.GT_SHORT, "IELTS General Training Rút gọn", true, IELTS_SHORT),
  ];
}
