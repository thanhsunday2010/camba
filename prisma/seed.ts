import { PrismaClient, ExamLevel, Skill, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const readingPassage1 = `My name is Lily. I am twelve years old and I live in Hanoi with my family. Every morning, I wake up at six o'clock and have breakfast with my parents and my younger brother, Max. After breakfast, I walk to school with my best friend, Anna.

At school, my favourite subjects are English and Art. I don't like Maths very much because I find it difficult. After school, I usually go to the library to read books. On Saturdays, I play badminton in the park with Anna.`;

const readingQuestions = [
  {
    title: "Lily's age",
    content: { passage: readingPassage1, question: "How old is Lily?", options: ["Ten", "Eleven", "Twelve", "Thirteen"] },
    correctAnswer: "Twelve",
  },
  {
    title: "Lily's city",
    content: { passage: readingPassage1, question: "Where does Lily live?", options: ["Ho Chi Minh City", "Da Nang", "Hanoi", "Hue"] },
    correctAnswer: "Hanoi",
  },
  {
    title: "Morning routine",
    content: { passage: readingPassage1, question: "What time does Lily wake up?", options: ["Five o'clock", "Six o'clock", "Seven o'clock", "Eight o'clock"] },
    correctAnswer: "Six o'clock",
  },
  {
    title: "School friend",
    content: { passage: readingPassage1, question: "Who does Lily walk to school with?", options: ["Max", "Anna", "Her mother", "Her teacher"] },
    correctAnswer: "Anna",
  },
  {
    title: "Favourite subjects",
    content: { passage: readingPassage1, question: "Which subjects does Lily like?", options: ["Maths and Art", "English and Maths", "English and Art", "Art and Science"] },
    correctAnswer: "English and Art",
  },
  {
    title: "Disliked subject",
    content: { passage: readingPassage1, question: "Why doesn't Lily like Maths?", options: ["It's boring", "It's difficult", "It's too easy", "The teacher is strict"] },
    correctAnswer: "It's difficult",
  },
  {
    title: "After school",
    content: { passage: readingPassage1, question: "Where does Lily go after school?", options: ["The park", "The library", "The supermarket", "Anna's house"] },
    correctAnswer: "The library",
  },
  {
    title: "Saturday activity",
    content: { passage: readingPassage1, question: "What does Lily do on Saturdays?", options: ["Plays football", "Plays badminton", "Goes swimming", "Reads at home"] },
    correctAnswer: "Plays badminton",
  },
];

const readingPassage2 = `Last summer, Ben and his family went on holiday to Da Nang. They stayed in a hotel near the beach for five days. Ben spent most of his time swimming in the sea and building sandcastles with his sister.

One day, they visited Marble Mountains. Ben climbed to the top and took many photos. In the evening, they ate fresh seafood at a restaurant. Ben said it was the best holiday ever.`;

const readingQuestions2 = [
  {
    title: "Holiday destination",
    content: { passage: readingPassage2, question: "Where did Ben go on holiday?", options: ["Nha Trang", "Da Nang", "Phu Quoc", "Hoi An"] },
    correctAnswer: "Da Nang",
  },
  {
    title: "Hotel location",
    content: { passage: readingPassage2, question: "Where was the hotel?", options: ["In the mountains", "Near the beach", "In the city centre", "Near the airport"] },
    correctAnswer: "Near the beach",
  },
  {
    title: "Duration",
    content: { passage: readingPassage2, question: "How long did they stay?", options: ["Three days", "Four days", "Five days", "Seven days"] },
    correctAnswer: "Five days",
  },
  {
    title: "Beach activities",
    content: { passage: readingPassage2, question: "What did Ben do at the beach?", options: ["Fishing and surfing", "Swimming and building sandcastles", "Sunbathing only", "Playing volleyball"] },
    correctAnswer: "Swimming and building sandcastles",
  },
  {
    title: "Day trip",
    content: { passage: readingPassage2, question: "Which place did they visit one day?", options: ["Marble Mountains", "Ba Na Hills", "Son Tra Peninsula", "My Khe Beach"] },
    correctAnswer: "Marble Mountains",
  },
  {
    title: "Evening meal",
    content: { passage: readingPassage2, question: "What did they eat in the evening?", options: ["Pizza", "Fresh seafood", "Fast food", "Traditional noodles"] },
    correctAnswer: "Fresh seafood",
  },
];

const readingPassage3 = `The school science fair was held last Friday. Students from Year 7 to Year 9 made projects about the environment. Minh's project was about recycling plastic bottles. He showed how to make flower pots from old bottles.

The judges gave first prize to Minh because his project was creative and useful. The head teacher said everyone should try to protect the environment.`;

const readingQuestions3 = [
  {
    title: "Science fair day",
    content: { passage: readingPassage3, question: "When was the science fair?", options: ["Last Monday", "Last Wednesday", "Last Friday", "Last Sunday"] },
    correctAnswer: "Last Friday",
  },
  {
    title: "Minh's topic",
    content: { passage: readingPassage3, question: "What was Minh's project about?", options: ["Saving water", "Recycling plastic bottles", "Planting trees", "Solar energy"] },
    correctAnswer: "Recycling plastic bottles",
  },
  {
    title: "Minh's demonstration",
    content: { passage: readingPassage3, question: "What did Minh show how to make?", options: ["Bird houses", "Flower pots", "Toy cars", "Paper bags"] },
    correctAnswer: "Flower pots",
  },
  {
    title: "Prize winner",
    content: { passage: readingPassage3, question: "Who won first prize?", options: ["Anna", "Minh", "Lily", "Ben"] },
    correctAnswer: "Minh",
  },
  {
    title: "Reason for prize",
    content: { passage: readingPassage3, question: "Why did Minh win?", options: ["It was the biggest project", "It was creative and useful", "He was the oldest student", "He spoke the longest"] },
    correctAnswer: "It was creative and useful",
  },
  {
    title: "Head teacher message",
    content: { passage: readingPassage3, question: "What did the head teacher say?", options: ["Study harder", "Join more clubs", "Protect the environment", "Enter next year's fair"] },
    correctAnswer: "Protect the environment",
  },
];

const writingTasks = [
  {
    title: "KET Writing - Email to friend",
    content: {
      taskPrompt: "You are going to write an email to your English friend, Sam.\n\nWrite an email to Sam about a party you went to last weekend.\n\nIn your email:\n• say where the party was\n• describe what you did\n• say why you enjoyed it\n\nWrite 25-35 words.",
      wordLimit: 35,
      instructions: "Write an informal email. Use past tense.",
    },
  },
  {
    title: "KET Writing - Note to teacher",
    content: {
      taskPrompt: "You are going to write a note to your English teacher, Mr Brown.\n\nYou cannot come to class tomorrow because you are ill.\n\nWrite a note to Mr Brown.\n\nIn your note:\n• say why you are writing\n• explain why you cannot come\n• ask about the homework\n\nWrite 25-35 words.",
      wordLimit: 35,
      instructions: "Use polite language.",
    },
  },
  {
    title: "KET Writing - Story",
    content: {
      taskPrompt: "Look at the three pictures. Write the story shown in the pictures.\n\nPicture 1: A boy finds a wallet in the park.\nPicture 2: He takes it to the police station.\nPicture 3: The owner thanks him with a reward.\n\nWrite 35-45 words.",
      wordLimit: 45,
      instructions: "Use past tenses and linking words (then, after that, finally).",
    },
  },
  {
    title: "PET Writing - Email",
    content: {
      taskPrompt: "Your English friend, Alex, wants to visit your city.\n\nWrite an email to Alex about things to do in your city.\n\nIn your email:\n• suggest places to visit\n• recommend food to try\n• offer to show Alex around\n\nWrite about 100 words.",
      wordLimit: 100,
      instructions: "B1 level informal email.",
    },
  },
  {
    title: "FCE Writing - Essay",
    content: {
      taskPrompt: "Your class has been discussing technology in education.\n\nWrite an essay discussing the advantages and disadvantages of using tablets in schools.\n\nWrite your essay in 140-190 words.",
      wordLimit: 190,
      instructions: "Include introduction, two body paragraphs, conclusion.",
    },
  },
];

async function main() {
  console.log("Seeding Camba database...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const teacherHash = await bcrypt.hash("teacher123", 10);
  const studentHash = await bcrypt.hash("student123", 10);

  await db.user.upsert({
    where: { email: "admin@camba.vn" },
    update: {},
    create: {
      email: "admin@camba.vn",
      name: "Admin Camba",
      passwordHash: adminHash,
      role: "ADMIN",
      targetExam: "KET",
    },
  });

  await db.user.upsert({
    where: { email: "teacher@camba.vn" },
    update: {},
    create: {
      email: "teacher@camba.vn",
      name: "Cô Lan",
      passwordHash: teacherHash,
      role: "TEACHER",
      targetExam: "PET",
    },
  });

  await db.user.upsert({
    where: { email: "student@camba.vn" },
    update: {},
    create: {
      email: "student@camba.vn",
      name: "Nguyễn Minh",
      passwordHash: studentHash,
      role: "STUDENT",
      grade: "Lớp 8",
      targetExam: "KET",
      streak: 3,
    },
  });

  await db.question.deleteMany({});
  await db.examPaper.deleteMany({});

  const allReading = [...readingQuestions, ...readingQuestions2, ...readingQuestions3];
  const readingIds: string[] = [];

  for (let i = 0; i < allReading.length; i++) {
    const q = allReading[i];
    const created = await db.question.create({
      data: {
        type: QuestionType.MCQ,
        level: ExamLevel.KET,
        skill: Skill.READING,
        title: q.title,
        content: q.content,
        correctAnswer: q.correctAnswer,
        points: 1,
        orderIndex: i,
      },
    });
    readingIds.push(created.id);
  }

  const writingIds: string[] = [];
  const levels: ExamLevel[] = [ExamLevel.KET, ExamLevel.KET, ExamLevel.KET, ExamLevel.PET, ExamLevel.FCE];

  for (let i = 0; i < writingTasks.length; i++) {
    const w = writingTasks[i];
    const created = await db.question.create({
      data: {
        type: QuestionType.FREE_TEXT,
        level: levels[i],
        skill: Skill.WRITING,
        title: w.title,
        content: w.content,
        points: 10,
        orderIndex: i,
      },
    });
    writingIds.push(created.id);
  }

  const ketReadingPaper = await db.examPaper.create({
    data: {
      title: "KET Reading Practice 1",
      description: "20 câu đọc hiểu mức A2 Key — format inspired by Cambridge",
      level: ExamLevel.KET,
      skill: Skill.READING,
      timeLimit: 1800,
      isMockTest: true,
      questions: {
        create: readingIds.map((id, i) => ({ questionId: id, orderIndex: i })),
      },
    },
  });

  for (let i = 0; i < 3; i++) {
    await db.examPaper.create({
      data: {
        title: `KET Writing Task ${i + 1}`,
        description: "Bài viết có AI chấm theo rubric Cambridge",
        level: ExamLevel.KET,
        skill: Skill.WRITING,
        timeLimit: 900,
        questions: {
          create: [{ questionId: writingIds[i], orderIndex: 0 }],
        },
      },
    });
  }

  await db.examPaper.create({
    data: {
      title: "PET Writing Practice",
      level: ExamLevel.PET,
      skill: Skill.WRITING,
      timeLimit: 1200,
      questions: { create: [{ questionId: writingIds[3], orderIndex: 0 }] },
    },
  });

  await db.examPaper.create({
    data: {
      title: "FCE Writing Practice",
      level: ExamLevel.FCE,
      skill: Skill.WRITING,
      timeLimit: 2400,
      questions: { create: [{ questionId: writingIds[4], orderIndex: 0 }] },
    },
  });

  const listeningQ = await db.question.create({
    data: {
      type: QuestionType.MCQ,
      level: ExamLevel.KET,
      skill: Skill.LISTENING,
      title: "Listening - Train announcement",
      content: {
        question: "What time does the train to London leave? (Imagine you hear: 'The train to London will depart from platform 3 at quarter past ten.')",
        options: ["9:45", "10:00", "10:15", "10:30"],
      },
      correctAnswer: "10:15",
      points: 1,
    },
  });

  await db.examPaper.create({
    data: {
      title: "KET Listening Sample",
      description: "Sample listening task (add audio URL in admin)",
      level: ExamLevel.KET,
      skill: Skill.LISTENING,
      timeLimit: 600,
      questions: { create: [{ questionId: listeningQ.id, orderIndex: 0 }] },
    },
  });

  const speakingQ = await db.question.create({
    data: {
      type: QuestionType.SPEAKING_PROMPT,
      level: ExamLevel.KET,
      skill: Skill.SPEAKING,
      title: "Speaking Part 1 - Personal questions",
      content: {
        prompt: "Tell me about your daily routine. What time do you get up? What do you do after school?",
        preparationTime: 15,
        speakingTime: 60,
      },
      points: 10,
    },
  });

  await db.examPaper.create({
    data: {
      title: "KET Speaking Practice",
      description: "Ghi âm hoặc nhập transcript — AI chấm Speaking",
      level: ExamLevel.KET,
      skill: Skill.SPEAKING,
      timeLimit: 300,
      questions: { create: [{ questionId: speakingQ.id, orderIndex: 0 }] },
    },
  });

  const yleQuestions = [
    {
      level: ExamLevel.STARTERS,
      content: { question: "What is this? (Picture: a cat)", options: ["A dog", "A cat", "A bird", "A fish"] },
      answer: "A cat",
    },
    {
      level: ExamLevel.MOVERS,
      content: { question: "Where is the ball?", options: ["Under the table", "On the chair", "In the box", "Behind the door"] },
      answer: "Under the table",
    },
    {
      level: ExamLevel.FLYERS,
      content: { question: "Why was Tom late for school?", options: ["He missed the bus", "He was ill", "He forgot his homework", "He helped his mother"] },
      answer: "He missed the bus",
    },
  ];

  for (const yle of yleQuestions) {
    const q = await db.question.create({
      data: {
        type: QuestionType.MCQ,
        level: yle.level,
        skill: Skill.READING,
        content: yle.content,
        correctAnswer: yle.answer,
        points: 1,
      },
    });
    await db.examPaper.create({
      data: {
        title: `${yle.level} Reading Sample`,
        level: yle.level,
        skill: Skill.READING,
        timeLimit: 600,
        questions: { create: [{ questionId: q.id, orderIndex: 0 }] },
      },
    });
  }

  console.log("Seed complete!");
  console.log(`Admin: admin@camba.vn / admin123`);
  console.log(`Teacher: teacher@camba.vn / teacher123`);
  console.log(`Student: student@camba.vn / student123`);
  console.log(`KET Reading paper: ${ketReadingPaper.id}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
