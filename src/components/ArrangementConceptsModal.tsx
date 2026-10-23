/**
 * SONORA SongWeaver - Arrangement Concepts Modal
 * Displays the 3 distinct generated arrangement concepts (Build, Atmospheric, Performance).
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  CloudFog,
  Zap,
  Play,
  Check,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ArrangementConcept, ArrangementStyle } from '../types/music';

interface ArrangementConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  concepts: ArrangementConcept[];
  activeStyle: ArrangementStyle;
  onApplyConcept: (concept: ArrangementConcept) => void;
  onAuditionConcept: (concept: ArrangementConcept) => void;
}

const STYLE_ICONS: Record<ArrangementStyle, React.ReactNode> = {
  'build': <TrendingUp className="w-5 h-5 text-amber-400" />,
  'atmospheric': <CloudFog className="w-5 h-5 text-blue-400" />,
  'performance': <Zap className="w-5 h-5 text-rose-400" />,
};

export const ArrangementConceptsModal: React.FC<ArrangementConceptsModalProps> = ({
  isOpen,
  onClose,
  concepts,
  activeStyle,
  onApplyConcept,
  onAuditionConcept,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#10121a] border border-[#2b3040] rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#232733] flex items-center justify-between bg-[#0d0f16]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Generated Arrangement Concepts</span>
                <span className="text-[10px] text-neutral-400 bg-[#1e2230] px-2 py-0.5 rounded font-normal">
                  3 Musical Journeys
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Audition and select a structural foundation generated from your original material.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#1f2332] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 3 Cards Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-5">
          {concepts.map((concept) => {
            const isActive = concept.style === activeStyle;

            return (
              <div
                key={concept.id}
                className={`bg-[#141620] rounded-xl border flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'border-[#f59e0b] shadow-[0_0_16px_rgba(245,158,11,0.2)] ring-1 ring-[#f59e0b]/50'
                    : 'border-[#232733] hover:border-[#383e52]'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-[#1f2330]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-[#1c202e] border border-[#2a3044]">
                        {STYLE_ICONS[concept.style]}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        {concept.style}
                      </span>
                    </div>

                    {isActive && (
                      <span className="text-[10px] font-semibold text-[#f59e0b] bg-[#f59e0b]/15 border border-[#f59e0b]/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{concept.name}</h3>
                  <p className="text-xs text-[#f59e0b] font-medium mb-2">{concept.tagline}</p>
                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {concept.description}
                  </p>
                </div>

                {/* Energy Profile Graph & Metrics */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Energy Contour Visualization */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 mb-1.5">
                      <span className="font-semibold uppercase tracking-wider">Energy Contour</span>
                      <span className="text-neutral-500">0–100%</span>
                    </div>
                    <div className="h-14 bg-[#0a0b0e] rounded-lg border border-[#232733] p-1 flex items-end justify-between space-x-1">
                      {concept.sections.map((sec, idx) => {
                        const heightPct = Math.max(15, sec.energyTarget);
                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center group relative h-full justify-end"
                          >
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t-[2px] transition-all ${
                                sec.energyTarget >= 85
                                  ? 'bg-rose-500'
                                  : sec.energyTarget >= 60
                                  ? 'bg-[#f59e0b]'
                                  : 'bg-blue-500'
                              }`}
                            />
                            {/* Hover tooltip */}
                            <div className="absolute -top-7 bg-black text-[9px] text-white px-1.5 py-0.5 rounded border border-[#333] hidden group-hover:block whitespace-nowrap z-20">
                              {sec.name}: {sec.energyTarget}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sections List */}
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Section Flow ({concept.sections.length} parts)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {concept.sections.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-[#1a1d28] border border-[#2a3040] text-neutral-300 px-1.5 py-0.5 rounded"
                        >
                          {s.name} ({s.durationBars}b)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Variation Characteristics */}
                  <div className="border-t border-[#1f2330] pt-3">
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Musical Policies
                    </span>
                    <ul className="space-y-1 text-[11px] text-neutral-300">
                      {concept.variationCharacteristics.map((char, cIdx) => (
                        <li key={cIdx} className="flex items-start space-x-1.5">
                          <span className="text-[#f59e0b] mt-0.5">•</span>
                          <span className="leading-tight">{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metrics: Length & Duration */}
                  <div className="flex items-center justify-between text-xs text-neutral-400 bg-[#0d0f16] p-2.5 rounded-lg border border-[#1f2330]">
                    <div className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-semibold text-white">{concept.totalBars} Bars</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-semibold text-white">
                        ~{Math.floor(concept.estimatedDurationSeconds / 60)}:
                        {(concept.estimatedDurationSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-[#0d0f16] border-t border-[#1f2330] flex items-center space-x-2">
                  <button
                    onClick={() => onAuditionConcept(concept)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-neutral-200 bg-[#1e2230] hover:bg-[#282e40] transition flex items-center justify-center space-x-1.5"
                    title="Audition this arrangement in real-time"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-white" />
                    <span>Audition</span>
                  </button>

                  <button
                    onClick={() => {
                      onApplyConcept(concept);
                      onClose();
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      isActive
                        ? 'bg-[#232733] text-neutral-400 cursor-default'
                        : 'bg-[#f59e0b] hover:bg-[#d97706] text-black shadow-md'
                    }`}
                  >
                    {isActive ? (
                      <span>Current</span>
                    ) : (
                      <>
                        <span>Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
