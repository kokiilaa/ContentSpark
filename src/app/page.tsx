'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { Lightbulb, List, FileText, Loader2, Wand2, Share2 } from 'lucide-react';
import {
  createOutlineAction,
  draftSectionsAction,
  generateIdeasAction,
  generateSocialPostsAction,
} from '@/app/actions';
import Header from '@/components/layout/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { DraftContentSectionsOutput } from '@/ai/flows/draft-content-sections';
import type { GenerateSocialMediaPostsOutput } from '@/ai/flows/generate-social-media-posts';

export default function Home() {
  const { toast } = useToast();

  const [topic, setTopic] = React.useState('');
  const [ideas, setIdeas] = React.useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = React.useState<string | null>(null);
  const [outline, setOutline] = React.useState<string | null>(null);
  const [drafts, setDrafts] =
    React.useState<DraftContentSectionsOutput['sections'] | null>(null);
  const [socialPosts, setSocialPosts] =
    React.useState<GenerateSocialMediaPostsOutput['posts'] | null>(null);

  const [isGeneratingIdeas, startGeneratingIdeas] = useTransition();
  const [isGeneratingOutline, startGeneratingOutline] = useTransition();
  const [isGeneratingDrafts, startGeneratingDrafts] = useTransition();
  const [isGeneratingSocial, startGeneratingSocial] = useTransition();

  const handleGenerateIdeas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic) {
      toast({
        title: 'Error',
        description: 'Please enter a topic to generate ideas.',
        variant: 'destructive',
      });
      return;
    }
    startGeneratingIdeas(async () => {
      setIdeas([]);
      setSelectedIdea(null);
      setOutline(null);
      setDrafts(null);
      setSocialPosts(null);
      const result = await generateIdeasAction(topic);
      if (result.error) {
        toast({
          title: 'Error generating ideas',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setIdeas(result.data?.ideas ?? []);
      }
    });
  };

  const handleSelectIdea = (idea: string) => {
    setSelectedIdea(idea);
    setOutline(null);
    setDrafts(null);
    setSocialPosts(null);
    startGeneratingOutline(async () => {
      const result = await createOutlineAction(idea);
      if (result.error) {
        toast({
          title: 'Error generating outline',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setOutline(result.data?.outline ?? null);
      }
    });
  };

  const handleGenerateDrafts = async () => {
    if (!outline || !selectedIdea) return;
    setSocialPosts(null);
    startGeneratingDrafts(async () => {
      const result = await draftSectionsAction(outline, selectedIdea);
      if (result.error) {
        toast({
          title: 'Error generating drafts',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setDrafts(result.data?.sections ?? null);
      }
    });
  };

  const handleGenerateSocialPosts = async () => {
    if (!drafts) return;
    startGeneratingSocial(async () => {
      setSocialPosts(null);
      const fullContent = drafts.map((d) => d.draft).join('\n\n');
      const result = await generateSocialPostsAction(fullContent);
      if (result.error) {
        toast({
          title: 'Error generating social posts',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setSocialPosts(result.data?.posts ?? null);
      }
    });
  };

  const IdeaIcon = isGeneratingIdeas ? Loader2 : Lightbulb;
  const OutlineIcon = isGeneratingOutline ? Loader2 : List;
  const DraftIcon = isGeneratingDrafts ? Loader2 : FileText;
  const SocialIcon = isGeneratingSocial ? Loader2 : Share2;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Idea Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdeaIcon
                  className={cn(
                    'h-6 w-6',
                    isGeneratingIdeas && 'animate-spin'
                  )}
                />
                1. Generate Ideas
              </CardTitle>
              <CardDescription>
                Enter a topic or keyword to brainstorm content ideas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateIdeas} className="space-y-4">
                <Input
                  placeholder="e.g., 'The Future of AI'"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGeneratingIdeas}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGeneratingIdeas}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Ideas
                </Button>
              </form>
              <div className="mt-6 space-y-2">
                {isGeneratingIdeas &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                {!isGeneratingIdeas &&
                  ideas.map((idea, index) => (
                    <Button
                      key={index}
                      variant={selectedIdea === idea ? 'secondary' : 'ghost'}
                      className="w-full h-auto text-left justify-start whitespace-normal"
                      onClick={() => handleSelectIdea(idea)}
                    >
                      {idea}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Column 2: Outline Creation */}
          <Card
            className={cn(
              !selectedIdea && 'opacity-50 pointer-events-none'
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <OutlineIcon
                  className={cn(
                    'h-6 w-6',
                    isGeneratingOutline && 'animate-spin'
                  )}
                />
                2. Create Outline
              </CardTitle>
              <CardDescription>
                An outline based on your selected idea.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGeneratingOutline && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}
              {outline && (
                <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                  {outline}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Column 3: Drafting Assistance */}
          <Card
            className={cn(!outline && 'opacity-50 pointer-events-none')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DraftIcon
                  className={cn(
                    'h-6 w-6',
                    isGeneratingDrafts && 'animate-spin'
                  )}
                />
                3. Draft Content
              </CardTitle>
              <CardDescription>
                Generate drafts for each section of your outline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGenerateDrafts}
                className="w-full mb-6"
                disabled={isGeneratingDrafts || !outline}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGeneratingDrafts ? 'Drafting...' : 'Generate All Drafts'}
              </Button>
              {isGeneratingDrafts && (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                    </div>
                 </div>
              )}
              {drafts && (
                <Accordion type="single" collapsible className="w-full">
                  {drafts.map((section, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{section.title}</AccordionTrigger>
                      <AccordionContent className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                        {section.draft}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Column 4: Social Media Posts */}
          <Card
            className={cn(!drafts && 'opacity-50 pointer-events-none')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SocialIcon
                  className={cn(
                    'h-6 w-6',
                    isGeneratingSocial && 'animate-spin'
                  )}
                />
                4. Generate Social Posts
              </CardTitle>
              <CardDescription>
                Create social media posts from your generated content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGenerateSocialPosts}
                className="w-full mb-6"
                disabled={isGeneratingSocial || !drafts}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGeneratingSocial ? 'Generating...' : 'Generate Social Posts'}
              </Button>
              {isGeneratingSocial && (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                    </div>
                 </div>
              )}
              {socialPosts && (
                <Accordion type="single" collapsible className="w-full">
                  {socialPosts.map((socialPost, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{socialPost.platform}</AccordionTrigger>
                      <AccordionContent className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                        {socialPost.post}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
