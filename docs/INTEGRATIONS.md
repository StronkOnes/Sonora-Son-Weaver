# SONORA Ecosystem Integration Contracts

## Integration Guidelines

In accordance with Section 11 of the Master Specification, all ecosystem integrations follow strict principles:
- No undocumented plugin communication.
- No assumed private APIs.
- MIDI file exchange and documented project schemas serve as the primary integration contract.

### Product Contracts:

1. **ChordForge**:
   - Integration Method: MIDI clip exchange via standard Type 1 SMF.
   - Status: Ready (imports/exports standard harmonic progressions into SongWeaver chord tracks).

2. **SynthForge**:
   - Integration Method: Track role annotation and MIDI dispatch.
   - Status: Ready (identifies synth lead/pad roles and exports isolated stem MIDI).

3. **BassForge Pre**:
   - Integration Method: Audio and MIDI bass stem exchange.
   - Status: Ready (exports dedicated bass/log-drum stems).

4. **EchoWeave**:
   - Integration Method: MIDI answering phrase exchange.
   - Status: Supported through Variation Engine call-and-response policies.

5. **LoDrum Maker**:
   - Integration Method: Dedicated log-drum role channel and MIDI pattern exchange.
   - Status: Supported with authentic Amapiano resonant log-drum synthesis and timing.
