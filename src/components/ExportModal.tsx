/**
 * SONORA SongWeaver - Export Modal
 * Exports Standard MIDI Files (Type 1 SMF) or project files with zero data loss.
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  FileCheck,
  Music,
  Layers,
  Sparkles,
  Save,
  Upload,
} from 'lucide-react';
import { SongProject } from '../types/music';
import { exportProjectToMidi, downloadMidiFile } from '../services/midi/smfWriter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: SongProject;
  selectedSectionId: string | null;
  onImportProjectFile: (project: SongProject) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  selectedSectionId,
  onImportProjectFile,
}) => {
  const [exportMode, setExportMode] = useState<'full' | 'single-track' | 'selected-section' | 'source-only'>('full');
  const [selectedTrackId, setSelectedTrackId] = useState<string>(project.tracks[0]?.id || '');

  if (!isOpen) return null;

  const handleExportMidi = () => {
    const data = exportProjectToMidi(project, {
      mode: exportMode,
      trackId: selectedTrackId,
      sectionId: selectedSectionId || project.sections[0]?.id,
    });

    let filename = `${project.name.replace(/\s+/g, '_')}_${exportMode}`;
    if (exportMode === 'single-track') {
      const track = project.tracks.find(t => t.id === selectedTrackId);
      if (track) filename += `_${track.name.replace(/\s+/g, '_')}`;
    }
    filename += '.mid';

    downloadMidiFile(data, filename);
  };

  const handleExportProjectJson = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.sonora`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tracks && parsed.sections && parsed.clips) {
          onImportProjectFile(parsed);
          onClose();
        } else {
          alert('Invalid .sonora project file format.');
        }
      } catch (err) {
        alert('Failed to parse project file: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#10121a] border border-[#2b3040] rounded-xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232733] flex items-center justify-between bg-[#0d0f16]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Arrangement & MIDI</h2>
              <p className="text-xs text-neutral-400">
                Generate Standard MIDI Files (Type 1 SMF) compatible with all DAWs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#1f2332] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Mode Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
              Export Mode
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setExportMode('full')}
                className={`p-3 rounded-lg border text-left transition flex flex-col ${
                  exportMode === 'full'
                    ? 'bg-[#181d2a] border-[#f59e0b] text-white shadow-sm'
                    : 'bg-[#141620] border-[#232733] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="font-bold text-neutral-100 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Full Arrangement</span>
                </span>
                <span className="text-[11px] text-neutral-400 mt-1">
                  Complete song ({project.totalBars} bars, all {project.tracks.length} tracks).
                </span>
              </button>

              <button
                onClick={() => setExportMode('single-track')}
                className={`p-3 rounded-lg border text-left transition flex flex-col ${
                  exportMode === 'single-track'
                    ? 'bg-[#181d2a] border-[#f59e0b] text-white shadow-sm'
                    : 'bg-[#141620] border-[#232733] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="font-bold text-neutral-100 flex items-center space-x-1.5">
                  <Music className="w-3.5 h-3.5 text-blue-400" />
                  <span>Single Stem / Track</span>
                </span>
                <span className="text-[11px] text-neutral-400 mt-1">
                  Export isolated track MIDI.
                </span>
              </button>

              <button
                onClick={() => setExportMode('selected-section')}
                className={`p-3 rounded-lg border text-left transition flex flex-col ${
                  exportMode === 'selected-section'
                    ? 'bg-[#181d2a] border-[#f59e0b] text-white shadow-sm'
                    : 'bg-[#141620] border-[#232733] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="font-bold text-neutral-100 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Selected Section</span>
                </span>
                <span className="text-[11px] text-neutral-400 mt-1">
                  Export only currently selected section.
                </span>
              </button>

              <button
                onClick={() => setExportMode('source-only')}
                className={`p-3 rounded-lg border text-left transition flex flex-col ${
                  exportMode === 'source-only'
                    ? 'bg-[#181d2a] border-[#f59e0b] text-white shadow-sm'
                    : 'bg-[#141620] border-[#232733] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="font-bold text-neutral-100 flex items-center space-x-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Source Material</span>
                </span>
                <span className="text-[11px] text-neutral-400 mt-1">
                  Untouched original {project.sourceBars}-bar loop.
                </span>
              </button>
            </div>
          </div>

          {/* Track selector if single-track mode */}
          {exportMode === 'single-track' && (
            <div className="bg-[#141620] p-3 rounded-lg border border-[#232733]">
              <span className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Select Track to Export:
              </span>
              <select
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
                className="w-full bg-[#1c202d] text-xs text-neutral-200 border border-[#2f374c] rounded px-3 py-2 focus:outline-none focus:border-[#f59e0b]"
              >
                {project.tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Technical Export Verification Notice */}
          <div className="text-[11px] text-neutral-400 bg-[#0d0f16] p-3 rounded-lg border border-[#1f2330] space-y-1">
            <span className="font-semibold text-neutral-300 block">SMF Format Specification:</span>
            <p>• Type 1 multi-track format with dedicated Conductor track (480 PPQ).</p>
            <p>• Correct note-on, note-off, delta-times, and bar grid alignment.</p>
            <p>• DAW-ready: Drag and drop directly into Ableton Live, Logic Pro, FL Studio, or Cubase.</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-[#1f2330] pt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportProjectJson}
                className="text-xs text-neutral-300 hover:text-white bg-[#181c28] hover:bg-[#202536] border border-[#282f42] px-3 py-2 rounded-lg transition flex items-center space-x-1.5"
                title="Save project state to .sonora file"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save .sonora Project</span>
              </button>

              <label className="text-xs text-neutral-300 hover:text-white bg-[#181c28] hover:bg-[#202536] border border-[#282f42] px-3 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Open .sonora</span>
                <input
                  type="file"
                  accept=".sonora,.json"
                  onChange={handleImportProjectJson}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={() => {
                handleExportMidi();
                onClose();
              }}
              className="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-bold rounded-lg transition flex items-center space-x-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download MIDI (.mid)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
