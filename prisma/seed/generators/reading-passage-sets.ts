import { ExamLevel } from "@prisma/client";
import type { McqSeed } from "../helpers";
import { buildVarContext, difficultyForIndex } from "./seed-vars";
import type { SeedDifficulty } from "../../../src/lib/exam/question-diversity";

export const READING_QUESTIONS_PER_SET = 5;

export const PASSAGE_WORD_TARGETS: Record<
  ExamLevel,
  { min: number; max: number }
> = {
  STARTERS: { min: 40, max: 75 },
  MOVERS: { min: 55, max: 95 },
  FLYERS: { min: 75, max: 115 },
  KET: { min: 90, max: 145 },
  PET: { min: 110, max: 185 },
  FCE: { min: 140, max: 240 },
};

type QuestionSeed = Omit<McqSeed, "passage" | "title">;

type PassageSetTemplate = (
  v: ReturnType<typeof buildVarContext>
) => {
  title: string;
  passage: string;
  questions: QuestionSeed[];
};

function q(
  question: string,
  options: [string, string, string, string],
  answer: string,
  difficulty?: SeedDifficulty
): QuestionSeed {
  return { question, options: [...options], answer, difficulty };
}

const STARTERS_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `${v.name}'s ${v.animal}`,
    passage: `This is ${v.name}. ${v.name} is ${v.age} years old and lives near the ${v.place}. ${v.name} has a ${v.color} ${v.animal} called Max. Every afternoon, ${v.name} plays in the garden with ${v.name2}. They run, draw pictures and read short books about ${v.topic}. On Saturday, ${v.name}'s family eats ${v.food} for lunch and visits the ${v.place2}. ${v.name} likes school because the teachers are kind.`,
    questions: [
      q(`How old is ${v.name}?`, [`${v.age - 1}`, `${v.age}`, `${v.age + 1}`, `${v.age + 2}`], `${v.age}`),
      q(`What colour is the ${v.animal}?`, [v.color, "grey", "black", "white"], v.color),
      q(`What is the ${v.animal}'s name?`, ["Sam", "Max", "Kim", "Ben"], "Max"),
      q(`Who plays with ${v.name}?`, [v.name2, "A teacher", "A doctor", "Nobody"], v.name2),
      q(`What do they eat on Saturday?`, [v.food, "Soup only", "Rice only", "Nothing"], v.food),
    ],
  }),
  (v) => ({
    title: `Class trip to the ${v.place}`,
    passage: `Today Class 2 went to the ${v.place}. The bus left school at ${v.time}. ${v.name} sat next to ${v.name2} and looked at animals and flowers. The teacher gave every child a ${v.color} hat because the sun was hot. They ate ${v.food} sandwiches for lunch and drank water. Before going home, the class took a photo near a big ${v.animal} statue. ${v.name} said it was the best day of the week.`,
    questions: [
      q(`Where did the class go?`, [`The ${v.place}`, "The beach", "Home", "A shop"], `The ${v.place}`),
      q(`When did the bus leave?`, [v.time, "At night", "Never", "Next week"], v.time),
      q(`Who sat next to ${v.name}?`, [v.name2, "The driver", "A baby", "Nobody"], v.name2),
      q(`What colour were the hats?`, [v.color, "Blue only", "Green only", "No hats"], v.color),
      q(`What did ${v.name} think about the trip?`, ["It was the best day", "It was boring", "It was scary", "It was too long"], "It was the best day"),
    ],
  }),
];

const MOVERS_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `${v.name}'s hobby`,
    passage: `${v.name} is ${v.age} and lives in a small town. Last month ${v.name} joined a ${v.topic} club at the ${v.place}. ${v.name} goes there every Tuesday and Thursday after school. ${v.name2} is the club leader and helps beginners learn new skills. Last week the group made posters about ${v.topic2} and put them on the wall. ${v.name} wants to enter a city competition in May. ${v.name}'s parents are proud because ${v.name} works hard and never misses a lesson.`,
    questions: [
      q(`What club did ${v.name} join?`, [`A ${v.topic} club`, "A cooking club only", "A dance club only", "No club"], `A ${v.topic} club`),
      q(`When does ${v.name} go to the club?`, ["Every Tuesday and Thursday", "Only on Sundays", "Every morning", "Never"], "Every Tuesday and Thursday"),
      q(`Who leads the club?`, [v.name2, v.name, "A doctor", "A bus driver"], v.name2),
      q(`What did the group make last week?`, [`Posters about ${v.topic2}`, "A film", "A cake", "A robot"], `Posters about ${v.topic2}`),
      q(`How do ${v.name}'s parents feel?`, ["Proud", "Angry", "Worried", "Bored"], "Proud"),
    ],
  }),
  (v) => ({
    title: `Holiday at the ${v.place2}`,
    passage: `During the summer holidays, ${v.name}'s family spent five days at the ${v.place2}. They stayed in a small hotel near the ${v.place}. Every morning they walked along the path and bought fresh ${v.food} from a market. ${v.name} and ${v.name2} learned to ride bikes and visited a museum about ${v.topic}. On the last evening they watched the sunset and took many photos. ${v.name} wrote a diary entry and showed it to the teacher after the break.`,
    questions: [
      q(`How long was the holiday?`, ["Three days", "Five days", "Ten days", "One day"], "Five days"),
      q(`Where did they stay?`, [`Near the ${v.place}`, "At the airport", "At school", "On a boat"], `Near the ${v.place}`),
      q(`What did they buy at the market?`, [`Fresh ${v.food}`, "Toys only", "Shoes", "Books only"], `Fresh ${v.food}`),
      q(`What did they visit?`, [`A museum about ${v.topic}`, "A factory", "A farm only", "Nothing"], `A museum about ${v.topic}`),
      q(`What did ${v.name} write?`, ["A diary entry", "A song", "A letter to the mayor", "An email to a newspaper"], "A diary entry"),
    ],
  }),
];

const FLYERS_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `School ${v.topic} project`,
    passage: `${v.name}, who is ${v.age}, started a ${v.topic} project with classmates at the ${v.place}. Although the team had little experience, they collected information from the library and interviewed visitors at the ${v.place2}. ${v.name2} designed a website while ${v.name} wrote reports and prepared a presentation. Their teacher said the project showed excellent teamwork. The head teacher invited them to present their findings at a regional event next month. ${v.name} hopes the talk will encourage other students to learn about ${v.topic2}.`,
    questions: [
      q(`What was the project about?`, [v.topic, v.food, v.animal, "Transport only"], v.topic),
      q(`Where did they interview people?`, [`The ${v.place2}`, "A stadium", "An airport", "A factory"], `The ${v.place2}`),
      q(`What did ${v.name2} design?`, ["A website", "A uniform", "A bus timetable", "A cake"], "A website"),
      q(`Who invited them to present?`, ["The head teacher", "A journalist", "A doctor", "A shop owner"], "The head teacher"),
      q(`What does ${v.name} hope?`, [`To encourage students to learn about ${v.topic2}`, "To stop studying", "To travel abroad", "To sell products"], `To encourage students to learn about ${v.topic2}`),
    ],
  }),
];

const KET_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `${v.topic} club notice`,
    passage: `${v.name}'s school is starting a ${v.topic} club for students aged ${v.age} to sixteen. Meetings will take place in Room 8 at the ${v.place} every Wednesday from ${v.time} until five o'clock. ${v.name2}, who won a local prize last year, will help beginners learn basic skills step by step. Members should bring a notebook, a pencil and comfortable clothes for the practical activity. The first session includes a short talk about ${v.topic2} and a walk around the school garden to collect examples. Parents can collect application forms from the school office or download them from the website before Friday. Late applications may be accepted if places remain.`,
    questions: [
      q(`What is the notice about?`, [`A ${v.topic} club`, "A holiday trip", "A exam result", "A canteen menu"], `A ${v.topic} club`),
      q(`When do meetings happen?`, ["Every Wednesday", "Every Monday", "Only in holidays", "Never"], "Every Wednesday"),
      q(`Who will help beginners?`, [v.name2, v.name, "A doctor", "Nobody"], v.name2),
      q(`What should members bring?`, ["A notebook", "A laptop only", "Sports shoes only", "Money"], "A notebook"),
      q(`How can parents get forms?`, ["From the office or website", "Only by phone", "At the cinema", "They cannot"], "From the office or website"),
    ],
  }),
  (v) => ({
    title: `Email from ${v.name2}`,
    passage: `Hi ${v.name}, Thanks for your message about the ${v.topic} trip to the ${v.place2}. I checked the timetable and we can meet at the ${v.place} entrance at ${v.time} on Saturday. Please bring a raincoat because the forecast says it might shower in the afternoon. We should also pack sandwiches, fruit and a bottle of water for the walk between buildings. If you can't come, tell me by Thursday so I can inform the guide and rearrange the tickets. I'm looking forward to seeing the exhibition about ${v.topic2} and taking notes for our project. Best wishes, ${v.name2}`,
    questions: [
      q(`What is the email mainly about?`, [`A ${v.topic} trip`, "A birthday party", "A new job", "A hospital visit"], `A ${v.topic} trip`),
      q(`Where will they meet?`, [`The ${v.place} entrance`, "At school only", "At the airport", "Online"], `The ${v.place} entrance`),
      q(`Why should ${v.name} bring a raincoat?`, ["It might rain", "It will snow", "The museum is cold", "It is a rule for concerts"], "It might rain"),
      q(`When must ${v.name} reply if unable to come?`, ["By Thursday", "On Saturday", "Next month", "Never"], "By Thursday"),
      q(`What exhibition do they want to see?`, [`About ${v.topic2}`, "About cars only", "About food only", "About sports only"], `About ${v.topic2}`),
    ],
  }),
  (v) => ({
    title: `Weekend at the ${v.place2}`,
    passage: `Last weekend ${v.name} and ${v.name2} visited the ${v.place2} to learn more about ${v.topic}. They arrived at ${v.time} and watched a short film in the information centre. After that they walked through the ${v.place} and completed a worksheet with ten questions. ${v.name} bought a postcard and a small book about ${v.topic2} in the shop. On the bus home they compared answers and agreed the trip was useful for their school project. Their teacher asked them to write a paragraph before Monday's lesson.`,
    questions: [
      q(`Where did they go?`, [`The ${v.place2}`, "The airport", "A stadium", "Home"], `The ${v.place2}`),
      q(`What did they watch first?`, ["A short film", "A football match", "A concert", "Nothing"], "A short film"),
      q(`What did ${v.name} buy?`, ["A postcard and a book", "A bike", "A uniform", "Food only"], "A postcard and a book"),
      q(`What was the book about?`, [v.topic2, v.food, v.animal, "Cars only"], v.topic2),
      q(`What must they do before Monday?`, ["Write a paragraph", "Pay a fine", "Skip school", "Nothing"], "Write a paragraph"),
    ],
  }),
  (v) => ({
    title: `${v.name}'s part-time job`,
    passage: `${v.name}, who is ${v.age}, works part-time at a ${v.color} kiosk near the ${v.place}. Every Saturday ${v.name} sells snacks, guides visitors and restocks shelves before ${v.time}. The manager, ${v.name2}, says ${v.name} is reliable and polite to customers. Last month ${v.name} saved enough money to buy books about ${v.topic} and ${v.topic2}. ${v.name} hopes the experience will help when applying for college courses next year. Staff must wear a name badge and arrive ten minutes early for each shift.`,
    questions: [
      q(`Where does ${v.name} work?`, [`Near the ${v.place}`, "At the airport", "At home", "On a farm"], `Near the ${v.place}`),
      q(`When does ${v.name} work?`, ["Every Saturday", "Every weekday", "Never", "Only in summer"], "Every Saturday"),
      q(`What does the manager think?`, [`${v.name} is reliable`, `${v.name} is lazy`, "Customers are rude", "The kiosk should close"], `${v.name} is reliable`),
      q(`What did ${v.name} buy last month?`, [`Books about ${v.topic}`, "A car", "A phone", "Clothes only"], `Books about ${v.topic}`),
      q(`What must staff do?`, ["Wear a name badge", "Cook meals", "Drive buses", "Pay visitors"], "Wear a name badge"),
    ],
  }),
];

const PET_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `Opinion — ${v.topic}`,
    passage: `In a recent column for the school magazine, ${v.name} argued that teenagers should spend more time on ${v.topic} instead of endless scrolling on social media. ${v.name} explained that joining activities at the ${v.place} helped build confidence, teamwork and friendships outside the classroom. However, some parents worry that students already have too much homework and little energy left in the evening. ${v.name2}, a youth worker, believes schools should offer flexible clubs after ${v.time} so pupils can balance study and hobbies without feeling stressed. A local survey showed that sixty percent of students want more practical workshops about ${v.topic2}, while twenty percent preferred online courses. The editor invited readers to send responses before the end of the month.`,
    questions: [
      q(`What is ${v.name}'s main argument?`, [`Teenagers should focus more on ${v.topic}`, "Homework should be banned", "Social media is always good", "Clubs should close"], `Teenagers should focus more on ${v.topic}`),
      q(`What benefit does ${v.name} mention?`, ["Confidence and friendships", "Higher phone bills", "Longer bus rides", "Less sleep"], "Confidence and friendships"),
      q(`What do some parents worry about?`, ["Too much homework", "Too many holidays", "Too much sport", "Too many books"], "Too much homework"),
      q(`What did the survey show?`, ["60% want more workshops", "Nobody likes clubs", "All students hate homework", "Teachers refuse to help"], "60% want more workshops"),
      q(`What are readers invited to do?`, ["Send responses", "Pay a fee", "Leave school", "Buy a magazine"], "Send responses"),
    ],
  }),
  (v) => ({
    title: `Interview — ${v.name2}`,
    passage: `${v.name2} has volunteered at the ${v.place} for three years, teaching ${v.topic} to primary pupils after school. In an interview, ${v.name2} explained that the most challenging part is preparing materials that suit different ages, not speaking in public. ${v.name} attended one of the sessions and said the activities helped younger children understand ${v.topic2} through games, short stories and simple experiments. The project receives a small grant from the town council, but organisers still need more helpers for the summer programme and weekend events. Parents are invited to observe a class before enrolling their children. ${v.name2} encourages students who enjoy ${v.topic} to contact the centre before May.`,
    questions: [
      q(`How long has ${v.name2} volunteered?`, ["Three years", "Three months", "One week", "Ten years"], "Three years"),
      q(`What is the hardest part?`, ["Preparing materials", "Speaking in public", "Finding pupils", "Cooking"], "Preparing materials"),
      q(`Who attended a session?`, [v.name, v.name2, "A mayor", "Nobody"], v.name),
      q(`Who provides a grant?`, ["The town council", "A supermarket", "A film company", "Nobody"], "The town council"),
      q(`When should helpers contact the centre?`, ["Before May", "After December", "Never", "Every day"], "Before May"),
    ],
  }),
];

const FCE_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `${v.topic} initiative`,
    passage: `A pilot programme promoting ${v.topic} has been launched in several districts after researchers at the ${v.place2} published a detailed report. The study, which surveyed more than two thousand residents through interviews and online forms, found that small changes in daily habits could significantly reduce waste linked to ${v.topic2}. ${v.name}, the lead author, cautioned that long-term success depends on cooperation between local businesses, schools and transport providers rather than short publicity campaigns alone. Critics claim the initiative is underfunded, yet early results from the ${v.place} suggest higher participation than expected among younger households. Community leaders have agreed to share data openly so independent analysts can verify the trends. Officials now plan to expand workshops, translate materials into three languages and monitor progress over eighteen months before deciding on national rollout.`,
    questions: [
      q(`What has been launched?`, [`A ${v.topic} programme`, "A new airport", "A fashion show", "A phone app only"], `A ${v.topic} programme`),
      q(`How many residents were surveyed?`, ["More than 2000", "About 100", "Fewer than 50", "Exactly 500"], "More than 2000"),
      q(`What does ${v.name} say is necessary?`, ["Cooperation between groups", "Higher taxes only", "Closing all schools", "Banning travel"], "Cooperation between groups"),
      q(`What do critics claim?`, ["The initiative is underfunded", "It is too expensive to measure", "Nobody attended", "It already failed"], "The initiative is underfunded"),
      q(`What will officials do next?`, ["Expand workshops and monitor progress", "Cancel the project", "Sell the report", "Stop translations"], "Expand workshops and monitor progress"),
    ],
  }),
  (v) => ({
    title: `Review — ${v.topic} biography`,
    passage: `This newly published biography of a pioneer in ${v.topic} has received widespread attention from critics and general readers alike. The author, ${v.name2}, spent four years interviewing colleagues and examining archives in ${v.place2} before completing the manuscript. Reviewers praise the chapters that describe early experiments, though a few note that the final section on ${v.topic2} feels rushed and would benefit from clearer dates. ${v.name}, writing in a national newspaper, argues the book succeeds because it connects scientific discovery with ordinary human motivation rather than presenting dry lists of facts. Several book clubs have already chosen it for discussion, and teachers report that excerpts work well in advanced classes. The publisher plans a paperback edition and a series of public talks if sales remain strong through autumn.`,
    questions: [
      q(`What kind of book is reviewed?`, [`A biography about ${v.topic}`, "A cookbook", "A travel guide", "A comic"], `A biography about ${v.topic}`),
      q(`How long did research take?`, ["Four years", "Four months", "One week", "Twenty years"], "Four years"),
      q(`What do reviewers praise?`, ["Early experiment chapters", "The cover only", "The price", "The index"], "Early experiment chapters"),
      q(`What weakness is mentioned?`, [`The section on ${v.topic2} feels rushed`, "It is too short to open", "It has no photos", "It is a novel"], `The section on ${v.topic2} feels rushed`),
      q(`What might the publisher arrange?`, ["Public talks", "Free flights", "A film premiere", "School closures"], "Public talks"),
    ],
  }),
];

const TEMPLATES_BY_LEVEL: Record<ExamLevel, PassageSetTemplate[]> = {
  STARTERS: STARTERS_TEMPLATES,
  MOVERS: [...STARTERS_TEMPLATES, ...MOVERS_TEMPLATES],
  FLYERS: [...MOVERS_TEMPLATES, ...FLYERS_TEMPLATES],
  KET: KET_TEMPLATES,
  PET: PET_TEMPLATES,
  FCE: FCE_TEMPLATES,
};

function flattenSet(
  set: ReturnType<PassageSetTemplate>,
  difficulty: SeedDifficulty
): McqSeed[] {
  return set.questions.map((item) => ({
    title: set.title,
    passage: set.passage,
    question: item.question,
    options: item.options,
    answer: item.answer,
    difficulty: item.difficulty ?? difficulty,
  }));
}

export function buildReadingPassageSet(
  level: ExamLevel,
  setIndex: number
): McqSeed[] {
  const templates = TEMPLATES_BY_LEVEL[level] ?? KET_TEMPLATES;
  const template = templates[setIndex % templates.length]!;
  const difficulty = difficultyForIndex(setIndex, setIndex % templates.length);
  const v = buildVarContext(setIndex, difficulty, setIndex % templates.length);
  return flattenSet(template(v), difficulty);
}

export function buildReadingPassageSetQuestions(
  level: ExamLevel,
  count: number,
  startSetIndex = 0
): McqSeed[] {
  const items: McqSeed[] = [];
  let setIdx = startSetIndex;
  while (items.length < count) {
    const set = buildReadingPassageSet(level, setIdx++);
    for (const q of set) {
      items.push(q);
      if (items.length >= count) break;
    }
  }
  return items;
}

/** Bổ sung câu cho đoạn curated còn ngắn — giữ nguyên nghĩa gốc. */
const CURATED_APPEND: Partial<Record<ExamLevel, string[]>> = {
  STARTERS: [
    "The children listened carefully and answered questions together in class.",
    "Their teacher smiled and said they did very good work today.",
  ],
  MOVERS: [
    "The students discussed the topic in pairs and wrote notes in their exercise books.",
    "Before they left, the teacher reminded them about next week's homework.",
  ],
  FLYERS: [
    "Several classmates asked questions and the teacher explained the ideas clearly.",
    "At the end of the lesson, everyone agreed the activity was useful and interesting.",
  ],
  KET: [
    "After reading the text, students compared answers and checked the details carefully.",
    "The teacher suggested making a short summary to remember the main points.",
    "Everyone agreed that the topic was useful for their next writing task.",
  ],
  PET: [
    "Researchers noted that further study would be needed to confirm the long-term effects.",
    "Several commentators argued that communities must work together to address the issue.",
    "Readers are encouraged to reflect on how the ideas might apply to their own town.",
  ],
  FCE: [
    "Analysts stressed that policy makers should consider both economic and social consequences.",
    "The findings have prompted debate among experts about how best to implement change nationwide.",
    "Observers warn that ignoring local context could limit the value of any future legislation.",
  ],
};

export function enrichReadingPassage(level: ExamLevel, passage: string): string {
  const target = PASSAGE_WORD_TARGETS[level].min;
  const extras = CURATED_APPEND[level] ?? CURATED_APPEND.KET!;
  let result = passage.trim();
  let i = 0;
  while (result.split(/\s+/).filter(Boolean).length < target && i < extras.length) {
    result += ` ${extras[i++]}`;
  }
  return result.trim();
}

export function enrichCuratedReading(level: ExamLevel, items: McqSeed[]): McqSeed[] {
  const byTitle = new Map<string, McqSeed[]>();
  for (const item of items) {
    const key = item.title;
    const list = byTitle.get(key) ?? [];
    list.push(item);
    byTitle.set(key, list);
  }

  return items.map((item) => {
    const group = byTitle.get(item.title) ?? [item];
    const sharedPassage = group[0]?.passage ?? item.passage ?? "";
    const enriched = sharedPassage ? enrichReadingPassage(level, sharedPassage) : sharedPassage;
    return { ...item, passage: enriched };
  });
}
