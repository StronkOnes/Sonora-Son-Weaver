# Product Specification

## SONORA SongWeaver

### User Personas & Modes

1. **Beginner**:
   - High-level controls, instant 1-click arrangement templates, plain-language commands, immediate Web Audio playback, and one-click demo loaders.
2. **Intermediate Producer**:
   - Section-level editing, energy curve manipulation, track activity matrix toggles, tempo control, and multi-track MIDI export.
3. **Advanced Producer**:
   - Non-destructive variation engine, isolated section regeneration, locked melody safeguards, seed-based reproducibility, and round-trip verification.

### Core Non-Negotiable Standards

- **Source Preservation**: Original loop material is immutably preserved in `sourceClips`. Regeneration or transformation never overwrites original source assets.
- **Offline First**: All synthesis, arrangement generation, MIDI parsing, and audio onset analysis work entirely offline without external cloud dependencies.
- **No Simulated Controls**: All buttons, sliders, meters, and transport toggles execute real underlying audio or algorithmic logic.
