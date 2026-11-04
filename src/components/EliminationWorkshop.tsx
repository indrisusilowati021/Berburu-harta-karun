/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChallengeProblem } from '../types/game';
import { Zap, ArrowRight, Check, RefreshCw, Equal } from 'lucide-react';
import { sound } from '../utils/audio';

interface EliminationWorkshopProps {
  challenge: ChallengeProblem;
  onSolveComplete: (x: number, y: number) => void;
}

export const EliminationWorkshop: React.FC<EliminationWorkshopProps> = ({
  challenge,
  onSolveComplete,
}) => {
  const [mult1, setMult1] = useState<number>(1);
  const [mult2, setMult2] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [eliminated, setEliminated] = useState<boolean>(false);
  const [calculatedVarVal, setCalculatedVarVal] = useState<string>('');
  const [calculatedOtherVal, setCalculatedOtherVal] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const initialS1 = challenge.initialScales.scale1;
  const initialS2 = challenge.initialScales.scale2;

  if (!initialS2) return null;

  // Base coefficients from initial scale state
  const a1 = initialS1.leftPan.xCount;
  const b1 = initialS1.leftPan.yCount;
  const c1 = initialS1.rightPan.constantWeight;

  const a2 = initialS2.leftPan.xCount;
  const b2 = initialS2.leftPan.yCount;
  const c2 = initialS2.rightPan.constantWeight;

  // Multiplied coefficients
  const ma1 = a1 * mult1;
  const mb1 = b1 * mult1;
  const mc1 = c1 * mult1;

  const ma2 = a2 * mult2;
  const mb2 = b2 * mult2;
  const mc2 = c2 * mult2;

  // Check if coefficients match for subtraction
  const canEliminateX = ma1 === ma2 && ma1 > 0;
  const canEliminateY = mb1 === mb2 && mb1 > 0;

  const handleStep1Multiply = () => {
    sound.playClick();
    if (!canEliminateX && !canEliminateY) {
      sound.playError();
      setErrorMsg('Koefisien variabel x atau y belum sama. Atur pengali agar salah satu koefisien bernilai sama!');
      return;
    }
    setErrorMsg(null);
    setCurrentStep(2);
  };

  const handleSubtractEquations = () => {
    sound.playTilt('center');
    setEliminated(true);
    setCurrentStep(3);
  };

  const handleVerifyFirstVar = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(calculatedVarVal);
    const targetVar = canEliminateX ? 'y' : 'x';
    const targetVal = targetVar === 'x' ? challenge.secretX : challenge.secretY;

    if (val === targetVal) {
      sound.playBalanceEquilibrium();
      setErrorMsg(null);
      setCurrentStep(4);
    } else {
      sound.playError();
      setErrorMsg(`Perhitungan belum tepat. Coba periksa pembagian selisih konstanta dengan selisih koefisien.`);
    }
  };

  const handleVerifySecondVar = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(calculatedOtherVal);
    const otherVar = canEliminateX ? 'x' : 'y';
    const otherVal = otherVar === 'x' ? challenge.secretX : challenge.secretY;

    if (val === otherVal) {
      sound.playSuccessFanfare();
      setErrorMsg(null);
      setCurrentStep(5);
      onSolveComplete(challenge.secretX, challenge.secretY);
    } else {
      sound.playError();
      setErrorMsg(`Nilai ${otherVar} belum tepat setelah substitusi balik.`);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setMult1(1);
    setMult2(1);
    setCurrentStep(1);
    setEliminated(false);
    setCalculatedVarVal('');
    setCalculatedOtherVal('');
    setErrorMsg(null);
  };

  // Remaining variable after subtraction
  const diffA = Math.abs(ma1 - ma2);
  const diffB = Math.abs(mb1 - mb2);
  const diffC = Math.abs(mc1 - mc2);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Workshop Interaktif Metode Eliminasi</h3>
            <p className="text-xs text-slate-400">
              Samakan koefisien salah satu variabel, lalu kurangkan timbangan untuk mereduksi persamaan!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Mulai Ulang
        </button>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { num: 1, label: '1. Atur Pengali' },
          { num: 2, label: '2. Kurangkan Persamaan' },
          { num: 3, label: '3. Cari Variabel Pertama' },
          { num: 4, label: '4. Substitusi Balik' },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
              currentStep === s.num
                ? 'bg-emerald-600 text-white shadow-md'
                : currentStep > s.num
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                : 'bg-slate-950/60 text-slate-500 border border-slate-800'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Equations Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Persamaan 1 Box */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase">
              Timbangan 1 (Persamaan 1)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Kalikan:</span>
              <select
                disabled={currentStep > 1}
                value={mult1}
                onChange={(e) => setMult1(parseInt(e.target.value))}
                className="bg-slate-900 border border-cyan-700/60 text-cyan-300 font-mono text-xs rounded px-2 py-0.5 focus:outline-none"
              >
                <option value={1}>x 1</option>
                <option value={2}>x 2</option>
                <option value={3}>x 3</option>
                <option value={4}>x 4</option>
              </select>
            </div>
          </div>
          <div className="font-mono text-base font-bold text-slate-200">
            {a1}x + {b1}y = {c1} kg
          </div>
          {mult1 > 1 && (
            <div className="mt-2 text-xs font-mono text-cyan-300 bg-cyan-950/50 p-2 rounded border border-cyan-800/40">
              Hasil Perkalian: <span className="font-bold">{ma1}x + {mb1}y = {mc1} kg</span>
            </div>
          )}
        </div>

        {/* Persamaan 2 Box */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-fuchsia-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-fuchsia-400 font-mono uppercase">
              Timbangan 2 (Persamaan 2)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Kalikan:</span>
              <select
                disabled={currentStep > 1}
                value={mult2}
                onChange={(e) => setMult2(parseInt(e.target.value))}
                className="bg-slate-900 border border-fuchsia-700/60 text-fuchsia-300 font-mono text-xs rounded px-2 py-0.5 focus:outline-none"
              >
                <option value={1}>x 1</option>
                <option value={2}>x 2</option>
                <option value={3}>x 3</option>
                <option value={4}>x 4</option>
              </select>
            </div>
          </div>
          <div className="font-mono text-base font-bold text-slate-200">
            {a2}x + {b2}y = {c2} kg
          </div>
          {mult2 > 1 && (
            <div className="mt-2 text-xs font-mono text-fuchsia-300 bg-fuchsia-950/50 p-2 rounded border border-fuchsia-800/40">
              Hasil Perkalian: <span className="font-bold">{ma2}x + {mb2}y = {mc2} kg</span>
            </div>
          )}
        </div>
      </div>

      {/* Step Actions Interactive Flow */}
      {currentStep === 1 && (
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            {canEliminateX ? (
              <span className="text-emerald-400 font-semibold">
                Sempurna! Koefisien X sudah sama ({ma1}x). Siap dieliminasi.
              </span>
            ) : canEliminateY ? (
              <span className="text-emerald-400 font-semibold">
                Sempurna! Koefisien Y sudah sama ({mb1}y). Siap dieliminasi.
              </span>
            ) : (
              <span>
                Pilih angka pengali pada menu di atas agar koefisien <strong>x</strong> atau <strong>y</strong> menjadi bernilai sama!
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleStep1Multiply}
            disabled={!canEliminateX && !canEliminateY}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            Lanjut ke Pengurangan
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="p-4 bg-slate-950/60 rounded-xl border border-emerald-500/40">
          <div className="text-xs text-emerald-300 font-bold mb-2">
            Operasi Pengurangan Dua Timbangan:
          </div>
          <div className="font-mono text-sm bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed text-slate-200">
            <div>({ma1}x + {mb1}y = {mc1})</div>
            <div className="border-b border-slate-700 pb-1">- ({ma2}x + {mb2}y = {mc2})</div>
            <div className="pt-1 text-emerald-400 font-bold">
              {canEliminateX ? (
                <>0x + {diffB}y = {diffC} kg</>
              ) : (
                <>{diffA}x + 0y = {diffC} kg</>
              )}
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSubtractEquations}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center gap-1.5"
            >
              Hilangkan Variabel (Eliminasi)
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <form onSubmit={handleVerifyFirstVar} className="p-4 bg-slate-950/60 rounded-xl border border-indigo-500/40">
          <div className="text-xs text-indigo-300 font-bold mb-1">
            Hitung Nilai Variabel yang Tersisa:
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {canEliminateX ? (
              <>Dari persamaan: {diffB}y = {diffC} kg. Berapakah nilai <strong>y</strong>?</>
            ) : (
              <>Dari persamaan: {diffA}x = {diffC} kg. Berapakah nilai <strong>x</strong>?</>
            )}
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-white text-sm">
              {canEliminateX ? 'y =' : 'x ='}
            </span>
            <input
              type="number"
              step="any"
              value={calculatedVarVal}
              onChange={(e) => setCalculatedVarVal(e.target.value)}
              placeholder="0"
              className="w-24 bg-slate-900 border border-indigo-500/50 rounded-lg px-3 py-1.5 font-mono text-white text-sm focus:outline-none"
            />
            <span className="text-xs text-slate-400">kg</span>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition"
            >
              Konfirmasi
            </button>
          </div>
        </form>
      )}

      {currentStep === 4 && (
        <form onSubmit={handleVerifySecondVar} className="p-4 bg-slate-950/60 rounded-xl border border-fuchsia-500/40">
          <div className="text-xs text-fuchsia-300 font-bold mb-1">
            Langkah Terakhir: Substitusi Balik
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Masukkan nilai {canEliminateX ? `y = ${challenge.secretY}` : `x = ${challenge.secretX}`} ke dalam salah satu persamaan awal ({a2}x + {b2}y = {c2}). Berapakah nilai <strong>{canEliminateX ? 'x' : 'y'}</strong>?
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-white text-sm">
              {canEliminateX ? 'x =' : 'y ='}
            </span>
            <input
              type="number"
              step="any"
              value={calculatedOtherVal}
              onChange={(e) => setCalculatedOtherVal(e.target.value)}
              placeholder="0"
              className="w-24 bg-slate-900 border border-fuchsia-500/50 rounded-lg px-3 py-1.5 font-mono text-white text-sm focus:outline-none"
            />
            <span className="text-xs text-slate-400">kg</span>
            <button
              type="submit"
              className="px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs rounded-lg transition"
            >
              Verifikasi Akhir
            </button>
          </div>
        </form>
      )}

      {currentStep === 5 && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-200">
                Luar Biasa! Eliminasi Sempurna Selesai
              </div>
              <div className="text-xs text-emerald-300 font-mono">
                Solusi: x = {challenge.secretX} kg, y = {challenge.secretY} kg
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 text-xs text-rose-300 bg-rose-950/50 p-2.5 rounded-lg border border-rose-800">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
