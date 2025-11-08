'use server';

/**
 * @fileOverview A flow for generating example sentences for vocabulary words using AI.
 *
 * - generateExampleSentences - A function that generates example sentences for a given word.
 * - GenerateExampleSentencesInput - The input type for the generateExampleSentences function.
 * - GenerateExampleSentencesOutput - The return type for the generateExampleSentences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExampleSentencesInputSchema = z.object({
  word: z.string().describe('The vocabulary word to generate example sentences for.'),
});
export type GenerateExampleSentencesInput = z.infer<typeof GenerateExampleSentencesInputSchema>;

const GenerateExampleSentencesOutputSchema = z.object({
  sentences: z
    .array(z.string())
    .describe('An array of example sentences for the given word.'),
});
export type GenerateExampleSentencesOutput = z.infer<typeof GenerateExampleSentencesOutputSchema>;

export async function generateExampleSentences(
  input: GenerateExampleSentencesInput
): Promise<GenerateExampleSentencesOutput> {
  return generateExampleSentencesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExampleSentencesPrompt',
  input: {schema: GenerateExampleSentencesInputSchema},
  output: {schema: GenerateExampleSentencesOutputSchema},
  prompt: `You are a helpful AI assistant that provides example sentences for given words.

  Generate 3 example sentences for the word: {{{word}}}.
  The sentences should be clear, concise, and demonstrate the word's usage in different contexts.
  Return the sentences as a JSON array.`,
});

const generateExampleSentencesFlow = ai.defineFlow(
  {
    name: 'generateExampleSentencesFlow',
    inputSchema: GenerateExampleSentencesInputSchema,
    outputSchema: GenerateExampleSentencesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
