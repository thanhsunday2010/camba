/** Ngân hàng 100 câu Speaking IELTS (Part 1: 40, Part 2: 30, Part 3: 30) */

export type IeltsSpeakingSeed = {
  title: string;
  prompt: string;
  preparationTime: number;
  speakingTime: number;
  ieltsPart: 1 | 2 | 3;
};

const PART1_TOPICS = [
  { topic: "hometown", questions: ["Where are you from?", "What do you like most about your hometown?", "Has your hometown changed much?", "Would you recommend visitors to go there?", "Do you plan to live there in the future?"] },
  { topic: "work or study", questions: ["Do you work or are you a student?", "Why did you choose this job or subject?", "What do you enjoy about it?", "Is it popular in your country?", "Would you like to change anything about it?"] },
  { topic: "daily routine", questions: ["What time do you usually get up?", "What do you do in the morning?", "Do you have a fixed routine?", "Has your routine changed recently?", "What would you like to change about your day?"] },
  { topic: "hobbies", questions: ["What hobbies do you have?", "How often do you do them?", "Did you have different hobbies as a child?", "Why do people need hobbies?", "Would you like to try a new hobby?"] },
  { topic: "food", questions: ["What kind of food do you like?", "Do you cook at home?", "Is there any food you dislike?", "What is a popular dish in your country?", "Do you prefer eating at home or in restaurants?"] },
  { topic: "reading", questions: ["Do you like reading?", "What kind of books do you read?", "Did you read a lot as a child?", "Do you prefer e-books or paper books?", "Would you like to write a book one day?"] },
  { topic: "music", questions: ["What kind of music do you like?", "Do you play any musical instruments?", "When do you usually listen to music?", "Has your taste in music changed?", "Do you think music is important in education?"] },
  { topic: "travel", questions: ["Do you like travelling?", "Where did you go on your last trip?", "Do you prefer travelling alone or with others?", "What makes a good holiday?", "Is there a country you would like to visit?"] },
];

const PART2_CUE_CARDS = [
  "Describe a place you visited that you really liked. You should say: where it is, when you went there, what you did there, and explain why you liked it.",
  "Describe a person who has influenced you. You should say: who this person is, how you know them, what they have done, and explain why they influenced you.",
  "Describe a skill you would like to learn. You should say: what the skill is, how you would learn it, why you want to learn it, and explain how it would help you.",
  "Describe a book you enjoyed reading. You should say: what the book is about, when you read it, why you chose it, and explain why you enjoyed it.",
  "Describe a memorable event in your life. You should say: what the event was, when it happened, who was involved, and explain why it was memorable.",
  "Describe a piece of technology you use often. You should say: what it is, how you use it, how long you have had it, and explain why it is useful.",
  "Describe a festival or celebration in your country. You should say: what it is, when it happens, what people do, and explain why it is important.",
  "Describe a gift you received that was special. You should say: what the gift was, who gave it to you, when you received it, and explain why it was special.",
  "Describe a time you helped someone. You should say: who you helped, what you did, why they needed help, and explain how you felt about it.",
  "Describe an interesting conversation you had. You should say: who you talked with, what you talked about, where you were, and explain why it was interesting.",
  "Describe a goal you want to achieve. You should say: what the goal is, when you want to achieve it, what you need to do, and explain why it is important.",
  "Describe a sport or exercise you enjoy. You should say: what it is, how often you do it, when you started, and explain why you enjoy it.",
  "Describe a teacher who made an impression on you. You should say: who they were, what they taught, what they did, and explain why they impressed you.",
  "Describe a time you were very busy. You should say: when it was, what you had to do, how you managed your time, and explain how you felt.",
  "Describe a shop you like going to. You should say: where it is, what it sells, how often you go there, and explain why you like it.",
  "Describe a film or TV programme you enjoyed. You should say: what it was about, when you watched it, who you watched it with, and explain why you enjoyed it.",
  "Describe a friend you have known for a long time. You should say: how you met, what you do together, how often you see each other, and explain why your friendship is important.",
  "Describe a building or historical place in your city. You should say: where it is, what it looks like, what people do there, and explain why it is important.",
  "Describe a time you learned something new. You should say: what you learned, how you learned it, who helped you, and explain why it was useful.",
  "Describe an advertisement you remember. You should say: what it was for, where you saw it, what happened in it, and explain why you remember it.",
  "Describe a family member you are close to. You should say: who they are, what they are like, what you do together, and explain why you are close.",
  "Describe a time you waited for something. You should say: what you waited for, how long you waited, how you felt, and explain whether it was worth waiting.",
  "Describe a website you often use. You should say: what the website is, how you found it, how often you use it, and explain why it is useful.",
  "Describe a public event you attended. You should say: what the event was, where it was held, who went with you, and explain why you enjoyed it.",
  "Describe a photo you like. You should say: what is in the photo, when it was taken, who took it, and explain why you like it.",
  "Describe a rule at school or work. You should say: what the rule is, why it exists, how people follow it, and explain whether you agree with it.",
  "Describe something you bought that you were happy with. You should say: what you bought, where you bought it, when you bought it, and explain why you were happy.",
  "Describe a time you gave advice to someone. You should say: who you advised, what the situation was, what advice you gave, and explain what happened.",
  "Describe a park or garden you like. You should say: where it is, what it looks like, what people do there, and explain why you like it.",
  "Describe a hobby you had when you were younger. You should say: what it was, when you did it, who you did it with, and explain why you enjoyed it.",
];

const PART3_THEMES = [
  { theme: "education", questions: ["How has education changed in your country?", "What makes a good teacher?", "Should university education be free?", "How important are practical skills?", "Will online learning replace traditional schools?"] },
  { theme: "technology", questions: ["How has technology changed daily life?", "Do young people use technology differently?", "What are the dangers of social media?", "Should children limit screen time?", "How might technology develop in the future?"] },
  { theme: "environment", questions: ["What environmental problems are most serious?", "What can individuals do to help?", "Should governments do more?", "How does pollution affect cities?", "Will people change their habits in future?"] },
  { theme: "work", questions: ["What makes a job satisfying?", "Is job security important?", "How will work change in the future?", "Should employees work from home?", "What skills will be most valuable?"] },
  { theme: "travel & tourism", questions: ["Why do people travel abroad?", "How does tourism affect local communities?", "Is cultural exchange important?", "Should tourists respect local customs?", "How has travel become easier?"] },
  { theme: "health", questions: ["How can people stay healthy?", "Is public healthcare important?", "Why do some people avoid exercise?", "How does stress affect health?", "Should governments promote healthy lifestyles?"] },
];

function buildPart1Seeds(): IeltsSpeakingSeed[] {
  const seeds: IeltsSpeakingSeed[] = [];
  let n = 0;
  for (const { topic, questions } of PART1_TOPICS) {
    for (const q of questions) {
      n += 1;
      seeds.push({
        title: `IELTS SP1 ${n}`,
        prompt: `[${topic}] ${q}`,
        preparationTime: 0,
        speakingTime: 45,
        ieltsPart: 1,
      });
    }
  }
  return seeds;
}

function buildPart2Seeds(): IeltsSpeakingSeed[] {
  return PART2_CUE_CARDS.map((prompt, i) => ({
    title: `IELTS SP2 ${i + 1}`,
    prompt,
    preparationTime: 60,
    speakingTime: 120,
    ieltsPart: 2,
  }));
}

function buildPart3Seeds(): IeltsSpeakingSeed[] {
  const seeds: IeltsSpeakingSeed[] = [];
  let n = 0;
  for (const { theme, questions } of PART3_THEMES) {
    for (const q of questions) {
      n += 1;
      seeds.push({
        title: `IELTS SP3 ${n}`,
        prompt: `[${theme}] ${q}`,
        preparationTime: 0,
        speakingTime: 90,
        ieltsPart: 3,
      });
    }
  }
  return seeds;
}

export function getIeltsSpeakingBankSeeds(): IeltsSpeakingSeed[] {
  const part1 = buildPart1Seeds();
  const part2 = buildPart2Seeds();
  const part3 = buildPart3Seeds();
  return [...part1, ...part2, ...part3];
}

export const IELTS_SPEAKING_BANK_COUNTS = {
  part1: buildPart1Seeds().length,
  part2: buildPart2Seeds().length,
  part3: buildPart3Seeds().length,
  total: getIeltsSpeakingBankSeeds().length,
};
