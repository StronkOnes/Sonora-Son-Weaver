/**
 * SONORA SongWeaver - Top Workstation Header
 */

import React from 'react';
import {
  Undo2,
  Redo2,
  Download,
  FolderOpen,
  FlaskConical,
  Sparkles,
  Music2,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import { SongProject, UserLevel } from '../types/music';

interface HeaderProps {
  project: SongProject;
  onUpdateProjectName: (name: string) => void;
  userLevel: UserLevel;
  onChangeUserLevel: (level: UserLevel) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenConcepts: () => void;
  onOpenSourceModal: () => void;
  onOpenExportModal: () => void;
  onOpenTestModal: () => void;
  onLoadDemo: (type: 'amapiano' | 'hiphop') => void;
  isSaved: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProjectName,
  userLevel,
  onChangeUserLevel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenConcepts,
  onOpenSourceModal,
  onOpenExportModal,
  onOpenTestModal,
  onLoadDemo,
  isSaved,
}) => {
  return (
    <header className="h-14 bg-[#0d0f14] border-b border-[#232733] px-4 flex items-center justify-between select-none">
      {/* Brand & Wordmark */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <span className="font-extrabold tracking-[0.25em] text-white text-base">SONORA</span>
            <span className="text-[10px] font-semibold tracking-wider text-[#f59e0b] bg-[#f59e0b]/15 border border-[#f59e0b]/30 px-1.5 py-0.5 rounded ml-2 uppercase">
              SongWeaver
            </span>
          </div>
          <span className="text-xs text-neutral-500 font-mono hidden md:inline">v1.0.0</span>
        </div>

        <div className="h-4 w-px bg-[#232733] mx-1" />

        {/* Project Name editable */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={project.name}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            className="bg-transparent hover:bg-[#181b24] focus:bg-[#181b24] text-neutral-200 text-sm font-medium px-2 py-1 rounded border border-transparent hover:border-[#2b3040] focus:border-[#f59e0b]/50 focus:outline-none transition max-w-[200px] md:max-w-[280px] truncate"
            title="Click to rename project"
          />
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border ${
              isSaved
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}
          >
            {isSaved ? 'Saved' : 'Auto-saving...'}
          </span>
        </div>
      </div>

      {/* Middle: User Level Selector */}
      <div className="hidden lg:flex items-center bg-[#14161f] p-0.5 rounded-lg border border-[#232733]">
        {(['beginner', 'intermediate', 'advanced'] as UserLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => onChangeUserLevel(level)}
            className={`text-xs px-2.5 py-1 rounded-md capitalize transition font-medium ${
              userLevel === level
                ? 'bg-[#232733] text-[#f59e0b] shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Right Controls: Undo/Redo, Demo switcher, Concepts, Tests, Export */}
      <div className="flex items-center space-x-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#14161f] rounded-md border border-[#232733] p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition ${
              canUndo ? 'text-neutral-300 hover:text-white hover:bg-[#232733]' : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition ${
              canRedo ? 'text-neutral-300 hover:text-white hover:bg-[#232733]' : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Load Demo Dropdown */}
        <div className="relative group">
          <button
            className="flex items-center space-x-1.5 text-xs text-neutral-300 hover:text-white bg-[#14161f] hover:bg-[#1d212b] border border-[#232733] px-2.5 py-1.5 rounded-md transition"
            title="Load authentic demo loops"
          >
            <Music2 className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="hidden sm:inline">Demos</span>
          </button>
          <div className="absolute right-0 top-full mt-1 w-56 bg-[#14161f] border border-[#232733] rounded-md shadow-2xl py-1 hidden group-hover:block z-50">
            <button
              onClick={() => onLoadDemo('amapiano')}
              className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-[#232733] flex flex-col"
            >
              <span className="font-semibold text-[#f59e0b]">Amapiano 8-Bar Loop</span>
              <span className="text-[10px] text-neutral-400">Log drum, Rhodes 9th chords, Flute lead (114 BPM)</span>
            </button>
            <button
              onClick={() => onLoadDemo('hiphop')}
              className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-[#232733] flex flex-col border-t border-[#232733]"
            >
              <span className="font-semibold text-emerald-400">Hip-Hop Soul 4-Bar</span>
              <span className="text-[10px] text-neutral-400">Boom-bap drums, Rhodes, Sub bass (88 BPM)</span>
            </button>
          </div>
        </div>

        {/* Source & Analysis Button */}
        <button
          onClick={onOpenSourceModal}
          className="flex items-center space-x-1.5 text-xs text-neutral-300 hover:text-white bg-[#14161f] hover:bg-[#1d212b] border border-[#232733] px-2.5 py-1.5 rounded-md transition"
          title="Inspect imported loop source and audio analysis"
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Source Material</span>
        </button>

        {/* 3 Concepts Button */}
        <button
          onClick={onOpenConcepts}
          className="flex items-center space-x-1.5 text-xs text-neutral-200 bg-[#1c202a] hover:bg-[#262c3a] border border-[#f59e0b]/40 px-3 py-1.5 rounded-md transition shadow-sm font-medium"
          title="View & Audition the 3 Arrangement Concepts"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Arrangement Concepts</span>
        </button>

        {/* Test Suite Button (Section 19 Verification) */}
        <button
          onClick={onOpenTestModal}
          className="flex items-center space-x-1.5 text-xs text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 px-2.5 py-1.5 rounded-md transition"
          title="Run Section 19 Automated Engine Tests"
        >
          <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Engine Tests</span>
        </button>

        {/* Export MIDI Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center space-x-1.5 text-xs font-semibold text-black bg-[#f59e0b] hover:bg-[#d97706] px-3 py-1.5 rounded-md transition shadow-md"
          title="Export Standard MIDI File (.mid) or Stems"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export MIDI</span>
        </button>
      </div>
    </header>
  );
};
