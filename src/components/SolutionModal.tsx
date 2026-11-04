/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, X, CheckCircle2 } from 'lucide-react';
import { ChallengeProblem } from '../types/game';

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeProblem;
}

export const SolutionModal: React.FC<SolutionModalProps> = ({
  isOpen,
  onClose,
  challenge,
}) => {
  if (!isOpen) return null;

  const { explanation, secretX, secretY, unit, levelId } = challenge;
  const isLevel1 = levelId === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{explanation.title}</h3>
            <p className="text-xs text-slate-400">Pembahasan Aljabar & Timbangan SPLDV</p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2.5 mb-5">
          {explanation.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-600 text-indigo-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        {/* Highlight Solution Box */}
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl mb-5 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
              Nilai Pasti Variabel
            </div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">
              x = {secretX} {unit}
              {!isLevel1 && ` dan y = ${secretY} ${unit}`}
            </div>
            <p className="text-xs text-slate-300 mt-1">{explanation.conclusion}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
          >
            Paham, Lanjutkan Eksplorasi
          </button>
        </div>
      </div>
    </div>
  );
};
