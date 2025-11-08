import { z } from "zod";

export const WordSchema = z.object({
  id: z.string(),
  text: z.string(),
  definition: z.string(),
  exampleSentences: z.array(z.string()),
  masteryLevel: z.number().min(0).max(5), // SRS level
  lastReviewed: z.string().datetime().nullable(),
  mistakeCount: z.number().default(0),
});

export type Word = z.infer<typeof WordSchema>;

export const WordListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  words: z.array(WordSchema),
});

export type WordList = z.infer<typeof WordListSchema>;

export const StatsSchema = z.object({
    totalWords: z.number(),
    wordsLearned: z.number(),
    needsReview: z.number(),
});

export type Stats = z.infer<typeof StatsSchema>;
