import { ExamLevel, Skill } from "@prisma/client";
import type { GapSeed, ListeningSeed, McqSeed, SpeakingSeed, WritingSeed } from "./helpers";
import { getIeltsPlacementTests } from "./placement-ielts-content";

/** Tiền tố title đề placement hiện hành — dùng để không xóa nhầm khi prune legacy */
export const PLACEMENT_TITLE_PREFIX = "Camba Placement —";

export const PLACEMENT_PAPER_TITLES = {
  YLE: `${PLACEMENT_TITLE_PREFIX} YLE (Starters / Movers / Flyers)`,
  SECONDARY: `${PLACEMENT_TITLE_PREFIX} Secondary (KET / PET / FCE)`,
  ADULT: `${PLACEMENT_TITLE_PREFIX} Adult (Giao tiếp hàng ngày & Công sở)`,
} as const;

/** Cambridge placement (Secondary/Adult) cố định 50 câu · 30 phút */
export const PLACEMENT_TOTAL_QUESTIONS = 50;
export const PLACEMENT_TIME_SECONDS = 30 * 60;
export const PLACEMENT_SECTION_COUNTS = {
  reading: 17,
  listening: 17,
  grammar: 16,
} as const;
export const PLACEMENT_CAMBRIDGE_SECTION_SECONDS = PLACEMENT_TIME_SECONDS / 3;

/** YLE placement: 33 câu khách quan + 1 Writing + 1 Speaking */
export const PLACEMENT_YLE_TOTAL_QUESTIONS = 35;
export const PLACEMENT_YLE_SECTION_COUNTS = {
  reading: 11,
  listening: 11,
  grammar: 11,
  writing: 1,
  speaking: 1,
} as const;
export const PLACEMENT_YLE_SECTION_SECONDS = {
  reading: 420,
  listening: 420,
  grammar: 420,
  writing: 480,
  speaking: 120,
} as const;
export const PLACEMENT_YLE_TIME_SECONDS =
  PLACEMENT_YLE_SECTION_SECONDS.reading +
  PLACEMENT_YLE_SECTION_SECONDS.listening +
  PLACEMENT_YLE_SECTION_SECONDS.grammar +
  PLACEMENT_YLE_SECTION_SECONDS.writing +
  PLACEMENT_YLE_SECTION_SECONDS.speaking;

/** Secondary placement: 37 câu khách quan + 1 Writing + 2 Speaking */
export const PLACEMENT_SECONDARY_TOTAL_QUESTIONS = 40;
export const PLACEMENT_SECONDARY_SECTION_COUNTS = {
  reading: 13,
  listening: 12,
  grammar: 12,
  writing: 1,
  speaking: 2,
} as const;
export const PLACEMENT_SECONDARY_SECTION_SECONDS = {
  reading: 480,
  listening: 480,
  grammar: 480,
  writing: 600,
  speaking: 300,
} as const;
export const PLACEMENT_SECONDARY_TIME_SECONDS =
  PLACEMENT_SECONDARY_SECTION_SECONDS.reading +
  PLACEMENT_SECONDARY_SECTION_SECONDS.listening +
  PLACEMENT_SECONDARY_SECTION_SECONDS.grammar +
  PLACEMENT_SECONDARY_SECTION_SECONDS.writing +
  PLACEMENT_SECONDARY_SECTION_SECONDS.speaking;

export type PlacementTrack = "YLE" | "SECONDARY" | "ADULT" | "IELTS";

export type PlacementSectionPool =
  | "reading"
  | "listening"
  | "grammar"
  | "grammarMcq"
  | "writing"
  | "speaking";

export type PlacementSectionDef = {
  skill: Skill;
  label: string;
  timeLimitSeconds: number;
  pool?: PlacementSectionPool;
};

export type PlacementSectionOrder = {
  pool: PlacementSectionPool;
  label: string;
  timeLimitSeconds: number;
};

export interface PlacementTestContent {
  track: PlacementTrack;
  title: string;
  description: string;
  level: ExamLevel;
  reading: McqSeed[];
  listening: ListeningSeed[];
  grammar: GapSeed[];
  grammarMcq?: McqSeed[];
  writing?: WritingSeed[];
  speaking?: SpeakingSeed[];
  sections: PlacementSectionDef[];
  totalTimeSeconds: number;
  sectionOrder: PlacementSectionOrder[];
}

function mcq(
  title: string,
  question: string,
  options: string[],
  answer: string,
  passage?: string
): McqSeed {
  if (!options.includes(answer)) {
    throw new Error(`Invalid MCQ "${title}": answer not in options`);
  }
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

function grammar(title: string, passage: string, answer: string): GapSeed {
  if (!passage.includes("___")) {
    throw new Error(`Grammar "${title}" must contain ___`);
  }
  return { title, passage, question: "", answer };
}

function buildYleReading(): McqSeed[] {
  const items: McqSeed[] = [
    mcq(
      "YLE R1",
      "How old is Tom?",
      ["six", "seven", "eight", "nine"],
      "seven",
      "Tom is seven years old. He lives in Hanoi with his family. He likes playing football after school."
    ),
    mcq(
      "YLE R2",
      "Where does Anna go on Saturdays?",
      ["the zoo", "the library", "the beach", "the hospital"],
      "the library",
      "Anna loves books. Every Saturday she goes to the library with her dad. She reads stories about animals."
    ),
    mcq(
      "YLE R3",
      "What colour is Ben's bike?",
      ["red", "blue", "green", "yellow"],
      "blue",
      "Ben got a new bike for his birthday. It is blue with white wheels. He rides it to the park."
    ),
    mcq(
      "YLE R4",
      "What does Lily have for lunch?",
      ["pizza", "rice and chicken", "soup only", "bread and cheese"],
      "rice and chicken",
      "At school, Lily usually has rice and chicken for lunch. She drinks water and eats an apple."
    ),
    mcq(
      "YLE R5",
      "Which word is different?",
      ["apple", "banana", "orange", "table"],
      "table",
      "Look at these words: apple, banana, orange, table."
    ),
    mcq(
      "YLE R6",
      "What is the opposite of 'hot'?",
      ["warm", "cold", "long", "new"],
      "cold",
      "Choose the opposite of the word hot."
    ),
    mcq(
      "YLE R7",
      "Who is Jack's teacher?",
      ["Mr Lee", "Mrs Brown", "Miss Green", "Mr White"],
      "Mrs Brown",
      "Jack is in Class 3B. His teacher is Mrs Brown. She teaches English and Art."
    ),
    mcq(
      "YLE R8",
      "What time does school start?",
      ["7:00", "7:30", "8:00", "8:30"],
      "7:30",
      "Emma's school starts at 7:30 in the morning. She wakes up at 6:45."
    ),
    mcq(
      "YLE R9",
      "What animal does Leo like best?",
      ["cats", "dogs", "dolphins", "horses"],
      "dolphins",
      "Leo watches videos about dolphins. He thinks they are clever and friendly."
    ),
    mcq(
      "YLE R10",
      "Where are Sara's grandparents?",
      ["in the kitchen", "in the garden", "at the shop", "at school"],
      "in the garden",
      "Sara's grandparents are in the garden. They are growing tomatoes and flowers."
    ),
    mcq(
      "YLE R11",
      "What does Noah want to buy?",
      ["a ball", "a book", "a kite", "a hat"],
      "a kite",
      "Noah has five dollars. He wants to buy a kite at the toy shop."
    ),
  ];
  return items;
}

function buildYleListening(): ListeningSeed[] {
  return [
    listen(
      "YLE L1",
      "Hello! My name is Kim. I am nine. I have a small brown dog.",
      "How old is Kim?",
      ["seven", "eight", "nine", "ten"],
      "nine"
    ),
    listen(
      "YLE L2",
      "Woman: Put on your coat, Sam. It is cold today. Boy: OK, Mum.",
      "What should Sam put on?",
      ["a hat", "a coat", "shoes", "gloves"],
      "a coat"
    ),
    listen(
      "YLE L3",
      "Teacher: Open your books to page twelve, please. Class: Yes, teacher.",
      "Which page should students open?",
      ["ten", "eleven", "twelve", "twenty"],
      "twelve"
    ),
    listen(
      "YLE L4",
      "Man: The film starts at four o'clock. Woman: Let's meet at half past three outside.",
      "When does the film start?",
      ["3:00", "3:30", "4:00", "4:30"],
      "4:00"
    ),
    listen(
      "YLE L5",
      "Girl: I don't like carrots, but I love strawberries. Mum: Good, we have some for dessert.",
      "What does the girl love?",
      ["carrots", "potatoes", "strawberries", "rice"],
      "strawberries"
    ),
    listen(
      "YLE L6",
      "Boy: Can I ride my bike to the shop? Dad: No, walk there. It's near.",
      "How should the boy go to the shop?",
      ["by bike", "by bus", "on foot", "by car"],
      "on foot"
    ),
    listen(
      "YLE L7",
      "Woman: Your piano lesson is on Tuesday at five. Boy: Thank you!",
      "When is the piano lesson?",
      ["Monday", "Tuesday", "Thursday", "Saturday"],
      "Tuesday"
    ),
    listen(
      "YLE L8",
      "Man: Look at that bird! It's yellow and green. Girl: Wow, it's beautiful!",
      "What colours is the bird?",
      ["red and blue", "yellow and green", "black and white", "brown and orange"],
      "yellow and green"
    ),
    listen(
      "YLE L9",
      "Teacher: Don't run in the classroom. Walk slowly, please.",
      "What must students do in the classroom?",
      ["run fast", "walk slowly", "shout", "sleep"],
      "walk slowly"
    ),
    listen(
      "YLE L10",
      "Mum: We're going to Grandma's house on Sunday. Dad: Great! I'll drive.",
      "How will the family travel?",
      ["by train", "by plane", "by car", "by boat"],
      "by car"
    ),
    listen(
      "YLE L11",
      "Boy: I lost my blue cap. Girl: Is this yours? Boy: Yes, thanks!",
      "What did the boy lose?",
      ["a bag", "a cap", "a book", "a phone"],
      "a cap"
    ),
  ];
}

function buildYleGrammar(): GapSeed[] {
  return [
    grammar("YLE G1", "She ___ (like) chocolate ice cream.", "likes"),
    grammar("YLE G2", "They ___ (play) football every afternoon.", "play"),
    grammar("YLE G3", "My brother ___ (watch) cartoons on TV.", "watches"),
    grammar("YLE G4", "We ___ (go) to the park on Sundays.", "go"),
    grammar("YLE G5", "The cat ___ (sleep) on the sofa.", "sleeps"),
    grammar("YLE G6", "I ___ (have) two sisters.", "have"),
    grammar("YLE G7", "He ___ (brush) his teeth every morning.", "brushes"),
    grammar("YLE G8", "Those ___ (be) my new shoes.", "are"),
    grammar("YLE G9", "There ___ (be) a library near my house.", "is"),
    grammar("YLE G10", "She is ___ (tall) than her cousin.", "taller"),
    grammar("YLE G11", "This is the ___ (good) book in the shop.", "best"),
  ];
}

function buildYleWriting(): WritingSeed[] {
  return [
    {
      title: "YLE W1",
      taskPrompt:
        "Write about your best friend. Say their name, what they look like, and what you like to do together.",
      wordLimit: 35,
      instructions: "Write 3–5 sentences in English.",
    },
  ];
}

function buildYleSpeaking(): SpeakingSeed[] {
  return [
    {
      title: "YLE S1",
      prompt:
        "Tell me about your favourite animal. What does it look like? What does it like to eat?",
      preparationTime: 15,
      speakingTime: 45,
    },
  ];
}

function buildSecondaryReading(): McqSeed[] {
  return [
    mcq(
      "SEC R1",
      "What is the main purpose of the email?",
      ["to complain", "to invite students to a club", "to cancel a trip", "to sell books"],
      "to invite students to a club",
      "Subject: English Drama Club\n\nDear students,\nWe are starting an English Drama Club on Wednesdays after school. All students from Year 7–9 are welcome. Please reply by Friday if you want to join.\nMs Tran"
    ),
    mcq(
      "SEC R2",
      "When does the club meet?",
      ["Mondays", "Wednesdays", "Fridays", "Sundays"],
      "Wednesdays",
      "Subject: English Drama Club\n\nDear students,\nWe are starting an English Drama Club on Wednesdays after school. All students from Year 7–9 are welcome. Please reply by Friday if you want to join.\nMs Tran"
    ),
    mcq(
      "SEC R3",
      "What happened to the café?",
      ["It moved", "It closed for repairs", "It opened a new branch", "It changed owners"],
      "It closed for repairs",
      "Notice: The cafeteria on the 3rd floor is closed for repairs today. Free coffee is available in the main lobby until 4 p.m."
    ),
    mcq(
      "SEC R4",
      "Where can staff get free coffee?",
      ["on the 3rd floor", "in the main lobby", "in the car park", "at the reception desk only"],
      "in the main lobby",
      "Notice: The cafeteria on the 3rd floor is closed for repairs today. Free coffee is available in the main lobby until 4 p.m."
    ),
    mcq(
      "SEC R5",
      "Why did Minh enjoy the trip?",
      ["The tickets were cheap", "The weather was sunny", "He stayed at home", "The museum was closed"],
      "The weather was sunny",
      "Minh is fourteen and lives near the river. Last weekend he visited a science museum with his family. They had lunch at a small café and bought souvenirs. Minh enjoyed the trip because the weather was sunny."
    ),
    mcq(
      "SEC R6",
      "Who did Minh travel with?",
      ["his classmates", "his family", "his teacher alone", "his neighbours"],
      "his family",
      "Minh is fourteen and lives near the river. Last weekend he visited a science museum with his family. They had lunch at a small café and bought souvenirs. Minh enjoyed the trip because the weather was sunny."
    ),
    mcq(
      "SEC R7",
      "What is Linh's opinion about online study groups?",
      ["They are always harmful", "They can help language practice", "They replace teachers", "They should be banned"],
      "They can help language practice",
      "Many teenagers, including Linh, use online study groups after school. Linh believes they help students practise English and share tips. However, too much screen time can affect sleep."
    ),
    mcq(
      "SEC R8",
      "What problem does Linh mention?",
      ["High costs", "Poor internet", "Sleep problems", "No friends"],
      "Sleep problems",
      "Many teenagers, including Linh, use online study groups after school. Linh believes they help students practise English and share tips. However, too much screen time can affect sleep."
    ),
    mcq(
      "SEC R9",
      "What benefit of city parks is mentioned?",
      ["Cheaper transport", "Better mental health", "More shopping", "Higher taxes"],
      "Better mental health",
      "Researchers found that access to green areas in cities is linked to better mental health among young volunteers. Some critics say maintenance is expensive, but reduced healthcare costs may balance the investment."
    ),
    mcq(
      "SEC R10",
      "What do critics argue?",
      ["Parks are unnecessary", "Maintenance budgets are too high", "Volunteers are unpaid", "Data is unreliable"],
      "Maintenance budgets are too high",
      "Researchers found that access to green areas in cities is linked to better mental health among young volunteers. Some critics say maintenance is expensive, but reduced healthcare costs may balance the investment."
    ),
    mcq(
      "SEC R11",
      "What should visitors do first?",
      ["buy tickets online", "register at the front desk", "call the manager", "leave their bags outside"],
      "register at the front desk",
      "Welcome to Green Valley Sports Centre. All visitors must register at the front desk and wear clean sports shoes. The swimming pool opens at 6 a.m."
    ),
    mcq(
      "SEC R12",
      "When does the pool open?",
      ["5 a.m.", "6 a.m.", "7 a.m.", "8 a.m."],
      "6 a.m.",
      "Welcome to Green Valley Sports Centre. All visitors must register at the front desk and wear clean sports shoes. The swimming pool opens at 6 a.m."
    ),
    mcq(
      "SEC R13",
      "What is the article mainly about?",
      ["school uniforms", "using phones in class", "school lunches", "exam results"],
      "using phones in class",
      "Should students use mobile phones during lessons? Some teachers say phones distract learners, while others use apps for quick vocabulary practice. The school will decide after a student survey."
    ),
  ];
}

function buildSecondaryListening(): ListeningSeed[] {
  return [
    listen(
      "SEC L1",
      "Receptionist: Good morning. The meeting in Conference Room B starts at nine fifteen. Please bring your ID badge.",
      "What time does the meeting start?",
      ["9:00", "9:15", "9:30", "10:00"],
      "9:15"
    ),
    listen(
      "SEC L2",
      "Interviewer: Why did you choose to volunteer at the community centre? Anna: I wanted to improve my communication skills and meet new people.",
      "Why did Anna volunteer?",
      ["to earn money", "to improve communication skills", "to learn cooking", "to travel abroad"],
      "to improve communication skills"
    ),
    listen(
      "SEC L3",
      "Guide: The museum tour begins at eleven, but the gift shop opens at ten. Cafeteria service starts at twelve.",
      "When does the gift shop open?",
      ["10:00", "11:00", "12:00", "1:00"],
      "10:00"
    ),
    listen(
      "SEC L4",
      "Teacher: Homework is on page forty-five, exercises two and three. The test is next Tuesday, not Monday.",
      "When is the test?",
      ["Monday", "Tuesday", "Wednesday", "Thursday"],
      "Tuesday"
    ),
    listen(
      "SEC L5",
      "Man: The train to Da Nang leaves from platform three at fourteen thirty. Woman: Thanks. I'll be there early.",
      "Which platform should they go to?",
      ["platform one", "platform two", "platform three", "platform four"],
      "platform three"
    ),
    listen(
      "SEC L6",
      "Host: Tonight's talk on climate action will be in the main hall at seven p.m. Doors open at six thirty.",
      "Where will the talk take place?",
      ["the library", "the main hall", "the sports field", "the science lab"],
      "the main hall"
    ),
    listen(
      "SEC L7",
      "Coach: Training is cancelled today because of heavy rain. We'll meet again on Thursday at the usual time.",
      "Why is training cancelled?",
      ["the coach is ill", "heavy rain", "the field is booked", "students are on holiday"],
      "heavy rain"
    ),
    listen(
      "SEC L8",
      "Customer: Do you have this jacket in medium? Assistant: Sorry, we only have small and large left.",
      "Which size is NOT available?",
      ["small", "medium", "large", "extra large"],
      "medium"
    ),
    listen(
      "SEC L9",
      "Presenter: Our guest will explain how cities can reduce traffic pollution. The Q&A session starts at four fifteen.",
      "What will the guest explain?",
      ["how to reduce traffic pollution", "how to cook healthy food", "how to learn French", "how to play chess"],
      "how to reduce traffic pollution"
    ),
    listen(
      "SEC L10",
      "Librarian: You can borrow up to three books for two weeks. Late returns cost fifty cents per day.",
      "How long can you keep the books?",
      ["one week", "two weeks", "three weeks", "one month"],
      "two weeks"
    ),
    listen(
      "SEC L11",
      "Doctor: You should drink more water and rest this weekend. Come back if the pain continues.",
      "What does the doctor advise?",
      ["take more exams", "drink more water and rest", "stop exercising forever", "change schools"],
      "drink more water and rest"
    ),
    listen(
      "SEC L12",
      "Manager: The office will move to the second floor next month. Packing starts on the twentieth.",
      "When does packing start?",
      ["the tenth", "the fifteenth", "the twentieth", "the thirtieth"],
      "the twentieth"
    ),
  ];
}

function buildSecondaryGrammar(): GapSeed[] {
  return [
    grammar("SEC G1", "She ___ (go) to school by bus every day.", "goes"),
    grammar("SEC G2", "They ___ (not finish) the project yet.", "haven't finished"),
    grammar("SEC G3", "If it rains, we ___ (stay) at home.", "will stay"),
    grammar("SEC G4", "This book is ___ (interesting) than the last one.", "more interesting"),
    grammar("SEC G5", "He has lived here ___ 2019.", "since"),
    grammar("SEC G6", "The letter ___ (write) yesterday.", "was written"),
    grammar("SEC G7", "You ___ (must not) use your phone during the exam.", "must not"),
    grammar("SEC G8", "I look forward to ___ (hear) from you soon.", "hearing"),
    grammar("SEC G9", "Neither Tom nor his sisters ___ (be) at home now.", "are"),
    grammar("SEC G10", "She asked me where I ___ (buy) the dictionary.", "bought"),
    grammar("SEC G11", "There isn't ___ sugar left in the jar.", "much"),
    grammar("SEC G12", "By next June, they ___ (complete) the course.", "will have completed"),
  ];
}

function buildSecondaryWriting(): WritingSeed[] {
  return [
    {
      title: "SEC W1",
      taskPrompt:
        "Write an email to your English friend Sam about a party last weekend.\n\n• where it was\n• what you did\n• why you enjoyed it\n\nWrite 25–35 words.",
      wordLimit: 35,
      instructions: "Informal email in past tense.",
    },
  ];
}

function buildSecondarySpeaking(): SpeakingSeed[] {
  return [
    {
      title: "SEC S1",
      prompt:
        "Describe your favourite place to study. Say where it is, what you do there, and why you like it.",
      preparationTime: 15,
      speakingTime: 60,
    },
    {
      title: "SEC S2",
      prompt:
        "Talk about a hobby you enjoy. When did you start? How often do you do it? Why do you like it?",
      preparationTime: 15,
      speakingTime: 60,
    },
  ];
}

function buildAdultReading(): McqSeed[] {
  return [
    // —— Easy (6) ——
    mcq(
      "ADU R1",
      "What time does the office open?",
      ["7:00 a.m.", "8:00 a.m.", "9:00 a.m.", "10:00 a.m."],
      "8:00 a.m.",
      "Office Hours: Reception is open Monday–Friday, 8:00 a.m. to 6:00 p.m. The help desk closes at 5:30 p.m."
    ),
    mcq(
      "ADU R2",
      "Where should staff get coffee today?",
      ["the 3rd-floor cafeteria", "the main lobby", "the car park", "Room B"],
      "the main lobby",
      "Notice: The 3rd-floor cafeteria is closed for maintenance today. Complimentary coffee is available in the main lobby until 4 p.m."
    ),
    mcq(
      "ADU R3",
      "When is the team meeting now?",
      ["Wednesday 10 a.m.", "Thursday 10 a.m.", "Friday 9 a.m.", "Thursday 2 p.m."],
      "Thursday 10 a.m.",
      "Subject: Team sync moved to Thursday\n\nHi all,\nDue to the client visit on Wednesday, our weekly sync will move to Thursday at 10 a.m. in Room B. Please update your calendars.\nRegards, HR"
    ),
    mcq(
      "ADU R4",
      "What must visitors do at the sports centre?",
      ["register at the front desk", "pay in cash only", "bring their own shoes", "book online first"],
      "register at the front desk",
      "Welcome to Green Valley Sports Centre. All visitors must register at the front desk and wear clean indoor shoes. The pool opens at 6 a.m."
    ),
    mcq(
      "ADU R5",
      "How much is the daily late fee for library books?",
      ["free", "twenty cents", "fifty cents", "one dollar"],
      "fifty cents",
      "Library policy: Borrow up to three books for two weeks. Late returns are charged fifty cents per day."
    ),
    mcq(
      "ADU R6",
      "Is parking free on weekends?",
      ["Yes, always", "No, never", "Only for staff with a badge", "Only on Sundays"],
      "Yes, always",
      "Visitor Parking: Weekday parking costs $3 per hour. Weekend parking is free for all staff and visitors in the north lot."
    ),
    // —— Medium (6) ——
    mcq(
      "ADU R7",
      "What is the email mainly about?",
      ["a job offer", "a meeting schedule change", "a product recall", "a holiday policy"],
      "a meeting schedule change",
      "Subject: Team sync moved to Thursday\n\nHi all,\nDue to the client visit on Wednesday, our weekly sync will move to Thursday at 10 a.m. in Room B. Please update your calendars.\nRegards, HR"
    ),
    mcq(
      "ADU R8",
      "What is the purpose of the workshop?",
      ["teach presentation skills", "sell insurance", "train new software", "organise a sports event"],
      "teach presentation skills",
      "Professional Skills Workshop — Saturday 9 a.m.–12 p.m., Room 12. Learn to prepare CVs and deliver short presentations in English. Open to staff aged 18+."
    ),
    mcq(
      "ADU R9",
      "What is the report's main finding?",
      ["Sales fell last quarter", "Customer satisfaction rose after staff training", "A new CEO was hired", "Prices will double"],
      "Customer satisfaction rose after staff training",
      "Quarterly Report: After customer-service training, satisfaction scores increased by 12%. Response times also improved across all regions."
    ),
    mcq(
      "ADU R10",
      "What does the contract clause allow?",
      ["unpaid leave after six months", "remote work two days per week", "free company cars", "unlimited overtime pay"],
      "remote work two days per week",
      "Contract excerpt: Employees may work remotely up to two days per week after completing probation, subject to manager approval."
    ),
    mcq(
      "ADU R11",
      "Why was the flight delayed?",
      ["heavy fog", "a technical check", "staff strike", "lost luggage"],
      "a technical check",
      "Announcement: Flight VN204 to Singapore is delayed by forty minutes due to a routine technical check. Boarding will begin at Gate 7."
    ),
    mcq(
      "ADU R12",
      "What should applicants include?",
      ["a cover letter and CV", "a medical certificate", "three references only", "a video interview"],
      "a cover letter and CV",
      "Job posting: Send your CV and a short cover letter to careers@example.com before Friday. Shortlisted candidates will be contacted within ten days."
    ),
    // —— Hard (5) ——
    mcq(
      "ADU R13",
      "What does the article suggest about remote work?",
      ["It always reduces productivity", "It can improve focus but needs clear communication", "It should be banned", "It only works for managers"],
      "It can improve focus but needs clear communication",
      "Many companies now offer hybrid schedules. Surveys show remote days can improve focus, yet teams need clear communication channels to avoid delays and misunderstandings."
    ),
    mcq(
      "ADU R14",
      "What should customers do if they want a refund?",
      ["bring the receipt within 14 days", "pay a 50% fee", "call the manager only", "exchange online only"],
      "bring the receipt within 14 days",
      "Store policy: You may return unused items within 14 days with the original receipt for a full refund. Without a receipt, we can offer store credit only."
    ),
    mcq(
      "ADU R15",
      "What is the trainer's view of AI tools?",
      ["They replace all jobs", "They can support writing but need human review", "They should be illegal", "They are useless"],
      "They can support writing but need human review",
      "The trainer explained that AI tools can draft emails faster, but humans must review tone, facts, and confidentiality before sending."
    ),
    mcq(
      "ADU R16",
      "What can be inferred about the company's language policy?",
      ["English is required only for managers", "Strong English may help staff access international opportunities", "Staff must pass a test every year", "Training is optional and unpaid"],
      "Strong English may help staff access international opportunities",
      "Language note: Strong English skills can open international roles, help in multinational teams, and improve access to online professional courses."
    ),
    mcq(
      "ADU R17",
      "What will happen next month according to the memo?",
      ["Marketing and Sales will move floors", "All staff will work remotely", "IT support will close", "The building will be renovated completely"],
      "Marketing and Sales will move floors",
      "Internal memo: From next month, Marketing and Sales will move to the second floor. IT support desk remains on the ground floor."
    ),
  ];
}

function buildAdultListening(): ListeningSeed[] {
  return [
    // —— Easy (6) ——
    listen(
      "ADU L1",
      "Receptionist: Good morning. Your interview is at two fifteen in Conference Room C. Please bring your ID.",
      "What time is the interview?",
      ["1:15", "2:15", "2:45", "3:15"],
      "2:15"
    ),
    listen(
      "ADU L2",
      "Assistant: The printer on the second floor is working again. You can collect your documents now.",
      "Where is the printer?",
      ["the ground floor", "the second floor", "the car park", "the cafeteria"],
      "the second floor"
    ),
    listen(
      "ADU L3",
      "Customer: I'd like to return this jacket. It's the wrong size. Assistant: Do you have the receipt?",
      "Why does the customer want to return the jacket?",
      ["wrong size", "wrong colour", "it is damaged", "it is too expensive"],
      "wrong size"
    ),
    listen(
      "ADU L4",
      "Doctor: You should rest this weekend and drink plenty of water. Come back if symptoms continue.",
      "What does the doctor advise?",
      ["rest and drink water", "stop exercising forever", "take a new job", "travel abroad"],
      "rest and drink water"
    ),
    listen(
      "ADU L5",
      "Technician: Your laptop is ready. We replaced the battery. That will be thirty dollars including labour.",
      "What was replaced?",
      ["the screen", "the battery", "the keyboard", "the hard drive"],
      "the battery"
    ),
    listen(
      "ADU L6",
      "Guide: The boat tour lasts ninety minutes. Life jackets are under your seats.",
      "How long is the boat tour?",
      ["sixty minutes", "seventy-five minutes", "ninety minutes", "two hours"],
      "ninety minutes"
    ),
    // —— Medium (6) ——
    listen(
      "ADU L7",
      "Manager: The budget meeting is postponed until next Monday because the director is travelling.",
      "When is the budget meeting now?",
      ["this Friday", "next Monday", "tomorrow", "next Wednesday"],
      "next Monday"
    ),
    listen(
      "ADU L8",
      "Colleague: Could you send me the sales figures by end of day? I need them for tomorrow's report.",
      "When does the colleague need the figures?",
      ["by end of day", "next week", "after the holiday", "in two hours only"],
      "by end of day"
    ),
    listen(
      "ADU L9",
      "HR: New staff must complete the safety induction online before their first shift on site.",
      "What must new staff do first?",
      ["complete safety induction online", "work overtime", "buy uniforms", "pass a driving test"],
      "complete safety induction online"
    ),
    listen(
      "ADU L10",
      "Presenter: Our Q&A session will start at four fifteen, right after the coffee break.",
      "When does the Q&A start?",
      ["3:15", "4:00", "4:15", "4:45"],
      "4:15"
    ),
    listen(
      "ADU L11",
      "Trainer: Please mute your microphone when you're not speaking to reduce background noise.",
      "What should participants do when not speaking?",
      ["mute the microphone", "leave the meeting", "turn off the camera permanently", "share their screen"],
      "mute the microphone"
    ),
    listen(
      "ADU L12",
      "Airport: Passengers on flight BA812 to London should proceed to Gate 22 for boarding.",
      "Where should passengers go?",
      ["Gate 12", "Gate 22", "Baggage claim", "Immigration"],
      "Gate 22"
    ),
    // —— Hard (5) ——
    listen(
      "ADU L13",
      "HR officer: Interviews will be held online next week. Please test your camera and microphone beforehand.",
      "What is implied about the interview format?",
      ["Candidates must travel to the office", "Candidates need working video equipment", "Interviews will be cancelled", "Only phone calls will be used"],
      "Candidates need working video equipment"
    ),
    listen(
      "ADU L14",
      "Supervisor: Overtime this week must be approved in writing before you stay late.",
      "What can be inferred about overtime policy?",
      ["Staff can stay late whenever they want", "Unapproved overtime may not be accepted", "Overtime is always paid double", "Written approval is optional"],
      "Unapproved overtime may not be accepted"
    ),
    listen(
      "ADU L15",
      "Client: Could we reschedule our call to three thirty? Something urgent came up.",
      "Why does the client want to reschedule?",
      ["an urgent matter arose", "the price changed", "the office is closed", "the line is busy"],
      "an urgent matter arose"
    ),
    listen(
      "ADU L16",
      "Receptionist: Your table for two is ready. Please follow me to window seat number eight.",
      "Where is the customer's table?",
      ["near the kitchen", "at window seat 8", "outside", "at the bar"],
      "at window seat 8"
    ),
    listen(
      "ADU L17",
      "Librarian: You can renew books online twice. After that, please return them to the desk.",
      "What happens after two online renewals?",
      ["Books must be returned in person", "Fines are doubled automatically", "Borrowing is blocked forever", "Staff will renew again for free"],
      "Books must be returned in person"
    ),
  ];
}

function buildAdultGrammarMcq(): McqSeed[] {
  return [
    // —— Easy (5) ——
    mcq(
      "ADU G1",
      "She has worked here ___ three years.",
      ["for", "since", "during", "from"],
      "for"
    ),
    mcq(
      "ADU G2",
      "I ___ to the office by bus every day.",
      ["go", "goes", "going", "gone"],
      "go"
    ),
    mcq(
      "ADU G3",
      "There are too ___ emails in my inbox.",
      ["much", "many", "little", "few"],
      "many"
    ),
    mcq(
      "ADU G4",
      "He ___ lunch at noon yesterday.",
      ["have", "had", "has", "having"],
      "had"
    ),
    mcq(
      "ADU G5",
      "We need ___ time to finish the report.",
      ["more", "many", "most", "fewer"],
      "more"
    ),
    // —— Medium (6) ——
    mcq(
      "ADU G6",
      "If we ___ earlier, we would have caught the train.",
      ["leave", "left", "had left", "have left"],
      "had left"
    ),
    mcq(
      "ADU G7",
      "The report must ___ before Friday.",
      ["submit", "be submitted", "submitting", "to submit"],
      "be submitted"
    ),
    mcq(
      "ADU G8",
      "Neither the manager nor the assistants ___ available now.",
      ["is", "are", "was", "be"],
      "are"
    ),
    mcq(
      "ADU G9",
      "I look forward to ___ from you soon.",
      ["hear", "hearing", "heard", "hears"],
      "hearing"
    ),
    mcq(
      "ADU G10",
      "She ___ in Berlin since 2020.",
      ["live", "lives", "has lived", "is living"],
      "has lived"
    ),
    mcq(
      "ADU G11",
      "The workshop, ___ was held online, saved travel costs.",
      ["who", "which", "where", "whose"],
      "which"
    ),
    // —— Hard (5) ——
    mcq(
      "ADU G12",
      "By the time we arrived, the meeting ___ already started.",
      ["has", "had", "was", "is"],
      "had"
    ),
    mcq(
      "ADU G13",
      "I'm not used to ___ up so early for work.",
      ["get", "getting", "got", "gets"],
      "getting"
    ),
    mcq(
      "ADU G14",
      "She asked me if I ___ the email yesterday.",
      ["send", "sent", "had sent", "sending"],
      "had sent"
    ),
    mcq(
      "ADU G15",
      "You'd better ___ the client before five o'clock.",
      ["call", "calling", "to call", "called"],
      "call"
    ),
    mcq(
      "ADU G16",
      "Despite ___ tired, he finished the report on time.",
      ["be", "was", "being", "been"],
      "being"
    ),
  ];
}

function secondarySectionOrder(): PlacementSectionOrder[] {
  const t = PLACEMENT_SECONDARY_SECTION_SECONDS;
  return [
    { pool: "reading", label: "Reading", timeLimitSeconds: t.reading },
    { pool: "listening", label: "Listening", timeLimitSeconds: t.listening },
    { pool: "grammar", label: "Grammar", timeLimitSeconds: t.grammar },
    { pool: "writing", label: "Writing", timeLimitSeconds: t.writing },
    { pool: "speaking", label: "Speaking", timeLimitSeconds: t.speaking },
  ];
}

function secondarySections(): PlacementSectionDef[] {
  const t = PLACEMENT_SECONDARY_SECTION_SECONDS;
  return [
    { skill: Skill.READING, label: "Reading", timeLimitSeconds: t.reading, pool: "reading" },
    {
      skill: Skill.LISTENING,
      label: "Listening",
      timeLimitSeconds: t.listening,
      pool: "listening",
    },
    {
      skill: Skill.USE_OF_ENGLISH,
      label: "Grammar",
      timeLimitSeconds: t.grammar,
      pool: "grammar",
    },
    { skill: Skill.WRITING, label: "Writing", timeLimitSeconds: t.writing, pool: "writing" },
    { skill: Skill.SPEAKING, label: "Speaking", timeLimitSeconds: t.speaking, pool: "speaking" },
  ];
}

function yleSectionOrder(): PlacementSectionOrder[] {
  const t = PLACEMENT_YLE_SECTION_SECONDS;
  return [
    { pool: "reading", label: "Reading", timeLimitSeconds: t.reading },
    { pool: "listening", label: "Listening", timeLimitSeconds: t.listening },
    { pool: "grammar", label: "Grammar", timeLimitSeconds: t.grammar },
    { pool: "writing", label: "Writing", timeLimitSeconds: t.writing },
    { pool: "speaking", label: "Speaking", timeLimitSeconds: t.speaking },
  ];
}

function yleSections(): PlacementSectionDef[] {
  const t = PLACEMENT_YLE_SECTION_SECONDS;
  return [
    { skill: Skill.READING, label: "Reading", timeLimitSeconds: t.reading, pool: "reading" },
    {
      skill: Skill.LISTENING,
      label: "Listening",
      timeLimitSeconds: t.listening,
      pool: "listening",
    },
    {
      skill: Skill.USE_OF_ENGLISH,
      label: "Grammar",
      timeLimitSeconds: t.grammar,
      pool: "grammar",
    },
    { skill: Skill.WRITING, label: "Writing", timeLimitSeconds: t.writing, pool: "writing" },
    { skill: Skill.SPEAKING, label: "Speaking", timeLimitSeconds: t.speaking, pool: "speaking" },
  ];
}

function cambridgeSectionOrder(useGrammarMcq = false): PlacementSectionOrder[] {
  const t = PLACEMENT_CAMBRIDGE_SECTION_SECONDS;
  return [
    { pool: "reading", label: "Reading", timeLimitSeconds: t },
    { pool: "listening", label: "Listening", timeLimitSeconds: t },
    {
      pool: useGrammarMcq ? "grammarMcq" : "grammar",
      label: "Grammar",
      timeLimitSeconds: t,
    },
  ];
}

function cambridgeSections(useGrammarMcq: boolean): PlacementSectionDef[] {
  return [
    {
      skill: Skill.READING,
      label: "Reading",
      timeLimitSeconds: PLACEMENT_CAMBRIDGE_SECTION_SECONDS,
      pool: "reading",
    },
    {
      skill: Skill.LISTENING,
      label: "Listening",
      timeLimitSeconds: PLACEMENT_CAMBRIDGE_SECTION_SECONDS,
      pool: "listening",
    },
    {
      skill: Skill.USE_OF_ENGLISH,
      label: useGrammarMcq ? "Grammar" : "Grammar",
      timeLimitSeconds: PLACEMENT_CAMBRIDGE_SECTION_SECONDS,
      pool: useGrammarMcq ? "grammarMcq" : "grammar",
    },
  ];
}

function validateTest(content: PlacementTestContent) {
  const grammarCount = content.grammarMcq?.length ?? content.grammar.length;
  const writingCount = content.writing?.length ?? 0;
  const speakingCount = content.speaking?.length ?? 0;
  const total =
    content.reading.length + content.listening.length + grammarCount + writingCount + speakingCount;
  let expected = 0;
  for (const sec of content.sectionOrder) {
    if (sec.pool === "reading") expected += content.reading.length;
    else if (sec.pool === "listening") expected += content.listening.length;
    else if (sec.pool === "grammarMcq") expected += content.grammarMcq?.length ?? 0;
    else if (sec.pool === "grammar") expected += content.grammar.length;
    else if (sec.pool === "writing") expected += content.writing?.length ?? 0;
    else if (sec.pool === "speaking") expected += content.speaking?.length ?? 0;
  }
  if (total !== expected) {
    throw new Error(`${content.title}: tổng câu ${total} ≠ sections ${expected}`);
  }
  const sectionTime = content.sectionOrder.reduce((s, x) => s + x.timeLimitSeconds, 0);
  if (sectionTime !== content.totalTimeSeconds) {
    throw new Error(`${content.title}: tổng thời gian sections ≠ totalTimeSeconds`);
  }
}

export function getPlacementTests(): PlacementTestContent[] {
  const cambridgeOrder = cambridgeSectionOrder(false);
  const tests: PlacementTestContent[] = [
    {
      track: "YLE",
      title: PLACEMENT_PAPER_TITLES.YLE,
      description:
        "35 câu · 31 phút · Reading, Listening, Grammar, Writing & Speaking — đánh giá trình độ YLE theo CEFR",
      level: ExamLevel.MOVERS,
      reading: buildYleReading(),
      listening: buildYleListening(),
      grammar: buildYleGrammar(),
      writing: buildYleWriting(),
      speaking: buildYleSpeaking(),
      sections: yleSections(),
      totalTimeSeconds: PLACEMENT_YLE_TIME_SECONDS,
      sectionOrder: yleSectionOrder(),
    },
    {
      track: "SECONDARY",
      title: PLACEMENT_PAPER_TITLES.SECONDARY,
      description:
        "40 câu · 39 phút · Reading, Listening, Grammar, Writing & Speaking — đánh giá trình độ Cambridge THCS–THPT",
      level: ExamLevel.KET,
      reading: buildSecondaryReading(),
      listening: buildSecondaryListening(),
      grammar: buildSecondaryGrammar(),
      writing: buildSecondaryWriting(),
      speaking: buildSecondarySpeaking(),
      sections: secondarySections(),
      totalTimeSeconds: PLACEMENT_SECONDARY_TIME_SECONDS,
      sectionOrder: secondarySectionOrder(),
    },
    {
      track: "ADULT",
      title: PLACEMENT_PAPER_TITLES.ADULT,
      description:
        "50 câu · 30 phút · Reading, Listening & Grammar — giao tiếp hàng ngày & công sở, kết quả theo CEFR",
      level: ExamLevel.PET,
      reading: buildAdultReading(),
      listening: buildAdultListening(),
      grammar: [],
      grammarMcq: buildAdultGrammarMcq(),
      sections: cambridgeSections(true),
      totalTimeSeconds: PLACEMENT_TIME_SECONDS,
      sectionOrder: cambridgeSectionOrder(true),
    },
    ...getIeltsPlacementTests(),
  ];

  for (const test of tests) {
    validateTest(test);
  }

  return tests;
}
