import type { LevelSupplement } from "./merge";
import { gapsFromRows, listeningFromRows, readingFromSets, speakingsFromRows, writingsFromRows } from "./helpers";
import { FLYERS_LISTENING_ROWS } from "./data/flyers-listening";

const reading = readingFromSets([
  {
    title: "Coding club",
    passage: "Our coding club meets on Wednesdays after school in the IT room. We learn to make simple games and animations. Last month we entered a national competition and came third.",
    questions: [
      { question: "When does coding club meet?", options: ["Mondays","Wednesdays","Fridays","Sundays"], answer: "Wednesdays" },
      { question: "Where is the club?", options: ["The library","The IT room","The hall","The canteen"], answer: "The IT room" },
      { question: "What do they make?", options: ["Food","Games and animations","Clothes","Maps only"], answer: "Games and animations" },
      { question: "What happened last month?", options: ["They closed","They came third in a competition","They moved school","They stopped coding"], answer: "They came third in a competition" },
      { question: "Who is the text about?", options: ["Teachers only","Coding club members","Parents","Visitors"], answer: "Coding club members" },
    ],
  },
  {
    title: "River clean-up",
    passage: "Volunteers cleaned rubbish from the river bank on Sunday. They collected over fifty bags of plastic and old bottles. The mayor thanked everyone and promised new bins in the park.",
    questions: [
      { question: "When was the clean-up?", options: ["Saturday","Sunday","Monday","Friday"], answer: "Sunday" },
      { question: "What did volunteers collect?", options: ["Leaves only","Plastic and bottles","Money","Books"], answer: "Plastic and bottles" },
      { question: "How many bags?", options: ["Ten","Over fifty","Two","One hundred"], answer: "Over fifty" },
      { question: "Who thanked everyone?", options: ["A teacher","The mayor","A student","A shopkeeper"], answer: "The mayor" },
      { question: "What was promised?", options: ["New bins","A swimming pool","Free food","Longer holidays"], answer: "New bins" },
    ],
  },
  {
    title: "Host family",
    passage: "During the exchange week I stayed with the Brown family in York. Mrs Brown cooked traditional meals and Mr Brown drove me to school. Their daughter Amy showed me the city walls.",
    questions: [
      { question: "Where did the writer stay?", options: ["London","York","Paris","Rome"], answer: "York" },
      { question: "Who cooked meals?", options: ["Mr Brown","Mrs Brown","Amy","A teacher"], answer: "Mrs Brown" },
      { question: "Who showed the city walls?", options: ["The mayor","Amy","A guide only","Nobody"], answer: "Amy" },
      { question: "How long was the stay?", options: ["One day","An exchange week","One year","One hour"], answer: "An exchange week" },
      { question: "Who drove the writer to school?", options: ["Mrs Brown","Mr Brown","Amy","A bus driver only"], answer: "Mr Brown" },
    ],
  },
  {
    title: "Drama performance",
    passage: "The school drama group performed a play about space travel. Rehearsals took three months. On opening night the hall was full and parents filmed the show.",
    questions: [
      { question: "What was the play about?", options: ["Cooking","Space travel","Football","Shopping"], answer: "Space travel" },
      { question: "How long were rehearsals?", options: ["One week","Three months","One day","One year"], answer: "Three months" },
      { question: "Where was it performed?", options: ["The playground","The hall","A shop","Online only"], answer: "The hall" },
      { question: "Who filmed the show?", options: ["Teachers only","Parents","Nobody","The police"], answer: "Parents" },
      { question: "Who performed?", options: ["Professional actors","The school drama group","Parents","Visitors only"], answer: "The school drama group" },
    ],
  },
  {
    title: "Bike repair workshop",
    passage: "The community centre ran a free bike repair workshop on Saturday. Mechanics fixed brakes and pumped tyres for twenty children. Organisers hope to run it again in spring.",
    questions: [
      { question: "When was the workshop?", options: ["Friday","Saturday","Sunday","Monday"], answer: "Saturday" },
      { question: "What was free?", options: ["Lunch","Bike repair workshop","Bikes","Lessons"], answer: "Bike repair workshop" },
      { question: "What did mechanics fix?", options: ["Phones","Brakes and pumped tyres","Computers","Shoes"], answer: "Brakes and pumped tyres" },
      { question: "How many children?", options: ["Five","Twenty","One hundred","Two"], answer: "Twenty" },
      { question: "When might it run again?", options: ["In winter","In spring","Never","Tomorrow"], answer: "In spring" },
    ],
  },
  {
    title: "Language podcast",
    passage: "Flyers English podcast shares student interviews about hobbies. New episodes appear every fortnight. Listeners can send questions by email.",
    questions: [
      { question: "What does the podcast share?", options: ["Recipes","Student interviews about hobbies","Sports results","Exam answers"], answer: "Student interviews about hobbies" },
      { question: "How often are new episodes?", options: ["Daily","Every fortnight","Yearly","Never"], answer: "Every fortnight" },
      { question: "How can listeners interact?", options: ["By post only","By email","By phone vote","They cannot"], answer: "By email" },
      { question: "Who is interviewed?", options: ["Teachers only","Students","Shopkeepers","Drivers"], answer: "Students" },
      { question: "What is the podcast called?", options: ["Sports Weekly","Flyers English podcast","Cooking Today","Maths Hour"], answer: "Flyers English podcast" },
    ],
  },
  {
    title: "Solar panel project",
    passage: "Our school installed solar panels on the roof to save energy. A display in the hall shows how much electricity they produce each day. Science classes use the data for projects.",
    questions: [
      { question: "Where were panels installed?", options: ["In the garden","On the roof","In the car park","Underground"], answer: "On the roof" },
      { question: "Why were they installed?", options: ["To make noise","To save energy","To block rain","For decoration"], answer: "To save energy" },
      { question: "Where is the display?", options: ["In the hall","At the beach","In town","Online only"], answer: "In the hall" },
      { question: "Who uses the data?", options: ["Science classes","Drivers","Shopkeepers","Nobody"], answer: "Science classes" },
      { question: "What does the display show?", options: ["Temperature only","Electricity produced each day","Number of students","Bus times"], answer: "Electricity produced each day" },
    ],
  },
  {
    title: "Charity swim",
    passage: "Twenty pupils swam forty lengths each to raise money for a children's hospital. Sponsors donated online. The PE teacher said everyone showed great determination.",
    questions: [
      { question: "How many pupils swam?", options: ["Five","Twenty","One hundred","Two"], answer: "Twenty" },
      { question: "Who benefited?", options: ["A zoo","A children's hospital","A café","A shop"], answer: "A children's hospital" },
      { question: "How did sponsors donate?", options: ["By post only","Online","In coins at school only","They did not"], answer: "Online" },
      { question: "What did the PE teacher praise?", options: ["Speed only","Determination","Silence","Clothes"], answer: "Determination" },
      { question: "How many lengths each?", options: ["Ten","Forty","One","One hundred"], answer: "Forty" },
    ],
  },
]);

const uoe = gapsFromRows([
  ["Past simple", "They ___ (visit) the museum last week.", "visited"],
  ["Going to", "We are ___ (going) to start a club.", "going"],
  ["Must", "You ___ (must) wear safety goggles.", "must"],
  ["Should", "You ___ (should) drink more water.", "should"],
  ["Comparative", "This book is ___ (interesting) than that one.", "more interesting"],
  ["Present perfect", "She has ___ (already) finished.", "already"],
  ["Preposition at", "Meet me ___ (at) the gate.", "at"],
  ["Preposition by", "Travel ___ (by) bus.", "by"],
  ["Object them", "I gave ___ (they) the tickets.", "them"],
  ["Plural", "The ___ (child) are waiting.", "children"],
  ["Was were", "We ___ (were) late.", "were"],
  ["Will future", "It ___ (will) rain tomorrow.", "will"],
  ["Could", "___ (Could) you help me?", "Could"],
  ["Many", "How ___ (many) chairs do we need?", "many"],
  ["Because", "Stayed home because it ___ (rain) ed.", "rained"],
  ["Never", "I have ___ (never) tried sushi.", "never"],
  ["Possessive", "That is ___ (James) coat.", "James's"],
  ["Adverb quickly", "She ran ___ (quick) ly.", "quickly"],
  ["Present continuous", "They are ___ (study) for the test.", "studying"],
  ["Did", "___ (Did) he call you?", "Did"],
]);

const writing = writingsFromRows([
  ["Story start", "Write a story that begins: 'When I opened the door, I couldn't believe my eyes.'\n\nWrite 45–55 words.", 55, "A2 narrative."],
  ["Blog post", "Write a blog post about a club you enjoy.\n\nWrite 45–55 words.", 55, "Informal blog."],
  ["Email plans", "Write an email to a friend about plans for next month.\n\nWrite 40–50 words.", 50, "Informal email."],
  ["Opinion", "Write about whether students should wear uniform.\n\nWrite 45–55 words.", 55, "Give reasons."],
  ["Trip report", "Write about a school trip you enjoyed.\n\nWrite 45–55 words.", 55, "Past tense."],
  ["Film message", "Write a message recommending a film to a friend.\n\nWrite 40–50 words.", 50, "Recommendation."],
  ["Environment", "Write about one thing your school does to help the environment.\n\nWrite 45–55 words.", 55, "Factual."],
  ["Competition", "Write about a competition you entered.\n\nWrite 45–55 words.", 55, "Narrative."],
  ["Invitation reply", "Reply to an invitation. You can come but will be late.\n\nWrite 40–50 words.", 50, "Functional."],
  ["New hobby", "Write about a new hobby you started this year.\n\nWrite 45–55 words.", 55, "Present/past mix."],
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

export const FLYERS_SUPPLEMENT: LevelSupplement = {
  reading,
  listening: listeningFromRows(FLYERS_LISTENING_ROWS),
  writing,
  speaking,
  uoe,
};
