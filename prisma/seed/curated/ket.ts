import { fromPassageSets, gap, listen, mcq, speak, write, type LevelBank } from "./types";

const reading = fromPassageSets([
  {
    title: "Lily's routine",
    passage:
      "My name is Lily. I am twelve and I live in Hanoi. Every morning I wake up at six and have breakfast with my family. I walk to school with my best friend Anna. My favourite subjects are English and Art. On Saturdays I play badminton at the sports centre.",
    questions: [
      mcq("Lily's routine", "How old is Lily?", ["Ten", "Eleven", "Twelve", "Thirteen"], "Twelve"),
      mcq("Lily's routine", "Where does Lily live?", ["Ho Chi Minh City", "Da Nang", "Hanoi", "Hue"], "Hanoi"),
      mcq("Lily's routine", "What time does Lily wake up?", ["Five", "Six", "Seven", "Eight"], "Six"),
      mcq("Lily's routine", "Who does Lily walk to school with?", ["Max", "Anna", "Her mother", "Her teacher"], "Anna"),
      mcq("Lily's routine", "Which subjects does Lily like?", ["Maths and Art", "English and Maths", "English and Art", "Art and Science"], "English and Art"),
      mcq("Lily's routine", "What does Lily do on Saturdays?", ["Football", "Badminton", "Swimming", "Reading at home"], "Badminton"),
    ],
  },
  {
    title: "Ben's holiday",
    passage:
      "Last summer Ben's family went to Da Nang for five days. They stayed in a hotel near the beach. Ben swam every day and built sandcastles with his sister. They visited Marble Mountains and ate fresh seafood in the evening.",
    questions: [
      mcq("Ben's holiday", "Where did Ben go?", ["Nha Trang", "Da Nang", "Phu Quoc", "Hoi An"], "Da Nang"),
      mcq("Ben's holiday", "Where was the hotel?", ["In the mountains", "Near the beach", "In the city centre", "Near the airport"], "Near the beach"),
      mcq("Ben's holiday", "How long did they stay?", ["Three days", "Four days", "Five days", "Seven days"], "Five days"),
      mcq("Ben's holiday", "What did Ben do at the beach?", ["Fishing only", "Swimming and sandcastles", "Sunbathing only", "Volleyball"], "Swimming and sandcastles"),
      mcq("Ben's holiday", "Which place did they visit?", ["Marble Mountains", "Ba Na Hills", "Son Tra", "My Khe only"], "Marble Mountains"),
      mcq("Ben's holiday", "What did they eat in the evening?", ["Pizza", "Fresh seafood", "Fast food", "Noodles only"], "Fresh seafood"),
    ],
  },
  {
    title: "Science fair",
    passage:
      "Our school science fair was on Friday in the hall. Minh's project was about recycling plastic bottles into flower pots. The head teacher said we should all try to protect the environment. Minh won first prize and got a certificate.",
    questions: [
      mcq("Science fair", "When was the science fair?", ["Monday", "Wednesday", "Friday", "Sunday"], "Friday"),
      mcq("Science fair", "Where was it held?", ["The playground", "The hall", "The library", "Room 4"], "The hall"),
      mcq("Science fair", "What was Minh's project about?", ["Water", "Recycling bottles into flower pots", "Trees", "Solar energy"], "Recycling bottles into flower pots"),
      mcq("Science fair", "Who won first prize?", ["Anna", "Minh", "Lily", "Ben"], "Minh"),
      mcq("Science fair", "What did the head teacher talk about?", ["Exam results", "Protecting the environment", "School uniform", "Holiday dates"], "Protecting the environment"),
      mcq("Science fair", "What did Minh receive?", ["Money", "A certificate", "A bike", "A book only"], "A certificate"),
    ],
  },
  {
    title: "Library notice",
    passage:
      "Students can borrow up to three books from the library for two weeks. You need your student card. Late returns cost fifty pence per book per week. The library is open from eight thirty to four thirty on school days.",
    questions: [
      mcq("Library notice", "How many books can you borrow?", ["One", "Two", "Three", "Five"], "Three"),
      mcq("Library notice", "How long can you keep books?", ["One week", "Two weeks", "Three weeks", "One month"], "Two weeks"),
      mcq("Library notice", "What do you need?", ["Money", "A student card", "A letter from parents", "Nothing"], "A student card"),
      mcq("Library notice", "How much is the late fee per book per week?", ["Twenty pence", "Fifty pence", "One pound", "Free"], "Fifty pence"),
      mcq("Library notice", "When does the library close on school days?", ["Three thirty", "Four", "Four thirty", "Five"], "Four thirty"),
    ],
  },
  {
    title: "Cooking club email",
    passage:
      "Hi everyone, Cooking Club starts again next Tuesday at three forty-five in Room 8. This term we will make dishes from Asia. Please bring an apron. If you can't come, tell Mr Brown by Monday. See you there! — Ms Tran",
    questions: [
      mcq("Cooking club", "When does the club start?", ["Monday", "Tuesday", "Wednesday", "Thursday"], "Tuesday"),
      mcq("Cooking club", "What time does it start?", ["Three fifteen", "Three forty-five", "Four fifteen", "Four forty-five"], "Three forty-five"),
      mcq("Cooking club", "Where is the club?", ["Room 4", "Room 8", "The hall", "The canteen"], "Room 8"),
      mcq("Cooking club", "What should students bring?", ["Money", "An apron", "A laptop", "Sports shoes"], "An apron"),
      mcq("Cooking club", "Who should you contact if you can't come?", ["Ms Tran", "Mr Brown", "The head teacher", "Anna"], "Mr Brown"),
    ],
  },
  {
    title: "Bus timetable",
    passage:
      "The number 14 bus from Oak Street to City Centre runs every twenty minutes from seven in the morning until nine at night. A single ticket costs one pound eighty. Children under eleven travel half price.",
    questions: [
      mcq("Bus timetable", "Which bus is it?", ["Number 4", "Number 14", "Number 40", "Number 41"], "Number 14"),
      mcq("Bus timetable", "How often does it run?", ["Every ten minutes", "Every twenty minutes", "Every hour", "Twice a day"], "Every twenty minutes"),
      mcq("Bus timetable", "When does the last bus leave?", ["Eight", "Nine", "Ten", "Midnight"], "Nine"),
      mcq("Bus timetable", "How much is a single ticket?", ["One pound fifty", "One pound eighty", "Two pounds", "Two fifty"], "One pound eighty"),
      mcq("Bus timetable", "Who travels half price?", ["Students only", "Children under eleven", "Everyone on Sundays", "Teachers"], "Children under eleven"),
    ],
  },
  {
    title: "Sports day",
    passage:
      "Sports Day is on the last Friday of May. Students should wear their house T-shirt and trainers. Parents can watch from ten until two. Lunch will be provided, but bring a water bottle. The rain date is the following Monday.",
    questions: [
      mcq("Sports day", "When is Sports Day?", ["First Friday of May", "Last Friday of May", "Last Monday of May", "Every Friday"], "Last Friday of May"),
      mcq("Sports day", "What should students wear on their feet?", ["Sandals", "Trainers", "Boots", "Nothing special"], "Trainers"),
      mcq("Sports day", "When can parents watch?", ["Nine until one", "Ten until two", "All day", "Afternoon only"], "Ten until two"),
      mcq("Sports day", "What must students bring?", ["Lunch", "A water bottle", "Money", "A book"], "A water bottle"),
      mcq("Sports day", "When is the rain date?", ["The same day", "The following Monday", "Next month", "There isn't one"], "The following Monday"),
    ],
  },
  {
    title: "Pen pal letter",
    passage:
      "Dear Sam, Thanks for your email. Last weekend I went to a music festival with my cousins. We camped in a field and listened to bands until midnight. The weather was cold but sunny. I hope you can visit Vietnam one day. Best wishes, Minh",
    questions: [
      mcq("Pen pal letter", "Who did Minh go with?", ["His parents", "His cousins", "His teacher", "Alone"], "His cousins"),
      mcq("Pen pal letter", "Where did they sleep?", ["In a hotel", "In a field", "At home", "On the bus"], "In a field"),
      mcq("Pen pal letter", "How long did they listen to music?", ["Until ten", "Until midnight", "One hour", "All afternoon only"], "Until midnight"),
      mcq("Pen pal letter", "What was the weather like?", ["Rainy", "Cold but sunny", "Very hot", "Snowy"], "Cold but sunny"),
      mcq("Pen pal letter", "What does Minh hope?", ["Sam moves house", "Sam visits Vietnam", "Sam learns guitar", "Sam stops writing"], "Sam visits Vietnam"),
    ],
  },
  {
    title: "Mobile phone rules",
    passage:
      "At our school, students must turn off mobile phones during lessons. You can use them at break and lunch in the playground only. If a teacher sees a phone in class, it will be kept in the office until four o'clock. Parents should collect phones after school if students forget.",
    questions: [
      mcq("Phone rules", "When must phones be off?", ["All day", "During lessons", "At lunch only", "Never"], "During lessons"),
      mcq("Phone rules", "Where can you use phones at break?", ["In class", "In the playground only", "Anywhere", "In the library"], "In the playground only"),
      mcq("Phone rules", "What happens if a teacher sees a phone in class?", ["Nothing", "It is kept in the office", "You get a fine", "Parents are called immediately"], "It is kept in the office"),
      mcq("Phone rules", "When can you collect it?", ["At break", "At lunch", "At four o'clock", "Next day"], "At four o'clock"),
      mcq("Phone rules", "Who can collect forgotten phones after school?", ["Teachers only", "Parents", "Friends", "Nobody"], "Parents"),
    ],
  },
  {
    title: "Town centre notices",
    passage:
      "Notice board in the town centre: (1) Riverside Café — OPEN 7:30–6:00 Monday to Saturday. CLOSED SUNDAY. (2) Sports Centre — SWIMMING POOL CLOSED FOR CLEANING UNTIL 15 MARCH. (3) Fashion Shop — SALE: ALL T-SHIRTS £5 THIS WEEK ONLY. (4) Community Hall — Join the school choir! Practice Wednesdays 3:45 in the music room. (5) Weather update — Tuesday: heavy rain expected. Take an umbrella.",
    questions: [
      mcq("Town centre notices", "When is the café closed?", ["Monday", "Saturday", "Sunday", "Every day"], "Sunday"),
      mcq("Town centre notices", "Why is the pool closed?", ["No staff", "Cleaning", "Bad weather", "Holiday"], "Cleaning"),
      mcq("Town centre notices", "What is on sale in the shop?", ["Shoes", "T-shirts", "Coats", "Hats"], "T-shirts"),
      mcq("Town centre notices", "When is choir practice?", ["Tuesday", "Wednesday", "Thursday", "Friday"], "Wednesday"),
      mcq("Town centre notices", "What should you take on Tuesday?", ["Sunglasses", "An umbrella", "Shorts", "A fan"], "An umbrella"),
    ],
  },
  {
    title: "Messages and reminders",
    passage:
      "Anna's email: Hi! Can you help me with maths homework tonight at my house? — Anna. Dad's text: Train delayed 20 mins. Meet at café not platform. Leo's invitation: You're invited to my party on Saturday at 2 pm. RSVP by Thursday. Museum ticket desk: Student ticket £4.50. Audio guide £2 extra. Class notice: History test moved from Monday to Wednesday.",
    questions: [
      mcq("Messages and reminders", "What does Anna want?", ["To go shopping", "Help with homework", "To play football", "A lift to school"], "Help with homework"),
      mcq("Messages and reminders", "Where should they meet?", ["Platform", "Café", "Home", "Station car park"], "Café"),
      mcq("Messages and reminders", "When is the party?", ["Thursday", "Friday", "Saturday", "Sunday"], "Saturday"),
      mcq("Messages and reminders", "How much is a student museum ticket?", ["£2", "£4.50", "£6.50", "Free"], "£4.50"),
      mcq("Messages and reminders", "When is the history test now?", ["Monday", "Tuesday", "Wednesday", "Friday"], "Wednesday"),
    ],
  },
  {
    title: "School trip to the museum",
    passage:
      "Dear parents, On Thursday 12 May, Class 7B will visit the City History Museum. We will leave school at nine o'clock by coach and return at three thirty. Students should wear school uniform and bring a packed lunch and a water bottle. The museum does not allow large bags. Permission slips must be returned by Friday 6 May. If your child cannot come, please write a note to Mr Cole. There is no cost, but we suggest a two-pound donation for the coach. We will see exhibitions about local industry and take part in a short workshop on old maps.",
    questions: [
      mcq("School trip", "When is the trip?", ["Thursday 12 May", "Friday 6 May", "Wednesday 11 May", "Saturday 14 May"], "Thursday 12 May"),
      mcq("School trip", "What time does the coach leave?", ["Eight", "Nine", "Ten", "Three thirty"], "Nine"),
      mcq("School trip", "What should students bring to eat?", ["Money for the café", "A packed lunch", "Nothing", "School dinner only"], "A packed lunch"),
      mcq("School trip", "When must permission slips be returned?", ["Thursday 12 May", "Friday 6 May", "Monday 9 May", "On the trip day"], "Friday 6 May"),
      mcq("School trip", "What will students do at the museum?", ["Play sports", "See exhibitions and join a workshop", "Watch a film only", "Shop for souvenirs only"], "See exhibitions and join a workshop"),
      mcq("School trip", "What is suggested for the coach?", ["A ten-pound fee", "A two-pound donation", "Nothing", "A ticket from the museum"], "A two-pound donation"),
    ],
  },
  {
    title: "Weekend farmers' market",
    passage:
      "Every Saturday morning, Green Street Farmers' Market opens from eight until one. Local farmers sell fresh vegetables, fruit, bread and cheese. Last week I bought tomatoes, apples and a loaf of brown bread for eight pounds. My mum likes the honey stall because the bees live in fields near our town. There is also a small café where you can sit and drink hot chocolate. Dogs are welcome but must stay on a lead. In winter the market moves inside the old bus station, but in spring and summer it is in the square next to the library. Parking is free for the first hour in the car park on Hill Road.",
    questions: [
      mcq("Farmers' market", "When does the market open?", ["Friday evening", "Saturday morning", "Sunday afternoon", "Every day"], "Saturday morning"),
      mcq("Farmers' market", "How long is it open on Saturday?", ["Until noon", "Until one o'clock", "Until three", "All day"], "Until one o'clock"),
      mcq("Farmers' market", "What did the writer buy last week?", ["Meat and fish", "Tomatoes, apples and bread", "Only honey", "Cheese and eggs"], "Tomatoes, apples and bread"),
      mcq("Farmers' market", "Why does the writer's mum like one stall?", ["It sells cheap toys", "The honey comes from nearby fields", "It is open late", "It has live music"], "The honey comes from nearby fields"),
      mcq("Farmers' market", "Where is the market in summer?", ["Inside the bus station", "In the square next to the library", "At the sports centre", "On Hill Road"], "In the square next to the library"),
      mcq("Farmers' market", "What is the rule for dogs?", ["They are not allowed", "They must stay on a lead", "They can run free", "Only small dogs"], "They must stay on a lead"),
    ],
  },
  {
    title: "New student at Riverside School",
    passage:
      "My name is Diego and I am from Madrid. I started at Riverside School in September when my dad's job moved to London. At first I was nervous because my English was not very good, but my classmates were friendly. I joined the basketball club on Tuesdays and Thursdays and I made two close friends, Omar and Priya. My favourite teacher is Ms Hughes, who teaches science. She explains experiments clearly and lets us work in groups. I still miss my grandparents in Spain, but we video-call every Sunday. Next month my family will visit Madrid for the Easter holidays. I am happy here now and my English is much better.",
    questions: [
      mcq("New student", "Where is Diego from?", ["London", "Madrid", "Paris", "Rome"], "Madrid"),
      mcq("New student", "When did Diego start at Riverside School?", ["January", "September", "Last Easter", "Next month"], "September"),
      mcq("New student", "Why did Diego's family move?", ["For a holiday", "Because of his dad's job", "To visit grandparents", "For university"], "Because of his dad's job"),
      mcq("New student", "When does Diego play basketball?", ["Mondays and Wednesdays", "Tuesdays and Thursdays", "Fridays only", "Every day"], "Tuesdays and Thursdays"),
      mcq("New student", "Who is Diego's favourite teacher?", ["Mr Cole", "Ms Hughes", "Omar", "Priya"], "Ms Hughes"),
      mcq("New student", "When does Diego's family video-call his grandparents?", ["Every Saturday", "Every Sunday", "Once a month", "Never"], "Every Sunday"),
    ],
  },
  {
    title: "Community garden project",
    passage:
      "Last year, neighbours on Oak Avenue turned an empty plot of land into a community garden. Volunteers meet on the first Saturday of each month to plant flowers and vegetables. Children from the primary school help water the plants on Wednesdays after class. In August we picked tomatoes, carrots and herbs and shared them with older people who live alone. The local council gave us tools and built a small shed for equipment. We also installed benches so people can sit and read. New members are always welcome — you do not need experience, only enthusiasm and comfortable shoes.",
    questions: [
      mcq("Community garden", "What was the land used for before?", ["A car park", "It was empty", "A shop", "A playground"], "It was empty"),
      mcq("Community garden", "When do volunteers usually meet?", ["Every day", "First Saturday of each month", "Only in August", "On Wednesdays only"], "First Saturday of each month"),
      mcq("Community garden", "Who helps water plants on Wednesdays?", ["Older people", "Children from the primary school", "Council workers", "Tourists"], "Children from the primary school"),
      mcq("Community garden", "What did they do with the vegetables in August?", ["Sold them in a shop", "Shared them with older people", "Threw them away", "Sent them abroad"], "Shared them with older people"),
      mcq("Community garden", "What did the council provide?", ["Free lunch", "Tools and a shed", "A swimming pool", "New houses"], "Tools and a shed"),
      mcq("Community garden", "What do new members need?", ["Experience only", "Enthusiasm and comfortable shoes", "A large garden at home", "A certificate"], "Enthusiasm and comfortable shoes"),
    ],
  },
  {
    title: "Camp rules leaflet",
    passage:
      "Welcome to Pine Lake Summer Camp! Campers sleep in wooden cabins with eight beds each. Wake-up is at seven and breakfast is in the dining hall from seven thirty to eight fifteen. Mobile phones may be used only between six and seven in the evening. Swimming in the lake is allowed only when a lifeguard is present — check the board near the jetty. Please label all clothes with your name. Lost property is kept at reception for two weeks. Fires and barbecues are not permitted anywhere on the site. If you feel unwell, tell your group leader immediately.",
    questions: [
      mcq("Camp rules", "How many beds are there in each cabin?", ["Four", "Six", "Eight", "Ten"], "Eight"),
      mcq("Camp rules", "When is breakfast served?", ["Six to seven", "Seven thirty to eight fifteen", "Nine to ten", "Only at weekends"], "Seven thirty to eight fifteen"),
      mcq("Camp rules", "When can campers use mobile phones?", ["All day", "Only between six and seven in the evening", "Never", "Only at night"], "Only between six and seven in the evening"),
      mcq("Camp rules", "When can you swim in the lake?", ["Any time", "Only when a lifeguard is present", "Only in the morning", "Never"], "Only when a lifeguard is present"),
      mcq("Camp rules", "How long is lost property kept?", ["One day", "One week", "Two weeks", "One month"], "Two weeks"),
      mcq("Camp rules", "What should you do if you feel ill?", ["Go swimming", "Tell your group leader", "Leave camp alone", "Use your phone"], "Tell your group leader"),
    ],
  },
  {
    title: "Local library events",
    passage:
      "Central Library events this month: Story Time for children aged five to seven every Tuesday at four — parents must stay. Teen Reading Group meets on the first Friday at five thirty to discuss books in English and Vietnamese. On Saturday 18th, author Linh Tran will talk about her new novel for young adults; tickets are free but booking is required online. The computer room offers free internet for two hours per day with a library card. Printing costs ten pence per page. The library is closed on public holidays. Membership is free for all residents.",
    questions: [
      mcq("Library events", "Who is Story Time for?", ["Children aged five to seven", "Teenagers only", "Adults only", "Toddlers under three"], "Children aged five to seven"),
      mcq("Library events", "When does the Teen Reading Group meet?", ["Every Tuesday", "First Friday at five thirty", "Saturday 18th", "Every morning"], "First Friday at five thirty"),
      mcq("Library events", "What happens on Saturday 18th?", ["A sports competition", "An author talk", "A cooking class", "Library closure"], "An author talk"),
      mcq("Library events", "How long can you use the internet free each day?", ["Thirty minutes", "One hour", "Two hours", "All day"], "Two hours"),
      mcq("Library events", "How much does printing cost?", ["Free", "Five pence per page", "Ten pence per page", "One pound per page"], "Ten pence per page"),
      mcq("Library events", "Who can join the library for free?", ["Students only", "All residents", "Teachers only", "People over eighteen"], "All residents"),
    ],
  },
]);

const listening = [
  listen("London train", "The train to London will depart from platform 3 at quarter past ten.", "What time does the train leave?", ["9:45", "10:00", "10:15", "10:30"], "10:15"),
  listen("Hotel breakfast", "Breakfast is served from seven until ten in the dining room.", "Where is breakfast?", ["The lobby", "The dining room", "Your room", "The bar"], "The dining room"),
  listen("English course", "The English course costs two hundred pounds for eight weeks.", "How long is the course?", ["Four weeks", "Six weeks", "Eight weeks", "Ten weeks"], "Eight weeks"),
  listen("Cinema meet", "Let's meet outside the cinema at half past six.", "Where will they meet?", ["The café", "The cinema", "The station", "The park"], "The cinema"),
  listen("Shop hours", "We're open every day except Sunday.", "When is the shop closed?", ["Monday", "Saturday", "Sunday", "Friday"], "Sunday"),
  listen("Paris flight", "Passengers for flight 342 to Paris should go to gate 18 immediately.", "Which gate?", ["16", "17", "18", "19"], "18"),
  listen("Doctor change", "Your appointment has been changed to three forty-five on Wednesday.", "When is the appointment?", ["Tuesday 3:45", "Wednesday 3:45", "Wednesday 4:45", "Thursday 3:45"], "Wednesday 3:45"),
  listen("Museum free", "The museum is free for students with ID on weekdays.", "Who gets free entry?", ["All children", "Students with ID", "Teachers", "Everyone"], "Students with ID"),
  listen("Weather forecast", "The forecast says it will be windy tonight but sunny tomorrow.", "What will tomorrow be like?", ["Rainy", "Windy", "Sunny", "Cloudy"], "Sunny"),
  listen("Job application", "She applied for the job as a receptionist at the dental clinic.", "What job did she apply for?", ["Nurse", "Receptionist", "Dentist", "Cleaner"], "Receptionist"),
  listen("Package delivery", "Your package will arrive between two and four this afternoon.", "When will the package arrive?", ["Morning", "2–4 pm", "Evening", "Tomorrow"], "2–4 pm"),
  listen("Exam reminder", "Remember to bring two pencils and your student card to the exam.", "How many pencils?", ["One", "Two", "Three", "None"], "Two"),
  listen("Boat tour", "The boat tour lasts ninety minutes and leaves every hour.", "How long is the tour?", ["60 minutes", "75 minutes", "90 minutes", "120 minutes"], "90 minutes"),
  listen("Piano moved", "Your piano lesson is now on Thursday at five instead of Tuesday.", "When is the lesson now?", ["Tuesday", "Wednesday", "Thursday", "Friday"], "Thursday"),
  listen("Lost keys", "I can't find my keys. Have you seen them in the kitchen?", "What is lost?", ["A phone", "Keys", "A wallet", "A bag"], "Keys"),
  listen("Football cancelled", "Today's football practice is cancelled because the field is too wet.", "Why is practice cancelled?", ["No coach", "The field is wet", "Holiday", "Exam week"], "The field is too wet"),
  listen("Birthday reminder", "Don't forget — Grandma's birthday party is at one on Sunday.", "When is the party?", ["Saturday 1 pm", "Sunday 1 pm", "Sunday evening", "Monday"], "Sunday 1 pm"),
  listen("Book return", "Please return library books by the end of this week.", "When must books be returned?", ["Today", "End of this week", "Next month", "Never"], "End of this week"),
  listen("New teacher", "Mr Davis will teach geography while Mrs Hill is on leave.", "Who will teach geography?", ["Mrs Hill", "Mr Davis", "The head teacher", "Nobody"], "Mr Davis"),
  listen("Canteen special", "Today's lunch special is chicken rice with soup.", "What is the special?", ["Pasta", "Chicken rice with soup", "Pizza", "Salad only"], "Chicken rice with soup"),
  listen("Bus stop", "The next bus to the town centre leaves in five minutes from stop B.", "Which stop?", ["Stop A", "Stop B", "Stop C", "The station"], "Stop B"),
  listen("Film choice", "Shall we watch the comedy or the adventure film?", "What are they choosing?", ["Restaurants", "Films", "Books", "Games"], "Films"),
  listen("Homework club", "Homework club is in the library every Tuesday and Thursday until four thirty.", "Where is homework club?", ["Room 8", "The library", "The hall", "The lab"], "The library"),
  listen("Weather warning", "Strong winds expected this evening. Close windows before you leave.", "What should you do?", ["Open windows", "Close windows", "Go outside", "Cancel school"], "Close windows"),
  listen("Ticket office", "The ticket office closes at six, but you can buy online until midnight.", "When does the office close?", ["Five", "Six", "Midnight", "Ten"], "Six"),
];

const writing = [
  write("Email — party", "Write an email to your English friend Sam about a party last weekend.\n\n• where it was\n• what you did\n• why you enjoyed it\n\nWrite 25–35 words.", 35, "Informal email, past tense."),
  write("Note — absent", "Write a note to Mr Brown. You cannot come to class tomorrow because you are ill.\n\nWrite 25–35 words.", 35, "Polite note."),
  write("Postcard", "Write a postcard to a friend about your holiday.\n\n• where you are\n• what the weather is like\n• one thing you did\n\nWrite 25–35 words.", 35, "A2 Key postcard style."),
  write("Invitation", "Invite your friend to your birthday party.\n\n• when and where\n• what you will do\n• ask them to reply\n\nWrite 25–35 words.", 35, "Functional writing."),
  write("Message — homework", "Write a message to a classmate about homework for English.\n\nWrite 25–35 words.", 35, "Short note."),
  write("Email — favourite place", "Your English friend wants to know about your favourite place in your town.\n\nWrite 25–35 words.", 35, "Informal email."),
  write("Thank-you note", "Write a thank-you note to someone who gave you a present.\n\nWrite 25–35 words.", 35, "Simple polite writing."),
  write("Weekend plans", "Write an email about your plans for next weekend.\n\nWrite 25–35 words.", 35, "Future with going to."),
  write("School club", "Write about a club at your school and why you like it.\n\nWrite 25–35 words.", 35, "Present simple."),
  write("Lost item", "Write a note for the school noticeboard about something you lost.\n\nWrite 25–35 words.", 35, "Functional notice."),
];

const speaking = [
  speak("Daily routine", "Tell me about your daily routine and what you do after school.", 15, 60),
  speak("Film or book", "Talk about a film or book you enjoyed. What was it about? Why did you like it?", 15, 60),
  speak("Favourite place", "Describe your favourite place in your town. Where is it? What can you do there?", 15, 60),
  speak("Last holiday", "Talk about your last holiday. Where did you go? What did you do?", 15, 60),
  speak("Family", "Tell me about your family. Who do you live with? What do you do together?", 15, 60),
  speak("Food", "What food do you like? What do you usually eat for lunch?", 15, 60),
  speak("Sports", "Do you play any sports? How often? Why do you like them?", 15, 60),
  speak("School", "What is your school like? What is your favourite subject?", 15, 60),
  speak("Future plans", "What do you want to do next summer?", 15, 60),
  speak("Transport", "How do you travel to school? Is it easy or difficult?", 15, 60),
];

const uoe = [
  gap("Present simple", "My brother is very ___ (good) at maths.", "good"),
  gap("Past simple", "We ___ (go) to the cinema last night.", "went"),
  gap("First conditional", "If it ___ (rain) tomorrow, we will stay home.", "rains"),
  gap("Comparative", "She is ___ (tall) than her sister.", "taller"),
  gap("Present perfect", "I have ___ (already) finished my homework.", "already"),
  gap("Quantifiers", "There isn't ___ (much) milk left.", "much"),
  gap("Used to", "He ___ (use) to play tennis every Saturday.", "used"),
  gap("Superlative", "This is the ___ (good) book I've ever read.", "best"),
  gap("Modals", "They ___ (can't) be at home now — I saw them leave.", "can't"),
  gap("Phrasal verb", "We looked ___ (up) the word in the dictionary.", "up"),
  gap("Reported question", "She asked me ___ (if) I could help her.", "if"),
  gap("Gerund", "I'm looking forward ___ (to) seeing you.", "to"),
  gap("Must", "You ___ (must) wear a uniform at this school.", "must"),
  gap("Some/any", "Are there ___ (any) apples in the fridge?", "any"),
  gap("Adverb", "She speaks English very ___ (good).", "well"),
  gap("Preposition", "The cat jumped ___ (over) the wall.", "over"),
  gap("Plural verb", "My parents ___ (watch) TV every evening.", "watch"),
  gap("Object pronoun", "Can you help ___ (I)?", "me"),
  gap("Past continuous", "I was ___ (study) when you called.", "studying"),
  gap("Would like", "Would you like ___ (go) to the cinema?", "to go"),
  gap("Too/enough", "It's too ___ (cold) to swim today.", "cold"),
  gap("Both/neither", "___ (Neither) of the answers is correct.", "Neither"),
  gap("Since/for", "She has lived here ___ (since) 2020.", "since"),
  gap("Passive", "English ___ (speak) in many countries.", "is spoken"),
  gap("Question tag", "You're tired, ___ (aren't) you?", "aren't"),
  gap("Possessive", "This is ___ (Anna) bike.", "Anna's"),
  gap("Infinitive purpose", "I went to the shop ___ (buy) some bread.", "to buy"),
  gap("Past participle", "Have you ever ___ (eat) sushi?", "eaten"),
  gap("Comparative adverb", "He runs ___ (fast) than his brother.", "faster"),
  gap("Preposition time", "The meeting is ___ (on) Monday morning.", "on"),
];

export const KET_BANK: LevelBank = { reading, listening, writing, speaking, uoe };
