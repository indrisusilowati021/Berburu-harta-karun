/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, X, ChevronRight, Lightbulb } from 'lucide-react';
import { sound } from '../utils/audio';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hints: string[];
  levelTitle: string;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  hints,
  levelTitle,
}) => {
  const [revealedLevel, setRevealedLevel] = useState<number>(0);

  if (!isOpen) return null;

  const handleRevealNext = () => {
    sound.playClick();
    setRevealedLevel((prev) => Math.min(prev + 1, hints.length - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Petunjuk Ahli Matematika</h3>
            <p className="text-xs text-slate-400">{levelTitle}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {hints.map((hintText, idx) => {
            const isUnlocked = idx <= revealedLevel;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-amber-500/40 text-slate-200'
                    : 'bg-slate-950/30 border-slate-800 text-slate-600 select-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      isUnlocked ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    Petunjuk #{idx + 1}
                  </span>
                  {!isUnlocked && (
                    <span className="text-xs italic text-slate-500">Terkunci (buka bertahap)</span>
                  )}
                </div>
                <p className="text-xs leading-relaxed">
                  {isUnlocked ? hintText : 'Buka petunjuk sebelumnya untuk membuka petunjuk lanjutan ini...'}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {revealedLevel < hints.length - 1 ? (
            <button
              onClick={handleRevealNext}
              className="text-xs px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-semibold flex items-center gap-1 transition"
            >
              Buka Petunjuk Lanjutan ({revealedLevel + 2}/{hints.length})
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs text-emerald-400 font-medium">Semua petunjuk sudah terbuka!</span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
