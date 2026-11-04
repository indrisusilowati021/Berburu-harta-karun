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
  ShoppingBag,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface Mission3SuppliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeProblem;
  allChallenges: ChallengeProblem[];
  currentSubIndex: number;
  onSelectSubIndex: (subIndex: number) => void;
  onSolveSuccess: (levelId: number, subIndex: number, isLastSub: boolean) => void;
  onOpenScratchpad: () => void;
}

export const Mission3SuppliesModal: React.FC<Mission3SuppliesModalProps> = ({
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
  const [activeTab, setActiveTab] = useState<'solver' | 'workshop'>('solver');
  const [mult1, setMult1] = useState<number>(3);
  const [mult2, setMult2] = useState<number>(2);
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
        message: 'Masukkan harga kedua barang persediaan logistik terlebih dahulu!',
      });
      return;
    }

    if (valX === challenge.secretX && valY === challenge.secretY) {
      sound.playSuccessFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#f59e0b', '#3b82f6', '#10b981'],
      });
      setFeedback({
        isCorrect: true,
        message: `Hebat sekali! Harga barang pertama = ${challenge.secretX} ${challenge.unit} dan barang kedua = ${challenge.secretY} ${challenge.unit}. Catatan logistik Pak Karim terselamatkan!`,
      });

      const isLast = currentSubIndex >= allChallenges.length;
      onSolveSuccess(3, currentSubIndex, isLast);
    } else {
      sound.playError();
      setFeedback({
        isCorrect: false,
        message: `Nilai x = ${valX} dan y = ${valY} belum sesuai. Coba cek: 2(${valX}) + 3(${valY}) = ${
          2 * valX + 3 * valY
        }. Samakan dengan total belanjaan pertama!`,
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
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/60 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/30 shadow-inner">
              ⛺
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Misi 3 &middot; Desa Penjelajah
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Tantangan {currentSubIndex} dari {allChallenges.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                The Lost Supplies (Logistik Pak Karim)
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
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
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
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Logistik {i + 1}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('solver')}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition ${
                activeTab === 'solver' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lembar Jawaban
            </button>
            <button
              onClick={() => setActiveTab('workshop')}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                activeTab === 'workshop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Simulasi Eliminasi</span>
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Story Prompt Card */}
          <div className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-4">
            <div className="text-xs text-amber-400 font-mono font-bold uppercase mb-1 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              Permintaan Bantuan Pedagang Desa
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {challenge.storyContext}
            </p>
          </div>

          {activeTab === 'workshop' ? (
            /* Interactive Step-by-Step Elimination Simulation */
            <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  Workshop Panduan Metode Eliminasi SPLDV
                </h4>
                <span className="text-xs text-slate-400">Langkah 1: Menyamakan Koefisien</span>
              </div>

              {/* Multiplier sliders */}
              <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300">
                    Persamaan 1: (2x + 3y = 39) &times; <strong>{mult1}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Pengali:</span>
                    {[1, 2, 3, 4].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMult1(m)}
                        className={`w-6 h-6 rounded text-xs font-mono font-bold ${
                          mult1 === m ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="font-mono text-sm font-bold text-sky-300 pl-2">
                  &rarr; {2 * mult1}x + {3 * mult1}y = {39 * mult1}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="font-mono text-slate-300">
                    Persamaan 2: (3x + 2y = 36) &times; <strong>{mult2}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Pengali:</span>
                    {[1, 2, 3, 4].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMult2(m)}
                        className={`w-6 h-6 rounded text-xs font-mono font-bold ${
                          mult2 === m ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="font-mono text-sm font-bold text-rose-300 pl-2">
                  &rarr; {3 * mult2}x + {2 * mult2}y = {36 * mult2}
                </div>
              </div>

              {/* Elimination Result */}
              {2 * mult1 === 3 * mult2 && (
                <div className="bg-emerald-950/80 border border-emerald-500 p-3.5 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Koefisien x sudah sama ({2 * mult1}x)! Lakukan pengurangan:
                  </div>
                  <div className="font-mono text-sm text-white">
                    ({2 * mult1}x - {3 * mult2}x) + ({3 * mult1}y - {2 * mult2}y) = {39 * mult1} - {36 * mult2}
                  </div>
                  <div className="font-mono text-sm text-emerald-300 font-bold">
                    &rarr; {3 * mult1 - 2 * mult2}y = {39 * mult1 - 36 * mult2} &rArr; y ={' '}
                    {(39 * mult1 - 36 * mult2) / (3 * mult1 - 2 * mult2)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mathematical Display */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center space-y-2">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase">
                  Transaksi A: {challenge.initialScales.scale1.title}
                </span>
                <div className="text-xl font-mono font-bold text-white bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                  {challenge.initialScales.scale1.subtitle}
                </div>
                <span className="text-xs text-slate-400">Total belanja paket pertama</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  Transaksi B: {challenge.initialScales.scale2?.title}
                </span>
                <div className="text-xl font-mono font-bold text-white bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                  {challenge.initialScales.scale2?.subtitle}
                </div>
                <span className="text-xs text-slate-400">Total belanja paket kedua</span>
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Masukkan Harga Satuan Barang Logistik ({challenge.unit}):
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Harga Barang Pertama (<span className="text-sky-400 font-bold">x</span>):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputX}
                    onChange={(e) => setInputX(e.target.value)}
                    placeholder="Contoh: 6"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-amber-500 transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                    {challenge.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Harga Barang Kedua (<span className="text-amber-400 font-bold">y</span>):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputY}
                    onChange={(e) => setInputY(e.target.value)}
                    placeholder="Contoh: 9"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-amber-500 transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                    {challenge.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Check Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCheck}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-900/30 transition flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verifikasi Harga Logistik</span>
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
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base">{feedback.isCorrect ? '📦' : '⚠️'}</span>
                  <div className="flex-1 space-y-1">
                    <p>{feedback.message}</p>
                    {feedback.isCorrect && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={handleNextProblem}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition"
                        >
                          <span>
                            {currentSubIndex < allChallenges.length
                              ? 'Lanjut ke Logistik Berikutnya'
                              : 'Buka Segel Ketiga & Akses Kuil'}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition"
                        >
                          {showExplanation ? 'Tutup Penjelasan' : 'Lihat Langkah Eliminasi'}
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
                <p className="text-amber-400 font-semibold pt-1">
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
