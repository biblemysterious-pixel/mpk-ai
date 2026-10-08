import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Laptop,
  Languages,
  Trash2,
  Info,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AppSettings, ThemePreference, LanguagePreference } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearAllData: () => void;
  totalConversations: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllData,
  totalConversations,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    onClearAllData();
    setConfirmClear(false);
    onClose();
  };

  const themeOptions: Array<{ id: ThemePreference; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  const languageOptions: Array<{ id: LanguagePreference; title: string; subtitle: string }> = [
    { id: 'auto', title: 'Auto Detect', subtitle: 'Naturally adapts to your question' },
    { id: 'en', title: 'English', subtitle: 'Always respond in fluent English' },
    { id: 'hi', title: 'हिन्दी (Hindi)', subtitle: 'Always respond in natural Hindi' },
    { id: 'hinglish', title: 'Hinglish', subtitle: 'Casual conversational Hindi-English blend' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Settings & Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm">
          {/* Appearance / Theme */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = settings.theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onUpdateSettings({ theme: opt.id })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Preference */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Languages className="w-4 h-4 text-indigo-400" />
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Language Preference
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {languageOptions.map((lang) => {
                const isSelected = settings.languagePreference === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => onUpdateSettings({ languagePreference: lang.id })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs text-neutral-200">
                        {lang.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                        {lang.subtitle}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy & Storage */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Conversations & Storage
            </label>
            <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-200 font-medium">
                  Stored locally on this device
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {totalConversations} {totalConversations === 1 ? 'chat saved' : 'chats saved'} in your browser
                </div>
              </div>

              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  disabled={totalConversations === 0}
                  className="px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-rose-500/50 hover:bg-rose-950/30 text-neutral-400 hover:text-rose-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* About MPK AI */}
          <div className="border-t border-neutral-800 pt-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>About MPK AI</span>
            </div>
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/40 text-neutral-300 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">MPK AI</span>
                <span className="text-[11px] text-neutral-400 bg-neutral-850 px-2 py-0.5 rounded-md border border-neutral-750">
                  v1.0.0
                </span>
              </div>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                <strong className="text-neutral-300">"Your AI. Your World."</strong> is designed to empower your thinking, writing, coding, and problem-solving without cognitive friction.
              </p>
              <div className="flex items-center gap-1 text-[11px] text-neutral-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero tracking, 100% private local storage, powered by Gemini.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
