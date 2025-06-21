'use server';

import { generateContentIdeas } from '@/ai/flows/generate-content-ideas';
import { createContentOutline } from '@/ai/flows/create-content-outline';
import { draftContentSections } from '@/ai/flows/draft-content-sections';
import { parseOutline } from '@/lib/utils';

export async function generateIdeasAction(topic: string) {
  try {
    if (!topic) {
      return { error: 'Topic cannot be empty.' };
    }
    const result = await generateContentIdeas({ keyword: topic });
    return { data: result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to generate ideas.' };
  }
}

export async function createOutlineAction(idea: string) {
  try {
    if (!idea) {
      return { error: 'Content idea cannot be empty.' };
    }
    const result = await createContentOutline({ contentIdea: idea });
    return { data: result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to create outline.' };
  }
}

export async function draftSectionsAction(outline: string, topic: string) {
  try {
    if (!outline || !topic) {
      return { error: 'Outline and topic cannot be empty.' };
    }
    const outlineItems = parseOutline(outline);
    if (outlineItems.length === 0) {
      return {
        error:
          'Could not parse the outline. Please ensure it is a valid list format.',
      };
    }
    const result = await draftContentSections({
      outline: outlineItems,
      topic: topic,
    });
    return { data: result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to draft sections.' };
  }
}
