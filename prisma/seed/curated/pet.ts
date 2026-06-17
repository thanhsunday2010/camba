import { fromPassageSets, gap, listen, mcq, speak, write, type LevelBank } from "./types";

const reading = fromPassageSets([
  {
    title: "Remote working",
    passage:
      "Remote working has become common since 2020. Many employees enjoy flexible hours and no commuting. However, some managers worry that teamwork suffers when people rarely meet face to face. Companies are now experimenting with hybrid models, where staff work partly at home and partly in the office.",
    questions: [
      mcq("Remote working", "What changed since 2020?", ["Office sizes", "Remote working", "School hours", "Travel costs"], "Remote working"),
      mcq("Remote working", "What do employees enjoy?", ["Long meetings", "Flexible hours", "More commuting", "Fixed desks"], "Flexible hours"),
      mcq("Remote working", "What do some managers worry about?", ["Cost", "Teamwork", "Technology", "Training"], "Teamwork"),
      mcq("Remote working", "What are companies trying?", ["Fully remote", "Hybrid models", "No offices", "Shorter weeks only"], "Hybrid models"),
      mcq("Remote working", "What does hybrid mean?", ["Work only at home", "Work partly at home and partly in office", "No work", "Travel every day"], "Work partly at home and partly in office"),
    ],
  },
  {
    title: "Music festival",
    passage:
      "Greenfield Music Festival takes place in Riverside Park every August. This year there will be three stages, international food stalls and a family area with games for children. Student tickets cost twenty pounds if bought online before July. Parking is available at the north gate only.",
    questions: [
      mcq("Music festival", "Where is the festival held?", ["In a stadium", "In Riverside Park", "On a beach", "In a hall"], "In Riverside Park"),
      mcq("Music festival", "When is it?", ["Every July", "Every August", "Every June", "Every December"], "Every August"),
      mcq("Music festival", "How much is a student ticket online?", ["Fifteen pounds", "Twenty pounds", "Twenty-five pounds", "Thirty pounds"], "Twenty pounds"),
      mcq("Music festival", "When should students buy tickets for that price?", ["On the day", "Before July", "After the festival", "Never"], "Before July"),
      mcq("Music festival", "Where should drivers park?", ["Any gate", "The north gate only", "In the centre", "At the hotel"], "The north gate only"),
    ],
  },
  {
    title: "Screen time study",
    passage:
      "A recent study of twelve hundred teenagers found that spending more than three hours on screens before bedtime was linked to poorer sleep. Dr Wells recommends setting device limits and charging phones outside the bedroom. Some schools have introduced phone-free zones during lessons.",
    questions: [
      mcq("Screen time", "How many teenagers took part?", ["500", "800", "1200", "2000"], "1200"),
      mcq("Screen time", "What was linked to poorer sleep?", ["Exercise", "More than three hours on screens before bed", "Reading", "Early mornings"], "More than three hours on screens before bed"),
      mcq("Screen time", "What does Dr Wells recommend?", ["More gaming", "Device limits and charging phones outside bedroom", "No homework", "Later school start only"], "Device limits and charging phones outside bedroom"),
      mcq("Screen time", "What have some schools introduced?", ["Longer breaks", "Phone-free zones", "More tests", "Online-only lessons"], "Phone-free zones"),
      mcq("Screen time", "What is the writer's overall message?", ["Ban all screens", "Balance and healthy habits matter", "Ignore research", "Only adults are affected"], "Balance and healthy habits matter"),
    ],
  },
  {
    title: "Volunteering abroad",
    passage:
      "Last summer, Priya spent four weeks volunteering at an animal rescue centre in Portugal. She cleaned enclosures, fed injured birds and helped visitors learn about wildlife. Although the work was tiring, Priya says it improved her confidence and inspired her to study biology at university.",
    questions: [
      mcq("Volunteering", "Where did Priya volunteer?", ["Spain", "Portugal", "Italy", "France"], "Portugal"),
      mcq("Volunteering", "How long was she there?", ["Two weeks", "Four weeks", "Two months", "One year"], "Four weeks"),
      mcq("Volunteering", "What kind of centre was it?", ["Hospital", "Animal rescue", "School", "Museum"], "Animal rescue"),
      mcq("Volunteering", "What did she help visitors do?", ["Buy tickets", "Learn about wildlife", "Cook food", "Play sports"], "Learn about wildlife"),
      mcq("Volunteering", "What does she plan to study?", ["Law", "Biology", "Art", "Business"], "Biology"),
    ],
  },
  {
    title: "Urban farming",
    passage:
      "City Sprouts is a project that turns empty rooftops into vegetable gardens. Volunteers grow tomatoes, herbs and salad leaves that are sold to local restaurants. The organisers hope the project will teach young people where food comes from and reduce transport pollution.",
    questions: [
      mcq("Urban farming", "Where are the gardens?", ["In parks", "On empty rooftops", "Underground", "In schools only"], "On empty rooftops"),
      mcq("Urban farming", "Who grows the vegetables?", ["Farmers only", "Volunteers", "Machines", "Restaurants"], "Volunteers"),
      mcq("Urban farming", "Who buys the produce?", ["Supermarkets only", "Local restaurants", "Export companies", "Nobody"], "Local restaurants"),
      mcq("Urban farming", "What do organisers want to teach?", ["Cooking only", "Where food comes from", "Driving", "Languages"], "Where food comes from"),
      mcq("Urban farming", "What environmental benefit is mentioned?", ["Less noise", "Reduced transport pollution", "More cars", "Cheaper petrol"], "Reduced transport pollution"),
    ],
  },
  {
    title: "Interview — young chef",
    passage:
      "At seventeen, Marco already works part-time in a busy Italian restaurant. He started by watching cooking videos online, then asked the head chef for work experience. Marco's dream is to open his own café that uses ingredients from local farmers.",
    questions: [
      mcq("Young chef", "How old is Marco?", ["Fifteen", "Sixteen", "Seventeen", "Eighteen"], "Seventeen"),
      mcq("Young chef", "Where does he work?", ["A bakery", "An Italian restaurant", "A school", "A supermarket"], "An Italian restaurant"),
      mcq("Young chef", "How did he first learn?", ["From his grandmother only", "Cooking videos online", "A university course", "He didn't learn"], "Cooking videos online"),
      mcq("Young chef", "What is his dream?", ["To be a pilot", "To open his own café", "To stop cooking", "To move abroad"], "To open his own café"),
      mcq("Young chef", "What kind of ingredients does he want to use?", ["Imported only", "From local farmers", "Frozen only", "None"], "From local farmers"),
    ],
  },
  {
    title: "Language exchange",
    passage:
      "Our school runs a language exchange with a partner school in Germany. Students chat online every fortnight and write emails about school life, hobbies and festivals. Next term, ten students will visit Berlin for a week and stay with host families.",
    questions: [
      mcq("Language exchange", "Which country is the partner school in?", ["France", "Germany", "Poland", "Austria"], "Germany"),
      mcq("Language exchange", "How often do students chat online?", ["Every day", "Every fortnight", "Once a year", "Never"], "Every fortnight"),
      mcq("Language exchange", "What do they write about?", ["Only exams", "School life, hobbies and festivals", "Shopping only", "Sports results"], "School life, hobbies and festivals"),
      mcq("Language exchange", "How many students will visit Berlin?", ["Five", "Ten", "Twenty", "The whole school"], "Ten"),
      mcq("Language exchange", "Where will they stay?", ["In a hotel", "With host families", "At school", "In tents"], "With host families"),
    ],
  },
  {
    title: "Electric bikes",
    passage:
      "The city council plans to introduce five hundred electric bikes for public hire next spring. Users will unlock bikes with a phone app and leave them at designated parking areas. Critics say more cycle lanes are needed first, but supporters believe the scheme will reduce traffic.",
    questions: [
      mcq("Electric bikes", "How many bikes are planned?", ["Fifty", "Five hundred", "Five thousand", "Fifty thousand"], "Five hundred"),
      mcq("Electric bikes", "When will they be introduced?", ["This winter", "Next spring", "Next autumn", "In five years"], "Next spring"),
      mcq("Electric bikes", "How do users unlock bikes?", ["With a key", "With a phone app", "By calling the council", "They can't"], "With a phone app"),
      mcq("Electric bikes", "What do critics want first?", ["More cars", "More cycle lanes", "Higher prices", "Fewer bikes"], "More cycle lanes"),
      mcq("Electric bikes", "What do supporters believe?", ["Traffic will increase", "The scheme will reduce traffic", "Nobody will use bikes", "Bikes are dangerous"], "The scheme will reduce traffic"),
    ],
  },
  {
    title: "Podcast review",
    passage:
      "Science Stories is a weekly podcast hosted by Dr Kim Lee. Each twenty-minute episode explains a recent discovery in simple language. Listeners can submit questions by email, and the most popular topic last month was renewable energy in cities.",
    questions: [
      mcq("Podcast", "How often is the podcast released?", ["Daily", "Weekly", "Monthly", "Yearly"], "Weekly"),
      mcq("Podcast", "How long is each episode?", ["Ten minutes", "Twenty minutes", "Forty minutes", "One hour"], "Twenty minutes"),
      mcq("Podcast", "Who hosts it?", ["A journalist", "Dr Kim Lee", "A student", "Anonymous"], "Dr Kim Lee"),
      mcq("Podcast", "How can listeners interact?", ["By post only", "By submitting questions by email", "By phone vote", "They can't"], "By submitting questions by email"),
      mcq("Podcast", "What was the popular topic last month?", ["Space travel", "Renewable energy in cities", "Ancient history", "Video games"], "Renewable energy in cities"),
    ],
  },
  {
    title: "Notices and short texts",
    passage:
      "Alex's email: Hi! I'm visiting your city next month. Can you suggest interesting places and local food? — Alex. Job advert: PART-TIME SHOP ASSISTANT — Sat/Sun, must speak English + French, apply online. Film review: The film was so boring that we left before the end. Building notice: Due to repair work, lifts 2 and 3 are out of service until 20 April. Blog: I've been learning guitar for about three years and practise every evening.",
    questions: [
      mcq("Notices and short texts", "What does Alex want?", ["Money", "Suggestions for places and food", "A job", "Homework help"], "Suggestions for places and food"),
      mcq("Notices and short texts", "What language is required besides English?", ["Spanish", "French", "German", "Chinese"], "French"),
      mcq("Notices and short texts", "How did the writer feel about the film?", ["Excited", "Bored", "Scared", "Confused"], "Bored"),
      mcq("Notices and short texts", "What is unavailable in the building?", ["Stairs", "Lifts 2 and 3", "The whole building", "Parking"], "Lifts 2 and 3"),
      mcq("Notices and short texts", "How long has the writer played guitar?", ["One year", "Two years", "Three years", "Five years"], "Three years"),
    ],
  },
  {
    title: "Travel and announcements",
    passage:
      "Travel information: Passengers must check in at least two hours before international flights. School announcement: The debating club has moved to Room 14 on Wednesdays at four. Product label: Keep refrigerated after opening. Use within three days. Internal message: The meeting has been moved to Conference Room B on the third floor. Health article: Experts warn that sitting for long periods can harm your health even if you exercise.",
    questions: [
      mcq("Travel and announcements", "When must passengers check in?", ["Thirty minutes before", "At least two hours before", "After boarding", "Next day"], "At least two hours before"),
      mcq("Travel and announcements", "When is debating club?", ["Tuesday", "Wednesday", "Thursday", "Friday"], "Wednesday"),
      mcq("Travel and announcements", "What should you do after opening the product?", ["Freeze it", "Keep refrigerated", "Eat immediately", "Throw away"], "Keep refrigerated"),
      mcq("Travel and announcements", "Where is the meeting?", ["Room A", "Room B, third floor", "Online", "Cancelled"], "Room B, third floor"),
      mcq("Travel and announcements", "What is the main warning in the health article?", ["Exercise is useless", "Long sitting can harm health", "Stand all day", "Don't go to school"], "Long sitting can harm health"),
    ],
  },
  {
    title: "Plastic-free month at school",
    passage:
      "When geography teacher Ms Ortiz challenged Year 10 to reduce plastic waste, few students expected the idea to spread beyond her classroom. Within a week, the canteen agreed to replace disposable cups with reusable ones, and the art department began collecting bottle tops for a mural about ocean pollution. Students measured how much plastic their families threw away and presented the results in assembly. The most surprising finding was that snack wrappers, not water bottles, made up the largest share. By the end of the month, the school had cut canteen plastic by forty per cent and raised three hundred pounds for a local river-clean charity. Ms Ortiz now plans to invite primary schools to join the project next term.",
    questions: [
      mcq("Plastic-free month", "Who started the challenge?", ["The head teacher", "Ms Ortiz", "The canteen staff", "A charity"], "Ms Ortiz"),
      mcq("Plastic-free month", "What did the canteen change first?", ["The menu", "Disposable cups", "Opening hours", "Prices"], "Disposable cups"),
      mcq("Plastic-free month", "What did the art department collect?", ["Old books", "Bottle tops", "Glass jars", "Metal cans"], "Bottle tops"),
      mcq("Plastic-free month", "What caused the most plastic waste at home?", ["Water bottles", "Snack wrappers", "Shopping bags", "Toys"], "Snack wrappers"),
      mcq("Plastic-free month", "How much did canteen plastic fall by?", ["Ten per cent", "Twenty per cent", "Forty per cent", "Eighty per cent"], "Forty per cent"),
      mcq("Plastic-free month", "What will happen next term?", ["The project will stop", "Primary schools may join", "Plastic will be banned completely", "The canteen will close"], "Primary schools may join"),
    ],
  },
  {
    title: "Internship at community radio",
    passage:
      "Sixteen-year-old Nina spent two weeks interning at Bridge FM, a small community radio station in her hometown. She arrived expecting to make tea and answer phones, but producer James quickly taught her to edit short interviews and write links between songs. Nina recorded vox pops in the market, asking shoppers about local music events. Her favourite task was preparing a feature on teenage volunteers who teach digital skills to older residents. The piece aired on Thursday evening and received more online comments than any show that week. Nina says the experience confirmed her ambition to study media at university, though she realised that presenters work long hours and must check facts carefully. James offered her a Saturday slot co-hosting a youth programme if she completes a short training course.",
    questions: [
      mcq("Radio internship", "How long was Nina's internship?", ["One week", "Two weeks", "One month", "Six months"], "Two weeks"),
      mcq("Radio internship", "What did Nina originally expect to do?", ["Present live shows", "Make tea and answer phones", "Sell adverts", "Design the website"], "Make tea and answer phones"),
      mcq("Radio internship", "Where did Nina record vox pops?", ["At school", "In the market", "At the station only", "Online"], "In the market"),
      mcq("Radio internship", "What was Nina's feature about?", ["Sports results", "Teenage volunteers teaching digital skills", "Holiday travel", "Cooking"], "Teenage volunteers teaching digital skills"),
      mcq("Radio internship", "When did her piece air?", ["Monday morning", "Thursday evening", "Friday night", "Sunday afternoon"], "Thursday evening"),
      mcq("Radio internship", "What might Nina do after training?", ["Leave the station", "Co-host a youth programme on Saturdays", "Become station manager", "Stop studying media"], "Co-host a youth programme on Saturdays"),
    ],
  },
  {
    title: "Restoring a vintage bicycle",
    passage:
      "Last winter, Tom found a rusty bicycle frame in his neighbour's shed and asked if he could try to repair it. With help from online videos and his design technology teacher, he cleaned the metal, replaced the brakes and fitted new tyres. The hardest part was aligning the wheels so the bike did not wobble. Tom kept a photo diary and posted updates on the school eco-blog, explaining how repairing old items reduces waste. When the bicycle was finished, he donated it to a refugee support centre that lends bikes to newcomers who cannot afford transport. Tom's teacher entered the project in a regional skills competition, where it won second place. Tom now volunteers at the centre twice a month, teaching others basic maintenance.",
    questions: [
      mcq("Vintage bicycle", "Where did Tom find the bicycle frame?", ["In a shop", "In a neighbour's shed", "At the dump", "At school"], "In a neighbour's shed"),
      mcq("Vintage bicycle", "Who helped Tom besides online videos?", ["His neighbour only", "His design technology teacher", "A professional mechanic", "Nobody"], "His design technology teacher"),
      mcq("Vintage bicycle", "What was the most difficult task?", ["Painting the frame", "Aligning the wheels", "Buying tyres", "Writing the blog"], "Aligning the wheels"),
      mcq("Vintage bicycle", "Where did Tom share his progress?", ["On television", "On the school eco-blog", "In a newspaper", "At a market"], "On the school eco-blog"),
      mcq("Vintage bicycle", "Who received the finished bicycle?", ["Tom's neighbour", "A refugee support centre", "The competition judges", "Tom's teacher"], "A refugee support centre"),
      mcq("Vintage bicycle", "What does Tom do now at the centre?", ["He sells bikes", "He teaches basic maintenance", "He only rides bikes", "He manages the website"], "He teaches basic maintenance"),
    ],
  },
  {
    title: "Neighbourhood noise complaint",
    passage:
      "Residents on Maple Close have complained for months about noise from a late-night takeaway near the park. Delivery drivers often talk loudly while waiting for orders, and customers sometimes play music in parked cars after midnight. The takeaway owner, Mr Hassan, says most of his staff finish by eleven and that he has asked drivers to turn off engines. However, councillor Patel argues that the business lacks a proper waiting area, so drivers gather on the pavement. At a recent meeting, the council agreed to install better street lighting and move the taxi rank fifty metres away. Mr Hassan will also display a sign asking customers to leave quietly. Two residents said they would prefer stricter closing times, but others worry that tougher rules could hurt a popular local business that employs twelve people from the area.",
    questions: [
      mcq("Noise complaint", "What type of business is causing complaints?", ["A gym", "A late-night takeaway", "A factory", "A school"], "A late-night takeaway"),
      mcq("Noise complaint", "What do customers sometimes do after midnight?", ["Cook at home", "Play music in parked cars", "Close the park", "Call the council"], "Play music in parked cars"),
      mcq("Noise complaint", "What time do most staff finish according to Mr Hassan?", ["Nine", "Ten", "Eleven", "Midnight"], "Eleven"),
      mcq("Noise complaint", "Why do drivers gather on the pavement?", ["There is no proper waiting area", "The park is closed", "The street has no lights", "The takeaway is closed"], "There is no proper waiting area"),
      mcq("Noise complaint", "What will the council install?", ["A new park", "Better street lighting", "A bigger car park", "A police station"], "Better street lighting"),
      mcq("Noise complaint", "How many local people does the takeaway employ?", ["Two", "Six", "Twelve", "Twenty"], "Twelve"),
    ],
  },
  {
    title: "Book club interview",
    passage:
      "In this month's school magazine, editor Rosa interviews book club leader Mr Finch about reading habits. Mr Finch explains that the club began with six students and now has nearly forty members from three year groups. They meet every second Wednesday to discuss one novel, and members take turns preparing questions. Mr Finch encourages students to choose books from different countries and time periods rather than only popular bestsellers. He believes reading fiction builds empathy because it lets you see life through other characters' eyes. When Rosa asks about screens, Mr Finch agrees that phones compete for attention, but he says even twenty minutes of reading before bed can improve sleep. The club's next title is a mystery set in 1980s Lagos, chosen by vote.",
    questions: [
      mcq("Book club", "How often does the club meet?", ["Every week", "Every second Wednesday", "Once a term", "Every day"], "Every second Wednesday"),
      mcq("Book club", "How many members does the club have now?", ["Six", "Twenty", "Nearly forty", "One hundred"], "Nearly forty"),
      mcq("Book club", "What does Mr Finch encourage students to read?", ["Only bestsellers", "Books from different countries and periods", "Textbooks only", "Magazines only"], "Books from different countries and periods"),
      mcq("Book club", "Why does Mr Finch think fiction is valuable?", ["It is always short", "It builds empathy", "It replaces homework", "It is free online"], "It builds empathy"),
      mcq("Book club", "What reading habit might improve sleep?", ["Reading all night", "Twenty minutes before bed", "Reading only on phones", "Never reading fiction"], "Twenty minutes before bed"),
      mcq("Book club", "Where is the next book set?", ["1980s Lagos", "Modern London", "Ancient Rome", "Future Mars"], "1980s Lagos"),
    ],
  },
  {
    title: "Youth sports funding",
    passage:
      "A new grant programme aims to support youth sports clubs in rural areas where facilities are limited. Clubs can apply for up to five thousand pounds to repair pitches, buy equipment or train volunteer coaches. Applicants must show how their project will include girls as well as boys and how they will keep costs low for families. Last year a pilot scheme in Devon helped a cricket club install floodlights, allowing evening practice during short winter days. Sports minister Dana Okonkwo said physical activity improves both health and confidence, especially after periods when many teenagers spent less time outdoors. Critics warn that one-off grants cannot replace long-term funding from councils, but supporters hope successful clubs will attract sponsorship from local businesses.",
    questions: [
      mcq("Youth sports funding", "Who is the grant programme mainly for?", ["Professional teams", "Youth clubs in rural areas", "University athletes", "International tours"], "Youth clubs in rural areas"),
      mcq("Youth sports funding", "What is the maximum grant amount?", ["Five hundred pounds", "Five thousand pounds", "Fifty thousand pounds", "One million pounds"], "Five thousand pounds"),
      mcq("Youth sports funding", "What must applicants demonstrate about girls?", ["That they will not join", "That the project will include them", "That they pay more", "That they train separately only"], "That the project will include them"),
      mcq("Youth sports funding", "What did the Devon cricket club install?", ["A swimming pool", "Floodlights", "A café", "A hotel"], "Floodlights"),
      mcq("Youth sports funding", "What benefit does the minister mention?", ["Higher exam grades only", "Better health and confidence", "Free transport", "Shorter school days"], "Better health and confidence"),
      mcq("Youth sports funding", "What do supporters hope clubs will attract?", ["Government jobs", "Local business sponsorship", "Television contracts", "Foreign players"], "Local business sponsorship"),
    ],
  },
]);

const listening = [
  listen("Guitar experience", "I've been learning the guitar for about three years now.", "How long has she played guitar?", ["One year", "Two years", "Three years", "Five years"], "Three years"),
  listen("Second turning", "Go past the bank and take the second turning on the right.", "Where do you turn?", ["First right", "Second right", "First left", "Second left"], "Second right"),
  listen("Shirt offer", "If you buy two shirts, you get the third one half price.", "What is the offer?", ["Buy one get one", "Third shirt half price", "All free", "10% off"], "Third shirt half price"),
  listen("Meeting room", "The meeting has been moved to Conference Room B on the third floor.", "Where is the meeting?", ["Room A", "Room B floor 3", "Room B floor 2", "Online"], "Room B floor 3"),
  listen("Camping plans", "We're thinking of camping in the Lake District in August.", "Where will they camp?", ["Scotland", "Lake District", "Wales", "Cornwall"], "Lake District"),
  listen("Photo workshop", "The advanced photography workshop runs from the 10th to the 14th of May.", "When does it run?", ["April", "10–14 May", "June", "All year"], "10–14 May"),
  listen("Job requirements", "Applicants must be able to speak French and have a driving licence.", "What language is required?", ["Spanish", "French", "German", "Italian"], "French"),
  listen("Performance time", "Doors open at seven thirty but the performance starts at eight.", "When does the performance start?", ["7:00", "7:30", "8:00", "8:30"], "8:00"),
  listen("Train advice", "You'd better take the earlier train if you want a seat.", "What should you do?", ["Take later train", "Take earlier train", "Walk", "Drive"], "Take earlier train"),
  listen("Printer problem", "The printer isn't working so I'll email you the document instead.", "How will she send it?", ["By post", "By email", "By hand", "By fax"], "By email"),
  listen("Coach pickup", "The coach will pick us up from the school at six in the morning.", "When does the coach leave?", ["6 am", "6 pm", "8 am", "8 pm"], "6 am"),
  listen("Barbecue cancel", "They've cancelled the barbecue because storms are expected.", "Why cancelled?", ["No food", "Storms expected", "Too hot", "Guests busy"], "Storms expected"),
  listen("Table booking", "I've reserved a table for four under the name Patterson.", "How many people?", ["Two", "Three", "Four", "Five"], "Four"),
  listen("Museum tour", "The guided tour starts at eleven and lasts about ninety minutes.", "How long is the tour?", ["Sixty minutes", "Ninety minutes", "Two hours", "Thirty minutes"], "Ninety minutes"),
  listen("Course fee", "The evening Spanish course costs one hundred and eighty pounds per term.", "What language is the course?", ["French", "Spanish", "German", "Italian"], "Spanish"),
  listen("Delayed flight", "Flight KL442 to Amsterdam is delayed by forty minutes.", "How long is the delay?", ["Twenty minutes", "Forty minutes", "One hour", "Two hours"], "Forty minutes"),
  listen("Lost wallet", "I think I left my wallet on the train to Brighton.", "What did he lose?", ["Phone", "Wallet", "Passport", "Keys"], "Wallet"),
  listen("Interview reschedule", "Could we move the interview to Thursday at two instead of Wednesday?", "When is the new interview?", ["Wednesday 2 pm", "Thursday 2 pm", "Thursday 4 pm", "Friday"], "Thursday 2 pm"),
  listen("Charity run", "Registration for the charity run closes at midnight on Friday.", "When does registration close?", ["Thursday", "Friday midnight", "Saturday", "Sunday"], "Friday midnight"),
  listen("Host family", "Your host family expects you to call if you'll be late for dinner.", "What should you do if late?", ["Nothing", "Call the host family", "Skip dinner", "Leave"], "Call the host family"),
  listen("Exam instructions", "Write your answers in pen, not pencil, on the separate sheet.", "What should you use?", ["Pencil", "Pen", "Marker", "Chalk"], "Pen"),
  listen("Weather update", "The storm has passed but roads may still be icy tonight.", "What may roads be like?", ["Dry", "Icy", "Flooded", "Closed"], "Icy"),
  listen("Work experience", "On Monday you'll shadow a graphic designer at the media company.", "Who will the student shadow?", ["A teacher", "A graphic designer", "A doctor", "A chef"], "A graphic designer"),
  listen("Library fine", "Your overdue book fine is three pounds fifty.", "What is the fine for?", ["Lost card", "Overdue book", "Damaged book", "Printing"], "Overdue book"),
  listen("Concert tickets", "There are only a few tickets left for Saturday's concert — book online.", "When is the concert?", ["Friday", "Saturday", "Sunday", "Monday"], "Saturday"),
];

const writing = [
  write("Email — city visit", "Your friend Alex wants to visit your city. Write an email suggesting places, food, and offering to show Alex around.\n\nWrite about 100 words.", 100, "B1 informal email."),
  write("Article — hobby", "Your teacher wants you to write about a hobby you enjoy.\n\nWrite about 100 words.", 100, "Include why you started and what you learn."),
  write("Story", "Your teacher showed you a photo of someone waiting at a bus stop in the rain. Write the story.\n\nWrite about 100 words.", 100, "B1 narrative."),
  write("Article — phones at school", "Write an article about whether students should use phones at school.\n\nWrite about 100 words.", 100, "Give opinions and examples."),
  write("Email — complaint", "Write an email to a shop about a product that stopped working after one week.\n\nWrite about 100 words.", 100, "Formal-ish email."),
  write("Article — influencer", "Write about a person who has influenced you.\n\nWrite about 100 words.", 100, "School magazine style."),
  write("Review — restaurant", "Write a review of a café or restaurant you visited.\n\nWrite about 100 words.", 100, "B1 review."),
  write("Article — sport", "Write about why sport is important for teenagers.\n\nWrite about 100 words.", 100, "Opinion article."),
  write("Email — invitation reply", "Reply to an invitation. You can come but will arrive late.\n\nWrite about 100 words.", 100, "Functional email."),
  write("Article — learning online", "Write about advantages and disadvantages of learning online.\n\nWrite about 100 words.", 100, "Balanced article."),
];

const speaking = [
  speak("Home vs school study", "Compare studying at home and studying at school. Which do you prefer and why?", 15, 120),
  speak("Helping someone", "Describe a time you helped someone. What happened and how did you feel?", 15, 120),
  speak("Technology", "How has technology changed the way you learn English?", 15, 120),
  speak("Travel experience", "Talk about an interesting trip. Where did you go and what did you learn?", 15, 120),
  speak("Future plans", "What would you like to do after finishing school? Why?", 15, 120),
  speak("Environment", "What can young people do to protect the environment?", 15, 120),
  speak("Media", "Do you prefer reading news online or watching videos? Why?", 15, 120),
  speak("Friendship", "What qualities make a good friend?", 15, 120),
  speak("Part-time job", "Would you like a part-time job while studying? Why or why not?", 15, 120),
  speak("Culture", "Describe a festival or tradition in your country.", 15, 120),
];

const uoe = [
  gap("Insist on", "She insisted ___ (on) paying for the meal.", "on"),
  gap("So...that", "The film was ___ (so) boring that we left early.", "so"),
  gap("Would rather", "I'd rather ___ (go) swimming than play football.", "go"),
  gap("Used to", "He is used ___ (to) getting up early.", "to"),
  gap("Passive modal", "The letter ___ (must be sent) by tomorrow.", "must be sent"),
  gap("Hardly...had", "Hardly ___ (had) I arrived when it started raining.", "had"),
  gap("Deny + gerund", "She denied ___ (stealing) the money.", "stealing"),
  gap("Would you mind", "___ (Would) you mind opening the window?", "Would"),
  gap("It's high time", "It's high time we ___ (made) a decision.", "made"),
  gap("Superlative", "He is the ___ (funny) person I know.", "funniest"),
  gap("Wish past", "I wish I ___ (had) more free time.", "had"),
  gap("Depend on", "The project depends ___ (on) getting funding.", "on"),
  gap("Not only", "Not only ___ (does) she sing, but she also plays piano.", "does"),
  gap("Despite", "___ (Despite) the rain, we enjoyed the picnic.", "Despite"),
  gap("Unless", "You won't pass ___ (unless) you revise.", "unless"),
  gap("Despite/In spite", "In spite ___ (of) feeling tired, he finished the race.", "of"),
  gap("Gerund subject", "___ (Swimming) is good exercise.", "Swimming"),
  gap("Reported speech", "She said she ___ (was) busy.", "was"),
  gap("Too many", "There are ___ (too) many people here.", "too"),
  gap("Enough", "He isn't old ___ (enough) to drive.", "enough"),
  gap("Relative who", "That's the woman ___ (who) helped me.", "who"),
  gap("Passive past", "The window ___ (was broken) last night.", "was broken"),
  gap("Look forward", "We look forward ___ (to) hearing from you.", "to"),
  gap("Instead of", "Let's walk instead ___ (of) taking the bus.", "of"),
  gap("Although", "___ (Although) it was late, shops were still open.", "Although"),
  gap("By the time", "By the time we arrived, the film ___ (had) started.", "had"),
  gap("Prevent from", "Rain prevented us ___ (from) playing outside.", "from"),
  gap("Suggest + gerund", "He suggested ___ (going) to the cinema.", "going"),
  gap("Accuse of", "They accused him ___ (of) cheating.", "of"),
  gap("Provide with", "The hotel provided us ___ (with) clean towels.", "with"),
];

export const PET_BANK: LevelBank = { reading, listening, writing, speaking, uoe };
