# MIDI Support Specification

## Standard MIDI File (SMF) Capabilities

### Supported Import Features:
- **Formats**: Standard MIDI File Type 0 (single multi-channel track) and Type 1 (synchronous multi-track).
- **Time Division**: Metric time division based on Pulses (ticks) Per Quarter Note (PPQ), standard 480 or 960 PPQ.
- **Messages**:
  - Note-On (`0x90`–`0x9F`) with velocity > 0.
  - Note-Off (`0x80`–`0x8F`) and Note-On with velocity 0.
  - Running status optimization handling.
  - Variable-length delta times (1 to 4 bytes).
  - Track Name (`0xFF 0x03`).
  - Set Tempo (`0xFF 0x51 0x03` microseconds per quarter note).
  - Time Signature (`0xFF 0x58 0x04` numerator, denominator power).
  - End of Track (`0xFF 0x2F 0x00`).

### Supported Export Modes:
1. **Full Arrangement**: Multi-track Type 1 SMF with dedicated Conductor track (Track 0) and tracks for each musical role.
2. **Single Track / Stem**: Isolated SMF file containing only the selected instrument.
3. **Selected Section**: Extracted arrangement section relative to bar 1.
4. **Source Material**: Untouched original loop.

### Round-Trip Verification:
Tested and verified via automated test `TEST_E`. All exported files are compatible with Ableton Live, Logic Pro, FL Studio, Reaper, and Pro Tools.
