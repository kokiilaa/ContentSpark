'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating content ideas based on a keyword or topic.
 *
 * The flow takes a keyword or topic as input and returns a list of content ideas.
 * @param {GenerateContentIdeasInput} input - The input object containing the keyword or topic.
 * @returns {Promise<GenerateContentIdeasOutput>} - A promise that resolves to the list of content ideas.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentIdeasInputSchema = z.object({
  keyword: z
    .string()
    .describe('The keyword or topic to generate content ideas for.'),
});
export type GenerateContentIdeasInput = z.infer<
  typeof GenerateContentIdeasInputSchema
>;

const GenerateContentIdeasOutputSchema = z.object({
  ideas: z
    .array(z.string())
    .describe('A list of content ideas based on the keyword or topic.'),
});
export type GenerateContentIdeasOutput = z.infer<
  typeof GenerateContentIdeasOutputSchema
>;

export async function generateContentIdeas(
  input: GenerateContentIdeasInput
): Promise<GenerateContentIdeasOutput> {
  return generateContentIdeasFlow(input);
}

const generateContentIdeasPrompt = ai.definePrompt({
  name: 'generateContentIdeasPrompt',
  input: {schema: GenerateContentIdeasInputSchema},
  output: {schema: GenerateContentIdeasOutputSchema},
  prompt: `You are a content creation expert. Generate 5 content ideas based on the following keyword or topic: {{{keyword}}}. Return the ideas as a JSON array of strings.  Do not include any introductory or concluding sentences.  Do not include numbers or bullet points.  Each idea should be concise and descriptive.

Ideas:`,
});

const generateContentIdeasFlow = ai.defineFlow(
  {
    name: 'generateContentIdeasFlow',
    inputSchema: GenerateContentIdeasInputSchema,
    outputSchema: GenerateContentIdeasOutputSchema,
  },
  async input => {
    const {output} = await generateContentIdeasPrompt(input);
    return output!;
  }
);
