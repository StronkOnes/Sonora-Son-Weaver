/**
 * SONORA SongWeaver - Arrangement Engine
 * Transforms source loops into complete, editable musical arrangements.
 * Generates 3 distinct concepts: Build, Atmospheric, and Performance.
 */

import {
  SongProject,
  ArrangementConcept,
  ArrangementStyle,
  Section,
  Clip,
  Track,
  SongLengthPreset,
  SectionType,
} from '../../types/music';
import { createVariedClip } from './variationEngine';

interface SectionBlueprint {
  name: string;
  type: SectionType;
  durationMultiplier: number; // in units of source loop bars (e.g. 1 = 8 bars, 2 = 16 bars)
  energyTarget: number;
  rolesActive: string[];      // Roles that are active (e.g. ['chords', 'texture'])
  rolesMuted: string[];       // Explicitly muted roles
  variationStrategy: 'simplify' | 'busy' | 'energy' | 'spacious' | 'turnaround' | 'octave' | 'default';
  variationIntensity: number; // 0.0 to 1.0
  transitionType?: 'none' | 'fill' | 'mute-drop' | 'riser' | 'pickup';
  intention: string;
}

// 1. Concept: Build (Progressive Layering & Climactic Arc)
const BUILD_BLUEPRINTS: SectionBlueprint[] = [
  {
    name: 'Intro',
    type: 'intro',
    durationMultiplier: 1.0,
    energyTarget: 35,
    rolesActive: ['chords', 'texture'],
    rolesMuted: ['drums', 'bass', 'log-drum', 'melody'],
    variationStrategy: 'spacious',
    variationIntensity: 0.3,
    transitionType: 'pickup',
    intention: 'Establish atmosphere and chord harmonic foundation without revealing the full beat',
  },
  {
    name: 'Main A (Verse 1)',
    type: 'main-a',
    durationMultiplier: 2.0,
    energyTarget: 60,
    rolesActive: ['drums', 'chords', 'texture'],
    rolesMuted: ['bass', 'log-drum'],
    variationStrategy: 'default',
    variationIntensity: 0.15,
    transitionType: 'none',
    intention: 'Introduce recognizable drum groove while keeping low-end in reserve',
  },
  {
    name: 'Build',
    type: 'build',
    durationMultiplier: 1.0,
    energyTarget: 78,
    rolesActive: ['drums', 'chords', 'melody', 'texture'],
    rolesMuted: ['bass', 'log-drum'],
    variationStrategy: 'energy',
    variationIntensity: 0.5,
    transitionType: 'riser',
    intention: 'Increase tension with rhythmic activity and filter rise before the drop',
  },
  {
    name: 'Hook A (First Climax)',
    type: 'hook-a',
    durationMultiplier: 2.0,
    energyTarget: 95,
    rolesActive: ['drums', 'bass', 'log-drum', 'chords', 'melody', 'texture'],
    rolesMuted: [],
    variationStrategy: 'default',
    variationIntensity: 0.2,
    transitionType: 'mute-drop',
    intention: 'Unleash full groove: log-drum/bass drops in with complete ensemble',
  },
  {
    name: 'Breakdown',
    type: 'breakdown',
    durationMultiplier: 1.0,
    energyTarget: 40,
    rolesActive: ['chords', 'texture', 'melody'],
    rolesMuted: ['drums', 'bass', 'log-drum'],
    variationStrategy: 'spacious',
    variationIntensity: 0.4,
    transitionType: 'fill',
    intention: 'Strip away all low-end and rhythm to provide breathing room and emotional contrast',
  },
  {
    name: 'Hook B (Final Climax)',
    type: 'hook-b',
    durationMultiplier: 2.0,
    energyTarget: 100,
    rolesActive: ['drums', 'bass', 'log-drum', 'chords', 'melody', 'texture'],
    rolesMuted: [],
    variationStrategy: 'busy',
    variationIntensity: 0.6,
    transitionType: 'none',
    intention: 'Return at maximum intensity with syncopated turnaround fills and variations',
  },
  {
    name: 'Outro',
    type: 'outro',
    durationMultiplier: 1.0,
    energyTarget: 30,
    rolesActive: ['chords', 'texture', 'drums'],
    rolesMuted: ['bass', 'log-drum', 'melody'],
    variationStrategy: 'simplify',
    variationIntensity: 0.4,
    transitionType: 'none',
    intention: 'Gradual subtraction of elements leading to a natural, deliberate close',
  },
];

// 2. Concept: Atmospheric (Spacious, Dynamic Space & Contrast)
const ATMOSPHERIC_BLUEPRINTS: SectionBlueprint[] = [
  {
    name: 'Ambient Intro',
    type: 'intro',
    durationMultiplier: 1.0,
    energyTarget: 25,
    rolesActive: ['texture', 'chords'],
    rolesMuted: ['drums', 'bass', 'log-drum', 'melody'],
    variationStrategy: 'spacious',
    variationIntensity: 0.5,
    transitionType: 'none',
    intention: 'Spacious harmonic backdrop allowing the core motif to breathe',
  },
  {
    name: 'Minimal Verse',
    type: 'verse',
    durationMultiplier: 2.0,
    energyTarget: 48,
    rolesActive: ['bass', 'log-drum', 'texture', 'chords'],
    rolesMuted: ['drums', 'melody'],
    variationStrategy: 'simplify',
    variationIntensity: 0.3,
    transitionType: 'pickup',
    intention: 'Subtle bass groove without full percussion, intimate and focused',
  },
  {
    name: 'Tension Rise',
    type: 'build',
    durationMultiplier: 1.0,
    energyTarget: 68,
    rolesActive: ['drums', 'texture', 'melody'],
    rolesMuted: ['bass', 'log-drum'],
    variationStrategy: 'energy',
    variationIntensity: 0.35,
    transitionType: 'riser',
    intention: 'Light percussive rise leading toward the deep hook',
  },
  {
    name: 'Deep Hook',
    type: 'chorus',
    durationMultiplier: 2.0,
    energyTarget: 86,
    rolesActive: ['drums', 'bass', 'log-drum', 'chords', 'melody', 'texture'],
    rolesMuted: [],
    variationStrategy: 'default',
    variationIntensity: 0.25,
    transitionType: 'none',
    intention: 'Broad stereo panorama with full instrumental weight',
  },
  {
    name: 'Extended Breakdown',
    type: 'breakdown',
    durationMultiplier: 1.5,
    energyTarget: 32,
    rolesActive: ['chords', 'melody'],
    rolesMuted: ['drums', 'bass', 'log-drum', 'texture'],
    variationStrategy: 'spacious',
    variationIntensity: 0.45,
    transitionType: 'fill',
    intention: 'Melodic spotlight with zero low-end, maximum emotional vulnerability',
  },
  {
    name: 'Resolution Hook',
    type: 'hook-b',
    durationMultiplier: 1.5,
    energyTarget: 88,
    rolesActive: ['drums', 'bass', 'log-drum', 'chords', 'melody', 'texture'],
    rolesMuted: [],
    variationStrategy: 'octave',
    variationIntensity: 0.4,
    transitionType: 'none',
    intention: 'Warm resolution with octave harmonic layer',
  },
  {
    name: 'Decay Outro',
    type: 'outro',
    durationMultiplier: 1.0,
    energyTarget: 20,
    rolesActive: ['texture'],
    rolesMuted: ['drums', 'bass', 'log-drum', 'chords', 'melody'],
    variationStrategy: 'simplify',
    variationIntensity: 0.6,
    transitionType: 'none',
    intention: 'Ambient fade into silence',
  },
];

// 3. Concept: Performance (High-Energy DJ/Club Rhythmic Variations)
const PERFORMANCE_BLUEPRINTS: SectionBlueprint[] = [
  {
    name: 'DJ Intro',
    type: 'intro',
    durationMultiplier: 1.0,
    energyTarget: 65,
    rolesActive: ['drums', 'bass', 'log-drum'],
    rolesMuted: ['melody', 'texture'],
    variationStrategy: 'default',
    variationIntensity: 0.1,
    transitionType: 'pickup',
    intention: 'Immediate rhythm-section entry designed for DJ mix-in compatibility',
  },
  {
    name: 'Hook 1 (Main Theme)',
    type: 'hook-a',
    durationMultiplier: 1.5,
    energyTarget: 90,
    rolesActive: ['drums', 'bass', 'log-drum', 'chords', 'melody', 'texture'],
    rolesMuted: [],
    variationStrategy: 'default',
    variationIntensity: 0.15,
    transitionType: 'none',
    intention: 'Direct hit with the main identifiable hook early in the track',
  },
  {
    name: 'Groove Verse',
    type: 'verse',
    durationMultiplier: 2.0,
    energyTarget: 70,
    rolesActive: ['drums', 'log-drum', 'bass', 'chords'],
    rolesMuted: ['melody'],
    variationStrategy: 'busy',
    variationIntensity: 0.35,
    transitionType: 'none',
    intention: 'Deep rolling pocket with syncopated comping variations',
  },
  {
    name: 'Quick Build',
    type: 'build',
    durationMultiplier: 0.5, // 4 bars for 8-bar loop
    energyTarget: 85,
    rolesActive: ['drums', 'chords', 'melody'],
    rolesMuted: ['bass', 'log-drum'],
    variationStrategy: 'turnaround',
    variationIntensity: 0.55,
    transitionType: 'riser',
    intention: 'High-speed tension build and snare acceleration',
  },
  {
    name: 'Club Drop (Climax)',
    type: 'drop',
    durationMultiplier: 2.0,
    energyTarget: 98,
    rolesActive: ['drums', 'bass', 'log-drum', 'chords', 'melody', 'texture'],
    rolesMuted: [],
    variationStrategy: 'busy',
    variationIntensity: 0.6,
    transitionType: 'mute-drop',
    intention: 'Maximum physical impact with heavy bass/log-drum fills and vocal/lead answers',
  },
  {
    name: 'Filter Breakdown',
    type: 'breakdown',
    durationMultiplier: 1.0,
    energyTarget: 55,
    rolesActive: ['melody', 'chords', 'texture'],
    rolesMuted: ['drums', 'bass', 'log-drum'],
    variationStrategy: 'spacious',
    variationIntensity: 0.3,
    transitionType: 'fill',
    intention: 'High-pass filter feel with isolated melody before the final push',
  },
  {
    name: 'Second Drop',
    type: 'hook-b',
    durationMultiplier: 1.5,
    energyTarget: 96,
    rolesActive: ['drums', 'bass', 'log-drum', 'chords', 'melody', 'texture'],
    rolesMuted: [],
    variationStrategy: 'turnaround',
    variationIntensity: 0.5,
    transitionType: 'none',
    intention: 'Second climax with complex turnaround rhythms',
  },
  {
    name: 'DJ Outro',
    type: 'outro',
    durationMultiplier: 1.0,
    energyTarget: 50,
    rolesActive: ['drums', 'bass', 'log-drum'],
    rolesMuted: ['chords', 'melody', 'texture'],
    variationStrategy: 'simplify',
    variationIntensity: 0.25,
    transitionType: 'none',
    intention: 'Clean rhythm stems for transitioning to the next track',
  },
];

/**
 * Builds the 3 arrangement candidates from a SongProject
 */
export function generateArrangementConcepts(
  project: SongProject,
  preset: SongLengthPreset = 'medium'
): ArrangementConcept[] {
  const sourceBars = Math.max(4, project.sourceBars || 8);
  const bpm = project.tempo;
  const secPerBeat = 60 / bpm;
  const beatsPerBar = project.timeSignature[0];
  const secPerBar = beatsPerBar * secPerBeat;

  // Preset length multiplier
  let lengthMultiplier = 1.0;
  if (preset === 'short') lengthMultiplier = 0.6;
  if (preset === 'extended') lengthMultiplier = 1.4;

  const styles: ArrangementStyle[] = ['build', 'atmospheric', 'performance'];
  const concepts: ArrangementConcept[] = [];

  for (const style of styles) {
    let blueprints: SectionBlueprint[] = [];
    let name = '';
    let tagline = '';
    let description = '';
    let variationChars: string[] = [];

    if (style === 'build') {
      blueprints = BUILD_BLUEPRINTS;
      name = 'Build & Climax';
      tagline = 'Progressive dynamic layering toward a powerful hook';
      description = 'Starts sparse with chords and textures, introduces groove progressively, builds tension into full-energy hooks, and offers a dynamic breakdown.';
      variationChars = [
        'Progressive instrument addition across sections',
        'Tension snare fills and riser before the drop',
        'High-energy turnaround variations in Hook B',
        'Deliberate harmonic taper in Outro',
      ];
    } else if (style === 'atmospheric') {
      blueprints = ATMOSPHERIC_BLUEPRINTS;
      name = 'Atmospheric & Deep';
      tagline = 'Spacious arrangement prioritizing space, contrast, and emotion';
      description = 'Leaves room for the core musical motif to breathe. Contrasts quiet, intimate verses with deep, expansive hooks and a prolonged melodic breakdown.';
      variationChars = [
        'Minimalist verse with sub-bass focus',
        'Extended melodic breakdown without drums',
        'Octave harmonic layering in resolution hook',
        'Natural ambient decay outro',
      ];
    } else {
      blueprints = PERFORMANCE_BLUEPRINTS;
      name = 'Club Performance';
      tagline = 'High-energy DJ structure with immediate hooks and turnaround fills';
      description = 'Establishes a driving groove immediately for DJ transitions, drops into an early hook statement, and builds into explosive, syncopated club climaxes.';
      variationChars = [
        'DJ-ready drum & bass intro and outro',
        'Immediate early hook statement',
        'Accelerated snare builds into drops',
        'Syncopated turnaround fills on the last bar of sections',
      ];
    }

    const sections: Section[] = [];
    let currentBar = 1;

    for (let i = 0; i < blueprints.length; i++) {
      const bp = blueprints[i];
      let rawBars = Math.round(bp.durationMultiplier * sourceBars * lengthMultiplier);
      // Ensure even bar count, min 4 bars
      rawBars = Math.max(4, Math.round(rawBars / 2) * 2);

      const trackActivity: Record<string, boolean> = {};
      const variationSettings: Record<string, number> = {};

      for (const track of project.tracks) {
        // Check active / muted roles
        const isMutedByRole = bp.rolesMuted.includes(track.role);
        const isActiveByRole = bp.rolesActive.includes(track.role);
        const active = isActiveByRole && !isMutedByRole;
        trackActivity[track.id] = active;
        variationSettings[track.id] = bp.variationIntensity;
      }

      sections.push({
        id: `sec_${style}_${i + 1}`,
        name: bp.name,
        type: bp.type,
        startBar: currentBar,
        durationBars: rawBars,
        energyTarget: bp.energyTarget,
        trackActivity,
        variationSettings,
        transitionType: bp.transitionType || 'none',
        musicalIntention: bp.intention,
      });

      currentBar += rawBars;
    }

    const totalBars = currentBar - 1;
    const estSeconds = Math.round(totalBars * secPerBar);

    concepts.push({
      id: `concept_${style}`,
      style,
      name,
      tagline,
      description,
      totalBars,
      estimatedDurationSeconds: estSeconds,
      sections,
      energyProfile: sections.map(s => s.energyTarget),
      variationCharacteristics: variationChars,
    });
  }

  return concepts;
}

/**
 * Applies an arrangement concept to a project, generating the complete timeline of clips.
 * Guaranteed non-destructive: original source material in sourceClips is preserved!
 */
export function applyArrangementConcept(
  project: SongProject,
  concept: ArrangementConcept
): SongProject {
  const updatedSections = [...concept.sections];
  const newClips: Clip[] = [];

  // For each section, instantiate clips for each track according to section.trackActivity
  for (const section of updatedSections) {
    for (const track of project.tracks) {
      // Find source clip for this track
      const sourceClip = project.sourceClips.find(c => c.trackId === track.id);
      if (!sourceClip || sourceClip.notes.length === 0) continue;

      const isTrackActive = section.trackActivity[track.id] !== false;
      const variationIntensity = section.variationSettings?.[track.id] || 0.2;

      // Determine strategy based on section type
      let strategy: 'simplify' | 'busy' | 'energy' | 'spacious' | 'turnaround' | 'octave' | 'default' = 'default';
      if (section.type === 'intro' || section.type === 'outro') {
        strategy = 'simplify';
      } else if (section.type === 'breakdown') {
        strategy = 'spacious';
      } else if (section.type === 'build') {
        strategy = 'energy';
      } else if (section.type === 'hook-b' || section.type === 'drop') {
        strategy = 'busy';
      }

      const clip = createVariedClip(
        sourceClip,
        section.startBar,
        section.durationBars,
        {
          intensity: variationIntensity,
          strategy,
          role: track.role,
          preservePitches: track.role === 'melody', // melody pitch lock safeguard
          seed: project.randomSeed + section.startBar,
        },
        project.ppq
      );

      clip.isMuted = !isTrackActive;
      newClips.push(clip);
    }
  }

  return {
    ...project,
    activeArrangementStyle: concept.style,
    totalBars: concept.totalBars,
    sections: updatedSections,
    clips: newClips,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Isolated Section Regeneration (Section 9 Requirement):
 * Regenerates ONLY the specified section without altering any other sections!
 */
export function regenerateSection(
  project: SongProject,
  sectionId: string,
  action: 'regenerate' | 'simpler' | 'busier' | 'energetic' | 'spacious' | 'preserve-melody' | 'mute-bass'
): SongProject {
  const sectionIndex = project.sections.findIndex(s => s.id === sectionId);
  if (sectionIndex === -1) return project;

  const targetSection = { ...project.sections[sectionIndex] };
  const updatedSections = [...project.sections];

  // Adjust section target properties
  if (action === 'simpler') {
    targetSection.energyTarget = Math.max(20, targetSection.energyTarget - 15);
  } else if (action === 'busier' || action === 'energetic') {
    targetSection.energyTarget = Math.min(100, targetSection.energyTarget + 15);
  } else if (action === 'spacious') {
    targetSection.energyTarget = Math.max(25, targetSection.energyTarget - 20);
  } else if (action === 'mute-bass') {
    // Mute bass / log-drum in this section
    for (const track of project.tracks) {
      if (track.role === 'bass' || track.role === 'log-drum') {
        targetSection.trackActivity[track.id] = false;
      }
    }
  }

  updatedSections[sectionIndex] = targetSection;

  // Regenerate ONLY clips inside this section!
  // Clips outside this section remain 100% untouched.
  const untouchedClips = project.clips.filter(
    c => c.startBar < targetSection.startBar || c.startBar >= targetSection.startBar + targetSection.durationBars
  );

  const regeneratedClips: Clip[] = [];
  const newSeed = project.randomSeed + Math.floor(Math.random() * 10000) + 1;

  for (const track of project.tracks) {
    const sourceClip = project.sourceClips.find(c => c.trackId === track.id);
    if (!sourceClip || sourceClip.notes.length === 0) continue;

    const isTrackActive = targetSection.trackActivity[track.id] !== false;
    let strategy: 'simplify' | 'busy' | 'energy' | 'spacious' | 'turnaround' | 'octave' | 'default' = 'default';

    if (action === 'simpler') strategy = 'simplify';
    else if (action === 'busier') strategy = 'busy';
    else if (action === 'energetic') strategy = 'energy';
    else if (action === 'spacious') strategy = 'spacious';

    const intensity = action === 'simpler' || action === 'spacious' ? 0.4 : 0.6;

    const clip = createVariedClip(
      sourceClip,
      targetSection.startBar,
      targetSection.durationBars,
      {
        intensity,
        strategy,
        role: track.role,
        preservePitches: action === 'preserve-melody' || track.role === 'melody',
        seed: newSeed,
      },
      project.ppq
    );

    clip.isMuted = !isTrackActive;
    regeneratedClips.push(clip);
  }

  return {
    ...project,
    randomSeed: newSeed,
    sections: updatedSections,
    clips: [...untouchedClips, ...regeneratedClips].sort((a, b) => a.startBar - b.startBar),
    updatedAt: new Date().toISOString(),
  };
}
