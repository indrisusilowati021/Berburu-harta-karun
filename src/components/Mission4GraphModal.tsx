/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraphEquationProblem } from '../types/game';
import { GRAPH_PROBLEMS } from '../data/challenges';
import { InteractiveCartesianGraph } from './InteractiveCartesianGraph';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Crosshair,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface Mission4GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProblems: GraphEquationProblem[];
  currentSubIndex: number;
  onSelectSubIndex: (subIndex: number) => void;
  onSolveSuccess: (levelId: number, subIndex: number, isLastSub: boolean) => void;
  onOpenScratchpad: () => void;
}

export const Mission4GraphModal: React.FC<Mission4GraphModalProps> = ({
  isOpen,
  onClose,
  allProblems,
  currentSubIndex,
  onSelectSubIndex,
  onSolveSuccess,
  onOpenScratchpad,
}) => {
  const currentProblem = allProblems[currentSubIndex - 1] || allProblems[0] || GRAPH_PROBLEMS[0];
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectIntersection = (x: number, y: number) => {
    setSelectedPoint({ x, y });

    if (x === currentProblem.intersectX && y === currentProblem.intersectY) {
      sound.playSuccessFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#06b6d4', '#f59e0b', '#3b82f6'],
      });
      setIsSolved(true);
      setFeedback({
        isCorrect: true,
        message: `Sempurna! Titik perpotongan kedua garis adalah (${x}, ${y}). Garis pertama dan garis kedua bersilangan di satu titik koordinat ini!`,
      });

      const isLast = currentSubIndex >= allProblems.length;
      onSolveSuccess(4, currentSubIndex, isLast);
    } else {
      sound.playError();
      setIsSolved(false);
      setFeedback({
        isCorrect: false,
        message: `Titik (${x}, ${y}) belum tepat. Amati perpotongan garis biru dan garis merah pada bidang Kartesius di atas, lalu klik pada persilangan tepatnya!`,
      });
    }
  };

  const handleNextProblem = () => {
    sound.playClick();
    setFeedback(null);
    setSelectedPoint(null);
    setIsSolved(false);
    setShowHint(false);
    setShowExplanation(false);
    if (currentSubIndex < allProblems.length) {
      onSelectSubIndex(currentSubIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-teal-500/30 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-teal-950/60 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl font-bold border border-teal-500/30 shadow-inner">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                  Misi 4 &middot; Kuil Matematika
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Tantangan {currentSubIndex} dari {allProblems.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                The Ancient Graph (Altar Koordinat Kartesius)
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
          {allProblems.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                sound.playClick();
                setFeedback(null);
                setSelectedPoint(null);
                setIsSolved(false);
                setShowHint(false);
                onSelectSubIndex(i + 1);
              }}
              className={`text-xs px-3 py-1 rounded-lg font-mono font-semibold transition shrink-0 ${
                currentSubIndex === i + 1
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Altar {i + 1}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Story Prompt Card */}
          <div className="bg-slate-950/70 border border-teal-500/20 rounded-xl p-4">
            <div className="text-xs text-teal-400 font-mono font-bold uppercase mb-1 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              Sinar Laser Koordinat Kuil Kuno
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {currentProblem.storyContext}
            </p>
          </div>

          {/* Interactive Cartesian Coordinate Graph Tool */}
          <InteractiveCartesianGraph
            problem={currentProblem}
            onSelectIntersection={handleSelectIntersection}
            selectedPoint={selectedPoint}
            isSolved={isSolved}
          />

          {/* Table of Values & Coordinate Sliders */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
                Tabel Nilai & Koordinat Dua Garis
              </h4>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowHint(!showHint);
                }}
                className="text-xs text-amber-300 hover:text-white flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Petunjuk</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-sky-500/30">
                <div className="text-sky-400 font-bold mb-1">Garis A: {currentProblem.eq1.slopeIntercept}</div>
                <div className="text-slate-400 text-[11px]">
                  x = 0 &rarr; y = {currentProblem.eq1.c / currentProblem.eq1.b} | x = 3 &rarr; y ={' '}
                  {(currentProblem.eq1.c - currentProblem.eq1.a * 3) / currentProblem.eq1.b}
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-rose-500/30">
                <div className="text-rose-400 font-bold mb-1">Garis B: {currentProblem.eq2.slopeIntercept}</div>
                <div className="text-slate-400 text-[11px]">
                  x = 0 &rarr; y = {currentProblem.eq2.c / currentProblem.eq2.b} | x = 3 &rarr; y ={' '}
                  {(currentProblem.eq2.c - currentProblem.eq2.a * 3) / currentProblem.eq2.b}
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div
                className={`p-3.5 rounded-xl text-xs md:text-sm leading-relaxed border animate-in fade-in ${
                  feedback.isCorrect
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base">{feedback.isCorrect ? '🏛️' : '⚠️'}</span>
                  <div className="flex-1 space-y-1">
                    <p>{feedback.message}</p>
                    {feedback.isCorrect && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={handleNextProblem}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition"
                        >
                          <span>
                            {currentSubIndex < allProblems.length
                              ? 'Lanjut ke Altar Berikutnya'
                              : 'Buka Segel Keempat & Treasure Cave'}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition"
                        >
                          {showExplanation ? 'Tutup Penjelasan' : 'Lihat Analisis Grafik'}
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
                    Petunjuk Bertahap ({hintIndex + 1}/{currentProblem.hints.length})
                  </span>
                  {currentProblem.hints.length > 1 && (
                    <button
                      onClick={() => setHintIndex((hintIndex + 1) % currentProblem.hints.length)}
                      className="text-[11px] underline hover:text-white"
                    >
                      Petunjuk Selanjutnya
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentProblem.hints[hintIndex]}
                </p>
              </div>
            )}

            {/* Explanation Box */}
            {showExplanation && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-2 animate-in fade-in text-xs text-slate-300">
                <h4 className="font-bold text-white text-sm">
                  Analisis Metode Grafik SPLDV
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {currentProblem.explanation}
                </p>
                <p className="text-teal-400 font-semibold pt-1">
                  Titik perpotongan garis adalah penyelesaian tunggal sistem: ({currentProblem.intersectX}, {currentProblem.intersectY}).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
