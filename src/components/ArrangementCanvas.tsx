/**
 * SONORA SongWeaver - Arrangement Canvas & Timeline
 * High-precision interactive DAW arrangement timeline with live playhead,
 * section blocks, track lanes, and mini piano-roll note previews.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Lock,
  Flame,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Drum,
  Activity,
  KeyRound,
  Music,
  Waves,
} from 'lucide-react';
import { SongProject, Track, Section, Clip, TrackRole } from '../types/music';
import { TransportPosition } from '../services/audio/synthEngine';

interface ArrangementCanvasProps {
  project: SongProject;
  position: TransportPosition;
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onSeekToBar: (bar: number) => void;
  onToggleTrackMute: (trackId: string) => void;
  onToggleTrackSolo: (trackId: string) => void;
  onChangeTrackVolume: (trackId: string, vol: number) => void;
  showEnergyCurve: boolean;
  onToggleEnergyCurve: () => void;
}

const ROLE_ICONS: Record<TrackRole, React.ReactNode> = {
  'drums': <Drum className="w-3.5 h-3.5 text-rose-400" />,
  'log-drum': <Flame className="w-3.5 h-3.5 text-amber-500" />,
  'bass': <Activity className="w-3.5 h-3.5 text-amber-400" />,
  'chords': <KeyRound className="w-3.5 h-3.5 text-blue-400" />,
  'melody': <Music className="w-3.5 h-3.5 text-emerald-400" />,
  'texture': <Waves className="w-3.5 h-3.5 text-purple-400" />,
  'audio-reference': <Volume2 className="w-3.5 h-3.5 text-slate-400" />,
  'unassigned': <Layers className="w-3.5 h-3.5 text-neutral-400" />,
};

const SECTION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'intro': { bg: 'bg-indigo-950/40', border: 'border-indigo-500/40', text: 'text-indigo-300' },
  'verse': { bg: 'bg-blue-950/40', border: 'border-blue-500/40', text: 'text-blue-300' },
  'main-a': { bg: 'bg-cyan-950/40', border: 'border-cyan-500/40', text: 'text-cyan-300' },
  'build': { bg: 'bg-amber-950/40', border: 'border-amber-500/50', text: 'text-amber-300' },
  'pre-chorus': { bg: 'bg-amber-950/40', border: 'border-amber-500/40', text: 'text-amber-300' },
  'hook-a': { bg: 'bg-rose-950/50', border: 'border-rose-500/60', text: 'text-rose-300' },
  'hook-b': { bg: 'bg-red-950/50', border: 'border-red-500/60', text: 'text-red-300' },
  'drop': { bg: 'bg-red-950/60', border: 'border-red-500/70', text: 'text-red-300' },
  'chorus': { bg: 'bg-rose-950/50', border: 'border-rose-500/50', text: 'text-rose-300' },
  'breakdown': { bg: 'bg-teal-950/40', border: 'border-teal-500/40', text: 'text-teal-300' },
  'bridge': { bg: 'bg-emerald-950/40', border: 'border-emerald-500/40', text: 'text-emerald-300' },
  'outro': { bg: 'bg-purple-950/40', border: 'border-purple-500/40', text: 'text-purple-300' },
  'custom': { bg: 'bg-neutral-900', border: 'border-neutral-600', text: 'text-neutral-300' },
};

export const ArrangementCanvas: React.FC<ArrangementCanvasProps> = ({
  project,
  position,
  selectedSectionId,
  onSelectSection,
  onSeekToBar,
  onToggleTrackMute,
  onToggleTrackSolo,
  onChangeTrackVolume,
  showEnergyCurve,
  onToggleEnergyCurve,
}) => {
  const [pixelsPerBar, setPixelsPerBar] = useState<number>(36);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  const totalBars = Math.max(16, project.totalBars);
  const timelineWidth = totalBars * pixelsPerBar;

  // Zoom handlers
  const handleZoomIn = () => setPixelsPerBar(prev => Math.min(80, prev + 8));
  const handleZoomOut = () => setPixelsPerBar(prev => Math.max(20, prev - 8));

  // Compute playhead horizontal position in pixels
  const ppq = project.ppq || 480;
  const ticksPerBar = project.timeSignature[0] * ppq * (4 / project.timeSignature[1]);
  const playheadPixels = (position.tick / ticksPerBar) * pixelsPerBar;

  // Auto-scroll timeline to follow playhead if offscreen
  useEffect(() => {
    if (timelineScrollRef.current) {
      const el = timelineScrollRef.current;
      const left = el.scrollLeft;
      const visibleWidth = el.clientWidth;
      if (playheadPixels > left + visibleWidth - 100 || playheadPixels < left) {
        el.scrollTo({ left: Math.max(0, playheadPixels - 150), behavior: 'smooth' });
      }
    }
  }, [playheadPixels]);

  // Click on ruler to seek
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickedBar = Math.max(1, Math.min(totalBars, Math.floor(clickX / pixelsPerBar) + 1));
    onSeekToBar(clickedBar);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0c10] select-none overflow-hidden border-b border-[#232733]">
      {/* Canvas Toolbar: Zoom & Curve Toggle */}
      <div className="h-9 bg-[#12141c] border-b border-[#232733] px-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-neutral-400">
          <span className="font-semibold text-neutral-300">Arrangement Timeline</span>
          <span className="text-[11px] bg-[#1a1d27] border border-[#2b3040] px-2 py-0.5 rounded text-neutral-400">
            {project.totalBars} Bars total
          </span>
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Click section header or ruler to seek
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Energy Curve Overlay Toggle */}
          <button
            onClick={onToggleEnergyCurve}
            className={`text-xs px-2.5 py-1 rounded transition border flex items-center space-x-1.5 ${
              showEnergyCurve
                ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b]'
                : 'bg-[#181b24] border-[#2b3040] text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle Energy Contour Curve"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Energy Curve</span>
          </button>

          {/* Zoom In / Out */}
          <div className="flex items-center bg-[#181b24] rounded border border-[#2b3040] p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-white text-neutral-400 hover:bg-[#232733] rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-white text-neutral-400 hover:bg-[#232733] rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Track Controls + Right Scrollable Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Track Headers (Fixed width) */}
        <div className="w-56 md:w-64 bg-[#10121a] border-r border-[#232733] flex flex-col flex-shrink-0 z-20">
          {/* Top Section Header Placeholder */}
          <div className="h-16 border-b border-[#232733] px-3 flex flex-col justify-center bg-[#0d0f16]">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Song Structure</span>
            <span className="text-xs text-neutral-300 font-medium">Sections & Dynamics</span>
          </div>

          {/* Track Header Lanes */}
          <div className="flex-1 overflow-y-auto">
            {project.tracks.map((track) => {
              return (
                <div
                  key={track.id}
                  className="h-16 border-b border-[#232733] px-3 flex items-center justify-between hover:bg-[#151824] transition group"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    {/* Track Role Icon & Color Bar */}
                    <div
                      className="w-1.5 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: track.color }}
                    />
                    <div className="flex flex-col truncate">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span title={track.role}>{ROLE_ICONS[track.role]}</span>
                        <span className="text-xs font-semibold text-neutral-200 truncate" title={track.name}>
                          {track.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 capitalize tracking-wide">
                        {track.role}
                      </span>
                    </div>
                  </div>

                  {/* Track Actions: Mute (M), Solo (S), Volume */}
                  <div className="flex items-center space-x-1">
                    {/* Mute Button */}
                    <button
                      onClick={() => onToggleTrackMute(track.id)}
                      className={`w-6 h-6 rounded text-[10px] font-bold transition flex items-center justify-center ${
                        track.isMuted
                          ? 'bg-rose-500 text-white shadow-[0_0_6px_rgba(244,63,94,0.4)]'
                          : 'bg-[#1e2230] text-neutral-400 hover:text-white hover:bg-[#2b3145]'
                      }`}
                      title={track.isMuted ? 'Unmute Track' : 'Mute Track'}
                    >
                      M
                    </button>

                    {/* Solo Button */}
                    <button
                      onClick={() => onToggleTrackSolo(track.id)}
                      className={`w-6 h-6 rounded text-[10px] font-bold transition flex items-center justify-center ${
                        track.isSolo
                          ? 'bg-[#f59e0b] text-black shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                          : 'bg-[#1e2230] text-neutral-400 hover:text-white hover:bg-[#2b3145]'
                      }`}
                      title={track.isSolo ? 'Unsolo Track' : 'Solo Track'}
                    >
                      S
                    </button>

                    {/* Mini volume fader slider */}
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={track.volume}
                      onChange={(e) => onChangeTrackVolume(track.id, parseFloat(e.target.value))}
                      className="w-10 h-1 bg-[#232733] rounded appearance-none cursor-pointer hidden md:inline ml-1"
                      title={`Volume: ${Math.round(track.volume * 100)}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Scrollable Timeline Canvas */}
        <div
          ref={timelineScrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#090a0e]"
        >
          <div
            className="relative h-full"
            style={{ width: `${Math.max(800, timelineWidth)}px` }}
          >
            {/* Top Bar Ruler & Section Blocks Header (h-16) */}
            <div className="h-16 border-b border-[#232733] bg-[#0d0f16] flex flex-col sticky top-0 z-10">
              {/* Bar Numbers Ruler */}
              <div
                onClick={handleRulerClick}
                className="h-6 border-b border-[#1f2330] flex items-center cursor-pointer select-none relative"
              >
                {Array.from({ length: totalBars }).map((_, barIdx) => {
                  const barNum = barIdx + 1;
                  const isMajor = barNum === 1 || (barNum - 1) % 4 === 0;
                  return (
                    <div
                      key={barIdx}
                      style={{ width: `${pixelsPerBar}px` }}
                      className="h-full border-r border-[#1a1d28] flex items-center justify-start pl-1 flex-shrink-0"
                    >
                      {isMajor && (
                        <span className="text-[10px] font-digital text-neutral-400 font-bold">
                          {barNum}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section Header Blocks (Click to select & inspect) */}
              <div className="h-10 flex relative items-center">
                {project.sections.map((section) => {
                  const secLeft = (section.startBar - 1) * pixelsPerBar;
                  const secWidth = section.durationBars * pixelsPerBar;
                  const isSelected = selectedSectionId === section.id;
                  const colors = SECTION_COLORS[section.type] || SECTION_COLORS['custom'];

                  return (
                    <div
                      key={section.id}
                      onClick={() => onSelectSection(section.id)}
                      style={{
                        left: `${secLeft}px`,
                        width: `${secWidth}px`,
                      }}
                      className={`absolute top-1 bottom-1 px-2 flex items-center justify-between rounded cursor-pointer transition border ${
                        colors.bg
                      } ${colors.border} ${
                        isSelected
                          ? 'ring-2 ring-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.3)] z-10'
                          : 'hover:brightness-125'
                      }`}
                      title={`${section.name} (Bars ${section.startBar}–${section.startBar + section.durationBars - 1})`}
                    >
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className={`text-xs font-bold truncate ${colors.text}`}>
                          {section.name}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-mono hidden sm:inline">
                          {section.durationBars}b
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-[9px] font-semibold text-neutral-300 bg-black/40 px-1 py-0.5 rounded">
                          {section.energyTarget}%⚡
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional SVG Energy Curve Overlay */}
            {showEnergyCurve && (
              <svg
                className="absolute top-16 left-0 right-0 pointer-events-none z-10 opacity-70"
                style={{ width: `${timelineWidth}px`, height: '40px' }}
              >
                <path
                  d={generateEnergySvgPath(project.sections, pixelsPerBar, 40)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
              </svg>
            )}

            {/* Track Lanes */}
            <div className="relative">
              {project.tracks.map((track) => {
                const trackClips = project.clips.filter((c) => c.trackId === track.id);

                return (
                  <div
                    key={track.id}
                    className="h-16 border-b border-[#181b24] relative flex items-center"
                  >
                    {/* Vertical Bar Grid Background */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {Array.from({ length: totalBars }).map((_, barIdx) => {
                        const isMajor = (barIdx) % 4 === 0;
                        return (
                          <div
                            key={barIdx}
                            style={{ width: `${pixelsPerBar}px` }}
                            className={`h-full border-r ${
                              isMajor ? 'border-[#1f2332]' : 'border-[#14161f]'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Clip Blocks on this track */}
                    {trackClips.map((clip) => {
                      const clipLeft = (clip.startBar - 1) * pixelsPerBar;
                      const clipWidth = clip.durationBars * pixelsPerBar;
                      const isClipMuted = clip.isMuted || track.isMuted;

                      return (
                        <div
                          key={clip.id}
                          style={{
                            left: `${clipLeft + 2}px`,
                            width: `${Math.max(16, clipWidth - 4)}px`,
                            borderColor: track.color,
                          }}
                          className={`absolute top-2 bottom-2 rounded-md border flex flex-col justify-between p-1.5 overflow-hidden transition ${
                            isClipMuted
                              ? 'bg-[#141620]/60 opacity-40 border-dashed'
                              : 'bg-[#181b28]/90 hover:bg-[#1e2333] shadow-sm'
                          }`}
                        >
                          {/* Clip Header Label */}
                          <div className="flex items-center justify-between text-[10px] text-neutral-300 font-medium truncate pointer-events-none">
                            <span className="truncate">{clip.name}</span>
                            {clip.origin === 'transformed' && (
                              <span className="text-[8px] bg-amber-500/20 text-[#f59e0b] px-1 rounded ml-1 flex-shrink-0">
                                VAR
                              </span>
                            )}
                          </div>

                          {/* Mini Piano-Roll / Note Representation preview */}
                          <div className="h-4 flex items-center space-x-0.5 overflow-hidden pointer-events-none opacity-80">
                            {renderMiniNoteStrokes(clip, clipWidth, track.color)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Glowing Amber Playhead Line */}
            <div
              style={{
                left: `${playheadPixels}px`,
                transform: 'translateX(-50%)',
              }}
              className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
            >
              {/* Playhead Arrow Marker */}
              <div className="w-3 h-3 bg-[#f59e0b] rotate-45 -mt-1 shadow-[0_0_8px_#f59e0b]" />
              {/* Vertical Laser Needle */}
              <div className="w-[1.5px] flex-1 bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generates smooth SVG path for the energy contour line
function generateEnergySvgPath(sections: Section[], pixelsPerBar: number, height: number): string {
  if (sections.length === 0) return '';
  const points: { x: number; y: number }[] = [];

  for (const s of sections) {
    const xMid = ((s.startBar - 1) + s.durationBars / 2) * pixelsPerBar;
    // Energy: 100 = top (y=4), 0 = bottom (y=height-4)
    const y = height - (s.energyTarget / 100) * (height - 8) - 4;
    points.push({ x: xMid, y });
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

// Renders compact note representation inside a clip
function renderMiniNoteStrokes(clip: Clip, totalWidth: number, trackColor: string) {
  if (!clip.notes || clip.notes.length === 0) return null;
  // Sample up to 32 notes to avoid dense DOM
  const sampled = clip.notes.slice(0, 36);
  const maxTick = clip.durationBars * 1920;

  return sampled.map((note, idx) => {
    const leftPct = (note.startTick / maxTick) * 100;
    const widthPct = Math.max(1, (note.durationTick / maxTick) * 100);
    // Vertical position by pitch (36 to 84)
    const pitchNorm = Math.max(0, Math.min(1, (note.pitch - 36) / 48));
    const topPct = (1 - pitchNorm) * 80;

    return (
      <div
        key={idx}
        style={{
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          top: `${topPct}%`,
          backgroundColor: trackColor,
        }}
        className="absolute h-1.5 rounded-[1px]"
      />
    );
  });
}
