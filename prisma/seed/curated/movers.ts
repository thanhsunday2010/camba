import { fromPassageSets, gap, listen, mcq, speak, write, type LevelBank } from "./types";

const reading = fromPassageSets([
  {
    title: "Zoo trip",
    passage:
      "Last Saturday Sara went to the zoo with her dad. They saw lions, monkeys and funny penguins. Sara liked the penguins best because they walked like little men. They ate ice cream before going home.",
    questions: [
      mcq("Zoo trip", "When did Sara go to the zoo?", ["Friday", "Saturday", "Sunday", "Monday"], "Saturday"),
      mcq("Zoo trip", "Who went with Sara?", ["Her mum", "Her dad", "Her teacher", "Her brother"], "Her dad"),
      mcq("Zoo trip", "Which animals did they see?", ["Dogs and cats", "Lions, monkeys and penguins", "Fish only", "Horses"], "Lions, monkeys and penguins"),
      mcq("Zoo trip", "Which animals did Sara like best?", ["Lions", "Monkeys", "Penguins", "Bears"], "Penguins"),
      mcq("Zoo trip", "What did they eat?", ["Pizza", "Ice cream", "Sandwiches", "Soup"], "Ice cream"),
    ],
  },
  {
    title: "Football club",
    passage:
      "Jack plays football every Wednesday after school. Practice starts at four thirty and finishes at six. His team won their last match three–one. Jack scored the first goal.",
    questions: [
      mcq("Football club", "When does Jack play football?", ["Monday", "Wednesday", "Friday", "Sunday"], "Wednesday"),
      mcq("Football club", "What time does practice start?", ["Three thirty", "Four thirty", "Five thirty", "Six thirty"], "Four thirty"),
      mcq("Football club", "What was the score in the last match?", ["Two–one", "Three–one", "Three–two", "One–nil"], "Three–one"),
      mcq("Football club", "Who scored the first goal?", ["Anna", "Jack", "The captain", "Nobody"], "Jack"),
      mcq("Football club", "When does practice finish?", ["Five", "Five thirty", "Six", "Six thirty"], "Six"),
    ],
  },
  {
    title: "Library card",
    passage:
      "Maria goes to the library twice a week after school. She can borrow up to four books for two weeks. Last month she read a story about a girl who travelled to the moon.",
    questions: [
      mcq("Library card", "How often does Maria go to the library?", ["Every day", "Twice a week", "Once a month", "Never"], "Twice a week"),
      mcq("Library card", "How many books can she borrow?", ["Two", "Three", "Four", "Six"], "Four"),
      mcq("Library card", "How long can she keep the books?", ["One week", "Two weeks", "Three weeks", "One month"], "Two weeks"),
      mcq("Library card", "What was the last story about?", ["A dog", "A girl who travelled to the moon", "A pirate", "A teacher"], "A girl who travelled to the moon"),
      mcq("Library card", "When does she usually go?", ["Before school", "After school", "At lunchtime only", "On Sundays"], "After school"),
    ],
  },
  {
    title: "Birthday present",
    passage:
      "Tom's birthday was on the second of May. His parents gave him a new computer game and his aunt sent a watch from London. Tom invited six friends to a small party at his house.",
    questions: [
      mcq("Birthday present", "When was Tom's birthday?", ["First of May", "Second of May", "Second of June", "Twelfth of May"], "Second of May"),
      mcq("Birthday present", "What did his parents give him?", ["A bike", "A computer game", "A book", "A phone"], "A computer game"),
      mcq("Birthday present", "Where did the watch come from?", ["Paris", "London", "New York", "Hanoi"], "London"),
      mcq("Birthday present", "How many friends came to the party?", ["Four", "Five", "Six", "Eight"], "Six"),
      mcq("Birthday present", "Where was the party?", ["At school", "At a café", "At his house", "At the park"], "At his house"),
    ],
  },
  {
    title: "School trip",
    passage:
      "Our class is going to the science museum next Thursday. We must bring a packed lunch and a bottle of water. The bus leaves at eight fifteen in the morning and returns at three o'clock.",
    questions: [
      mcq("School trip", "Where is the class going?", ["The zoo", "The science museum", "The beach", "The theatre"], "The science museum"),
      mcq("School trip", "When is the trip?", ["Tuesday", "Wednesday", "Thursday", "Friday"], "Thursday"),
      mcq("School trip", "What must students bring to drink?", ["Juice only", "A bottle of water", "Milk", "Nothing"], "A bottle of water"),
      mcq("School trip", "What time does the bus leave?", ["Seven fifteen", "Eight fifteen", "Nine fifteen", "Eight forty-five"], "Eight fifteen"),
      mcq("School trip", "What time do they return?", ["Two o'clock", "Three o'clock", "Four o'clock", "Five o'clock"], "Three o'clock"),
    ],
  },
  {
    title: "Cooking class",
    passage:
      "Every Friday Emma goes to a cooking class after school. Last week they made chocolate cookies. Emma took twelve cookies home for her family. Her little brother ate three before dinner.",
    questions: [
      mcq("Cooking class", "When does Emma go to cooking class?", ["Monday", "Wednesday", "Friday", "Saturday"], "Friday"),
      mcq("Cooking class", "What did they make last week?", ["Pizza", "Chocolate cookies", "Soup", "Salad"], "Chocolate cookies"),
      mcq("Cooking class", "How many cookies did Emma take home?", ["Six", "Ten", "Twelve", "Twenty"], "Twelve"),
      mcq("Cooking class", "Who ate three cookies?", ["Emma", "Her mum", "Her little brother", "Her teacher"], "Her little brother"),
      mcq("Cooking class", "When did he eat them?", ["Before dinner", "After dinner", "At school", "At breakfast"], "Before dinner"),
    ],
  },
  {
    title: "New neighbour",
    passage:
      "A new family moved into the house next to ours last month. They have two children, Mia and Noah. Mia is nine and Noah is six. They like playing basketball in the street after homework.",
    questions: [
      mcq("New neighbour", "When did the family move in?", ["Last week", "Last month", "Last year", "Yesterday"], "Last month"),
      mcq("New neighbour", "How many children do they have?", ["One", "Two", "Three", "Four"], "Two"),
      mcq("New neighbour", "How old is Mia?", ["Seven", "Eight", "Nine", "Ten"], "Nine"),
      mcq("New neighbour", "What sport do they like?", ["Football", "Basketball", "Tennis", "Swimming"], "Basketball"),
      mcq("New neighbour", "When do they play?", ["Before school", "After homework", "At midnight", "On the bus"], "After homework"),
    ],
  },
  {
    title: "Rainy picnic",
    passage:
      "We planned a picnic in the park on Sunday, but it rained all day. Instead, we stayed at home and played board games. Dad made popcorn and we watched a film about dolphins.",
    questions: [
      mcq("Rainy picnic", "What was the original plan?", ["Go shopping", "Have a picnic in the park", "Visit grandparents", "Go swimming"], "Have a picnic in the park"),
      mcq("Rainy picnic", "What was the weather like?", ["Sunny", "Windy", "Rainy", "Snowy"], "Rainy"),
      mcq("Rainy picnic", "What did they do at home?", ["Homework only", "Played board games", "Slept all day", "Cooked outside"], "Played board games"),
      mcq("Rainy picnic", "What did Dad make?", ["Soup", "Popcorn", "Sandwiches", "Pizza"], "Popcorn"),
      mcq("Rainy picnic", "What was the film about?", ["Space", "Dolphins", "Football", "Cooking"], "Dolphins"),
    ],
  },
  {
    title: "Lost jacket",
    passage:
      "Olivia left her blue jacket in the classroom after art club on Tuesday. She looked everywhere but couldn't find it. On Wednesday morning, her teacher returned it from the lost-property box.",
    questions: [
      mcq("Lost jacket", "What did Olivia lose?", ["A bag", "A blue jacket", "A phone", "A book"], "A blue jacket"),
      mcq("Lost jacket", "Where did she leave it?", ["The library", "The classroom", "The bus", "The café"], "The classroom"),
      mcq("Lost jacket", "When did she leave it?", ["Monday", "Tuesday", "Wednesday", "Friday"], "Tuesday"),
      mcq("Lost jacket", "Who returned the jacket?", ["Her mum", "Her friend", "Her teacher", "The bus driver"], "Her teacher"),
      mcq("Lost jacket", "Where was it found?", ["Under a desk", "In the lost-property box", "At home", "In the park"], "In the lost-property box"),
    ],
  },
  {
    title: "Summer camp",
    passage:
      "Next July, Daniel is going to a summer camp in the mountains for one week. He will sleep in a tent, go hiking and learn to kayak. His parents think it will help him make new friends.",
    questions: [
      mcq("Summer camp", "When is Daniel going to camp?", ["June", "July", "August", "September"], "July"),
      mcq("Summer camp", "Where is the camp?", ["At the beach", "In the mountains", "In the city", "At school"], "In the mountains"),
      mcq("Summer camp", "How long will he stay?", ["Three days", "One week", "Two weeks", "One month"], "One week"),
      mcq("Summer camp", "Where will he sleep?", ["In a hotel", "In a tent", "At home", "On the bus"], "In a tent"),
      mcq("Summer camp", "What new activity will he learn?", ["Skiing", "Kayaking", "Horse riding", "Cooking"], "Kayaking"),
    ],
  },
  {
    title: "Pet rabbit",
    passage:
      "Sara feeds the family rabbit every morning before school. His name is Snowball because he is white. He eats carrots and lettuce. On weekends Sara cleans his cage in the garden.",
    questions: [
      mcq("Pet rabbit", "When does Sara feed the rabbit?", ["Every evening", "Every morning before school", "Once a week", "Never"], "Every morning before school"),
      mcq("Pet rabbit", "Why is he called Snowball?", ["He is fast", "He is white", "He is small", "He is old"], "He is white"),
      mcq("Pet rabbit", "What does he eat?", ["Fish and rice", "Carrots and lettuce", "Bread only", "Chocolate"], "Carrots and lettuce"),
      mcq("Pet rabbit", "When does Sara clean the cage?", ["On weekdays", "On weekends", "Every hour", "Never"], "On weekends"),
      mcq("Pet rabbit", "Where does she clean it?", ["In the kitchen", "In the garden", "At school", "In the bathroom"], "In the garden"),
    ],
  },
]);

reading.push(
  mcq("School start", "What time does school start?", ["Eight", "Eight thirty", "Nine", "Nine thirty"], "Eight thirty", "Our school starts at eight thirty every morning."),
  mcq("Sandwich lunch", "What does Anna usually eat?", ["Pizza", "A cheese sandwich", "Soup", "Rice"], "A cheese sandwich", "Anna usually has a cheese sandwich for lunch."),
  mcq("Stamp collection", "What does Ben collect?", ["Coins", "Stamps", "Cards", "Books"], "Stamps", "Ben collects stamps from different countries."),
  mcq("Weather tomorrow", "What will the weather be like?", ["Rainy", "Cloudy", "Sunny", "Snowy"], "Sunny", "The weather forecast says it will be sunny tomorrow."),
  mcq("Bus time", "How long does the bus take?", ["Ten minutes", "Twenty minutes", "Half an hour", "An hour"], "Twenty minutes", "The bus to town takes about twenty minutes.")
);

const listening = [
  listen("Phone call", "Can you call me at half past four?", "When should you call?", ["4:00", "4:15", "4:30", "5:00"], "4:30"),
  listen("Directions", "Turn left at the supermarket, then go straight on.", "Where do you turn left?", ["At the bank", "At the supermarket", "At the school", "At the park"], "At the supermarket"),
  listen("Cinema meet", "We're meeting outside the cinema at six.", "Where are they meeting?", ["At home", "At the cinema", "At the café", "At school"], "At the cinema"),
  listen("Ticket price", "The ticket costs twelve pounds fifty.", "How much is the ticket?", ["£10.50", "£12.00", "£12.50", "£15.00"], "£12.50"),
  listen("Train time", "The train to Manchester leaves from platform 2 at twenty-five past nine.", "What time does the train leave?", ["9:15", "9:20", "9:25", "9:30"], "9:25"),
  listen("Science homework", "Don't forget to finish your science homework for Tuesday.", "When is the homework due?", ["Monday", "Tuesday", "Wednesday", "Friday"], "Tuesday"),
  listen("Umbrella", "It's going to rain this afternoon, so take an umbrella.", "What should you take?", ["A hat", "An umbrella", "Sunglasses", "Gloves"], "An umbrella"),
  listen("Swimming club", "Swimming club has moved to the new sports centre.", "Where is swimming club now?", ["The old pool", "The sports centre", "The lake", "The beach"], "The sports centre"),
  listen("Party invite", "Would you like to come to my party on Saturday?", "When is the party?", ["Friday", "Saturday", "Sunday", "Monday"], "Saturday"),
  listen("Lost jacket", "I think I left my jacket in the classroom.", "What did she lose?", ["A bag", "A jacket", "A phone", "A book"], "A jacket"),
  listen("Doctor appt", "Your dentist appointment is at ten fifteen on Wednesday.", "When is the appointment?", ["Tuesday 10:15", "Wednesday 10:15", "Wednesday 11:15", "Thursday 10:15"], "Wednesday 10:15"),
  listen("Shop hours", "The shop opens at nine and closes at five thirty.", "When does the shop close?", ["Five", "Five thirty", "Six", "Six thirty"], "Five thirty"),
  listen("Piano lesson", "Your piano lesson is moved to four o'clock today.", "What time is the lesson?", ["Three", "Four", "Five", "Six"], "Four"),
  listen("Football match", "The football match starts at half past two on Sunday.", "When does the match start?", ["Sunday 2:00", "Sunday 2:30", "Saturday 2:30", "Sunday 3:30"], "Sunday 2:30"),
  listen("Book fair", "The book fair is in the school hall all this week.", "Where is the book fair?", ["The library", "The school hall", "The playground", "The café"], "The school hall"),
  listen("Grandma visit", "Grandma is arriving on the five forty train.", "How is Grandma arriving?", ["By car", "By bus", "By train", "By plane"], "By train"),
  listen("Computer room", "Year 4 will use the computer room after break.", "Who will use the computer room?", ["Year 3", "Year 4", "Year 5", "Teachers only"], "Year 4"),
  listen("Cold drink", "Would you like orange juice or water?", "What drinks are offered?", ["Tea or coffee", "Orange juice or water", "Milk only", "Cola"], "Orange juice or water"),
  listen("Late bus", "Sorry I'm late — the bus broke down.", "Why was the person late?", ["They overslept", "The bus broke down", "They got lost", "It was raining"], "The bus broke down"),
  listen("New teacher", "Mr Cooper is our new maths teacher.", "What subject does Mr Cooper teach?", ["English", "Science", "Maths", "History"], "Maths"),
  listen("Picnic food", "Remember to bring sandwiches and fruit for the picnic.", "What food should they bring?", ["Pizza and chips", "Sandwiches and fruit", "Soup only", "Nothing"], "Sandwiches and fruit"),
  listen("Film time", "The film finishes at twenty past eight.", "When does the film finish?", ["8:00", "8:20", "8:40", "9:20"], "8:20"),
  listen("Dog walk", "Can you walk the dog before six o'clock?", "What must you do before six?", ["Cook dinner", "Walk the dog", "Do homework", "Phone a friend"], "Walk the dog"),
  listen("Holiday flight", "Our flight to Rome leaves at eleven twenty.", "Where are they flying to?", ["Paris", "Rome", "London", "Berlin"], "Rome"),
  listen("Art project", "The art project must be finished by Friday.", "When is the deadline?", ["Thursday", "Friday", "Monday", "Next week"], "Friday"),
];

const writing = [
  write("Last weekend", "Write about your last weekend.\n\n• Where did you go?\n• Who did you go with?\n• What did you do?\n\nWrite 30–40 words.", 40, "A1 Movers — past simple."),
  write("Email to friend", "Write an email to your friend about your new hobby.\n\nWrite 35–45 words.", 45, "Informal email."),
  write("School day", "Write about a typical day at school.\n\n• What time you start\n• Your favourite lesson\n• What you do at lunch\n\nWrite 35–45 words.", 45, "Present simple."),
  write("Favourite place", "Write about your favourite place in your town.\n\n• Where it is\n• What you can do there\n• Why you like it\n\nWrite 35–45 words.", 45, "A1 Movers writing."),
  write("Birthday party", "Write about a birthday party you went to.\n\n• Whose party it was\n• What you ate\n• What games you played\n\nWrite 35–45 words.", 45, "Past tense."),
  write("My best friend", "Write about your best friend.\n\n• Name and age\n• What you like doing together\n• Why they are special\n\nWrite 35–45 words.", 45, "Informal style."),
  write("Weather message", "Write a message to your teacher explaining you cannot come to school because of bad weather.\n\nWrite 30–40 words.", 40, "Short note."),
  write("Holiday plans", "Write about your plans for the next holiday.\n\n• Where you want to go\n• Who with\n• What you want to do\n\nWrite 35–45 words.", 45, "Future with 'going to'."),
  write("Animal story", "Write a short story about an animal adventure.\n\nWrite 40–50 words.", 50, "Simple narrative."),
  write("Sports club", "Write about a sport or club you belong to.\n\nWrite 35–45 words.", 45, "Present simple + past."),
];

const speaking = [
  speak("Your school", "Tell me about your school. What subjects do you like? What do you do at break time?", 15, 60),
  speak("Recent visit", "Describe a place you visited recently. Where was it? What did you see and do?", 15, 60),
  speak("Daily routine", "Describe your daily routine from morning until bedtime.", 15, 60),
  speak("Favourite food", "Talk about food you like and food you don't like. What do you eat at school?", 15, 60),
  speak("Free time", "What do you do in your free time? How often do you do it?", 15, 60),
  speak("Family", "Tell me about your family. Who do you live with? What do you do together?", 15, 60),
  speak("Last holiday", "Talk about your last holiday. Where did you go? What was the best part?", 15, 60),
  speak("Shopping", "Do you like shopping? What do you usually buy? Where do you go?", 15, 60),
  speak("Transport", "How do you travel to school? What other transport do you use?", 15, 60),
  speak("Future plans", "What do you want to do next year? Talk about school or hobbies.", 15, 60),
];

export const MOVERS_BANK: LevelBank = { reading, listening, writing, speaking, uoe: [] };
