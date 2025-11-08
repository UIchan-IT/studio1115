import { z } from "zod";

export const WordSchema = z.object({
  id: z.string(),
  text: z.string(),
  definition: z.string(),
  exampleSentences: z.array(z.string()).optional(),
  masteryLevel: z.number().min(0).max(5).default(0).optional(),
  lastReviewed: z.string().datetime().nullable().optional(),
  mistakeCount: z.number().default(0).optional(),
});

export type Word = z.infer<typeof WordSchema>;

export const WordListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  ownerId: z.string(),
  createdAt: z.any().optional(), // Allow server timestamp
});

export type WordList = z.infer<typeof WordListSchema>;

export const StatsSchema = z.object({
    totalWords: z.number(),
    wordsLearned: z.number(),
    needsReview: z.number(),
});

export type Stats = z.infer<typeof StatsSchema>;
