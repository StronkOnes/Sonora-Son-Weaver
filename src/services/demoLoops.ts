/**
 * SONORA SongWeaver - Bundled High-Production Demo Loops
 * Provides instant authentic multi-track loops for immediate testing and auditioning.
 */

import { MidiNote, SongProject, Track, Clip } from '../types/music';

const PPQ = 480;
const TICKS_PER_BEAT = PPQ;
const TICKS_PER_BAR = PPQ * 4; // 1920 ticks in 4/4

function createNote(pitch: number, startTick: number, durationTick: number, velocity: number = 96): MidiNote {
  return {
    id: `note_${Math.random().toString(36).substring(2, 9)}`,
    pitch,
    startTick,
    durationTick,
    velocity,
  };
}

/**
 * 1. Amapiano Groove (8 Bars, 114 BPM)
 * Authentic Amapiano log drum rhythm, syncopated shakers, jazzy 9th Rhodes chords, and flute lead.
 */
export function createAmapianoDemoProject(): SongProject {
  const bpm = 114;
  const totalBars = 8;

  // Track 1: Drums (Shakers, Kick, Rimshot)
  const drumNotes: MidiNote[] = [];
  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * TICKS_PER_BAR;

    // Kick: Bars 1-8 (punchy groove, subtle Amapiano syncopation)
    drumNotes.push(createNote(36, barStart, PPQ * 0.8, 108));
    drumNotes.push(createNote(36, barStart + PPQ * 1.75, PPQ * 0.6, 95));
    drumNotes.push(createNote(36, barStart + PPQ * 2.5, PPQ * 0.7, 102));

    // Snare / Rimshot on beat 2 and 4
    drumNotes.push(createNote(38, barStart + PPQ * 1, PPQ * 0.5, 98));
    drumNotes.push(createNote(38, barStart + PPQ * 3, PPQ * 0.5, 100));

    // 16th note Shaker groove with velocity accents
    for (let s = 0; s < 16; s++) {
      const isAccent = (s % 4 === 2) || (s === 14);
      const vel = isAccent ? 88 : 55;
      drumNotes.push(createNote(42, barStart + s * (PPQ / 4), PPQ / 6, vel));
    }

    // Turnaround fill at bar 4 and bar 8
    if (bar === 3 || bar === 7) {
      drumNotes.push(createNote(38, barStart + PPQ * 3.25, PPQ / 4, 85));
      drumNotes.push(createNote(38, barStart + PPQ * 3.5, PPQ / 4, 92));
      drumNotes.push(createNote(38, barStart + PPQ * 3.75, PPQ / 4, 112));
    }
  }

  // Track 2: Signature Amapiano Log Drum (pitched resonant sub bounce)
  // Pitches: Eb2 (39), F2 (41), Ab2 (44), Bb2 (46), C3 (48)
  const logDrumNotes: MidiNote[] = [];
  const logRhythms = [
    // Bar 1
    [{ p: 41, beat: 0.5, len: 0.4, v: 105 }, { p: 41, beat: 1.25, len: 0.35, v: 95 }, { p: 44, beat: 2.0, len: 0.5, v: 110 }, { p: 39, beat: 3.25, len: 0.45, v: 102 }],
    // Bar 2
    [{ p: 41, beat: 0.0, len: 0.4, v: 100 }, { p: 46, beat: 1.5, len: 0.35, v: 112 }, { p: 44, beat: 2.25, len: 0.4, v: 98 }, { p: 41, beat: 3.5, len: 0.35, v: 104 }],
    // Bar 3
    [{ p: 39, beat: 0.5, len: 0.4, v: 102 }, { p: 39, beat: 1.25, len: 0.35, v: 92 }, { p: 44, beat: 2.0, len: 0.5, v: 108 }, { p: 48, beat: 3.25, len: 0.4, v: 115 }],
    // Bar 4 (Turnaround roll)
    [{ p: 41, beat: 0.0, len: 0.4, v: 104 }, { p: 41, beat: 1.5, len: 0.35, v: 100 }, { p: 44, beat: 2.5, len: 0.3, v: 108 }, { p: 44, beat: 3.0, len: 0.25, v: 98 }, { p: 46, beat: 3.25, len: 0.25, v: 105 }, { p: 48, beat: 3.5, len: 0.25, v: 112 }, { p: 39, beat: 3.75, len: 0.25, v: 118 }],
  ];

  for (let bar = 0; bar < totalBars; bar++) {
    const pattern = logRhythms[bar % 4];
    const barStart = bar * TICKS_PER_BAR;
    for (const item of pattern) {
      logDrumNotes.push(createNote(item.p, barStart + Math.round(item.beat * PPQ), Math.round(item.len * PPQ), item.v));
    }
  }

  // Track 3: Warm Electric Piano Chords (Fm9 -> Bb13 -> Ebmaj9 -> Abmaj7)
  const chordNotes: MidiNote[] = [];
  const chordProg = [
    // Bar 1 & 5: Fm9 [F3, C4, Eb4, G4, Ab4] = [53, 60, 63, 67, 68]
    [53, 60, 63, 67, 68],
    // Bar 2 & 6: Bb13 [Bb2, Ab3, D4, G4] = [46, 56, 62, 67]
    [46, 56, 62, 67],
    // Bar 3 & 7: Ebmaj9 [Eb3, Bb3, D4, F4, G4] = [51, 58, 62, 65, 67]
    [51, 58, 62, 65, 67],
    // Bar 4 & 8: Abmaj7 [Ab3, C4, Eb4, G4] = [56, 60, 63, 67]
    [56, 60, 63, 67],
  ];

  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * TICKS_PER_BAR;
    const pitches = chordProg[bar % 4];
    // Syncopated comping on beat 0.5 and 2.5
    for (const p of pitches) {
      chordNotes.push(createNote(p, barStart + Math.round(0.5 * PPQ), Math.round(1.5 * PPQ), 78));
      chordNotes.push(createNote(p, barStart + Math.round(2.5 * PPQ), Math.round(1.2 * PPQ), 72));
    }
  }

  // Track 4: Melody / Flute Lead
  const melodyNotes: MidiNote[] = [];
  const leadPhraze = [
    // Bar 1
    { p: 72, b: 1.0, l: 0.5, v: 92 }, { p: 75, b: 1.75, l: 0.5, v: 98 }, { p: 77, b: 2.5, l: 1.0, v: 104 },
    // Bar 2
    { p: 75, b: 0.5, l: 0.5, v: 88 }, { p: 72, b: 1.25, l: 0.75, v: 86 }, { p: 70, b: 2.5, l: 1.2, v: 90 },
    // Bar 3
    { p: 67, b: 0.5, l: 0.5, v: 88 }, { p: 70, b: 1.5, l: 0.75, v: 92 }, { p: 72, b: 2.5, l: 1.2, v: 100 },
    // Bar 4
    { p: 75, b: 0.5, l: 0.4, v: 95 }, { p: 77, b: 1.25, l: 0.4, v: 98 }, { p: 79, b: 2.0, l: 0.75, v: 108 }, { p: 77, b: 3.0, l: 0.8, v: 94 }
  ];

  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * TICKS_PER_BAR;
    const offsetInGroup = bar % 4;
    // Notes corresponding to this bar
    const barNotes = leadPhraze.filter((_, idx) => Math.floor(idx / 3) === offsetInGroup || (offsetInGroup === 3 && idx >= 9));
    for (const n of barNotes) {
      melodyNotes.push(createNote(n.p, barStart + Math.round(n.b * PPQ), Math.round(n.l * PPQ), n.v));
    }
  }

  // Track 5: Ambient Pad
  const padNotes: MidiNote[] = [];
  for (let bar = 0; bar < totalBars; bar += 2) {
    const barStart = bar * TICKS_PER_BAR;
    padNotes.push(createNote(60, barStart, TICKS_PER_BAR * 2, 60)); // C4
    padNotes.push(createNote(63, barStart, TICKS_PER_BAR * 2, 60)); // Eb4
    padNotes.push(createNote(67, barStart, TICKS_PER_BAR * 2, 60)); // G4
  }

  const tracks: Track[] = [
    {
      id: 'track_drums',
      name: 'Amapiano Drums & Percs',
      role: 'drums',
      color: '#ef4444',
      isMuted: false,
      isSolo: false,
      volume: 0.85,
      pan: 0,
      midiChannel: 9,
      isSource: true,
      notesCount: drumNotes.length,
    },
    {
      id: 'track_logdrum',
      name: 'Resonant Log Drum',
      role: 'log-drum',
      color: '#f59e0b',
      isMuted: false,
      isSolo: false,
      volume: 0.9,
      pan: 0,
      midiChannel: 1,
      isSource: true,
      notesCount: logDrumNotes.length,
    },
    {
      id: 'track_chords',
      name: 'Rhodes 9th Chords',
      role: 'chords',
      color: '#3b82f6',
      isMuted: false,
      isSolo: false,
      volume: 0.75,
      pan: -0.2,
      midiChannel: 2,
      isSource: true,
      notesCount: chordNotes.length,
    },
    {
      id: 'track_melody',
      name: 'Flute / Whistle Lead',
      role: 'melody',
      color: '#10b981',
      isMuted: false,
      isSolo: false,
      volume: 0.8,
      pan: 0.2,
      midiChannel: 3,
      isSource: true,
      notesCount: melodyNotes.length,
    },
    {
      id: 'track_texture',
      name: 'Lush Atmosphere Pad',
      role: 'texture',
      color: '#8b5cf6',
      isMuted: false,
      isSolo: false,
      volume: 0.65,
      pan: 0,
      midiChannel: 4,
      isSource: true,
      notesCount: padNotes.length,
    },
  ];

  const sourceClips: Clip[] = [
    { id: 'clip_src_drums', trackId: 'track_drums', name: 'Drums [8-Bar Loop]', startBar: 1, durationBars: 8, notes: drumNotes, origin: 'original' },
    { id: 'clip_src_logdrum', trackId: 'track_logdrum', name: 'Log Drum [8-Bar Loop]', startBar: 1, durationBars: 8, notes: logDrumNotes, origin: 'original' },
    { id: 'clip_src_chords', trackId: 'track_chords', name: 'Rhodes [8-Bar Loop]', startBar: 1, durationBars: 8, notes: chordNotes, origin: 'original' },
    { id: 'clip_src_melody', trackId: 'track_melody', name: 'Flute Lead [8-Bar Loop]', startBar: 1, durationBars: 8, notes: melodyNotes, origin: 'original' },
    { id: 'clip_src_texture', trackId: 'track_texture', name: 'Pad [8-Bar Loop]', startBar: 1, durationBars: 8, notes: padNotes, origin: 'original' },
  ];

  return {
    id: 'proj_amapiano_demo',
    name: 'Soweto Sunset (Amapiano 8-Bar Loop)',
    version: '1.0.0',
    tempo: bpm,
    timeSignature: [4, 4],
    ppq: PPQ,
    totalBars: 8,
    sourceBars: 8,
    activeArrangementStyle: 'build',
    tracks,
    sections: [
      {
        id: 'sec_source_loop',
        name: 'Original 8-Bar Loop',
        type: 'main-a',
        startBar: 1,
        durationBars: 8,
        energyTarget: 75,
        trackActivity: {
          track_drums: true,
          track_logdrum: true,
          track_chords: true,
          track_melody: true,
          track_texture: true,
        },
        musicalIntention: 'Untouched source loop with full groove balance',
      }
    ],
    clips: [...sourceClips],
    sourceClips: [...sourceClips],
    randomSeed: 42,
    userLevel: 'intermediate',
    userNotes: 'Imported 8-bar Amapiano loop with syncopated log-drum, Rhodes chords, and flute lead.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 2. Hip-Hop / Neo-Soul 4-Bar Loop (88 BPM)
 */
export function createHipHopSoulDemoProject(): SongProject {
  const bpm = 88;
  const totalBars = 4;

  const drumNotes: MidiNote[] = [];
  for (let b = 0; b < totalBars; b++) {
    const s = b * TICKS_PER_BAR;
    drumNotes.push(createNote(36, s, PPQ * 0.7, 105)); // Kick
    drumNotes.push(createNote(36, s + PPQ * 1.6, PPQ * 0.5, 92));
    drumNotes.push(createNote(36, s + PPQ * 2.5, PPQ * 0.6, 98));
    drumNotes.push(createNote(38, s + PPQ * 1, PPQ * 0.5, 100)); // Snare
    drumNotes.push(createNote(38, s + PPQ * 3, PPQ * 0.5, 102));
    for (let h = 0; h < 8; h++) {
      drumNotes.push(createNote(42, s + h * (PPQ / 2), PPQ / 4, h % 2 === 0 ? 85 : 60));
    }
  }

  const bassNotes: MidiNote[] = [];
  const bassPitches = [36, 41, 43, 38]; // C1, F1, G1, D1
  for (let b = 0; b < totalBars; b++) {
    const s = b * TICKS_PER_BAR;
    bassNotes.push(createNote(bassPitches[b], s + Math.round(0.25 * PPQ), PPQ * 1.5, 100));
    bassNotes.push(createNote(bassPitches[b] + 7, s + Math.round(2.5 * PPQ), PPQ * 1.0, 95));
  }

  const chordNotes: MidiNote[] = [];
  const chords = [
    [48, 55, 59, 62], // Cmaj9
    [53, 57, 60, 64], // Fmaj7
    [55, 59, 62, 65], // G7
    [50, 53, 57, 60], // Dm7
  ];
  for (let b = 0; b < totalBars; b++) {
    const s = b * TICKS_PER_BAR;
    for (const p of chords[b]) {
      chordNotes.push(createNote(p, s + Math.round(0.5 * PPQ), PPQ * 2.8, 80));
    }
  }

  const tracks: Track[] = [
    { id: 'track_drums', name: 'BoomBap Drums', role: 'drums', color: '#ef4444', isMuted: false, isSolo: false, volume: 0.85, pan: 0, midiChannel: 9, isSource: true, notesCount: drumNotes.length },
    { id: 'track_bass', name: 'Warm Sub Bass', role: 'bass', color: '#f59e0b', isMuted: false, isSolo: false, volume: 0.88, pan: 0, midiChannel: 1, isSource: true, notesCount: bassNotes.length },
    { id: 'track_chords', name: 'Vintage Keys', role: 'chords', color: '#3b82f6', isMuted: false, isSolo: false, volume: 0.78, pan: 0, midiChannel: 2, isSource: true, notesCount: chordNotes.length },
  ];

  const sourceClips: Clip[] = [
    { id: 'clip_src_drums', trackId: 'track_drums', name: 'Drums [4-Bar]', startBar: 1, durationBars: 4, notes: drumNotes, origin: 'original' },
    { id: 'clip_src_bass', trackId: 'track_bass', name: 'Sub Bass [4-Bar]', startBar: 1, durationBars: 4, notes: bassNotes, origin: 'original' },
    { id: 'clip_src_chords', trackId: 'track_chords', name: 'Keys [4-Bar]', startBar: 1, durationBars: 4, notes: chordNotes, origin: 'original' },
  ];

  return {
    id: 'proj_hiphop_demo',
    name: 'Brooklyn Rain (Hip-Hop Soul 4-Bar)',
    version: '1.0.0',
    tempo: bpm,
    timeSignature: [4, 4],
    ppq: PPQ,
    totalBars: 4,
    sourceBars: 4,
    activeArrangementStyle: 'performance',
    tracks,
    sections: [
      {
        id: 'sec_source_loop',
        name: 'Original 4-Bar Loop',
        type: 'main-a',
        startBar: 1,
        durationBars: 4,
        energyTarget: 70,
        trackActivity: { track_drums: true, track_bass: true, track_chords: true },
        musicalIntention: 'Untouched source loop',
      }
    ],
    clips: [...sourceClips],
    sourceClips: [...sourceClips],
    randomSeed: 88,
    userLevel: 'beginner',
    userNotes: 'Soulful 4-bar boom-bap loop with Rhodes chords and sub bass.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
