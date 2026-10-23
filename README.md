# SONORA SongWeaver

**Musical Arrangement Assistant & Song-Building Workstation**  
*Turn loops, MIDI riffs, and audio stems into complete, editable arrangements.*

---

## Overview

SONORA SongWeaver solves the classic producer problem: getting stuck in an 8-bar loop. SongWeaver analyses your musical material and generates three structurally distinct, editable arrangements—**Build & Climax**, **Atmospheric & Deep**, and **Club Performance**—while preserving the authentic identity of your original idea.

## Key Features

- **3 Distinct Arrangement Concepts:**
  - *Build & Climax*: Progressive layer additions, tension riser, peak hook, and dynamic breakdown.
  - *Atmospheric & Deep*: Spacious contrast, minimalist verses, deep hooks, and ambient breakdown.
  - *Club Performance*: DJ-ready groove intro/outro, immediate hook statement, and syncopated turnaround fills.
- **Full Standard MIDI File (SMF) Binary Engine:**
  - Import multi-track SMF files (Type 0 and Type 1).
  - Export DAW-ready Type 1 SMF files with dedicated Conductor track (tempo and time signature).
  - Export modes: Full Arrangement, Single Stems, Selected Section, or untouched Source Material.
- **Built-in Multi-Timbral Web Audio Synthesizer:**
  - Zero external dependencies: real-time auditioning right in the browser.
  - Dedicated sound engines: Drums & Shakers, Resonant Amapiano Log Drum, Warm Sub Bass, Rhodes 9th Chords, Lead Synth, and Ambient Pad.
  - Hardware transport: Play, Pause, Stop, Seek, Section Loop, Metronome Click, Master Volume, and LED Peak Meter.
- **Musical Variation Engine:**
  - Non-destructive transformations: selective note omission, velocity shaping, turnaround fills, and octave shifts.
  - **Isolated Section Regeneration**: modify or regenerate any section without altering unrelated sections.
- **Natural Language Arrangement Commands:**
  - "Make the intro 8 bars longer"
  - "Remove the bass during the breakdown"
  - "Give the hook more energy"
  - "Make the second verse different"
  - "Keep the melody unchanged"
  - "Give me a shorter arrangement"
- **Real Audio Spectral Analysis:**
  - Short-time energy flux onset detection, autocorrelation tempo estimation with confidence percentage, and peak waveform rendering.
- **Automated Verification:**
  - Built-in test suite executing Section 19 acceptance tests (Tests A through F).

---

## Launch & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run lint / type check
npm run lint

# Build for production
npm run build
```

---

## Keyboard Shortcuts

- `Space`: Play / Pause playback
- `Enter`: Stop & return to Bar 1
- `Ctrl+Z` / `Cmd+Z`: Undo last arrangement change
- `Ctrl+Y` / `Cmd+Y`: Redo arrangement change

---

## License

Proprietary SONORA Audio Technologies. All rights reserved.
