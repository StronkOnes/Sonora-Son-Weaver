/**
 * SONORA SongWeaver - Musical Variation Engine
 * Implements non-destructive musical transformations that preserve musical identity.
 */

import { MidiNote, Clip, TrackRole } from '../../types/music';

export interface VariationOptions {
  intensity: number;      // 0.0 to 1.0 (0 = subtle humanization, 1 = adventurous)
  strategy?: 'simplify' | 'busy' | 'energy' | 'spacious' | 'turnaround' | 'octave' | 'default';
  role?: TrackRole;
  preservePitches?: boolean;
  preserveTiming?: boolean;
  seed?: number;
}

// Simple seeded pseudo-random generator for deterministic, repeatable generation
function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Creates a musically varied version of a set of MIDI notes.
 * Completely non-destructive: original notes are not modified.
 */
export function generateNoteVariation(
  sourceNotes: MidiNote[],
  options: VariationOptions
): MidiNote[] {
  if (sourceNotes.length === 0) return [];

  const rand = pseudoRandom(options.seed || 12345);
  const intensity = Math.max(0, Math.min(1.0, options.intensity));
  const strategy = options.strategy || 'default';
  const role = options.role || 'unassigned';

  let varied: MidiNote[] = [];

  // Deep clone source notes
  for (const n of sourceNotes) {
    varied.push({
      id: `var_${Math.random().toString(36).substring(2, 9)}`,
      pitch: n.pitch,
      startTick: n.startTick,
      durationTick: n.durationTick,
      velocity: n.velocity,
    });
  }

  // 1. Strategy: Simplify / Spacious (Selective Note Omission)
  if (strategy === 'simplify' || strategy === 'spacious') {
    // Keep strong beats (downbeats and backbeats), omit syncopated filler
    const dropProbability = strategy === 'spacious' ? 0.45 * intensity : 0.3 * intensity;
    varied = varied.filter(n => {
      // Is note on a downbeat (beat 1 or 3)? Keep it
      const beatPosition = (n.startTick % 1920) / 480;
      const isDownbeat = Math.abs(beatPosition - Math.round(beatPosition)) < 0.05 && (Math.round(beatPosition) === 0 || Math.round(beatPosition) === 2);
      if (isDownbeat) return true;
      return rand() > dropProbability;
    });
  }

  // 2. Strategy: Busy / Energy (Note subdivision & pickups)
  if ((strategy === 'busy' || strategy === 'energy') && !options.preserveTiming) {
    const additionalNotes: MidiNote[] = [];
    for (const n of varied) {
      // If note duration is long (> 1 beat = 480 ticks), occasionally subdivide or add pickup
      if (n.durationTick >= 480 && rand() < 0.35 * intensity) {
        if (role === 'drums') {
          // Snare roll or hi-hat double
          additionalNotes.push({
            id: `sub_${Math.random().toString(36).substring(2, 9)}`,
            pitch: n.pitch,
            startTick: n.startTick + Math.round(n.durationTick * 0.5),
            durationTick: Math.round(n.durationTick * 0.45),
            velocity: Math.max(40, Math.round(n.velocity * 0.85)),
          });
        } else if (role === 'melody' || role === 'log-drum') {
          // Answering note
          additionalNotes.push({
            id: `sub_${Math.random().toString(36).substring(2, 9)}`,
            pitch: options.preservePitches ? n.pitch : (rand() > 0.5 ? n.pitch + 2 : n.pitch - 2),
            startTick: n.startTick + Math.round(n.durationTick * 0.6),
            durationTick: Math.round(n.durationTick * 0.35),
            velocity: Math.max(45, Math.round(n.velocity * 0.9)),
          });
        }
      }
    }
    varied = [...varied, ...additionalNotes].sort((a, b) => a.startTick - b.startTick);
  }

  // 3. Velocity humanization & shaping
  for (const n of varied) {
    if (strategy === 'energy') {
      // Boost velocity for higher energy
      n.velocity = Math.min(125, Math.round(n.velocity * (1.0 + 0.15 * intensity)));
    } else if (strategy === 'spacious') {
      // Soften velocity
      n.velocity = Math.max(35, Math.round(n.velocity * (1.0 - 0.2 * intensity)));
    } else {
      // Subtle humanization (+/- 8 velocity)
      const deltaVel = Math.round((rand() * 16 - 8) * intensity);
      n.velocity = Math.max(30, Math.min(127, n.velocity + deltaVel));
    }
  }

  // 4. Octave shift (for melody or texture if not locked)
  if (strategy === 'octave' && !options.preservePitches) {
    const shift = rand() > 0.5 ? 12 : -12;
    for (const n of varied) {
      if (n.pitch + shift >= 24 && n.pitch + shift <= 108) {
        n.pitch += shift;
      }
    }
  }

  // 5. Turnaround Fills (at the final bar of the clip)
  if (strategy === 'turnaround' && varied.length > 0) {
    const maxTick = Math.max(...varied.map(n => n.startTick + n.durationTick));
    const turnaroundStartTick = Math.max(0, maxTick - 960); // last 2 beats
    for (const n of varied) {
      if (n.startTick >= turnaroundStartTick) {
        // Boost velocity of turnaround
        n.velocity = Math.min(127, Math.round(n.velocity * 1.2));
      }
    }
  }

  return varied;
}

/**
 * Creates a varied clone of a clip
 */
export function createVariedClip(
  sourceClip: Clip,
  targetStartBar: number,
  targetDurationBars: number,
  options: VariationOptions,
  ppq: number = 480
): Clip {
  const ticksPerBar = 4 * ppq;
  const sourceLengthTicks = sourceClip.durationBars * ticksPerBar;

  // If target duration is longer than source, repeat source notes across bars
  const fullRepeatedNotes: MidiNote[] = [];
  const repetitions = Math.ceil(targetDurationBars / sourceClip.durationBars);

  for (let rep = 0; rep < repetitions; rep++) {
    const repOffsetTicks = rep * sourceLengthTicks;
    for (const n of sourceClip.notes) {
      const offsetNoteTick = repOffsetTicks + n.startTick;
      if (offsetNoteTick < targetDurationBars * ticksPerBar) {
        fullRepeatedNotes.push({
          ...n,
          startTick: offsetNoteTick,
        });
      }
    }
  }

  // Apply musical variation if intensity > 0
  const finalNotes = options.intensity > 0
    ? generateNoteVariation(fullRepeatedNotes, options)
    : fullRepeatedNotes;

  return {
    id: `clip_var_${Math.random().toString(36).substring(2, 9)}`,
    trackId: sourceClip.trackId,
    name: `${sourceClip.name} [Var ${Math.round(options.intensity * 100)}%]`,
    startBar: targetStartBar,
    durationBars: targetDurationBars,
    notes: finalNotes,
    origin: options.intensity > 0 ? 'transformed' : 'duplicated',
    sourceClipId: sourceClip.id,
    variationId: `v_${options.strategy || 'std'}_${Math.round(options.intensity * 100)}`,
  };
}
