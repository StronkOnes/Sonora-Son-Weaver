# Architecture Specification

## SONORA SongWeaver Architecture

SongWeaver is structured according to the modular separation defined in Section 5 of the Master Product Specification.

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Workstation Layer                   │
│   (ArrangementCanvas, TransportBar, SectionInspector, etc.) │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌───────────────────────────────┐  ┌──────────────────────────┐
│      CommandEngine            │  │      ProjectModel        │
│ (Natural Language Processor)  │  │ (Tracks, Clips, Sections)│
└──────────────┬────────────────┘  └──────────┬───────────────┘
               │                              │
               ▼                              │
┌───────────────────────────────┐             │
│      ArrangementEngine        │◄────────────┘
│ (Build, Atmospheric, Club)    │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       VariationEngine         │
│ (Note Omission, Fills, Shifts)│
└──────────────┬────────────────┘
               │
       ┌───────┴───────────────┐
       ▼                       ▼
┌──────────────┐       ┌──────────────┐
│ PlaybackEngine│      │   MidiIO     │
│ (WebAudio    │       │(SMF Type 1   │
│ Synthesizer) │       │ Reader/Writer│
└──────────────┘       └──────────────┘
```

### Module Responsibilities

1. **`ProjectModel` (`src/types/music.ts`)**:
   - Defines versioned, serializable project schemas with strict separation between original source loops (`sourceClips`) and generated arrangement timeline clips (`clips`).
   - Ensures clips track their derivation origin (`original`, `duplicated`, `transformed`, `generated`, `user-edited`).

2. **`MidiIO` (`src/services/midi/smfParser.ts`, `src/services/midi/smfWriter.ts`)**:
   - Zero-dependency binary SMF parser and encoder.
   - Handles variable-length quantities, running status, meta-events (Tempo FF 51, Time Signature FF 58, Track Name FF 03).
   - Generates Type 1 multi-track MIDI with dedicated Conductor track.

3. **`PlaybackEngine` (`src/services/audio/synthEngine.ts`)**:
   - Multi-timbral polyphonic synthesizer built with Web Audio API.
   - Sub-millisecond lookahead scheduling (25ms timer interval, 150ms lookahead).
   - Specialized acoustic and synthesizer models for Drums, Amapiano Log Drum, Bass, Keys, Melody Lead, and Atmosphere Pad.
   - Master compressor/limiter and real-time RMS meter calculation.

4. **`ArrangementEngine` (`src/services/arrangement/arrangementEngine.ts`)**:
   - Converts source loop into 3 distinct musical concepts: Build, Atmospheric, and Performance.
   - Assigns role-based track activity profiles and energy targets across sections.
   - Guarantees seamless timeline continuity with no gaps or overlaps.

5. **`VariationEngine` (`src/services/arrangement/variationEngine.ts`)**:
   - Implements musically constrained transformations: selective note omission on offbeats, velocity shaping, turnaround fills, and octave shifts.
   - Supports deterministic random seeds for bit-exact reproducibility.
   - Provides isolated section regeneration without side-effects on other sections.

6. **`CommandEngine` (`src/services/commands/commandProcessor.ts`)**:
   - Deterministic NLP parser matching producer intents ("Make intro 8 bars longer", "Remove bass during breakdown", "Give hook more energy").
   - Non-destructive execution with action explainability and undo support.
