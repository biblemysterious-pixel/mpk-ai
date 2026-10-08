import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  loadStoredConversations,
  saveStoredConversations,
  loadActiveChatId,
  saveActiveChatId,
  loadAppSettings,
  saveAppSettings,
  clearAllConversations,
  generateTitleFromPrompt,
} from './lib/storage';
import { Conversation, Message, AppSettings } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { EmptyState } from './components/EmptyState';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadStoredConversations()
  );
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveChatId());
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef<boolean>(false);

  // Sync active conversation
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Persist conversations
  useEffect(() => {
    saveStoredConversations(conversations);
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    saveActiveChatId(activeId);
  }, [activeId]);

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
    saveAppSettings(settings);
  }, [settings]);

  // Scroll detection to avoid snapping if user scrolled up
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    userScrolledUpRef.current = distanceToBottom > 120;
  };

  const scrollToBottom = useCallback((force = false) => {
    if (force || !userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [activeConversation?.messages, scrollToBottom]);

  // Keyboard shortcut Ctrl/Cmd + K for New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setActiveId(null);
    setInput('');
    userScrolledUpRef.current = false;
  };

  const handleSelectConversation = (id: string) => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setActiveId(id);
    userScrolledUpRef.current = false;
    setTimeout(() => scrollToBottom(true), 50);
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearCurrentChat = () => {
    if (!activeId) return;
    if (confirm('Clear all messages in this conversation?')) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, messages: [], updatedAt: Date.now() } : c))
      );
    }
  };

  const handleClearAllData = () => {
    clearAllConversations();
    setConversations([]);
    setActiveId(null);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Turn off streaming indicator on current conversation
    if (activeId) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const updatedMessages = c.messages.map((m) =>
            m.isStreaming ? { ...m, isStreaming: false } : m
          );
          return { ...c, messages: updatedMessages };
        })
      );
    }
  };

  // Core stream message handler
  const executeGeneration = async (
    conversationId: string,
    historyMessages: Message[],
    aiMessageId: string
  ) => {
    setIsStreaming(true);
    userScrolledUpRef.current = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: historyMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          languagePreference: settings.languagePreference,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = 'Failed to get response from server.';
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          // ignore parsing error
        }
        throw new Error(errorMsg);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported by server response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataPayload = trimmed.slice(5).trim();
          if (dataPayload === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataPayload);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;

              // Update the target message in state
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== conversationId) return c;
                  return {
                    ...c,
                    updatedAt: Date.now(),
                    messages: c.messages.map((m) =>
                      m.id === aiMessageId
                        ? { ...m, content: accumulatedText, isStreaming: true }
                        : m
                    ),
                  };
                })
              );
              scrollToBottom(false);
            }
          } catch (e: unknown) {
            if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
              console.warn('SSE parsing issue:', e);
            }
          }
        }
      }

      // Stream successfully finished
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) =>
              m.id === aiMessageId ? { ...m, isStreaming: false } : m
            ),
          };
        })
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User intentionally aborted
        return;
      }
      const errMessage = err instanceof Error ? err.message : 'Something went wrong';
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) =>
              m.id === aiMessageId
                ? {
                    ...m,
                    content: `Error: ${errMessage}. Please try again.`,
                    isStreaming: false,
                    isError: true,
                  }
                : m
            ),
          };
        })
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Send message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    setInput('');

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const aiMessageId = crypto.randomUUID();
    const initialAiMessage: Message = {
      id: aiMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    let targetChatId = activeId;
    let targetHistory: Message[] = [];

    if (!targetChatId) {
      // Create new conversation
      targetChatId = crypto.randomUUID();
      const newTitle = generateTitleFromPrompt(text);
      const newConversation: Conversation = {
        id: targetChatId,
        title: newTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage, initialAiMessage],
      };

      setConversations((prev) => [newConversation, ...prev]);
      setActiveId(targetChatId);
      targetHistory = [userMessage];
    } else {
      // Append to current conversation
      const current = conversations.find((c) => c.id === targetChatId);
      targetHistory = current ? [...current.messages, userMessage] : [userMessage];

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetChatId) return c;
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...c.messages, userMessage, initialAiMessage],
          };
        })
      );
    }

    executeGeneration(targetChatId, targetHistory, aiMessageId);
  };

  // Regenerate last AI response
  const handleRegenerate = () => {
    if (!activeConversation || isStreaming) return;
    const msgs = activeConversation.messages;
    if (msgs.length === 0) return;

    // Find the last user message and trim the messages list up to that point
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const trimmedHistory = msgs.slice(0, lastUserIndex + 1);
    const newAiMessageId = crypto.randomUUID();
    const newAiMessage: Message = {
      id: newAiMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: [...trimmedHistory, newAiMessage],
        };
      })
    );

    executeGeneration(activeConversation.id, trimmedHistory, newAiMessageId);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* Sidebar / Mobile Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-neutral-950">
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClearCurrentChat={handleClearCurrentChat}
          hasMessages={Boolean(activeConversation && activeConversation.messages.length > 0)}
          settings={settings}
          conversationTitle={activeConversation?.title}
        />

        {/* Messages or Empty State */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto flex flex-col select-text"
        >
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <EmptyState onSelectPrompt={(promptText) => handleSendMessage(promptText)} />
          ) : (
            <div className="py-4 space-y-1">
              {activeConversation.messages.map((msg, index) => {
                const isLast = index === activeConversation.messages.length - 1;
                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isLast={isLast}
                    isStreaming={msg.isStreaming}
                    onRegenerate={isLast && msg.role === 'model' ? handleRegenerate : undefined}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          onStop={handleStopGeneration}
          isStreaming={isStreaming}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearAllData={handleClearAllData}
        totalConversations={conversations.length}
      />
    </div>
  );
}
