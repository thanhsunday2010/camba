import type { LevelSupplement } from "./merge";
import { gapsFromRows, listeningFromRows, readingFromSets, speakingsFromRows, writingsFromRows } from "./helpers";
import { PET_LISTENING_ROWS } from "./data/pet-listening";

const reading = readingFromSets([
  {
    title: "Urban garden",
    passage: "City volunteers turned an empty plot into a shared vegetable garden. Schools help water plants on Wednesdays. Produce is donated to a food bank each month.",
    questions: [
      { question: "What was the plot before?", options: ["A shop","Empty","A road","A lake"], answer: "Empty" },
      { question: "Who helps water plants?", options: ["Schools","Tourists","Drivers","Nobody"], answer: "Schools" },
      { question: "When do schools help?", options: ["Mondays","Wednesdays","Fridays","Sundays"], answer: "Wednesdays" },
      { question: "Where is produce donated?", options: ["A food bank","A stadium","Abroad","Online"], answer: "A food bank" },
      { question: "How often is produce donated?", options: ["Daily","Each month","Never","Every hour"], answer: "Each month" },
    ],
  },
  {
    title: "Podcast launch",
    passage: "Students launched a podcast about teenage entrepreneurs. Episodes include interviews and tips for starting small businesses. Downloads passed one thousand in the first month.",
    questions: [
      { question: "What is the podcast about?", options: ["Sports only","Teenage entrepreneurs","Cooking","History only"], answer: "Teenage entrepreneurs" },
      { question: "What do episodes include?", options: ["Interviews and tips","Only music","Exam papers","Recipes only"], answer: "Interviews and tips" },
      { question: "How many downloads in the first month?", options: ["One hundred","Over one thousand","Ten","None"], answer: "Over one thousand" },
      { question: "Who launched it?", options: ["Teachers","Students","The mayor","Parents only"], answer: "Students" },
      { question: "What businesses are discussed?", options: ["Large factories","Small businesses","Only farms","Only apps"], answer: "Small businesses" },
    ],
  },
]);

const uoe = gapsFromRows([

]);

const writing = writingsFromRows([
  ["Story start", "Write a story that begins: 'When I opened the door, I couldn't believe my eyes.'\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
  ["Blog post", "Write a blog post about a club you enjoy.\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
  ["Email plans", "Write an email to a friend about plans for next month.\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
  ["Opinion", "Write about whether students should wear uniform.\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
  ["Trip report", "Write about a school trip you enjoyed.\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
  ["Film message", "Write a message recommending a film to a friend.\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
  ["Environment", "Write about one thing your school does to help the environment.\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
  ["Competition", "Write about a competition you entered.\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
  ["Invitation reply", "Reply to an invitation. You can come but will be late.\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
  ["New hobby", "Write about a new hobby you started this year.\n\nWrite 100 words.", 100, "B1 Preliminary writing."],
]);

const speaking = speakingsFromRows([
  ["School life", "Compare learning at school and learning online. Which do you prefer?", 15, 90],
  ["Role model", "Describe someone you admire. What have they achieved?", 15, 90],
  ["Technology", "How do you use technology for homework and hobbies?", 15, 90],
  ["Travel", "Tell me about an interesting place you visited.", 15, 90],
  ["Future", "What job would you like in the future? Why?", 15, 90],
  ["Environment", "What can young people do to reduce plastic waste?", 15, 90],
  ["Books films", "Do you prefer reading books or watching films? Why?", 15, 90],
  ["Friends", "What makes a good friend?", 15, 90],
  ["Sports", "Describe a sport or game you enjoy playing.", 15, 90],
  ["English", "Why are you learning English? How do you practise?", 15, 90],
]);

export const PET_SUPPLEMENT: LevelSupplement = {
  reading,
  listening: listeningFromRows(PET_LISTENING_ROWS),
  writing,
  speaking,
  uoe,
};
