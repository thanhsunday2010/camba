/**
 * Generates FLYERS, KET, PET, FCE supplement files with curated-style content.
 * Run: npx tsx scripts/generate-remaining-supplements.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "prisma/seed/curated/supplements");
const DATA = join(OUT, "data");
mkdirSync(DATA, { recursive: true });

type Row = [string, string, string, [string, string, string, string], string];

function L(title: string, tr: string, q: string, o: [string, string, string, string], a: string): Row {
  return [title, tr, q, o, a];
}

// --- FLYERS listening (95) — A2 Flyers level ---
const FLYERS_NAMES = ["Lucia", "Carlos", "Emma", "Noah", "Sofia", "Jack", "Mia", "Leo", "Zara", "Finn"];
const FLYERS_PLACES = ["museum", "library", "sports centre", "town hall", "aquarium", "theatre", "science lab", "community garden"];
const FLYERS_LISTENING: Row[] = [];
const fTimes = ["half past three", "quarter to five", "ten fifteen", "twenty past six", "eleven forty-five"];
const fDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
for (let i = 0; i < 95; i++) {
  const n = FLYERS_NAMES[i % FLYERS_NAMES.length]!;
  const p = FLYERS_PLACES[i % FLYERS_PLACES.length]!;
  const t = fTimes[i % fTimes.length]!;
  const d = fDays[i % fDays.length]!;
  const variants: Row[] = [
    L(`${n} meeting`, `${n} is meeting us outside the ${p} at ${t}.`, "Where are they meeting?", ["At home", `Outside the ${p}`, "At school", "Online"], `Outside the ${p}`),
    L(`${p} trip`, `Our class is visiting the ${p} on ${d}.`, "When is the trip?", [fDays[(i + 1) % 6]!, d, fDays[(i + 2) % 6]!, "Sunday"], d),
    L(`${n} homework`, `${n} forgot to finish the geography homework for ${d}.`, "When is the homework due?", [fDays[(i + 2) % 6]!, d, "Sunday", "Next month"], d),
    L(`Club ${i}`, `The after-school club moved to the ${p} this term.`, "Where is the club now?", ["The old hall", `The ${p}`, "The playground", "Online"], `The ${p}`),
    L(`Ticket ${i}`, `Tickets for the event cost eight pounds for students.`, "How much for students?", ["Five pounds", "Eight pounds", "Ten pounds", "Free"], "Eight pounds"),
  ];
  FLYERS_LISTENING.push(variants[i % variants.length]!);
}

// --- KET listening (95) ---
const KET_LISTENING: Row[] = [];
const ketPlaces = ["London", "Brighton", "Oxford", "Cambridge", "Manchester", "Bristol"];
for (let i = 0; i < 95; i++) {
  const city = ketPlaces[i % ketPlaces.length]!;
  const variants: Row[] = [
    L(`Train ${city}`, `The train to ${city} leaves from platform ${(i % 4) + 1} at ${10 + (i % 8)}:${i % 2 ? "15" : "30"}.`, "Which city is the train going to?", [ketPlaces[(i + 1) % 6]!, city, ketPlaces[(i + 2) % 6]!, "Paris"], city),
    L(`Hotel ${i}`, `Breakfast is served from seven until ten in the dining room.`, "Where is breakfast?", ["The lobby", "The dining room", "Your room", "The bar"], "The dining room"),
    L(`Course ${i}`, `The English course costs two hundred pounds for eight weeks.`, "How long is the course?", ["Four weeks", "Six weeks", "Eight weeks", "Ten weeks"], "Eight weeks"),
    L(`Doctor ${i}`, `Your appointment has been changed to three forty-five on Wednesday.`, "When is the appointment?", ["Tuesday 3:45", "Wednesday 3:45", "Wednesday 4:45", "Thursday 3:45"], "Wednesday 3:45"),
    L(`Museum ${i}`, `The museum is free for students with ID on weekdays.`, "Who gets free entry?", ["All children", "Students with ID", "Teachers", "Everyone"], "Students with ID"),
  ];
  KET_LISTENING.push(variants[i % variants.length]!);
}

// --- PET listening (95) ---
const PET_LISTENING: Row[] = [];
for (let i = 0; i < 95; i++) {
  const variants: Row[] = [
    L(`Interview ${i}`, `Could we move the interview to Thursday at two instead of Wednesday?`, "When is the new interview?", ["Wednesday 2 pm", "Thursday 2 pm", "Thursday 4 pm", "Friday"], "Thursday 2 pm"),
    L(`Workshop ${i}`, `The advanced photography workshop runs from the 10th to the 14th of May.`, "When does it run?", ["April", "10–14 May", "June", "All year"], "10–14 May"),
    L(`Job ${i}`, `Applicants must be able to speak French and have a driving licence.`, "What language is required?", ["Spanish", "French", "German", "Italian"], "French"),
    L(`Performance ${i}`, `Doors open at seven thirty but the performance starts at eight.`, "When does the performance start?", ["7:00", "7:30", "8:00", "8:30"], "8:00"),
    L(`Tour ${i}`, `The guided tour lasts ninety minutes and leaves every hour.`, "How long is the tour?", ["Sixty minutes", "Ninety minutes", "Two hours", "Thirty minutes"], "Ninety minutes"),
  ];
  PET_LISTENING.push(variants[i % variants.length]!);
}

// --- FCE listening (95) ---
const FCE_LISTENING: Row[] = [];
for (let i = 0; i < 95; i++) {
  const variants: Row[] = [
    L(`Conference ${i}`, `Registration opens at eight, with the keynote address at nine thirty.`, "When is the keynote?", ["8:00", "9:00", "9:30", "10:00"], "9:30"),
    L(`Research ${i}`, `Preliminary results suggest the treatment may delay symptoms by several months.`, "What may the treatment do?", ["Cure completely", "Delay symptoms", "Cause pain", "Reduce cost"], "Delay symptoms"),
    L(`Policy ${i}`, `Flexible working requests must be submitted at least six weeks in advance.`, "How much notice?", ["Two weeks", "Four weeks", "Six weeks", "Eight weeks"], "Six weeks"),
    L(`Council ${i}`, `The council plans to plant five thousand trees over the next three years.`, "How many trees?", ["500", "5000", "50000", "500000"], "5000"),
    L(`Seminar ${i}`, `Today's seminar on sustainable transport will examine European case studies at two in Room 4.`, "What is the seminar about?", ["History", "Sustainable transport", "Cooking", "Music"], "Sustainable transport"),
  ];
  FCE_LISTENING.push(variants[i % variants.length]!);
}

function emitListeningFile(level: string, rows: Row[]) {
  const lines = rows
    .map(
      ([title, tr, q, o, a]) =>
        `  [${JSON.stringify(title)}, ${JSON.stringify(tr)}, ${JSON.stringify(q)}, ${JSON.stringify(o)}, ${JSON.stringify(a)}],`
    )
    .join("\n");
  writeFileSync(
    join(DATA, `${level.toLowerCase()}-listening.ts`),
    `import type { ListenRow } from "../helpers";

export const ${level}_LISTENING_ROWS: ListenRow[] = [
${lines}
];
`
  );
}

function readingSetsBlock(level: string, sets: { title: string; passage: string; qs: { q: string; o: [string, string, string, string]; a: string }[] }[]) {
  const body = sets
    .map(
      (s) => `  {
    title: ${JSON.stringify(s.title)},
    passage: ${JSON.stringify(s.passage)},
    questions: [
${s.qs.map((x) => `      { question: ${JSON.stringify(x.q)}, options: ${JSON.stringify(x.o)}, answer: ${JSON.stringify(x.a)} },`).join("\n")}
    ],
  },`
    )
    .join("\n");
  return body;
}

const o4 = (a: string, b: string, c: string, d: string): [string, string, string, string] => [a, b, c, d];

function makeReadingSet(title: string, passage: string, qs: [string, [string, string, string, string], string][]) {
  return {
    title,
    passage,
    qs: qs.map(([q, o, a]) => ({ q, o, a })),
  };
}

// FLYERS reading: 8 sets × 5 = 40
const FLYERS_READING = [
  makeReadingSet("Coding club", "Our coding club meets on Wednesdays after school in the IT room. We learn to make simple games and animations. Last month we entered a national competition and came third.", [
    ["When does coding club meet?", o4("Mondays", "Wednesdays", "Fridays", "Sundays"), "Wednesdays"],
    ["Where is the club?", o4("The library", "The IT room", "The hall", "The canteen"), "The IT room"],
    ["What do they make?", o4("Food", "Games and animations", "Clothes", "Maps only"), "Games and animations"],
    ["What happened last month?", o4("They closed", "They came third in a competition", "They moved school", "They stopped coding"), "They came third in a competition"],
    ["Who is the text about?", o4("Teachers only", "Coding club members", "Parents", "Visitors"), "Coding club members"],
  ]),
  makeReadingSet("River clean-up", "Volunteers cleaned rubbish from the river bank on Sunday. They collected over fifty bags of plastic and old bottles. The mayor thanked everyone and promised new bins in the park.", [
    ["When was the clean-up?", o4("Saturday", "Sunday", "Monday", "Friday"), "Sunday"],
    ["What did volunteers collect?", o4("Leaves only", "Plastic and bottles", "Money", "Books"), "Plastic and bottles"],
    ["How many bags?", o4("Ten", "Over fifty", "Two", "One hundred"), "Over fifty"],
    ["Who thanked everyone?", o4("A teacher", "The mayor", "A student", "A shopkeeper"), "The mayor"],
    ["What was promised?", o4("New bins", "A swimming pool", "Free food", "Longer holidays"), "New bins"],
  ]),
  makeReadingSet("Host family", "During the exchange week I stayed with the Brown family in York. Mrs Brown cooked traditional meals and Mr Brown drove me to school. Their daughter Amy showed me the city walls.", [
    ["Where did the writer stay?", o4("London", "York", "Paris", "Rome"), "York"],
    ["Who cooked meals?", o4("Mr Brown", "Mrs Brown", "Amy", "A teacher"), "Mrs Brown"],
    ["Who showed the city walls?", o4("The mayor", "Amy", "A guide only", "Nobody"), "Amy"],
    ["How long was the stay?", o4("One day", "An exchange week", "One year", "One hour"), "An exchange week"],
    ["Who drove the writer to school?", o4("Mrs Brown", "Mr Brown", "Amy", "A bus driver only"), "Mr Brown"],
  ]),
  makeReadingSet("Drama performance", "The school drama group performed a play about space travel. Rehearsals took three months. On opening night the hall was full and parents filmed the show.", [
    ["What was the play about?", o4("Cooking", "Space travel", "Football", "Shopping"), "Space travel"],
    ["How long were rehearsals?", o4("One week", "Three months", "One day", "One year"), "Three months"],
    ["Where was it performed?", o4("The playground", "The hall", "A shop", "Online only"), "The hall"],
    ["Who filmed the show?", o4("Teachers only", "Parents", "Nobody", "The police"), "Parents"],
    ["Who performed?", o4("Professional actors", "The school drama group", "Parents", "Visitors only"), "The school drama group"],
  ]),
  makeReadingSet("Bike repair workshop", "The community centre ran a free bike repair workshop on Saturday. Mechanics fixed brakes and pumped tyres for twenty children. Organisers hope to run it again in spring.", [
    ["When was the workshop?", o4("Friday", "Saturday", "Sunday", "Monday"), "Saturday"],
    ["What was free?", o4("Lunch", "Bike repair workshop", "Bikes", "Lessons"), "Bike repair workshop"],
    ["What did mechanics fix?", o4("Phones", "Brakes and pumped tyres", "Computers", "Shoes"), "Brakes and pumped tyres"],
    ["How many children?", o4("Five", "Twenty", "One hundred", "Two"), "Twenty"],
    ["When might it run again?", o4("In winter", "In spring", "Never", "Tomorrow"), "In spring"],
  ]),
  makeReadingSet("Language podcast", "Flyers English podcast shares student interviews about hobbies. New episodes appear every fortnight. Listeners can send questions by email.", [
    ["What does the podcast share?", o4("Recipes", "Student interviews about hobbies", "Sports results", "Exam answers"), "Student interviews about hobbies"],
    ["How often are new episodes?", o4("Daily", "Every fortnight", "Yearly", "Never"), "Every fortnight"],
    ["How can listeners interact?", o4("By post only", "By email", "By phone vote", "They cannot"), "By email"],
    ["Who is interviewed?", o4("Teachers only", "Students", "Shopkeepers", "Drivers"), "Students"],
    ["What is the podcast called?", o4("Sports Weekly", "Flyers English podcast", "Cooking Today", "Maths Hour"), "Flyers English podcast"],
  ]),
  makeReadingSet("Solar panel project", "Our school installed solar panels on the roof to save energy. A display in the hall shows how much electricity they produce each day. Science classes use the data for projects.", [
    ["Where were panels installed?", o4("In the garden", "On the roof", "In the car park", "Underground"), "On the roof"],
    ["Why were they installed?", o4("To make noise", "To save energy", "To block rain", "For decoration"), "To save energy"],
    ["Where is the display?", o4("In the hall", "At the beach", "In town", "Online only"), "In the hall"],
    ["Who uses the data?", o4("Science classes", "Drivers", "Shopkeepers", "Nobody"), "Science classes"],
    ["What does the display show?", o4("Temperature only", "Electricity produced each day", "Number of students", "Bus times"), "Electricity produced each day"],
  ]),
  makeReadingSet("Charity swim", "Twenty pupils swam forty lengths each to raise money for a children's hospital. Sponsors donated online. The PE teacher said everyone showed great determination.", [
    ["How many pupils swam?", o4("Five", "Twenty", "One hundred", "Two"), "Twenty"],
    ["Who benefited?", o4("A zoo", "A children's hospital", "A café", "A shop"), "A children's hospital"],
    ["How did sponsors donate?", o4("By post only", "Online", "In coins at school only", "They did not"), "Online"],
    ["What did the PE teacher praise?", o4("Speed only", "Determination", "Silence", "Clothes"), "Determination"],
    ["How many lengths each?", o4("Ten", "Forty", "One", "One hundred"), "Forty"],
  ]),
];

// KET reading: 2 sets (10 q)
const KET_READING = [
  makeReadingSet("Community cinema", "The old town cinema reopened after repairs. It shows family films on Saturdays and classic films on Monday evenings. Tickets are cheaper for students before six o'clock.", [
    ["When does it show family films?", o4("Fridays", "Saturdays", "Sundays", "Every day"), "Saturdays"],
    ["When are classic films shown?", o4("Monday evenings", "Tuesday mornings", "Wednesday afternoons", "Never"), "Monday evenings"],
    ["Who gets cheaper tickets before six?", o4("Teachers", "Students", "Drivers", "Everyone"), "Students"],
    ["Why did it reopen?", o4("After repairs", "After a holiday", "After moving", "After closing forever"), "After repairs"],
    ["What kind of place is it?", o4("A shop", "A cinema", "A school", "A farm"), "A cinema"],
  ]),
  makeReadingSet("Running club", "Running club meets at the park on Tuesday and Thursday mornings before school. Members warm up together and run two kilometres. New runners are always welcome.", [
    ["Where does the club meet?", o4("At the park", "In the library", "At the beach", "In class"), "At the park"],
    ["When does it meet?", o4("Monday only", "Tuesday and Thursday mornings", "Weekends only", "Every night"), "Tuesday and Thursday mornings"],
    ["How far do they run?", o4("One kilometre", "Two kilometres", "Ten kilometres", "One metre"), "Two kilometres"],
    ["Are new runners welcome?", o4("No", "Yes", "Only teachers", "Only on Fridays"), "Yes"],
    ["What do they do first?", o4("Sleep", "Warm up together", "Eat lunch", "Watch TV"), "Warm up together"],
  ]),
];

// PET reading: 2 sets
const PET_READING = [
  makeReadingSet("Urban garden", "City volunteers turned an empty plot into a shared vegetable garden. Schools help water plants on Wednesdays. Produce is donated to a food bank each month.", [
    ["What was the plot before?", o4("A shop", "Empty", "A road", "A lake"), "Empty"],
    ["Who helps water plants?", o4("Schools", "Tourists", "Drivers", "Nobody"), "Schools"],
    ["When do schools help?", o4("Mondays", "Wednesdays", "Fridays", "Sundays"), "Wednesdays"],
    ["Where is produce donated?", o4("A food bank", "A stadium", "Abroad", "Online"), "A food bank"],
    ["How often is produce donated?", o4("Daily", "Each month", "Never", "Every hour"), "Each month"],
  ]),
  makeReadingSet("Podcast launch", "Students launched a podcast about teenage entrepreneurs. Episodes include interviews and tips for starting small businesses. Downloads passed one thousand in the first month.", [
    ["What is the podcast about?", o4("Sports only", "Teenage entrepreneurs", "Cooking", "History only"), "Teenage entrepreneurs"],
    ["What do episodes include?", o4("Interviews and tips", "Only music", "Exam papers", "Recipes only"), "Interviews and tips"],
    ["How many downloads in the first month?", o4("One hundred", "Over one thousand", "Ten", "None"), "Over one thousand"],
    ["Who launched it?", o4("Teachers", "Students", "The mayor", "Parents only"), "Students"],
    ["What businesses are discussed?", o4("Large factories", "Small businesses", "Only farms", "Only apps"), "Small businesses"],
  ]),
];

// FCE reading: 3 sets (15 q)
const FCE_READING = [
  makeReadingSet("Carbon capture pilot", "Engineers are testing a carbon capture unit at a regional power station. Early data suggests emissions could fall by eighteen per cent, though critics argue costs remain too high for widespread use.", [
    ["Where is the unit being tested?", o4("At a school", "At a regional power station", "In a museum", "On a farm"), "At a regional power station"],
    ["By how much could emissions fall?", o4("Five per cent", "Eighteen per cent", "Fifty per cent", "None"), "Eighteen per cent"],
    ["What do critics say?", o4("Costs are too high", "It is free", "It is perfect", "It is illegal"), "Costs are too high"],
    ["What is being captured?", o4("Water", "Carbon", "Noise", "Light"), "Carbon"],
    ["What stage is the project?", o4("Testing/pilot", "Closed", "Finished worldwide", "Cancelled"), "Testing/pilot"],
  ]),
  makeReadingSet("Medieval manuscript", "Researchers discovered a medieval manuscript in a private archive. Specialists are using imaging technology to read damaged pages. Publication is expected within two years.", [
    ["What was discovered?", o4("A coin", "A medieval manuscript", "A car", "A statue"), "A medieval manuscript"],
    ["Where was it found?", o4("In a shop", "In a private archive", "On a beach", "At school"), "In a private archive"],
    ["What technology is used?", o4("Imaging technology", "Drones only", "Robots only", "None"), "Imaging technology"],
    ["When is publication expected?", o4("Within two years", "Tomorrow", "In twenty years", "Never"), "Within two years"],
    ["What is damaged?", o4("Pages", "The building only", "Computers", "Roads"), "Pages"],
  ]),
  makeReadingSet("Remote healthcare", "A trial offers video consultations for minor illnesses in rural areas. Patients save travel time, but doctors warn that physical examinations are sometimes necessary.", [
    ["Who is the trial for?", o4("Urban areas only", "Rural areas", "Airports", "Schools"), "Rural areas"],
    ["What do patients save?", o4("Travel time", "Money only", "Food", "Books"), "Travel time"],
    ["What do doctors warn about?", o4("Physical examinations may be necessary", "All care is perfect", "No technology works", "Hospitals will close"), "Physical examinations may be necessary"],
    ["What kind of illnesses?", o4("Minor illnesses", "Only surgery", "Only broken bones", "None"), "Minor illnesses"],
    ["How are consultations done?", o4("By video", "By letter only", "In person only", "By phone only"), "By video"],
  ]),
];

const UOE_FLYERS = [
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
];

const WRITING_FLYERS = [
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
];

const SPEAKING_FLYERS = [
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
];

function emitSupplement(
  level: string,
  reading: ReturnType<typeof makeReadingSet>[],
  listening: Row[],
  uoe: [string, string, string][],
  writing: [string, string, number, string][],
  speaking: [string, string, number, number][]
) {
  emitListeningFile(level, listening);
  const importName = `${level}_LISTENING_ROWS`;
  const uoeBlock = uoe.map(([t, p, a]) => `  [${JSON.stringify(t)}, ${JSON.stringify(p)}, ${JSON.stringify(a)}],`).join("\n");
  const wBlock = writing.map(([t, p, wl, i]) => `  [${JSON.stringify(t)}, ${JSON.stringify(p)}, ${wl}, ${JSON.stringify(i)}],`).join("\n");
  const sBlock = speaking.map(([t, p, pr, st]) => `  [${JSON.stringify(t)}, ${JSON.stringify(p)}, ${pr}, ${st}],`).join("\n");
  const rBlock = readingSetsBlock(level, reading);

  writeFileSync(
    join(OUT, `${level.toLowerCase()}.ts`),
    `import type { LevelSupplement } from "./merge";
import { gapsFromRows, listeningFromRows, readingFromSets, speakingsFromRows, writingsFromRows } from "./helpers";
import { ${importName} } from "./data/${level.toLowerCase()}-listening";

const reading = readingFromSets([
${rBlock}
]);

const uoe = gapsFromRows([
${uoeBlock}
]);

const writing = writingsFromRows([
${wBlock}
]);

const speaking = speakingsFromRows([
${sBlock}
]);

export const ${level}_SUPPLEMENT: LevelSupplement = {
  reading,
  listening: listeningFromRows(${importName}),
  writing,
  speaking,
  uoe,
};
`
  );
}

emitSupplement("FLYERS", FLYERS_READING, FLYERS_LISTENING, UOE_FLYERS, WRITING_FLYERS, SPEAKING_FLYERS);

const WRITING_KET = WRITING_FLYERS.map(([t, p, wl]) => [t.replace("55", "35").replace("50", "35"), p.replace("45–55", "25–35").replace("40–50", "25–35"), Math.min(wl, 35), "A2 Key writing."] as [string, string, number, string]);
const SPEAKING_KET = SPEAKING_FLYERS.map(([t, p]) => [t, p.replace("90", "60"), 15, 60] as [string, string, number, number]);
emitSupplement("KET", KET_READING, KET_LISTENING, [], WRITING_KET, SPEAKING_KET);

const WRITING_PET = WRITING_FLYERS.map(([t, p]) => [t, p.replace("45–55", "100").replace("40–50", "100"), 100, "B1 Preliminary writing."] as [string, string, number, string]);
const SPEAKING_PET = SPEAKING_FLYERS;
emitSupplement("PET", PET_READING, PET_LISTENING, [], WRITING_PET, SPEAKING_PET);

const WRITING_FCE = WRITING_FLYERS.map(([t, p]) => [t, p.replace("45–55", "140–190").replace("40–50", "140–190"), 190, "B2 First writing."] as [string, string, number, string]);
emitSupplement("FCE", FCE_READING, FCE_LISTENING, [], WRITING_FCE, SPEAKING_FLYERS);

console.log("Generated FLYERS, KET, PET, FCE supplements.");
