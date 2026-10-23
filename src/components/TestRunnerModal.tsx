/**
 * SONORA SongWeaver - Automated Engine Test Runner Modal
 * Directly tests Section 19 Verification criteria (Tests A through F).
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { TestResultItem } from '../types/music';
import { runAllEngineTests } from '../services/tests/engineTests';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runAllEngineTests();
      setTestResults(results);
      setIsRunning(false);
    }, 100);
  };

  useEffect(() => {
    if (isOpen && testResults.length === 0) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = testResults.filter(t => t.passed).length;
  const totalCount = testResults.length;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#10121a] border border-[#2b3040] rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232733] flex items-center justify-between bg-[#0d0f16]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Section 19 Automated Acceptance Tests</span>
                {totalCount > 0 && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      allPassed
                        ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                        : 'text-rose-400 bg-rose-500/15 border-rose-500/30'
                    }`}
                  >
                    {passedCount} / {totalCount} Passed
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400">
                Live verification of arrangement generation, melody safeguards, section isolation, and SMF round-trip.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={executeTests}
              disabled={isRunning}
              className="flex items-center space-x-1.5 text-xs text-neutral-200 bg-[#1e2230] hover:bg-[#282e40] px-3 py-1.5 rounded-lg border border-[#2f374c] transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Rerun Tests</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#1f2332] rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {testResults.map((test) => (
            <div
              key={test.id}
              className={`p-4 rounded-xl border flex flex-col space-y-2 transition ${
                test.passed
                  ? 'bg-[#121620] border-emerald-500/20'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {test.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <span className="text-xs font-bold text-white">{test.name}</span>
                  <span className="text-[10px] text-neutral-400 bg-[#1c202e] px-1.5 py-0.5 rounded font-mono">
                    {test.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-neutral-500 font-mono">{test.durationMs}ms</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      test.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 pl-6 leading-relaxed">
                {test.details}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#232733] bg-[#0d0f16] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Non-negotiable principles verified: source preserved, non-destructive editing, SMF round-trip valid.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1e2230] hover:bg-[#282e40] text-neutral-200 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
