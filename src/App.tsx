/**
 * SONORA SongWeaver - Main Application
 * Professional musical arrangement assistant and song-building workstation.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SongProject,
  ArrangementConcept,
  ArrangementStyle,
  UserLevel,
  CommandExecutionResult,
} from './types/music';
import { createAmapianoDemoProject, createHipHopSoulDemoProject } from './services/demoLoops';
import {
  generateArrangementConcepts,
  applyArrangementConcept,
  regenerateSection,
} from './services/arrangement/arrangementEngine';
import {
  globalSynth,
  TransportState,
  TransportPosition,
} from './services/audio/synthEngine';
import { executeNaturalLanguageCommand } from './services/commands/commandProcessor';

import { Header } from './components/Header';
import { TransportBar } from './components/TransportBar';
import { ArrangementCanvas } from './components/ArrangementCanvas';
import { SectionInspector } from './components/SectionInspector';
import { CommandBar } from './components/CommandBar';
import { ArrangementConceptsModal } from './components/ArrangementConceptsModal';
import { SourceAnalysisPanel } from './components/SourceAnalysisPanel';
import { ExportModal } from './components/ExportModal';
import { TestRunnerModal } from './components/TestRunnerModal';

const STORAGE_KEY = 'sonora_songweaver_project_v1';

export default function App() {
  // Initialize with authentic Amapiano 8-bar demo and apply Build concept
  const [project, setProject] = useState<SongProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.tracks && parsed.clips && parsed.sections) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    const base = createAmapianoDemoProject();
    const concepts = generateArrangementConcepts(base);
    return applyArrangementConcept(base, concepts[0]);
  });

  // Undo / Redo history
  const [history, setHistory] = useState<SongProject[]>([]);
  const [redoStack, setRedoStack] = useState<SongProject[]>([]);
  const [isSaved, setIsSaved] = useState(true);

  // Transport State
  const [transportState, setTransportState] = useState<TransportState>('stopped');
  const [position, setPosition] = useState<TransportPosition>({
    bar: 1,
    beat: 1,
    sixteenth: 1,
    tick: 0,
    timeSeconds: 0,
  });
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [isLoopOn, setIsLoopOn] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [meterLevel, setMeterLevel] = useState(0.0);

  // UI State
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showEnergyCurve, setShowEnergyCurve] = useState(true);
  const [userLevel, setUserLevel] = useState<UserLevel>(project.userLevel || 'intermediate');

  // Modals
  const [isConceptsModalOpen, setIsConceptsModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Natural language command feedback
  const [lastCommandResult, setLastCommandResult] = useState<CommandExecutionResult | null>(null);

  // Setup synth transport callbacks & sync project
  useEffect(() => {
    globalSynth.setCallbacks(
      (pos) => setPosition(pos),
      (state) => setTransportState(state),
      (level) => setMeterLevel(level)
    );
    globalSynth.setProject(project);

    return () => {
      globalSynth.stop();
    };
  }, []);

  // Update synth project when arrangement or tracks change
  useEffect(() => {
    globalSynth.setProject(project);
    // Auto-save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      setIsSaved(true);
    } catch {
      // ignore quota errors
    }
  }, [project]);

  // Set default selected section on load
  useEffect(() => {
    if (!selectedSectionId && project.sections.length > 0) {
      setSelectedSectionId(project.sections[0].id);
    }
  }, [project.sections]);

  // Push to Undo stack
  const pushHistory = useCallback((prevProj: SongProject) => {
    setHistory((prev) => [...prev.slice(-30), prevProj]);
    setRedoStack([]);
    setIsSaved(false);
  }, []);

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [...prev, project]);
    setHistory((prev) => prev.slice(0, -1));
    setProject(previous);
  }, [history, project]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, project]);
    setRedoStack((prev) => prev.slice(0, -1));
    setProject(next);
  }, [redoStack, project]);

  // Keyboard Shortcuts (Space to Play/Pause, Enter to Stop, Ctrl+Z to Undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (transportState === 'playing') {
          globalSynth.pause();
        } else {
          globalSynth.play();
        }
      } else if (e.code === 'Enter') {
        e.preventDefault();
        globalSynth.stop();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transportState, handleUndo, handleRedo]);

  // Transport handlers
  const handlePlay = () => globalSynth.play();
  const handlePause = () => globalSynth.pause();
  const handleStop = () => globalSynth.stop();

  const handleToggleLoop = () => {
    const next = !isLoopOn;
    setIsLoopOn(next);
    globalSynth.setLoopSection(next ? selectedSectionId : null);
  };

  const handleToggleMetronome = () => {
    const next = !isMetronomeOn;
    setIsMetronomeOn(next);
    globalSynth.toggleMetronome(next);
  };

  const handleChangeTempo = (bpm: number) => {
    pushHistory(project);
    setProject((prev) => ({
      ...prev,
      tempo: bpm,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleChangeVolume = (vol: number) => {
    setMasterVolume(vol);
    globalSynth.setMasterVolume(vol);
  };

  const handleSeekToBar = (bar: number) => {
    globalSynth.seekToBar(bar);
  };

  // Track state handlers
  const handleToggleTrackMute = (trackId: string) => {
    const updatedTracks = project.tracks.map((t) => {
      if (t.id === trackId) {
        return { ...t, isMuted: !t.isMuted };
      }
      return t;
    });
    setProject((prev) => ({ ...prev, tracks: updatedTracks }));
    const t = updatedTracks.find((x) => x.id === trackId);
    if (t) {
      globalSynth.updateTrackState(trackId, t.isMuted, t.isSolo, t.volume, t.pan);
    }
  };

  const handleToggleTrackSolo = (trackId: string) => {
    const updatedTracks = project.tracks.map((t) => {
      if (t.id === trackId) {
        return { ...t, isSolo: !t.isSolo };
      }
      return t;
    });
    setProject((prev) => ({ ...prev, tracks: updatedTracks }));
    const t = updatedTracks.find((x) => x.id === trackId);
    if (t) {
      globalSynth.updateTrackState(trackId, t.isMuted, t.isSolo, t.volume, t.pan);
    }
  };

  const handleChangeTrackVolume = (trackId: string, vol: number) => {
    const updatedTracks = project.tracks.map((t) => {
      if (t.id === trackId) {
        return { ...t, volume: vol };
      }
      return t;
    });
    setProject((prev) => ({ ...prev, tracks: updatedTracks }));
    const t = updatedTracks.find((x) => x.id === trackId);
    if (t) {
      globalSynth.updateTrackState(trackId, t.isMuted, t.isSolo, vol, t.pan);
    }
  };

  // Section Inspector handlers
  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    if (isLoopOn) {
      globalSynth.setLoopSection(sectionId);
    }
  };

  const handleUpdateEnergy = (sectionId: string, energy: number) => {
    pushHistory(project);
    const updatedSections = project.sections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, energyTarget: energy };
      }
      return s;
    });
    setProject((prev) => ({
      ...prev,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleToggleSectionTrack = (sectionId: string, trackId: string) => {
    pushHistory(project);
    const targetSection = project.sections.find((s) => s.id === sectionId);
    if (!targetSection) return;

    const currentVal = targetSection.trackActivity[trackId] !== false;
    const nextVal = !currentVal;

    const updatedSections = project.sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          trackActivity: { ...s.trackActivity, [trackId]: nextVal },
        };
      }
      return s;
    });

    // Mute/unmute clips inside this section
    const updatedClips = project.clips.map((c) => {
      if (
        c.trackId === trackId &&
        c.startBar >= targetSection.startBar &&
        c.startBar < targetSection.startBar + targetSection.durationBars
      ) {
        return { ...c, isMuted: !nextVal };
      }
      return c;
    });

    setProject((prev) => ({
      ...prev,
      sections: updatedSections,
      clips: updatedClips,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSectionRegenerateAction = (
    sectionId: string,
    action: 'regenerate' | 'simpler' | 'busier' | 'energetic' | 'spacious' | 'preserve-melody' | 'mute-bass'
  ) => {
    pushHistory(project);
    const regenerated = regenerateSection(project, sectionId, action);
    setProject(regenerated);
  };

  // Load Demos
  const handleLoadDemo = (type: 'amapiano' | 'hiphop') => {
    pushHistory(project);
    const demo = type === 'amapiano' ? createAmapianoDemoProject() : createHipHopSoulDemoProject();
    const concepts = generateArrangementConcepts(demo);
    const applied = applyArrangementConcept(demo, concepts[0]);
    setProject(applied);
    setSelectedSectionId(applied.sections[0]?.id || null);
    globalSynth.stop();
  };

  // Arrangement Concepts Application
  const handleApplyConcept = (concept: ArrangementConcept) => {
    pushHistory(project);
    const applied = applyArrangementConcept(project, concept);
    setProject(applied);
    setSelectedSectionId(applied.sections[0]?.id || null);
  };

  const handleAuditionConcept = (concept: ArrangementConcept) => {
    handleApplyConcept(concept);
    globalSynth.seekToBar(1);
    globalSynth.play();
  };

  // Natural Language Command Execution
  const handleExecuteCommand = (rawCommand: string) => {
    pushHistory(project);
    const { updatedProject, result } = executeNaturalLanguageCommand(project, rawCommand);
    setProject(updatedProject);
    setLastCommandResult(result);
  };

  // Get currently selected section
  const currentSelectedSection = project.sections.find((s) => s.id === selectedSectionId) || null;

  // Generate concepts dynamically based on current project
  const currentConcepts = generateArrangementConcepts(project);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0b0e] text-[#f1f5f9] overflow-hidden select-none">
      {/* Top Bar */}
      <Header
        project={project}
        onUpdateProjectName={(name) => {
          setProject((prev) => ({ ...prev, name }));
        }}
        userLevel={userLevel}
        onChangeUserLevel={(level) => {
          setUserLevel(level);
          setProject((prev) => ({ ...prev, userLevel: level }));
        }}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenConcepts={() => setIsConceptsModalOpen(true)}
        onOpenSourceModal={() => setIsSourceModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        onLoadDemo={handleLoadDemo}
        isSaved={isSaved}
      />

      {/* Master Transport Bar */}
      <TransportBar
        state={transportState}
        position={position}
        tempo={project.tempo}
        timeSignature={project.timeSignature}
        isMetronomeOn={isMetronomeOn}
        isLoopOn={isLoopOn}
        masterVolume={masterVolume}
        meterLevel={meterLevel}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onToggleLoop={handleToggleLoop}
        onToggleMetronome={handleToggleMetronome}
        onChangeTempo={handleChangeTempo}
        onChangeVolume={handleChangeVolume}
      />

      {/* Main Arrangement Canvas */}
      <ArrangementCanvas
        project={project}
        position={position}
        selectedSectionId={selectedSectionId}
        onSelectSection={handleSelectSection}
        onSeekToBar={handleSeekToBar}
        onToggleTrackMute={handleToggleTrackMute}
        onToggleTrackSolo={handleToggleTrackSolo}
        onChangeTrackVolume={handleChangeTrackVolume}
        showEnergyCurve={showEnergyCurve}
        onToggleEnergyCurve={() => setShowEnergyCurve(!showEnergyCurve)}
      />

      {/* Section & Clip Inspector */}
      <SectionInspector
        section={currentSelectedSection}
        project={project}
        onUpdateEnergy={handleUpdateEnergy}
        onToggleSectionTrack={handleToggleSectionTrack}
        onSectionRegenerateAction={handleSectionRegenerateAction}
        onClose={() => setSelectedSectionId(null)}
      />

      {/* Natural Language Command Bar */}
      <CommandBar
        onExecuteCommand={handleExecuteCommand}
        lastResult={lastCommandResult}
      />

      {/* Modals */}
      <ArrangementConceptsModal
        isOpen={isConceptsModalOpen}
        onClose={() => setIsConceptsModalOpen(false)}
        concepts={currentConcepts}
        activeStyle={project.activeArrangementStyle}
        onApplyConcept={handleApplyConcept}
        onAuditionConcept={handleAuditionConcept}
      />

      <SourceAnalysisPanel
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        project={project}
        onUpdateProject={(newProj) => {
          pushHistory(project);
          setProject(newProj);
        }}
        onLoadDemo={handleLoadDemo}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        selectedSectionId={selectedSectionId}
        onImportProjectFile={(importedProj) => {
          pushHistory(project);
          setProject(importedProj);
        }}
      />

      <TestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
