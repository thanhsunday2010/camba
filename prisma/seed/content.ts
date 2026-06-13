import { ExamLevel } from "@prisma/client";
import type {
  GapSeed,
  ListeningSeed,
  McqSeed,
  SpeakingSeed,
  WritingSeed,
} from "./helpers";

const p = (text: string) => text;

/** Shared passages reused within a level */
const passages = {
  ket1: p(`My name is Lily. I am twelve and I live in Hanoi. Every morning I wake up at six and have breakfast with my family. I walk to school with my best friend Anna. My favourite subjects are English and Art.`),
  ket2: p(`Last summer Ben's family went to Da Nang for five days. They stayed in a hotel near the beach. Ben swam every day and visited Marble Mountains. In the evening they ate fresh seafood.`),
  pet1: p(`Remote working has become common since 2020. Many employees enjoy flexible hours and no commuting. However, some managers worry that teamwork suffers when people rarely meet face to face. Companies are now experimenting with hybrid models.`),
  fce1: p(`Urban green spaces play a vital role in public health. Studies show that access to parks reduces stress and encourages physical activity. Critics argue maintenance costs are high, yet the long-term savings in healthcare may outweigh the expense.`),
  starters1: p(`This is Tom. He is seven. He has a small brown dog. The dog likes to play in the garden.`),
  movers1: p(`Sara went to the zoo with her dad on Saturday. They saw lions, monkeys and penguins. Sara liked the penguins best because they were funny.`),
  flyers1: p(`Last week our class visited a science museum. We learned about planets and robots. My favourite part was the planet room because it had a model of Mars.`),
};

function mcq(title: string, question: string, options: string[], answer: string, passage?: string): McqSeed {
  return { title, question, options, answer, passage };
}

export const LEVEL_PACKS: Record<
  ExamLevel,
  {
    reading: { practice: McqSeed[][]; mock: McqSeed[] };
    writing: { practice: WritingSeed[]; mock: WritingSeed[] };
    listening: { practice: ListeningSeed[]; mock: ListeningSeed[] };
    speaking: SpeakingSeed[];
    uoe?: { practice: GapSeed[]; mock: GapSeed[] };
  }
> = {
  STARTERS: {
    reading: {
      practice: [
        [
          mcq("Animal", "What is this? (Picture: a cat)", ["A dog", "A cat", "A bird", "A fish"], "A cat"),
          mcq("Colour", "What colour is the ball? (Picture: red ball)", ["Blue", "Green", "Red", "Yellow"], "Red"),
          mcq("Number", "How many apples? (Picture: three apples)", ["Two", "Three", "Four", "Five"], "Three"),
          mcq("Place", "Where is the book? (Picture: on the table)", ["Under the chair", "On the table", "In the bag", "On the floor"], "On the table"),
          mcq("Food", "What do you drink when you are thirsty?", ["Bread", "Water", "Rice", "Eggs"], "Water"),
        ],
        [
          mcq("Tom's pet", "How old is Tom?", ["Five", "Six", "Seven", "Eight"], "Seven", passages.starters1),
          mcq("Tom's pet", "What colour is the dog?", ["Black", "White", "Brown", "Grey"], "Brown", passages.starters1),
          mcq("Tom's pet", "Where does the dog play?", ["In the kitchen", "In the garden", "In the street", "At school"], "In the garden", passages.starters1),
          mcq("Family", "Who is in Tom's family?", ["Only Tom", "Tom and his dog", "Tom and his cat", "Tom and his sister"], "Tom and his dog", passages.starters1),
          mcq("Activity", "What does the dog like to do?", ["Sleep", "Play", "Swim", "Fly"], "Play", passages.starters1),
        ],
      ],
      mock: [
        mcq("Clothes", "What is she wearing? (Picture: yellow dress)", ["A coat", "A yellow dress", "Trousers", "A hat"], "A yellow dress"),
        mcq("Weather", "What is the weather like? (Picture: sun)", ["Rainy", "Snowy", "Sunny", "Windy"], "Sunny"),
        mcq("Transport", "How do they go to school? (Picture: bus)", ["By car", "By bus", "By bike", "On foot"], "By bus"),
        mcq("Body", "Point to your nose.", ["Ear", "Nose", "Hand", "Foot"], "Nose"),
        mcq("Time", "When do you eat breakfast?", ["In the morning", "At night", "At school", "Never"], "In the morning"),
        mcq("Sport", "What sport is this? (Picture: football)", ["Tennis", "Football", "Swimming", "Running"], "Football"),
        mcq("Home", "Where do you sleep?", ["In the bathroom", "In the bedroom", "In the garden", "At the shop"], "In the bedroom"),
        mcq("Feelings", "How does she feel? (Picture: happy face)", ["Sad", "Angry", "Happy", "Tired"], "Happy"),
      ],
    },
    writing: {
      practice: [
        {
          title: "Starters Writing - About me",
          taskPrompt: "Write 3 sentences about you.\n\n• Your name\n• Your age\n• Your favourite colour",
          wordLimit: 20,
          instructions: "Use simple sentences. Pre A1 level.",
        },
        {
          title: "Starters Writing - My family",
          taskPrompt: "Write about your family.\n\n• How many people\n• One person you like\n• What you do together",
          wordLimit: 25,
          instructions: "Short sentences only.",
        },
      ],
      mock: [
        {
          title: "Starters Writing Mock",
          taskPrompt: "Look at the picture of a park.\n\nWrite 4 sentences:\n• Where are the children?\n• What are they doing?\n• What is the weather like?\n• Do you like parks?",
          wordLimit: 30,
          instructions: "Mock writing task — Pre A1.",
        },
      ],
    },
    listening: {
      practice: [
        { title: "Colours", transcript: "The pen is blue.", question: "What colour is the pen?", options: ["Red", "Blue", "Green", "Black"], answer: "Blue" },
        { title: "Numbers", transcript: "I can see five birds.", question: "How many birds?", options: ["Three", "Four", "Five", "Six"], answer: "Five" },
        { title: "Places", transcript: "The cat is under the chair.", question: "Where is the cat?", options: ["On the table", "Under the chair", "In the box", "Behind the door"], answer: "Under the chair" },
        { title: "Food", transcript: "I want an apple, please.", question: "What does the boy want?", options: ["A banana", "An apple", "Milk", "Bread"], answer: "An apple" },
      ],
      mock: [
        { title: "Morning", transcript: "Good morning! It is seven o'clock. Time for school.", question: "What time is it?", options: ["Six", "Seven", "Eight", "Nine"], answer: "Seven" },
        { title: "Toy", transcript: "This is my new robot. It can walk and talk.", question: "What is new?", options: ["A car", "A robot", "A ball", "A book"], answer: "A robot" },
        { title: "Friend", transcript: "My friend's name is Kim. She is six.", question: "How old is Kim?", options: ["Five", "Six", "Seven", "Eight"], answer: "Six" },
        { title: "Park", transcript: "Let's play in the park after lunch.", question: "When do they play?", options: ["Before lunch", "After lunch", "At night", "Never"], answer: "After lunch" },
        { title: "Pet", transcript: "Our fish is called Bubbles.", question: "What pet do they have?", options: ["A dog", "A cat", "A fish", "A rabbit"], answer: "A fish" },
        { title: "Clothes", transcript: "Put on your hat. It is cold today.", question: "What should you wear?", options: ["Shoes", "A hat", "Shorts", "A T-shirt"], answer: "A hat" },
      ],
    },
    speaking: [
      { title: "Starters Speaking - About you", prompt: "What is your name? How old are you? What is your favourite toy?", preparationTime: 10, speakingTime: 45 },
      { title: "Starters Speaking Mock", prompt: "Tell me about your house. How many rooms? What is your favourite room?", preparationTime: 15, speakingTime: 60 },
    ],
  },

  MOVERS: {
    reading: {
      practice: [
        [
          mcq("Zoo trip", "Where did Sara go?", ["The park", "The zoo", "The beach", "School"], "The zoo", passages.movers1),
          mcq("Zoo trip", "Who went with Sara?", ["Her mum", "Her dad", "Her brother", "Her teacher"], "Her dad", passages.movers1),
          mcq("Zoo trip", "Which animals did they see?", ["Dogs and cats", "Lions, monkeys and penguins", "Fish only", "Birds only"], "Lions, monkeys and penguins", passages.movers1),
          mcq("Zoo trip", "Which animals did Sara like best?", ["Lions", "Monkeys", "Penguins", "Bears"], "Penguins", passages.movers1),
          mcq("Zoo trip", "Why did she like them?", ["They were big", "They were funny", "They were fast", "They were scary"], "They were funny", passages.movers1),
        ],
        [
          mcq("School", "When does school start?", ["8:00", "8:30", "9:00", "9:30"], "8:30"),
          mcq("Lunch", "What does Anna eat for lunch?", ["Pizza", "Rice and chicken", "Sandwich", "Soup"], "Sandwich"),
          mcq("Hobby", "What does Ben collect?", ["Stamps", "Coins", "Cards", "Books"], "Stamps"),
          mcq("Sport", "Which day is football practice?", ["Monday", "Wednesday", "Friday", "Sunday"], "Wednesday"),
          mcq("Weather", "What will the weather be tomorrow?", ["Rainy", "Cloudy", "Sunny", "Snowy"], "Sunny"),
        ],
      ],
      mock: [
        mcq("Library", "How often does Maria go to the library?", ["Every day", "Twice a week", "Once a month", "Never"], "Twice a week"),
        mcq("Birthday", "What did Tom get for his birthday?", ["A bike", "A computer game", "A book", "A watch"], "A computer game"),
        mcq("Holiday", "Where are they going in July?", ["The mountains", "The coast", "A city", "Abroad"], "The coast"),
        mcq("Teacher", "What subject does Mr Lee teach?", ["Maths", "Science", "English", "History"], "Science"),
        mcq("Shopping", "What did they buy at the shop?", ["Bread and milk", "Fruit", "Clothes", "Toys"], "Fruit"),
        mcq("Transport", "How long does the bus take?", ["Ten minutes", "Twenty minutes", "Half an hour", "An hour"], "Twenty minutes"),
        mcq("Club", "What do they do at art club?", ["Sing", "Paint and draw", "Play chess", "Dance"], "Paint and draw"),
        mcq("Pet care", "Who feeds the rabbit?", ["Tom", "Sara", "Their dad", "Their grandma"], "Sara"),
      ],
    },
    writing: {
      practice: [
        {
          title: "Movers Writing - Last weekend",
          taskPrompt: "Write about your last weekend.\n\n• Where did you go?\n• Who did you go with?\n• What did you do?\n\nWrite 30-40 words.",
          wordLimit: 40,
          instructions: "A1 Movers — past simple.",
        },
        {
          title: "Movers Writing - Email",
          taskPrompt: "Write an email to your friend about your new hobby.\n\nWrite 35-45 words.",
          wordLimit: 45,
          instructions: "Informal email.",
        },
      ],
      mock: [
        {
          title: "Movers Writing Mock",
          taskPrompt: "Look at the pictures of a birthday party.\n\nWrite a story. Say who came, what you ate, and how you felt.\n\nWrite 40-50 words.",
          wordLimit: 50,
          instructions: "Mock writing A1 Movers.",
        },
      ],
    },
    listening: {
      practice: [
        { title: "Phone", transcript: "Can you call me at half past four?", question: "When should you call?", options: ["4:00", "4:15", "4:30", "5:00"], answer: "4:30" },
        { title: "Directions", transcript: "Turn left at the supermarket, then go straight on.", question: "Where do you turn left?", options: ["At the bank", "At the supermarket", "At the school", "At the park"], answer: "At the supermarket" },
        { title: "Plans", transcript: "We're meeting outside the cinema at six.", question: "Where are they meeting?", options: ["At home", "At the cinema", "At the café", "At school"], answer: "At the cinema" },
        { title: "Price", transcript: "The ticket costs twelve pounds fifty.", question: "How much is the ticket?", options: ["£10.50", "£12.00", "£12.50", "£15.00"], answer: "£12.50" },
      ],
      mock: [
        { title: "Train", transcript: "The train to Manchester leaves from platform 2 at twenty-five past nine.", question: "What time does the train leave?", options: ["9:15", "9:20", "9:25", "9:30"], answer: "9:25" },
        { title: "Homework", transcript: "Don't forget to finish your science homework for Tuesday.", question: "When is the homework due?", options: ["Monday", "Tuesday", "Wednesday", "Friday"], answer: "Tuesday" },
        { title: "Weather", transcript: "It's going to rain this afternoon, so take an umbrella.", question: "What should you take?", options: ["A hat", "An umbrella", "Sunglasses", "Gloves"], answer: "An umbrella" },
        { title: "Club", transcript: "Swimming club has moved to the new sports centre.", question: "Where is swimming club now?", options: ["The old pool", "The sports centre", "The lake", "The beach"], answer: "The sports centre" },
        { title: "Invitation", transcript: "Would you like to come to my party on Saturday?", question: "When is the party?", options: ["Friday", "Saturday", "Sunday", "Monday"], answer: "Saturday" },
        { title: "Lost item", transcript: "I think I left my jacket in the classroom.", question: "What did she lose?", options: ["A bag", "A jacket", "A phone", "A book"], answer: "A jacket" },
      ],
    },
    speaking: [
      { title: "Movers Speaking - School", prompt: "Tell me about your school. What subjects do you like? What do you do at break time?", preparationTime: 15, speakingTime: 60 },
      { title: "Movers Speaking Mock", prompt: "Describe a place you visited recently. Where was it? What did you see and do?", preparationTime: 20, speakingTime: 90 },
    ],
  },

  FLYERS: {
    reading: {
      practice: [
        [
          mcq("Museum", "Where did the class go?", ["A library", "A science museum", "A farm", "A castle"], "A science museum", passages.flyers1),
          mcq("Museum", "What did they learn about?", ["Animals", "Planets and robots", "History", "Sports"], "Planets and robots", passages.flyers1),
          mcq("Museum", "What was Sara's favourite part?", ["The robot room", "The planet room", "The shop", "The café"], "The planet room", passages.flyers1),
          mcq("Museum", "Why did she like it?", ["It was quiet", "It had a model of Mars", "It was free", "It was small"], "It had a model of Mars", passages.flyers1),
          mcq("Museum", "When did they visit?", ["Last month", "Last week", "Yesterday", "Today"], "Last week", passages.flyers1),
        ],
        [
          mcq("Environment", "What does the club recycle?", ["Paper and plastic", "Glass only", "Food", "Clothes"], "Paper and plastic"),
          mcq("Sports day", "Who won the race?", ["Anna", "Ben", "Carlos", "Diana"], "Carlos"),
          mcq("Cooking", "What did they make?", ["Pizza", "Cookies", "Soup", "Salad"], "Cookies"),
          mcq("Camp", "How many nights did they stay?", ["One", "Two", "Three", "Four"], "Three"),
          mcq("Project", "What was the project topic?", ["Space", "Oceans", "Dinosaurs", "Music"], "Oceans"),
        ],
      ],
      mock: [
        mcq("Theatre", "What time does the show start?", ["6:00", "6:30", "7:00", "7:30"], "7:00"),
        mcq("Exchange", "Which country is the visitor from?", ["France", "Spain", "Italy", "Germany"], "Spain"),
        mcq("Competition", "What prize did they win?", ["A medal", "A trophy", "A certificate", "A book"], "A trophy"),
        mcq("Magazine", "How often is the magazine published?", ["Weekly", "Monthly", "Yearly", "Daily"], "Monthly"),
        mcq("Charity", "What are they collecting money for?", ["A hospital", "A school library", "An animal shelter", "A park"], "A school library"),
        mcq("Technology", "What new equipment did the lab get?", ["Computers", "Microscopes", "Cameras", "Printers"], "Microscopes"),
        mcq("Trip delay", "Why was the bus late?", ["Traffic", "Snow", "A flat tyre", "The driver was ill"], "Traffic"),
        mcq("Festival", "What can visitors try at the festival?", ["International food", "Horse riding", "Skiing", "Boat racing"], "International food"),
      ],
    },
    writing: {
      practice: [
        {
          title: "Flyers Writing - Story",
          taskPrompt: "Write a story about finding something interesting.\n\nWrite 40-50 words.",
          wordLimit: 50,
          instructions: "A2 Flyers — use past tenses.",
        },
        {
          title: "Flyers Writing - Message",
          taskPrompt: "Write a message to your friend about plans for next Saturday.\n\nWrite 35-45 words.",
          wordLimit: 45,
          instructions: "Informal message.",
        },
      ],
      mock: [
        {
          title: "Flyers Writing Mock",
          taskPrompt: "Your English teacher wants you to write about protecting the environment.\n\n• one problem\n• one thing students can do\n• why it matters\n\nWrite 45-55 words.",
          wordLimit: 55,
          instructions: "Mock writing A2 Flyers.",
        },
      ],
    },
    listening: {
      practice: [
        { title: "Announcement", transcript: "Flight BA203 to Rome is now boarding at gate 12.", question: "Which gate?", options: ["10", "11", "12", "14"], answer: "12" },
        { title: "Message", transcript: "Hi, I'm running late. Save me a seat near the window.", question: "Where does she want to sit?", options: ["Near the door", "Near the window", "At the back", "At the front"], answer: "Near the window" },
        { title: "Tour", transcript: "The guided tour of the castle begins at eleven fifteen.", question: "When does the tour start?", options: ["10:15", "11:00", "11:15", "11:45"], answer: "11:15" },
        { title: "Shop", transcript: "We're closed for lunch from one until two thirty.", question: "When do they reopen?", options: ["1:00", "2:00", "2:30", "3:00"], answer: "2:30" },
      ],
      mock: [
        { title: "Interview", transcript: "I've wanted to be a vet since I was eight years old.", question: "What job does she want?", options: ["A doctor", "A vet", "A teacher", "A pilot"], answer: "A vet" },
        { title: "Radio", transcript: "Tomorrow will be cloudy with showers in the afternoon.", question: "What is the weather tomorrow?", options: ["Sunny", "Cloudy with showers", "Snow", "Windy"], answer: "Cloudy with showers" },
        { title: "Course", transcript: "The photography course starts on the first Monday in April.", question: "When does the course start?", options: ["March", "First Monday in April", "May", "June"], answer: "First Monday in April" },
        { title: "Museum", transcript: "Photography is not allowed in the special exhibition.", question: "What can't you do?", options: ["Talk", "Eat", "Take photos", "Draw"], answer: "Take photos" },
        { title: "Match", transcript: "The match was cancelled because of heavy rain.", question: "Why was it cancelled?", options: ["Illness", "Heavy rain", "No players", "Lost ball"], answer: "Heavy rain" },
        { title: "Job", transcript: "She works three evenings a week at the bookshop.", question: "Where does she work?", options: ["A café", "A bookshop", "A school", "A hospital"], answer: "A bookshop" },
      ],
    },
    speaking: [
      { title: "Flyers Speaking - Hobbies", prompt: "Talk about your hobbies. How often do you do them? Why do you enjoy them?", preparationTime: 15, speakingTime: 90 },
      { title: "Flyers Speaking Mock", prompt: "Describe a memorable trip. Where did you go? What happened? Would you go again?", preparationTime: 20, speakingTime: 120 },
    ],
  },

  KET: {
    reading: {
      practice: [
        [
          mcq("Lily's age", "How old is Lily?", ["Ten", "Eleven", "Twelve", "Thirteen"], "Twelve", passages.ket1),
          mcq("Lily's city", "Where does Lily live?", ["Ho Chi Minh City", "Da Nang", "Hanoi", "Hue"], "Hanoi", passages.ket1),
          mcq("Morning routine", "What time does Lily wake up?", ["Five", "Six", "Seven", "Eight"], "Six", passages.ket1),
          mcq("School friend", "Who does Lily walk to school with?", ["Max", "Anna", "Her mother", "Her teacher"], "Anna", passages.ket1),
          mcq("Favourite subjects", "Which subjects does Lily like?", ["Maths and Art", "English and Maths", "English and Art", "Art and Science"], "English and Art", passages.ket1),
          mcq("Saturday activity", "What does Lily do on Saturdays?", ["Football", "Badminton", "Swimming", "Reading at home"], "Badminton", passages.ket1),
        ],
        [
          mcq("Holiday destination", "Where did Ben go?", ["Nha Trang", "Da Nang", "Phu Quoc", "Hoi An"], "Da Nang", passages.ket2),
          mcq("Hotel location", "Where was the hotel?", ["In the mountains", "Near the beach", "In the city", "Near the airport"], "Near the beach", passages.ket2),
          mcq("Duration", "How long did they stay?", ["Three days", "Four days", "Five days", "Seven days"], "Five days", passages.ket2),
          mcq("Beach activities", "What did Ben do at the beach?", ["Fishing", "Swimming and sandcastles", "Sunbathing only", "Volleyball"], "Swimming and sandcastles", passages.ket2),
          mcq("Day trip", "Which place did they visit?", ["Marble Mountains", "Ba Na Hills", "Son Tra", "My Khe Beach"], "Marble Mountains", passages.ket2),
          mcq("Evening meal", "What did they eat?", ["Pizza", "Fresh seafood", "Fast food", "Noodles"], "Fresh seafood", passages.ket2),
        ],
      ],
      mock: [
        mcq("Science fair", "When was the science fair?", ["Monday", "Wednesday", "Friday", "Sunday"], "Friday"),
        mcq("Minh's topic", "What was Minh's project about?", ["Water", "Recycling bottles", "Trees", "Solar energy"], "Recycling bottles"),
        mcq("Demonstration", "What did Minh make?", ["Bird houses", "Flower pots", "Toy cars", "Paper bags"], "Flower pots"),
        mcq("Prize", "Who won first prize?", ["Anna", "Minh", "Lily", "Ben"], "Minh"),
        mcq("Teacher message", "What did the head teacher say?", ["Study harder", "Join clubs", "Protect environment", "Enter next year"], "Protect environment"),
        mcq("Library", "How long can you borrow books?", ["One week", "Two weeks", "Three weeks", "One month"], "Two weeks"),
        mcq("Canteen", "What is the special today?", ["Pasta", "Chicken rice", "Soup", "Salad"], "Chicken rice"),
        mcq("Club", "When is chess club?", ["Monday", "Tuesday", "Thursday", "Friday"], "Thursday"),
        mcq("Trip", "What must students bring?", ["Lunch and water", "Money only", "A phone", "Nothing"], "Lunch and water"),
        mcq("Exam", "What time does the exam start?", ["8:00", "8:30", "9:00", "9:30"], "9:00"),
      ],
    },
    writing: {
      practice: [
        {
          title: "KET Writing - Email to friend",
          taskPrompt: "Write an email to your English friend Sam about a party last weekend.\n\n• where it was\n• what you did\n• why you enjoyed it\n\nWrite 25-35 words.",
          wordLimit: 35,
          instructions: "Informal email, past tense.",
        },
        {
          title: "KET Writing - Note to teacher",
          taskPrompt: "Write a note to Mr Brown. You cannot come to class tomorrow because you are ill.\n\nWrite 25-35 words.",
          wordLimit: 35,
          instructions: "Polite note.",
        },
      ],
      mock: [
        {
          title: "KET Writing Mock - Story",
          taskPrompt: "Write the story shown in three pictures: boy finds wallet → police station → owner thanks him.\n\nWrite 35-45 words.",
          wordLimit: 45,
          instructions: "Mock writing A2 Key.",
        },
      ],
    },
    listening: {
      practice: [
        { title: "Train", transcript: "The train to London will depart from platform 3 at quarter past ten.", question: "What time does the train leave?", options: ["9:45", "10:00", "10:15", "10:30"], answer: "10:15" },
        { title: "Hotel", transcript: "Breakfast is served from seven until ten in the dining room.", question: "Where is breakfast?", options: ["The lobby", "The dining room", "Your room", "The bar"], answer: "The dining room" },
        { title: "Course", transcript: "The English course costs two hundred pounds for eight weeks.", question: "How long is the course?", options: ["Four weeks", "Six weeks", "Eight weeks", "Ten weeks"], answer: "Eight weeks" },
        { title: "Meeting", transcript: "Let's meet outside the cinema at half past six.", question: "Where will they meet?", options: ["The café", "The cinema", "The station", "The park"], answer: "The cinema" },
        { title: "Shop", transcript: "We're open every day except Sunday.", question: "When is the shop closed?", options: ["Monday", "Saturday", "Sunday", "Friday"], answer: "Sunday" },
      ],
      mock: [
        { title: "Flight", transcript: "Passengers for flight 342 to Paris should go to gate 18 immediately.", question: "Which gate?", options: ["16", "17", "18", "19"], answer: "18" },
        { title: "Doctor", transcript: "Your appointment has been changed to three forty-five on Wednesday.", question: "When is the appointment?", options: ["Tuesday 3:45", "Wednesday 3:45", "Wednesday 4:45", "Thursday 3:45"], answer: "Wednesday 3:45" },
        { title: "Museum", transcript: "The museum is free for students with ID on weekdays.", question: "Who gets free entry?", options: ["All children", "Students with ID", "Teachers", "Everyone"], answer: "Students with ID" },
        { title: "Weather", transcript: "The forecast says it will be windy tonight but sunny tomorrow.", question: "What will tomorrow be like?", options: ["Rainy", "Windy", "Sunny", "Cloudy"], answer: "Sunny" },
        { title: "Job", transcript: "She applied for the job as a receptionist at the dental clinic.", question: "What job did she apply for?", options: ["Nurse", "Receptionist", "Dentist", "Cleaner"], answer: "Receptionist" },
        { title: "Delivery", transcript: "Your package will arrive between two and four this afternoon.", question: "When will the package arrive?", options: ["Morning", "2-4 pm", "Evening", "Tomorrow"], answer: "2-4 pm" },
        { title: "Exam tips", transcript: "Remember to bring two pencils and your student card to the exam.", question: "How many pencils?", options: ["One", "Two", "Three", "None"], answer: "Two" },
        { title: "Tour", transcript: "The boat tour lasts ninety minutes and leaves every hour.", question: "How long is the tour?", options: ["60 minutes", "75 minutes", "90 minutes", "120 minutes"], answer: "90 minutes" },
      ],
    },
    speaking: [
      { title: "KET Speaking - Daily routine", prompt: "Tell me about your daily routine and what you do after school.", preparationTime: 15, speakingTime: 60 },
      { title: "KET Speaking Mock", prompt: "Talk about a film or book you enjoyed. What was it about? Why did you like it?", preparationTime: 15, speakingTime: 90 },
    ],
    uoe: {
      practice: [
        { title: "UOE 1", passage: "My brother is very ___ (1) at maths.", question: "good / well / better / best", answer: "good" },
        { title: "UOE 2", passage: "We ___ (2) to the cinema last night.", question: "go / went / gone / going", answer: "went" },
        { title: "UOE 3", passage: "If it ___ (3) tomorrow, we will stay home.", question: "rain / rains / rained / raining", answer: "rains" },
        { title: "UOE 4", passage: "She is ___ (4) than her sister.", question: "tall / taller / tallest / more tall", answer: "taller" },
        { title: "UOE 5", passage: "I have ___ (5) finished my homework.", question: "yet / already / still / ever", answer: "already" },
      ],
      mock: [
        { title: "UOE M1", passage: "There isn't ___ (1) milk left.", question: "some / any / many / much", answer: "much" },
        { title: "UOE M2", passage: "He ___ (2) play tennis every Saturday.", question: "use / used / uses / using", answer: "used" },
        { title: "UOE M3", passage: "This is the ___ (3) book I've ever read.", question: "good / better / best / well", answer: "best" },
        { title: "UOE M4", passage: "They ___ (4) be at home now — I saw them leave.", question: "mustn't / can't / shouldn't / needn't", answer: "can't" },
        { title: "UOE M5", passage: "We looked ___ (5) the word in the dictionary.", question: "at / up / for / after", answer: "up" },
        { title: "UOE M6", passage: "She asked me ___ (6) I could help her.", question: "what / if / when / which", answer: "if" },
        { title: "UOE M7", passage: "I'm looking forward ___ (7) seeing you.", question: "at / to / for / about", answer: "to" },
        { title: "UOE M8", passage: "You ___ (8) wear a uniform at this school.", question: "must / mustn't / don't have / haven't", answer: "must" },
      ],
    },
  },

  PET: {
    reading: {
      practice: [
        [
          mcq("Remote work", "What changed since 2020?", ["Office sizes", "Remote working", "School hours", "Travel costs"], "Remote working", passages.pet1),
          mcq("Remote work", "What do employees enjoy?", ["Long meetings", "Flexible hours", "More commuting", "Fixed desks"], "Flexible hours", passages.pet1),
          mcq("Remote work", "What do some managers worry about?", ["Cost", "Teamwork", "Technology", "Training"], "Teamwork", passages.pet1),
          mcq("Remote work", "What are companies trying?", ["Fully remote", "Hybrid models", "No offices", "Shorter weeks"], "Hybrid models", passages.pet1),
          mcq("Office", "Why do some staff return to office?", ["Free food", "Social contact", "Better pay", "Shorter hours"], "Social contact"),
          mcq("Skills", "Which skill is mentioned as important?", ["Cooking", "Communication", "Driving", "Drawing"], "Communication"),
        ],
        [
          mcq("Festival", "Where is the music festival held?", ["In a stadium", "In a park", "On a beach", "In a hall"], "In a park"),
          mcq("Tickets", "How much is a student ticket?", ["£15", "£20", "£25", "£30"], "£20"),
          mcq("Workshop", "What can visitors learn?", ["Painting", "Photography", "Dancing", "Cooking"], "Photography"),
          mcq("Food", "What type of food is available?", ["Only fast food", "International food", "Vegetarian only", "No food"], "International food"),
          mcq("Parking", "Where should drivers park?", ["On the street", "At the north gate", "In the centre", "At the hotel"], "At the north gate"),
          mcq("Weather", "What happens if it rains?", ["Event cancelled", "Indoor areas used", "Refund given", "Starts later"], "Indoor areas used"),
        ],
      ],
      mock: [
        mcq("Research", "What did the study examine?", ["Sleep patterns", "Screen time", "Exercise", "Diet"], "Screen time"),
        mcq("Results", "How many teenagers took part?", ["500", "800", "1200", "2000"], "1200"),
        mcq("Finding", "What was the main conclusion?", ["Screens are harmless", "Too much screen time affects sleep", "Teens don't sleep", "Schools should ban phones"], "Too much screen time affects sleep"),
        mcq("Expert", "What does Dr Wells recommend?", ["No phones", "Limits before bedtime", "More homework", "Later school start"], "Limits before bedtime"),
        mcq("Parents", "What should parents do?", ["Buy more devices", "Set an example", "Ignore the issue", "Home-school"], "Set an example"),
        mcq("Schools", "What are some schools introducing?", ["Longer breaks", "Phone-free zones", "More tests", "Online only lessons"], "Phone-free zones"),
        mcq("Future", "What will researchers study next?", ["Adults only", "Younger children", "Teachers", "Doctors"], "Younger children"),
        mcq("Opinion", "What does the writer think overall?", ["Screens are always bad", "Balance is important", "Ban all games", "Ignore research"], "Balance is important"),
        mcq("Advice", "What is one practical tip?", ["Use phones in bed", "Charge outside bedroom", "Play all night", "Skip breakfast"], "Charge outside bedroom"),
        mcq("Title", "Best title for the article?", ["Why teens love games", "Screens and sleep", "Schools of the future", "How to use social media"], "Screens and sleep"),
      ],
    },
    writing: {
      practice: [
        {
          title: "PET Writing - Email",
          taskPrompt: "Your friend Alex wants to visit your city. Write an email suggesting places, food, and offering to show Alex around.\n\nWrite about 100 words.",
          wordLimit: 100,
          instructions: "B1 informal email.",
        },
        {
          title: "PET Writing - Article",
          taskPrompt: "Your teacher wants you to write about a hobby you enjoy.\n\nWrite about 100 words.",
          wordLimit: 100,
          instructions: "Include why you started and what you learn.",
        },
      ],
      mock: [
        {
          title: "PET Writing Mock",
          taskPrompt: "You see this announcement in your school magazine:\n\n'Write about a person who has influenced you.'\n\nWrite your article in about 100 words.",
          wordLimit: 100,
          instructions: "Mock writing B1 Preliminary.",
        },
      ],
    },
    listening: {
      practice: [
        { title: "Interview", transcript: "I've been learning the guitar for about three years now.", question: "How long has she played guitar?", options: ["One year", "Two years", "Three years", "Five years"], answer: "Three years" },
        { title: "Directions", transcript: "Go past the bank and take the second turning on the right.", question: "Where do you turn?", options: ["First right", "Second right", "First left", "Second left"], answer: "Second right" },
        { title: "Offer", transcript: "If you buy two shirts, you get the third one half price.", question: "What is the offer?", options: ["Buy one get one", "Third shirt half price", "All shirts free", "10% off"], answer: "Third shirt half price" },
        { title: "Message", transcript: "The meeting has been moved to Conference Room B on the third floor.", question: "Where is the meeting?", options: ["Room A", "Room B floor 3", "Room B floor 2", "Online"], answer: "Room B floor 3" },
        { title: "Plans", transcript: "We're thinking of camping in the Lake District in August.", question: "Where will they camp?", options: ["Scotland", "Lake District", "Wales", "Cornwall"], answer: "Lake District" },
      ],
      mock: [
        { title: "Course", transcript: "The advanced photography workshop runs from the 10th to the 14th of May.", question: "When does it run?", options: ["April", "10-14 May", "June", "All year"], answer: "10-14 May" },
        { title: "Job", transcript: "Applicants must be able to speak French and have a driving licence.", question: "What language is required?", options: ["Spanish", "French", "German", "Italian"], answer: "French" },
        { title: "Event", transcript: "Doors open at seven thirty but the performance starts at eight.", question: "When does the performance start?", options: ["7:00", "7:30", "8:00", "8:30"], answer: "8:00" },
        { title: "Advice", transcript: "You'd better take the earlier train if you want a seat.", question: "What should you do?", options: ["Take later train", "Take earlier train", "Walk", "Drive"], answer: "Take earlier train" },
        { title: "Problem", transcript: "The printer isn't working so I'll email you the document instead.", question: "How will she send it?", options: ["By post", "By email", "By hand", "By fax"], answer: "By email" },
        { title: "Trip", transcript: "The coach will pick us up from the school at six in the morning.", question: "When does the coach leave?", options: ["6 am", "6 pm", "8 am", "8 pm"], answer: "6 am" },
        { title: "Weather", transcript: "They've cancelled the barbecue because storms are expected.", question: "Why cancelled?", options: ["No food", "Storms expected", "Too hot", "Guests busy"], answer: "Storms expected" },
        { title: "Booking", transcript: "I've reserved a table for four under the name Patterson.", question: "How many people?", options: ["Two", "Three", "Four", "Five"], answer: "Four" },
      ],
    },
    speaking: [
      { title: "PET Speaking - Preferences", prompt: "Compare studying at home and studying at school. Which do you prefer and why?", preparationTime: 15, speakingTime: 120 },
      { title: "PET Speaking Mock", prompt: "Describe a time you helped someone. What happened and how did you feel?", preparationTime: 15, speakingTime: 120 },
    ],
    uoe: {
      practice: [
        { title: "PET UOE 1", passage: "She insisted ___ (1) paying for the meal.", question: "in / on / at / for", answer: "on" },
        { title: "PET UOE 2", passage: "The film was ___ (2) boring that we left early.", question: "so / such / too / very", answer: "so" },
        { title: "PET UOE 3", passage: "I'd rather ___ (3) swimming than play football.", question: "go / going / to go / went", answer: "go" },
        { title: "PET UOE 4", passage: "He is used ___ (4) getting up early.", question: "to / for / at / with", answer: "to" },
        { title: "PET UOE 5", passage: "The letter ___ (5) by tomorrow.", question: "must send / must be sent / must sent / must sending", answer: "must be sent" },
      ],
      mock: [
        { title: "PET UOE M1", passage: "Hardly ___ (1) I arrived when it started raining.", question: "had / have / was / did", answer: "had" },
        { title: "PET UOE M2", passage: "She denied ___ (2) the money.", question: "steal / stealing / to steal / stolen", answer: "stealing" },
        { title: "PET UOE M3", passage: "___ (3) you mind opening the window?", question: "Could / Should / Would / Might", answer: "Would" },
        { title: "PET UOE M4", passage: "It's high time we ___ (4) a decision.", question: "make / made / making / have made", answer: "made" },
        { title: "PET UOE M5", passage: "He is the ___ (5) person I know.", question: "funny / funnier / funniest / most funny", answer: "funniest" },
        { title: "PET UOE M6", passage: "I wish I ___ (6) more free time.", question: "have / had / will have / having", answer: "had" },
        { title: "PET UOE M7", passage: "The project depends ___ (7) getting funding.", question: "in / on / at / for", answer: "on" },
        { title: "PET UOE M8", passage: "Not only ___ (8) she sing, but she also plays piano.", question: "does / do / did / is", answer: "does" },
      ],
    },
  },

  FCE: {
    reading: {
      practice: [
        [
          mcq("Green spaces", "What role do parks play?", ["Education", "Public health", "Transport", "Shopping"], "Public health", passages.fce1),
          mcq("Green spaces", "What do studies show?", ["Parks are expensive", "Parks reduce stress", "People avoid parks", "Parks cause noise"], "Parks reduce stress", passages.fce1),
          mcq("Critics", "What do critics mention?", ["Safety", "Maintenance costs", "Location", "Size"], "Maintenance costs", passages.fce1),
          mcq("Savings", "What might balance costs?", ["Tourism", "Healthcare savings", "Taxes", "Advertising"], "Healthcare savings", passages.fce1),
          mcq("Activity", "What do parks encourage?", ["Driving", "Physical activity", "Online gaming", "Late nights"], "Physical activity", passages.fce1),
          mcq("Writer view", "Overall the writer is ___", ["against parks", "supportive of parks", "neutral", "unclear"], "supportive of parks", passages.fce1),
        ],
        [
          mcq("Startup", "What does the company produce?", ["Software", "Solar panels", "Books", "Clothes"], "Solar panels"),
          mcq("Founder", "Where did the idea come from?", ["A university project", "Travel abroad", "A TV show", "A dream"], "A university project"),
          mcq("Challenge", "What was the main difficulty?", ["Staff", "Funding", "Marketing", "Location"], "Funding"),
          mcq("Growth", "How many employees now?", ["5", "12", "40", "100"], "40"),
          mcq("Future", "What are they planning?", ["Closing", "Expanding abroad", "Changing product", "Selling the firm"], "Expanding abroad", passages.fce1),
          mcq("Advice", "What tip does the founder give?", ["Avoid risks", "Learn from failure", "Copy others", "Work alone"], "Learn from failure"),
        ],
      ],
      mock: [
        mcq("Study aim", "What was the research about?", ["Ocean pollution", "Air quality in cities", "Forest fires", "Recycling"], "Air quality in cities"),
        mcq("Method", "How was data collected?", ["Interviews only", "Sensors and surveys", "Guessing", "Old reports"], "Sensors and surveys"),
        mcq("Finding 1", "What increased on busy roads?", ["Trees", "Pollution levels", "Tourism", "House prices"], "Pollution levels"),
        mcq("Finding 2", "Who was most affected?", ["Office workers", "Children near schools", "Tourists", "Farmers"], "Children near schools"),
        mcq("Policy", "What do experts suggest?", ["Ban all cars", "Low-emission zones", "Close schools", "Ignore data"], "Low-emission zones"),
        mcq("Opposition", "Who disagrees strongly?", ["Teachers", "Some shop owners", "Students", "Doctors"], "Some shop owners"),
        mcq("Reason", "Why do they disagree?", ["They hate clean air", "They fear fewer customers", "They love traffic", "They don't drive"], "They fear fewer customers"),
        mcq("Success", "Which city improved most?", ["City A", "City B", "City C", "City D"], "City B"),
        mcq("Next step", "What will happen next year?", ["Stop measuring", "Expand the programme", "Remove sensors", "Build more roads"], "Expand the programme"),
        mcq("Tone", "The writer's tone is mostly ___", ["humorous", "analytical", "angry", "confused"], "analytical"),
      ],
    },
    writing: {
      practice: [
        {
          title: "FCE Writing - Essay",
          taskPrompt: "Technology in education: advantages and disadvantages.\n\nWrite 140-190 words.",
          wordLimit: 190,
          instructions: "B2 essay structure.",
        },
        {
          title: "FCE Writing - Report",
          taskPrompt: "Your teacher asked you to write a report about facilities at your school.\n\nWrite 140-190 words.",
          wordLimit: 190,
          instructions: "Formal/neutral report.",
        },
      ],
      mock: [
        {
          title: "FCE Writing Mock",
          taskPrompt: "Your class has discussed whether zoos should exist.\n\nWrite an essay giving opinions and examples.\n\nWrite 140-190 words.",
          wordLimit: 190,
          instructions: "Mock writing B2 First.",
        },
      ],
    },
    listening: {
      practice: [
        { title: "Lecture", transcript: "The Renaissance began in Italy in the fourteenth century before spreading north.", question: "Where did the Renaissance begin?", options: ["France", "Italy", "England", "Germany"], answer: "Italy" },
        { title: "Booking", transcript: "I'm afraid the deluxe rooms are fully booked until the end of the month.", question: "Which rooms are unavailable?", options: ["Standard", "Deluxe", "All rooms", "Suites only"], answer: "Deluxe" },
        { title: "Debate", transcript: "While renewable energy is promising, storage remains a significant challenge.", question: "What is the challenge?", options: ["Cost only", "Storage", "Workers", "Weather"], answer: "Storage" },
        { title: "News", transcript: "The minister announced new funding for rural broadband infrastructure.", question: "What received funding?", options: ["Roads", "Broadband", "Schools", "Hospitals"], answer: "Broadband" },
        { title: "Advice", transcript: "I'd strongly advise against signing anything before reading the fine print.", question: "What should you read?", options: ["The title", "The fine print", "The cover", "Nothing"], answer: "The fine print" },
      ],
      mock: [
        { title: "Conference", transcript: "Registration opens at eight, with the keynote address at nine thirty.", question: "When is the keynote?", options: ["8:00", "9:00", "9:30", "10:00"], answer: "9:30" },
        { title: "Research", transcript: "Preliminary results suggest the treatment may delay symptoms by several months.", question: "What may the treatment do?", options: ["Cure completely", "Delay symptoms", "Cause pain", "Reduce cost"], answer: "Delay symptoms" },
        { title: "Travel", transcript: "Due to engineering works, services will be replaced by buses between Oxford and Didcot.", question: "What replaces trains?", options: ["Taxis", "Buses", "Nothing", "Planes"], answer: "Buses" },
        { title: "Museum", transcript: "The exhibition explores how migration shaped modern British cuisine.", question: "What is the exhibition about?", options: ["Art", "Migration and food", "Sports", "Music"], answer: "Migration and food" },
        { title: "Workplace", transcript: "Flexible working requests must be submitted at least six weeks in advance.", question: "How much notice is required?", options: ["Two weeks", "Four weeks", "Six weeks", "Eight weeks"], answer: "Six weeks" },
        { title: "Environment", transcript: "The council plans to plant five thousand trees over the next three years.", question: "How many trees?", options: ["500", "5000", "50000", "500000"], answer: "5000" },
        { title: "Health", transcript: "Patients are advised to avoid caffeine for twenty-four hours before the test.", question: "What should patients avoid?", options: ["Water", "Caffeine", "Food", "Exercise"], answer: "Caffeine" },
        { title: "Legal", transcript: "The defendant denied all charges and was granted bail until the trial.", question: "What was granted?", options: ["Prison", "Bail", "Fine", "Passport"], answer: "Bail" },
      ],
    },
    speaking: [
      { title: "FCE Speaking - Discussion", prompt: "How has social media changed the way people form friendships? Discuss advantages and risks.", preparationTime: 15, speakingTime: 120 },
      { title: "FCE Speaking Mock", prompt: "Talk about a skill you'd like to learn. Why is it important and how would you go about learning it?", preparationTime: 15, speakingTime: 120 },
    ],
    uoe: {
      practice: [
        { title: "FCE UOE 1", passage: "Had I known about the traffic, I ___ (1) earlier.", question: "leave / would leave / would have left / left", answer: "would have left" },
        { title: "FCE UOE 2", passage: "She is believed ___ (2) the country.", question: "leave / to leave / leaving / left", answer: "to leave" },
        { title: "FCE UOE 3", passage: "Hardly ___ (3) we sat down when the phone rang.", question: "had / have / were / did", answer: "had" },
        { title: "FCE UOE 4", passage: "The proposal was ___ (4) controversial that it was rejected.", question: "so / such / too / very", answer: "so" },
        { title: "FCE UOE 5", passage: "I'd sooner ___ (5) than apologize to him.", question: "die / died / dying / to die", answer: "die" },
      ],
      mock: [
        { title: "FCE UOE M1", passage: "Not until later ___ (1) realise the mistake.", question: "did I / I did / I had / had I", answer: "did I" },
        { title: "FCE UOE M2", passage: "The car needs ___ (2) before the trip.", question: "check / checking / to check / checked", answer: "checking" },
        { title: "FCE UOE M3", passage: "___ (3) no circumstances should you open that door.", question: "Under / In / On / At", answer: "Under" },
        { title: "FCE UOE M4", passage: "She spoke as if she ___ (4) everything.", question: "knows / knew / had known / knowing", answer: "knew" },
        { title: "FCE UOE M5", passage: "He was accused ___ (5) lying.", question: "for / of / about / with", answer: "of" },
        { title: "FCE UOE M6", passage: "Little ___ (6) they know what awaited them.", question: "did / do / had / were", answer: "did" },
        { title: "FCE UOE M7", passage: "It's time the government ___ (7) action.", question: "take / took / taking / taken", answer: "took" },
        { title: "FCE UOE M8", passage: "The report confirms ___ (8) emissions have fallen.", question: "what / that / if / which", answer: "that" },
      ],
    },
  },
};

export const ALL_LEVELS: ExamLevel[] = [
  ExamLevel.STARTERS,
  ExamLevel.MOVERS,
  ExamLevel.FLYERS,
  ExamLevel.KET,
  ExamLevel.PET,
  ExamLevel.FCE,
];
