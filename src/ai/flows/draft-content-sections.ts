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

You are provided with an outline for a piece of content, and your task is to generate an initial draft for each section of the outline.

Topic: {{{topic}}}

Outline:
{{#each outline}}
- {{{this}}}
{{/each}}

Generate a draft for each section, providing a solid starting point for the user's writing.

Output in JSON format:

{
  "sections": [
    {{#each outline}}
    {
      "title": "{{this}}",
      "draft": ""
    }
    {{#unless @last}},
    {{/unless}}
    {{/each}}
  ]
}
`,
});

const draftContentSectionsFlow = ai.defineFlow(
  {
    name: 'draftContentSectionsFlow',
    inputSchema: DraftContentSectionsInputSchema,
    outputSchema: DraftContentSectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Parse the generated content to ensure type safety and proper structure
    let parsedOutput: DraftContentSectionsOutput;
    try {
      parsedOutput = JSON.parse(output!.text) as DraftContentSectionsOutput;

      // Iterate through sections to generate content for each
      for (const section of parsedOutput.sections) {
        const sectionDraft = await ai.generate({
          prompt: `Write a draft for the section titled '${section.title}' for the topic ${input.topic}`,
        });
        section.draft = sectionDraft.text;
      }
    } catch (error) {
      console.error('Failed to parse or process content:', error);
      throw new Error('Failed to parse or process the generated content.');
    }

    return parsedOutput;
  }
);
