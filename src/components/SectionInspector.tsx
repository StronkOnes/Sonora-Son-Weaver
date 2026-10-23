/**
 * SONORA SongWeaver - Section & Musical Inspector
 * Inspects selected section, controls track activity matrix, and executes isolated section regeneration.
 */

import React from 'react';
import {
  Sliders,
  RefreshCw,
  MinusCircle,
  PlusCircle,
  Zap,
  Feather,
  Lock,
  VolumeX,
  Volume2,
  Info,
  Check,
} from 'lucide-react';
import { Section, SongProject, Track } from '../types/music';

interface SectionInspectorProps {
  section: Section | null;
  project: SongProject;
  onUpdateEnergy: (sectionId: string, energy: number) => void;
  onToggleSectionTrack: (sectionId: string, trackId: string) => void;
  onSectionRegenerateAction: (
    sectionId: string,
    action: 'regenerate' | 'simpler' | 'busier' | 'energetic' | 'spacious' | 'preserve-melody' | 'mute-bass'
  ) => void;
  onClose: () => void;
}

export const SectionInspector: React.FC<SectionInspectorProps> = ({
  section,
  project,
  onUpdateEnergy,
  onToggleSectionTrack,
  onSectionRegenerateAction,
  onClose,
}) => {
  if (!section) {
    return (
      <div className="h-44 bg-[#0e1017] border-t border-[#232733] p-4 flex items-center justify-center text-xs text-neutral-500">
        <span>Click any section block on the top timeline to inspect and edit its musical properties.</span>
      </div>
    );
  }

  return (
    <div className="h-48 bg-[#0d0f15] border-t border-[#232733] px-4 py-3 flex flex-col justify-between overflow-x-auto select-none">
      {/* Top Row: Section Title, Position, Energy Slider, Close */}
      <div className="flex items-center justify-between border-b border-[#1c202c] pb-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white">{section.name}</span>
            <span className="text-[10px] text-[#f59e0b] bg-[#f59e0b]/15 border border-[#f59e0b]/30 px-2 py-0.5 rounded font-mono uppercase">
              {section.type}
            </span>
          </div>

          <span className="text-xs text-neutral-400 font-digital">
            Bars {section.startBar} – {section.startBar + section.durationBars - 1} ({section.durationBars} bars)
          </span>

          {section.musicalIntention && (
            <span className="text-[11px] text-neutral-400 italic hidden md:inline truncate max-w-sm">
              "{section.musicalIntention}"
            </span>
          )}
        </div>

        {/* Energy Target Slider */}
        <div className="flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span className="text-xs text-neutral-300 font-medium">Energy:</span>
          <input
            type="range"
            min={10}
            max={100}
            value={section.energyTarget}
            onChange={(e) => onUpdateEnergy(section.id, parseInt(e.target.value))}
            className="w-24 h-1.5 bg-[#232733] rounded appearance-none cursor-pointer"
          />
          <span className="text-xs font-digital font-bold text-[#f59e0b] w-9 text-right">
            {section.energyTarget}%
          </span>
        </div>
      </div>

      {/* Middle Row: Track Activity Matrix & 1-Click Variation Actions */}
      <div className="flex items-center justify-between space-x-6 py-2 overflow-x-auto">
        {/* Track Activity Profile Matrix */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
            Track Activity in this Section
          </span>
          <div className="flex items-center space-x-2">
            {project.tracks.map((track) => {
              const isActive = section.trackActivity[track.id] !== false;

              return (
                <button
                  key={track.id}
                  onClick={() => onToggleSectionTrack(section.id, track.id)}
                  className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs transition border ${
                    isActive
                      ? 'bg-[#181d2a] border-[#343e59] text-neutral-200'
                      : 'bg-[#10121a] border-[#1e2230] text-neutral-500 opacity-60 line-through'
                  }`}
                  title={`${isActive ? 'Active' : 'Muted'} in ${section.name}`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isActive ? track.color : '#475569' }}
                  />
                  <span className="truncate max-w-[100px]">{track.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Isolated Section Variation Actions */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
            Section Variation Actions (Isolated)
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onSectionRegenerateAction(section.id, 'regenerate')}
              className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-[#1a1e2b] hover:bg-[#252b3d] text-neutral-200 rounded border border-[#2b3348] transition"
              title="Regenerate this section variation"
            >
              <RefreshCw className="w-3 h-3 text-[#f59e0b]" />
              <span>Regen</span>
            </button>

            <button
              onClick={() => onSectionRegenerateAction(section.id, 'simpler')}
              className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-[#1a1e2b] hover:bg-[#252b3d] text-neutral-200 rounded border border-[#2b3348] transition"
              title="Make simpler by omitting syncopated filler notes"
            >
              <MinusCircle className="w-3 h-3 text-cyan-400" />
              <span>Simpler</span>
            </button>

            <button
              onClick={() => onSectionRegenerateAction(section.id, 'busier')}
              className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-[#1a1e2b] hover:bg-[#252b3d] text-neutral-200 rounded border border-[#2b3348] transition"
              title="Make busier with subdivisions and pickup notes"
            >
              <PlusCircle className="w-3 h-3 text-amber-400" />
              <span>Busier</span>
            </button>

            <button
              onClick={() => onSectionRegenerateAction(section.id, 'spacious')}
              className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-[#1a1e2b] hover:bg-[#252b3d] text-neutral-200 rounded border border-[#2b3348] transition"
              title="Make more spacious and atmospheric"
            >
              <Feather className="w-3 h-3 text-emerald-400" />
              <span>Spacious</span>
            </button>

            <button
              onClick={() => onSectionRegenerateAction(section.id, 'preserve-melody')}
              className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-[#1a1e2b] hover:bg-[#252b3d] text-neutral-200 rounded border border-[#2b3348] transition"
              title="Lock original melody pitches in this section"
            >
              <Lock className="w-3 h-3 text-purple-400" />
              <span>Lock Melody</span>
            </button>

            <button
              onClick={() => onSectionRegenerateAction(section.id, 'mute-bass')}
              className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-[#1a1e2b] hover:bg-[#252b3d] text-neutral-200 rounded border border-[#2b3348] transition"
              title="Drop bass and log-drum in this section"
            >
              <VolumeX className="w-3 h-3 text-rose-400" />
              <span>Drop Bass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
