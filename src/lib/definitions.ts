
import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional().nullable(),
  createdAt: z.any(),
  totalTestCount: z.number().default(0),
  score: z.number().default(0),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;


export const UserWordProgressSchema = z.object({
  id: z.string(),
  masteryLevel: z.number().min(0).max(5).default(0),
  lastReviewed: z.string().datetime().nullable().optional(),
  mistakeCount: z.number().default(0),
  testCount: z.number().default(0),
});

export type UserWordProgress = z.infer<typeof UserWordProgressSchema>;

export const WordSchema = z.object({
  id: z.string(),
  text: z.string(),
  definition: z.string(),
  exampleSentences: z.array(z.string()).optional(),
  // User-specific progress is now stored in a separate document.
  progress: UserWordProgressSchema.optional(),
});

export type Word = z.infer<typeof WordSchema>;

export const WordListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  ownerId: z.string(),
  isPublic: z.boolean().default(false).optional(),
  createdAt: z.any().optional(), // Allow server timestamp
});

export type WordList = z.infer<typeof WordListSchema>;

export const StatsSchema = z.object({
    totalWords: z.number(),
    wordsLearned: z.number(),
    needsReview: z.number(),
});

export type Stats = z.infer<typeof StatsSchema>;

export const SessionResultSchema = z.object({
  word: WordSchema,
  isCorrect: z.boolean(),
});

export type SessionResult = z.infer<typeof SessionResultSchema>;

export const BadgeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.any(), // Lucide icon component
});
export type Badge = z.infer<typeof BadgeSchema>;

export const UserBadgeSchema = z.object({
    id: z.string(), // This will be the badge ID
    earnedOn: z.any(), // serverTimestamp
});
export type UserBadge = z.infer<typeof UserBadgeSchema>;
