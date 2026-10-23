/**
 * SONORA SongWeaver - Master Transport Bar
 * Hardware-style master transport with synchronized AudioContext playback.
 */

import React from 'react';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Volume2,
  VolumeX,
  Gauge,
  Clock,
} from 'lucide-react';
import { TransportState, TransportPosition } from '../services/audio/synthEngine';

interface TransportBarProps {
  state: TransportState;
  position: TransportPosition;
  tempo: number;
  timeSignature: [number, number];
  isMetronomeOn: boolean;
  isLoopOn: boolean;
  masterVolume: number;
  meterLevel: number; // 0.0 to 1.0
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onToggleLoop: () => void;
  onToggleMetronome: () => void;
  onChangeTempo: (bpm: number) => void;
  onChangeVolume: (vol: number) => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  state,
  position,
  tempo,
  timeSignature,
  isMetronomeOn,
  isLoopOn,
  masterVolume,
  meterLevel,
  onPlay,
  onPause,
  onStop,
  onToggleLoop,
  onToggleMetronome,
  onChangeTempo,
  onChangeVolume,
}) => {
  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-14 bg-[#101218] border-b border-[#232733] px-4 flex items-center justify-between select-none shadow-sm">
      {/* Left: Transport Buttons */}
      <div className="flex items-center space-x-2">
        {/* Play / Pause */}
        {state === 'playing' ? (
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-black flex items-center justify-center transition shadow-lg"
            title="Pause (Space)"
          >
            <Pause className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="w-10 h-10 rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-black flex items-center justify-center transition shadow-lg pl-0.5"
            title="Play (Space)"
          >
            <Play className="w-5 h-5 fill-current" />
          </button>
        )}

        {/* Stop */}
        <button
          onClick={onStop}
          className="w-9 h-9 rounded-lg bg-[#181b24] hover:bg-[#232733] text-neutral-300 hover:text-white flex items-center justify-center transition border border-[#2b3040]"
          title="Stop & Return to Zero"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        {/* Loop Section Toggle */}
        <button
          onClick={onToggleLoop}
          className={`px-2.5 h-9 rounded-lg flex items-center space-x-1.5 text-xs font-medium transition border ${
            isLoopOn
              ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b]'
              : 'bg-[#181b24] border-[#2b3040] text-neutral-400 hover:text-neutral-200'
          }`}
          title="Loop Selected Section"
        >
          <Repeat className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Loop</span>
        </button>
      </div>

      {/* Center: Digital LCD Monospace Display & Tempo */}
      <div className="flex items-center space-x-3 bg-[#0a0b0e] border border-[#232733] px-3.5 py-1.5 rounded-lg shadow-inner">
        {/* Bar : Beat : 16th Display */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline space-x-1 font-digital text-[#f59e0b] text-lg font-bold tracking-widest">
            <span>{position.bar.toString().padStart(3, '0')}</span>
            <span className="text-[#f59e0b]/40">:</span>
            <span>{position.beat}</span>
            <span className="text-[#f59e0b]/40">:</span>
            <span className="text-sm text-[#f59e0b]/80">{position.sixteenth}</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium">Bar : Beat : 16th</span>
        </div>

        <div className="h-7 w-px bg-[#232733]" />

        {/* Time Elapsed (mm:ss) */}
        <div className="flex flex-col items-center">
          <span className="font-digital text-neutral-300 text-sm font-semibold tracking-wider">
            {formatTime(position.timeSeconds)}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium">Elapsed</span>
        </div>

        <div className="h-7 w-px bg-[#232733]" />

        {/* BPM Tempo Control */}
        <div className="flex items-center space-x-1.5">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={60}
                max={200}
                value={tempo}
                onChange={(e) => onChangeTempo(Math.max(40, Math.min(240, parseInt(e.target.value) || 120)))}
                className="w-12 bg-transparent text-center font-digital text-white font-bold text-base focus:bg-[#181b24] focus:outline-none rounded"
              />
              <span className="text-[10px] text-neutral-400 font-medium">BPM</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium">Tempo</span>
          </div>
          <div className="flex flex-col space-y-0.5">
            <button
              onClick={() => onChangeTempo(tempo + 1)}
              className="text-[9px] bg-[#181b24] hover:bg-[#232733] text-neutral-300 px-1 rounded transition leading-none py-0.5"
            >
              +
            </button>
            <button
              onClick={() => onChangeTempo(tempo - 1)}
              className="text-[9px] bg-[#181b24] hover:bg-[#232733] text-neutral-300 px-1 rounded transition leading-none py-0.5"
            >
              -
            </button>
          </div>
        </div>

        <div className="h-7 w-px bg-[#232733]" />

        {/* Meter Badge */}
        <div className="flex flex-col items-center">
          <span className="font-digital text-neutral-300 text-sm font-semibold">
            {timeSignature[0]}/{timeSignature[1]}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium">Meter</span>
        </div>

        <div className="h-7 w-px bg-[#232733]" />

        {/* Metronome Click Toggle */}
        <button
          onClick={onToggleMetronome}
          className={`flex flex-col items-center px-2 py-0.5 rounded transition ${
            isMetronomeOn ? 'text-[#f59e0b]' : 'text-neutral-500 hover:text-neutral-300'
          }`}
          title="Toggle Metronome Audio Click"
        >
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isMetronomeOn
                  ? state === 'playing' && position.beat === 1
                    ? 'bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]'
                    : 'bg-[#f59e0b]/50'
                  : 'bg-neutral-600'
              }`}
            />
            <span className="text-xs font-semibold">CLICK</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium">Metronome</span>
        </button>
      </div>

      {/* Right: Master Volume & LED Peak Level Meter */}
      <div className="flex items-center space-x-3">
        {/* Master Audio Peak Meter */}
        <div className="hidden sm:flex flex-col items-end space-y-1">
          <div className="flex space-x-0.5 items-end h-5 w-20 bg-[#0a0b0e] p-0.5 rounded border border-[#232733]">
            {Array.from({ length: 12 }).map((_, idx) => {
              const threshold = (idx + 1) / 12;
              const isLit = meterLevel >= threshold;
              const isClip = idx >= 10;
              const isWarning = idx >= 8 && idx < 10;
              let color = 'bg-emerald-500';
              if (isWarning) color = 'bg-amber-400';
              if (isClip) color = 'bg-rose-500';

              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-[1px] transition-all duration-75 ${
                    isLit ? color : 'bg-[#181b24]'
                  } ${isLit && isClip ? 'shadow-[0_0_6px_#f43f5e]' : ''}`}
                  style={{ height: `${(idx + 1) * 8}%` }}
                />
              );
            })}
          </div>
          <span className="text-[8px] text-neutral-500 tracking-wider font-mono">PEAK METER</span>
        </div>

        {/* Master Volume Slider */}
        <div className="flex items-center space-x-2">
          {masterVolume === 0 ? (
            <VolumeX className="w-4 h-4 text-neutral-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-neutral-300" />
          )}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-20 md:w-28 h-1.5 bg-[#232733] rounded-lg appearance-none cursor-pointer"
            title={`Master Volume: ${Math.round(masterVolume * 100)}%`}
          />
          <span className="text-xs text-neutral-400 font-digital w-8 text-right hidden sm:inline">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
