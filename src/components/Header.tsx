/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameLevelId, PlayerStats } from '../types/game';
import {
  Compass,
  Award,
  BarChart3,
  Volume2,
  VolumeX,
  Star,
  Coins,
  ShieldCheck,
  HelpCircle,
  PenTool,
  Map,
  Lock,
  Unlock,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentLevelId: GameLevelId;
  onSelectLevel: (lvl: GameLevelId) => void;
  stats: PlayerStats;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenBadges: () => void;
  onOpenEvaluation: () => void;
  onOpenGuide: () => void;
  onOpenScratchpad: () => void;
  onOpenMap: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevelId,
  onSelectLevel,
  stats,
  isSoundEnabled,
  onToggleSound,
  onOpenBadges,
  onOpenEvaluation,
  onOpenGuide,
  onOpenScratchpad,
  onOpenMap,
}) => {
  const missions: { id: GameLevelId; label: string; zone: string; icon: string }[] = [
    { id: 1, label: 'Misi 1', zone: 'Hutan Angka', icon: '🌲' },
    { id: 2, label: 'Misi 2', zone: 'Gua Persamaan', icon: '💎' },
    { id: 3, label: 'Misi 3', zone: 'Desa Penjelajah', icon: '⛺' },
    { id: 4, label: 'Misi 4', zone: 'Kuil Matematika', icon: '🏛️' },
    { id: 5, label: 'Misi 5', zone: 'Treasure Cave', icon: '👑' },
  ];

  const totalStars = Object.values(stats.starsByLevel).reduce((a, b) => a + b, 0);

  return (
    <header className="w-full bg-slate-900/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-3 md:px-5 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Title and Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-cyan-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400 font-bold text-lg">
                🏝️
              </div>
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                <span>TREASURE ISLAND</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/30">
                  SPLDV 3D
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                The Hidden Equation &middot; Petualangan Matematika SMA
              </div>
            </div>
          </div>

          {/* Quick Stats Mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono font-bold text-yellow-400">
              <Coins className="w-3.5 h-3.5" />
              <span>{stats.coins}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono font-bold text-cyan-400">
              <span>{stats.sealsUnlocked.length}/5 Segel</span>
            </div>
          </div>
        </div>

        {/* 5 Missions Quick-Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {missions.map((m) => {
            const isActive = currentLevelId === m.id;
            const isCompleted = typeof m.id === 'number' && stats.completedLevels.includes(m.id);
            const isSealUnlocked = typeof m.id === 'number' && stats.sealsUnlocked.includes(m.id);

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectLevel(m.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-white shadow-md shadow-amber-500/30 font-black'
                    : isCompleted
                    ? 'bg-slate-950/80 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
                <span className="hidden lg:inline text-[10px] opacity-75">({m.zone})</span>
                {isSealUnlocked && (
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Action Tools: Coins, XP, Scratchpad, Badges, Evaluation, Sound */}
        <div className="hidden md:flex items-center gap-2">
          {/* Gold Coins & XP */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-yellow-400" title="Koin Emas">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span>{stats.coins}</span>
            </div>
            <span className="text-slate-700 text-xs">|</span>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-300" title="Segel Terbuka">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{stats.sealsUnlocked.length}/5 Segel</span>
            </div>
            <span className="text-slate-700 text-xs">|</span>
            <div className="text-xs font-mono font-bold text-cyan-400" title="Skor Penjelajah">
              {stats.score} XP
            </div>
          </div>

          {/* Digital Scratchpad Button */}
          <button
            type="button"
            onClick={onOpenScratchpad}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-teal-300 rounded-xl border border-teal-500/30 transition text-xs font-semibold"
            title="Buka Papan Coret Aljabar"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Coret</span>
          </button>

          {/* Map Button */}
          <button
            type="button"
            onClick={onOpenMap}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-400 rounded-xl border border-slate-800 transition"
            title="Peta Pulau Treasure Island"
          >
            <Map className="w-4 h-4" />
          </button>

          {/* Badges Button */}
          <button
            type="button"
            onClick={onOpenBadges}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded-xl border border-slate-800 transition"
            title="Koleksi Lencana Penjelajah"
          >
            <Award className="w-4 h-4" />
          </button>

          {/* Evaluation & Certificate Button */}
          <button
            type="button"
            onClick={onOpenEvaluation}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-indigo-400 rounded-xl border border-slate-800 transition"
            title="Rapor Evaluasi & Sertifikat Resmi"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Guide Button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
            title="Buku Panduan Materi SPLDV"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
            title={isSoundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
