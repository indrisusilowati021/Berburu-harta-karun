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
  Crown,
  Key,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Unlock,
  Award,
} from 'lucide-react';

interface Mission5FinalModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeProblem;
  allChallenges: ChallengeProblem[];
  currentSubIndex: number;
  onSelectSubIndex: (subIndex: number) => void;
  sealsUnlocked: number[];
  onSolveSuccess: (levelId: number, subIndex: number, isLastSub: boolean) => void;
  onOpenEvaluation: () => void;
  onOpenScratchpad: () => void;
}

export const Mission5FinalModal: React.FC<Mission5FinalModalProps> = ({
  isOpen,
  onClose,
  challenge,
  allChallenges,
  currentSubIndex,
  onSelectSubIndex,
  sealsUnlocked,
  onSolveSuccess,
  onOpenEvaluation,
  onOpenScratchpad,
}) => {
  const [inputX, setInputX] = useState<string>('');
  const [inputY, setInputY] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isGrandVictory, setIsGrandVictory] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCheck = () => {
    const valX = parseFloat(inputX);
    const valY = parseFloat(inputY);

    if (isNaN(valX) || isNaN(valY)) {
      sound.playError();
      setFeedback({
        isCorrect: false,
        message: 'Masukkan nilai untuk kedua variabel kunci emas terlebih dahulu!',
      });
      return;
    }

    if (valX === challenge.secretX && valY === challenge.secretY) {
      sound.playSuccessFanfare();
      sound.playOpenChest();

      // Grand celebration confetti
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#facc15', '#f59e0b', '#38bdf8', '#10b981', '#ec4899'],
      });

      const isLast = currentSubIndex >= allChallenges.length;
      if (isLast) {
        setIsGrandVictory(true);
      }

      setFeedback({
        isCorrect: true,
        message: isLast
          ? 'MAHAKARYA MATEMATIKA! Peti Harta Karun Utama terbuka lebar dengan cahaya keemasan! Seluruh misteri SPLDV di Treasure Island telah kamu pecahkan!'
          : `Tepat sekali! Solusi x = ${challenge.secretX} dan y = ${challenge.secretY}. Segel kuno berhasil dipecahkan!`,
      });

      onSolveSuccess(5, currentSubIndex, isLast);
    } else {
      sound.playError();
      setFeedback({
        isCorrect: false,
        message: `Nilai x = ${valX} dan y = ${valY} belum sesuai. Coba periksa kembali dengan metode substitusi atau eliminasi yang telah kamu pelajari!`,
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
      onOpenEvaluation();
    }
  };

  const sealNames = [
    'Segel 1: Hutan Angka',
    'Segel 2: Gua Persamaan',
    'Segel 3: Desa Penjelajah',
    'Segel 4: Kuil Matematika',
    'Segel 5: Treasure Cave',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-yellow-500/40 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/70 via-yellow-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xl font-bold border border-yellow-500/30 shadow-inner">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 uppercase">
                  Misi 5 &middot; Treasure Cave
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Tantangan {currentSubIndex} dari {allChallenges.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                The Final Treasure (Gerbang Lima Segel)
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

        {/* 5-Seal Status Bar */}
        <div className="bg-slate-950 px-5 py-2.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-medium">Status 5 Segel Rahasia:</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => {
              const isUnlocked = sealsUnlocked.includes(s);
              return (
                <div
                  key={s}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border transition ${
                    isUnlocked
                      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {isUnlocked ? <Unlock className="w-3 h-3 text-yellow-400" /> : <Lock className="w-3 h-3" />}
                  <span>Segel {s}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-challenge Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
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
                  ? 'bg-yellow-600 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Ujian {i + 1}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Story Prompt Card */}
          <div className="bg-slate-950/70 border border-yellow-500/30 rounded-xl p-4">
            <div className="text-xs text-yellow-400 font-mono font-bold uppercase mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Segel Agung Harta Karun Terakhir
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {challenge.storyContext}
            </p>
          </div>

          {/* Mathematical Modeling Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                {challenge.initialScales.scale1.title}
              </span>
              <div className="text-2xl font-mono font-bold text-yellow-300 bg-slate-900/90 px-4 py-2 rounded-lg border border-yellow-500/30 shadow-inner">
                {challenge.initialScales.scale1.subtitle}
              </div>
              <span className="text-xs text-slate-400">Persamaan linear pertama</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
                {challenge.initialScales.scale2?.title}
              </span>
              <div className="text-2xl font-mono font-bold text-yellow-300 bg-slate-900/90 px-4 py-2 rounded-lg border border-yellow-500/30 shadow-inner">
                {challenge.initialScales.scale2?.subtitle}
              </div>
              <span className="text-xs text-slate-400">Persamaan linear kedua</span>
            </div>
          </div>

          {/* Interactive Answer Input Section */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Pecahkan Nilai Variabel Kunci Emas:
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Satuan: {challenge.unit}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Nilai Kunci Pertama (<span className="text-yellow-400 font-bold">x</span>):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputX}
                    onChange={(e) => setInputX(e.target.value)}
                    placeholder="Contoh: 8"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-yellow-500 transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                    x
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Nilai Kunci Kedua (<span className="text-amber-400 font-bold">y</span>):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputY}
                    onChange={(e) => setInputY(e.target.value)}
                    placeholder="Contoh: 5"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-yellow-500 transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                    y
                  </span>
                </div>
              </div>
            </div>

            {/* Check Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCheck}
                className="flex-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-lg shadow-yellow-900/30 transition flex items-center justify-center gap-2 text-sm"
              >
                <Key className="w-4 h-4 text-slate-950" />
                <span>Buka Segel Harta Karun</span>
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
                className={`p-4 rounded-xl text-xs md:text-sm leading-relaxed border animate-in fade-in ${
                  feedback.isCorrect
                    ? 'bg-yellow-950/90 border-yellow-500 text-yellow-100 shadow-xl'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">{feedback.isCorrect ? '🏆' : '⚠️'}</span>
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">{feedback.message}</p>
                    {feedback.isCorrect && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {isGrandVictory ? (
                          <button
                            onClick={onOpenEvaluation}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow-md transition"
                          >
                            <Award className="w-4 h-4" />
                            <span>Lihat Rapor Evaluasi & Cetak Sertifikat</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleNextProblem}
                            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition"
                          >
                            <span>Lanjut ke Ujian Berikutnya</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition"
                        >
                          {showExplanation ? 'Tutup Penjelasan' : 'Lihat Langkah Pembuktian'}
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
                <p className="text-yellow-400 font-bold pt-1">
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
