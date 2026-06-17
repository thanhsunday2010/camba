import type { LevelSupplement } from "./merge";
import {
  gapsFromRows,
  listeningFromRows,
  readingFromSets,
  speakingsFromRows,
  writingsFromRows,
} from "./helpers";
import { STARTERS_LISTENING_ROWS } from "./data/starters-listening";

const reading = readingFromSets([
  {
    title: "Playground games",
    passage: "At break time, Kim and Sam play hopscotch near the big tree. Their friend Lin jumps rope. They laugh when the ball goes under the bench.",
    questions: [
      { question: "What do Kim and Sam play?", options: ["Football", "Hopscotch", "Chess", "Tennis"], answer: "Hopscotch" },
      { question: "Where do they play?", options: ["In class", "Near the big tree", "In the lake", "At home"], answer: "Near the big tree" },
      { question: "What does Lin do?", options: ["Sleeps", "Jumps rope", "Cooks", "Reads"], answer: "Jumps rope" },
      { question: "When do they play?", options: ["At night", "At break time", "On holiday", "Never"], answer: "At break time" },
      { question: "Where does the ball go?", options: ["On the roof", "Under the bench", "In the bag", "Home"], answer: "Under the bench" },
    ],
  },
  {
    title: "Art class",
    passage: "In art class we use crayons and paper. Today we draw houses and trees. The teacher says my sun is yellow and big. I give the picture to my mum.",
    questions: [
      { question: "What do they use in art class?", options: ["Computers", "Crayons and paper", "Footballs", "Maps"], answer: "Crayons and paper" },
      { question: "What do they draw today?", options: ["Cars", "Houses and trees", "Fish only", "Numbers"], answer: "Houses and trees" },
      { question: "What colour is the sun?", options: ["Blue", "Yellow", "Green", "Black"], answer: "Yellow" },
      { question: "Who gets the picture?", options: ["The teacher", "Mum", "Dad", "A friend"], answer: "Mum" },
      { question: "Where is art class?", options: ["At home", "In art class at school", "At the zoo", "In the shop"], answer: "In art class at school" },
    ],
  },
  {
    title: "Grandma visit",
    passage: "Every Sunday we visit Grandma. She lives in a small house with a white cat. Grandma makes soup and we play cards. I love her garden with red flowers.",
    questions: [
      { question: "When do they visit Grandma?", options: ["Monday", "Sunday", "Friday", "Never"], answer: "Sunday" },
      { question: "What pet does Grandma have?", options: ["A dog", "A white cat", "A fish", "A horse"], answer: "A white cat" },
      { question: "What does Grandma make?", options: ["Pizza", "Soup", "Cake only", "Rice only"], answer: "Soup" },
      { question: "What do they play?", options: ["Football", "Cards", "Chess", "Tennis"], answer: "Cards" },
      { question: "What colour are the flowers?", options: ["Blue", "Red", "Yellow", "White"], answer: "Red" },
    ],
  },
  {
    title: "Music lesson",
    passage: "On Tuesday we have music. We sing songs and clap our hands. Our teacher plays the piano. My favourite song is about a little star.",
    questions: [
      { question: "When is music?", options: ["Monday", "Tuesday", "Thursday", "Saturday"], answer: "Tuesday" },
      { question: "What do they do in music?", options: ["Draw pictures", "Sing songs and clap", "Run fast", "Cook food"], answer: "Sing songs and clap" },
      { question: "What does the teacher play?", options: ["Guitar", "Piano", "Drums", "Flute"], answer: "Piano" },
      { question: "What is the favourite song about?", options: ["A dog", "A little star", "A bus", "A cake"], answer: "A little star" },
      { question: "What do they clap?", options: ["Their feet", "Their hands", "The desk", "The door"], answer: "Their hands" },
    ],
  },
  {
    title: "Beach day",
    passage: "We go to the beach in summer. The sea is blue and the sand is hot. Dad swims and I build a small castle. We eat sandwiches under a big umbrella.",
    questions: [
      { question: "When do they go to the beach?", options: ["In winter", "In summer", "At night", "Never"], answer: "In summer" },
      { question: "What colour is the sea?", options: ["Green", "Blue", "Brown", "Grey"], answer: "Blue" },
      { question: "What does the child build?", options: ["A house", "A small castle", "A boat", "A kite"], answer: "A small castle" },
      { question: "Who swims?", options: ["Mum", "Dad", "The teacher", "Grandma"], answer: "Dad" },
      { question: "What do they eat?", options: ["Soup", "Sandwiches", "Pizza", "Rice"], answer: "Sandwiches" },
    ],
  },
  {
    title: "Toy shop",
    passage: "After school we walk past the toy shop. There are dolls, balls and robots in the window. Ben wants a red car but he has no money today. We look and smile.",
    questions: [
      { question: "When do they walk past the shop?", options: ["Before school", "After school", "At night", "On holiday"], answer: "After school" },
      { question: "What is in the window?", options: ["Food", "Dolls, balls and robots", "Books only", "Clothes"], answer: "Dolls, balls and robots" },
      { question: "What does Ben want?", options: ["A doll", "A red car", "A robot", "A ball"], answer: "A red car" },
      { question: "Does Ben buy it today?", options: ["Yes", "No", "The text doesn't say", "He buys two"], answer: "No" },
      { question: "Why doesn't he buy it?", options: ["The shop is closed", "He has no money", "He doesn't like it", "It is broken"], answer: "He has no money" },
    ],
  },
  {
    title: "Morning routine",
    passage: "I wake up at seven o'clock. I wash my face and eat bread with jam. Then I put on my school uniform and pack my bag. Mum walks with me to school.",
    questions: [
      { question: "What time does the child wake up?", options: ["Six", "Seven", "Eight", "Nine"], answer: "Seven" },
      { question: "What does the child eat?", options: ["Rice", "Bread with jam", "Soup", "Pizza"], answer: "Bread with jam" },
      { question: "What does the child put on?", options: ["Pyjamas", "School uniform", "A coat only", "Shorts"], answer: "School uniform" },
      { question: "Who walks to school?", options: ["Dad", "Mum", "Grandma", "Alone"], answer: "Mum" },
      { question: "What does the child pack?", options: ["Lunch only", "Bag", "Toys only", "Nothing"], answer: "Bag" },
    ],
  },
]);

const uoe = gapsFromRows([
  ["I am", "I ___ (am) seven years old.", "am"],
  ["She is", "She ___ (is) my friend.", "is"],
  ["They are", "They ___ (are) happy.", "are"],
  ["He has", "He ___ (has) a dog.", "has"],
  ["We have", "We ___ (have) two cats.", "have"],
  ["In the box", "The ball is ___ (in) the box.", "in"],
  ["On the table", "The book is ___ (on) the table.", "on"],
  ["Under bed", "The cat is ___ (under) the bed.", "under"],
  ["Two dogs", "I have ___ (two) dogs.", "two"],
  ["Big house", "It is a ___ (big) house.", "big"],
  ["Red car", "The car is ___ (red).", "red"],
  ["Like apples", "I ___ (like) apples.", "like"],
  ["Play football", "They ___ (play) football.", "play"],
  ["My name", "___ (My) name is Tom.", "My"],
  ["This is", "___ (This) is my school.", "This"],
  ["Can swim", "I ___ (can) swim.", "can"],
  ["Do not", "I ___ (do) not like milk.", "do"],
  ["Go to school", "We ___ (go) to school.", "go"],
  ["Eat lunch", "She ___ (eat) lunch at school.", "eats"],
  ["Three books", "There are ___ (three) books.", "three"],
]);

const writing = writingsFromRows([
  ["My toys", "Write about your favourite toy.\n\n• What is it?\n• What colour is it?\n• Why do you like it?", 25, "3–5 simple sentences."],
  ["My classroom", "Write about your classroom.\n\n• What is in the room?\n• What colour is the door?\n• What do you do there?", 25, "Pre A1 sentences."],
  ["Favourite animal", "Write about an animal you like.\n\n• What animal?\n• Where does it live?\n• What does it eat?", 25, "Short sentences."],
  ["My friend", "Write about your friend.\n\n• Name and age\n• What you play together\n• Why you like them", 30, "Friendly tone."],
  ["My lunch", "Write about your lunch at school.\n\n• What food?\n• What drink?\n• Do you like it?", 25, "Present simple."],
  ["After school", "Write about what you do after school.\n\n• Where do you go?\n• Who do you see?\n• What do you do?", 30, "Simple present."],
  ["The park", "Write about a park near your home.\n\n• What can you see?\n• What can you do?\n• When do you go?", 30, "Pre A1 vocabulary."],
  ["My clothes", "Write about clothes you wear when it is cold.\n\n• What do you wear?\n• What colour?\n• Why?", 25, "Weather vocabulary."],
  ["Birthday", "Write about your birthday.\n\n• When is it?\n• What do you eat?\n• What present did you get?", 30, "Past simple OK with help."],
  ["My teacher", "Write about your teacher.\n\n• Name\n• What subject\n• Why you like them", 25, "Simple sentences."],
]);

const speaking = speakingsFromRows([
  ["Toys", "What is your favourite toy? What colour is it? Where do you keep it?", 10, 45],
  ["Classroom", "Tell me about your classroom. What is on the wall? How many desks?", 10, 45],
  ["Lunch", "What do you eat for lunch at school? What do you drink?", 10, 45],
  ["After school", "What do you do after school? Who do you play with?", 10, 45],
  ["Weather today", "What is the weather like today? What clothes do you wear?", 10, 45],
  ["Favourite song", "Do you like music? What songs do you like?", 10, 45],
  ["Visit shop", "Do you go to shops with your family? What do you buy?", 10, 45],
  ["Draw and colour", "Do you like drawing? What colours do you use?", 10, 45],
  ["Help at home", "Do you help at home? What do you do?", 10, 45],
  ["Favourite game", "What games do you play? Do you play inside or outside?", 10, 45],
]);

export const STARTERS_SUPPLEMENT: LevelSupplement = {
  reading,
  listening: listeningFromRows(STARTERS_LISTENING_ROWS),
  writing,
  speaking,
  uoe,
};
