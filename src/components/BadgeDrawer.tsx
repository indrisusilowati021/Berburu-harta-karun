/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GAME_BADGES } from '../data/challenges';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';

interface BadgeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedBadgeIds: string[];
}

export const BadgeDrawer: React.FC<BadgeDrawerProps> = ({
  isOpen,
  onClose,
  unlockedBadgeIds,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Koleksi Lencana Penghargaan</h3>
            <p className="text-xs text-slate-400">
              {unlockedBadgeIds.length} dari {GAME_BADGES.length} lencana telah terbuka
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {GAME_BADGES.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-amber-500/40 text-slate-100'
                    : 'bg-slate-950/30 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isUnlocked
                      ? `bg-gradient-to-tr ${badge.color} text-slate-950 font-bold`
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  {isUnlocked ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                      {badge.title}
                    </h4>
                    {isUnlocked && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded font-semibold">
                        DIRAIH
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{badge.description}</p>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Syarat: {badge.requirement}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
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
