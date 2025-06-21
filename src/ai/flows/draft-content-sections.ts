'use server';

/**
 * @fileOverview A content section drafting AI agent.
 *
 * - draftContentSections - A function that handles the drafting of content sections based on an outline.
 * - DraftContentSectionsInput - The input type for the draftContentSections function.
 * - DraftContentSectionsOutput - The return type for the draftContentSections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftContentSectionsInputSchema = z.object({
  outline: z
    .array(z.string())
    .describe('An array of strings, where each string is a section title in the content outline.'),
  topic: z.string().describe('The overall topic or theme of the content.'),
});
export type DraftContentSectionsInput = z.infer<typeof DraftContentSectionsInputSchema>;

const DraftContentSectionsOutputSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().describe('The title of the content section.'),
      draft: z.string().describe('The AI-generated draft for the content section.'),
    })
  ),
});
export type DraftContentSectionsOutput = z.infer<typeof DraftContentSectionsOutputSchema>;

export async function draftContentSections(input: DraftContentSectionsInput): Promise<DraftContentSectionsOutput> {
  return draftContentSectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftContentSectionsPrompt',
  input: {schema: DraftContentSectionsInputSchema},
  output: {schema: DraftContentSectionsOutputSchema},
  prompt: `You are an expert content writer, skilled at creating engaging and informative content.

Your task is to generate an initial draft for each section of the outline provided for the given topic.

Topic: {{{topic}}}

Outline:
{{#each outline}}
- {{{this}}}
{{/each}}

For each section in the outline, write a compelling and well-written draft. Make sure to return a title and a draft for each section.`,
});

const draftContentSectionsFlow = ai.defineFlow(
  {
    name: 'draftContentSectionsFlow',
    inputSchema: DraftContentSectionsInputSchema,
    outputSchema: DraftContentSectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
