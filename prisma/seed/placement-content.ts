import { ExamLevel } from "@prisma/client";
import type { GapSeed, ListeningSeed, McqSeed } from "./helpers";

/** Tiền tố title đề placement hiện hành — dùng để không xóa nhầm khi prune legacy */
export const PLACEMENT_TITLE_PREFIX = "Camba Placement —";

export const PLACEMENT_PAPER_TITLES = {
  YLE: `${PLACEMENT_TITLE_PREFIX} YLE (Starters / Movers / Flyers)`,
  SECONDARY: `${PLACEMENT_TITLE_PREFIX} Secondary (KET / PET / FCE)`,
  ADULT: `${PLACEMENT_TITLE_PREFIX} Adult (Professional English)`,
} as const;

export const PLACEMENT_TOTAL_QUESTIONS = 50;
export const PLACEMENT_TIME_SECONDS = 30 * 60;
export const PLACEMENT_SECTION_COUNTS = {
  reading: 17,
  listening: 17,
  grammar: 16,
} as const;

export interface PlacementTestContent {
  track: "YLE" | "SECONDARY" | "ADULT";
  title: string;
  description: string;
  level: ExamLevel;
  reading: McqSeed[];
  listening: ListeningSeed[];
  grammar: GapSeed[];
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
    mcq(
      "YLE R12",
      "How does Olivia go to school?",
      ["by bus", "by car", "on foot", "by train"],
      "by bus",
      "Olivia takes the bus to school every day. The bus stop is near her house."
    ),
    mcq(
      "YLE R13",
      "What is Mia doing now?",
      ["sleeping", "doing homework", "cooking", "swimming"],
      "doing homework",
      "It is 5 p.m. Mia is doing her homework at the desk in her bedroom."
    ),
    mcq(
      "YLE R14",
      "Which day is the school trip?",
      ["Monday", "Wednesday", "Friday", "Sunday"],
      "Friday",
      "Notice: The Class 4 school trip to the museum is on Friday. Please bring a packed lunch."
    ),
    mcq(
      "YLE R15",
      "What can you find in Lucy's bag?",
      ["a phone", "a pencil case", "a football", "a coat"],
      "a pencil case",
      "Lucy opens her bag. There is a pencil case, a water bottle, and a notebook inside."
    ),
    mcq(
      "YLE R16",
      "Who is younger?",
      ["Dan", "his brother", "they are the same age", "their cousin"],
      "his brother",
      "Dan is ten years old. His brother is eight, so his brother is younger."
    ),
    mcq(
      "YLE R17",
      "What is the weather like today?",
      ["rainy", "snowy", "sunny", "windy"],
      "sunny",
      "The sky is blue and the sun is shining. It is a sunny day, so we can play outside."
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
    listen(
      "YLE L12",
      "Woman: The supermarket closes at eight tonight. Man: Let's go before seven.",
      "When does the supermarket close?",
      ["six", "seven", "eight", "nine"],
      "eight"
    ),
    listen(
      "YLE L13",
      "Girl: My favourite subject is science. We do fun experiments.",
      "What is the girl's favourite subject?",
      ["maths", "science", "history", "music"],
      "science"
    ),
    listen(
      "YLE L14",
      "Man: Turn left at the bank, then the post office is on the right.",
      "Where is the post office?",
      ["on the left", "on the right", "behind the bank", "inside the bank"],
      "on the right"
    ),
    listen(
      "YLE L15",
      "Boy: Can we have pasta for dinner? Mum: Yes, and salad too.",
      "What will they have for dinner?",
      ["pasta and salad", "rice only", "pizza", "soup only"],
      "pasta and salad"
    ),
    listen(
      "YLE L16",
      "Teacher: Remember to bring your swimming things on Thursday.",
      "What should students bring on Thursday?",
      ["football boots", "swimming things", "a guitar", "a laptop"],
      "swimming things"
    ),
    listen(
      "YLE L17",
      "Girl: Happy birthday, Tom! Here's your present. Boy: Thank you! I love this game.",
      "What is Tom getting?",
      ["a game", "a coat", "a bike", "a book about fish"],
      "a game"
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
    grammar("YLE G12", "We ___ (not eat) meat on Mondays.", "don't eat"),
    grammar("YLE G13", "I ___ (can) swim very well.", "can"),
    grammar("YLE G14", "He can ___ (ride) a bike very well.", "ride"),
    grammar("YLE G15", "They are ___ (read) a story now.", "reading"),
    grammar("YLE G16", "I ___ (visit) my grandma last weekend.", "visited"),
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
    mcq(
      "SEC R14",
      "What will happen next?",
      ["Phones will be banned immediately", "A student survey will be held", "Teachers will buy new apps", "Lessons will be shorter"],
      "A student survey will be held",
      "Should students use mobile phones during lessons? Some teachers say phones distract learners, while others use apps for quick vocabulary practice. The school will decide after a student survey."
    ),
    mcq(
      "SEC R15",
      "Where is the lost item?",
      ["in the library", "in the gym changing room", "on the bus", "in the canteen"],
      "in the gym changing room",
      "Lost property: A blue water bottle with the name 'Huy' was found in the gym changing room. Collect it from the school office before Friday."
    ),
    mcq(
      "SEC R16",
      "By when must Huy collect the bottle?",
      ["Wednesday", "Thursday", "Friday", "Monday"],
      "Friday",
      "Lost property: A blue water bottle with the name 'Huy' was found in the gym changing room. Collect it from the school office before Friday."
    ),
    mcq(
      "SEC R17",
      "What is true about the workshop?",
      ["It is only for teachers", "It teaches presentation skills", "It lasts one hour", "It is on Sunday"],
      "It teaches presentation skills",
      "Career Skills Workshop — Saturday 9 a.m.–12 p.m. in Room 12. Learn how to prepare CVs and give short presentations in English. Open to students aged 15–18."
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
    listen(
      "SEC L13",
      "Reporter: Local students planted two hundred trees near the river to protect wildlife habitats.",
      "Why did students plant trees?",
      ["to sell fruit", "to protect wildlife habitats", "to build houses", "to make paper"],
      "to protect wildlife habitats"
    ),
    listen(
      "SEC L14",
      "Tour guide: The boat trip lasts ninety minutes. Life jackets are under your seats.",
      "How long is the boat trip?",
      ["sixty minutes", "seventy-five minutes", "ninety minutes", "two hours"],
      "ninety minutes"
    ),
    listen(
      "SEC L15",
      "HR officer: Please email your CV before Friday. Interviews will be online next week.",
      "How will interviews be held?",
      ["in person only", "online", "by phone only", "by post"],
      "online"
    ),
    listen(
      "SEC L16",
      "Organiser: The charity run begins at eight a.m. Registration closes at seven forty-five.",
      "When does registration close?",
      ["7:15", "7:30", "7:45", "8:00"],
      "7:45"
    ),
    listen(
      "SEC L17",
      "Technician: Your laptop is ready. The new battery costs thirty dollars including installation.",
      "What was replaced?",
      ["the screen", "the battery", "the keyboard", "the camera"],
      "the battery"
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
    grammar("SEC G13", "He is keen ___ learning new languages.", "on"),
    grammar("SEC G14", "The manager made us ___ (work) late last night.", "work"),
    grammar("SEC G15", "Hardly ___ I arrived when the meeting started.", "had"),
    grammar("SEC G16", "Not only did she pass, but she also ___ (win) a prize.", "won"),
  ];
}

function buildAdultReading(): McqSeed[] {
  return [
    mcq(
      "ADU R1",
      "What is the email mainly about?",
      ["a job offer", "a meeting schedule change", "a product recall", "a holiday policy"],
      "a meeting schedule change",
      "Subject: Team sync moved to Thursday\n\nHi all,\nDue to the client visit on Wednesday, our weekly sync will move to Thursday at 10 a.m. in Room B. Please update your calendars.\nRegards, HR"
    ),
    mcq(
      "ADU R2",
      "When is the meeting now?",
      ["Wednesday 10 a.m.", "Thursday 10 a.m.", "Friday 9 a.m.", "Thursday 2 p.m."],
      "Thursday 10 a.m.",
      "Subject: Team sync moved to Thursday\n\nHi all,\nDue to the client visit on Wednesday, our weekly sync will move to Thursday at 10 a.m. in Room B. Please update your calendars.\nRegards, HR"
    ),
    mcq(
      "ADU R3",
      "What should employees do about the cafeteria?",
      ["use the 3rd floor today", "get coffee in the lobby", "bring lunch from home", "close early"],
      "get coffee in the lobby",
      "Notice: The 3rd-floor cafeteria is closed for maintenance today. Complimentary coffee is available in the main lobby until 4 p.m."
    ),
    mcq(
      "ADU R4",
      "What is the purpose of the workshop?",
      ["teach presentation skills", "sell insurance", "train new software", "organise a sports event"],
      "teach presentation skills",
      "Professional Skills Workshop — Saturday 9 a.m.–12 p.m., Room 12. Learn to prepare CVs and deliver short presentations in English. Open to staff aged 18+."
    ),
    mcq(
      "ADU R5",
      "What does the article suggest about remote work?",
      ["It always reduces productivity", "It can improve focus but needs clear communication", "It should be banned", "It only works for managers"],
      "It can improve focus but needs clear communication",
      "Many companies now offer hybrid schedules. Surveys show remote days can improve focus, yet teams need clear communication channels to avoid delays and misunderstandings."
    ),
    mcq(
      "ADU R6",
      "What problem do critics mention about city parks?",
      ["They are too small", "Maintenance costs are high", "They attract too many tourists", "They close at night"],
      "Maintenance costs are high",
      "Urban green spaces may improve wellbeing, but critics argue maintenance budgets are significant. Supporters claim long-term health savings can offset the expense."
    ),
    mcq(
      "ADU R7",
      "What must visitors do at the sports centre?",
      ["register at the front desk", "pay in cash only", "bring their own shoes", "book online first"],
      "register at the front desk",
      "Welcome to Green Valley Sports Centre. All visitors must register at the front desk and wear clean indoor shoes. The pool opens at 6 a.m."
    ),
    mcq(
      "ADU R8",
      "What is the report's main finding?",
      ["Sales fell last quarter", "Customer satisfaction rose after staff training", "A new CEO was hired", "Prices will double"],
      "Customer satisfaction rose after staff training",
      "Quarterly Report: After customer-service training, satisfaction scores increased by 12%. Response times also improved across all regions."
    ),
    mcq(
      "ADU R9",
      "What does the notice say about late returns?",
      ["There is no fee", "Books cost fifty cents per day", "Books cannot be renewed", "Only staff may borrow"],
      "Books cost fifty cents per day",
      "Library policy: Borrow up to three books for two weeks. Late returns are charged fifty cents per day."
    ),
    mcq(
      "ADU R10",
      "What is recommended for the presentation?",
      ["use more slides", "keep it under ten minutes", "avoid eye contact", "read every word on the screen"],
      "keep it under ten minutes",
      "Presentation tip: Focus on one clear message, use examples, and keep your talk under ten minutes so the audience stays engaged."
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
      "What does the contract clause allow?",
      ["unpaid leave after six months", "remote work two days per week", "free company cars", "unlimited overtime pay"],
      "remote work two days per week",
      "Contract excerpt: Employees may work remotely up to two days per week after completing probation, subject to manager approval."
    ),
    mcq(
      "ADU R13",
      "What is the trainer's view of AI tools?",
      ["They replace all jobs", "They can support writing but need human review", "They should be illegal", "They are useless"],
      "They can support writing but need human review",
      "The trainer explained that AI tools can draft emails faster, but humans must review tone, facts, and confidentiality before sending."
    ),
    mcq(
      "ADU R14",
      "What should applicants include?",
      ["a cover letter and CV", "a medical certificate", "three references only", "a video interview"],
      "a cover letter and CV",
      "Job posting: Send your CV and a short cover letter to careers@example.com before Friday. Shortlisted candidates will be contacted within ten days."
    ),
    mcq(
      "ADU R15",
      "What caused the traffic alert?",
      ["roadworks on the bridge", "a sports parade", "snow", "a power cut"],
      "roadworks on the bridge",
      "Traffic update: Expect delays on the city bridge due to roadworks until 6 p.m. Use the riverside route if possible."
    ),
    mcq(
      "ADU R16",
      "What benefit is mentioned for learning English?",
      ["better career opportunities abroad", "free holidays", "shorter working hours", "guaranteed promotion"],
      "better career opportunities abroad",
      "Language note: Strong English skills can open international roles, help in multinational teams, and improve access to online professional courses."
    ),
    mcq(
      "ADU R17",
      "What will happen next month?",
      ["the office will move floors", "all staff will retire", "prices will be frozen", "the company will close"],
      "the office will move floors",
      "Internal memo: From next month, Marketing and Sales will move to the second floor. IT support desk remains on the ground floor."
    ),
  ];
}

function buildAdultListening(): ListeningSeed[] {
  return [
    listen(
      "ADU L1",
      "Receptionist: Good morning. Your interview is at two fifteen in Conference Room C. Please bring your ID.",
      "What time is the interview?",
      ["1:15", "2:15", "2:45", "3:15"],
      "2:15"
    ),
    listen(
      "ADU L2",
      "Manager: The budget meeting is postponed until next Monday because the director is travelling.",
      "When is the budget meeting now?",
      ["this Friday", "next Monday", "tomorrow", "next Wednesday"],
      "next Monday"
    ),
    listen(
      "ADU L3",
      "Colleague: Could you send me the sales figures by end of day? I need them for tomorrow's report.",
      "When does the colleague need the figures?",
      ["by end of day", "next week", "after the holiday", "in two hours only"],
      "by end of day"
    ),
    listen(
      "ADU L4",
      "HR: New staff must complete the safety induction online before their first shift on site.",
      "What must new staff do first?",
      ["complete safety induction online", "work overtime", "buy uniforms", "pass a driving test"],
      "complete safety induction online"
    ),
    listen(
      "ADU L5",
      "Customer: I'd like to return this jacket. It's the wrong size. Assistant: Do you have the receipt?",
      "Why does the customer want to return the jacket?",
      ["wrong size", "wrong colour", "it is damaged", "it is too expensive"],
      "wrong size"
    ),
    listen(
      "ADU L6",
      "Presenter: Our Q&A session will start at four fifteen, right after the coffee break.",
      "When does the Q&A start?",
      ["3:15", "4:00", "4:15", "4:45"],
      "4:15"
    ),
    listen(
      "ADU L7",
      "Doctor: You should rest this weekend and drink plenty of water. Come back if symptoms continue.",
      "What does the doctor advise?",
      ["rest and drink water", "stop exercising forever", "take a new job", "travel abroad"],
      "rest and drink water"
    ),
    listen(
      "ADU L8",
      "Organiser: Registration for the charity run closes at seven forty-five tomorrow morning.",
      "When does registration close?",
      ["7:15", "7:30", "7:45", "8:00"],
      "7:45"
    ),
    listen(
      "ADU L9",
      "Technician: Your laptop is ready. We replaced the battery. That will be thirty dollars including labour.",
      "What was replaced?",
      ["the screen", "the battery", "the keyboard", "the hard drive"],
      "the battery"
    ),
    listen(
      "ADU L10",
      "Trainer: Please mute your microphone when you're not speaking to reduce background noise.",
      "What should participants do when not speaking?",
      ["mute the microphone", "leave the meeting", "turn off the camera permanently", "share their screen"],
      "mute the microphone"
    ),
    listen(
      "ADU L11",
      "Guide: The boat tour lasts ninety minutes. Life jackets are under your seats.",
      "How long is the boat tour?",
      ["sixty minutes", "seventy-five minutes", "ninety minutes", "two hours"],
      "ninety minutes"
    ),
    listen(
      "ADU L12",
      "HR officer: Interviews will be held online next week. Please test your camera and microphone beforehand.",
      "How will interviews be held?",
      ["in person only", "online", "by post", "by phone without video"],
      "online"
    ),
    listen(
      "ADU L13",
      "Reporter: Local volunteers planted two hundred trees to protect wildlife along the river.",
      "Why did volunteers plant trees?",
      ["to sell timber", "to protect wildlife", "to build houses", "to make paper"],
      "to protect wildlife"
    ),
    listen(
      "ADU L14",
      "Airport: Passengers on flight BA812 to London should proceed to Gate 22 for boarding.",
      "Where should passengers go?",
      ["Gate 12", "Gate 22", "Baggage claim", "Immigration"],
      "Gate 22"
    ),
    listen(
      "ADU L15",
      "Supervisor: Overtime this week must be approved in writing before you stay late.",
      "What is required for overtime?",
      ["written approval", "a doctor's note", "a client gift", "a new contract"],
      "written approval"
    ),
    listen(
      "ADU L16",
      "Client: Could we reschedule our call to three thirty? Something urgent came up.",
      "What time is the new call?",
      ["2:30", "3:00", "3:30", "4:30"],
      "3:30"
    ),
    listen(
      "ADU L17",
      "Librarian: You can renew books online twice. After that, please return them to the desk.",
      "How many times can books be renewed online?",
      ["once", "twice", "three times", "unlimited"],
      "twice"
    ),
  ];
}

function buildAdultGrammar(): GapSeed[] {
  return [
    grammar("ADU G1", "The report ___ (submit) before the deadline yesterday.", "was submitted"),
    grammar("ADU G2", "If we ___ (know) about the delay, we would have informed the client.", "had known"),
    grammar("ADU G3", "She has been working here ___ three years.", "for"),
    grammar("ADU G4", "Neither the manager nor the assistants ___ (be) available now.", "are"),
    grammar("ADU G5", "I would appreciate ___ (receive) your feedback by Friday.", "receiving"),
    grammar("ADU G6", "The conference, ___ took place in March, attracted over 500 delegates.", "which"),
    grammar("ADU G7", "Hardly ___ the presentation begun when the fire alarm sounded.", "had"),
    grammar("ADU G8", "You'd better ___ (call) the client before the meeting starts.", "call"),
    grammar("ADU G9", "There is too ___ noise in the open-plan office.", "much"),
    grammar("ADU G10", "By the time we arrive, they ___ (already / finish) the setup.", "will have already finished"),
    grammar("ADU G11", "He denied ___ (leak) the confidential document.", "leaking"),
    grammar("ADU G12", "Not until she read the email ___ she realise the mistake.", "did"),
    grammar("ADU G13", "The new policy is aimed ___ improving work-life balance.", "at"),
    grammar("ADU G14", "Scarcely ___ I logged in when the system crashed.", "had"),
    grammar("ADU G15", "The manager insisted that every employee ___ (attend) the briefing.", "attend"),
    grammar("ADU G16", "Had I known about the traffic, I ___ (leave) earlier.", "would have left"),
  ];
}

function validateTest(content: PlacementTestContent) {
  const { reading, listening, grammar } = content;
  const total = reading.length + listening.length + grammar.length;
  if (total !== PLACEMENT_TOTAL_QUESTIONS) {
    throw new Error(`${content.title}: expected ${PLACEMENT_TOTAL_QUESTIONS} questions, got ${total}`);
  }
  if (reading.length !== PLACEMENT_SECTION_COUNTS.reading) {
    throw new Error(`${content.title}: reading count ${reading.length}`);
  }
  if (listening.length !== PLACEMENT_SECTION_COUNTS.listening) {
    throw new Error(`${content.title}: listening count ${listening.length}`);
  }
  if (grammar.length !== PLACEMENT_SECTION_COUNTS.grammar) {
    throw new Error(`${content.title}: grammar count ${grammar.length}`);
  }
}

export function getPlacementTests(): PlacementTestContent[] {
  const tests: PlacementTestContent[] = [
    {
      track: "YLE",
      title: PLACEMENT_PAPER_TITLES.YLE,
      description:
        "50 câu · 30 phút · Reading, Listening & Grammar — đánh giá trình độ YLE theo CEFR",
      level: ExamLevel.MOVERS,
      reading: buildYleReading(),
      listening: buildYleListening(),
      grammar: buildYleGrammar(),
    },
    {
      track: "SECONDARY",
      title: PLACEMENT_PAPER_TITLES.SECONDARY,
      description:
        "50 câu · 30 phút · Reading, Listening & Grammar — đánh giá trình độ Cambridge THCS–THPT",
      level: ExamLevel.KET,
      reading: buildSecondaryReading(),
      listening: buildSecondaryListening(),
      grammar: buildSecondaryGrammar(),
    },
    {
      track: "ADULT",
      title: PLACEMENT_PAPER_TITLES.ADULT,
      description:
        "50 câu · 30 phút · Reading, Listening & Grammar — dành cho người đi làm & luyện thi cao cấp",
      level: ExamLevel.FCE,
      reading: buildAdultReading(),
      listening: buildAdultListening(),
      grammar: buildAdultGrammar(),
    },
  ];

  for (const test of tests) {
    validateTest(test);
  }

  return tests;
}
