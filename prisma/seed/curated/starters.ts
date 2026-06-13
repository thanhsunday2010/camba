import { fromPassageSets, gap, listen, mcq, speak, write, type LevelBank } from "./types";

const reading = fromPassageSets([
  {
    title: "Tom's dog",
    passage:
      "This is Tom. He is seven years old. He has a small brown dog called Max. Max likes to play in the garden every afternoon.",
    questions: [
      mcq("Tom's dog", "How old is Tom?", ["Five", "Six", "Seven", "Eight"], "Seven"),
      mcq("Tom's dog", "What colour is the dog?", ["Black", "White", "Brown", "Grey"], "Brown"),
      mcq("Tom's dog", "What is the dog's name?", ["Tom", "Max", "Ben", "Sam"], "Max"),
      mcq("Tom's dog", "Where does Max like to play?", ["In the kitchen", "In the garden", "At school", "In the street"], "In the garden"),
      mcq("Tom's dog", "When does Max play?", ["Every morning", "Every afternoon", "At night", "On Sundays only"], "Every afternoon"),
    ],
  },
  {
    title: "Anna's classroom",
    passage:
      "Anna is in Class 2A. There is a big map on the wall and twelve desks in the room. Anna sits next to her friend Kim. Their teacher is Mrs Lee.",
    questions: [
      mcq("Anna's classroom", "Which class is Anna in?", ["1A", "2A", "2B", "3A"], "2A"),
      mcq("Anna's classroom", "What is on the wall?", ["A clock", "A map", "A photo", "A window"], "A map"),
      mcq("Anna's classroom", "How many desks are there?", ["Ten", "Eleven", "Twelve", "Fourteen"], "Twelve"),
      mcq("Anna's classroom", "Who sits next to Anna?", ["Ben", "Kim", "Tom", "Mrs Lee"], "Kim"),
      mcq("Anna's classroom", "Who is their teacher?", ["Mr Brown", "Mrs Lee", "Miss Park", "Mr Kim"], "Mrs Lee"),
    ],
  },
  {
    title: "At the zoo",
    passage:
      "Today our class went to the zoo. We saw elephants, monkeys and two big lions. My favourite animals were the funny penguins. We ate sandwiches for lunch.",
    questions: [
      mcq("At the zoo", "Where did the class go?", ["The park", "The zoo", "The beach", "The farm"], "The zoo"),
      mcq("At the zoo", "Which animals did they see?", ["Dogs and cats", "Elephants, monkeys and lions", "Fish only", "Birds only"], "Elephants, monkeys and lions"),
      mcq("At the zoo", "Which animals were favourite?", ["Lions", "Elephants", "Penguins", "Monkeys"], "Penguins"),
      mcq("At the zoo", "How were the penguins?", ["Scary", "Funny", "Sleepy", "Angry"], "Funny"),
      mcq("At the zoo", "What did they eat for lunch?", ["Pizza", "Sandwiches", "Soup", "Rice"], "Sandwiches"),
    ],
  },
  {
    title: "Birthday party",
    passage:
      "It is Sara's birthday. There are five children at the party. They eat chocolate cake and drink orange juice. Sara gets a new red bike from her grandma.",
    questions: [
      mcq("Birthday party", "How many children are at the party?", ["Three", "Four", "Five", "Six"], "Five"),
      mcq("Birthday party", "What do they eat?", ["Ice cream", "Chocolate cake", "Bread", "Apples"], "Chocolate cake"),
      mcq("Birthday party", "What do they drink?", ["Water", "Milk", "Orange juice", "Tea"], "Orange juice"),
      mcq("Birthday party", "What present does Sara get?", ["A doll", "A book", "A red bike", "A ball"], "A red bike"),
      mcq("Birthday party", "Who gives Sara the present?", ["Her mum", "Her dad", "Her grandma", "Her teacher"], "Her grandma"),
    ],
  },
  {
    title: "My house",
    passage:
      "We live in a small house. There are three bedrooms, one bathroom and a kitchen. My bedroom is blue. I sleep in a bed next to the window.",
    questions: [
      mcq("My house", "How many bedrooms are there?", ["Two", "Three", "Four", "Five"], "Three"),
      mcq("My house", "What colour is the child's bedroom?", ["Green", "Blue", "Yellow", "Pink"], "Blue"),
      mcq("My house", "Where is the bed?", ["Next to the door", "Next to the window", "Under the table", "In the kitchen"], "Next to the window"),
      mcq("My house", "How many bathrooms are there?", ["One", "Two", "Three", "None"], "One"),
      mcq("My house", "What kind of house is it?", ["Big", "Small", "Old castle", "Flat only"], "Small"),
    ],
  },
  {
    title: "Rainy day",
    passage:
      "It is raining today, so we cannot play football outside. We stay at home and read books. Later, Mum makes hot soup for lunch.",
    questions: [
      mcq("Rainy day", "What is the weather like?", ["Sunny", "Windy", "Raining", "Snowing"], "Raining"),
      mcq("Rainy day", "What can't they do?", ["Read books", "Play football outside", "Eat lunch", "Stay home"], "Play football outside"),
      mcq("Rainy day", "What do they do at home?", ["Watch TV only", "Read books", "Swim", "Cook alone"], "Read books"),
      mcq("Rainy day", "Who makes lunch?", ["Dad", "Mum", "The teacher", "Grandpa"], "Mum"),
      mcq("Rainy day", "What do they eat?", ["Pizza", "Hot soup", "Salad", "Cake"], "Hot soup"),
    ],
  },
  {
    title: "At the shop",
    passage:
      "Ben goes to the shop with his dad. They buy milk, bread and three yellow bananas. Ben also wants a small toy car, but they don't buy it today.",
    questions: [
      mcq("At the shop", "Who goes to the shop with Ben?", ["His mum", "His dad", "His sister", "His teacher"], "His dad"),
      mcq("At the shop", "How many bananas do they buy?", ["Two", "Three", "Four", "Five"], "Three"),
      mcq("At the shop", "What colour are the bananas?", ["Green", "Yellow", "Brown", "Red"], "Yellow"),
      mcq("At the shop", "What toy does Ben want?", ["A doll", "A ball", "A toy car", "A robot"], "A toy car"),
      mcq("At the shop", "Do they buy the toy car?", ["Yes", "No", "The text doesn't say", "They buy two"], "No"),
    ],
  },
  {
    title: "School lunch",
    passage:
      "Every day I eat lunch at school at twelve o'clock. Today there is rice, chicken and an apple. I drink water. My friend Leo has pasta.",
    questions: [
      mcq("School lunch", "What time is lunch?", ["Eleven o'clock", "Twelve o'clock", "One o'clock", "Two o'clock"], "Twelve o'clock"),
      mcq("School lunch", "Where does the child eat lunch?", ["At home", "At school", "In the park", "At the shop"], "At school"),
      mcq("School lunch", "What fruit is there today?", ["A banana", "An apple", "An orange", "Grapes"], "An apple"),
      mcq("School lunch", "What does the child drink?", ["Juice", "Milk", "Water", "Cola"], "Water"),
      mcq("School lunch", "What does Leo have?", ["Rice", "Pasta", "Soup", "Sandwich"], "Pasta"),
    ],
  },
  {
    title: "The park",
    passage:
      "On Sunday we go to the park. My little brother plays on the swings. I ride my bike on the path. There are many green trees and ducks on the lake.",
    questions: [
      mcq("The park", "When do they go to the park?", ["On Monday", "On Sunday", "Every day", "At night"], "On Sunday"),
      mcq("The park", "What does the little brother play on?", ["The slide", "The swings", "The seesaw", "The sand"], "The swings"),
      mcq("The park", "What does the writer ride?", ["A scooter", "A bike", "A bus", "A horse"], "A bike"),
      mcq("The park", "What colour are the trees?", ["Brown", "Green", "Yellow", "Red"], "Green"),
      mcq("The park", "What is on the lake?", ["Boats", "Ducks", "Fish only", "Nothing"], "Ducks"),
    ],
  },
  {
    title: "Getting dressed",
    passage:
      "It is cold this morning. I put on my coat, hat and boots before I go to school. My sister wears a pink dress because it is photo day.",
    questions: [
      mcq("Getting dressed", "What is the weather like?", ["Hot", "Cold", "Rainy only", "Windy only"], "Cold"),
      mcq("Getting dressed", "What does the writer put on?", ["Shorts and T-shirt", "Coat, hat and boots", "Swimming clothes", "Pyjamas"], "Coat, hat and boots"),
      mcq("Getting dressed", "Where is the writer going?", ["To the beach", "To school", "To bed", "To the shop"], "To school"),
      mcq("Getting dressed", "What does the sister wear?", ["Boots", "A pink dress", "A coat", "Jeans"], "A pink dress"),
      mcq("Getting dressed", "Why does the sister wear that?", ["It is sports day", "It is photo day", "It is raining", "It is hot"], "It is photo day"),
    ],
  },
  {
    title: "Pet shop",
    passage:
      "We visit the pet shop after school. There are white rabbits, colourful fish and a black cat sleeping in the window. I want a rabbit but we have a small flat.",
    questions: [
      mcq("Pet shop", "When do they visit the pet shop?", ["Before school", "After school", "At night", "On holiday"], "After school"),
      mcq("Pet shop", "What colour are the rabbits?", ["Brown", "White", "Black", "Grey"], "White"),
      mcq("Pet shop", "Where is the cat sleeping?", ["On a chair", "In the window", "Under a table", "Outside"], "In the window"),
      mcq("Pet shop", "What pet does the writer want?", ["A fish", "A cat", "A rabbit", "A dog"], "A rabbit"),
      mcq("Pet shop", "Why can't they get one?", ["They are too expensive", "They have a small flat", "The shop is closed", "They don't like pets"], "They have a small flat"),
    ],
  },
]);

// Standalone picture-style questions (Starters Part 1 style)
reading.push(
  mcq("Picture — cat", "Look at the picture. What animal is under the tree?", ["A dog", "A cat", "A horse", "A cow"], "A cat"),
  mcq("Picture — ball", "Look at the picture. What colour is the big ball?", ["Blue", "Green", "Red", "Black"], "Red"),
  mcq("Picture — apples", "Look at the picture. How many apples are on the table?", ["Two", "Three", "Four", "Six"], "Three"),
  mcq("Picture — book", "Look at the picture. Where is the book?", ["On the chair", "On the table", "Under the bed", "In the bag"], "On the table"),
  mcq("Picture — bus", "Look at the picture. How are the children going to school?", ["By car", "By bus", "By bike", "On foot"], "By bus"),
  mcq("Picture — weather", "Look at the picture. What is the weather like?", ["Rainy", "Snowy", "Sunny", "Windy"], "Sunny"),
  mcq("Picture — clothes", "Look at the picture. What is the girl wearing?", ["A coat", "A yellow dress", "Trousers", "Boots only"], "A yellow dress"),
  mcq("Picture — food", "Look at the picture. What are they eating?", ["Soup", "Pizza", "Sandwiches", "Rice"], "Sandwiches"),
  mcq("Picture — bedroom", "Look at the picture. Where do you sleep?", ["In the bathroom", "In the bedroom", "In the garden", "At school"], "In the bedroom"),
  mcq("Picture — happy", "Look at the picture. How does the boy feel?", ["Sad", "Angry", "Happy", "Tired"], "Happy")
);

const listening = [
  listen("Pen colour", "The pen is blue.", "What colour is the pen?", ["Red", "Blue", "Green", "Black"], "Blue"),
  listen("Birds", "I can see five birds in the tree.", "How many birds?", ["Three", "Four", "Five", "Six"], "Five"),
  listen("Cat place", "The cat is under the chair.", "Where is the cat?", ["On the table", "Under the chair", "In the box", "Behind the door"], "Under the chair"),
  listen("Apple", "Can I have an apple, please?", "What does the boy want?", ["A banana", "An apple", "Milk", "Bread"], "An apple"),
  listen("Morning", "Good morning! It is seven o'clock. Time for school.", "What time is it?", ["Six", "Seven", "Eight", "Nine"], "Seven"),
  listen("Robot", "This is my new robot. It can walk and talk.", "What is new?", ["A car", "A robot", "A ball", "A book"], "A robot"),
  listen("Friend Kim", "My friend's name is Kim. She is six years old.", "How old is Kim?", ["Five", "Six", "Seven", "Eight"], "Six"),
  listen("Park play", "Let's play in the park after lunch.", "When do they play?", ["Before lunch", "After lunch", "At night", "Never"], "After lunch"),
  listen("Fish pet", "Our fish is called Bubbles.", "What pet do they have?", ["A dog", "A cat", "A fish", "A rabbit"], "A fish"),
  listen("Cold hat", "Put on your hat. It is cold today.", "What should you wear?", ["Shoes", "A hat", "Shorts", "A T-shirt"], "A hat"),
  listen("Red bag", "My school bag is red.", "What colour is the bag?", ["Blue", "Green", "Red", "Yellow"], "Red"),
  listen("Two dogs", "There are two dogs in the garden.", "How many dogs?", ["One", "Two", "Three", "Four"], "Two"),
  listen("Milk", "I drink milk every morning.", "What does she drink in the morning?", ["Juice", "Water", "Milk", "Tea"], "Milk"),
  listen("Big house", "They live in a big house near the river.", "Where is the house?", ["Near the river", "Near the school", "In the city", "On a farm"], "Near the river"),
  listen("Football", "He likes playing football with his friends.", "What sport does he like?", ["Tennis", "Football", "Swimming", "Basketball"], "Football"),
  listen("Bedtime", "It is eight o'clock. Time to go to bed.", "What time is bedtime?", ["Seven", "Eight", "Nine", "Ten"], "Eight"),
  listen("Banana", "The monkey wants a yellow banana.", "What does the monkey want?", ["An apple", "A banana", "A carrot", "Bread"], "A banana"),
  listen("Teacher", "Miss Park is our English teacher.", "Who is the English teacher?", ["Mr Lee", "Miss Park", "Mrs Brown", "Mr Kim"], "Miss Park"),
  listen("Window", "Open the window, please. It is hot.", "Why open the window?", ["It is cold", "It is hot", "It is dark", "It is raining"], "It is hot"),
  listen("Birthday cake", "Happy birthday! Here is your chocolate cake.", "What kind of cake?", ["Fruit cake", "Chocolate cake", "Cheese cake", "No cake"], "Chocolate cake"),
  listen("Desk", "Your book is on the desk.", "Where is the book?", ["On the desk", "Under the chair", "In the bag", "On the floor"], "On the desk"),
  listen("Sister", "This is my sister. She is four.", "How old is the sister?", ["Three", "Four", "Five", "Six"], "Four"),
  listen("Rain", "Take your umbrella. It is raining.", "What should you take?", ["A hat", "An umbrella", "Sunglasses", "Gloves"], "An umbrella"),
  listen("Pizza", "We eat pizza on Fridays.", "When do they eat pizza?", ["Mondays", "Wednesdays", "Fridays", "Sundays"], "Fridays"),
  listen("Bird song", "Listen! The little bird is singing.", "What is the bird doing?", ["Sleeping", "Flying away", "Singing", "Eating"], "Singing"),
];

const writing = [
  write("About me", "Write 3 sentences about you.\n\n• Your name\n• Your age\n• Your favourite colour", 20, "Pre A1 Starters — simple sentences."),
  write("My family", "Write about your family.\n\n• How many people\n• One person you like\n• What you do together", 25, "Use short sentences."),
  write("My pet", "Write about a pet or an animal you like.\n\n• What is it?\n• What colour is it?\n• What does it like to do?", 25, "3–5 sentences."),
  write("My school", "Write about your school.\n\n• What is your teacher's name?\n• What is your favourite lesson?\n• What do you do at break time?", 30, "Pre A1 writing."),
  write("My favourite food", "Write about food you like.\n\n• What food do you like?\n• When do you eat it?\n• Who cooks it?", 25, "Simple present tense."),
  write("At the weekend", "Write about your weekend.\n\n• Where do you go?\n• Who do you go with?\n• What do you do?", 30, "Use 'I' sentences."),
  write("My room", "Write about your bedroom.\n\n• What colour is it?\n• What is in your room?\n• What do you do there?", 25, "Pre A1 vocabulary."),
  write("My friend", "Write about your best friend.\n\n• What is their name?\n• How old are they?\n• What do you like to do together?", 30, "Friendly tone."),
  write("The weather", "Write about today's weather.\n\n• Is it hot or cold?\n• What do you wear?\n• What can you do outside?", 25, "Present simple."),
  write("A happy day", "Write about a day you liked.\n\n• Where were you?\n• What did you see?\n• Why was it fun?", 30, "Past simple with help words OK."),
];

const speaking = [
  speak("About you", "What is your name? How old are you? What is your favourite toy?", 10, 45),
  speak("Your house", "Tell me about your house. How many rooms? What is your favourite room?", 10, 45),
  speak("Your family", "Tell me about your family. How many people? Who do you live with?", 10, 45),
  speak("Food", "What food do you like? What food don't you like? What do you eat for breakfast?", 10, 45),
  speak("Animals", "What animals do you like? Do you have a pet? Tell me about it.", 10, 45),
  speak("School", "What is your school like? What is your favourite lesson?", 10, 45),
  speak("Colours", "What is your favourite colour? What things are that colour at home?", 10, 45),
  speak("Sports and games", "What games do you play? Do you like football or swimming?", 10, 45),
  speak("Clothes", "What are you wearing today? What do you wear when it is cold?", 10, 45),
  speak("Birthday", "When is your birthday? What do you do on your birthday?", 10, 45),
];

export const STARTERS_BANK: LevelBank = { reading, listening, writing, speaking, uoe: [] };
