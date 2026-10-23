# Testing Strategy & Automated Acceptance Suite

## Section 19 Verification Matrix

SONORA SongWeaver includes an automated test runner accessible via the top navigation bar ("Engine Tests") as well as via automated test suites.

| Test ID | Name | Category | Acceptance Criteria |
|---|---|---|---|
| **TEST_A** | 8-Bar Source Arrangement | Arrangement Engine | Generates 3 distinct concepts (Build, Atmospheric, Performance); different total bars; valid layouts. |
| **TEST_B** | Multi-Track Role Preservation | Project Model | All tracks (drums, log-drum, chords, melody, texture) preserved; section activity profiles intact. |
| **TEST_C** | Locked Melody Pitch Safeguard | Variation Engine | Pitch sequence of locked melody is 100% preserved during variation generation without corrupting harmonic keys. |
| **TEST_D** | Isolated Section Regeneration | Arrangement Engine | Regenerating Section N leaves clips in all other sections 100% unaltered. |
| **TEST_E** | MIDI Binary Round-Trip | MIDI I/O | Export project to Type 1 SMF binary -> parse back -> verify note pitches, count, and tempo without data loss. |
| **TEST_F** | Seed Reproducibility | Variation Engine | Identical random seed produces bit-exact identical note layouts across independent runs. |

### Running Tests in Application:
Click the **"Engine Tests"** button in the top bar to run all tests with real-time assertions.
