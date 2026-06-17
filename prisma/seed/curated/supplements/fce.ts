import type { LevelSupplement } from "./merge";
import { gapsFromRows, listeningFromRows, readingFromSets, speakingsFromRows, writingsFromRows } from "./helpers";
import { FCE_LISTENING_ROWS } from "./data/fce-listening";

const reading = readingFromSets([
  {
    title: "Carbon capture pilot",
    passage: "Engineers are testing a carbon capture unit at a regional power station. Early data suggests emissions could fall by eighteen per cent, though critics argue costs remain too high for widespread use.",
    questions: [
      { question: "Where is the unit being tested?", options: ["At a school","At a regional power station","In a museum","On a farm"], answer: "At a regional power station" },
      { question: "By how much could emissions fall?", options: ["Five per cent","Eighteen per cent","Fifty per cent","None"], answer: "Eighteen per cent" },
      { question: "What do critics say?", options: ["Costs are too high","It is free","It is perfect","It is illegal"], answer: "Costs are too high" },
      { question: "What is being captured?", options: ["Water","Carbon","Noise","Light"], answer: "Carbon" },
      { question: "What stage is the project?", options: ["Testing/pilot","Closed","Finished worldwide","Cancelled"], answer: "Testing/pilot" },
    ],
  },
  {
    title: "Medieval manuscript",
    passage: "Researchers discovered a medieval manuscript in a private archive. Specialists are using imaging technology to read damaged pages. Publication is expected within two years.",
    questions: [
      { question: "What was discovered?", options: ["A coin","A medieval manuscript","A car","A statue"], answer: "A medieval manuscript" },
      { question: "Where was it found?", options: ["In a shop","In a private archive","On a beach","At school"], answer: "In a private archive" },
      { question: "What technology is used?", options: ["Imaging technology","Drones only","Robots only","None"], answer: "Imaging technology" },
      { question: "When is publication expected?", options: ["Within two years","Tomorrow","In twenty years","Never"], answer: "Within two years" },
      { question: "What is damaged?", options: ["Pages","The building only","Computers","Roads"], answer: "Pages" },
    ],
  },
  {
    title: "Remote healthcare",
    passage: "A trial offers video consultations for minor illnesses in rural areas. Patients save travel time, but doctors warn that physical examinations are sometimes necessary.",
    questions: [
      { question: "Who is the trial for?", options: ["Urban areas only","Rural areas","Airports","Schools"], answer: "Rural areas" },
      { question: "What do patients save?", options: ["Travel time","Money only","Food","Books"], answer: "Travel time" },
      { question: "What do doctors warn about?", options: ["Physical examinations may be necessary","All care is perfect","No technology works","Hospitals will close"], answer: "Physical examinations may be necessary" },
      { question: "What kind of illnesses?", options: ["Minor illnesses","Only surgery","Only broken bones","None"], answer: "Minor illnesses" },
      { question: "How are consultations done?", options: ["By video","By letter only","In person only","By phone only"], answer: "By video" },
    ],
  },
]);

const uoe = gapsFromRows([

]);

const writing = writingsFromRows([
  ["Story start", "Write a story that begins: 'When I opened the door, I couldn't believe my eyes.'\n\nWrite 140–190 words.", 190, "B2 First writing."],
  ["Blog post", "Write a blog post about a club you enjoy.\n\nWrite 140–190 words.", 190, "B2 First writing."],
  ["Email plans", "Write an email to a friend about plans for next month.\n\nWrite 140–190 words.", 190, "B2 First writing."],
  ["Opinion", "Write about whether students should wear uniform.\n\nWrite 140–190 words.", 190, "B2 First writing."],
  ["Trip report", "Write about a school trip you enjoyed.\n\nWrite 140–190 words.", 190, "B2 First writing."],
  ["Film message", "Write a message recommending a film to a friend.\n\nWrite 140–190 words.", 190, "B2 First writing."],
  ["Environment", "Write about one thing your school does to help the environment.\n\nWrite 140–190 words.", 190, "B2 First writing."],
  ["Competition", "Write about a competition you entered.\n\nWrite 140–190 words.", 190, "B2 First writing."],
  ["Invitation reply", "Reply to an invitation. You can come but will be late.\n\nWrite 140–190 words.", 190, "B2 First writing."],
  ["New hobby", "Write about a new hobby you started this year.\n\nWrite 140–190 words.", 190, "B2 First writing."],
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

export const FCE_SUPPLEMENT: LevelSupplement = {
  reading,
  listening: listeningFromRows(FCE_LISTENING_ROWS),
  writing,
  speaking,
  uoe,
};
