import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Message } from '../types';
import { MarkdownView } from './MarkdownView';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast,
  onRegenerate,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy response:', e);
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`py-4 px-3 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-neutral-900/30 border-y border-neutral-850/40'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 shadow-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-sm shadow-purple-500/20 ring-1 ring-white/10">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-neutral-200">
              {isUser ? 'You' : 'MPK AI'}
            </span>
            <span className="text-[10px] text-neutral-400">{formattedTime}</span>
            {!isUser && isStreaming && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                Thinking...
              </span>
            )}
          </div>

          {/* Error display */}
          {message.isError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-rose-200 mb-0.5">Response error</div>
                <div>{message.content}</div>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Try again</span>
                  </button>
                )}
              </div>
            </div>
          ) : isUser ? (
            <div className="text-neutral-100 text-[15px] leading-relaxed whitespace-pre-wrap select-text font-normal">
              {message.content}
            </div>
          ) : (
            <div className="text-neutral-200">
              <MarkdownView content={message.content} />
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 align-middle animate-cursor-blink" />
              )}
            </div>
          )}

          {/* Action toolbar for AI messages */}
          {!isUser && !message.isError && message.content && (
            <div className="flex items-center gap-1 mt-3 pt-2 text-xs text-neutral-400">
              <button
                onClick={handleCopy}
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-800 hover:text-neutral-200 transition-colors cursor-pointer"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {isLast && onRegenerate && !isStreaming && (
                <button
                  onClick={onRegenerate}
                  type="button"
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-800 hover:text-neutral-200 transition-colors cursor-pointer"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
