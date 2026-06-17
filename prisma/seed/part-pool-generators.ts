/**
 * Sinh câu Speaking/Writing theo Part Cambridge — đa dạng nội dung & độ khó.
 */
import { ExamLevel } from "@prisma/client";
import type { SpeakingSeed, WritingSeed } from "./helpers";
import { buildVarContext, difficultyForIndex } from "./generators/seed-vars";
import type { SeedDifficulty } from "../../src/lib/exam/question-diversity";
import type { CambridgeSpeakingPart } from "../../src/lib/exam/cambridge-speaking-config";
import type { CambridgeWritingPart } from "../../src/lib/exam/cambridge-writing-config";

type SpeakFn = (v: ReturnType<typeof buildVarContext>, tag: string) => SpeakingSeed;
type WriteFn = (v: ReturnType<typeof buildVarContext>, tag: string) => WritingSeed;

function title(tag: string, v: ReturnType<typeof buildVarContext>): string {
  return `${tag}-${v.idx + 1}`;
}

function withDifficulty<T extends { difficulty?: SeedDifficulty }>(
  item: T,
  difficulty: SeedDifficulty
): T {
  return { ...item, difficulty };
}

function buildFromSpeakTemplates(
  templates: SpeakFn[],
  tag: string,
  count: number,
  startOffset: number
): SpeakingSeed[] {
  if (templates.length === 0) return [];
  const items: SpeakingSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startOffset + i;
    const tIdx = idx % templates.length;
    const difficulty = difficultyForIndex(idx, tIdx);
    const v = buildVarContext(idx, difficulty, tIdx);
    items.push(withDifficulty(templates[tIdx]!(v, tag), difficulty));
  }
  return items;
}

function buildFromWriteTemplates(
  templates: WriteFn[],
  tag: string,
  count: number,
  startOffset: number
): WritingSeed[] {
  if (templates.length === 0) return [];
  const items: WritingSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startOffset + i;
    const tIdx = idx % templates.length;
    const difficulty = difficultyForIndex(idx, tIdx);
    const v = buildVarContext(idx, difficulty, tIdx);
    items.push(withDifficulty(templates[tIdx]!(v, tag), difficulty));
  }
  return items;
}

// ─── YLE Speaking ──────────────────────────────────────────────────────────

const YLE_SP1: SpeakFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    prompt: `What is your name? How old are you?`,
    preparationTime: 10,
    speakingTime: 30,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Tell me about your ${v.food}. Do you like it?`,
    preparationTime: 10,
    speakingTime: 30,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `What do you do at the ${v.place}?`,
    preparationTime: 10,
    speakingTime: 35,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Do you like ${v.topic}? Why or why not?`,
    preparationTime: 10,
    speakingTime: 35,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Tell me about your family. Who do you live with?`,
    preparationTime: 10,
    speakingTime: 35,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `What is your favourite ${v.color} thing? Why?`,
    preparationTime: 10,
    speakingTime: 30,
  }),
];

const YLE_SP2: SpeakFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Look at the picture. Describe your ${v.animal}. Say what colour it is and what it can do.`,
    preparationTime: 15,
    speakingTime: 45,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Look at the picture of the ${v.place}. Say what you can see and what people are doing.`,
    preparationTime: 15,
    speakingTime: 45,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Describe a picture of children playing ${v.topic}. Say where they are and how they feel.`,
    preparationTime: 15,
    speakingTime: 50,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Look at the picture. Tell me about ${v.name2}'s ${v.food}. What is on the table?`,
    preparationTime: 15,
    speakingTime: 45,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Describe a picture of a ${v.place2}. Say what the weather is like and what you would do there.`,
    preparationTime: 15,
    speakingTime: 50,
  }),
];

// ─── Standard Speaking (KET/PET/FCE) ───────────────────────────────────────

const STD_SP1: SpeakFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Tell me about your hometown. Where do you live and what do you like about it?`,
    preparationTime: 0,
    speakingTime: 45,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Do you enjoy ${v.topic}? How often do you do it and why?`,
    preparationTime: 0,
    speakingTime: 45,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Describe your favourite ${v.place}. Say where it is and how often you go there.`,
    preparationTime: 0,
    speakingTime: 45,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `What do you usually do at ${v.time} on weekdays?`,
    preparationTime: 0,
    speakingTime: 45,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Tell me about a meal you like (${v.food}). Who cooks it and when do you eat it?`,
    preparationTime: 0,
    speakingTime: 45,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Do you prefer studying ${v.topic2} alone or with friends? Why?`,
    preparationTime: 0,
    speakingTime: 45,
  }),
];

const STD_SP2: SpeakFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Describe a time you visited the ${v.place2}. You should say: where it is, when you went, what you did there, and explain why you remember it.`,
    preparationTime: 30,
    speakingTime: 90,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Talk about a hobby related to ${v.topic}. Say when you started, how often you do it, and why you enjoy it.`,
    preparationTime: 30,
    speakingTime: 90,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Describe a person you know who is good at ${v.topic2}. Say who they are, how you know them, and what they do.`,
    preparationTime: 30,
    speakingTime: 90,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Describe a photo of people doing ${v.topic} at the ${v.place}. Say what is happening and how the people feel.`,
    preparationTime: 30,
    speakingTime: 90,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Talk about a useful skill you learned. Say what the skill is, how you learned it, and how it helps you now.`,
    preparationTime: 30,
    speakingTime: 90,
  }),
];

const STD_SP3: SpeakFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Let's talk about ${v.topic}. How popular is it among young people in your country?`,
    preparationTime: 0,
    speakingTime: 60,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Do you think schools should teach more about ${v.topic2}? Why or why not?`,
    preparationTime: 0,
    speakingTime: 60,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `How has ${v.topic} changed in the last ten years?`,
    preparationTime: 0,
    speakingTime: 60,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Compare spending time at the ${v.place} and the ${v.place2}. Which do you prefer and why?`,
    preparationTime: 0,
    speakingTime: 60,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `What could governments do to encourage more people to learn about ${v.topic2}?`,
    preparationTime: 0,
    speakingTime: 60,
  }),
  (v, tag) => ({
    title: title(tag, v),
    prompt: `Discuss whether technology helps or harms learning ${v.topic}. Give examples.`,
    preparationTime: 0,
    speakingTime: 60,
  }),
];

// ─── Writing by part ───────────────────────────────────────────────────────

const YLE_W1: WriteFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write about your ${v.animal}. Say what it looks like and what it likes to do.`,
    wordLimit: 30,
    instructions: "Write 3–5 sentences in English.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write about a day at the ${v.place}. Say who you go with and what you do.`,
    wordLimit: 35,
    instructions: "Write 3–5 sentences.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Your friend ${v.name2} wants to know about ${v.topic}. Write a short message.`,
    wordLimit: 30,
    instructions: "Write 3–5 sentences.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Describe your favourite ${v.food}. Say when you eat it and why you like it.`,
    wordLimit: 35,
    instructions: "Write 3–5 sentences.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write about ${v.topic2}. Say what you learn and who helps you.`,
    wordLimit: 40,
    instructions: "Write 4–6 sentences.",
  }),
];

const KET_W1: WriteFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Your English friend ${v.name2} wants to know about your favourite ${v.place}. Write an email. Say where it is, what you do there, and why you like it.`,
    wordLimit: 50,
    instructions: "Write 25–35 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `You saw a notice about a ${v.topic} club at school. Write a message to ${v.name2}. Say why you are interested and ask for details.`,
    wordLimit: 50,
    instructions: "Write 25–35 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `${v.name2} is visiting your town. Write an email inviting them to the ${v.place2}. Say when and what you can do together.`,
    wordLimit: 50,
    instructions: "Write 25–35 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write a message to a friend about a ${v.topic} competition you joined. Say what happened and if you enjoyed it.`,
    wordLimit: 55,
    instructions: "Write 25–35 words.",
  }),
];

const KET_W2: WriteFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Your teacher wants you to describe a photo of people doing ${v.topic2}. Write what you see and how they feel.`,
    wordLimit: 55,
    instructions: "Write 35–45 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Look at the picture of the ${v.place}. Write a story about what happened there last ${v.time}.`,
    wordLimit: 60,
    instructions: "Write 35–45 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write about a day when you and ${v.name2} visited the ${v.place2}. Describe what you did and how you felt.`,
    wordLimit: 55,
    instructions: "Write 35–45 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Describe a picture of children learning about ${v.topic}. Say where they are and what they are doing.`,
    wordLimit: 55,
    instructions: "Write 35–45 words.",
  }),
];

const PET_W1: WriteFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `You recently volunteered at the ${v.place}. Write an email to ${v.name2} describing what you did and what you learned.`,
    wordLimit: 100,
    instructions: "Write about 100 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write an email to your English friend about a ${v.topic} event at your school. Say what happened and invite them next time.`,
    wordLimit: 100,
    instructions: "Write about 100 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Reply to an invitation from ${v.name2} to join a ${v.topic2} workshop. Accept and ask two questions.`,
    wordLimit: 100,
    instructions: "Write about 100 words.",
  }),
];

const PET_W2: WriteFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `In your English class you have been talking about ${v.topic}. Write an article giving your opinion on whether students should spend more time on ${v.topic2}.`,
    wordLimit: 100,
    instructions: "Write about 100 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Your school magazine wants stories about useful apps. Write about an app that helps with ${v.topic}.`,
    wordLimit: 100,
    instructions: "Write about 100 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write a review of a film or book about ${v.topic2}. Say what you liked and who you would recommend it to.`,
    wordLimit: 100,
    instructions: "Write about 100 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write a story that begins: "When I arrived at the ${v.place2}, I did not expect to see…"`,
    wordLimit: 100,
    instructions: "Write about 100 words.",
  }),
];

const FCE_W1: WriteFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write a formal letter applying to join a summer programme focused on ${v.topic2} at ${v.place2}. Explain your experience and goals.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write an email to a colleague proposing a team project about ${v.topic}. Explain the idea and suggest next steps.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write a report for your manager evaluating a recent ${v.topic} training session. Include strengths and recommendations.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
];

const FCE_W2: WriteFn[] = [
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Your teacher has asked you to write an essay discussing the advantages and disadvantages of promoting ${v.topic} in schools.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `A magazine is running a competition for the best article about how ${v.topic2} affects life in modern ${v.place}s. Write your entry.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write an essay: "Some people believe ${v.topic} is essential for young people. Others disagree." Discuss both views and give your opinion.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write a review of a documentary about ${v.topic2}. Say what you learned and whether you would recommend it.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
];

const YLE_LEVELS = new Set<ExamLevel>(["STARTERS", "MOVERS", "FLYERS"]);

function speakingTemplates(
  level: ExamLevel,
  part: CambridgeSpeakingPart
): SpeakFn[] {
  if (YLE_LEVELS.has(level)) {
    return part === 1 ? YLE_SP1 : YLE_SP2;
  }
  if (part === 1) return STD_SP1;
  if (part === 2) return STD_SP2;
  return STD_SP3;
}

function writingTemplates(
  level: ExamLevel,
  part: CambridgeWritingPart
): WriteFn[] {
  if (YLE_LEVELS.has(level)) return YLE_W1;
  if (level === "KET") return part === 1 ? KET_W1 : KET_W2;
  if (level === "PET") return part === 1 ? PET_W1 : PET_W2;
  if (level === "FCE") return part === 1 ? FCE_W1 : FCE_W2;
  return part === 1 ? KET_W1 : KET_W2;
}

export function buildSpeakingForPart(
  level: ExamLevel,
  part: CambridgeSpeakingPart,
  count: number,
  startOffset = 0
): SpeakingSeed[] {
  const tag = `${level}-SP${part}`;
  return buildFromSpeakTemplates(speakingTemplates(level, part), tag, count, startOffset);
}

export function buildWritingForPart(
  level: ExamLevel,
  part: CambridgeWritingPart,
  count: number,
  startOffset = 0
): WritingSeed[] {
  const tag = `${level}-WP${part}`;
  return buildFromWriteTemplates(writingTemplates(level, part), tag, count, startOffset);
}
