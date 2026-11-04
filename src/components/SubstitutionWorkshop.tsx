/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChallengeProblem } from '../types/game';
import { Repeat, ArrowRight, Check, Sparkles, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';

interface SubstitutionWorkshopProps {
  challenge: ChallengeProblem;
  onSolveComplete: (x: number, y: number) => void;
}

export const SubstitutionWorkshop: React.FC<SubstitutionWorkshopProps> = ({
  challenge,
  onSolveComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [guessFirstVar, setGuessFirstVar] = useState<string>('');
  const [guessSecondVar, setGuessSecondVar] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isProb1 = challenge.id === 'lvl4_prob1';

  // For prob1: x = y + 2, 2x + y = 16
  // For prob2: y = 2x - 1, x + y = 11

  const handleStep1Replace = () => {
    sound.playClick();
    sound.playDropItem(2);
    setCurrentStep(2);
  };

  const handleStep2Expand = () => {
    sound.playClick();
    setCurrentStep(3);
  };

  const handleVerifyFirst = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(guessFirstVar);
    const targetVal = isProb1 ? challenge.secretY : challenge.secretX;

    if (val === targetVal) {
      sound.playBalanceEquilibrium();
      setErrorMsg(null);
      setCurrentStep(4);
    } else {
      sound.playError();
      setErrorMsg(`Nilai belum tepat. Selesaikan persamaan aljabar satu variabel di atas.`);
    }
  };

  const handleVerifySecond = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(guessSecondVar);
    const targetVal = isProb1 ? challenge.secretX : challenge.secretY;

    if (val === targetVal) {
      sound.playSuccessFanfare();
      setErrorMsg(null);
      setCurrentStep(5);
      onSolveComplete(challenge.secretX, challenge.secretY);
    } else {
      sound.playError();
      setErrorMsg(`Nilai belum tepat setelah substitusi kembali.`);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setCurrentStep(1);
    setGuessFirstVar('');
    setGuessSecondVar('');
    setErrorMsg(null);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Workshop Interaktif Metode Substitusi</h3>
            <p className="text-xs text-slate-400">
              Gantikan variabel pada timbangan kedua dengan ekspresi ekuivalen dari timbangan pertama!
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

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { num: 1, label: '1. Identifikasi Kesetaraan' },
          { num: 2, label: '2. Masukkan Substitusi' },
          { num: 3, label: '3. Sederhanakan Aljabar' },
          { num: 4, label: '4. Cari Variabel Kedua' },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
              currentStep === s.num
                ? 'bg-purple-600 text-white shadow-md'
                : currentStep > s.num
                ? 'bg-purple-950/60 text-purple-400 border border-purple-800/60'
                : 'bg-slate-950/60 text-slate-500 border border-slate-800'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Equations Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-800/50">
          <span className="text-xs font-bold text-cyan-400 font-mono uppercase block mb-1">
            Persamaan (1) - Bentuk Terisolasi
          </span>
          <div className="font-mono text-lg font-bold text-cyan-300">
            {isProb1 ? 'x = y + 2' : 'y = 2x - 1'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isProb1 ? 'Setiap 1 Kotak X setara dengan 1 Kotak Y + 2 kg.' : 'Setiap 1 Kotak Y setara dengan 2 Kotak X - 1 kg.'}
          </p>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-fuchsia-800/50">
          <span className="text-xs font-bold text-fuchsia-400 font-mono uppercase block mb-1">
            Persamaan (2) - Sasaran Substitusi
          </span>
          <div className="font-mono text-lg font-bold text-fuchsia-300">
            {isProb1 ? '2x + y = 16' : 'x + y = 11'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Persamaan target tempat kita akan menanamkan variabel yang sudah diisolasi.
          </p>
        </div>
      </div>

      {/* Interactive Step Container */}
      {currentStep === 1 && (
        <div className="p-4 bg-slate-950/70 border border-purple-800/40 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            Klik tombol di samping untuk mengganti nilai <strong>{isProb1 ? 'x' : 'y'}</strong> pada Persamaan (2) dengan ekspresi setara <strong>{isProb1 ? '(y + 2)' : '(2x - 1)'}</strong>.
          </div>
          <button
            type="button"
            onClick={handleStep1Replace}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 shrink-0"
          >
            Substitusikan Sekarang
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="p-4 bg-slate-950/70 border border-purple-800/60 rounded-xl">
          <div className="text-xs font-bold text-purple-300 mb-2">
            Persamaan Setelah Penggantian (Substitusi):
          </div>
          <div className="font-mono text-base p-3 bg-slate-900 border border-purple-900/50 rounded-lg text-slate-200">
            {isProb1 ? (
              <>2<span className="text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">(y + 2)</span> + y = 16</>
            ) : (
              <>x + <span className="text-fuchsia-400 font-bold bg-fuchsia-950/60 px-1.5 py-0.5 rounded border border-fuchsia-800">(2x - 1)</span> = 11</>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleStep2Expand}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              Uraikan & Jabarkan
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <form onSubmit={handleVerifyFirst} className="p-4 bg-slate-950/70 border border-purple-800/60 rounded-xl">
          <div className="text-xs font-bold text-purple-300 mb-2">
            Penjabaran Aljabar Satu Variabel:
          </div>
          <div className="font-mono text-xs md:text-sm p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 space-y-1 mb-3">
            {isProb1 ? (
              <>
                <div>2y + 4 + y = 16</div>
                <div className="text-purple-300 font-semibold">3y + 4 = 16</div>
                <div>3y = 16 - 4 =&gt; 3y = 12</div>
              </>
            ) : (
              <>
                <div>x + 2x - 1 = 11</div>
                <div className="text-purple-300 font-semibold">3x - 1 = 11</div>
                <div>3x = 11 + 1 =&gt; 3x = 12</div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-white text-sm">
              {isProb1 ? 'y =' : 'x ='}
            </span>
            <input
              type="number"
              step="any"
              value={guessFirstVar}
              onChange={(e) => setGuessFirstVar(e.target.value)}
              placeholder="0"
              className="w-24 bg-slate-900 border border-purple-500/50 rounded-lg px-3 py-1.5 font-mono text-white text-sm focus:outline-none"
            />
            <span className="text-xs text-slate-400">kg</span>
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition"
            >
              Konfirmasi Nilai
            </button>
          </div>
        </form>
      )}

      {currentStep === 4 && (
        <form onSubmit={handleVerifySecond} className="p-4 bg-slate-950/70 border border-purple-800/60 rounded-xl">
          <div className="text-xs font-bold text-purple-300 mb-2">
            Substitusi Balik ke Persamaan Awal:
          </div>
          <p className="text-xs text-slate-300 mb-3">
            {isProb1 ? (
              <>Karena y = {challenge.secretY}, masukkan ke persamaan (1): x = {challenge.secretY} + 2. Berapakah nilai <strong>x</strong>?</>
            ) : (
              <>Karena x = {challenge.secretX}, masukkan ke persamaan (1): y = 2({challenge.secretX}) - 1. Berapakah nilai <strong>y</strong>?</>
            )}
          </p>

          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-white text-sm">
              {isProb1 ? 'x =' : 'y ='}
            </span>
            <input
              type="number"
              step="any"
              value={guessSecondVar}
              onChange={(e) => setGuessSecondVar(e.target.value)}
              placeholder="0"
              className="w-24 bg-slate-900 border border-purple-500/50 rounded-lg px-3 py-1.5 font-mono text-white text-sm focus:outline-none"
            />
            <span className="text-xs text-slate-400">kg</span>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs rounded-lg transition"
            >
              Selesaikan
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
                Penyelesaian Substitusi Berhasil!
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
