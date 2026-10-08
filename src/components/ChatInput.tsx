import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to 200px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-5 pt-2">
      <div className="relative rounded-2xl bg-neutral-900/90 border border-neutral-800 focus-within:border-neutral-700 focus-within:ring-1 focus-within:ring-indigo-500/30 shadow-lg shadow-black/40 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask MPK AI anything... (Supports English, हिन्दी & Hinglish)"
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent text-neutral-100 placeholder-neutral-500 text-sm sm:text-[15px] resize-none outline-none py-3.5 pl-4 pr-14 max-h-48 leading-relaxed selection:bg-neutral-800"
        />

        <div className="absolute right-2.5 bottom-2.5 flex items-center">
          {isStreaming ? (
            <button
              onClick={onStop}
              type="button"
              title="Stop generation"
              aria-label="Stop generating response"
              className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={onSend}
              type="button"
              disabled={!input.trim() || disabled}
              title="Send message"
              aria-label="Send message"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                input.trim() && !disabled
                  ? 'bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20 hover:opacity-90 active:scale-95'
                  : 'bg-neutral-800/80 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 px-1">
        <span>Press <kbd className="font-mono bg-neutral-900 border border-neutral-800 px-1 py-0.5 rounded text-[10px]">Enter</kbd> to send, <kbd className="font-mono bg-neutral-900 border border-neutral-800 px-1 py-0.5 rounded text-[10px]">Shift+Enter</kbd> for new line</span>
        <span className="hidden sm:inline">MPK AI can make mistakes. Verify important information.</span>
      </div>
    </div>
  );
};
