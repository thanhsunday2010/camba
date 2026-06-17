import type { LevelSupplement } from "./merge";
import { gapsFromRows, listeningFromRows, readingFromSets, speakingsFromRows, writingsFromRows } from "./helpers";
import { KET_LISTENING_ROWS } from "./data/ket-listening";

const reading = readingFromSets([
  {
    title: "Community cinema",
    passage: "The old town cinema reopened after repairs. It shows family films on Saturdays and classic films on Monday evenings. Tickets are cheaper for students before six o'clock.",
    questions: [
      { question: "When does it show family films?", options: ["Fridays","Saturdays","Sundays","Every day"], answer: "Saturdays" },
      { question: "When are classic films shown?", options: ["Monday evenings","Tuesday mornings","Wednesday afternoons","Never"], answer: "Monday evenings" },
      { question: "Who gets cheaper tickets before six?", options: ["Teachers","Students","Drivers","Everyone"], answer: "Students" },
      { question: "Why did it reopen?", options: ["After repairs","After a holiday","After moving","After closing forever"], answer: "After repairs" },
      { question: "What kind of place is it?", options: ["A shop","A cinema","A school","A farm"], answer: "A cinema" },
    ],
  },
  {
    title: "Running club",
    passage: "Running club meets at the park on Tuesday and Thursday mornings before school. Members warm up together and run two kilometres. New runners are always welcome.",
    questions: [
      { question: "Where does the club meet?", options: ["At the park","In the library","At the beach","In class"], answer: "At the park" },
      { question: "When does it meet?", options: ["Monday only","Tuesday and Thursday mornings","Weekends only","Every night"], answer: "Tuesday and Thursday mornings" },
      { question: "How far do they run?", options: ["One kilometre","Two kilometres","Ten kilometres","One metre"], answer: "Two kilometres" },
      { question: "Are new runners welcome?", options: ["No","Yes","Only teachers","Only on Fridays"], answer: "Yes" },
      { question: "What do they do first?", options: ["Sleep","Warm up together","Eat lunch","Watch TV"], answer: "Warm up together" },
    ],
  },
]);

const uoe = gapsFromRows([

]);

const writing = writingsFromRows([
  ["Story start", "Write a story that begins: 'When I opened the door, I couldn't believe my eyes.'\n\nWrite 25–35 words.", 35, "A2 Key writing."],
  ["Blog post", "Write a blog post about a club you enjoy.\n\nWrite 25–35 words.", 35, "A2 Key writing."],
  ["Email plans", "Write an email to a friend about plans for next month.\n\nWrite 25–35 words.", 35, "A2 Key writing."],
  ["Opinion", "Write about whether students should wear uniform.\n\nWrite 25–35 words.", 35, "A2 Key writing."],
  ["Trip report", "Write about a school trip you enjoyed.\n\nWrite 25–35 words.", 35, "A2 Key writing."],
  ["Film message", "Write a message recommending a film to a friend.\n\nWrite 25–35 words.", 35, "A2 Key writing."],
  ["Environment", "Write about one thing your school does to help the environment.\n\nWrite 25–35 words.", 35, "A2 Key writing."],
  ["Competition", "Write about a competition you entered.\n\nWrite 25–35 words.", 35, "A2 Key writing."],
  ["Invitation reply", "Reply to an invitation. You can come but will be late.\n\nWrite 25–35 words.", 35, "A2 Key writing."],
  ["New hobby", "Write about a new hobby you started this year.\n\nWrite 25–35 words.", 35, "A2 Key writing."],
]);

const speaking = speakingsFromRows([
  ["School life", "Compare learning at school and learning online. Which do you prefer?", 15, 60],
  ["Role model", "Describe someone you admire. What have they achieved?", 15, 60],
  ["Technology", "How do you use technology for homework and hobbies?", 15, 60],
  ["Travel", "Tell me about an interesting place you visited.", 15, 60],
  ["Future", "What job would you like in the future? Why?", 15, 60],
  ["Environment", "What can young people do to reduce plastic waste?", 15, 60],
  ["Books films", "Do you prefer reading books or watching films? Why?", 15, 60],
  ["Friends", "What makes a good friend?", 15, 60],
  ["Sports", "Describe a sport or game you enjoy playing.", 15, 60],
  ["English", "Why are you learning English? How do you practise?", 15, 60],
]);

export const KET_SUPPLEMENT: LevelSupplement = {
  reading,
  listening: listeningFromRows(KET_LISTENING_ROWS),
  writing,
  speaking,
  uoe,
};
