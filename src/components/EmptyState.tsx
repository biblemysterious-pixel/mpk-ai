import React from 'react';
import { Sparkles, BookOpen, PenTool, Lightbulb, GraduationCap, Globe2 } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
}

const EXAMPLE_PROMPTS = [
  {
    title: 'Explain something to me',
    subtitle: 'Break down complex quantum physics or how neural networks work',
    prompt: 'Explain how neural networks learn in simple, clear terms with an intuitive analogy.',
    icon: BookOpen,
    accent: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/40',
    iconColor: 'text-blue-400',
  },
  {
    title: 'Help me write a story',
    subtitle: 'Plot a suspenseful mystery thriller set in cyberpunk Neo-Delhi',
    prompt: 'Write an atmospheric opening scene for a mystery thriller set in futuristic Neo-Delhi in 2045.',
    icon: PenTool,
    accent: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40',
    iconColor: 'text-purple-400',
  },
  {
    title: 'Create a business idea',
    subtitle: 'Brainstorm innovative AI-first SaaS startup models with revenue paths',
    prompt: 'Brainstorm 3 innovative AI startup concepts solving real problems for creators and small businesses.',
    icon: Lightbulb,
    accent: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20 hover:border-amber-500/40',
    iconColor: 'text-amber-400',
  },
  {
    title: 'Teach me a new skill',
    subtitle: 'Step-by-step roadmap to master fullstack web development or data science',
    prompt: 'Teach me the core foundations of modern TypeScript and async patterns in 5 practical steps.',
    icon: GraduationCap,
    accent: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full">
      {/* Brand Badge */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/20 ring-1 ring-white/10">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          MPK AI
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto">
          Your AI. Your World.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 mt-2">
          <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Speaks English, हिन्दी & Hinglish fluently</span>
        </div>
      </div>

      {/* Suggested Prompts Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        {EXAMPLE_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`p-4 rounded-xl border bg-gradient-to-b ${item.accent} text-left transition-all hover:scale-[1.01] hover:shadow-lg focus:outline-none cursor-pointer flex flex-col justify-between group`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 ${item.iconColor} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-neutral-200 group-hover:text-white transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
