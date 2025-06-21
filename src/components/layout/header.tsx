import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="px-4 md:px-8 py-4 border-b">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">ContentSpark</h1>
      </div>
    </header>
  );
}
