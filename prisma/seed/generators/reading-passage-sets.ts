import { ExamLevel } from "@prisma/client";
import type { McqSeed } from "../helpers";
import { buildVarContext, difficultyForIndex } from "./seed-vars";
import type { SeedDifficulty } from "../../../src/lib/exam/question-diversity";

export const READING_QUESTIONS_PER_SET = 5;

/** Cambridge reading passage length standards (words per passage). */
export const PASSAGE_WORD_TARGETS: Record<
  ExamLevel,
  { min: number; max: number }
> = {
  STARTERS: { min: 10, max: 50 },
  MOVERS: { min: 50, max: 150 },
  FLYERS: { min: 100, max: 200 },
  KET: { min: 50, max: 250 },
  PET: { min: 250, max: 400 },
  FCE: { min: 500, max: 700 },
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

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const STARTERS_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `${v.name}'s ${v.animal}`,
    passage: `This is ${v.name}. ${v.name} is ${v.age} years old. ${v.name} has a ${v.color} ${v.animal} called Max. Max likes the garden. Every afternoon ${v.name} plays with ${v.name2}. They run and draw pictures about ${v.topic}.`,
    questions: [
      q(`How old is ${v.name}?`, [`${v.age - 1}`, `${v.age}`, `${v.age + 1}`, `${v.age + 2}`], `${v.age}`),
      q(`What colour is the ${v.animal}?`, [v.color, "grey", "black", "white"], v.color),
      q(`What is the ${v.animal}'s name?`, ["Sam", "Max", "Kim", "Ben"], "Max"),
      q(`Who plays with ${v.name}?`, [v.name2, "A teacher", "A doctor", "Nobody"], v.name2),
      q(`Where does Max like to be?`, ["The garden", "The shop", "School", "The beach"], "The garden"),
    ],
  }),
  (v) => ({
    title: `Class trip to the ${v.place}`,
    passage: `Today Class 2 went to the ${v.place}. The bus left school at ${v.time}. ${v.name} sat next to ${v.name2}. The teacher gave every child a ${v.color} hat. They ate ${v.food} for lunch. ${v.name} said it was a great day.`,
    questions: [
      q(`Where did the class go?`, [`The ${v.place}`, "The beach", "Home", "A shop"], `The ${v.place}`),
      q(`When did the bus leave?`, [v.time, "At night", "Never", "Next week"], v.time),
      q(`Who sat next to ${v.name}?`, [v.name2, "The driver", "A baby", "Nobody"], v.name2),
      q(`What colour were the hats?`, [v.color, "Blue only", "Green only", "No hats"], v.color),
      q(`What did ${v.name} think?`, ["It was a great day", "It was boring", "It was scary", "It was too long"], "It was a great day"),
    ],
  }),
];

const MOVERS_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `${v.name}'s hobby`,
    passage: `${v.name} is ${v.age} and lives in a small town near the ${v.place}. Last month ${v.name} joined a ${v.topic} club at the community centre. ${v.name} goes there every Tuesday and Thursday after school. ${v.name2} is the club leader and helps beginners learn new skills step by step. Last week the group made colourful posters about ${v.topic2} and put them on the wall in the hall. ${v.name} wants to enter a city competition in May and practise every weekend with friends from school. ${v.name}'s parents are proud because ${v.name} works hard and never misses a lesson. Before the holidays, ${v.name} told classmates about the club during assembly.`,
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
    passage: `During the summer holidays, ${v.name}'s family spent five days at the ${v.place2}. They stayed in a small hotel near the ${v.place}. Every morning they walked along the path and bought fresh ${v.food} from a busy market in the town centre. ${v.name} and ${v.name2} learned to ride bikes and visited a museum about ${v.topic}. In the afternoons they swam in the lake and took photos of birds on the water. On the last evening they watched the sunset from the hill and wrote postcards to their classmates at school. ${v.name} showed the diary to the teacher after the break and received a good mark for the work. The whole class listened when ${v.name} read the best pages aloud.`,
    questions: [
      q(`How long was the holiday?`, ["Three days", "Five days", "Ten days", "One day"], "Five days"),
      q(`Where did they stay?`, [`Near the ${v.place}`, "At the airport", "At school", "On a boat"], `Near the ${v.place}`),
      q(`What did they buy at the market?`, [`Fresh ${v.food}`, "Toys only", "Shoes", "Books only"], `Fresh ${v.food}`),
      q(`What did they visit?`, [`A museum about ${v.topic}`, "A factory", "A farm only", "Nothing"], `A museum about ${v.topic}`),
      q(`What did ${v.name} show the teacher?`, ["A diary", "A new phone", "A uniform", "A ticket"], "A diary"),
    ],
  }),
];

const FLYERS_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `School ${v.topic} project`,
    passage: `${v.name}, who is ${v.age}, started an ambitious ${v.topic} project with classmates at the ${v.place}. Although the team had little experience at first, they collected information from the library and interviewed visitors at the ${v.place2}. ${v.name2} designed a simple website while ${v.name} wrote detailed reports and prepared a presentation with charts and photographs. Their teacher said the project showed excellent teamwork and careful research. The head teacher invited them to present their findings at a regional event next month. Before the event, the group will rehearse twice and prepare answers to possible questions from the audience. ${v.name} hopes the talk will encourage other students to learn about ${v.topic2} and join similar clubs in the future.`,
    questions: [
      q(`What was the project about?`, [v.topic, v.food, v.animal, "Transport only"], v.topic),
      q(`Where did they interview people?`, [`The ${v.place2}`, "A stadium", "An airport", "A factory"], `The ${v.place2}`),
      q(`What did ${v.name2} design?`, ["A website", "A uniform", "A bus timetable", "A cake"], "A website"),
      q(`Who invited them to present?`, ["The head teacher", "A journalist", "A doctor", "A shop owner"], "The head teacher"),
      q(`What does ${v.name} hope?`, [`To encourage students to learn about ${v.topic2}`, "To stop studying", "To travel abroad", "To sell products"], `To encourage students to learn about ${v.topic2}`),
    ],
  }),
  (v) => ({
    title: `${v.name}'s exchange visit`,
    passage: `Last term ${v.name} took part in a school exchange programme with students from another town. The visitors stayed with host families and attended lessons about ${v.topic} and ${v.topic2}. ${v.name} shared a room with ${v.name2}, who taught ${v.name} local games and helped with homework in the evenings. On Wednesday the whole group visited the ${v.place} and completed a survey about transport habits. Teachers compared the results and discussed how young people could travel more safely. At the farewell party, students exchanged email addresses and promised to write blogs about their experiences. ${v.name} said the visit was tiring but very useful for improving confidence and language skills.`,
    questions: [
      q(`What kind of programme was it?`, ["A school exchange", "A holiday camp", "A sports tournament", "A shopping trip"], "A school exchange"),
      q(`Who did ${v.name} share a room with?`, [v.name2, "A teacher", "A stranger", "Nobody"], v.name2),
      q(`Where did they go on Wednesday?`, [`The ${v.place}`, "The airport", "A cinema", "Home"], `The ${v.place}`),
      q(`What did students exchange at the party?`, ["Email addresses", "Money", "Uniforms", "Exam papers"], "Email addresses"),
      q(`How did ${v.name} describe the visit?`, ["Tiring but useful", "Boring", "Too short", "Unfair"], "Tiring but useful"),
    ],
  }),
];

const KET_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `${v.topic} club notice`,
    passage: `${v.name}'s school is starting a ${v.topic} club for students aged ${v.age} to sixteen. Meetings will take place in Room 8 at the ${v.place} every Wednesday from ${v.time} until five o'clock. ${v.name2}, who won a local prize last year, will help beginners learn basic skills step by step. Members should bring a notebook, a pencil and comfortable clothes for the practical activity. The first session includes a short talk about ${v.topic2} and a walk around the school garden to collect examples. Parents can collect application forms from the school office or download them from the website before Friday. Late applications may be accepted if places remain. The club is free, but students must attend at least six sessions to receive a certificate at the end of term.`,
    questions: [
      q(`What is the notice about?`, [`A ${v.topic} club`, "A holiday trip", "An exam result", "A canteen menu"], `A ${v.topic} club`),
      q(`When do meetings happen?`, ["Every Wednesday", "Every Monday", "Only in holidays", "Never"], "Every Wednesday"),
      q(`Who will help beginners?`, [v.name2, v.name, "A doctor", "Nobody"], v.name2),
      q(`What should members bring?`, ["A notebook", "A laptop only", "Sports shoes only", "Money"], "A notebook"),
      q(`How can parents get forms?`, ["From the office or website", "Only by phone", "At the cinema", "They cannot"], "From the office or website"),
    ],
  }),
  (v) => ({
    title: `Email from ${v.name2}`,
    passage: `Hi ${v.name}, Thanks for your message about the ${v.topic} trip to the ${v.place2}. I checked the timetable and we can meet at the ${v.place} entrance at ${v.time} on Saturday. Please bring a raincoat because the forecast says it might shower in the afternoon. We should also pack sandwiches, fruit and a bottle of water for the walk between buildings. If you can't come, tell me by Thursday so I can inform the guide and rearrange the tickets. I'm looking forward to seeing the exhibition about ${v.topic2} and taking notes for our project. The museum shop sells cheap postcards if you want souvenirs. Best wishes, ${v.name2}`,
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
    passage: `Last weekend ${v.name} and ${v.name2} visited the ${v.place2} to learn more about ${v.topic}. They arrived at ${v.time} and watched a short film in the information centre. After that they walked through the ${v.place} and completed a worksheet with ten questions about local history. ${v.name} bought a postcard and a small book about ${v.topic2} in the shop. On the bus home they compared answers and agreed the trip was useful for their school project. Their teacher asked them to write a paragraph before Monday's lesson and include one photograph if possible.`,
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
    passage: `${v.name}, who is ${v.age}, works part-time at a ${v.color} kiosk near the ${v.place}. Every Saturday ${v.name} sells snacks, guides visitors and restocks shelves before ${v.time}. The manager, ${v.name2}, says ${v.name} is reliable and polite to customers even when the queue is long. Last month ${v.name} saved enough money to buy books about ${v.topic} and ${v.topic2}. ${v.name} hopes the experience will help when applying for college courses next year. Staff must wear a name badge and arrive ten minutes early for each shift. On busy days they also help count money at closing time.`,
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
    passage: `In a recent column for the school magazine, ${v.name} argued that teenagers should spend more time on ${v.topic} instead of endless scrolling on social media. ${v.name} explained that joining activities at the ${v.place} helped build confidence, teamwork and friendships outside the classroom. However, some parents worry that students already have too much homework and little energy left in the evening. ${v.name2}, a youth worker, believes schools should offer flexible clubs after ${v.time} so pupils can balance study and hobbies without feeling stressed. A local survey of four hundred students showed that sixty percent wanted more practical workshops about ${v.topic2}, while twenty percent preferred online courses they could follow at home. Teachers interviewed for the article said after-school programmes reduced lateness in morning lessons because participants learned to manage their time better. The editor invited readers to send responses before the end of the month, and the best letters will be published in the summer edition. ${v.name} concluded that small changes in weekly routines could make a big difference to wellbeing, even if students cannot attend every session. Several head teachers agreed and asked local councils to fund transport so students from distant neighbourhoods could take part without paying extra bus fares. Community nurses added that regular activity also improved sleep patterns, although they warned against replacing face-to-face conversation with messages sent late at night. A follow-up meeting is planned for next term, when student representatives will present ideas to the governors and discuss how to measure progress fairly. The school principal confirmed that any new timetable changes would be tested carefully before being introduced across all year groups.`,
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
    passage: `${v.name2} has volunteered at the ${v.place} for three years, teaching ${v.topic} to primary pupils after school. In an interview published last week, ${v.name2} explained that the most challenging part is preparing materials that suit different ages, not speaking in public. ${v.name} attended one of the sessions and said the activities helped younger children understand ${v.topic2} through games, short stories and simple experiments in the science room. The project receives a small grant from the town council, but organisers still need more helpers for the summer programme and weekend events at the ${v.place2}. Parents are invited to observe a class before enrolling their children, and feedback forms are collected at the end of each term. ${v.name2} encourages students who enjoy ${v.topic} to contact the centre before May so training can be arranged during the Easter break. Last year twelve new volunteers joined after an open day, and several later chose careers in education. The centre manager praised ${v.name2}'s patience and said similar schemes in neighbouring towns had copied the timetable and handbook. Local journalists filmed a short documentary about the project, which has now been viewed more than ten thousand times online. Teachers reported that pupils who took part showed greater curiosity in lessons and were more willing to ask questions when they did not understand a new idea. The local mayor attended the summer celebration and promised to include the centre in next year's community funding plan. Primary advisers said the model could be copied in other towns if volunteers received proper training and regular support from experienced mentors.`,
    questions: [
      q(`How long has ${v.name2} volunteered?`, ["Three years", "Three months", "One week", "Ten years"], "Three years"),
      q(`What is the hardest part?`, ["Preparing materials", "Speaking in public", "Finding pupils", "Cooking"], "Preparing materials"),
      q(`Who attended a session?`, [v.name, v.name2, "A mayor", "Nobody"], v.name),
      q(`Who provides a grant?`, ["The town council", "A supermarket", "A film company", "Nobody"], "The town council"),
      q(`When should helpers contact the centre?`, ["Before May", "After December", "Never", "Every day"], "Before May"),
    ],
  }),
  (v) => ({
    title: `Report — ${v.topic2} in schools`,
    passage: `A new report on ${v.topic2} in secondary schools has sparked debate among teachers, parents and politicians. Researchers visited twenty-eight schools over twelve months and recorded lessons, interviewed staff and analysed homework diaries kept by two hundred pupils. They found that students who discussed ${v.topic} regularly with classmates performed better in collaborative tasks, although written test scores varied widely. ${v.name}, one of the report's authors, told journalists that schools should not simply add extra lessons but redesign projects so learners practise real-world skills. Critics argue the study ignored rural areas where transport to the ${v.place} is limited and clubs finish before parents return from work. Supporters point to pilot schemes near the ${v.place2}, where attendance rose after timetables were shared online and mentors from local companies visited once a month. The education minister promised funding for training, yet unions warned that teachers already work long hours marking exams. Several charities offered free resources, and ${v.name2} published a guide for families who want to support learning at home without buying expensive equipment. The guide includes checklists, conversation prompts and examples of short tasks that can be completed in twenty minutes after dinner. Reviewers in the press said the recommendations were sensible but would require strong leadership from head teachers if they were to succeed in larger schools with mixed ability classes. Education officials said they would publish a summary for parents on the ministry website before the new academic year begins. Union leaders welcomed the guide but asked for protected time within the school day for teachers to discuss the ideas with colleagues.`,
    questions: [
      q(`What is the report about?`, [v.topic2, v.food, "Holiday dates", "School uniforms"], v.topic2),
      q(`How many schools did researchers visit?`, ["Eight", "Twenty-eight", "Fifty", "One hundred"], "Twenty-eight"),
      q(`What did ${v.name} recommend?`, ["Redesign projects", "Cancel homework", "Close clubs", "Ban group work"], "Redesign projects"),
      q(`What do critics say was ignored?`, ["Rural transport problems", "Exam marks", "Teacher names", "Sports results"], "Rural transport problems"),
      q(`Who published a guide for families?`, [v.name2, v.name, "A supermarket", "A travel agent"], v.name2),
    ],
  }),
];

const FCE_TEMPLATES: PassageSetTemplate[] = [
  (v) => ({
    title: `${v.topic} initiative`,
    passage: `A pilot programme promoting ${v.topic} has been launched in several districts after researchers at the ${v.place2} published a detailed report that attracted national attention. The study, which surveyed more than two thousand residents through face-to-face interviews, telephone calls and online forms, found that small changes in daily habits could significantly reduce waste linked to ${v.topic2}. ${v.name}, the lead author, cautioned that long-term success depends on cooperation between local businesses, schools and transport providers rather than short publicity campaigns alone. Critics claim the initiative is underfunded and that previous schemes failed because monitoring stopped after the first year. Yet early results from the ${v.place} suggest higher participation than expected among younger households, especially families who received practical advice during home visits. Community leaders have agreed to share data openly so independent analysts can verify the trends before policy recommendations are finalised. Officials now plan to expand workshops, translate materials into three languages and monitor progress over eighteen months before deciding on national rollout. Secondary schools will receive teaching packs, while employers are encouraged to offer flexible hours so staff can attend training sessions. Journalists noted that similar programmes abroad took five years to show measurable change, so expectations must remain realistic. ${v.name2}, a council spokesperson, emphasised that the project is experimental and that residents can opt out without penalty. Supermarkets participating in the trial will label products more clearly and donate a share of profits to neighbourhood improvement funds. Environmental groups welcomed the announcement but demanded stronger penalties for companies that ignore voluntary targets. Economists argued that upfront investment would save public money later by reducing cleanup costs and healthcare spending linked to pollution. Several universities have applied to study the pilot, hoping to publish comparative results in international journals. Parents' associations requested clearer information about how children can contribute at home and at school without facing additional fees. The transport authority promised extra bus services on workshop days, addressing a complaint raised in last month's public forum. If the pilot succeeds, ministers may integrate its lessons into a wider strategy covering housing, energy use and food supply chains. Until then, organisers urge citizens to register online, attend introductory meetings and suggest local priorities before the next budget review. Retail analysts observed that consumer behaviour changed slowly, even when prices and labels were adjusted, suggesting that education must accompany regulation. Health professionals added that improved air quality and cleaner public spaces could benefit older residents as well as young families, though they called for medical data to be collected systematically. Legal advisers warned that contracts with private partners should include transparent reporting clauses to prevent disputes if targets are missed. Meanwhile, volunteer groups organised street events to demonstrate practical tips, attracting crowds that surprised even optimistic planners. International delegates visited last month to observe sessions and share experiences from cities facing similar challenges. Their summary praised local enthusiasm but noted that winter weather and staff turnover could disrupt continuity unless backup trainers were funded in advance. Opposition parties called for an independent audit, while business leaders asked for tax incentives to support wider participation in the programme.`,
    questions: [
      q(`What has been launched?`, [`A ${v.topic} programme`, "A new airport", "A fashion show", "A phone app only"], `A ${v.topic} programme`),
      q(`How many residents were surveyed?`, ["More than 2000", "About 100", "Fewer than 50", "Exactly 500"], "More than 2000"),
      q(`What does ${v.name} say is necessary?`, ["Cooperation between groups", "Higher taxes only", "Closing all schools", "Banning travel"], "Cooperation between groups"),
      q(`What do critics claim?`, ["The initiative is underfunded", "It is too expensive to measure", "Nobody attended", "It already failed nationally"], "The initiative is underfunded"),
      q(`What will officials do next?`, ["Expand workshops and monitor progress", "Cancel the project", "Sell the report", "Stop translations"], "Expand workshops and monitor progress"),
    ],
  }),
  (v) => ({
    title: `Review — ${v.topic} biography`,
    passage: `This newly published biography of a pioneer in ${v.topic} has received widespread attention from critics and general readers alike. The author, ${v.name2}, spent four years interviewing colleagues, reading private letters and examining archives in ${v.place2} before completing the manuscript. Reviewers praise the chapters that describe early experiments conducted in modest laboratories with limited funding, though a few note that the final section on ${v.topic2} feels rushed and would benefit from clearer dates and stronger connections to present-day debates. ${v.name}, writing in a national newspaper, argues the book succeeds because it connects scientific discovery with ordinary human motivation rather than presenting dry lists of facts. Several book clubs have already chosen it for discussion, and teachers report that excerpts work well in advanced classes when paired with short video clips. The publisher plans a paperback edition and a series of public talks if sales remain strong through autumn. Historians compliment the footnotes, while some scientists wish the author had explained technical terms more slowly for non-specialists. The subject's family cooperated with the project, providing photographs that appear in a sixteen-page colour insert. Controversy arose when a rival researcher claimed certain anecdotes were exaggerated, prompting ${v.name2} to publish a detailed response on the publisher's website. Despite this dispute, most commentators agree the biography fills a gap in the market and encourages young people to consider careers in research. Libraries across the country ordered multiple copies, and translation rights were sold within weeks to publishers in four languages. Festival organisers invited ${v.name2} to appear on a panel about writing science for general audiences, alongside journalists and educators. Readers interviewed outside bookshops said they appreciated the balanced tone and the way the narrative linked personal setbacks to later achievements. If the hardback sells as expected, the publisher may commission a companion volume focusing on the subject's collaborators and rivals. Until then, reviewers recommend reading the introduction carefully, because it outlines the main arguments that develop throughout the remaining chapters. Academic conferences have scheduled sessions to debate the ethical questions raised by the subject's most famous experiment, particularly whether modern regulations would permit similar work today. Archivists noted that newly discovered correspondence may inspire a revised edition with additional material about the subject's early travels and financial struggles. Booksellers reported strong demand among gift buyers as well as students preparing for university interviews, suggesting the appeal crosses age groups. Radio programmes devoted entire episodes to listener questions about how creativity and discipline can coexist during long research projects. Some critics nevertheless argued that the biography understates the role of assistants whose names rarely appear in popular accounts of success. Supporters replied that the author acknowledges those contributions in an appendix and invites readers to consult original sources rather than relying on simplified summaries alone. Several universities have already placed the hardback on reading lists for first-year modules that introduce critical thinking and evidence-based writing. A leading literary prize shortlisted the book, increasing sales in both print and digital formats during the busy autumn season overall.`,
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
  MOVERS: MOVERS_TEMPLATES,
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
  STARTERS: [],
  MOVERS: [
    "The teacher read a short story aloud and asked the class to draw their favourite scene.",
    "Before going home, everyone packed their bags and said goodbye to their friends.",
    "They agreed to meet again next week and continue the project together.",
  ],
  FLYERS: [
    "The students worked in pairs and checked their answers with a partner before the break.",
    "Their teacher explained the main ideas clearly and answered questions from the class.",
    "At the end of the lesson, the group wrote a short summary in their notebooks.",
    "Several pupils said they wanted to learn more about the topic at the library.",
    "The head teacher visited the classroom and praised the students for their effort.",
  ],
  KET: [
    "After reading the text, students compared answers and checked the details carefully.",
    "The teacher suggested making a short summary to remember the main points.",
    "Everyone agreed that the topic was useful for their next writing task.",
    "Copies of the notice were also sent to parents by email on Monday morning.",
    "Anyone with questions was asked to speak to the office before the deadline.",
  ],
  PET: [
    "Researchers noted that further study would be needed to confirm the long-term effects on different age groups.",
    "Several commentators argued that communities must work together to address the issue before costs rise further.",
    "Readers are encouraged to reflect on how the ideas might apply to their own town or neighbourhood.",
    "The author interviewed experts in three countries and compared policies that had already been tested in schools.",
    "Although some details remain uncertain, the overall trend suggests that early action can prevent more serious problems later.",
    "Local businesses contributed funding, while volunteers helped organise events and translate leaflets for new residents.",
    "Teachers said the proposals were realistic, provided that training and equipment were available at the start of term.",
    "Critics warned that short-term publicity campaigns rarely succeed unless they are supported by clear rules and regular review.",
    "Supporters highlighted examples where similar projects had improved attendance, confidence and collaboration among students.",
    "The committee will publish a full report next spring, including recommendations for parents, employers and council officials.",
    "In the meantime, readers can share opinions online or attend public meetings listed on the council website.",
    "Several newspapers reprinted sections of the article, sparking debate on radio programmes and social media forums.",
  ],
  FCE: [
    "Analysts stressed that policy makers should consider both economic and social consequences before approving major reforms.",
    "The findings have prompted debate among experts about how best to implement change nationwide without increasing inequality.",
    "Observers warn that ignoring local context could limit the value of any future legislation designed to solve the problem.",
    "Independent reviewers praised the methodology, though they recommended larger samples and longer follow-up periods in future studies.",
    "Stakeholders from industry, education and community groups were consulted during six months of public hearings and workshops.",
    "Several international organisations offered technical support, while universities proposed joint research programmes to monitor outcomes.",
    "Media coverage focused on personal stories, yet the report also presents detailed statistics, maps and case studies from rural areas.",
    "Lawyers noted that existing regulations may need updating to reflect new technologies and changing consumer behaviour.",
    "Campaigners welcomed the acknowledgement of past mistakes but demanded clearer timelines for action and transparent reporting.",
    "Economists calculated potential savings in healthcare, transport and energy if recommendations were adopted within five years.",
    "Teachers requested additional training, arguing that curriculum changes would fail unless staff received practical guidance and resources.",
    "Youth representatives said their views were finally taken seriously, although they wanted more seats on decision-making committees.",
    "Publishers predicted strong demand for summaries aimed at non-specialist readers who follow current affairs but lack technical knowledge.",
    "Historians compared the present situation with earlier reforms, noting both similarities and important differences in public attitudes.",
    "Environmental scientists linked the discussion to wider questions about sustainability, fairness and long-term planning in modern cities.",
    "Until official guidance is issued, organisations are advised to review internal policies and seek legal advice where necessary.",
    "The minister confirmed that pilot schemes would continue, despite pressure to announce immediate nationwide changes before the election.",
    "Citizens can respond to the consultation online, and all submissions will be published unless confidentiality is formally requested.",
  ],
};

function enrichTargetWords(level: ExamLevel): number {
  const { min, max } = PASSAGE_WORD_TARGETS[level];
  return Math.floor((min + max) / 2);
}

export function enrichReadingPassage(level: ExamLevel, passage: string): string {
  const { max } = PASSAGE_WORD_TARGETS[level];
  const target = enrichTargetWords(level);
  const extras = CURATED_APPEND[level] ?? CURATED_APPEND.KET!;
  let result = passage.trim();
  if (wordCount(result) >= target) {
    return result;
  }
  let i = 0;
  while (wordCount(result) < target && i < extras.length * 4) {
    const extra = extras[i % extras.length];
    if (!extra) break;
    const candidate = `${result} ${extra}`.trim();
    if (wordCount(candidate) > max + 15) break;
    result = candidate;
    i++;
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
