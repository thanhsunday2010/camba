import { fromPassageSets, gap, listen, mcq, speak, write, type LevelBank } from "./types";

const reading = fromPassageSets([
  {
    title: "Science museum",
    passage:
      "Last week our class visited the city science museum. We learned about planets, robots and how electricity works. My favourite room was the planet exhibition because there was a large model of Mars you could walk around.",
    questions: [
      mcq("Science museum", "Where did the class go?", ["A library", "A science museum", "A farm", "A castle"], "A science museum"),
      mcq("Science museum", "What did they learn about?", ["Cooking", "Planets, robots and electricity", "Sports only", "Music"], "Planets, robots and electricity"),
      mcq("Science museum", "Which room was the writer's favourite?", ["The robot room", "The planet exhibition", "The café", "The shop"], "The planet exhibition"),
      mcq("Science museum", "Why did the writer like it?", ["It was quiet", "There was a model of Mars", "It was free", "It was outside"], "There was a model of Mars"),
      mcq("Science museum", "When did they visit?", ["Last month", "Last week", "Yesterday", "Today"], "Last week"),
    ],
  },
  {
    title: "Environment club",
    passage:
      "Our school's environment club meets every Thursday. We collect paper and plastic for recycling and grow vegetables in the school garden. Last term we planted tomatoes and carrots. This term we are making posters to save water.",
    questions: [
      mcq("Environment club", "When does the club meet?", ["Tuesday", "Wednesday", "Thursday", "Friday"], "Thursday"),
      mcq("Environment club", "What do they collect?", ["Glass only", "Paper and plastic", "Food waste", "Clothes"], "Paper and plastic"),
      mcq("Environment club", "What did they plant last term?", ["Flowers", "Tomatoes and carrots", "Trees only", "Nothing"], "Tomatoes and carrots"),
      mcq("Environment club", "Where do they grow vegetables?", ["At home", "In the school garden", "In the library", "In the hall"], "In the school garden"),
      mcq("Environment club", "What are they making this term?", ["Videos", "Posters to save water", "Cakes", "T-shirts"], "Posters to save water"),
    ],
  },
  {
    title: "Theatre trip",
    passage:
      "On Friday our drama teacher took us to the theatre to see a play about a detective. The show started at seven o'clock and lasted two hours. Although the tickets were expensive, everyone agreed it was worth it.",
    questions: [
      mcq("Theatre trip", "What kind of play did they see?", ["A comedy about sports", "A play about a detective", "A musical about space", "A horror story"], "A play about a detective"),
      mcq("Theatre trip", "What time did the show start?", ["Six", "Seven", "Eight", "Half past seven"], "Seven"),
      mcq("Theatre trip", "How long was the show?", ["One hour", "Two hours", "Three hours", "Ninety minutes"], "Two hours"),
      mcq("Theatre trip", "What did everyone think?", ["It was boring", "It was worth it", "It was too short", "They left early"], "It was worth it"),
      mcq("Theatre trip", "When did they go?", ["Thursday", "Friday", "Saturday", "Sunday"], "Friday"),
    ],
  },
  {
    title: "Exchange student",
    passage:
      "Lucia, an exchange student from Spain, is staying with our family for three weeks. She goes to school with me and helps me practise Spanish. In the evenings we cook paella together and talk about life in Barcelona.",
    questions: [
      mcq("Exchange student", "Where is Lucia from?", ["Italy", "Spain", "France", "Portugal"], "Spain"),
      mcq("Exchange student", "How long is she staying?", ["One week", "Two weeks", "Three weeks", "Three months"], "Three weeks"),
      mcq("Exchange student", "What language do they practise?", ["French", "Spanish", "German", "Chinese"], "Spanish"),
      mcq("Exchange student", "What do they cook?", ["Pizza", "Paella", "Soup", "Sandwiches"], "Paella"),
      mcq("Exchange student", "Which city does Lucia talk about?", ["Madrid", "Barcelona", "Valencia", "Seville"], "Barcelona"),
    ],
  },
  {
    title: "Charity run",
    passage:
      "Over two hundred students joined our charity run last Sunday to raise money for a local hospital. Each runner collected sponsors from friends and family. Together we raised more than five thousand pounds.",
    questions: [
      mcq("Charity run", "How many students joined?", ["About fifty", "Over two hundred", "Exactly one hundred", "Less than twenty"], "Over two hundred"),
      mcq("Charity run", "When was the run?", ["Saturday", "Sunday", "Monday", "Friday"], "Sunday"),
      mcq("Charity run", "Who benefited from the money?", ["A school library", "A local hospital", "An animal shelter", "A park"], "A local hospital"),
      mcq("Charity run", "How did runners get money?", ["They sold cakes", "They collected sponsors", "They charged tickets", "They didn't raise money"], "They collected sponsors"),
      mcq("Charity run", "How much was raised?", ["Five hundred pounds", "More than five thousand pounds", "Fifty pounds", "Nothing"], "More than five thousand pounds"),
    ],
  },
  {
    title: "Magazine article",
    passage:
      "Teen Scene magazine interviewed fifteen-year-old photographer Nina Chen. She started taking pictures with her phone but now uses a proper camera. Her advice for beginners is to take photos every day and learn from mistakes.",
    questions: [
      mcq("Magazine article", "Who was interviewed?", ["A singer", "A photographer", "A footballer", "A chef"], "A photographer"),
      mcq("Magazine article", "How old is Nina?", ["Thirteen", "Fourteen", "Fifteen", "Sixteen"], "Fifteen"),
      mcq("Magazine article", "What did she use at first?", ["A professional camera", "Her phone", "A tablet", "A friend's camera"], "Her phone"),
      mcq("Magazine article", "What is her advice?", ["Buy expensive equipment", "Take photos every day", "Never show your work", "Only take portraits"], "Take photos every day"),
      mcq("Magazine article", "Which magazine is it?", ["Sports Weekly", "Teen Scene", "Science Today", "Cooking World"], "Teen Scene"),
    ],
  },
  {
    title: "Delayed bus",
    passage:
      "Our school trip to the coast was nearly cancelled when the bus broke down on the motorway. After waiting an hour, a replacement bus arrived and we still had time for lunch on the beach before visiting the aquarium.",
    questions: [
      mcq("Delayed bus", "Where was the class going?", ["The mountains", "The coast", "A farm", "A castle"], "The coast"),
      mcq("Delayed bus", "What happened to the bus?", ["It got lost", "It broke down", "It was early", "It had no driver"], "It broke down"),
      mcq("Delayed bus", "How long did they wait?", ["Ten minutes", "An hour", "Three hours", "All day"], "An hour"),
      mcq("Delayed bus", "Where did they have lunch?", ["On the bus", "On the beach", "At school", "In the aquarium"], "On the beach"),
      mcq("Delayed bus", "What did they visit after lunch?", ["A museum", "The aquarium", "A theatre", "A stadium"], "The aquarium"),
    ],
  },
  {
    title: "International food festival",
    passage:
      "The town hall hosted an international food festival last Saturday. Visitors could try dishes from twenty countries, watch cooking demonstrations and listen to live music. All profits went to build a new community kitchen.",
    questions: [
      mcq("Food festival", "Where was the festival?", ["The park", "The town hall", "The school", "The stadium"], "The town hall"),
      mcq("Food festival", "How many countries were represented?", ["Ten", "Fifteen", "Twenty", "Thirty"], "Twenty"),
      mcq("Food festival", "What could visitors watch?", ["A football match", "Cooking demonstrations", "A film", "A fashion show"], "Cooking demonstrations"),
      mcq("Food festival", "What happened to the profits?", ["They were kept by organisers", "They went to a community kitchen", "They paid for music only", "There were no profits"], "They went to a community kitchen"),
      mcq("Food festival", "When was it held?", ["Friday", "Saturday", "Sunday", "Monday"], "Saturday"),
    ],
  },
  {
    title: "Technology lab",
    passage:
      "Our school lab received new microscopes and laptops thanks to a science grant. Year six students are using them for a project on microorganisms in pond water. The head teacher said the equipment will benefit all classes for years.",
    questions: [
      mcq("Technology lab", "What new equipment arrived?", ["Printers and cameras", "Microscopes and laptops", "Tables and chairs", "Sports kits"], "Microscopes and laptops"),
      mcq("Technology lab", "How was it paid for?", ["Parents donated", "A science grant", "Students saved money", "It was free"], "A science grant"),
      mcq("Technology lab", "What are Year six studying?", ["Planets", "Microorganisms in pond water", "Ancient history", "Music"], "Microorganisms in pond water"),
      mcq("Technology lab", "Who will benefit in future?", ["Only Year six", "All classes", "Teachers only", "Nobody else"], "All classes"),
      mcq("Technology lab", "Who made the announcement?", ["A student", "The head teacher", "A scientist", "A parent"], "The head teacher"),
    ],
  },
  {
    title: "Competition winner",
    passage:
      "Carlos won first prize in the regional chess competition after winning all five of his matches. He has played chess since he was seven and trains twice a week with his coach. Next month he will travel to the national finals.",
    questions: [
      mcq("Competition winner", "What competition did Carlos win?", ["Football", "Chess", "Swimming", "Spelling"], "Chess"),
      mcq("Competition winner", "How many matches did he win?", ["Three", "Four", "Five", "Six"], "Five"),
      mcq("Competition winner", "When did he start playing?", ["Age five", "Age seven", "Age ten", "Last year"], "Age seven"),
      mcq("Competition winner", "How often does he train?", ["Once a week", "Twice a week", "Every day", "Never"], "Twice a week"),
      mcq("Competition winner", "What happens next month?", ["He stops playing", "He goes to national finals", "He becomes a coach", "He moves abroad"], "He goes to national finals"),
    ],
  },
  {
    title: "Ocean project",
    passage:
      "For our geography project we researched ocean pollution. We interviewed a marine biologist online and created a website with tips for reducing plastic use. Our teacher entered the project into a national schools competition.",
    questions: [
      mcq("Ocean project", "What was the project topic?", ["Mountains", "Ocean pollution", "Deserts", "Cities"], "Ocean pollution"),
      mcq("Ocean project", "Who did they interview?", ["A fisherman", "A marine biologist", "A pilot", "A shop owner"], "A marine biologist"),
      mcq("Ocean project", "How did they interview them?", ["In person only", "Online", "By letter", "They didn't"], "Online"),
      mcq("Ocean project", "What did they create?", ["A poster only", "A website with tips", "A video game", "A cookbook"], "A website with tips"),
      mcq("Ocean project", "What did the teacher do?", ["Cancelled the project", "Entered it into a competition", "Deleted the website", "Sold it"], "Entered it into a competition"),
    ],
  },
  {
    title: "Town information board",
    passage:
      "Information for visitors: The library is open until six on weekdays and four on Saturdays. School concert tickets cost eight pounds for adults and five for students. Heavy rain is expected on Tuesday but Wednesday will be dry and sunny. The cycling club meets at the north gate of the park every Sunday morning. Bake the cookies for twelve minutes at 180 degrees.",
    questions: [
      mcq("Town information board", "When does the library close on Saturdays?", ["Four", "Five", "Six", "Seven"], "Four"),
      mcq("Town information board", "How much do students pay for concert tickets?", ["Three pounds", "Five pounds", "Eight pounds", "Ten pounds"], "Five pounds"),
      mcq("Town information board", "Which day will be sunny?", ["Monday", "Tuesday", "Wednesday", "Thursday"], "Wednesday"),
      mcq("Town information board", "Where does the cycling club meet?", ["The south gate", "The north gate", "The school", "The river"], "The north gate"),
      mcq("Town information board", "How long should you bake the cookies?", ["Ten minutes", "Twelve minutes", "Fifteen minutes", "Twenty minutes"], "Twelve minutes"),
    ],
  },
]);

const listening = [
  listen("Gate announcement", "Flight BA203 to Rome is now boarding at gate 12.", "Which gate?", ["10", "11", "12", "14"], "12"),
  listen("Window seat", "Hi, I'm running late. Save me a seat near the window.", "Where does she want to sit?", ["Near the door", "Near the window", "At the back", "At the front"], "Near the window"),
  listen("Castle tour", "The guided tour of the castle begins at eleven fifteen.", "When does the tour start?", ["10:15", "11:00", "11:15", "11:45"], "11:15"),
  listen("Shop lunch", "We're closed for lunch from one until two thirty.", "When do they reopen?", ["1:00", "2:00", "2:30", "3:00"], "2:30"),
  listen("Vet dream", "I've wanted to be a vet since I was eight years old.", "What job does she want?", ["A doctor", "A vet", "A teacher", "A pilot"], "A vet"),
  listen("Weather radio", "Tomorrow will be cloudy with showers in the afternoon.", "What is the weather tomorrow?", ["Sunny", "Cloudy with showers", "Snow", "Windy"], "Cloudy with showers"),
  listen("Photo course", "The photography course starts on the first Monday in April.", "When does the course start?", ["March", "First Monday in April", "May", "June"], "First Monday in April"),
  listen("No photos", "Photography is not allowed in the special exhibition.", "What can't you do?", ["Talk", "Eat", "Take photos", "Draw"], "Take photos"),
  listen("Cancelled match", "The match was cancelled because of heavy rain.", "Why was it cancelled?", ["Illness", "Heavy rain", "No players", "Lost ball"], "Heavy rain"),
  listen("Bookshop job", "She works three evenings a week at the bookshop.", "Where does she work?", ["A café", "A bookshop", "A school", "A hospital"], "A bookshop"),
  listen("Museum map", "The dinosaur exhibition is on the second floor, next to the café.", "Where is the dinosaur exhibition?", ["Ground floor", "Second floor", "Outside", "Basement"], "Second floor"),
  listen("Train delay", "The ten forty-five train to Brighton is delayed by twenty minutes.", "How long is the delay?", ["Ten minutes", "Twenty minutes", "Forty-five minutes", "One hour"], "Twenty minutes"),
  listen("Camping trip", "We're leaving for the camping trip at six tomorrow morning.", "When do they leave?", ["Six this evening", "Six tomorrow morning", "Six tomorrow evening", "At noon"], "Six tomorrow morning"),
  listen("Computer help", "If your laptop won't start, bring it to the IT office before three.", "Where should you go?", ["The library", "The IT office", "The canteen", "Reception"], "The IT office"),
  listen("School play", "Tickets for the school play are on sale from Monday in the main office.", "Where can you buy tickets?", ["Online only", "The main office", "The playground", "The theatre"], "The main office"),
  listen("Lost passport", "A passport was found in the hotel lobby. Please contact reception.", "Where was it found?", ["The restaurant", "The hotel lobby", "The pool", "A taxi"], "The hotel lobby"),
  listen("Interview time", "Your interview is at quarter to three on Thursday.", "What time is the interview?", ["2:15", "2:45", "3:15", "3:45"], "2:45"),
  listen("Recycling", "Please put glass bottles in the green bin outside the canteen.", "Where should glass go?", ["Blue bin", "Green bin outside canteen", "Black bin", "Any bin"], "Green bin outside canteen"),
  listen("Concert start", "Doors open at seven but the band starts playing at eight.", "When does the band start?", ["Seven", "Half past seven", "Eight", "Nine"], "Eight"),
  listen("Homestay", "Your host family expects you home before ten on school nights.", "When must you be home?", ["Nine", "Ten", "Eleven", "Midnight"], "Ten"),
  listen("Work experience", "On work experience day you'll shadow a nurse at the city hospital.", "Who will students shadow?", ["A doctor", "A nurse", "A dentist", "A driver"], "A nurse"),
  listen("Revision class", "Extra maths revision is on Wednesday after school in Room 12.", "When is the revision class?", ["Tuesday", "Wednesday", "Thursday", "Friday"], "Wednesday"),
  listen("Boat trip", "The boat trip lasts forty-five minutes and leaves every hour from Pier 3.", "How long is the trip?", ["Thirty minutes", "Forty-five minutes", "One hour", "Ninety minutes"], "Forty-five minutes"),
  listen("Language app", "I've been using this app to practise French for six months.", "What language is she practising?", ["Spanish", "French", "German", "Italian"], "French"),
  listen("Charity bake", "The charity bake sale raised three hundred pounds for the animal shelter.", "Who benefited?", ["A hospital", "An animal shelter", "A school", "A park"], "An animal shelter"),
];

const writing = [
  write("Story — discovery", "Write a story about finding something interesting.\n\nWrite 40–50 words.", 50, "A2 Flyers — past tenses."),
  write("Message — Saturday plans", "Write a message to your friend about plans for next Saturday.\n\nWrite 35–45 words.", 45, "Informal message."),
  write("Environment", "Your English teacher wants you to write about protecting the environment.\n\n• one problem\n• one thing students can do\n• why it matters\n\nWrite 45–55 words.", 55, "A2 Flyers writing."),
  write("Film review", "Write about a film you have seen.\n\n• what it was about\n• what you liked\n• who you watched it with\n\nWrite 45–55 words.", 55, "Past simple + opinion."),
  write("Letter to magazine", "Write a letter to a magazine about your favourite hobby.\n\nWrite 45–55 words.", 55, "Informal letter."),
  write("School improvements", "Write about one thing you would like to change at your school and why.\n\nWrite 45–55 words.", 55, "Opinion + reasons."),
  write("Travel blog", "Write a short blog post about a place you visited.\n\nWrite 45–55 words.", 55, "Descriptive writing."),
  write("Invitation reply", "Your friend invited you to a party but you cannot go. Write a reply explaining why and suggesting another time.\n\nWrite 40–50 words.", 50, "Functional writing."),
  write("Invent an animal", "Describe an imaginary animal: where it lives, what it eats, what it looks like.\n\nWrite 45–55 words.", 55, "Creative A2."),
  write("Sports event", "Write about a sports event you watched or took part in.\n\nWrite 45–55 words.", 55, "Narrative past."),
];

const speaking = [
  speak("Hobbies", "Talk about your hobbies. How often do you do them? Why do you enjoy them?", 15, 90),
  speak("Memorable trip", "Describe a memorable trip. Where did you go? What happened? Would you go again?", 15, 90),
  speak("Technology", "How do you use technology for learning? What are the advantages and disadvantages?", 15, 90),
  speak("Future job", "What job would you like in the future? Why? What skills do you need?", 15, 90),
  speak("Compare places", "Compare living in a city and living in the countryside. Which do you prefer?", 15, 90),
  speak("Book or film", "Talk about a book or film you enjoyed. What happened? Why did you like it?", 15, 90),
  speak("School rules", "Are there any school rules you would change? Explain your opinion.", 15, 90),
  speak("Helping others", "Describe a time when you helped someone. What did you do? How did you feel?", 15, 90),
  speak("Seasons", "Which season do you like best? What activities do you do then?", 15, 90),
  speak("Learning English", "Why are you learning English? How do you practise outside class?", 15, 90),
];

export const FLYERS_BANK: LevelBank = { reading, listening, writing, speaking, uoe: [] };
