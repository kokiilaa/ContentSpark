'use server';

/**
 * @fileOverview A social media post generation AI agent.
 *
 * - generateSocialMediaPosts - A function that handles the social media post generation process.
 * - GenerateSocialMediaPostsInput - The input type for the generateSocialMediaPosts function.
 * - GenerateSocialMediaPostsOutput - The return type for the generateSocialMediaPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialMediaPostsInputSchema = z.object({
  content: z.string().describe('The full blog content to generate social media posts from.'),
});
export type GenerateSocialMediaPostsInput = z.infer<typeof GenerateSocialMediaPostsInputSchema>;

const GenerateSocialMediaPostsOutputSchema = z.object({
  posts: z.array(
    z.object({
      platform: z.string().describe('The target social media platform (e.g., Twitter, LinkedIn).'),
      post: z.string().describe('The generated social media post content.'),
    })
  ),
});
export type GenerateSocialMediaPostsOutput = z.infer<typeof GenerateSocialMediaPostsOutputSchema>;

export async function generateSocialMediaPosts(
  input: GenerateSocialMediaPostsInput
): Promise<GenerateSocialMediaPostsOutput> {
  return generateSocialMediaPostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSocialMediaPostsPrompt',
  input: {schema: GenerateSocialMediaPostsInputSchema},
  output: {schema: GenerateSocialMediaPostsOutputSchema},
  prompt: `You are a social media marketing expert. Based on the following content, generate 3 social media posts: one for Twitter (concise and with hashtags), one for LinkedIn (professional and engaging), and one general-purpose post suitable for Facebook or Instagram.

Content:
{{{content}}}`,
});

const generateSocialMediaPostsFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaPostsFlow',
    inputSchema: GenerateSocialMediaPostsInputSchema,
    outputSchema: GenerateSocialMediaPostsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
