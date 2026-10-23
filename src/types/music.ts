/**
 * SONORA SongWeaver - Core Musical Data Model
 * Version: 1.0.0
 * 
 * Defines standard project, track, clip, note, section, and arrangement types.
 */

export type TrackRole = 
  | 'drums'
  | 'bass'
  | 'log-drum'
  | 'chords'
  | 'melody'
  | 'texture'
  | 'audio-reference'
  | 'unassigned';

export type SectionType = 
  | 'intro'
  | 'verse'
  | 'main-a'
  | 'pre-chorus'
  | 'build'
  | 'chorus'
  | 'hook-a'
  | 'hook-b'
  | 'drop'
  | 'breakdown'
  | 'bridge'
  | 'instrumental'
  | 'outro'
  | 'custom';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export type ArrangementStyle = 'build' | 'atmospheric' | 'performance';

export type SongLengthPreset = 'short' | 'medium' | 'extended';

export interface MidiNote {
  id: string;
  pitch: number;      // MIDI pitch 0-127 (60 = C4)
  startTick: number;  // Ticks from clip start (PPQ = 480)
  durationTick: number; // Duration in ticks
  velocity: number;   // 0-127
}

export type ClipOrigin = 'original' | 'duplicated' | 'transformed' | 'generated' | 'user-edited';

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  startBar: number;   // 1-indexed bar number
  durationBars: number;
  notes: MidiNote[];
  origin: ClipOrigin;
  sourceClipId?: string;
  variationId?: string;
  isMuted?: boolean;
  isLocked?: boolean;
  transformationHistory?: string[];
}

export interface Track {
  id: string;
  name: string;
  role: TrackRole;
  color: string;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;     // 0.0 to 1.0 (default 0.8)
  pan: number;        // -1.0 (L) to +1.0 (R)
  midiChannel: number;// 0-15
  isSource: boolean;
  notesCount?: number;
}

export interface Section {
  id: string;
  name: string;
  type: SectionType;
  startBar: number;
  durationBars: number;
  energyTarget: number; // 0 - 100
  // Track ID -> active state (true = active, false = muted in this section)
  trackActivity: Record<string, boolean>;
  // Track ID -> variation intensity (0.0 to 1.0)
  variationSettings?: Record<string, number>;
  transitionType?: 'none' | 'fill' | 'mute-drop' | 'riser' | 'pickup';
  isLocked?: boolean;
  musicalIntention?: string;
}

export interface ArrangementConcept {
  id: string;
  style: ArrangementStyle;
  name: string;
  tagline: string;
  description: string;
  totalBars: number;
  estimatedDurationSeconds: number;
  sections: Section[];
  energyProfile: number[]; // Energy value per section
  variationCharacteristics: string[];
}

export interface AudioAnalysisResult {
  fileName: string;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  estimatedBpm: number;
  bpmConfidence: number; // 0 to 100%
  meter: string;         // e.g. "4/4"
  meterConfidence: number;
  detectedBars: number;
  detectedDownbeats: number[];
  energyProfile: number[]; // 0 to 1 normalized
  peakWaveform: number[];  // Array of normalized amplitude peaks (0.0 to 1.0)
  likelyPhraseBoundaryBar: number;
  rhythmicActivityDescription: string;
  summary: string;
}

export interface SongProject {
  id: string;
  name: string;
  version: string;
  tempo: number;         // BPM (e.g. 112)
  timeSignature: [number, number]; // [4, 4]
  ppq: number;           // Pulses (ticks) per quarter note (default 480)
  totalBars: number;
  sourceBars: number;    // Length of original loop in bars (e.g. 8)
  activeArrangementStyle: ArrangementStyle;
  tracks: Track[];
  sections: Section[];
  clips: Clip[];
  sourceClips: Clip[];   // Untouched original source material
  randomSeed: number;
  userLevel: UserLevel;
  userNotes: string;
  audioAnalysis?: AudioAnalysisResult;
  referenceAudioUrl?: string;
  referenceAudioName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  actionTaken: string;
  affectedSectionIds?: string[];
  affectedTrackIds?: string[];
}

export interface TestResultItem {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  details: string;
  durationMs: number;
}
