import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Sparkles,
  ChevronLeft,
  ShieldCheck,
  Search,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { Conversation, AppMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onOpenSettings,
  currentMode,
  onSelectMode,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartRename = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      onDeleteConversation(id);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 sm:w-80 bg-neutral-950 border-r border-neutral-850 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-neutral-850/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none">
                MPK AI
              </div>
              <div className="text-[11px] text-neutral-400 mt-1 leading-none">
                Your AI. Your World.
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 rounded-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Modes Navigation */}
        <div className="p-3 border-b border-neutral-850/60 space-y-1">
          <div className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            Workspaces
          </div>

          <button
            onClick={() => {
              onSelectMode('chat');
              if (window.innerWidth < 1024) onClose();
            }}
            type="button"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentMode === 'chat'
                ? 'bg-neutral-850 text-white font-semibold border border-neutral-750'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className={`w-4 h-4 ${currentMode === 'chat' ? 'text-indigo-400' : 'text-neutral-500'}`} />
              <span>AI Chat</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Gemini</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('image');
              if (window.innerWidth < 1024) onClose();
            }}
            type="button"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentMode === 'image'
                ? 'bg-indigo-950/50 text-white font-semibold border border-indigo-700/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ImageIcon className={`w-4 h-4 ${currentMode === 'image' ? 'text-indigo-400' : 'text-neutral-500'}`} />
              <span>Image Generator</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-medium">
              Free
            </span>
          </button>

          <button
            onClick={() => {
              onSelectMode('video');
              if (window.innerWidth < 1024) onClose();
            }}
            type="button"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentMode === 'video'
                ? 'bg-amber-950/40 text-white font-semibold border border-amber-700/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Video className={`w-4 h-4 ${currentMode === 'video' ? 'text-amber-400' : 'text-neutral-500'}`} />
              <span>Video Generator</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 font-medium">
              Unavailable
            </span>
          </button>
        </div>

        {/* New Chat Action (Shown in Chat mode) */}
        <div className="p-3">
          <button
            onClick={() => {
              if (currentMode !== 'chat') {
                onSelectMode('chat');
              }
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search filter if more than 3 chats */}
          {conversations.length > 3 && (
            <div className="mt-2.5 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-900/80 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
            </div>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase flex items-center justify-between">
            <span>Conversations</span>
            <span className="text-[10px] text-neutral-400">({conversations.length})</span>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-neutral-400 text-xs">
              {conversations.length === 0
                ? 'No past conversations yet. Start a new chat!'
                : 'No conversations match your search.'}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeId && currentMode === 'chat';
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (currentMode !== 'chat') {
                      onSelectMode('chat');
                    }
                    onSelectConversation(conv.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-neutral-850/90 text-white font-medium border border-neutral-750'
                      : 'text-neutral-300 hover:bg-neutral-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    <MessageSquare
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isActive ? 'text-indigo-400' : 'text-neutral-500 group-hover:text-neutral-400'
                      }`}
                    />

                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(e, conv.id)}
                        className="flex items-center gap-1 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          className="w-full bg-neutral-900 border border-indigo-500 text-white rounded px-1.5 py-0.5 text-xs focus:outline-none"
                        />
                        <button
                          type="submit"
                          onClick={(e) => handleSaveRename(e, conv.id)}
                          className="p-1 hover:text-emerald-400 text-neutral-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          className="p-1 hover:text-rose-400 text-neutral-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate text-xs">{conv.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => handleStartRename(e, conv)}
                        title="Rename"
                        className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, conv.id)}
                        title="Delete"
                        className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-neutral-850/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-2 py-1">
            <span className="flex items-center gap-1 text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Private & Local</span>
            </span>
            <span className="text-[10px] text-neutral-400">Zero Billing</span>
          </div>

          <button
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 transition-colors text-xs cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Settings & Preferences</span>
          </button>
        </div>
      </aside>
    </>
  );
};
