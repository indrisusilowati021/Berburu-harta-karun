/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChallengeProblem } from '../types/game';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Gem,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  ShieldCheck,
  Coins,
} from 'lucide-react';

interface Mission2GemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeProblem;
  allChallenges: ChallengeProblem[];
  currentSubIndex: number;
  onSelectSubIndex: (subIndex: number) => void;
  onSolveSuccess: (levelId: number, subIndex: number, isLastSub: boolean) => void;
  onOpenScratchpad: () => void;
}

export const Mission2GemsModal: React.FC<Mission2GemsModalProps> = ({
  isOpen,
  onClose,
  challenge,
  allChallenges,
  currentSubIndex,
  onSelectSubIndex,
  onSolveSuccess,
  onOpenScratchpad,
}) => {
  const [inputX, setInputX] = useState<string>('');
  const [inputY, setInputY] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCheck = () => {
    const valX = parseFloat(inputX);
    const valY = parseFloat(inputY);

    if (isNaN(valX) || isNaN(valY)) {
      sound.playError();
      setFeedback({
        isCorrect: false,
        message: 'Tentukan harga untuk kedua jenis permata terlebih dahulu!',
      });
      return;
    }

    if (valX === challenge.secretX && valY === challenge.secretY) {
      sound.playSuccessFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#3b82f6', '#a855f7', '#fbbf24'],
      });
      setFeedback({
        isCorrect: true,
        message: `Luar biasa! Nilai 1 Permata Merah (x) = ${challenge.secretX} koin, dan 1 Permata Biru (y) = ${challenge.secretY} koin. Seluruh peti terkunci kini terbuka!`,
      });

      const isLast = currentSubIndex >= allChallenges.length;
      onSolveSuccess(2, currentSubIndex, isLast);
    } else {
      sound.playError();
      setFeedback({
        isCorrect: false,
        message: `Nilai x = ${valX} dan y = ${valY} belum cocok. Coba hitung: 2(${valX}) + ${valY} = ${
          2 * valX + valY
        }. Apakah hasilnya sama dengan nilai di peti pertama?`,
      });
    }
  };

  const handleNextProblem = () => {
    sound.playClick();
    setFeedback(null);
    setInputX('');
    setInputY('');
    setShowHint(false);
    setShowExplanation(false);
    if (currentSubIndex < allChallenges.length) {
      onSelectSubIndex(currentSubIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/30 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold border border-purple-500/30 shadow-inner">
              💎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  Misi 2 &middot; Gua Persamaan
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Tantangan {currentSubIndex} dari {allChallenges.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                The Secret of the Treasure Box
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenScratchpad}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-medium border border-teal-500/20 transition flex items-center gap-1.5"
            >
              <span>✏️ Papan Coret</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-challenge Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
          {allChallenges.map((c, i) => (
            <button
              key={c.id}
              onClick={() => {
                sound.playClick();
                setFeedback(null);
                setInputX('');
                setInputY('');
                setShowHint(false);
                onSelectSubIndex(c.subLevelIndex);
              }}
              className={`text-xs px-3 py-1 rounded-lg font-mono font-semibold transition shrink-0 ${
                currentSubIndex === c.subLevelIndex
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Peti {i + 1}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Story Prompt Card */}
          <div className="bg-slate-950/70 border border-purple-500/20 rounded-xl p-4">
            <div className="text-xs text-purple-400 font-mono font-bold uppercase mb-1 flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5" />
              Misteri Peti Permata Stalaktit
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {challenge.storyContext}
            </p>
          </div>

          {/* Visual Gem Scale Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center space-y-3">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                Peti A: 2 Permata Merah + 1 Permata Biru
              </span>
              <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-700 w-full justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-sm">
                    💎
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-sm">
                    💎
                  </span>
                  <span className="text-slate-400 font-mono">+</span>
                  <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-sm">
                    🔷
                  </span>
                </div>
                <span className="text-slate-400 font-mono">=</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold font-mono text-base">
                  <Coins className="w-4 h-4 text-amber-400" />
                  {challenge.initialScales.scale1.rightPan.constantWeight} koin
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-purple-300">
                {challenge.initialScales.scale1.subtitle}
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center space-y-3">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                Peti B: 1 Permata Merah + 2 Permata Biru
              </span>
              <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-700 w-full justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-sm">
                    💎
                  </span>
                  <span className="text-slate-400 font-mono">+</span>
                  <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-sm">
                    🔷
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-sm">
                    🔷
                  </span>
                </div>
                <span className="text-slate-400 font-mono">=</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold font-mono text-base">
                  <Coins className="w-4 h-4 text-amber-400" />
                  {challenge.initialScales.scale2?.rightPan.constantWeight || 14} koin
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-purple-300">
                {challenge.initialScales.scale2?.subtitle}
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Tentukan Nilai Satuan Setiap Permata:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Harga 1 Permata Merah (<span className="text-rose-400 font-bold">x</span>):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputX}
                    onChange={(e) => setInputX(e.target.value)}
                    placeholder="Contoh: 6"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-rose-500 transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                    koin
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Harga 1 Permata Biru (<span className="text-blue-400 font-bold">y</span>):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputY}
                    onChange={(e) => setInputY(e.target.value)}
                    placeholder="Contoh: 4"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-blue-500 transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                    koin
                  </span>
                </div>
              </div>
            </div>

            {/* Check Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCheck}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-purple-900/30 transition flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Buka Kunci Peti Permata</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setShowHint(!showHint);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-xs border border-amber-500/20 transition flex items-center gap-1.5"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Petunjuk</span>
              </button>
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`p-3.5 rounded-xl text-xs md:text-sm leading-relaxed border animate-in fade-in ${
                  feedback.isCorrect
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base">{feedback.isCorrect ? '💎' : '⚠️'}</span>
                  <div className="flex-1 space-y-1">
                    <p>{feedback.message}</p>
                    {feedback.isCorrect && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={handleNextProblem}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition"
                        >
                          <span>
                            {currentSubIndex < allChallenges.length
                              ? 'Lanjut ke Peti Berikutnya'
                              : 'Klaim Segel Kedua & Peta'}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition"
                        >
                          {showExplanation ? 'Tutup Penjelasan' : 'Lihat Pembuktian Aljabar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Hints Box */}
            {showHint && (
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Petunjuk Bertahap ({hintIndex + 1}/{challenge.hints.length})
                  </span>
                  {challenge.hints.length > 1 && (
                    <button
                      onClick={() => setHintIndex((hintIndex + 1) % challenge.hints.length)}
                      className="text-[11px] underline hover:text-white"
                    >
                      Petunjuk Selanjutnya
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {challenge.hints[hintIndex]}
                </p>
              </div>
            )}

            {/* Explanation Box */}
            {showExplanation && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-2 animate-in fade-in text-xs text-slate-300">
                <h4 className="font-bold text-white text-sm">
                  {challenge.explanation.title}
                </h4>
                <ul className="list-disc list-inside space-y-1 font-mono text-slate-300">
                  {challenge.explanation.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
                <p className="text-purple-400 font-semibold pt-1">
                  {challenge.explanation.conclusion}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
