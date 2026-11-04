/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScaleState, ChallengeProblem, ItemType } from '../types/game';
import { INVENTORY_ITEMS } from '../data/inventory';
import {
  RotateCcw,
  CheckCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Scale,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Layers,
  Box,
  Zap,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ScaleOverlayProps {
  challenge: ChallengeProblem;
  scale1: ScaleState;
  scale2?: ScaleState;
  onUpdateScale: (scaleId: string, updated: ScaleState) => void;
  onResetScales: () => void;
  onCheckAnswer: (guessX: number, guessY: number) => { isCorrect: boolean; message: string; diffDetails?: string };
  onOpenHint: () => void;
  onOpenExplanation: () => void;
  isCompleted: boolean;
  onNextChallenge?: () => void;
}

export const ScaleOverlay: React.FC<ScaleOverlayProps> = ({
  challenge,
  scale1,
  scale2,
  onUpdateScale,
  onResetScales,
  onCheckAnswer,
  onOpenHint,
  onOpenExplanation,
  isCompleted,
  onNextChallenge,
}) => {
  const [guessX, setGuessX] = useState<string>('');
  const [guessY, setGuessY] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'scale1' | 'scale2'>('scale1');
  const [showEquation, setShowEquation] = useState<boolean>(true);
  const [showCheckModal, setShowCheckModal] = useState<boolean>(false);

  const isLevel1 = challenge.levelId === 1;
  const currentScale = activeTab === 'scale1' || !scale2 ? scale1 : scale2;

  // Add item of specific type to pan
  const handleAddItemToPan = (pan: 'left' | 'right', itemType: ItemType) => {
    sound.playDropItem();
    const updated: ScaleState = JSON.parse(JSON.stringify(currentScale));
    const targetPan = pan === 'left' ? updated.leftPan : updated.rightPan;
    if (!targetPan.itemsList) targetPan.itemsList = [];

    if (itemType === 'x') {
      targetPan.xCount += 1;
    } else if (itemType === 'y') {
      targetPan.yCount += 1;
    } else {
      const def = INVENTORY_ITEMS.find((it) => it.type === itemType);
      const w = def ? def.weight : 1;
      targetPan.constantWeight += w;
      targetPan.itemsList.push(itemType);
    }

    onUpdateScale(currentScale.id, updated);
  };

  // Remove item of specific type from pan
  const handleRemoveItemFromPan = (pan: 'left' | 'right', itemType: ItemType) => {
    sound.playClick();
    const updated: ScaleState = JSON.parse(JSON.stringify(currentScale));
    const targetPan = pan === 'left' ? updated.leftPan : updated.rightPan;

    if (itemType === 'x' && targetPan.xCount > 0) {
      targetPan.xCount -= 1;
    } else if (itemType === 'y' && targetPan.yCount > 0) {
      targetPan.yCount -= 1;
    } else {
      const def = INVENTORY_ITEMS.find((it) => it.type === itemType);
      const w = def ? def.weight : 1;
      if (targetPan.constantWeight >= w) {
        targetPan.constantWeight -= w;
        if (targetPan.itemsList) {
          const idx = targetPan.itemsList.indexOf(itemType);
          if (idx >= 0) targetPan.itemsList.splice(idx, 1);
        }
      }
    }

    onUpdateScale(currentScale.id, updated);
  };

  // Drag start handler for inventory items
  const handleDragStart = (e: React.DragEvent, itemType: ItemType) => {
    e.dataTransfer.setData('application/balance-item', itemType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const valX = parseFloat(guessX);
    const valY = isLevel1 ? 0 : parseFloat(guessY);

    if (isNaN(valX) || (!isLevel1 && isNaN(valY))) {
      sound.playError();
      setFeedback({
        isCorrect: false,
        message: 'Masukkan nilai tebakan berat untuk variabel yang dicari terlebih dahulu!',
      });
      return;
    }

    const result = onCheckAnswer(valX, valY);
    setFeedback(result);
  };

  // Generate dynamic algebraic equation strings
  const formatEquation = (scale: ScaleState) => {
    const formatPan = (pan: { xCount: number; yCount: number; constantWeight: number }) => {
      const parts: string[] = [];
      if (pan.xCount === 1) parts.push('x');
      else if (pan.xCount > 1) parts.push(`${pan.xCount}x`);

      if (pan.yCount === 1) parts.push('y');
      else if (pan.yCount > 1) parts.push(`${pan.yCount}y`);

      if (pan.constantWeight > 0) parts.push(`${pan.constantWeight}`);

      return parts.length > 0 ? parts.join(' + ') : '0';
    };

    return `${formatPan(scale.leftPan)} = ${formatPan(scale.rightPan)}`;
  };

  // Filter inventory items based on current level (hide Y on Level 1)
  const availableItems = INVENTORY_ITEMS.filter((item) => {
    if (isLevel1 && item.type === 'y') return false;
    return true;
  });

  return (
    <div className="w-full bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-xl space-y-4">
      {/* 5 MAIN CONTROL BUTTONS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/80 border border-slate-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* RESET BUTTON */}
          <button
            type="button"
            onClick={onResetScales}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition active:scale-95 shadow"
            title="Kembalikan timbangan ke kondisi awal soal"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            RESET
          </button>

          {/* CHECK BALANCE BUTTON */}
          <button
            type="button"
            onClick={() => setShowCheckModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition active:scale-95"
            title="Cek apakah tebakan variabel kamu seimbang"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            CHECK BALANCE
          </button>

          {/* SHOW EQUATION BUTTON */}
          <button
            type="button"
            onClick={() => setShowEquation(!showEquation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
              showEquation
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Tampilkan / Sembunyikan Model Persamaan Matematika"
          >
            {showEquation ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            SHOW EQUATION
          </button>

          {/* HINT BUTTON */}
          <button
            type="button"
            onClick={onOpenHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition active:scale-95"
            title="Buka petunjuk bertingkat"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            HINT
          </button>
        </div>

        {/* NEXT CHALLENGE BUTTON */}
        {onNextChallenge && (
          <button
            type="button"
            onClick={onNextChallenge}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition active:scale-95 ml-auto"
          >
            <span>NEXT CHALLENGE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* DYNAMIC EQUATION DISPLAY (TOGGLEABLE) */}
      {showEquation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 transition-all animate-fadeIn">
          {/* Equation 1 */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              activeTab === 'scale1'
                ? 'bg-slate-950/90 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                {scale1.title}
              </span>
              {scale2 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('scale1')}
                  className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold ${
                    activeTab === 'scale1'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  Pilih Timbangan
                </button>
              )}
            </div>
            <div className="mt-1 font-mono text-base md:text-lg font-extrabold text-white flex items-center justify-between">
              <span>Model SPLDV: {formatEquation(scale1)}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Mangkuk Kiri: {scale1.leftPan.xCount > 0 ? `${scale1.leftPan.xCount}X ` : ''}
              {scale1.leftPan.yCount > 0 ? `${scale1.leftPan.yCount}Y ` : ''}
              {scale1.leftPan.constantWeight > 0 ? `+ ${scale1.leftPan.constantWeight}kg` : ''} &middot;
              Mangkuk Kanan: {scale1.rightPan.xCount > 0 ? `${scale1.rightPan.xCount}X ` : ''}
              {scale1.rightPan.yCount > 0 ? `${scale1.rightPan.yCount}Y ` : ''}
              {scale1.rightPan.constantWeight > 0 ? `${scale1.rightPan.constantWeight}kg` : '0kg'}
            </div>
          </div>

          {/* Equation 2 if present */}
          {scale2 ? (
            <div
              className={`p-3 rounded-2xl border transition-all ${
                activeTab === 'scale2'
                  ? 'bg-slate-950/90 border-fuchsia-500/60 shadow-[0_0_20px_rgba(217,70,239,0.15)]'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#e879f9]"></span>
                  {scale2.title}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('scale2')}
                  className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold ${
                    activeTab === 'scale2'
                      ? 'bg-fuchsia-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-fuchsia-300'
                  }`}
                >
                  Pilih Timbangan
                </button>
              </div>
              <div className="mt-1 font-mono text-base md:text-lg font-extrabold text-white flex items-center justify-between">
                <span>Model SPLDV: {formatEquation(scale2)}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Mangkuk Kiri: {scale2.leftPan.xCount > 0 ? `${scale2.leftPan.xCount}X ` : ''}
                {scale2.leftPan.yCount > 0 ? `${scale2.leftPan.yCount}Y ` : ''}
                {scale2.leftPan.constantWeight > 0 ? `+ ${scale2.leftPan.constantWeight}kg` : ''} &middot;
                Mangkuk Kanan: {scale2.rightPan.xCount > 0 ? `${scale2.rightPan.xCount}X ` : ''}
                {scale2.rightPan.yCount > 0 ? `${scale2.rightPan.yCount}Y ` : ''}
                {scale2.rightPan.constantWeight > 0 ? `${scale2.rightPan.constantWeight}kg` : '0kg'}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-center text-xs text-slate-400">
              <span className="text-center">
                Persamaan Linear Satu Variabel &middot; Cari nilai x agar kedua mangkuk setara
              </span>
            </div>
          )}
        </div>
      )}

      {/* INTERACTIVE INVENTORY TRAY (ROBLOX / SIMULATOR STYLE) */}
      <div className="border border-cyan-500/30 bg-slate-950/80 rounded-2xl p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white">
                INVENTORY OBJEK &amp; BEBAN (Drag &amp; Drop)
              </div>
              <div className="text-[11px] text-slate-400">
                Seret objek langsung ke mangkuk timbangan di atas atau klik tombol cepat Kiri / Kanan!
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            Target: {currentScale.title}
          </span>
        </div>

        {/* Inventory Items Shelf Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {availableItems.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              className="group relative p-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-cyan-400/80 hover:bg-slate-850 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-black text-white">{item.label}</span>
                <span
                  className="w-3 h-3 rounded-full border border-white/40 shadow-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
              </div>

              {/* Visual Object Badge */}
              <div className="my-2 py-2 flex items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-mono font-black text-base shadow-lg transition-transform group-hover:scale-110 bg-gradient-to-br ${item.badgeColor}`}
                >
                  {item.type === 'x' ? (
                    'X'
                  ) : item.type === 'y' ? (
                    'Y'
                  ) : item.type === 'weight_2' ? (
                    '2kg'
                  ) : item.type === 'weight_3' ? (
                    '3kg'
                  ) : item.type === 'weight_4' ? (
                    '4kg'
                  ) : item.type === 'weight_5' ? (
                    '5kg'
                  ) : item.type === 'weight_6' ? (
                    '6kg'
                  ) : item.type === 'weight_10' ? (
                    '10kg'
                  ) : (
                    '1kg'
                  )}
                </div>
              </div>

              {/* Quick Placement Action Buttons (+ Kiri, + Kanan) */}
              <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleAddItemToPan('left', item.type)}
                  className="px-1.5 py-1 text-[10px] font-bold rounded-lg bg-cyan-950/70 hover:bg-cyan-800 text-cyan-200 border border-cyan-800/50 transition active:scale-95"
                  title="Tambah ke Mangkuk Kiri"
                >
                  + Kiri
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItemToPan('right', item.type)}
                  className="px-1.5 py-1 text-[10px] font-bold rounded-lg bg-fuchsia-950/70 hover:bg-fuchsia-800 text-fuchsia-200 border border-fuchsia-800/50 transition active:scale-95"
                  title="Tambah ke Mangkuk Kanan"
                >
                  + Kanan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHECK BALANCE & ANSWER INPUT BAR */}
      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleVerify} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-300 font-mono uppercase">
            Masukkan Nilai:
          </span>

          {/* Guess X */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-cyan-500/50 rounded-xl px-3 py-1.5 focus-within:border-cyan-400">
            <span className="font-mono font-bold text-cyan-400 text-sm">x =</span>
            <input
              type="number"
              step="any"
              value={guessX}
              onChange={(e) => setGuessX(e.target.value)}
              placeholder="0"
              className="w-16 md:w-20 bg-transparent text-white font-mono font-bold text-base focus:outline-none"
            />
            <span className="text-xs text-slate-400">{challenge.unit}</span>
          </div>

          {/* Guess Y if multi-variable */}
          {!isLevel1 && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-fuchsia-500/50 rounded-xl px-3 py-1.5 focus-within:border-fuchsia-400">
              <span className="font-mono font-bold text-fuchsia-400 text-sm">y =</span>
              <input
                type="number"
                step="any"
                value={guessY}
                onChange={(e) => setGuessY(e.target.value)}
                placeholder="0"
                className="w-16 md:w-20 bg-transparent text-white font-mono font-bold text-base focus:outline-none"
              />
              <span className="text-xs text-slate-400">{challenge.unit}</span>
            </div>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            Uji Jawaban
          </button>
        </form>

        <button
          type="button"
          onClick={onOpenExplanation}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 transition-all hover:border-indigo-400/60 shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Pembahasan Aljabar
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-sm flex items-start gap-3 transition-all ${
            feedback.isCorrect
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
              : 'bg-rose-950/90 border-rose-500/80 text-rose-100'
          }`}
        >
          {feedback.isCorrect ? (
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <HelpCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-black text-sm">
              {feedback.isCorrect ? 'PERFECT BALANCE! SOLUSI BENAR!' : 'Belum Seimbang, Coba Periksa Kembali!'}
            </div>
            <p className="mt-0.5 text-xs text-slate-200 leading-relaxed">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR CHECK BALANCE BUTTON */}
      {showCheckModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Pemeriksaan Keseimbangan Digital</h3>
                <p className="text-xs text-slate-400">Verifikasi bobot nilai variabel misteri</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Model Timbangan 1:</span>
                <span className="font-mono font-bold text-cyan-400">{formatEquation(scale1)}</span>
              </div>
              {scale2 && (
                <div className="flex justify-between text-slate-300">
                  <span>Model Timbangan 2:</span>
                  <span className="font-mono font-bold text-fuchsia-400">{formatEquation(scale2)}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1">
                  Berapa berat 1 Kotak X?
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2">
                  <span className="text-cyan-400 font-mono font-bold">x =</span>
                  <input
                    type="number"
                    step="any"
                    value={guessX}
                    onChange={(e) => setGuessX(e.target.value)}
                    placeholder="Masukkan angka..."
                    className="w-full bg-transparent text-white font-mono font-bold focus:outline-none text-sm"
                  />
                  <span className="text-xs text-slate-400">{challenge.unit}</span>
                </div>
              </div>

              {!isLevel1 && (
                <div>
                  <label className="text-xs font-bold text-fuchsia-300 block mb-1">
                    Berapa berat 1 Kotak Y?
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-fuchsia-500/40 rounded-xl px-3 py-2">
                    <span className="text-fuchsia-400 font-mono font-bold">y =</span>
                    <input
                      type="number"
                      step="any"
                      value={guessY}
                      onChange={(e) => setGuessY(e.target.value)}
                      placeholder="Masukkan angka..."
                      className="w-full bg-transparent text-white font-mono font-bold focus:outline-none text-sm"
                    />
                    <span className="text-xs text-slate-400">{challenge.unit}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleVerify();
                  setShowCheckModal(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30"
              >
                Periksa Keseimbangan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
