import type { LevelSupplement } from "./merge";
import {
  gapsFromRows,
  listeningFromRows,
  readingFromSets,
  speakingsFromRows,
  writingsFromRows,
} from "./helpers";
import { MOVERS_LISTENING_ROWS } from "./data/movers-listening";

const reading = readingFromSets([
  {
    title: "Skateboard club",
    passage: "Every Monday Leo goes to skateboard club at the sports centre. He wears a helmet and knee pads. Last week he learned to turn safely. His coach says he is improving quickly.",
    questions: [
      { question: "When does Leo go to skateboard club?", options: ["Sunday", "Monday", "Friday", "Saturday"], answer: "Monday" },
      { question: "Where is the club?", options: ["At school", "At the sports centre", "In the park only", "At the beach"], answer: "At the sports centre" },
      { question: "What does Leo wear?", options: ["Boots only", "Helmet and knee pads", "A coat", "Gloves only"], answer: "Helmet and knee pads" },
      { question: "What did he learn last week?", options: ["To jump high", "To turn safely", "To race cars", "To swim"], answer: "To turn safely" },
      { question: "What does the coach say?", options: ["He is too slow", "He is improving quickly", "He should stop", "He is late"], answer: "He is improving quickly" },
    ],
  },
  {
    title: "Weather report",
    passage: "On Tuesday it will rain in the morning but become sunny in the afternoon. The temperature will be fifteen degrees. Wind will be strong near the coast. Remember your coat if you go out early.",
    questions: [
      { question: "When will it rain?", options: ["All day", "In the morning", "At night only", "Never"], answer: "In the morning" },
      { question: "What will the afternoon be like?", options: ["Snowy", "Sunny", "Foggy", "Stormy"], answer: "Sunny" },
      { question: "What will the temperature be?", options: ["Ten degrees", "Fifteen degrees", "Twenty degrees", "Five degrees"], answer: "Fifteen degrees" },
      { question: "Where will wind be strong?", options: ["In the city", "Near the coast", "In the mountains only", "Nowhere"], answer: "Near the coast" },
      { question: "What should you remember if you go out early?", options: ["Sunglasses", "Your coat", "Shorts", "Sandals"], answer: "Your coat" },
    ],
  },
  {
    title: "School garden",
    passage: "Our class planted sunflowers in the school garden in April. We water them every Wednesday. The tallest plant is now one metre high. Birds sometimes visit the garden in the morning.",
    questions: [
      { question: "What did the class plant?", options: ["Tomatoes", "Sunflowers", "Trees only", "Grass"], answer: "Sunflowers" },
      { question: "When did they plant them?", options: ["March", "April", "June", "August"], answer: "April" },
      { question: "When do they water the plants?", options: ["Every Monday", "Every Wednesday", "Never", "Every hour"], answer: "Every Wednesday" },
      { question: "How tall is the tallest plant?", options: ["Half a metre", "One metre", "Two metres", "Ten centimetres"], answer: "One metre" },
      { question: "Who sometimes visits in the morning?", options: ["Cats", "Birds", "Dogs", "Fish"], answer: "Birds" },
    ],
  },
  {
    title: "Train journey",
    passage: "Last weekend Maya took the train to visit her cousin in Brighton. The journey took one hour and twenty minutes. She sat by the window and read a comic book. Her cousin met her at the station.",
    questions: [
      { question: "Who did Maya visit?", options: ["Her aunt", "Her cousin", "Her teacher", "Her neighbour"], answer: "Her cousin" },
      { question: "Where did Maya go?", options: ["London", "Brighton", "Manchester", "Oxford"], answer: "Brighton" },
      { question: "How long was the journey?", options: ["Forty minutes", "One hour twenty", "Two hours", "Three hours"], answer: "One hour twenty" },
      { question: "What did Maya read?", options: ["A map", "A comic book", "A newspaper", "Homework"], answer: "A comic book" },
      { question: "Who met her at the station?", options: ["Her parents", "Her cousin", "A taxi driver", "Nobody"], answer: "Her cousin" },
    ],
  },
  {
    title: "Charity bake sale",
    passage: "Year five organised a bake sale to collect money for a local animal shelter. They sold cupcakes, brownies and fruit juice. By lunchtime they had raised forty pounds. The head teacher bought the last brownie.",
    questions: [
      { question: "Why did they organise a bake sale?", options: ["For a holiday", "For an animal shelter", "For new computers", "For sports kits"], answer: "For an animal shelter" },
      { question: "What did they sell?", options: ["Sandwiches only", "Cupcakes, brownies and juice", "Pizza", "Soup"], answer: "Cupcakes, brownies and juice" },
      { question: "How much had they raised by lunchtime?", options: ["Ten pounds", "Forty pounds", "One hundred pounds", "Nothing"], answer: "Forty pounds" },
      { question: "Who bought the last brownie?", options: ["A pupil", "The head teacher", "A parent", "A dog"], answer: "The head teacher" },
      { question: "Which year organised it?", options: ["Year three", "Year five", "Year six", "Teachers"], answer: "Year five" },
    ],
  },
  {
    title: "New tablet rules",
    passage: "Our school has new rules for tablets. You may use them in lessons when the teacher says yes. At break you can only use them in the library. Games are not allowed at school. If you break a rule, the tablet is kept until four o'clock.",
    questions: [
      { question: "When can you use tablets in lessons?", options: ["Always", "When the teacher says yes", "Never", "Only on Fridays"], answer: "When the teacher says yes" },
      { question: "Where can you use them at break?", options: ["In the playground", "In the library", "Anywhere", "In the canteen"], answer: "In the library" },
      { question: "What is not allowed?", options: ["Reading", "Games", "Writing notes", "Research"], answer: "Games" },
      { question: "What happens if you break a rule?", options: ["Nothing", "The tablet is kept until four", "You get a cake", "School closes"], answer: "The tablet is kept until four" },
      { question: "What device do the rules concern?", options: ["Phones only", "Tablets", "Bikes", "Books"], answer: "Tablets" },
    ],
  },
  {
    title: "Weekend market",
    passage: "On Saturday mornings there is a market in the town square. Farmers sell fresh fruit, bread and cheese. Last week I bought strawberries and a loaf of brown bread for six pounds. My dad likes the honey stall best.",
    questions: [
      { question: "When is the market?", options: ["Friday nights", "Saturday mornings", "Sunday evenings", "Every day"], answer: "Saturday mornings" },
      { question: "Where is the market?", options: ["In the school", "In the town square", "At the beach", "In the museum"], answer: "In the town square" },
      { question: "What did the writer buy last week?", options: ["Fish and rice", "Strawberries and bread", "Only honey", "Soup"], answer: "Strawberries and bread" },
      { question: "How much did they spend?", options: ["Four pounds", "Six pounds", "Ten pounds", "One pound"], answer: "Six pounds" },
      { question: "Which stall does Dad like best?", options: ["The bread stall", "The honey stall", "The toy stall", "The book stall"], answer: "The honey stall" },
    ],
  },
  {
    title: "Swimming badge",
    passage: "Nina passed her swimming badge test on Thursday. She swam twenty-five metres without stopping and jumped safely into deep water. Her instructor gave her a blue certificate. Next she wants to learn butterfly stroke.",
    questions: [
      { question: "When did Nina pass the test?", options: ["Monday", "Thursday", "Saturday", "Sunday"], answer: "Thursday" },
      { question: "How far did she swim?", options: ["Ten metres", "Twenty-five metres", "One hundred metres", "One lap only"], answer: "Twenty-five metres" },
      { question: "What colour is the certificate?", options: ["Red", "Blue", "Green", "Yellow"], answer: "Blue" },
      { question: "What does she want to learn next?", options: ["Football", "Butterfly stroke", "Cycling", "Cooking"], answer: "Butterfly stroke" },
      { question: "Who gave her the certificate?", options: ["Her mum", "Her instructor", "The head teacher", "Her friend"], answer: "Her instructor" },
    ],
  },
]);

const uoe = gapsFromRows([
  ["Past went", "We ___ (go) to the zoo yesterday.", "went"],
  ["Present continuous", "She is ___ (read) a book now.", "reading"],
  ["Comparative", "My bag is ___ (heavy) than yours.", "heavier"],
  ["Must", "You ___ (must) wear a helmet.", "must"],
  ["Some any", "Are there ___ (any) apples left?", "any"],
  ["Preposition in", "The keys are ___ (in) my pocket.", "in"],
  ["Preposition on", "The cat is ___ (on) the roof.", "on"],
  ["Plural", "Those ___ (child) are playing.", "children"],
  ["Did question", "___ (Did) you finish your homework?", "Did"],
  ["Going to", "We are ___ (going) to visit Grandma.", "going"],
  ["Adverb well", "He sings very ___ (well).", "well"],
  ["Possessive", "This is ___ (Emma) bike.", "Emma's"],
  ["Object me", "Can you help ___ (I)?", "me"],
  ["Present simple", "She ___ (walk) to school every day.", "walks"],
  ["Was were", "They ___ (were) tired after the trip.", "were"],
  ["Has got", "He ___ (has) got blue eyes.", "has"],
  ["Would like", "Would you like ___ (to) come?", "to"],
  ["Much many", "How ___ (many) books do you have?", "many"],
  ["Because", "We stayed home because it ___ (rain) ed.", "rained"],
  ["Never", "I have ___ (never) been to Paris.", "never"],
]);

const writing = writingsFromRows([
  ["Weekend trip", "Write about a short trip you took at the weekend.\n\n• Where you went\n• Who went with you\n• What you did\n\nWrite 30–40 words.", 40, "A1 Movers past simple."],
  ["Favourite sport", "Write about your favourite sport.\n\n• What it is\n• When you play\n• Why you like it\n\nWrite 35–45 words.", 45, "Present simple."],
  ["School club", "Write about a club at your school.\n\n• Name of club\n• When it meets\n• What you do\n\nWrite 35–45 words.", 45, "Informal style."],
  ["Lost item", "Write a note about something you lost at school.\n\nWrite 30–40 words.", 40, "Functional note."],
  ["Birthday invite", "Write an invitation to your birthday party.\n\n• When and where\n• What guests will do\n\nWrite 35–45 words.", 45, "Invitation format."],
  ["Weather message", "Write a message about tomorrow's weather and plans.\n\nWrite 30–40 words.", 40, "Future with going to."],
  ["My town", "Write about your town.\n\n• One place to visit\n• One place to eat\n• Why you like it\n\nWrite 35–45 words.", 45, "Descriptive."],
  ["Helping at home", "Write about how you help at home.\n\nWrite 30–40 words.", 40, "Present simple."],
  ["Film review", "Write about a film you saw.\n\n• What it was about\n• Did you like it?\n\nWrite 35–45 words.", 45, "Opinion."],
  ["Pen friend", "Write an email to a pen friend about your school.\n\nWrite 35–45 words.", 45, "Informal email."],
]);

const speaking = speakingsFromRows([
  ["School subjects", "What is your favourite subject? Why? What subjects don't you like?", 15, 60],
  ["Last weekend", "What did you do last weekend? Who did you see? Was it fun?", 15, 60],
  ["Sports", "Do you play any sports? How often? Where do you play?", 15, 60],
  ["Your room", "Describe your bedroom. What furniture is there? What do you do there?", 15, 60],
  ["Shopping", "Do you go shopping with your family? What do you usually buy?", 15, 60],
  ["Transport", "How do you get to school? Is it far? Do you like the journey?", 15, 60],
  ["Food", "What do you eat for breakfast and lunch? What is your favourite food?", 15, 60],
  ["Friends", "Tell me about your best friend. What do you like doing together?", 15, 60],
  ["Holiday", "Where did you go on your last holiday? What did you enjoy?", 15, 60],
  ["Future plans", "What are you going to do next weekend?", 15, 60],
]);

export const MOVERS_SUPPLEMENT: LevelSupplement = {
  reading,
  listening: listeningFromRows(MOVERS_LISTENING_ROWS),
  writing,
  speaking,
  uoe,
};
