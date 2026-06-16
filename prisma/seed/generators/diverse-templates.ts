import { ExamLevel } from "@prisma/client";
import type { SeedDifficulty } from "../../../src/lib/exam/question-diversity";
import type { GapSeed, ListeningSeed, McqSeed, SpeakingSeed, WritingSeed } from "../helpers";
import { buildVarContext, difficultyForIndex, type VarContext } from "./seed-vars";

type McqBuilder = (v: VarContext, tag: string) => McqSeed;
type GapBuilder = (v: VarContext, tag: string) => GapSeed;
type ListenBuilder = (v: VarContext, tag: string) => ListeningSeed;
type WriteBuilder = (v: VarContext, tag: string) => WritingSeed;
type SpeakBuilder = (v: VarContext, tag: string) => SpeakingSeed;

function title(tag: string, v: VarContext): string {
  return `${tag}-${v.idx + 1}`;
}

function withDifficulty<T extends { difficulty?: SeedDifficulty }>(
  item: T,
  difficulty: SeedDifficulty
): T {
  return { ...item, difficulty };
}

// ─── YLE Reading ───────────────────────────────────────────────────────────

const YLE_READING: McqBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name} is ${v.age}. ${v.name} likes ${v.topic} at the ${v.place}.`,
    question: `How old is ${v.name}?`,
    options: [`${v.age - 1}`, `${v.age}`, `${v.age + 1}`, `${v.age + 2}`],
    answer: `${v.age}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Look at ${v.name}. ${v.name} has a ${v.color} ${v.animal}. It lives at home.`,
    question: `What colour is the ${v.animal}?`,
    options: [v.color, "grey", "pink", "gold"],
    answer: v.color,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Today ${v.name} eats ${v.food} for lunch. Then ${v.name} plays ${v.topic} with ${v.name2}.`,
    question: `What does ${v.name} eat?`,
    options: [v.food, "rice", "soup", "cake"],
    answer: v.food,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name} goes to the ${v.place} at ${v.time}. ${v.name2} waits outside.`,
    question: `Where does ${v.name} go?`,
    options: [`The ${v.place}`, "Home", "The beach", "A shop"],
    answer: `The ${v.place}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name} can draw a ${v.animal}. ${v.name} wants to learn about ${v.topic2}.`,
    question: `What can ${v.name} draw?`,
    options: [`A ${v.animal}`, "A car", "A house", "A tree"],
    answer: `A ${v.animal}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `On Saturday ${v.name} visits the ${v.place2}. ${v.name} reads a book about ${v.topic}.`,
    question: `When does ${v.name} visit the ${v.place2}?`,
    options: ["On Saturday", "On Monday", "At night", "Never"],
    answer: "On Saturday",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name2} gives ${v.name} a ${v.color} bag. Inside is a picture of ${v.topic}.`,
    question: `What colour is the bag?`,
    options: [v.color, "blue", "white", "black"],
    answer: v.color,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name} and ${v.name2} watch ${v.topic} on TV. They laugh a lot.`,
    question: `Who watches TV with ${v.name}?`,
    options: [v.name2, v.name, "A teacher", "Nobody"],
    answer: v.name2,
  }),
];

const MOVERS_READING: McqBuilder[] = [
  ...YLE_READING,
  (v, tag) => ({
    title: title(tag, v),
    passage: `Last week ${v.name} joined a ${v.topic} club at the ${v.place}. ${v.name} met ${v.name2} there and they became friends.`,
    question: `Where did ${v.name} meet ${v.name2}?`,
    options: [`At the ${v.place}`, "At home", "At the beach", "Online"],
    answer: `At the ${v.place}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name} is taller than ${v.name2}. They both enjoy ${v.topic} but ${v.name} prefers the ${v.place}.`,
    question: `Who is taller?`,
    options: [v.name, v.name2, "They are the same", "Their teacher"],
    answer: v.name,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `While ${v.name} was cooking ${v.food}, ${v.name2} called about the ${v.topic} competition at ${v.time}.`,
    question: `What was ${v.name} doing?`,
    options: [`Cooking ${v.food}`, "Sleeping", "Swimming", "Reading"],
    answer: `Cooking ${v.food}`,
  }),
];

const FLYERS_READING: McqBuilder[] = [
  ...MOVERS_READING,
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name} has studied ${v.topic} since 2022. Although the ${v.place} course was difficult, ${v.name} passed the exam last month.`,
    question: `When did ${v.name} pass the exam?`,
    options: ["Last month", "Last year", "Next week", "Never"],
    answer: "Last month",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `If ${v.name} saves enough money, ${v.name} will visit ${v.place2} to learn more about ${v.topic2}. ${v.name2} thinks it is a great idea.`,
    question: `Why will ${v.name} visit ${v.place2}?`,
    options: [`To learn about ${v.topic2}`, "To buy food", "To sleep", "To work"],
    answer: `To learn about ${v.topic2}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name} wrote the best essay about ${v.topic} in class. The teacher said it was better than ${v.name2}'s project on ${v.topic2}.`,
    question: `What was ${v.name}'s essay about?`,
    options: [v.topic, v.topic2, v.food, v.animal],
    answer: v.topic,
  }),
];

// ─── KET / PET / FCE Reading ───────────────────────────────────────────────

const KET_READING: McqBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name}, ${v.age}, started a ${v.topic} project at the local ${v.place}. Every ${v.time.slice(0, 2) === "1" ? "morning" : "afternoon"}, ${v.name} collects ideas from classmates.`,
    question: `What is ${v.name}'s project about?`,
    options: [v.topic, v.topic2, "Transport", "Weather only"],
    answer: v.topic,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Notice: The ${v.place} will close for ${v.topic} training on Friday. Visitors should use the ${v.place2} entrance until ${v.time}.`,
    question: `Why will the ${v.place} close?`,
    options: [`${v.topic} training`, "A holiday", "Repairs", "A concert"],
    answer: `${v.topic} training`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Email from ${v.name2}: Hi ${v.name}! Shall we meet at the ${v.place} to discuss ${v.topic}? I can bring notes about ${v.topic2}.`,
    question: `What does ${v.name2} offer to bring?`,
    options: [`Notes about ${v.topic2}`, "Food", "A ticket", "Nothing"],
    answer: `Notes about ${v.topic2}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name} prefers walking to the ${v.place} because the bus is slow. Yesterday ${v.name} saw a poster for a ${v.topic} event near the ${v.place2}.`,
    question: `How does ${v.name} usually travel?`,
    options: ["On foot", "By bus", "By train", "By car"],
    answer: "On foot",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Recipe: Mix ${v.food} with rice for a quick lunch. ${v.name} learned this during a ${v.topic} lesson at school.`,
    question: `Where did ${v.name} learn the recipe?`,
    options: ["At school", "At the cinema", "At the airport", "Online only"],
    answer: "At school",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Review: The new ${v.topic} museum opened in ${v.place2}. ${v.name} says tickets are cheap before ${v.time}.`,
    question: `When are tickets cheap?`,
    options: [`Before ${v.time}`, "After midnight", "On Sundays only", "Never"],
    answer: `Before ${v.time}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `${v.name} lost a ${v.color} phone at the ${v.place}. A staff member found it during a ${v.topic2} workshop.`,
    question: `What did ${v.name} lose?`,
    options: [`A ${v.color} phone`, "A bag", "A book", "A ticket"],
    answer: `A ${v.color} phone`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Sports news: ${v.name2} scored in the ${v.topic} match. Fans waiting at the ${v.place} cheered until ${v.time}.`,
    question: `Who scored in the match?`,
    options: [v.name2, v.name, "The coach", "Nobody"],
    answer: v.name2,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Travel blog: ${v.name} recommends the ${v.place2} for students interested in ${v.topic}. Hostels near the ${v.place} are quiet.`,
    question: `Who is the text for?`,
    options: ["Students", "Doctors", "Drivers only", "Children under five"],
    answer: "Students",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Message: ${v.name}, your ${v.topic} class moves to Room 5. Bring your ${v.food} snack if you stay after ${v.time}. — ${v.name2}`,
    question: `What should ${v.name} bring?`,
    options: [`A ${v.food} snack`, "A map", "A uniform", "Money"],
    answer: `A ${v.food} snack`,
  }),
];

const PET_READING: McqBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    passage: `Column by ${v.name}: Teenagers often debate ${v.topic} in online forums. While some teachers ban phones, ${v.name} argues that moderated discussion of ${v.topic2} builds critical thinking.`,
    question: `What is ${v.name}'s main point?`,
    options: [
      "Online debate can help thinking skills",
      "Phones should always be banned",
      "Teachers should not use forums",
      "Students should avoid English",
    ],
    answer: "Online debate can help thinking skills",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Interview: ${v.name2} volunteers at the ${v.place}, teaching ${v.topic} to primary pupils. ${v.name2} says the hardest part is preparing materials, not speaking in public.`,
    question: `What does ${v.name2} find most difficult?`,
    options: ["Preparing materials", "Speaking in public", "Finding pupils", "Cooking"],
    answer: "Preparing materials",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Advert: Join our ${v.topic} weekend at ${v.place2}. Sessions start at ${v.time}. Previous guest ${v.name} said it changed their career plans.`,
    question: `What does the advert promote?`,
    options: [`A ${v.topic} weekend`, "A bus tour", "A food festival", "A film premiere"],
    answer: `A ${v.topic} weekend`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Report: Local ${v.place} managers will reduce plastic after a ${v.topic2} survey. ${v.name}, a student rep, welcomed the plan but asked for clearer recycling labels.`,
    question: `What did ${v.name} request?`,
    options: ["Clearer recycling labels", "More plastic", "Higher prices", "Fewer surveys"],
    answer: "Clearer recycling labels",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Review of a biography about ${v.topic}: The author, ${v.name2}, explains how early failures led to success. Critics praise the chapter set in ${v.place2}.`,
    question: `What do critics like?`,
    options: [`The chapter set in ${v.place2}`, "The cover design", "The price", "The length"],
    answer: `The chapter set in ${v.place2}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Letter: Dear ${v.name}, Thanks for your article on ${v.topic}. Our club at the ${v.place} would love you to speak on ${v.topic2} next month. — ${v.name2}`,
    question: `Why did ${v.name2} write?`,
    options: [`To invite ${v.name} to speak`, "To sell tickets", "To complain", "To cancel an event"],
    answer: `To invite ${v.name} to speak`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `News: A ${v.topic} app designed by ${v.name} won a regional prize. Users say it saves time when planning trips to the ${v.place}.`,
    question: `What won a prize?`,
    options: [`A ${v.topic} app`, "A bus", "A cookbook", "A school"],
    answer: `A ${v.topic} app`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Opinion: ${v.name} believes homework about ${v.topic2} should be optional if students join ${v.topic} clubs. Parents at the ${v.place2} meeting disagreed loudly.`,
    question: `Who disagreed with ${v.name}?`,
    options: ["Some parents", "All teachers", "The mayor", "Nobody"],
    answer: "Some parents",
  }),
];

const FCE_READING: McqBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    passage: `Essay extract: Proponents of ${v.topic} initiatives cite evidence from ${v.place2}, where emissions fell after buses were rerouted. ${v.name}, an urban planner, cautions that data from one city rarely proves universal success.`,
    question: `What is ${v.name}'s warning?`,
    options: [
      "One city's results may not apply everywhere",
      "Buses should be banned",
      "Data is always unreliable",
      "Emissions cannot fall",
    ],
    answer: "One city's results may not apply everywhere",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Journal note: Longitudinal studies on ${v.topic2} suggest adolescents who attend workshops at the ${v.place} report higher confidence. Nevertheless, funding cuts threaten evening sessions after ${v.time}.`,
    question: `What threatens evening sessions?`,
    options: ["Funding cuts", "Low attendance", "Bad weather", "New laws"],
    answer: "Funding cuts",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Editorial: When ${v.name2} launched a ${v.topic} podcast, critics dismissed it as niche. Two years later, advertisers seek slots, proving demand for specialised content.`,
    question: `What changed over two years?`,
    options: ["Advertisers became interested", "The podcast closed", "Critics apologised", "Content became generic"],
    answer: "Advertisers became interested",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Case study: Migratory patterns near ${v.place2} altered after a ${v.topic} reserve expanded. Volunteers like ${v.name} document species recovery, though sceptics question methodology.`,
    question: `What do sceptics question?`,
    options: ["The methodology", "The reserve's size", "Volunteers' age", "The weather"],
    answer: "The methodology",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Speech excerpt: ${v.name} argues that ethical ${v.topic2} research requires transparent funding. Without disclosure, universities risk undermining public trust gained during the ${v.place} outreach programme.`,
    question: `What does ${v.name} emphasise?`,
    options: ["Transparent funding", "Higher fees", "Fewer programmes", "Shorter speeches"],
    answer: "Transparent funding",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Analysis: Digital archives of ${v.topic} manuscripts housed in ${v.place2} enable scholars to compare drafts. Yet copyright disputes delay online access for independent researchers.`,
    question: `What delays online access?`,
    options: ["Copyright disputes", "Power cuts", "Lost manuscripts", "Low interest"],
    answer: "Copyright disputes",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Report: Hybrid courses blending ${v.topic} theory with visits to the ${v.place} improved retention rates. ${v.name2}, however, notes that rural students faced connectivity barriers.`,
    question: `What problem did ${v.name2} identify?`,
    options: ["Connectivity barriers for rural students", "Too many visits", "High food costs", "Long essays"],
    answer: "Connectivity barriers for rural students",
  }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Commentary: Legislation on ${v.topic2} packaging shifted consumer habits faster than predicted. Manufacturers lobbying in ${v.place2} now seek phased compliance rather than immediate bans.`,
    question: `What do manufacturers want?`,
    options: ["Phased compliance", "Immediate bans", "No rules", "Higher taxes"],
    answer: "Phased compliance",
  }),
];

const READING_BY_LEVEL: Partial<Record<ExamLevel, McqBuilder[]>> = {
  STARTERS: YLE_READING,
  MOVERS: MOVERS_READING,
  FLYERS: FLYERS_READING,
  KET: KET_READING,
  PET: PET_READING,
  FCE: FCE_READING,
};

// ─── Listening ─────────────────────────────────────────────────────────────

const YLE_LISTENING: ListenBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Hello. I am ${v.name}. I am ${v.age}. I like ${v.topic}.`,
    question: `What does ${v.name} like?`,
    options: [v.topic, v.topic2, v.food, v.animal],
    answer: v.topic,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name} has a ${v.color} ${v.animal}. It is small and friendly.`,
    question: `What colour is the ${v.animal}?`,
    options: [v.color, "green", "black", "white"],
    answer: v.color,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `We go to the ${v.place} at ${v.time}. ${v.name2} comes too.`,
    question: `Where do they go?`,
    options: [`The ${v.place}`, "Home", "The zoo", "The beach"],
    answer: `The ${v.place}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `For lunch ${v.name} wants ${v.food}. ${v.name2} wants soup.`,
    question: `What does ${v.name} want?`,
    options: [v.food, "Soup", "Rice", "Fish"],
    answer: v.food,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Today we learn about ${v.topic2}. ${v.name} draws a picture.`,
    question: `What are they learning about?`,
    options: [v.topic2, v.topic, v.animal, v.place],
    answer: v.topic2,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name} plays ${v.topic} after school. ${v.name2} plays ${v.topic2}.`,
    question: `What does ${v.name} play?`,
    options: [v.topic, v.topic2, v.food, v.animal],
    answer: v.topic,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `The ${v.animal} is ${v.color}. ${v.name} saw it at the ${v.place2}.`,
    question: `Where did ${v.name} see the ${v.animal}?`,
    options: [`The ${v.place2}`, "Home", "School", "The beach"],
    answer: `The ${v.place2}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Teacher: Our ${v.topic} lesson is in the ${v.place}. Bring your book.`,
    question: `Which lesson is it?`,
    options: [`${v.topic}`, `${v.topic2}`, "Maths", "Art"],
    answer: `${v.topic}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name2} eats ${v.food} at ${v.time}. ${v.name} drinks water.`,
    question: `What does ${v.name2} eat?`,
    options: [v.food, "Water", "Soup", "Rice"],
    answer: v.food,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `We visit the ${v.place} to study ${v.topic2}. It opens at ${v.time}.`,
    question: `Why do they visit the ${v.place}?`,
    options: [`To study ${v.topic2}`, "To sleep", "To swim", "To cook"],
    answer: `To study ${v.topic2}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name} wears a ${v.color} hat. The hat is for the ${v.topic} party.`,
    question: `What colour is the hat?`,
    options: [v.color, "blue", "green", "yellow"],
    answer: v.color,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Look at the ${v.animal}. It likes ${v.food}. ${v.name2} feeds it.`,
    question: `What does the ${v.animal} like?`,
    options: [v.food, v.topic, v.place, v.time],
    answer: v.food,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name} reads about ${v.topic} on the bus to the ${v.place2}.`,
    question: `What does ${v.name} read about?`,
    options: [v.topic, v.topic2, v.animal, v.color],
    answer: v.topic,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Sport day: ${v.name2} runs fast. The race is about ${v.topic2} at the ${v.place}.`,
    question: `What is the race about?`,
    options: [v.topic2, v.topic, v.food, v.animal],
    answer: v.topic2,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Mum says: Clean your room before ${v.topic} class at ${v.time}.`,
    question: `What class is mentioned?`,
    options: [v.topic, v.topic2, "PE", "Music"],
    answer: v.topic,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name} and ${v.name2} build a model about ${v.topic2} in the ${v.place}.`,
    question: `What is the model about?`,
    options: [v.topic2, v.topic, v.food, v.color],
    answer: v.topic2,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `The shop sells ${v.food} near the ${v.place2}. ${v.name} buys one.`,
    question: `What does the shop sell?`,
    options: [v.food, v.animal, v.topic, v.color],
    answer: v.food,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Rain today. ${v.name} stays inside and paints ${v.topic}.`,
    question: `What does ${v.name} paint?`,
    options: [v.topic, v.topic2, v.place, v.time],
    answer: v.topic,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Grandma tells a story about ${v.topic2} and a ${v.color} ${v.animal}.`,
    question: `What is the story about?`,
    options: [v.topic2, v.topic, v.food, v.place],
    answer: v.topic2,
  }),
];

const KET_LISTENING: ListenBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Speaker: The ${v.topic} talk at the ${v.place} begins at ${v.time}. Please turn off your phone.`,
    question: `What time does the talk begin?`,
    options: [v.time, "8:00", "9:30", "12:00"],
    answer: v.time,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name}: I left my ${v.color} bag in the ${v.place2}. Has anyone seen it?`,
    question: `What did ${v.name} lose?`,
    options: [`A ${v.color} bag`, "A phone", "A ticket", "A book"],
    answer: `A ${v.color} bag`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Guide: Tickets for the ${v.topic2} show cost five pounds before ${v.time}. After that they are seven pounds.`,
    question: `When are tickets five pounds?`,
    options: [`Before ${v.time}`, "After midnight", "On Sunday", "Never"],
    answer: `Before ${v.time}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Radio: Traffic is slow near the ${v.place} because of a ${v.topic} parade. Drivers should use Park Road.`,
    question: `Why is traffic slow?`,
    options: [`A ${v.topic} parade`, "Snow", "A concert", "Road works only"],
    answer: `A ${v.topic} parade`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name2}: Hi ${v.name}, meet me at the ${v.place2} cafe to discuss ${v.topic}. I'll be there at ${v.time}.`,
    question: `Where will they meet?`,
    options: [`The ${v.place2} cafe`, "The station", "School", "Home"],
    answer: `The ${v.place2} cafe`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Coach: ${v.name}'s ${v.topic2} training is at the ${v.place2} on Mondays at ${v.time}.`,
    question: `When is training?`,
    options: ["On Mondays", "On Fridays", "At night", "Never"],
    answer: "On Mondays",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Shop assistant: The ${v.topic} books are next to the ${v.food} section, aisle four.`,
    question: `Where are the books?`,
    options: ["Aisle four", "Aisle one", "Outside", "Online only"],
    answer: "Aisle four",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Weather: Rain expected during the ${v.topic2} festival at the ${v.place}. Take an umbrella.`,
    question: `What should people take?`,
    options: ["An umbrella", "A tent", "Skis", "Nothing"],
    answer: "An umbrella",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name}: I couldn't finish the ${v.topic} homework because the ${v.place2} library closed early.`,
    question: `Why couldn't ${v.name} finish homework?`,
    options: ["The library closed early", "It was easy", "They were ill", "They forgot"],
    answer: "The library closed early",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Doctor: Eat more ${v.food} and join the ${v.topic2} walking group at the ${v.place}.`,
    question: `What food does the doctor mention?`,
    options: [v.food, "Candy", "Pizza only", "Nothing"],
    answer: v.food,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Tour guide: The ${v.topic} exhibition opens at ${v.time} in the ${v.place2} hall.`,
    question: `What opens at ${v.time}?`,
    options: [`The ${v.topic} exhibition`, "A cafe", "The car park", "A shop"],
    answer: `The ${v.topic} exhibition`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name2}: Can you bring the ${v.color} folder to the ${v.topic} meeting?`,
    question: `What colour is the folder?`,
    options: [v.color, "Red", "White", "Grey"],
    answer: v.color,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `News: A ${v.animal} was found safe near the ${v.place} after the ${v.topic2} fair.`,
    question: `What was found?`,
    options: [`A ${v.animal}`, "A bag", "A bike", "A phone"],
    answer: `A ${v.animal}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Reception: ${v.name}'s ${v.topic} appointment moved from the ${v.place} to the ${v.place2}.`,
    question: `What kind of appointment moved?`,
    options: [`${v.topic}`, `${v.topic2}`, "Dental", "Driving"],
    answer: `${v.topic}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Teacher: Submit your ${v.topic2} project online before ${v.time} on Friday.`,
    question: `When is the deadline?`,
    options: [`Before ${v.time} on Friday`, "On Monday", "Next month", "Never"],
    answer: `Before ${v.time} on Friday`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name}: I prefer the ${v.place2} cinema because they show ${v.topic} films every week.`,
    question: `What films does the cinema show?`,
    options: [`${v.topic} films`, "Only sports", "Nothing", "Old films only"],
    answer: `${v.topic} films`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Host: Tonight's quiz about ${v.topic2} starts at ${v.time}. Teams meet at the ${v.place}.`,
    question: `What is the quiz about?`,
    options: [v.topic2, v.topic, v.food, v.animal],
    answer: v.topic2,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Message: Bus 12 to the ${v.place2} is delayed because of ${v.topic} roadworks.`,
    question: `Why is the bus delayed?`,
    options: [`${v.topic} roadworks`, "Snow", "A strike", "A festival only"],
    answer: `${v.topic} roadworks`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name2}: I bought tickets for the ${v.topic} concert. It finishes at ${v.time}.`,
    question: `What did ${v.name2} buy tickets for?`,
    options: [`A ${v.topic} concert`, "A film", "A bus", "A meal"],
    answer: `A ${v.topic} concert`,
  }),
];

const PET_LISTENING: ListenBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Interviewer: Why did you choose ${v.topic}, ${v.name}? ${v.name}: I wanted practical skills for work at the ${v.place}.`,
    question: `Why did ${v.name} choose ${v.topic}?`,
    options: ["For practical work skills", "For holidays", "To meet friends", "To learn cooking"],
    answer: "For practical work skills",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Announcement: The ${v.topic2} workshop in Room 3 is cancelled. Registered students should join the session on ${v.topic} in the ${v.place2} instead.`,
    question: `What should students do?`,
    options: [`Join the ${v.topic} session`, "Go home", "Wait in Room 3", "Pay again"],
    answer: `Join the ${v.topic} session`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name2}: Our team won the ${v.topic} competition despite the rain. We practised every day after ${v.time}.`,
    question: `When did the team practise?`,
    options: [`Every day after ${v.time}`, "Only on Mondays", "At night", "Never"],
    answer: `Every day after ${v.time}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Podcast host: ${v.name} explains how volunteering with ${v.topic2} improved language confidence more than textbook exercises.`,
    question: `What improved ${v.name}'s confidence?`,
    options: [`Volunteering with ${v.topic2}`, "Textbook exercises only", "Watching TV", "Travelling alone"],
    answer: `Volunteering with ${v.topic2}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Manager: Staff attending the ${v.topic} course must register at the ${v.place2} before ${v.time}.`,
    question: `Where must staff register?`,
    options: [`The ${v.place2}`, "Online only", "At home", "Abroad"],
    answer: `The ${v.place2}`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name}: The ${v.topic2} documentary changed my view on life in the ${v.place}.`,
    question: `What changed ${v.name}'s view?`,
    options: [`A ${v.topic2} documentary`, "A game", "A meal", "A holiday only"],
    answer: `A ${v.topic2} documentary`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Radio host: Callers discuss whether ${v.topic} clubs should meet at the ${v.place} after ${v.time}.`,
    question: `What are callers discussing?`,
    options: [`Whether ${v.topic} clubs should meet`, "Ticket prices", "Food menus", "Bus routes only"],
    answer: `Whether ${v.topic} clubs should meet`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name2}: I failed the ${v.topic} test but passed ${v.topic2} because I revised daily.`,
    question: `Which subject did ${v.name2} pass?`,
    options: [v.topic2, v.topic, "None", "Both"],
    answer: v.topic2,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Guide: The ${v.place2} tour includes a workshop on ${v.topic} and free ${v.food} samples.`,
    question: `What food is offered?`,
    options: [v.food, "Soup only", "Nothing", "Drinks only"],
    answer: v.food,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Coach ${v.name}: Players need rest before the ${v.topic2} match at the ${v.place}.`,
    question: `What event is coming?`,
    options: [`A ${v.topic2} match`, "A concert", "An exam", "A holiday"],
    answer: `A ${v.topic2} match`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Customer: I'd like to return this ${v.color} jacket bought for the ${v.topic} trip.`,
    question: `Why was the jacket bought?`,
    options: [`For a ${v.topic} trip`, "For school", "For a wedding", "For sport only"],
    answer: `For a ${v.topic} trip`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Presenter: Our guest ${v.name2} researches ${v.topic} habits among teenagers near the ${v.place2}.`,
    question: `What does ${v.name2} research?`,
    options: [`${v.topic} habits`, "Ancient history", "Cooking", "Driving laws"],
    answer: `${v.topic} habits`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Notice: The ${v.topic2} lab at the ${v.place} closes for cleaning at ${v.time}.`,
    question: `Why does the lab close?`,
    options: ["For cleaning", "Forever", "For a party", "For holidays only"],
    answer: "For cleaning",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name}: Sharing ${v.topic} tips online helped me more than classes at the ${v.place2}.`,
    question: `What helped ${v.name} most?`,
    options: [`Sharing ${v.topic} tips online`, "Classes only", "Television", "Nothing"],
    answer: `Sharing ${v.topic} tips online`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Organiser: Volunteers for the ${v.topic} festival should meet ${v.name2} at the ${v.place} gate.`,
    question: `Who should volunteers meet?`,
    options: [v.name2, v.name, "Nobody", "A doctor"],
    answer: v.name2,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Review: The new ${v.topic2} café near the ${v.place2} opens earlier on days with ${v.topic} events.`,
    question: `When does the café open earlier?`,
    options: [`On days with ${v.topic} events`, "Never", "Only Sundays", "At midnight"],
    answer: `On days with ${v.topic} events`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Teacher: Your presentation on ${v.topic} must include examples from the ${v.place} visit.`,
    question: `What must the presentation include?`,
    options: [`Examples from the ${v.place} visit`, "A poem", "A recipe", "Nothing"],
    answer: `Examples from the ${v.place} visit`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name2}: I borrowed a book about ${v.topic2} from the ${v.place2} library yesterday.`,
    question: `What is the book about?`,
    options: [v.topic2, v.topic, v.food, v.animal],
    answer: v.topic2,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Host: The debate on ${v.topic} versus ${v.topic2} careers starts at ${v.time}.`,
    question: `What is the debate about?`,
    options: [`Careers in ${v.topic} and ${v.topic2}`, "Food prices", "Sports only", "Travel visas"],
    answer: `Careers in ${v.topic} and ${v.topic2}`,
  }),
];

const FCE_LISTENING: ListenBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Lecturer: Today's seminar on ${v.topic} policy will compare findings from ${v.place2} and ${v.place}. ${v.name} will summarise implications at ${v.time}.`,
    question: `What will ${v.name} do?`,
    options: ["Summarise implications", "Cancel the seminar", "Sell tickets", "Introduce a new law"],
    answer: "Summarise implications",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Panel: Critics argue the ${v.topic2} grant favours urban ${v.place}s. ${v.name2} responds that rural pilots start next year.`,
    question: `When will rural pilots start?`,
    options: ["Next year", "Next week", "Yesterday", "They will not"],
    answer: "Next year",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Reporter: Archives digitised after the ${v.topic} project opened access to researchers worldwide, though ${v.name} warns metadata remains incomplete.`,
    question: `What problem remains?`,
    options: ["Incomplete metadata", "Closed access", "Lost files", "High costs only"],
    answer: "Incomplete metadata",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Debate: Should ${v.topic2} modules be compulsory? ${v.name} supports choice, citing diverse career paths emerging from ${v.place2} internships.`,
    question: `What supports ${v.name}'s view?`,
    options: ["Diverse career paths from internships", "Higher taxes", "Shorter courses", "Fewer teachers"],
    answer: "Diverse career paths from internships",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Chair: Funding for ${v.topic} research at the ${v.place} depends on the ${v.topic2} review published at ${v.time}.`,
    question: `What does funding depend on?`,
    options: [`A ${v.topic2} review`, "Weather", "Ticket sales", "Nothing"],
    answer: `A ${v.topic2} review`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name2}: Ethical guidelines for ${v.topic} trials were ignored at the ${v.place2} campus last year.`,
    question: `What was ignored?`,
    options: [`Ethical guidelines for ${v.topic} trials`, "Exam dates", "Bus schedules", "Menu choices"],
    answer: `Ethical guidelines for ${v.topic} trials`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Analyst: Consumer demand for ${v.topic2} products rose after the ${v.place} advertising campaign.`,
    question: `What rose after the campaign?`,
    options: [`Demand for ${v.topic2} products`, "Tax rates", "Bus fares", "School hours"],
    answer: `Demand for ${v.topic2} products`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Professor: Students analysing ${v.topic} datasets must attend the ${v.place2} lab session at ${v.time}.`,
    question: `What must students attend?`,
    options: [`A ${v.place2} lab session`, "A concert", "A sports match", "Nothing"],
    answer: `A ${v.place2} lab session`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Commentator: The ${v.topic} referendum results surprised analysts in ${v.place2} and ${v.place}.`,
    question: `What surprised analysts?`,
    options: [`The ${v.topic} referendum results`, "Weather forecasts", "Flight delays", "Food prices"],
    answer: `The ${v.topic} referendum results`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name}: Publishing open ${v.topic2} resources reduced costs for colleges near the ${v.place}.`,
    question: `What reduced costs?`,
    options: [`Publishing open ${v.topic2} resources`, "Closing libraries", "Higher fees", "Fewer teachers"],
    answer: `Publishing open ${v.topic2} resources`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Investigative report: Contracts for ${v.topic} services at the ${v.place2} lacked independent oversight.`,
    question: `What did contracts lack?`,
    options: ["Independent oversight", "Signatures", "Dates", "Titles"],
    answer: "Independent oversight",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Moderator: Panelists will compare ${v.topic} and ${v.topic2} policies after the break at ${v.time}.`,
    question: `What will panelists compare?`,
    options: [`${v.topic} and ${v.topic2} policies`, "Food menus", "Holiday dates", "Sports scores"],
    answer: `${v.topic} and ${v.topic2} policies`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Engineer: Retrofitting the ${v.place} for ${v.topic2} efficiency could cut emissions linked to ${v.topic} transport.`,
    question: `What could retrofitting cut?`,
    options: [`Emissions linked to ${v.topic} transport`, "Ticket prices", "School days", "Library hours"],
    answer: `Emissions linked to ${v.topic} transport`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `${v.name2}: Peer review of my ${v.topic} thesis highlighted gaps in ${v.topic2} methodology.`,
    question: `What did peer review highlight?`,
    options: [`Gaps in ${v.topic2} methodology`, "Perfect results", "Low word count", "No title"],
    answer: `Gaps in ${v.topic2} methodology`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `News: Strikes at the ${v.place2} disrupted ${v.topic} shipments nationwide yesterday.`,
    question: `What was disrupted?`,
    options: [`${v.topic} shipments`, "Flights only", "School exams", "Nothing"],
    answer: `${v.topic} shipments`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Curator: The ${v.topic2} exhibition at the ${v.place} challenges assumptions about ${v.topic} history.`,
    question: `What does the exhibition challenge?`,
    options: [`Assumptions about ${v.topic} history`, "Ticket prices", "Opening hours", "Gift shop items"],
    answer: `Assumptions about ${v.topic} history`,
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Advisor: Candidates proposing ${v.topic} reforms must submit budgets to the ${v.place2} committee by ${v.time}.`,
    question: `What must candidates submit?`,
    options: ["Budgets", "Photos", "Uniforms", "Nothing"],
    answer: "Budgets",
  }),
  (v, tag) => ({
    title: title(tag, v),
    transcript: `Researcher: Long-term ${v.topic2} studies at the ${v.place} revealed unexpected links to ${v.topic} education.`,
    question: `What did studies reveal?`,
    options: [`Links to ${v.topic} education`, "Lower taxes", "Fewer jobs", "No data"],
    answer: `Links to ${v.topic} education`,
  }),
];

const LISTENING_BY_LEVEL: Partial<Record<ExamLevel, ListenBuilder[]>> = {
  STARTERS: YLE_LISTENING,
  MOVERS: YLE_LISTENING,
  FLYERS: YLE_LISTENING,
  KET: KET_LISTENING,
  PET: PET_LISTENING,
  FCE: FCE_LISTENING,
};

// ─── UoE / Grammar ─────────────────────────────────────────────────────────

const STARTERS_UOE: GapBuilder[] = [
  (v, tag) => ({ title: title(tag, v), passage: `I ___ a ${v.animal}.`, question: "", answer: "have" }),
  (v, tag) => ({ title: title(tag, v), passage: `She ___ happy today.`, question: "", answer: "is" }),
  (v, tag) => ({ title: title(tag, v), passage: `They ___ ${v.food}.`, question: "", answer: "like" }),
  (v, tag) => ({ title: title(tag, v), passage: `It is a ${v.color} ___.`, question: "", answer: "ball" }),
  (v, tag) => ({ title: title(tag, v), passage: `We ___ to the ${v.place}.`, question: "", answer: "go" }),
  (v, tag) => ({ title: title(tag, v), passage: `This is my ___.`, question: "", answer: "bag" }),
  (v, tag) => ({ title: title(tag, v), passage: `I can ___ a bike.`, question: "", answer: "ride" }),
  (v, tag) => ({ title: title(tag, v), passage: `The ${v.animal} ___ small.`, question: "", answer: "is" }),
];

const MOVERS_UOE: GapBuilder[] = [
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} ___ (go) to the ${v.place} every day.`, question: "", answer: "goes" }),
  (v, tag) => ({ title: title(tag, v), passage: `There ___ two ${v.animal}s here.`, question: "", answer: "are" }),
  (v, tag) => ({ title: title(tag, v), passage: `I ___ (not like) ${v.food}.`, question: "", answer: "don't like" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} is ___ (tall) than ${v.name2}.`, question: "", answer: "taller" }),
  (v, tag) => ({ title: title(tag, v), passage: `We ___ (play) ${v.topic} now.`, question: "", answer: "are playing" }),
  (v, tag) => ({ title: title(tag, v), passage: `She ___ (watch) TV every evening.`, question: "", answer: "watches" }),
  (v, tag) => ({ title: title(tag, v), passage: `The book is ___ the bag.`, question: "", answer: "in" }),
  (v, tag) => ({ title: title(tag, v), passage: `Can you ___ English?`, question: "", answer: "speak" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} ___ (have) lunch at ${v.time}.`, question: "", answer: "has" }),
];

const FLYERS_UOE: GapBuilder[] = [
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} ___ (visit) ${v.place2} last year.`, question: "", answer: "visited" }),
  (v, tag) => ({ title: title(tag, v), passage: `If it rains, we ___ (stay) home.`, question: "", answer: "will stay" }),
  (v, tag) => ({ title: title(tag, v), passage: `This is the ___ (good) ${v.topic} book I've read.`, question: "", answer: "best" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} has ___ (live) here since 2020.`, question: "", answer: "lived" }),
  (v, tag) => ({ title: title(tag, v), passage: `They ___ (not finish) the ${v.topic2} project yet.`, question: "", answer: "haven't finished" }),
  (v, tag) => ({ title: title(tag, v), passage: `I was ___ (read) when ${v.name2} called.`, question: "", answer: "reading" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} is interested ___ ${v.topic}.`, question: "", answer: "in" }),
  (v, tag) => ({ title: title(tag, v), passage: `We ___ (go) to the ${v.place} tomorrow.`, question: "", answer: "are going" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} ___ (study) ${v.topic2} for two hours yesterday.`, question: "", answer: "studied" }),
];

const KET_UOE: GapBuilder[] = [
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} usually ___ (walk) to the ${v.place}.`, question: "", answer: "walks" }),
  (v, tag) => ({ title: title(tag, v), passage: `There isn't ___ ${v.food} left.`, question: "", answer: "any" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} is good ___ playing ${v.topic}.`, question: "", answer: "at" }),
  (v, tag) => ({ title: title(tag, v), passage: `We ___ (not see) ${v.name2} since Monday.`, question: "", answer: "haven't seen" }),
  (v, tag) => ({ title: title(tag, v), passage: `This ${v.topic} lesson is ___ (easy) than the last one.`, question: "", answer: "easier" }),
  (v, tag) => ({ title: title(tag, v), passage: `If you ___ ( hurry ), you'll catch the bus.`, question: "", answer: "hurry" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} ___ (write) an email about ${v.topic2} now.`, question: "", answer: "is writing" }),
  (v, tag) => ({ title: title(tag, v), passage: `How ___ ${v.topic} classes do you have?`, question: "", answer: "many" }),
];

const PET_UOE: GapBuilder[] = [
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} denied ___ (break) the ${v.topic} equipment.`, question: "", answer: "breaking" }),
  (v, tag) => ({ title: title(tag, v), passage: `The ${v.topic2} talk ___ (give) by ${v.name2} yesterday.`, question: "", answer: "was given" }),
  (v, tag) => ({ title: title(tag, v), passage: `I wish I ___ (know) more about ${v.topic}.`, question: "", answer: "knew" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} suggested ___ (visit) the ${v.place2}.`, question: "", answer: "visiting" }),
  (v, tag) => ({ title: title(tag, v), passage: `Hardly ___ ${v.name2} arrived when the class started.`, question: "", answer: "had" }),
  (v, tag) => ({ title: title(tag, v), passage: `You ___ (not forget) to bring your ${v.topic} notes.`, question: "", answer: "mustn't forget" }),
  (v, tag) => ({ title: title(tag, v), passage: `The ${v.place} ___ (renovate) at the moment.`, question: "", answer: "is being renovated" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} is keen ___ learning about ${v.topic2}.`, question: "", answer: "on" }),
];

const FCE_UOE: GapBuilder[] = [
  (v, tag) => ({ title: title(tag, v), passage: `If ${v.name} ___ (study) harder, the ${v.topic} results would improve.`, question: "", answer: "studied" }),
  (v, tag) => ({ title: title(tag, v), passage: `Not until ${v.time} ___ the ${v.topic2} lecture begin.`, question: "", answer: "did" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} is believed ___ (win) the regional ${v.topic} prize.`, question: "", answer: "to have won" }),
  (v, tag) => ({ title: title(tag, v), passage: `Little ___ that the ${v.place} would close so soon.`, question: "", answer: "did we know" }),
  (v, tag) => ({ title: title(tag, v), passage: `The report, ___ (publish) last week, mentions ${v.topic2}.`, question: "", answer: "published" }),
  (v, tag) => ({ title: title(tag, v), passage: `${v.name} would rather ___ (work) on ${v.topic} than attend the meeting.`, question: "", answer: "work" }),
  (v, tag) => ({
    title: title(tag, v),
    passage: `Scarcely ___ ${v.name2} finished the ${v.topic} report when the alarm sounded.`,
    question: "",
    answer: "had",
  }),
  (v, tag) => ({ title: title(tag, v), passage: `Had ${v.name} known about ${v.topic2}, ${v.name} ___ (apply) earlier.`, question: "", answer: "would have applied" }),
];

const UOE_BY_LEVEL: Partial<Record<ExamLevel, GapBuilder[]>> = {
  STARTERS: STARTERS_UOE,
  MOVERS: MOVERS_UOE,
  FLYERS: FLYERS_UOE,
  KET: KET_UOE,
  PET: PET_UOE,
  FCE: FCE_UOE,
};

// ─── Writing ───────────────────────────────────────────────────────────────

const YLE_WRITING: WriteBuilder[] = [
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

const KET_WRITING: WriteBuilder[] = [
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
    taskPrompt: `Your teacher wants you to describe a photo of people doing ${v.topic2}. Write what you see and how they feel.`,
    wordLimit: 55,
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

const PET_WRITING: WriteBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `In your English class you have been talking about ${v.topic}. Write an article giving your opinion on whether students should spend more time on ${v.topic2}.`,
    wordLimit: 100,
    instructions: "Write about 100 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `You recently volunteered at the ${v.place}. Write an email to ${v.name2} describing what you did and what you learned.`,
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
];

const FCE_WRITING: WriteBuilder[] = [
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Your teacher has asked you to write an essay discussing the advantages and disadvantages of promoting ${v.topic} in schools.`,
    wordLimit: 190,
    instructions: "Write your essay in 140–190 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `A magazine is running a competition for the best article about how ${v.topic2} affects life in modern ${v.place}s. Write your entry.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write a report for your principal evaluating a recent ${v.topic} workshop. Include strengths, weaknesses, and recommendations.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
  (v, tag) => ({
    title: title(tag, v),
    taskPrompt: `Write a formal letter applying to join a summer programme focused on ${v.topic2} at ${v.place2}. Explain your experience and goals.`,
    wordLimit: 190,
    instructions: "Write 140–190 words.",
  }),
];

const WRITING_BY_LEVEL: Partial<Record<ExamLevel, WriteBuilder[]>> = {
  STARTERS: YLE_WRITING,
  MOVERS: YLE_WRITING,
  FLYERS: YLE_WRITING,
  KET: KET_WRITING,
  PET: PET_WRITING,
  FCE: FCE_WRITING,
};

// ─── Speaking ──────────────────────────────────────────────────────────────

const YLE_SPEAKING: SpeakBuilder[] = [
  (v, tag) => ({ title: title(tag, v), prompt: `Tell me about your ${v.food}. Do you like it?`, preparationTime: 10, speakingTime: 30 }),
  (v, tag) => ({ title: title(tag, v), prompt: `What do you do at the ${v.place}?`, preparationTime: 10, speakingTime: 30 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Talk about ${v.topic}. Do you learn it at school?`, preparationTime: 10, speakingTime: 35 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Describe your ${v.animal}. What colour is it?`, preparationTime: 10, speakingTime: 30 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Tell me about ${v.name2}. Where does ${v.name2} live?`, preparationTime: 10, speakingTime: 35 }),
];

const KET_SPEAKING: SpeakBuilder[] = [
  (v, tag) => ({ title: title(tag, v), prompt: `Describe your favourite ${v.place}. Say where it is and how often you go there.`, preparationTime: 15, speakingTime: 60 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Talk about a hobby related to ${v.topic}. Say when you started and why you enjoy it.`, preparationTime: 15, speakingTime: 60 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Describe a typical day when you study ${v.topic2}. Mention times and places.`, preparationTime: 15, speakingTime: 60 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Tell me about a meal you like (${v.food}). Who cooks it and when do you eat it?`, preparationTime: 15, speakingTime: 60 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Talk about a trip to the ${v.place2}. Say who went with you and what you did.`, preparationTime: 15, speakingTime: 60 }),
];

const PET_SPEAKING: SpeakBuilder[] = [
  (v, tag) => ({ title: title(tag, v), prompt: `Talk about a time you helped someone with ${v.topic}. What happened and how did you feel?`, preparationTime: 15, speakingTime: 90 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Describe a useful skill you learned related to ${v.topic2}. Explain how you use it now.`, preparationTime: 15, speakingTime: 90 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Discuss whether students should join ${v.topic} clubs after school. Give reasons and examples.`, preparationTime: 15, speakingTime: 90 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Talk about a place like the ${v.place} that changed your opinion about something.`, preparationTime: 15, speakingTime: 90 }),
];

const FCE_SPEAKING: SpeakBuilder[] = [
  (v, tag) => ({ title: title(tag, v), prompt: `Discuss how ${v.topic} has changed the way people communicate in ${v.place}s.`, preparationTime: 60, speakingTime: 120 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Compare traditional and modern approaches to learning ${v.topic2}. Which is more effective?`, preparationTime: 60, speakingTime: 120 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Talk about ethical issues linked to ${v.topic}. How should society respond?`, preparationTime: 60, speakingTime: 120 }),
  (v, tag) => ({ title: title(tag, v), prompt: `Describe a policy you would introduce to improve ${v.topic2} in your community.`, preparationTime: 60, speakingTime: 120 }),
];

const SPEAKING_BY_LEVEL: Partial<Record<ExamLevel, SpeakBuilder[]>> = {
  STARTERS: YLE_SPEAKING,
  MOVERS: YLE_SPEAKING,
  FLYERS: YLE_SPEAKING,
  KET: KET_SPEAKING,
  PET: PET_SPEAKING,
  FCE: FCE_SPEAKING,
};

function levelTag(level: ExamLevel, skill: string): string {
  return `${level}-${skill}`;
}

function buildFromTemplates<T extends { title: string; difficulty?: SeedDifficulty }>(
  templates: ((v: VarContext, tag: string) => T)[],
  level: ExamLevel,
  skill: string,
  count: number,
  startOffset: number
): T[] {
  if (templates.length === 0) return [];
  const tag = levelTag(level, skill);
  const items: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startOffset + i;
    const tIdx = idx % templates.length;
    const difficulty = difficultyForIndex(idx, tIdx);
    const v = buildVarContext(idx, difficulty, tIdx);
    items.push(withDifficulty(templates[tIdx]!(v, tag), difficulty));
  }
  return items;
}

export function buildDiverseReading(level: ExamLevel, count: number, startOffset = 0): McqSeed[] {
  const templates = READING_BY_LEVEL[level] ?? KET_READING;
  return buildFromTemplates(templates, level, "R", count, startOffset);
}

export function buildDiverseListening(level: ExamLevel, count: number, startOffset = 0): ListeningSeed[] {
  const templates = LISTENING_BY_LEVEL[level] ?? KET_LISTENING;
  return buildFromTemplates(templates, level, "L", count, startOffset);
}

export function buildDiverseUoe(level: ExamLevel, count: number, startOffset = 0): GapSeed[] {
  const templates = UOE_BY_LEVEL[level] ?? KET_UOE;
  return buildFromTemplates(templates, level, "U", count, startOffset);
}

export function buildDiverseWriting(level: ExamLevel, count: number, startOffset = 0): WritingSeed[] {
  const templates = WRITING_BY_LEVEL[level] ?? KET_WRITING;
  return buildFromTemplates(templates, level, "W", count, startOffset);
}

export function buildDiverseSpeaking(level: ExamLevel, count: number, startOffset = 0): SpeakingSeed[] {
  const templates = SPEAKING_BY_LEVEL[level] ?? KET_SPEAKING;
  return buildFromTemplates(templates, level, "S", count, startOffset);
}
