/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScaleState, ItemType } from '../types/game';
import { ThreeBalanceScale } from './ThreeBalanceScale';
import { INVENTORY_ITEMS } from '../data/inventory';
import { FlaskConical, Eye, EyeOff, RotateCcw, Scale, Layers, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

export const FreeSandboxMode: React.FC = () => {
  const [secretX, setSecretX] = useState<number>(5);
  const [secretY, setSecretY] = useState<number>(3);
  const [showValues, setShowValues] = useState<boolean>(true);

  const [scale, setScale] = useState<ScaleState>({
    id: 'sandbox_scale',
    title: 'Laboratorium Bebas Eksperimen SPLDV',
    subtitle: 'Rancang sistem timbangan sendiri dan uji kesetaraannya',
    leftPan: { xCount: 1, yCount: 1, constantWeight: 2, itemsList: ['weight_2'] },
    rightPan: { xCount: 0, yCount: 0, constantWeight: 10, itemsList: ['weight_10'] },
  });

  const handleAddItem = (pan: 'left' | 'right', itemType: ItemType) => {
    sound.playDropItem();
    setScale((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as ScaleState;
      const targetPan = pan === 'left' ? next.leftPan : next.rightPan;
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
      return next;
    });
  };

  const handleReset = () => {
    sound.playClick();
    setScale({
      id: 'sandbox_scale',
      title: 'Laboratorium Bebas Eksperimen SPLDV',
      leftPan: { xCount: 0, yCount: 0, constantWeight: 0, itemsList: [] },
      rightPan: { xCount: 0, yCount: 0, constantWeight: 0, itemsList: [] },
    });
  };

  const totalLeft = scale.leftPan.xCount * secretX + scale.leftPan.yCount * secretY + scale.leftPan.constantWeight;
  const totalRight = scale.rightPan.xCount * secretX + scale.rightPan.yCount * secretY + scale.rightPan.constantWeight;
  const isBalanced = totalLeft === totalRight && (totalLeft > 0 || totalRight > 0);

  const formatPan = (pan: { xCount: number; yCount: number; constantWeight: number }) => {
    const parts: string[] = [];
    if (pan.xCount > 0) parts.push(pan.xCount === 1 ? 'x' : `${pan.xCount}x`);
    if (pan.yCount > 0) parts.push(pan.yCount === 1 ? 'y' : `${pan.yCount}y`);
    if (pan.constantWeight > 0) parts.push(`${pan.constantWeight}kg`);
    return parts.length > 0 ? parts.join(' + ') : '0 kg';
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Parameter Card */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-4 md:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Laboratorium Eksperimen Bebas SPLDV
            </h2>
            <p className="text-xs text-slate-400">
              Uji coba sembarang kombinasi objek, tentukan bobot tersembunyi X dan Y, atau minta temanmu menebak!
            </p>
          </div>
        </div>

        {/* Secret Value Config */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400">Nilai Kotak X:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={secretX}
              onChange={(e) => setSecretX(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 bg-slate-900 border border-slate-700 text-white font-mono text-center text-xs rounded py-1 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-fuchsia-400">Nilai Kotak Y:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={secretY}
              onChange={(e) => setSecretY(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 bg-slate-900 border border-slate-700 text-white font-mono text-center text-xs rounded py-1 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title={showValues ? 'Sembunyikan Nilai untuk Kuis' : 'Tampilkan Nilai'}
          >
            {showValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showValues ? 'Sembunyikan' : 'Buka Kunci'}
          </button>
        </div>
      </div>

      {/* 3D Viewport with Drag and Drop Support */}
      <div className="h-[480px]">
        <ThreeBalanceScale
          scale1={scale}
          secretX={secretX}
          secretY={secretY}
          showValuesRevealed={showValues}
          levelId="sandbox"
          onDropItem={(pan, itemType) => handleAddItem(pan, itemType)}
        />
      </div>

      {/* Live Equation Display */}
      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div className="font-mono text-sm md:text-base font-bold text-slate-200 flex items-center gap-2">
          <span className="text-cyan-400">Sisi Kiri: {formatPan(scale.leftPan)}</span>
          <span className="text-slate-400">{isBalanced ? '=' : totalLeft > totalRight ? '>' : '<'}</span>
          <span className="text-fuchsia-400">Sisi Kanan: {formatPan(scale.rightPan)}</span>
        </div>
        {showValues && (
          <div className="text-xs font-mono text-slate-400">
            Total Berat: {totalLeft} kg vs {totalRight} kg (Selisih: {Math.abs(totalRight - totalLeft)} kg)
          </div>
        )}
      </div>

      {/* Full Inventory Tray in Sandbox */}
      <div className="p-4 bg-slate-900/80 border border-cyan-500/30 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              INVENTORY OBJEK &amp; BEBAN (Drag &amp; Drop ke Timbangan)
            </span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl flex items-center gap-1 border border-slate-700"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            Kosongkan Timbangan
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {INVENTORY_ITEMS.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/balance-item', item.type);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className="p-2.5 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-cyan-400 transition cursor-grab active:cursor-grabbing flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-black text-white">{item.label}</span>
                <span
                  className="w-3 h-3 rounded-full border border-white/40 shadow-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
              </div>

              <div className="my-2 py-2 flex items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-mono font-black text-base shadow-lg bg-gradient-to-br ${item.badgeColor}`}
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

              <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleAddItem('left', item.type)}
                  className="px-1.5 py-1 text-[10px] font-bold rounded-lg bg-cyan-950 hover:bg-cyan-800 text-cyan-200 border border-cyan-800"
                >
                  + Kiri
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('right', item.type)}
                  className="px-1.5 py-1 text-[10px] font-bold rounded-lg bg-fuchsia-950 hover:bg-fuchsia-800 text-fuchsia-200 border border-fuchsia-800"
                >
                  + Kanan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
