export type MessageRole = 'user' | 'model';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export type ThemePreference = 'dark' | 'light' | 'system';
export type LanguagePreference = 'auto' | 'en' | 'hi' | 'hinglish';
export type FontSizePreference = 'sm' | 'base' | 'lg';

export interface AppSettings {
  theme: ThemePreference;
  languagePreference: LanguagePreference;
  fontSize: FontSizePreference;
}

export type AppMode = 'chat' | 'image' | 'video';

export interface GeneratedImage {
  id: string;
  prompt: string;
  enhancedPrompt?: string;
  url: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  style: string;
  seed: number;
  createdAt: number;
}
