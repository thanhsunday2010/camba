import type { SeedDifficulty } from "../../../src/lib/exam/question-diversity";

export type VarContext = {
  idx: number;
  name: string;
  name2: string;
  place: string;
  place2: string;
  topic: string;
  topic2: string;
  age: number;
  time: string;
  food: string;
  animal: string;
  color: string;
  difficulty: SeedDifficulty;
};

const NAMES = [
  "Tom", "Anna", "Ben", "Lily", "Sara", "Jack", "Emma", "Leo", "Mia", "Noah",
  "Olivia", "Lucas", "Sophie", "Daniel", "Chloe", "Minh", "Lan", "Huy", "Linh", "An",
];

const PLACES = [
  "school", "park", "library", "museum", "beach", "zoo", "market", "hospital",
  "cinema", "restaurant", "station", "airport", "garden", "supermarket", "café",
];

const TOPICS = [
  "recycling", "football", "music", "cooking", "photography", "volunteering",
  "science", "history", "travel", "environment", "technology", "art", "reading",
  "swimming", "drama", "chess", "gardening", "cycling", "films", "languages",
  "health", "weather", "festivals", "wildlife", "space", "fashion", "debate",
  "journalism", "architecture", "robotics",
];

const TIMES = ["7:30", "8:00", "8:15", "9:30", "10:45", "12:00", "2:30", "4:15", "5:00", "6:30"];
const FOODS = ["apple", "banana", "bread", "rice", "pizza", "soup", "salad", "chicken", "fish", "cake"];
const ANIMALS = ["cat", "dog", "bird", "fish", "rabbit", "horse", "lion", "monkey", "penguin", "elephant"];
const COLORS = ["red", "blue", "green", "yellow", "orange", "purple", "black", "white", "brown", "pink"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

export function buildVarContext(idx: number, difficulty: SeedDifficulty, templateIdx = 0): VarContext {
  return {
    idx,
    name: pick(NAMES, idx),
    name2: pick(NAMES, idx + 5),
    place: pick(PLACES, idx + 2),
    place2: pick(PLACES, idx + 7),
    topic: pick(TOPICS, idx + templateIdx * 13),
    topic2: pick(TOPICS, idx + templateIdx * 17 + 5),
    age: 6 + (idx % 12),
    time: pick(TIMES, idx + templateIdx),
    food: pick(FOODS, idx),
    animal: pick(ANIMALS, idx),
    color: pick(COLORS, idx),
    difficulty,
  };
}

export function difficultyForIndex(idx: number, templateIdx: number): SeedDifficulty {
  const mix = (idx + templateIdx * 7) % 10;
  if (mix <= 3) return "easy";
  if (mix <= 7) return "medium";
  return "hard";
}
