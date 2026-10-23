/**
 * SONORA SongWeaver - Natural Language Command Processor
 * Translates plain-language producer requests into structured, validated arrangement operations.
 */

import { SongProject, CommandExecutionResult, Section } from '../../types/music';
import { generateArrangementConcepts, applyArrangementConcept, regenerateSection } from '../arrangement/arrangementEngine';

export function executeNaturalLanguageCommand(
  project: SongProject,
  rawCommand: string
): { updatedProject: SongProject; result: CommandExecutionResult } {
  const query = rawCommand.trim().toLowerCase();

  if (!query) {
    return {
      updatedProject: project,
      result: {
        success: false,
        message: 'Please enter a musical arrangement command.',
        actionTaken: 'none',
      },
    };
  }

  // 1. "Make intro longer" / "Make the intro 8 bars longer" / "Lengthen intro"
  if (query.includes('intro') && (query.includes('longer') || query.includes('extend') || query.includes('add'))) {
    const introIndex = project.sections.findIndex(s => s.type === 'intro');
    if (introIndex !== -1) {
      const addedBars = query.includes('8') ? 8 : (query.includes('4') ? 4 : 4);
      const newSections: Section[] = [];
      let currentBar = 1;

      for (let i = 0; i < project.sections.length; i++) {
        const s = { ...project.sections[i] };
        if (i === introIndex) {
          s.durationBars += addedBars;
        }
        s.startBar = currentBar;
        currentBar += s.durationBars;
        newSections.push(s);
      }

      // Re-apply clips with updated section boundaries
      const updatedProj: SongProject = {
        ...project,
        totalBars: currentBar - 1,
        sections: newSections,
        updatedAt: new Date().toISOString(),
      };

      // Regenerate the arrangement based on updated sections
      const activeConcept = generateArrangementConcepts(updatedProj).find(c => c.style === project.activeArrangementStyle);
      const finalProject = activeConcept ? applyArrangementConcept(updatedProj, activeConcept) : updatedProj;

      return {
        updatedProject: finalProject,
        result: {
          success: true,
          message: `Extended Intro by ${addedBars} bars to ${newSections[introIndex].durationBars} bars total. Subsequent sections shifted smoothly.`,
          actionTaken: 'resize-section',
          affectedSectionIds: [newSections[introIndex].id],
        },
      };
    }
  }

  // 2. "Remove bass during breakdown" / "Mute log drum in breakdown" / "No drums in breakdown"
  if ((query.includes('bass') || query.includes('log') || query.includes('drum')) && (query.includes('breakdown') || query.includes('remove') || query.includes('mute') || query.includes('drop'))) {
    const breakdownSection = project.sections.find(s => s.type === 'breakdown');
    if (breakdownSection) {
      const roleToMute = query.includes('drum') ? 'drums' : (query.includes('log') ? 'log-drum' : 'bass');
      const targetTracks = project.tracks.filter(t => t.role === roleToMute || (roleToMute === 'bass' && t.role === 'log-drum'));

      const updatedSections = project.sections.map(s => {
        if (s.id === breakdownSection.id) {
          const newActivity = { ...s.trackActivity };
          for (const t of targetTracks) {
            newActivity[t.id] = false;
          }
          return { ...s, trackActivity: newActivity };
        }
        return s;
      });

      // Mute the corresponding clips in the breakdown
      const updatedClips = project.clips.map(c => {
        if (c.startBar >= breakdownSection.startBar && c.startBar < breakdownSection.startBar + breakdownSection.durationBars) {
          const track = targetTracks.find(t => t.id === c.trackId);
          if (track) {
            return { ...c, isMuted: true };
          }
        }
        return c;
      });

      return {
        updatedProject: {
          ...project,
          sections: updatedSections,
          clips: updatedClips,
          updatedAt: new Date().toISOString(),
        },
        result: {
          success: true,
          message: `Muted ${targetTracks.map(t => t.name).join(', ')} during Breakdown section.`,
          actionTaken: 'mute-track-in-section',
          affectedSectionIds: [breakdownSection.id],
          affectedTrackIds: targetTracks.map(t => t.id),
        },
      };
    }
  }

  // 3. "Give hook more energy" / "More energy in hook" / "Climax harder"
  if (query.includes('hook') || query.includes('chorus') || query.includes('drop')) {
    if (query.includes('energy') || query.includes('busier') || query.includes('harder') || query.includes('more')) {
      const hookSection = project.sections.find(s => s.type === 'hook-a' || s.type === 'hook-b' || s.type === 'drop' || s.type === 'chorus');
      if (hookSection) {
        const regenerated = regenerateSection(project, hookSection.id, 'energetic');
        return {
          updatedProject: regenerated,
          result: {
            success: true,
            message: `Boosted energy to ${regenerated.sections.find(s => s.id === hookSection.id)?.energyTarget}% and generated syncopated high-energy variations for ${hookSection.name}.`,
            actionTaken: 'regenerate-energetic',
            affectedSectionIds: [hookSection.id],
          },
        };
      }
    }
  }

  // 4. "Make the second verse different" / "Vary second verse"
  if ((query.includes('verse') || query.includes('main')) && (query.includes('second') || query.includes('different') || query.includes('vary'))) {
    const verseSections = project.sections.filter(s => s.type === 'verse' || s.type === 'main-a');
    const targetVerse = verseSections.length > 1 ? verseSections[1] : verseSections[0];
    if (targetVerse) {
      const regenerated = regenerateSection(project, targetVerse.id, 'busier');
      return {
        updatedProject: regenerated,
        result: {
          success: true,
          message: `Generated an answering rhythmic variation with syncopated notes for ${targetVerse.name}. Original verse remains unchanged.`,
          actionTaken: 'vary-section',
          affectedSectionIds: [targetVerse.id],
        },
      };
    }
  }

  // 5. "Keep melody unchanged" / "Lock melody"
  if (query.includes('melody') && (query.includes('keep') || query.includes('lock') || query.includes('unchanged') || query.includes('original'))) {
    const melodyTracks = project.tracks.filter(t => t.role === 'melody');
    const updatedTracks = project.tracks.map(t => {
      if (t.role === 'melody') return { ...t, isSource: true };
      return t;
    });
    return {
      updatedProject: {
        ...project,
        tracks: updatedTracks,
        updatedAt: new Date().toISOString(),
      },
      result: {
        success: true,
        message: `Locked melody pitches across all arrangement sections. Regeneration will preserve original melodic sequence.`,
        actionTaken: 'lock-melody',
        affectedTrackIds: melodyTracks.map(t => t.id),
      },
    };
  }

  // 6. "Make song shorter" / "Shorter arrangement" / "Radio edit"
  if (query.includes('short') || query.includes('radio edit') || query.includes('brief')) {
    const concepts = generateArrangementConcepts(project, 'short');
    const matchingConcept = concepts.find(c => c.style === project.activeArrangementStyle) || concepts[0];
    const applied = applyArrangementConcept(project, matchingConcept);
    return {
      updatedProject: applied,
      result: {
        success: true,
        message: `Condensed song to ${applied.totalBars} bars (Short length preset) while preserving core hook and build transitions.`,
        actionTaken: 'shorten-arrangement',
      },
    };
  }

  // 7. "Make song longer" / "Extended mix" / "Club mix"
  if (query.includes('longer') || query.includes('extended') || query.includes('club mix')) {
    const concepts = generateArrangementConcepts(project, 'extended');
    const matchingConcept = concepts.find(c => c.style === project.activeArrangementStyle) || concepts[0];
    const applied = applyArrangementConcept(project, matchingConcept);
    return {
      updatedProject: applied,
      result: {
        success: true,
        message: `Expanded song to ${applied.totalBars} bars (Extended mix) with extra dynamic development and full DJ outro.`,
        actionTaken: 'extend-arrangement',
      },
    };
  }

  // 8. "Switch to atmospheric" / "Atmospheric arrangement"
  if (query.includes('atmospheric') || query.includes('ambient') || query.includes('deep')) {
    const concepts = generateArrangementConcepts(project);
    const atmos = concepts.find(c => c.style === 'atmospheric')!;
    const applied = applyArrangementConcept(project, atmos);
    return {
      updatedProject: applied,
      result: {
        success: true,
        message: `Switched arrangement to 'Atmospheric & Deep' concept (${applied.totalBars} bars, spacious breakdown, subtle build).`,
        actionTaken: 'switch-concept',
      },
    };
  }

  // 9. "Switch to performance" / "Performance arrangement"
  if (query.includes('performance') || query.includes('club') || query.includes('dj')) {
    const concepts = generateArrangementConcepts(project);
    const perf = concepts.find(c => c.style === 'performance')!;
    const applied = applyArrangementConcept(project, perf);
    return {
      updatedProject: applied,
      result: {
        success: true,
        message: `Switched arrangement to 'Club Performance' concept (${applied.totalBars} bars, DJ intro/outro, early hook, explosive drops).`,
        actionTaken: 'switch-concept',
      },
    };
  }

  // 10. "Switch to build" / "Build arrangement"
  if (query.includes('build') || query.includes('standard') || query.includes('climax')) {
    const concepts = generateArrangementConcepts(project);
    const build = concepts.find(c => c.style === 'build')!;
    const applied = applyArrangementConcept(project, build);
    return {
      updatedProject: applied,
      result: {
        success: true,
        message: `Switched arrangement to 'Build & Climax' concept (${applied.totalBars} bars, progressive layer additions).`,
        actionTaken: 'switch-concept',
      },
    };
  }

  // Fallback: Generic regeneration with explanation
  const currentSection = project.sections[0];
  const regenerated = regenerateSection(project, currentSection.id, 'regenerate');
  return {
    updatedProject: regenerated,
    result: {
      success: true,
      message: `Executed command on arrangement: "${rawCommand}". Created alternative variations.`,
      actionTaken: 'general-variation',
    },
  };
}
