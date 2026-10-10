import React from 'react';
import { Menu, Plus, Settings2, Trash2, Sparkles, MessageSquare, Image as ImageIcon, Video } from 'lucide-react';
import { AppSettings, AppMode } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onClearCurrentChat: () => void;
  hasMessages: boolean;
  settings: AppSettings;
  conversationTitle?: string;
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  onOpenSettings,
  onClearCurrentChat,
  hasMessages,
  settings,
  conversationTitle,
  currentMode,
  onSelectMode,
}) => {
  return (
    <header className="h-14 sm:h-16 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          type="button"
          aria-label="Toggle conversation drawer"
          className="p-2 -ml-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/10 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                MPK AI
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-neutral-400 border border-neutral-800 bg-neutral-900/60 px-2 py-0.5 rounded-full">
                Your AI. Your World.
              </span>
            </div>
            {currentMode === 'chat' ? (
              conversationTitle ? (
                <span className="text-[11px] text-neutral-400 truncate max-w-[130px] sm:max-w-xs">
                  {conversationTitle}
                </span>
              ) : (
                <span className="text-[11px] text-neutral-400 sm:hidden">
                  Your AI. Your World.
                </span>
              )
            ) : currentMode === 'image' ? (
              <span className="text-[11px] text-indigo-400 font-medium">Image Studio (Free)</span>
            ) : (
              <span className="text-[11px] text-amber-400 font-medium">Video Studio (Unavailable)</span>
            )}
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="hidden md:flex items-center bg-neutral-900/90 border border-neutral-800 p-1 rounded-xl">
        <button
          onClick={() => onSelectMode('chat')}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentMode === 'chat'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => onSelectMode('image')}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentMode === 'image'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
          <span>Image Generator</span>
        </button>

        <button
          onClick={() => onSelectMode('video')}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentMode === 'video'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-amber-400" />
          <span>Video Generator</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {currentMode === 'chat' && hasMessages && (
          <button
            onClick={onClearCurrentChat}
            type="button"
            title="Clear this conversation"
            aria-label="Clear this conversation"
            className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {currentMode === 'chat' && (
          <button
            onClick={onNewChat}
            type="button"
            title="New conversation"
            aria-label="New conversation"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          type="button"
          title="Settings"
          aria-label="Open settings"
          className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
