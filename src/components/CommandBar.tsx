/**
 * SONORA SongWeaver - Natural Language Arrangement Command Bar
 * Translates producer instructions into structured, validated arrangement actions.
 */

import React, { useState } from 'react';
import { Send, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';
import { CommandExecutionResult } from '../types/music';

interface CommandBarProps {
  onExecuteCommand: (command: string) => void;
  lastResult: CommandExecutionResult | null;
}

const SUGGESTIONS = [
  'Make the intro 8 bars longer',
  'Remove the bass during the breakdown',
  'Give the hook more energy',
  'Make the second verse different',
  'Keep the melody unchanged',
  'Give me a shorter arrangement',
];

export const CommandBar: React.FC<CommandBarProps> = ({
  onExecuteCommand,
  lastResult,
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onExecuteCommand(input.trim());
    setInput('');
  };

  return (
    <div className="bg-[#0e1017] border-t border-[#232733] px-4 py-2.5 flex flex-col space-y-2">
      {/* Result explanation banner if recent command was executed */}
      {lastResult && (
        <div
          className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg border animate-in fade-in duration-150 ${
            lastResult.success
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="font-medium">{lastResult.message}</span>
        </div>
      )}

      {/* Input row + quick suggestions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 md:space-x-4">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell SongWeaver: e.g. 'Make the intro 8 bars longer', 'Give the hook more energy'..."
              className="w-full bg-[#141622] text-xs text-neutral-200 placeholder-neutral-500 px-3.5 py-2 pl-9 rounded-lg border border-[#2b3040] focus:border-[#f59e0b] focus:outline-none transition shadow-inner"
            />
            <Sparkles className="w-3.5 h-3.5 text-[#f59e0b] absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-bold rounded-lg transition flex items-center space-x-1.5 shadow"
          >
            <span>Apply</span>
            <Send className="w-3 h-3" />
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 text-[11px]">
          <span className="text-neutral-500 font-medium hidden lg:inline mr-1">Suggestions:</span>
          {SUGGESTIONS.slice(0, 3).map((sug, idx) => (
            <button
              key={idx}
              onClick={() => onExecuteCommand(sug)}
              className="whitespace-nowrap px-2.5 py-1 rounded bg-[#161924] hover:bg-[#202536] text-neutral-400 hover:text-neutral-200 border border-[#232733] transition"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
