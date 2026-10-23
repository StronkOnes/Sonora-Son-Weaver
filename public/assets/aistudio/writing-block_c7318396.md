# SONORA SongWeaver
## Master Product Specification & AI Development Instructions

**Product:** SONORA SongWeaver  
**Category:** Musical arrangement assistant and song-building workstation  
**Brand:** SONORA  
**Product status:** New development project  
**Primary objective:** Turn a user's musical loop, MIDI arrangement, or supported audio input into multiple complete, editable song arrangements that preserve the identity of the original idea.

**Product philosophy:** Make music easier to finish, without taking creative control away from the producer.

---

# 1. Instructions to the AI Development Agent

You are the lead software architect, experienced audio programmer, music-software designer, and implementation engineer responsible for building SONORA SongWeaver.

Your task is to build a functional, polished application—not merely a mock-up, landing page, or attractive interface with nonfunctional controls.

Before changing any files:

1. Inspect the existing repository, its folder structure, documentation, build system, dependencies, coding conventions, and tests.
2. Identify the operating system, available compiler/toolchain, existing frameworks, and whether this is a new repository or an existing application.
3. Determine which parts of the specification can be implemented immediately and which require dependencies, design decisions, or external integrations.
4. Produce a short implementation assessment and a phased checklist.
5. Preserve working functionality and existing user data.
6. Do not replace an existing working architecture merely because you prefer another framework.
7. If the repository already contains a SongWeaver implementation, improve it incrementally rather than rebuilding blindly.

After the initial assessment, begin implementation. Do not stop after writing a plan.

Work in small, testable phases. At the end of each phase:

- Build the application.
- Run relevant automated tests.
- Fix errors before proceeding.
- Verify that the implemented features actually work.
- Record completed work, known limitations, and the next steps.

Do not claim a feature works simply because its interface exists.

If a feature depends on an external service, unsupported plugin, or unimplemented algorithm, identify that limitation clearly and implement the best working local alternative.

## Non-negotiable principles

- The user's original musical idea must remain recoverable.
- Generated arrangements must be editable, not rendered into an unchangeable audio file.
- Users must be able to regenerate individual sections without regenerating the entire song.
- Musical decisions must be explainable and adjustable.
- Core arrangement functionality should work offline.
- Do not require a paid AI API for the core workflow.
- Do not use copyrighted songs as an undisclosed source of generated arrangements.
- Do not add fake AI features, simulated processing, placeholder exports, or buttons that do nothing.
- Do not use Tailwind CSS.
- Avoid unnecessary dependencies and excessive abstraction.
- Never overwrite source material without explicit user permission.

---

# 2. Product Vision

SongWeaver solves a common music-production problem: a producer creates an excellent loop but struggles to develop it into a complete song.

The user may have:

- An eight-bar Amapiano groove.
- A four-bar hip-hop beat.
- A chord progression and melody.
- A bass line with percussion.
- A collection of MIDI clips.
- A supported audio loop they want to develop.

SongWeaver analyses the available musical material, identifies its recurring patterns and changes, and proposes arrangements with different musical journeys.

Instead of simply copying the same loop repeatedly, it intelligently varies repetition, density, instrumentation, dynamics, and musical activity.

## The defining experience

A user imports an eight-bar loop.

SongWeaver analyses it and presents three arrangement concepts:

1. **Build:** Gradually introduce elements, increase energy, and create a stronger climax.
2. **Atmospheric:** Begin sparsely, introduce space and contrast, and allow the music to breathe.
3. **Performance:** Establish a groove, develop variations, create a breakdown, and return to the main theme.

The user auditions each arrangement, chooses one, and sees an editable timeline.

They can then say, in plain language:

- "Make the intro longer."
- "Give the hook more energy."
- "Remove the bass during the breakdown."
- "Make the second verse different from the first."
- "Keep my original melody unchanged."
- "Create another version of the final chorus."
- "Make the song shorter."

SongWeaver translates these requests into arrangement operations, applies them to the relevant sections, and lets the user audition the result.

**The essential differentiator is not the number of generated bars. It is the quality of the musical journey built from the user's own material.**

---

# 3. Target Users

Design for three levels of experience.

## Beginner

The beginner may not understand bars, arrangement, song structure, MIDI routing, or music theory.

They need:

- Plain-language controls.
- Immediate audio previews.
- Suggested song structures.
- Clear explanations of changes.
- Undo and redo.
- Helpful defaults.
- One-click generation of alternative arrangements.

## Intermediate producer

The intermediate user understands loops, MIDI, DAWs, and common song sections.

They need:

- Section-level editing.
- Variation controls.
- Track-level activity controls.
- Tempo and length controls.
- MIDI export.
- Multiple arrangement candidates.
- Detailed control over repetition and musical density.

## Advanced producer

The advanced producer wants creative control and predictable results.

They need:

- Non-destructive editing.
- Individual clip and track editing.
- Deterministic generation when a seed is fixed.
- Adjustable musical constraints.
- Per-section regeneration.
- Arrangement history.
- Exportable stems where supported.
- Clear separation between source material and generated material.

All three users must work with the same underlying project format. Beginner mode should simplify the interface, not remove important capabilities.

---

# 4. Product Scope and Development Strategy

Build SongWeaver in stages.

## Phase 0 — Repository audit and technical decisions

Deliver:

- Repository assessment.
- Recommended architecture based on the existing project.
- Dependency inventory.
- Build and test instructions.
- Feature-by-feature implementation checklist.
- Risk assessment for audio analysis, MIDI, audio processing, and integrations.

Do not begin with visual polish before verifying the technical foundation.

## Phase 1 — Functional arrangement engine

Build the musical core first.

Required:

- Song project model.
- Track and clip model.
- Musical timeline.
- MIDI import.
- Tempo and time-signature handling.
- Loop analysis for MIDI material.
- Arrangement templates.
- Section generation.
- Musical variation generation.
- Arrangement preview.
- Undo and redo.
- MIDI export.

The first release must be useful without an external AI model.

## Phase 2 — SongWeaver workstation interface

Implement the main interface, including:

- Project creation.
- Import workflow.
- Analysis progress and results.
- Arrangement selection.
- Timeline and tracks.
- Section editor.
- Variation controls.
- Playback and navigation.
- Export workflow.

Every visible primary control must have a real implementation.

## Phase 3 — Audio analysis and reference handling

Add supported audio import, waveform display, onset detection, tempo estimation, section analysis, and confidence reporting.

Audio analysis must be tested against real audio files. Do not pretend that an audio loop has been converted into editable MIDI when transcription has not occurred.

## Phase 4 — Creative intelligence

Add:

- Natural-language arrangement commands.
- More sophisticated musical variations.
- Energy-curve editing.
- Improved transitions.
- Style-aware arrangement templates.
- Better recommendations based on detected musical material.

Use deterministic local algorithms where appropriate. An optional language model may translate requests into structured operations, but it must not be required for basic functionality.

## Phase 5 — SONORA ecosystem integrations

Add integrations only after the standalone application is stable.

Potential integrations:

- ChordForge for chord and progression material.
- SynthForge for synthesizer parts and sound suggestions.
- BassForge Pre for processing bass audio.
- EchoWeave for generated answering phrases.
- LoDrum Maker for log-drum and pattern material.

These integrations must use documented interfaces, file exchange, or other verified capabilities. Never invent undocumented APIs or assume that separate plugins can communicate directly.

## Phase 6 — Beta hardening

Complete:

- Installer or reliable distribution package.
- Project persistence.
- Crash and error handling.
- Performance testing.
- Export verification.
- Accessibility review.
- Documentation.
- Regression tests.
- Beta feedback workflow.

Do not mark a phase complete until its acceptance criteria pass.

---

# 5. Recommended Technical Architecture

Inspect the repository before choosing the final stack.

If SongWeaver is a desktop music application and the repository is new, use the following as the preferred starting architecture.

## Preferred implementation

- **Language:** C++ for performance-sensitive musical processing, if the existing project is already a JUCE/C++ application.
- **Audio and MIDI:** JUCE where appropriate.
- **Build system:** CMake.
- **User interface:** Native JUCE components for a fully integrated C++ application, unless the repository has a justified alternative.
- **Testing:** Automated unit tests for musical logic, project serialization, MIDI import/export, and arrangement generation.
- **Audio processing:** Local and offline by default.
- **Persistence:** Versioned project files with a documented schema.

Do not introduce a separate web frontend merely for appearance if it makes the audio application harder to build or maintain.

If the repository is already a working TypeScript/Electron or other desktop project, assess whether it can deliver the required audio and MIDI functionality before migrating technologies.

## Architectural separation

Organize the application into clear modules:

1. `ProjectModel` — project, tracks, clips, sections, metadata.
2. `MidiIO` — MIDI import and export.
3. `AudioImport` — supported audio file handling.
4. `MusicalAnalysis` — tempo, meter, phrase and repetition analysis.
5. `ArrangementEngine` — song structure and section placement.
6. `VariationEngine` — non-destructive musical variations.
7. `TransitionEngine` — fills, mutes, risers, pickups and section transitions.
8. `PlaybackEngine` — auditioning, transport and preview.
9. `CommandEngine` — structured commands from UI or natural language.
10. `ProjectPersistence` — save, load, migrate and recover projects.
11. `ExportEngine` — MIDI, project data and supported audio exports.
12. `IntegrationAdapters` — optional SONORA product integrations.
13. `UserInterface` — timeline, controls, dialogs and visual feedback.

Keep the musical engine independent from the interface wherever practical. This enables better testing and future integration with other SONORA products.

---

# 6. Core Project Data Model

Create a versioned, serializable project model.

A project should contain:

- Project ID.
- Project name.
- Project format version.
- Tempo in beats per minute.
- Time signature.
- Total duration.
- Arrangement settings.
- Track collection.
- Section collection.
- Clip collection.
- Source asset references.
- Generated material metadata.
- Random seeds for repeatable generation.
- Export settings.
- Undo history where appropriate.
- Optional user notes.

## Track

Each track should have:

- Stable track ID.
- Display name.
- Track type.
- Mute state.
- Solo state.
- Volume and pan where supported.
- Musical role.
- Source or generated status.
- Clips.
- Optional sound or instrument reference.
- Optional activity profile across song sections.

Suggested track types:

- MIDI instrument.
- Audio.
- Drums/percussion.
- Bass.
- Chords.
- Melody.
- Texture/atmosphere.
- Reference audio.
- Unassigned.

Do not assume a track's musical role solely from its name. Allow the user to correct detected roles.

## Clip

Each clip should have:

- Stable clip ID.
- Track ID.
- Start position in musical ticks or a well-defined beat-based unit.
- Duration.
- Source reference.
- Source region.
- Musical content, if MIDI.
- Variation ID.
- Origin metadata.
- Section association.
- Muted or active state.
- Optional transformation history.

## Section

Each section should have:

- Stable section ID.
- Name.
- Start position.
- Duration.
- Section type.
- Energy target.
- Track activity profile.
- Variation settings.
- Transition settings.
- Source-material references.

Section types:

- Intro.
- Verse.
- Pre-chorus or build.
- Chorus/hook.
- Drop.
- Breakdown.
- Bridge.
- Instrumental.
- Outro.
- Custom section.

These are suggestions, not mandatory rules. An Amapiano instrumental may not need a conventional verse/chorus structure.

## Source preservation

Imported clips must remain recoverable.

Generated clips must reference their source where applicable. Regenerating a section must not silently destroy the original material.

Use an explicit distinction between:

- Original material.
- Duplicated material.
- Transformed material.
- Newly generated material.
- User-edited generated material.

If a user edits a generated clip, ask before overwriting those edits during regeneration.

---

# 7. Musical Analysis Engine

SongWeaver must analyse what is actually present in the user's material.

Do not present guesses as facts.

## MIDI analysis

For MIDI files, analyse:

- Tempo and time-signature metadata where available.
- Note onset positions.
- Note durations.
- Pitch distribution.
- Velocity distribution.
- Rhythmic density.
- Repeated phrases.
- Motif similarity.
- Chord and bass activity where reasonably detectable.
- Track activity.
- Silence and gaps.
- Phrase boundaries.
- Possible downbeats and bar boundaries.

Support files with multiple tracks and MIDI channels.

Handle missing tempo metadata safely. Ask the user to confirm or estimate the tempo rather than silently assigning an arbitrary value.

## Audio analysis

For audio files, implement progressively:

- File validation.
- Duration and channel detection.
- Waveform generation.
- Onset detection.
- Tempo estimation with confidence.
- Beat-grid estimation.
- Repetition and similarity analysis.
- Broad energy and loudness trends.
- Section-boundary suggestions.

Optional later analysis:

- Harmonic/chromatic content.
- Instrument-family classification.
- Bass activity estimation.
- Percussion activity estimation.
- Melody transcription.
- Chord estimation.

These are uncertain for mixed audio. Expose confidence levels and let users correct results.

## Analysis result

Present a readable summary, for example:

- Estimated tempo: 112 BPM.
- Meter: 4/4, if supported by the evidence.
- Length: 8 bars.
- Repeating phrase: detected.
- Stronger rhythmic activity: bars 1–2 and 5–8.
- Likely phrase boundary: bar 5.
- Audio-derived information: estimated, with confidence shown.

Never fabricate detected instruments, key, tempo, or phrase boundaries to make the interface appear intelligent.

---

# 8. The Arrangement Engine

This is the heart of SongWeaver.

The engine must transform source material into a song structure that develops over time.

## Arrangement inputs

Allow the user to specify:

- Target song length.
- Preferred structure.
- Number of sections.
- Desired energy progression.
- Amount of variation.
- Repetition tolerance.
- Whether original material must remain unchanged.
- Whether new material may be generated.
- Whether silence or sparse sections are acceptable.
- Whether an ending should resolve, fade, or stop.

Provide useful defaults.

## Three arrangement concepts

Generate three meaningfully different arrangements from the same input.

### A. Build

- Establish the main idea.
- Introduce elements progressively.
- Create a stronger central hook or drop.
- Provide contrast before the climax.
- End with a deliberate outro.

### B. Atmospheric

- Start with fewer elements.
- Leave space for the main idea to emerge.
- Use quieter, less dense sections.
- Build contrast through subtraction as well as addition.
- End naturally.

### C. Performance

- Establish a recognisable groove.
- Introduce controlled variations.
- Create a breakdown or temporary reduction.
- Return to the central motif.
- Use fills or pickups where musically appropriate.

The templates must adapt to the available material. Do not label a section "chorus" simply because a template says it should exist.

If the source has only one musical part, do not pretend that other instruments have been created. Build a useful arrangement through repetition, dynamics, filtering or other supported operations, and clearly indicate where additional musical material would improve the result.

## Structure generation

The engine should:

1. Determine the usable musical phrase length.
2. Create candidate section boundaries.
3. Assign a role and energy target to each section.
4. Decide which source material appears in each section.
5. Apply variation policies.
6. Create transitions.
7. Evaluate repetition and continuity.
8. Verify that the resulting timeline has no unintended gaps, overlaps or invalid clip references.
9. Return an editable arrangement.

Use bars and beats internally where possible, rather than relying exclusively on floating-point seconds.

## Example arrangement

An eight-bar loop could produce the following illustrative structure:

| Section | Bars | Musical intention |
|---|---:|---|
| Intro | 1–8 | Establish atmosphere and a small part of the groove |
| Main A | 9–24 | Introduce the recognisable loop |
| Build | 25–32 | Increase activity or tension |
| Hook A | 33–48 | Present the fullest version of the main idea |
| Breakdown | 49–56 | Remove selected elements and create space |
| Hook B | 57–72 | Return with a variation |
| Outro | 73–80 | Remove elements and close deliberately |

This is an example, not a fixed default. Eighty bars at a typical tempo may be too long for some users. Offer short, medium and extended song-length presets.

---

# 9. Musical Variation Engine

Repeating the same eight bars for three minutes is not sufficient.

Create controlled transformations that preserve the identity of the original material.

## Initial MIDI variation methods

Implement and test:

- Selective note omission.
- Velocity shaping.
- Note-length adjustment.
- Rhythmic density changes.
- Phrase-ending variation.
- Octave changes where appropriate.
- Controlled note displacement within defined musical limits.
- Motif repetition and extension.
- Phrase truncation.
- Call-and-response placement.
- Selective track muting.
- Pattern rearrangement where valid.
- Transition fills derived from source rhythms.

Each operation must have clear constraints and must avoid corrupting the source MIDI.

## Musical safeguards

- Preserve the original version.
- Avoid random note changes without musical constraints.
- Preserve timing when the user requests it.
- Preserve pitches when the user locks a melody.
- Avoid generating notes outside configured pitch ranges.
- Avoid unwanted velocity extremes.
- Respect loop boundaries.
- Avoid invalid note-on/note-off ordering.
- Keep variation intensity adjustable.

Do not claim a generated part is harmonically correct unless the engine has sufficient evidence to support that claim.

## Variation controls

Provide:

- Variation amount.
- Rhythmic complexity.
- Pitch freedom.
- Velocity movement.
- Phrase similarity.
- Density.
- Energy.
- Random seed.

Use a fixed seed to reproduce a generated result when the source, settings and engine version remain unchanged.

## Individual section regeneration

The user must be able to select a section and choose:

- Regenerate variation.
- Make simpler.
- Make busier.
- Make more energetic.
- Make more spacious.
- Preserve the melody.
- Preserve the rhythm.
- Keep the bass unchanged.
- Return to the previous version.

Regenerating a section must not alter unrelated sections.

---

# 10. Energy and Density Controls

Build an energy timeline that a beginner can understand.

Represent each section with a target energy value, such as 0–100.

Energy should be an interpretable composite of supported properties, such as:

- Number of active tracks.
- Rhythmic density.
- Velocity profile.
- Note activity.
- Layer intensity.
- Transition activity.

Do not equate loudness with musical energy.

Allow the user to draw or adjust an energy curve across the song.

For each section, the engine should attempt to match the target through available operations.

Examples:

- A breakdown reduces track activity and density.
- A build gradually introduces elements.
- A hook activates more of the available material.
- An outro reduces activity toward the ending.

If there is not enough source material to achieve the requested energy, explain what is missing and offer practical alternatives.

---

# 11. SONORA Product Integration Design

SongWeaver should eventually connect to the existing SONORA beta ecosystem, but it must remain useful without those integrations.

## Integration principles

1. No undocumented plugin communication.
2. No assumed shared APIs.
3. No requirement that all SONORA plugins be installed.
4. No silent alteration of a user's instrument presets or project settings.
5. Every integration must be optional and independently testable.
6. MIDI exchange should be a supported baseline wherever technically appropriate.
7. Use versioned integration interfaces if direct communication is later implemented.

## ChordForge

Potential role:

- Import generated chord progressions.
- Use existing chord material as arrangement input.
- Place progression changes in designated sections.
- Preserve the user's chosen progression.

Initial implementation: MIDI import/export.

## SynthForge

Potential role:

- Identify tracks that need a synthesizer sound.
- Suggest where a lead, pad or supporting part could enter.
- Pass supported MIDI material into a SynthForge workflow.
- Later support preset or sound recommendations through an explicit interface.

Do not assume SongWeaver can change SynthForge presets or instantiate its instrument automatically until a real interface exists.

## BassForge Pre

Potential role:

- Suggest that bass audio may need processing.
- Allow compatible audio to be opened in the relevant workflow.
- Provide optional track annotations for bass clarity or consistency.

BassForge Pre is a processor, not a bass-generation engine. Do not assign it a function it does not provide.

## EchoWeave

Potential role:

- Generate answering musical phrases from an existing phrase.
- Offer responses in selected song sections.
- Create variations for hooks or call-and-response passages.
- Let the user choose which generated voice to retain.

Initial implementation: export or exchange compatible MIDI through a verified workflow.

## LoDrum Maker

Potential role:

- Use existing log-drum patterns as source material.
- Suggest reduced activity during breakdowns.
- Place stronger log-drum activity in selected sections.
- Use supported MIDI exchange to transfer patterns.

Do not assume that a particular LoDrum Maker MIDI or project format exists until verified against its actual implementation.

## Integration roadmap

**First:** MIDI file exchange and project metadata.

**Second:** Shared project/section conventions and documented integration adapters.

**Third:** Optional direct communication, if the existing products support it.

The standalone SongWeaver product must not wait for the entire ecosystem to be rewritten.

---

# 12. Natural-Language Arrangement Commands

Build a command layer that translates plain-language requests into structured, validated arrangement operations.

Examples:

- "Make the intro eight bars longer."
- "Make the second hook busier."
- "Remove the log drum during the breakdown."
- "Keep the melody exactly as it is."
- "Make the ending gradual."
- "Give me a shorter arrangement."
- "Create a second variation of this section."

## Command processing

Use the following flow:

1. Interpret the request.
2. Identify the target section, track or project.
3. Convert the request into a structured command.
4. Validate the requested operation.
5. Show a brief explanation or preview if the change is significant.
6. Apply the change non-destructively.
7. Record it in undo history.
8. Allow immediate auditioning and reversal.

The command engine should operate on an explicit set of supported actions.

If a request cannot be executed, say why and offer the closest supported alternative.

A language model may help interpret natural language, but it must not directly modify arbitrary project files or bypass validation.

The core application must remain usable without a language model.

---

# 13. User Interface and Visual Design

SongWeaver must feel like a premium SONORA product.

## Visual identity

Use:

- Near-black or charcoal backgrounds.
- Silver and soft grey typography.
- Restrained warm amber accents.
- Clear contrast and readable labels.
- Deliberate spacing.
- Subtle motion.
- Professional musical timeline graphics.
- A clean, confident visual language.

Use the approved SONORA typography-led wordmark asset if available in the repository. Do not replace it with a generic waveform, music note or invented S emblem.

Avoid:

- Excessive gradients.
- Decorative neon everywhere.
- Cluttered control panels.
- Tiny labels.
- Overly complicated professional-audio terminology in beginner mode.
- Fake visualisers that do not reflect real playback or project data.
- A generic dashboard appearance.

## Main screen layout

### A. Top bar

Contains:

- SONORA wordmark.
- Project name.
- Save status.
- Undo and redo.
- Export.
- Settings.

### B. Project/source panel

Contains:

- Imported material.
- Source tracks.
- Analysis summary.
- Tempo and time signature.
- Warnings or uncertain analysis results.

### C. Arrangement canvas

This is the main workspace.

Display:

- Horizontal timeline.
- Bar markers.
- Song sections.
- Track lanes.
- MIDI clips.
- Audio waveforms.
- Muted and active states.
- Playhead.
- Section energy.
- Variation indicators.

Support useful zoom levels and horizontal navigation.

### D. Arrangement ideas panel

Show the three generated arrangements with:

- Name.
- Duration.
- Section summary.
- Energy progression.
- Variation characteristics.
- Preview playback.
- Select/Apply action.

### E. Inspector panel

When a section or clip is selected, expose relevant controls:

- Name.
- Length.
- Energy.
- Density.
- Variation.
- Track activity.
- Regeneration.
- Lock settings.

### F. Transport controls

Include:

- Play.
- Stop.
- Loop selected section.
- Position display.
- Tempo.
- Metronome where supported.

Transport state must be connected to actual playback.

## Beginner mode

Offer simplified language and guided actions.

For example:

- "Start quietly."
- "Build the energy."
- "Make this part different."
- "Give the ending more space."

Advanced users should be able to switch to detailed numerical controls.

---

# 14. Essential User Workflow

Implement the following complete workflow before adding advanced features.

## Step 1 — Create a project

The user creates a project and chooses a name.

## Step 2 — Import material

Support MIDI import first.

Validate file contents, handle multiple tracks, and show a useful error for unsupported files.

Audio import should be added as a separate supported workflow.

## Step 3 — Analyse the material

Show real analysis results and confidence.

Allow users to correct tempo, meter, bar boundaries and track roles.

## Step 4 — Choose song goals

The user selects:

- Desired duration.
- Arrangement style.
- Variation intensity.
- Whether new musical material may be generated.
- Which tracks or musical elements must remain unchanged.

## Step 5 — Generate three arrangements

The engine creates three different editable candidates.

Generation should be repeatable and must not destroy the source.

## Step 6 — Audition candidates

Allow users to compare the arrangements using the actual available playback engine.

Clearly distinguish fully playable audio previews from MIDI-only arrangements that require an instrument or synthesizer.

## Step 7 — Edit the selected arrangement

Users can:

- Move and resize sections.
- Mute or activate tracks.
- Adjust energy.
- Change variation intensity.
- Regenerate a selected section.
- Undo and redo.
- Compare with the original.

## Step 8 — Save and reopen

The project must reopen with the arrangement, track data, source references and edits intact.

Handle missing source files gracefully.

## Step 9 — Export

The user exports the arrangement as MIDI.

Include a clear summary of what was exported and any limitations.

---

# 15. MIDI Import and Export Requirements

MIDI export is a core feature, not a future cosmetic addition.

## Import

Support:

- Standard MIDI Files.
- Multiple tracks.
- Tempo events.
- Time-signature events where present.
- Note-on and note-off events.
- Velocity.
- Track names where present.
- MIDI channels where appropriate.

Handle malformed or incomplete files without crashing.

## Export

Support:

- Standard MIDI File export.
- Separate track export where practical.
- Individual arrangement-section export where practical.
- Correct timing and note durations.
- Tempo and time-signature metadata.
- Track names.
- Correct note-off handling.
- Consistent bar alignment.
- Predictable file naming.

Preserve the source MIDI's timing and pitches when the user requests an unchanged export.

Test round trips by importing exported files again and comparing the musical event data.

## Export modes

Offer:

1. **Full arrangement:** One MIDI file with the complete song.
2. **Separate tracks:** Individual MIDI files for selected tracks, if supported by the implementation.
3. **Selected section:** Export only the chosen section.
4. **Source material:** Export the untouched original.

Do not label MIDI files as audio stems. MIDI contains musical instructions, not rendered audio.

Audio stem export is a separate capability and must only be enabled when actual audio rendering or routing is implemented.

---

# 16. Audio Preview and Playback

The app needs a real, reliable auditioning workflow.

For MIDI-only projects, choose and document the playback strategy:

- A bundled or system-available instrument, if licensing and deployment permit.
- A built-in preview synthesizer.
- A verified instrument-hosting architecture, if appropriate.

Do not assume that a MIDI file produces sound by itself.

For audio projects, support actual audio playback, correct timeline positioning, loop auditioning, and graceful handling of unsupported formats.

Requirements:

- No blocking the audio callback with file I/O, heavy analysis or UI work.
- Thread-safe communication between the audio engine and interface.
- No memory allocation in real-time callbacks where avoidable.
- Clean transport start and stop.
- Correct playback position.
- Safe project closing while playback is active.
- Clear errors for unavailable playback devices.

If full audio hosting is outside the initial architecture, deliver reliable MIDI arrangement and export first, with a documented preview strategy. Do not fake the playback controls.

---

# 17. Project Saving and Reliability

SongWeaver must protect creative work.

Implement:

- Save.
- Save As.
- Autosave.
- Recovery after abnormal termination where feasible.
- Missing-source warnings.
- Versioned project files.
- Safe project migrations.
- Undo and redo.
- Backup before risky migration or destructive operations.
- Clear error reporting.

Test saving and reopening projects containing:

- Multiple tracks.
- Multiple sections.
- Imported MIDI.
- Generated variations.
- Locked clips.
- User-edited clips.
- Missing source references.

A project should never become corrupt simply because an optional integration is unavailable.

---

# 18. Performance Requirements

Keep the application responsive on ordinary desktop hardware.

- Analyse files asynchronously where appropriate.
- Display progress for long-running operations.
- Avoid freezing the UI during arrangement generation.
- Cache reusable analysis results.
- Avoid repeatedly analysing unchanged material.
- Keep project state and UI state separate.
- Prevent runaway generation loops.
- Place reasonable limits on file sizes and generation complexity.
- Allow cancellation of supported long-running operations.

Benchmark with several tracks and longer arrangements rather than only a tiny eight-bar test.

Document known performance limits instead of hiding them.

---

# 19. Testing Strategy

Create automated tests for the musical engine before relying on manual testing.

## Unit tests

Test:

- Bar/beat/tick conversion.
- Tempo changes where supported.
- MIDI note ordering.
- Phrase detection.
- Repetition detection.
- Section boundary generation.
- Variation constraints.
- Track activity.
- Arrangement duration.
- Energy targets.
- Random-seed reproducibility.
- Undo/redo.
- Project serialization.

## MIDI round-trip tests

Import a known MIDI file, export it without changes, re-import it, and verify:

- Notes remain present.
- Pitch is preserved.
- Velocity is preserved.
- Duration is preserved.
- Timing is preserved within the defined precision.
- Track structure is preserved to the extent promised.
- Tempo and time signature are preserved where supported.

## Arrangement acceptance tests

### Test A: Eight-bar source

Input: One eight-bar MIDI loop.

Expected:

- Three distinct arrangement candidates.
- Correctly aligned source clips.
- No unintended source-note changes.
- Different section layouts or activity profiles.
- Valid MIDI exports.

### Test B: Multiple tracks

Input: Drums, bass, chords and melody.

Expected:

- Track identities are preserved.
- Users can assign or correct track roles.
- Sections can reduce and restore track activity.
- Export preserves the selected tracks and their timing.

### Test C: Locked melody

Input: A melody locked by the user.

Expected:

- Regeneration cannot silently alter its notes.
- Other tracks or sections can still be varied.
- The lock is saved and restored with the project.

### Test D: Section regeneration

Input: An arrangement with eight sections.

Expected:

- Regenerating section five does not modify sections one to four or six to eight.
- Unrelated clips remain unchanged.
- Undo restores the previous section.

### Test E: Missing audio source

Input: A project whose referenced audio file has moved or been deleted.

Expected:

- The project opens without crashing.
- Missing material is clearly identified.
- The user can relink the source.
- Other project data remains available.

### Test F: MIDI export

Input: A multi-track arrangement with varied section lengths.

Expected:

- Exported MIDI opens in a standard MIDI-compatible application.
- Tempo and musical timing are correct.
- Note durations and track placement are correct.
- No unintended notes extend beyond their intended durations.

### Test G: Reproducibility

Input: Identical source material and generation settings.

Expected:

- A fixed seed produces a repeatable result under the same engine version.
- Changing the seed can produce a different valid variation.

### Test H: No fake features

Verify that all primary buttons perform their advertised actions and report errors accurately.

---

# 20. Definition of Done for the First Useful Release

The first useful release is complete only when a user can:

1. Launch SongWeaver.
2. Create a project.
3. Import a supported MIDI file.
4. Inspect the imported tracks.
5. Analyse the material.
6. Generate three editable arrangement candidates.
7. Audition them using the implemented playback method.
8. Select an arrangement.
9. Edit sections and track activity.
10. Regenerate a single section without damaging the rest.
11. Undo and redo changes.
12. Save and reopen the project.
13. Export a valid full-arrangement MIDI file.
14. Export supported individual tracks or sections.
15. Re-import exported MIDI and verify its timing.
16. Understand which features are implemented and which remain experimental.

The release must not depend on direct integration with another SONORA product.

---

# 21. What Not to Build First

Do not spend the first development cycle on:

- A cloud-based AI songwriting service.
- A subscription system.
- A marketplace.
- A social network.
- Complex plugin-to-plugin communication.
- Automatic audio-to-MIDI transcription of arbitrary polyphonic mixes.
- A massive collection of genres and presets.
- A complex neural network that cannot be tested properly.
- A visually impressive but nonfunctional timeline.
- Automatic full-song composition from a vague text prompt.

These can be considered later if the core workflow proves useful.

The initial goal is to make a real loop-to-arrangement workflow excellent.

---

# 22. Beta Readiness and Product Quality

Before inviting external testers, provide:

- Clear installation and launch instructions.
- A sample project.
- Supported file-format documentation.
- A short getting-started guide.
- A list of known limitations.
- A reliable way to report bugs.
- Version numbers and release notes.
- A safe way to collect diagnostic information without exposing private source material.
- A way to recover user projects after an error.

The beta should focus on whether users can successfully turn a loop into an arrangement they want to continue developing in their DAW.

Measure:

- Time from import to first usable arrangement.
- Percentage of projects successfully exported.
- Number of sections users retain or regenerate.
- Whether users can explain the difference between the three arrangements.
- Whether the result feels like their original idea.
- Where users abandon the workflow.
- Which controls cause confusion.

Do not treat the number of generated arrangements as the main success metric.

---

# 23. Required Development Deliverables

Maintain these project documents:

- `README.md` — installation, launch and build instructions.
- `docs/ARCHITECTURE.md` — modules and technical decisions.
- `docs/PRODUCT_SPEC.md` — implemented product behaviour.
- `docs/ARRANGEMENT_ENGINE.md` — generation rules and limitations.
- `docs/MIDI_SUPPORT.md` — supported MIDI features and known limitations.
- `docs/INTEGRATIONS.md` — verified SONORA integration contracts.
- `docs/TESTING.md` — test commands and expected results.
- `docs/ROADMAP.md` — completed, active and planned work.
- `CHANGELOG.md` — meaningful changes between versions.

Keep documentation aligned with the actual implementation.

Do not mark future integrations as completed merely because their planned interfaces have been documented.

---

# 24. Required Working Method

Use the following implementation loop:

**Inspect → Plan → Implement → Build → Test → Fix → Document.**

After each phase, report:

1. What was implemented.
2. Which files were changed.
3. Which build commands were run.
4. Which tests passed.
5. Which tests failed and why.
6. What still does not work.
7. What should be built next.

Do not report a successful build if the build was not actually run.

Do not hide failing tests.

If a dependency or platform limitation prevents an operation, explain the issue and continue with the best supported implementation.

Prioritise a complete, testable core over a large number of partially implemented features.

---

# 25. Final Product Standard

SongWeaver should feel like a creative collaborator that understands the user's musical idea.

It should help a beginner finish a track without needing to understand every technical detail, while giving an experienced producer enough control to trust the result.

The original loop must remain recognisable. Variations must be intentional. Song sections must have a purpose. Exports must be correct. Integrations must be real. The interface must be polished without sacrificing functionality.

**The defining product experience:**

A producer imports a loop, auditions three genuinely different musical journeys, chooses one, shapes the arrangement section by section, and exports a song structure they can continue producing in their DAW.

**Build that experience first. Make everything else earn its place.**

## Begin now

Inspect the current repository and toolchain. Report the findings briefly, then start Phase 0 and proceed into the first implementation phase without waiting for another prompt. Preserve existing working code, build frequently, test continuously, and keep the project runnable throughout development.