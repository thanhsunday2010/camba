import type { VarContext } from "./seed-vars";
import type { GapBuilder, ListenBuilder, McqBuilder } from "./diverse-templates-types";

function t(tag: string, v: VarContext): string {
  return `${tag}-${v.idx + 1}`;
}

/** Thêm mẫu Reading YLE — cấu trúc khác nhau, có topic để tránh trùng fingerprint */
export const EXTRA_YLE_READING: McqBuilder[] = [
  (v, tag) => ({
    title: t(tag, v),
    passage: `Poster: Join our ${v.topic} club after school at the ${v.place}. Ages ${v.age} and up welcome.`,
    question: `What is the poster about?`,
    options: [`A ${v.topic} club`, "A food sale", "A bus trip", "A film"],
    answer: `A ${v.topic} club`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Diary: Today ${v.name} helped ${v.name2} carry books about ${v.topic2} to the ${v.place2}.`,
    question: `What did they carry?`,
    options: [`Books about ${v.topic2}`, "Food", "Toys", "Clothes"],
    answer: `Books about ${v.topic2}`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Weather note: Rain stopped before the ${v.topic} game. ${v.name} played at the ${v.place}.`,
    question: `Where did ${v.name} play?`,
    options: [`At the ${v.place}`, "At home", "At the beach", "Online"],
    answer: `At the ${v.place}`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Recipe card: Mix ${v.food} with rice for a quick ${v.topic} picnic lunch.`,
    question: `What food is in the recipe?`,
    options: [v.food, "Soup", "Candy", "Fish only"],
    answer: v.food,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Zoo map: The ${v.animal} house is near the ${v.topic2} garden. Tickets cost less before ${v.time}.`,
    question: `When are tickets cheaper?`,
    options: [`Before ${v.time}`, "At night", "Never", "On Mondays only"],
    answer: `Before ${v.time}`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `${v.name2}'s letter: Please bring your ${v.color} hat to the ${v.topic} party at the ${v.place2}.`,
    question: `What colour hat should they bring?`,
    options: [v.color, "Black", "White", "Green"],
    answer: v.color,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Class blog: We learned about ${v.topic} animals like the ${v.animal} during our trip.`,
    question: `Which animal is mentioned?`,
    options: [v.animal, "Tiger", "Whale", "Snake"],
    answer: v.animal,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Bus notice: Route 5 to the ${v.place} leaves at ${v.time} for the ${v.topic2} fair.`,
    question: `Where does the bus go?`,
    options: [`The ${v.place}`, "The airport", "Home", "Abroad"],
    answer: `The ${v.place}`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `${v.name} scored in the ${v.topic} match. The team celebrated at the ${v.place2}.`,
    question: `What did ${v.name} do?`,
    options: ["Scored in the match", "Sold tickets", "Refereed", "Left early"],
    answer: "Scored in the match",
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Library card: Borrow books on ${v.topic} and ${v.topic2} before the holiday starts.`,
    question: `What can you borrow?`,
    options: [`Books on ${v.topic} and ${v.topic2}`, "Only films", "Uniforms", "Nothing"],
    answer: `Books on ${v.topic} and ${v.topic2}`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Science corner: ${v.name2} built a model about ${v.topic} using boxes from the ${v.place}.`,
    question: `What is the model about?`,
    options: [v.topic, v.food, v.animal, v.time],
    answer: v.topic,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Canteen menu: ${v.food} salad today because of the ${v.topic2} health week.`,
    question: `Why is there salad today?`,
    options: [`Because of ${v.topic2} health week`, "Because of rain", "No reason", "Holiday"],
    answer: `Because of ${v.topic2} health week`,
  }),
];

export const EXTRA_SECONDARY_READING: McqBuilder[] = [
  (v, tag) => ({
    title: t(tag, v),
    passage: `Community board: Volunteers needed for a ${v.topic} clean-up near the ${v.place2} on Saturday.`,
    question: `What do volunteers do?`,
    options: [`A ${v.topic} clean-up`, "A concert", "A sale", "A exam"],
    answer: `A ${v.topic} clean-up`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Email: ${v.name2} asks ${v.name} to review notes on ${v.topic2} before the ${v.place} meeting at ${v.time}.`,
    question: `What should ${v.name} review?`,
    options: [`Notes on ${v.topic2}`, "A menu", "A map only", "Nothing"],
    answer: `Notes on ${v.topic2}`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Article: Teenagers who join ${v.topic} clubs report better teamwork, says coach ${v.name}.`,
    question: `What benefit is mentioned?`,
    options: ["Better teamwork", "More homework", "Longer holidays", "Free phones"],
    answer: "Better teamwork",
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Review: The ${v.topic2} app helps students plan trips to the ${v.place} without extra cost.`,
    question: `What does the app help with?`,
    options: [`Planning trips to the ${v.place}`, "Cooking", "Sleeping", "Driving tests"],
    answer: `Planning trips to the ${v.place}`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Notice: Lost ${v.color} wallet with ${v.topic} membership card — contact the ${v.place2} office.`,
    question: `What was lost?`,
    options: [`A ${v.color} wallet`, "A bike", "A dog", "A ticket"],
    answer: `A ${v.color} wallet`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Interview: ${v.name} explains why ${v.topic} skills matter for jobs at the ${v.place}.`,
    question: `What skills are discussed?`,
    options: [`${v.topic} skills`, "Only maths", "Only art", "None"],
    answer: `${v.topic} skills`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `News brief: A ${v.topic2} festival at the ${v.place} opens earlier for students with ID cards.`,
    question: `Who can enter earlier?`,
    options: ["Students with ID cards", "Everyone", "Teachers only", "Nobody"],
    answer: "Students with ID cards",
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Blog: ${v.name2} compares online ${v.topic} courses with classes at the ${v.place2}.`,
    question: `What does the blog compare?`,
    options: [`Online ${v.topic} courses and classes`, "Two foods", "Two animals", "Two colours"],
    answer: `Online ${v.topic} courses and classes`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Sign: No ${v.food} in the ${v.topic} lab — safety rules apply after ${v.time}.`,
    question: `What is not allowed?`,
    options: [v.food, "Books", "Water", "Bags"],
    answer: v.food,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Report: The ${v.place2} added seats for ${v.topic2} shows because demand rose last month.`,
    question: `Why were seats added?`,
    options: ["Demand rose", "Prices fell", "It closed", "Weather changed"],
    answer: "Demand rose",
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Letter: Thanks for your ${v.topic} project, ${v.name}. Judges liked the ${v.place} field trip section.`,
    question: `Which section did judges like?`,
    options: [`The ${v.place} field trip section`, "The cover", "The price list", "Nothing"],
    answer: `The ${v.place} field trip section`,
  }),
  (v, tag) => ({
    title: t(tag, v),
    passage: `Editorial: Should schools fund ${v.topic2} equipment? ${v.name2} argues yes, citing ${v.topic} results.`,
    question: `What does ${v.name2} support funding for?`,
    options: [`${v.topic2} equipment`, "Bus tickets", "Cafeteria food", "Uniforms only"],
    answer: `${v.topic2} equipment`,
  }),
];

const LISTENING_PROMPTS = [
  (v: VarContext) =>
    `Announcement: The ${v.topic} workshop moves from Room 1 to the ${v.place2} hall at ${v.time}.`,
  (v: VarContext) =>
    `${v.name}: I registered for the ${v.topic2} course because the ${v.place} offers evening sessions.`,
  (v: VarContext) =>
    `Guide: Children interested in ${v.topic} should meet at the ${v.place} gate with ${v.name2}.`,
  (v: VarContext) =>
    `Radio: Traffic delays near the ${v.place2} due to a ${v.topic} parade — use River Road instead.`,
  (v: VarContext) =>
    `Teacher: Submit your ${v.topic2} homework online before the ${v.place} library closes tonight.`,
  (v: VarContext) =>
    `${v.name2}: The ${v.topic} tickets I bought include a ${v.food} snack at ${v.time}.`,
  (v: VarContext) =>
    `Host: Tonight's talk on ${v.topic2} features ${v.name} from the ${v.place} research team.`,
  (v: VarContext) =>
    `Clerk: Your ${v.color} pass grants access to the ${v.topic} archive in building C.`,
  (v: VarContext) =>
    `Coach: Athletes training for ${v.topic2} must hydrate and rest before ${v.time}.`,
  (v: VarContext) =>
    `Reporter: Local ${v.place}s trial new ${v.topic} bins after the ${v.topic2} campaign.`,
  (v: VarContext) =>
    `${v.name}: I couldn't find the ${v.topic} notes I left in the ${v.place2} cafeteria.`,
  (v: VarContext) =>
    `Manager: Staff covering ${v.topic2} shifts should report to the ${v.place} office at ${v.time}.`,
  (v: VarContext) =>
    `Podcast: ${v.name2} describes how ${v.topic} volunteering improved language confidence.`,
  (v: VarContext) =>
    `Notice: The ${v.animal} care talk at the ${v.place2} zoo starts after ${v.topic} week ends.`,
  (v: VarContext) =>
    `Chair: Budget for ${v.topic2} labs will be decided once the ${v.place} survey closes.`,
  (v: VarContext) =>
    `${v.name}: Borrowed books about ${v.topic} must return to the ${v.place2} desk by Friday.`,
  (v: VarContext) =>
    `Presenter: Our ${v.topic2} demo at the ${v.place} fair won a prize yesterday.`,
  (v: VarContext) =>
    `Operator: Buses to the ${v.place2} ${v.topic} festival leave every hour from ${v.time}.`,
  (v: VarContext) =>
    `Doctor: Patients joining the ${v.topic2} fitness plan should walk in the ${v.place} park daily.`,
  (v: VarContext) =>
    `Curator: The ${v.topic} photo show opens in the ${v.place2} gallery next month.`,
  (v: VarContext) =>
    `${v.name2}: I'll email the ${v.topic2} schedule after the ${v.place} meeting ends.`,
  (v: VarContext) =>
    `News: A ${v.topic} scholarship for teens opens applications at the ${v.place2} centre.`,
  (v: VarContext) =>
    `Trainer: First ${v.topic2} lesson covers safety rules at the ${v.place} pool.`,
  (v: VarContext) =>
    `${v.name}: We chose ${v.topic} as our project theme because of the ${v.place2} trip.`,
  (v: VarContext) =>
    `Editor: Articles on ${v.topic2} and ${v.topic} must be under 500 words for the magazine.`,
];

const LISTENING_QUESTIONS = [
  (v: VarContext) => ({
    q: `What time is mentioned?`,
    opts: [v.time, "8:00", "9:00", "Midnight"],
    a: v.time,
  }),
  (v: VarContext) => ({
    q: `Which topic is mentioned?`,
    opts: [v.topic, v.food, v.animal, "None"],
    a: v.topic,
  }),
  (v: VarContext) => ({
    q: `Where should people go?`,
    opts: [`The ${v.place2}`, "Home", "Abroad", "Online only"],
    a: `The ${v.place2}`,
  }),
  (v: VarContext) => ({
    q: `What is ${v.topic2} related to?`,
    opts: [v.topic2, v.color, v.age + "", "Nothing"],
    a: v.topic2,
  }),
  (v: VarContext) => ({
    q: `Who is speaking about ${v.topic}?`,
    opts: [v.name, v.name2, "Nobody", "A robot"],
    a: v.name,
  }),
];

export function buildExtraListening(count: number): ListenBuilder[] {
  const builders: ListenBuilder[] = [];
  for (let i = 0; i < count; i++) {
    const pIdx = i % LISTENING_PROMPTS.length;
    const qIdx = (i + 7) % LISTENING_QUESTIONS.length;
    builders.push((v, tag) => {
      const transcript = LISTENING_PROMPTS[pIdx]!(v);
      const { q, opts, a } = LISTENING_QUESTIONS[qIdx]!(v);
      return {
        title: t(tag, v),
        transcript,
        question: q,
        options: opts,
        answer: a,
      };
    });
  }
  return builders;
}

const UOE_EXTRA_PATTERNS: { level: "yle" | "ket" | "pet" | "fce"; build: (v: VarContext) => { passage: string; answer: string } }[] = [
  { level: "yle", build: (v) => ({ passage: `My ${v.animal} ___ (${v.color}).`, answer: "is" }) },
  { level: "yle", build: (v) => ({ passage: `We ___ (like) ${v.topic} at the ${v.place}.`, answer: "like" }) },
  { level: "yle", build: (v) => ({ passage: `${v.name} ___ (eat) ${v.food} every day.`, answer: "eats" }) },
  { level: "yle", build: (v) => ({ passage: `They are ___ (play) ${v.topic2} now.`, answer: "playing" }) },
  { level: "yle", build: (v) => ({ passage: `There ___ some ${v.food} on the table.`, answer: "is" }) },
  { level: "yle", build: (v) => ({ passage: `I went ___ the ${v.place} yesterday.`, answer: "to" }) },
  { level: "yle", build: (v) => ({ passage: `${v.name} has got a ${v.color} ___.`, answer: "bag" }) },
  { level: "yle", build: (v) => ({ passage: `Can ${v.name2} ___ (${v.topic}) well?`, answer: "sing" }) },
  { level: "ket", build: (v) => ({ passage: `${v.name} ___ (not finish) the ${v.topic} homework yet.`, answer: "hasn't finished" }) },
  { level: "ket", build: (v) => ({ passage: `If it ___ (rain), we'll stay at the ${v.place}.`, answer: "rains" }) },
  { level: "ket", build: (v) => ({ passage: `${v.name} is ___ (interested) in ${v.topic2}.`, answer: "interested" }) },
  { level: "ket", build: (v) => ({ passage: `How much ___ this ${v.topic} book cost?`, answer: "does" }) },
  { level: "ket", build: (v) => ({ passage: `${v.name2} ___ (study) ${v.topic} when I called.`, answer: "was studying" }) },
  { level: "ket", build: (v) => ({ passage: `We have lived near the ${v.place2} ___ 2019.`, answer: "since" }) },
  { level: "pet", build: (v) => ({ passage: `${v.name} avoided ___ (answer) questions about ${v.topic}.`, answer: "answering" }) },
  { level: "pet", build: (v) => ({ passage: `The ${v.topic2} prize ___ (award) last night.`, answer: "was awarded" }) },
  { level: "pet", build: (v) => ({ passage: `I'd rather ___ (learn) ${v.topic} than watch TV.`, answer: "learn" }) },
  { level: "pet", build: (v) => ({ passage: `${v.name} apologised ___ breaking the ${v.topic2} equipment.`, answer: "for" }) },
  { level: "fce", build: (v) => ({ passage: `Were ${v.name} to accept, the ${v.topic} programme ___ expand next year.`, answer: "would" }) },
  { level: "fce", build: (v) => ({ passage: `No sooner ___ the ${v.topic2} talk begun than the fire alarm rang.`, answer: "had" }) },
  { level: "fce", build: (v) => ({ passage: `${v.name} is thought ___ (discover) a new ${v.topic} method.`, answer: "to have discovered" }) },
  { level: "fce", build: (v) => ({ passage: `Seldom ___ such ${v.topic2} results in the ${v.place}.`, answer: "do we see" }) },
];

export function extraUoeForLevel(level: "yle" | "ket" | "pet" | "fce"): GapBuilder[] {
  return UOE_EXTRA_PATTERNS.filter((p) => p.level === level || (level === "yle" && p.level === "yle")).map(
    (p, i) => (v, tag) => {
      const { passage, answer } = p.build(v);
      return { title: `${t(tag, v)}-x${i}`, passage, question: "", answer };
    }
  );
}

export const EXTRA_FCE_LISTENING = buildExtraListening(30);

const READING_PASSAGE_BUILDERS = [
  (v: VarContext) =>
    `School news: Class ${v.age} visits the ${v.place2} to learn about ${v.topic} on Friday.`,
  (v: VarContext) =>
    `Note from ${v.name2}: Bring ${v.food} for the ${v.topic2} picnic at the ${v.place}.`,
  (v: VarContext) =>
    `Toy shop: ${v.color} ${v.animal} toys on sale during ${v.topic} week only.`,
  (v: VarContext) =>
    `${v.name} wrote a story about ${v.topic2} and read it at the ${v.place2} assembly.`,
  (v: VarContext) =>
    `Sports board: ${v.topic} practice starts at ${v.time} on the ${v.place} field.`,
  (v: VarContext) =>
    `Art room: Paint pictures of ${v.topic2} animals like the ${v.animal} tomorrow.`,
  (v: VarContext) =>
    `Canteen: Try ${v.food} soup today — part of ${v.topic} food day.`,
  (v: VarContext) =>
    `Club list: ${v.name2} leads the ${v.topic} group every Monday after school.`,
  (v: VarContext) =>
    `Trip form: Parents sign for the ${v.place} visit about ${v.topic2} history.`,
  (v: VarContext) =>
    `Pet corner: The ${v.animal} likes ${v.food} and lives near the ${v.topic} garden.`,
  (v: VarContext) =>
    `Music time: Learn a ${v.topic} song before the ${v.place2} concert at ${v.time}.`,
  (v: VarContext) =>
    `Lost item: ${v.color} scarf found in the ${v.topic2} classroom — ask ${v.name}.`,
  (v: VarContext) =>
    `Garden club: Plant flowers for ${v.topic} day behind the ${v.place}.`,
  (v: VarContext) =>
    `Reading hour: Books about ${v.topic2} and ${v.topic} available in the ${v.place2}.`,
  (v: VarContext) =>
    `Birthday: ${v.name2} brings ${v.food} cake to share after ${v.topic} class.`,
  (v: VarContext) =>
    `Weather chart: Cold days mean indoor ${v.topic2} games in the ${v.place}.`,
  (v: VarContext) =>
    `Photo wall: Pictures from the ${v.topic} trip to the ${v.place2} are ready.`,
  (v: VarContext) =>
    `Helper list: ${v.name} tidies the ${v.topic2} shelf in the ${v.place} library.`,
  (v: VarContext) =>
    `Craft table: Make a ${v.color} mask for the ${v.topic} festival.`,
  (v: VarContext) =>
    `Bus list: Line up for the ${v.place2} trip about ${v.topic2} at ${v.time}.`,
  (v: VarContext) =>
    `Star pupil: ${v.name2} won a ${v.topic} prize for helping at the ${v.place}.`,
  (v: VarContext) =>
    `Play time: Build a ${v.topic2} tower with blocks in the ${v.place2} room.`,
  (v: VarContext) =>
    `Nature walk: Look for ${v.animal}s while learning about ${v.topic} outside.`,
  (v: VarContext) =>
    `Clean-up crew: Recycle paper after the ${v.topic2} project in class ${v.age}.`,
  (v: VarContext) =>
    `Show and tell: ${v.name} brings a ${v.color} object linked to ${v.topic}.`,
  (v: VarContext) =>
    `Holiday homework: Draw a ${v.topic2} poster about the ${v.place} museum.`,
  (v: VarContext) =>
    `Friendship bench: Talk about ${v.topic} problems with ${v.name2} at break.`,
  (v: VarContext) =>
    `Computer lab: Play ${v.topic2} learning games until ${v.time}.`,
  (v: VarContext) =>
    `Drama club: Act a short ${v.topic} play at the ${v.place2} stage next month.`,
  (v: VarContext) =>
    `Snack bar: Choose ${v.food} or fruit during ${v.topic2} health month.`,
];

const READING_Q_BUILDERS = [
  (v: VarContext) => ({
    q: `What is the text mainly about?`,
    opts: [v.topic, v.food, v.animal, "Nothing"],
    a: v.topic,
  }),
  (v: VarContext) => ({
    q: `Where does the activity happen?`,
    opts: [`The ${v.place2}`, "At sea", "In space", "Nowhere"],
    a: `The ${v.place2}`,
  }),
  (v: VarContext) => ({
    q: `When does something start?`,
    opts: [v.time, "Never", "Yesterday", "Next year"],
    a: v.time,
  }),
  (v: VarContext) => ({
    q: `Who is mentioned?`,
    opts: [v.name2, "A king", "A robot", "Nobody"],
    a: v.name2,
  }),
  (v: VarContext) => ({
    q: `What food is mentioned?`,
    opts: [v.food, "Ice cream only", "Nothing", "Rice only"],
    a: v.food,
  }),
];

export function buildExtraReading(count: number): McqBuilder[] {
  const builders: McqBuilder[] = [];
  for (let i = 0; i < count; i++) {
    const pIdx = i % READING_PASSAGE_BUILDERS.length;
    const qIdx = (i + 3) % READING_Q_BUILDERS.length;
    builders.push((v, tag) => {
      const passage = READING_PASSAGE_BUILDERS[pIdx]!(v);
      const { q, opts, a } = READING_Q_BUILDERS[qIdx]!(v);
      return { title: t(tag, v), passage, question: q, options: opts, answer: a };
    });
  }
  return builders;
}
