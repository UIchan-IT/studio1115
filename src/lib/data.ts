import type { Word, WordList, Stats } from "./definitions";

const dummyWords1: Word[] = [
  {
    id: "word-1",
    text: "Ephemeral",
    definition: "Lasting for a very short time.",
    exampleSentences: ["The beauty of the cherry blossoms is ephemeral."],
    masteryLevel: 2,
    lastReviewed: "2023-10-26T10:00:00Z",
    mistakeCount: 1,
  },
  {
    id: "word-2",
    text: "Ubiquitous",
    definition: "Present, appearing, or found everywhere.",
    exampleSentences: ["Smartphones have become ubiquitous in modern society."],
    masteryLevel: 4,
    lastReviewed: "2023-10-27T10:00:00Z",
    mistakeCount: 0,
  },
  {
    id: "word-3",
    text: "Mellifluous",
    definition: "A sound that is sweet and smooth, pleasing to hear.",
    exampleSentences: [],
    masteryLevel: 0,
    lastReviewed: null,
    mistakeCount: 3,
  },
  {
    id: "word-4",
    text: "Pulchritudinous",
    definition: "Having great physical beauty.",
    exampleSentences: [],
    masteryLevel: 1,
    lastReviewed: "2023-10-25T10:00:00Z",
    mistakeCount: 5,
  },
];

const dummyWords2: Word[] = [
    {
      id: "word-5",
      text: "Serendipity",
      definition: "The occurrence and development of events by chance in a happy or beneficial way.",
      exampleSentences: ["Finding a forgotten twenty-dollar bill in an old coat pocket was a moment of pure serendipity."],
      masteryLevel: 5,
      lastReviewed: "2023-10-28T11:00:00Z",
      mistakeCount: 0,
    },
    {
      id: "word-6",
      text: "Nefarious",
      definition: "Wicked or criminal (typically of an action or activity).",
      exampleSentences: [],
      masteryLevel: 1,
      lastReviewed: "2023-10-22T15:00:00Z",
      mistakeCount: 2,
    },
    {
      id: "word-7",
      text: "Juxtaposition",
      definition: "The fact of two things being seen or placed close together with contrasting effect.",
      exampleSentences: ["The juxtaposition of old and new architecture in the city was striking."],
      masteryLevel: 3,
      lastReviewed: "2023-10-26T09:00:00Z",
      mistakeCount: 1,
    },
    {
      id: "word-8",
      text: "Lethargic",
      definition: "Affected by lethargy; sluggish and apathetic.",
      exampleSentences: [],
      masteryLevel: 0,
      lastReviewed: null,
      mistakeCount: 0,
    },
     {
      id: "word-9",
      text: "Eloquent",
      definition: "Fluent or persuasive in speaking or writing.",
      exampleSentences: ["The speaker delivered an eloquent and moving speech."],
      masteryLevel: 4,
      lastReviewed: "2023-10-27T14:00:00Z",
      mistakeCount: 0,
    },
];

const dummyWordLists: WordList[] = [
  {
    id: "list-1",
    name: "General Vocabulary",
    description: "A collection of interesting words.",
    createdAt: "2023-01-15T09:30:00Z",
    words: dummyWords1,
  },
  {
    id: "list-2",
    name: "Advanced English",
    description: "Words for expanding your vocabulary.",
    createdAt: "2023-02-20T14:00:00Z",
    words: dummyWords2,
  },
];

const dummyStats: Stats = {
    totalWords: dummyWordLists.reduce((sum, list) => sum + list.words.length, 0),
    wordsLearned: 3, // Assuming mastery level 4-5 is 'learned'
    needsReview: 4, // Assuming mastery level 1-3 needs review
};

// Simulate API calls
export const getWordLists = async (): Promise<WordList[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return dummyWordLists;
};

export const getWordListById = async (id: string): Promise<WordList | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return dummyWordLists.find(list => list.id === id);
}

export const getStats = async (): Promise<Stats> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return dummyStats;
}
