import { fromPassageSets, gap, listen, mcq, speak, write, type LevelBank } from "./types";

const reading = fromPassageSets([
  {
    title: "Urban green spaces",
    passage:
      "Urban green spaces play a vital role in public health. Studies show that access to parks reduces stress and encourages physical activity. Critics argue maintenance costs are high, yet the long-term savings in healthcare may outweigh the expense. Several cities are now investing in sustainable park design.",
    questions: [
      mcq("Green spaces", "What role do parks play?", ["Education only", "Public health", "Transport", "Shopping"], "Public health"),
      mcq("Green spaces", "What do studies show?", ["Parks are always empty", "Access to parks reduces stress", "People avoid parks", "Parks increase noise"], "Access to parks reduces stress"),
      mcq("Green spaces", "What do critics mention?", ["Safety", "Maintenance costs", "Location", "Size only"], "Maintenance costs"),
      mcq("Green spaces", "What may balance costs?", ["Tourism only", "Healthcare savings", "Higher taxes only", "Advertising"], "Healthcare savings"),
      mcq("Green spaces", "What are cities investing in?", ["More roads", "Sustainable park design", "Car parks", "Malls"], "Sustainable park design"),
    ],
  },
  {
    title: "Solar startup",
    passage:
      "BrightPath Solar began as a university engineering project and now employs forty people. The founders struggled to secure funding at first, but a local grant allowed them to build prototypes. They are now planning to expand into neighbouring countries and hire specialists in battery storage.",
    questions: [
      mcq("Solar startup", "What does the company produce?", ["Software", "Solar technology", "Books", "Clothes"], "Solar technology"),
      mcq("Solar startup", "Where did the idea start?", ["A TV show", "A university project", "Travel abroad", "A family business"], "A university project"),
      mcq("Solar startup", "What was the main early difficulty?", ["Staff", "Funding", "Marketing only", "Location"], "Funding"),
      mcq("Solar startup", "How many employees now?", ["Five", "Twelve", "Forty", "One hundred"], "Forty"),
      mcq("Solar startup", "What are they planning next?", ["Closing", "Expanding abroad", "Changing to food", "Stopping production"], "Expanding abroad"),
    ],
  },
  {
    title: "Air quality study",
    passage:
      "Researchers used sensors and surveys to study air quality near busy roads. They found pollution levels rose during rush hour and that children at schools close to main routes were most affected. Experts recommend low-emission zones, though some shop owners fear fewer customers.",
    questions: [
      mcq("Air quality", "What was the research about?", ["Ocean pollution", "Air quality in cities", "Forest fires", "Recycling only"], "Air quality in cities"),
      mcq("Air quality", "How was data collected?", ["Guessing", "Sensors and surveys", "Interviews only", "Old reports only"], "Sensors and surveys"),
      mcq("Air quality", "When did pollution rise?", ["At night", "During rush hour", "At weekends only", "Never"], "During rush hour"),
      mcq("Air quality", "Who was most affected?", ["Office workers", "Children near main routes", "Tourists", "Farmers"], "Children near main routes"),
      mcq("Air quality", "What do experts suggest?", ["Ban all cars immediately", "Low-emission zones", "Close schools", "Ignore data"], "Low-emission zones"),
    ],
  },
  {
    title: "Remote learning debate",
    passage:
      "During the pandemic, universities moved lectures online within weeks. While flexibility benefited many students, others lacked quiet space or reliable internet. A recent report argues blended learning — combining online resources with face-to-face seminars — offers the best of both approaches.",
    questions: [
      mcq("Remote learning", "What happened during the pandemic?", ["Universities closed forever", "Lectures moved online quickly", "Exams stopped", "Fees were removed"], "Lectures moved online quickly"),
      mcq("Remote learning", "What benefited some students?", ["Longer commutes", "Flexibility", "No teachers", "More exams"], "Flexibility"),
      mcq("Remote learning", "What problems did others face?", ["Too many books", "Lack of quiet space or internet", "Free food", "Short holidays"], "Lack of quiet space or internet"),
      mcq("Remote learning", "What does the report recommend?", ["Online only", "Blended learning", "No technology", "Shorter degrees"], "Blended learning"),
      mcq("Remote learning", "What does blended learning combine?", ["Sports and art", "Online resources and face-to-face seminars", "Two languages", "Work and sleep"], "Online resources and face-to-face seminars"),
    ],
  },
  {
    title: "Fast fashion",
    passage:
      "Campaigners criticise fast fashion for encouraging waste and poor working conditions. Some brands now publish supply-chain reports and offer repair services. Consumers are urged to buy fewer, higher-quality items and recycle textiles instead of sending them to landfill.",
    questions: [
      mcq("Fast fashion", "What do campaigners criticise?", ["Low prices only", "Waste and poor working conditions", "Online shopping", "Cotton farming only"], "Waste and poor working conditions"),
      mcq("Fast fashion", "What do some brands publish?", ["Jokes", "Supply-chain reports", "No information", "Only adverts"], "Supply-chain reports"),
      mcq("Fast fashion", "What new service is mentioned?", ["Free flights", "Repair services", "Unlimited returns", "Gift cards"], "Repair services"),
      mcq("Fast fashion", "What are consumers urged to do?", ["Buy more each week", "Buy fewer, higher-quality items", "Burn old clothes", "Shop daily"], "Buy fewer, higher-quality items"),
      mcq("Fast fashion", "What should happen to textiles?", ["Landfill only", "Recycle them", "Hide them", "Export only"], "Recycle them"),
    ],
  },
  {
    title: "Wildlife corridor",
    passage:
      "Conservationists created a wildlife corridor linking two forests separated by farmland. Cameras recorded deer, foxes and badgers using the route within months. Farmers were initially worried about crop damage, but fences and compensation schemes reduced conflict.",
    questions: [
      mcq("Wildlife corridor", "What does the corridor link?", ["Two cities", "Two forests", "Two rivers", "Two schools"], "Two forests"),
      mcq("Wildlife corridor", "What separated the forests?", ["A motorway", "Farmland", "A lake", "A wall"], "Farmland"),
      mcq("Wildlife corridor", "Which animals were recorded?", ["Lions", "Deer, foxes and badgers", "Penguins", "Whales"], "Deer, foxes and badgers"),
      mcq("Wildlife corridor", "What were farmers worried about?", ["Noise", "Crop damage", "Tourism", "Taxes"], "Crop damage"),
      mcq("Wildlife corridor", "What reduced conflict?", ["Closing farms", "Fences and compensation schemes", "Removing animals", "Building roads"], "Fences and compensation schemes"),
    ],
  },
  {
    title: "Museum exhibition",
    passage:
      "The National Museum's new exhibition explores how migration shaped modern British cuisine. Visitors can taste samples, watch interviews with chefs and see historical recipes. Curators hope the show will challenge stereotypes and highlight shared cultural contributions.",
    questions: [
      mcq("Museum exhibition", "What is the exhibition about?", ["Sports", "Migration and food", "Space", "Fashion"], "Migration and food"),
      mcq("Museum exhibition", "What can visitors do?", ["Cook alone", "Taste samples and watch interviews", "Buy clothes", "Play games only"], "Taste samples and watch interviews"),
      mcq("Museum exhibition", "What else is displayed?", ["Cars", "Historical recipes", "Phones", "Maps only"], "Historical recipes"),
      mcq("Museum exhibition", "What do curators hope?", ["Fewer visitors", "Challenge stereotypes", "Close the museum", "Raise prices only"], "Challenge stereotypes"),
      mcq("Museum exhibition", "What do they want to highlight?", ["Only one country", "Shared cultural contributions", "Fast food", "Frozen meals"], "Shared cultural contributions"),
    ],
  },
  {
    title: "Flexible working law",
    passage:
      "New legislation allows employees to request flexible working from their first day in a job. Employers must respond within two months and can refuse only for specific business reasons. Trade unions welcomed the change, but small firms say paperwork could burden them.",
    questions: [
      mcq("Flexible working", "When can employees request flexible working?", ["After five years", "From their first day", "Never", "Only managers"], "From their first day"),
      mcq("Flexible working", "How long do employers have to respond?", ["One week", "Two months", "One year", "One day"], "Two months"),
      mcq("Flexible working", "When can employers refuse?", ["Whenever they want", "Only for specific business reasons", "Never", "If employees are young"], "Only for specific business reasons"),
      mcq("Flexible working", "Who welcomed the change?", ["Nobody", "Trade unions", "All small firms", "Students only"], "Trade unions"),
      mcq("Flexible working", "What is small firms' concern?", ["Too many holidays", "Paperwork burden", "High wages", "No staff"], "Paperwork burden"),
    ],
  },
  {
    title: "Antibiotic resistance",
    passage:
      "Doctors warn that overusing antibiotics in humans and farming accelerates resistance. A public campaign encourages patients to finish prescribed courses and avoid demanding antibiotics for viral infections. Researchers are developing rapid tests to help GPs prescribe more accurately.",
    questions: [
      mcq("Antibiotics", "What accelerates resistance?", ["Exercise", "Overusing antibiotics", "Sleep", "Vaccines"], "Overusing antibiotics"),
      mcq("Antibiotics", "Where is overuse mentioned?", ["Humans and farming", "Schools only", "Factories only", "Parks"], "Humans and farming"),
      mcq("Antibiotics", "What should patients do with prescribed courses?", ["Stop early", "Finish them", "Share them", "Throw them away"], "Finish them"),
      mcq("Antibiotics", "What should patients avoid demanding?", ["Pain relief", "Antibiotics for viral infections", "Tests", "Advice"], "Antibiotics for viral infections"),
      mcq("Antibiotics", "What are researchers developing?", ["New sports", "Rapid tests for GPs", "More antibiotics only", "Mobile games"], "Rapid tests for GPs"),
    ],
  },
  {
    title: "Professional notices",
    passage:
      "Conference schedule: Registration opens at eight, keynote at nine thirty, workshops from ten. Research summary: Preliminary results suggest the treatment may delay symptoms by several months. Travel notice: Due to engineering works, buses replace trains between Oxford and Didcot. Workplace policy: Flexible working requests must be submitted at least six weeks in advance. Council announcement: The council plans to plant five thousand trees over the next three years.",
    questions: [
      mcq("Professional notices", "When is the keynote?", ["8:00", "9:00", "9:30", "10:00"], "9:30"),
      mcq("Professional notices", "What may the treatment do?", ["Cure completely", "Delay symptoms", "Increase pain", "Reduce cost only"], "Delay symptoms"),
      mcq("Professional notices", "What replaces trains?", ["Taxis", "Buses", "Nothing", "Planes"], "Buses"),
      mcq("Professional notices", "How much notice is required for flexible working?", ["Two weeks", "Four weeks", "Six weeks", "Eight weeks"], "Six weeks"),
      mcq("Professional notices", "How many trees will be planted?", ["500", "5000", "50000", "500000"], "5000"),
    ],
  },
  {
    title: "Policy and media excerpts",
    passage:
      "Medical advice: Patients are advised to avoid caffeine for twenty-four hours before the test. Legal news: The defendant denied all charges and was granted bail until the trial. Editorial opinion: The writer argues that balance, not bans, is the sensible approach to screen use. Job listing: Candidates must demonstrate experience in project management and fluent written English. Theatre review: Although the plot was predictable, the performances were outstanding.",
    questions: [
      mcq("Policy and media", "What should patients avoid?", ["Water", "Caffeine", "Food", "Exercise"], "Caffeine"),
      mcq("Policy and media", "What was granted to the defendant?", ["Prison", "Bail", "Fine only", "Passport"], "Bail"),
      mcq("Policy and media", "What approach does the writer prefer?", ["Complete bans", "Balance", "Unlimited use", "No rules"], "Balance"),
      mcq("Policy and media", "What skill is required for the job?", ["Driving", "Project management", "Cooking", "Singing"], "Project management"),
      mcq("Policy and media", "What was outstanding in the review?", ["The plot", "The performances", "The tickets", "The cinema"], "The performances"),
    ],
  },
  {
    title: "Autonomous vehicles and urban planning",
    passage:
      "Autonomous vehicles have moved from science fiction to pilot schemes on public roads, yet cities remain divided over how to integrate them. Proponents claim self-driving buses could reduce accidents caused by human error and provide transport for elderly residents who no longer drive. Critics counter that the technology is still imperfect in heavy rain and around cyclists, and that massive investment in sensors and mapping could divert funds from affordable tram networks. Urban planner Dr Elena Morales argues that the key question is not whether robots can steer, but whether policymakers will redesign streets for safety rather than speed. In Stockholm, a trial limited autonomous taxis to zones with wide pavements and strict speed limits, reporting fewer near-misses after six months. Meanwhile, trade unions warn that drivers could lose livelihoods unless retraining programmes run alongside automation. Morales suggests a hybrid future: autonomous shuttles on fixed routes, with human drivers remaining on complex intercity services for at least another decade.",
    questions: [
      mcq("Autonomous vehicles", "What benefit do proponents mention for elderly residents?", ["Cheaper fuel", "Transport for those who no longer drive", "Free parking", "Faster motorways"], "Transport for those who no longer drive"),
      mcq("Autonomous vehicles", "What weather condition concerns critics?", ["Heat", "Heavy rain", "Wind only", "Snow only"], "Heavy rain"),
      mcq("Autonomous vehicles", "What does Dr Morales say is the key question?", ["Whether robots can steer", "Whether streets will be redesigned for safety", "Whether taxis should be banned", "Whether buses are popular"], "Whether streets will be redesigned for safety"),
      mcq("Autonomous vehicles", "What happened in Stockholm after six months?", ["Accidents increased", "Fewer near-misses were reported", "The trial ended", "Drivers were replaced immediately"], "Fewer near-misses were reported"),
      mcq("Autonomous vehicles", "What do trade unions warn about?", ["Higher ticket prices", "Drivers losing livelihoods", "More traffic jams", "Fewer tourists"], "Drivers losing livelihoods"),
      mcq("Autonomous vehicles", "What kind of future does Morales suggest?", ["No human drivers anywhere", "Autonomous shuttles on fixed routes plus human drivers on complex services", "Only bicycles in cities", "Unlimited autonomous taxis"], "Autonomous shuttles on fixed routes plus human drivers on complex services"),
    ],
  },
  {
    title: "Archaeological discovery at coastal site",
    passage:
      "Archaeologists excavating a cliff-side site in Norfolk have uncovered evidence of a trading settlement dating to the seventh century, earlier than records suggested for the region. Among the finds are fragments of pottery from the Mediterranean, iron tools and preserved seeds that indicate cultivated barley. Team leader Professor James Holt said the discovery challenges assumptions that small coastal communities were isolated after the Roman withdrawal from Britain. Volunteers from local schools helped sieve soil and catalogue items, while marine erosion forced the team to work within strict seasonal windows. Some residents initially feared the dig would delay plans for a coastal path, but the council agreed to reroute the walkway to protect the trench. Holt emphasises that publication of results will take two years because samples must undergo radiocarbon dating and pollen analysis. Heritage groups hope the site will eventually become an open-air exhibit with guided tours, though funding remains uncertain.",
    questions: [
      mcq("Archaeological discovery", "How old is the settlement thought to be?", ["Third century", "Seventh century", "Twelfth century", "Nineteenth century"], "Seventh century"),
      mcq("Archaeological discovery", "What type of crop seed was found?", ["Rice", "Barley", "Maize", "Coffee"], "Barley"),
      mcq("Archaeological discovery", "What assumption does the find challenge?", ["That Romans never left Britain", "That coastal communities were isolated", "That pottery was not traded", "That cliffs erode quickly"], "That coastal communities were isolated"),
      mcq("Archaeological discovery", "Why was work limited to certain seasons?", ["School holidays only", "Marine erosion", "Lack of volunteers", "Winter festivals"], "Marine erosion"),
      mcq("Archaeological discovery", "What did the council agree to do about the coastal path?", ["Cancel it", "Reroute it to protect the trench", "Build a tunnel", "Close the beach"], "Reroute it to protect the trench"),
      mcq("Archaeological discovery", "Why will publication take two years?", ["Writers are busy", "Samples need scientific analysis", "The council refused access", "No pottery was found"], "Samples need scientific analysis"),
    ],
  },
  {
    title: "Gig economy workers seek recognition",
    passage:
      "Delivery couriers and ride-hail drivers in several European cities staged coordinated protests last month, demanding clearer employment status and access to sick pay. Many platforms classify workers as independent contractors, meaning they must cover vehicle maintenance and insurance themselves while algorithms assign shifts with little notice. Union organiser Fatima Rahman argues that flexibility suits some students, but that full-time couriers face unstable income and pressure to accept unsafe routes in bad weather. One company responded by introducing a minimum earnings guarantee during peak hours, though critics say the guarantee applies only in selected zones. Economists note that courts in Spain and Italy have recently ruled that some riders were employees entitled to backdated benefits. Rahman wants legislation that presumes worker status unless firms prove genuine self-employment. Business groups warn that higher labour costs could raise consumer prices and reduce the number of available jobs. For now, policymakers appear torn between protecting workers and preserving services that many households rely on for cheap transport and groceries.",
    questions: [
      mcq("Gig economy", "What did workers demand?", ["Free vehicles", "Clearer employment status and sick pay", "Shorter working hours only", "An end to apps"], "Clearer employment status and sick pay"),
      mcq("Gig economy", "How are many platform workers classified?", ["As government staff", "As independent contractors", "As volunteers", "As apprentices"], "As independent contractors"),
      mcq("Gig economy", "Who does Rahman say flexibility suits?", ["Retired drivers only", "Some students", "All full-time couriers", "Company managers"], "Some students"),
      mcq("Gig economy", "What did one company introduce?", ["Free insurance for all", "A minimum earnings guarantee in peak hours", "Permanent contracts for everyone", "A ban on bicycles"], "A minimum earnings guarantee in peak hours"),
      mcq("Gig economy", "What have courts in Spain and Italy recently ruled?", ["That all apps must close", "That some riders were employees", "That couriers cannot protest", "That algorithms are illegal"], "That some riders were employees"),
      mcq("Gig economy", "What do business groups warn could happen?", ["Lower prices", "Higher consumer prices and fewer jobs", "More public transport", "Free deliveries"], "Higher consumer prices and fewer jobs"),
    ],
  },
  {
    title: "Rewilding on former farmland",
    passage:
      "The Meadowbrook rewilding project has transformed three hundred hectares of exhausted farmland into wetland, scrub and native woodland over fifteen years. Conservation charity WildReturn removed drainage channels to allow seasonal flooding, which attracted herons, otters and rare dragonflies documented by volunteer surveyors. Neighbouring farmers initially opposed the scheme, fearing crop damage from wildlife and falling property values. Project director Hannah Okoye held monthly meetings to explain buffer zones and compensation for any proven losses. Visitor numbers rose after a boardwalk opened, bringing income to a village shop that had struggled since the post office closed. Scientists monitoring soil carbon report modest improvements, though Okoye cautions that rewilding is not a quick fix for climate targets. National policymakers cite Meadowbrook as evidence that large-scale restoration can coexist with agriculture when boundaries are negotiated carefully. Critics still question whether public money should fund projects that produce no food, while supporters argue that flood prevention and biodiversity have economic value too.",
    questions: [
      mcq("Rewilding project", "What was the land used for before rewilding?", ["Industry", "Exhausted farmland", "A motorway", "Housing"], "Exhausted farmland"),
      mcq("Rewilding project", "What did WildReturn remove to allow flooding?", ["Trees", "Drainage channels", "Footpaths", "Fences only"], "Drainage channels"),
      mcq("Rewilding project", "Why did neighbouring farmers initially oppose the scheme?", ["They wanted more shops", "They feared crop damage and falling property values", "They disliked otters", "They preferred mining"], "They feared crop damage and falling property values"),
      mcq("Rewilding project", "What helped a village shop financially?", ["A new factory", "Visitors after a boardwalk opened", "Higher taxes", "Selling farmland"], "Visitors after a boardwalk opened"),
      mcq("Rewilding project", "What do scientists report about soil carbon?", ["No change at all", "Modest improvements", "Complete elimination of carbon", "Data was not collected"], "Modest improvements"),
      mcq("Rewilding project", "What do supporters say rewilding provides besides biodiversity?", ["Free food for all visitors", "Flood prevention with economic value", "Unlimited building land", "Cheaper petrol"], "Flood prevention with economic value"),
    ],
  },
  {
    title: "Digital privacy and biometric data",
    passage:
      "Governments and technology firms are expanding the use of biometric data — fingerprints, facial scans and voice prints — to verify identity at borders, banks and even school canteens. Privacy advocates warn that once collected, such data can be stored indefinitely and potentially breached by hackers, unlike passwords that can be changed. Legal scholar Dr Priya Nair argues that consent forms are often too long for users to read, meaning people approve surveillance without understanding risks. Proponents claim biometrics reduce fraud and speed up services, citing airports where automated gates cut queue times. In one country, a court ruled that a police database of faces collected from protests violated constitutional rights, forcing authorities to delete millions of images. Nair recommends strict time limits on retention and independent audits of who accesses records. Companies respond that encryption and on-device processing minimise exposure, though researchers have shown some systems can be fooled by photographs or synthetic voices. The debate suggests that convenience will continue to clash with civil liberties until laws catch up with innovation.",
    questions: [
      mcq("Biometric data", "What types of biometric data are mentioned?", ["Fingerprints, facial scans and voice prints", "Only passwords", "Handwriting samples only", "Shoe sizes"], "Fingerprints, facial scans and voice prints"),
      mcq("Biometric data", "Why are privacy advocates concerned?", ["Biometrics are too cheap", "Data can be stored indefinitely and breached", "People prefer passwords", "Airports are too small"], "Data can be stored indefinitely and breached"),
      mcq("Biometric data", "What does Dr Nair say about consent forms?", ["They are always one sentence", "They are often too long to read properly", "They are illegal", "They are only for children"], "They are often too long to read properly"),
      mcq("Biometric data", "What benefit do proponents mention at airports?", ["More staff jobs", "Automated gates cutting queue times", "Free flights", "Longer security checks"], "Automated gates cutting queue times"),
      mcq("Biometric data", "What did a court force authorities to do?", ["Collect more images", "Delete millions of facial images", "Ban all cameras", "Close airports"], "Delete millions of facial images"),
      mcq("Biometric data", "What does Nair recommend?", ["Unlimited storage", "Strict time limits on retention and independent audits", "No encryption", "Sharing data with advertisers"], "Strict time limits on retention and independent audits"),
    ],
  },
]);

const listening = [
  listen("Renaissance", "The Renaissance began in Italy in the fourteenth century before spreading north.", "Where did the Renaissance begin?", ["France", "Italy", "England", "Germany"], "Italy"),
  listen("Deluxe rooms", "I'm afraid the deluxe rooms are fully booked until the end of the month.", "Which rooms are unavailable?", ["Standard", "Deluxe", "All rooms", "Suites only"], "Deluxe"),
  listen("Renewable debate", "While renewable energy is promising, storage remains a significant challenge.", "What is the challenge?", ["Cost only", "Storage", "Workers", "Weather only"], "Storage"),
  listen("Broadband funding", "The minister announced new funding for rural broadband infrastructure.", "What received funding?", ["Roads", "Broadband", "Schools only", "Hospitals"], "Broadband"),
  listen("Fine print", "I'd strongly advise against signing anything before reading the fine print.", "What should you read?", ["The title", "The fine print", "The cover", "Nothing"], "The fine print"),
  listen("Conference schedule", "Registration opens at eight, with the keynote address at nine thirty.", "When is the keynote?", ["8:00", "9:00", "9:30", "10:00"], "9:30"),
  listen("Treatment results", "Preliminary results suggest the treatment may delay symptoms by several months.", "What may the treatment do?", ["Cure completely", "Delay symptoms", "Cause pain", "Reduce cost"], "Delay symptoms"),
  listen("Rail replacement", "Due to engineering works, services will be replaced by buses between Oxford and Didcot.", "What replaces trains?", ["Taxis", "Buses", "Nothing", "Planes"], "Buses"),
  listen("Museum exhibition audio", "The exhibition explores how migration shaped modern British cuisine.", "What is the exhibition about?", ["Art only", "Migration and food", "Sports", "Music only"], "Migration and food"),
  listen("Flexible requests", "Flexible working requests must be submitted at least six weeks in advance.", "How much notice?", ["Two weeks", "Four weeks", "Six weeks", "Eight weeks"], "Six weeks"),
  listen("Tree planting", "The council plans to plant five thousand trees over the next three years.", "How many trees?", ["500", "5000", "50000", "500000"], "5000"),
  listen("Caffeine advice", "Patients are advised to avoid caffeine for twenty-four hours before the test.", "What should patients avoid?", ["Water", "Caffeine", "Food", "Exercise"], "Caffeine"),
  listen("Bail granted", "The defendant denied all charges and was granted bail until the trial.", "What was granted?", ["Prison", "Bail", "Fine", "Passport"], "Bail"),
  listen("Seminar room", "Today's seminar on sustainable transport will examine European case studies at two in Room 4.", "What is the seminar about?", ["History", "Sustainable transport", "Cooking", "Music"], "Sustainable transport"),
  listen("Grant deadline", "Applications for the research grant close at midnight on the fifteenth.", "When do applications close?", ["The first", "The fifteenth at midnight", "Next month", "Never"], "The fifteenth at midnight"),
  listen("Hotel checkout", "Checkout is at eleven, but luggage storage is available until six.", "When is checkout?", ["Nine", "Ten", "Eleven", "Twelve"], "Eleven"),
  listen("Podcast episode", "Episode twelve discusses whether artificial intelligence can replace teachers.", "What is discussed?", ["Sports", "AI and teaching", "Cooking", "Travel only"], "AI and teaching"),
  listen("Parking fine", "Failure to display a valid permit may result in an eighty-pound fine.", "What happens without a permit?", ["Nothing", "A possible fine", "Free parking", "Tow only"], "A possible fine"),
  listen("Lecture cancellation", "Professor Webb's lecture has been cancelled due to illness and will be rescheduled.", "Why was it cancelled?", ["No room", "Illness", "Holiday", "Strike"], "Illness"),
  listen("Contract signing", "Both parties must sign the contract before work commences on site.", "When must they sign?", ["After work finishes", "Before work commences", "Never", "Next year"], "Before work commences"),
  listen("Volunteer training", "All new volunteers must attend safeguarding training on the first Saturday of each month.", "When is training?", ["Every day", "First Saturday of each month", "Never", "Fridays only"], "First Saturday of each month"),
  listen("Ship arrival", "The cargo vessel is expected to dock at six tomorrow morning, weather permitting.", "When is arrival expected?", ["Tonight", "Six tomorrow morning", "Next week", "Unknown"], "Six tomorrow morning"),
  listen("Language requirement", "The position requires fluency in Spanish and willingness to travel abroad.", "What language is required?", ["French", "Spanish", "German", "Chinese"], "Spanish"),
  listen("Budget announcement", "The committee approved a ten per cent increase in the arts budget.", "Which budget increased?", ["Defence", "Arts", "Transport only", "None"], "Arts"),
  listen("Safety briefing", "Hard hats must be worn at all times in the construction zone.", "What must be worn?", ["Gloves only", "Hard hats", "Boots only", "Nothing"], "Hard hats"),
];

const writing = [
  write("Essay — big city", "Discuss the advantages and disadvantages of living in a big city.\n\nWrite 140–190 words.", 190, "B2 essay structure."),
  write("Report — school facilities", "Your teacher asked you to write a report about facilities at your school.\n\nWrite 140–190 words.", 190, "Formal/neutral report."),
  write("Essay — technology in education", "Technology in education: advantages and disadvantages.\n\nWrite 140–190 words.", 190, "B2 essay."),
  write("Essay — zoos", "Your class discussed whether zoos should exist. Write an essay giving opinions and examples.\n\nWrite 140–190 words.", 190, "Mock B2 First."),
  write("Proposal", "Write a proposal to improve the school library.\n\nWrite 140–190 words.", 190, "B2 proposal."),
  write("Review — film", "Write a review of a film you have seen recently.\n\nWrite 140–190 words.", 190, "B2 review."),
  write("Article — volunteering", "Write an article about the benefits of volunteering for young people.\n\nWrite 140–190 words.", 190, "Magazine article."),
  write("Letter of complaint", "Write a letter complaining about a delayed delivery and asking for compensation.\n\nWrite 140–190 words.", 190, "Formal letter."),
  write("Essay — public transport", "Should public transport be free for students? Discuss.\n\nWrite 140–190 words.", 190, "Opinion essay."),
  write("Report — local event", "Write a report about a cultural event in your area.\n\nWrite 140–190 words.", 190, "Neutral report."),
];

const speaking = [
  speak("Social media", "How has social media changed the way people form friendships? Discuss advantages and risks.", 15, 120),
  speak("Skill to learn", "Talk about a skill you'd like to learn. Why is it important and how would you learn it?", 15, 120),
  speak("Work-life balance", "Is it possible to achieve a good work-life balance today? Discuss.", 15, 120),
  speak("Climate action", "What responsibility do individuals have for tackling climate change?", 15, 120),
  speak("Advertising", "How does advertising influence what people buy?", 15, 120),
  speak("Education system", "What would you change about the education system in your country?", 15, 120),
  speak("Tourism", "Discuss the effects of tourism on local communities.", 15, 120),
  speak("Art and culture", "How important is art in everyday life?", 15, 120),
  speak("Remote work future", "Will most jobs be remote in the future? Give reasons.", 15, 120),
  speak("Role model", "Describe someone you admire and explain why.", 15, 120),
];

const uoe = [
  gap("Third conditional", "Had I known about the traffic, I ___ (would have left) earlier.", "would have left"),
  gap("Passive reporting", "She is believed ___ (to leave) the country.", "to leave"),
  gap("Hardly", "Hardly ___ (had) we sat down when the phone rang.", "had"),
  gap("So...that", "The proposal was ___ (so) controversial that it was rejected.", "so"),
  gap("Would sooner", "I'd sooner ___ (die) than apologize to him.", "die"),
  gap("Not until", "Not until later ___ (did I) realise the mistake.", "did I"),
  gap("Need + gerund", "The car needs ___ (checking) before the trip.", "checking"),
  gap("Under no circumstances", "___ (Under) no circumstances should you open that door.", "Under"),
  gap("As if past", "She spoke as if she ___ (knew) everything.", "knew"),
  gap("Accused of", "He was accused ___ (of) lying.", "of"),
  gap("Little did", "Little ___ (did) they know what awaited them.", "did"),
  gap("It's time past", "It's time the government ___ (took) action.", "took"),
  gap("That clause", "The report confirms ___ (that) emissions have fallen.", "that"),
  gap("Despite gerund", "Despite ___ (feeling) tired, she continued working.", "feeling"),
  gap("Provided that", "You can go provided ___ (that) you finish your work.", "that"),
  gap("No sooner", "No sooner ___ (had) he arrived than the meeting started.", "had"),
  gap("Were to", "If she ___ (were) to resign, the project would suffer.", "were"),
  gap("Owing to", "The flight was delayed owing ___ (to) fog.", "to"),
  gap("Prevent object", "Nothing could prevent him ___ (from) going.", "from"),
  gap("In case", "Take an umbrella in ___ (case) it rains.", "case"),
  gap("Unless", "Unless you ___ (hurry), you'll miss the train.", "hurry"),
  gap("Rather than", "I'd walk rather ___ (than) wait for the bus.", "than"),
  gap("Scarcely", "Scarcely ___ (had) the concert begun when the lights went out.", "had"),
  gap("Supposed to", "You were supposed ___ (to) call me.", "to"),
  gap("Charged with", "She was charged ___ (with) fraud.", "with"),
  gap("In spite of", "In spite ___ (of) the difficulties, they succeeded.", "of"),
  gap("Were it not", "Were it ___ (not) for your help, I would have failed.", "not"),
  gap("Only after", "Only after the exam ___ (did) she relax.", "did"),
  gap("But for", "But ___ (for) the rain, we would have gone out.", "for"),
  gap("On no account", "On no account ___ (should) you share your password.", "should"),
];

export const FCE_BANK: LevelBank = { reading, listening, writing, speaking, uoe };
