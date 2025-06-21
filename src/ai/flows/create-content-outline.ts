'use server';

/**
 * @fileOverview A content outline creation AI agent.
 *
 * - createContentOutline - A function that handles the content outline creation process.
 * - CreateContentOutlineInput - The input type for the createContentOutline function.
 * - CreateContentOutlineOutput - The return type for the createContentOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateContentOutlineInputSchema = z.object({
  contentIdea: z.string().describe('The content idea to generate an outline for.'),
});
export type CreateContentOutlineInput = z.infer<typeof CreateContentOutlineInputSchema>;

const CreateContentOutlineOutputSchema = z.object({
  outline: z.string().describe('The generated content outline.'),
});
export type CreateContentOutlineOutput = z.infer<typeof CreateContentOutlineOutputSchema>;

export async function createContentOutline(input: CreateContentOutlineInput): Promise<CreateContentOutlineOutput> {
  return createContentOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createContentOutlinePrompt',
  input: {schema: CreateContentOutlineInputSchema},
  output: {schema: CreateContentOutlineOutputSchema},
  prompt: `You are an expert content creator. Generate a detailed content outline with suggested sections and subtopics for the following content idea:\n\n{{contentIdea}}\n\nFormat the outline as a markdown list (using hyphens or asterisks for each item).`,
});

const createContentOutlineFlow = ai.defineFlow(
  {
    name: 'createContentOutlineFlow',
    inputSchema: CreateContentOutlineInputSchema,
    outputSchema: CreateContentOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
