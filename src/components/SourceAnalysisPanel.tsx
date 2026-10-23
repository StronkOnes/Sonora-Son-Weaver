/**
 * SONORA SongWeaver - Source Material & Musical Analysis Panel
 * Handles MIDI/Audio loop upload, real audio spectral flux analysis, and track role assignments.
 */

import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  Music2,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import { SongProject, TrackRole, Track } from '../types/music';
import { parseStandardMidiFile } from '../services/midi/smfParser';
import { analyzeAudioFile } from '../services/audio/audioAnalysis';
import { generateArrangementConcepts, applyArrangementConcept } from '../services/arrangement/arrangementEngine';

interface SourceAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  project: SongProject;
  onUpdateProject: (proj: SongProject) => void;
  onLoadDemo: (type: 'amapiano' | 'hiphop') => void;
}

const ROLES: TrackRole[] = ['drums', 'log-drum', 'bass', 'chords', 'melody', 'texture', 'unassigned'];

export const SourceAnalysisPanel: React.FC<SourceAnalysisPanelProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  onLoadDemo,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.mid') || fileName.endsWith('.midi')) {
        // Parse Standard MIDI File
        const arrayBuffer = await file.arrayBuffer();
        const parsed = parseStandardMidiFile(arrayBuffer);

        const newProject: SongProject = {
          id: `proj_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          version: '1.0.0',
          tempo: parsed.bpm,
          timeSignature: parsed.timeSignature,
          ppq: parsed.ppq,
          totalBars: parsed.totalBars,
          sourceBars: parsed.totalBars,
          activeArrangementStyle: 'build',
          tracks: parsed.tracks,
          sections: [
            {
              id: 'sec_source_1',
              name: 'Original Loop',
              type: 'main-a',
              startBar: 1,
              durationBars: parsed.totalBars,
              energyTarget: 75,
              trackActivity: parsed.tracks.reduce((acc, t) => ({ ...acc, [t.id]: true }), {}),
              musicalIntention: 'Imported loop material',
            },
          ],
          clips: parsed.clips,
          sourceClips: [...parsed.clips],
          randomSeed: 12345,
          userLevel: project.userLevel,
          userNotes: `Imported from ${file.name}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Automatically generate 3 arrangements
        const concepts = generateArrangementConcepts(newProject);
        const finalProject = applyArrangementConcept(newProject, concepts[0]);

        onUpdateProject(finalProject);
      } else if (
        fileName.endsWith('.wav') ||
        fileName.endsWith('.mp3') ||
        fileName.endsWith('.ogg') ||
        fileName.endsWith('.flac')
      ) {
        // Real Audio File Analysis
        const result = await analyzeAudioFile(file);

        const updatedProject: SongProject = {
          ...project,
          tempo: result.estimatedBpm,
          audioAnalysis: result,
          referenceAudioName: file.name,
          updatedAt: new Date().toISOString(),
        };

        onUpdateProject(updatedProject);
      } else {
        throw new Error('Unsupported format. Please upload a Standard MIDI file (.mid) or audio file (.wav, .mp3).');
      }
    } catch (err) {
      setAnalysisError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRoleChange = (trackId: string, newRole: TrackRole) => {
    const updatedTracks = project.tracks.map((t) => {
      if (t.id === trackId) {
        return { ...t, role: newRole };
      }
      return t;
    });

    onUpdateProject({
      ...project,
      tracks: updatedTracks,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#10121a] border border-[#2b3040] rounded-xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232733] flex items-center justify-between bg-[#0d0f16]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Music2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Source Material & Loop Analysis</h2>
              <p className="text-xs text-neutral-400">
                Inspect your original material or import custom MIDI/audio loops.
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* File Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#2b3348] hover:border-[#f59e0b] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#141722]/50 hover:bg-[#181c2b]"
          >
            <Upload className="w-8 h-8 text-[#f59e0b] mb-2" />
            <span className="text-sm font-semibold text-white">Import Loop File (MIDI or Audio)</span>
            <span className="text-xs text-neutral-400 mt-1 max-w-sm">
              Standard MIDI (.mid, .midi) or audio loops (.wav, .mp3, .ogg, .flac). Real spectral onset & tempo analysis.
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mid,.midi,.wav,.mp3,.ogg,.flac"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-xs text-[#f59e0b] bg-[#f59e0b]/10 p-3 rounded-lg border border-[#f59e0b]/30">
              <div className="w-4 h-4 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
              <span>Analyzing musical events, onset energy flux, and tempo autocorrelation...</span>
            </div>
          )}

          {analysisError && (
            <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/40 p-3 rounded-lg border border-rose-500/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Quick Demo Loop Selectors */}
          <div className="bg-[#141620] border border-[#232733] rounded-lg p-4">
            <span className="text-xs font-bold text-neutral-300 block mb-2 uppercase tracking-wider">
              Quick Test Demos
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onLoadDemo('amapiano');
                  onClose();
                }}
                className="text-left p-3 rounded-lg bg-[#181c28] hover:bg-[#202536] border border-[#2a3144] transition flex flex-col"
              >
                <span className="text-xs font-bold text-[#f59e0b]">Soweto Sunset (Amapiano 8-Bar)</span>
                <span className="text-[11px] text-neutral-400 mt-0.5">
                  5 stems: Log drum, Drums & Shakers, Rhodes chords, Flute lead (114 BPM)
                </span>
              </button>

              <button
                onClick={() => {
                  onLoadDemo('hiphop');
                  onClose();
                }}
                className="text-left p-3 rounded-lg bg-[#181c28] hover:bg-[#202536] border border-[#2a3144] transition flex flex-col"
              >
                <span className="text-xs font-bold text-emerald-400">Brooklyn Rain (Hip-Hop 4-Bar)</span>
                <span className="text-[11px] text-neutral-400 mt-0.5">
                  Boom-bap drums, sub bass, vintage keys (88 BPM)
                </span>
              </button>
            </div>
          </div>

          {/* Audio Analysis Result Display if available */}
          {project.audioAnalysis && (
            <div className="bg-[#12141c] border border-blue-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileAudio className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">
                    Audio Analysis: {project.audioAnalysis.fileName}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {project.audioAnalysis.bpmConfidence}% Confidence
                </span>
              </div>

              {/* Peak Waveform Canvas */}
              <div className="h-16 bg-[#0a0b0e] rounded border border-[#232733] p-1 flex items-center justify-between space-x-[1px]">
                {project.audioAnalysis.peakWaveform.map((p, idx) => {
                  const h = Math.max(4, p * 58);
                  return (
                    <div
                      key={idx}
                      style={{ height: `${h}px` }}
                      className="flex-1 bg-blue-500/80 rounded-[1px]"
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-[#181b24] p-2 rounded border border-[#232733]">
                  <span className="text-[10px] text-neutral-400 block">Tempo</span>
                  <span className="font-bold text-white font-digital">{project.audioAnalysis.estimatedBpm} BPM</span>
                </div>
                <div className="bg-[#181b24] p-2 rounded border border-[#232733]">
                  <span className="text-[10px] text-neutral-400 block">Meter</span>
                  <span className="font-bold text-white font-digital">{project.audioAnalysis.meter}</span>
                </div>
                <div className="bg-[#181b24] p-2 rounded border border-[#232733]">
                  <span className="text-[10px] text-neutral-400 block">Detected Loop Length</span>
                  <span className="font-bold text-white font-digital">{project.audioAnalysis.detectedBars} Bars</span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400">
                {project.audioAnalysis.rhythmicActivityDescription}
              </p>
            </div>
          )}

          {/* Current Track Roles & Overrides */}
          <div>
            <span className="text-xs font-bold text-neutral-300 block mb-2 uppercase tracking-wider">
              Track Musical Role Assignments
            </span>
            <div className="space-y-2">
              {project.tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-[#141620] border border-[#232733] p-2.5 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />
                    <span className="text-xs font-semibold text-white truncate">{track.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      ({track.notesCount || 0} notes)
                    </span>
                  </div>

                  <select
                    value={track.role}
                    onChange={(e) => handleRoleChange(track.id, e.target.value as TrackRole)}
                    className="bg-[#1c202d] text-xs text-neutral-200 border border-[#2f374c] rounded px-2 py-1 focus:outline-none focus:border-[#f59e0b]"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
