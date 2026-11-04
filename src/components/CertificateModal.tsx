/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Printer, X, ShieldCheck, Sparkles } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateName: (name: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateName,
}) => {
  const [name, setName] = useState<string>(stats.playerName || 'Penjelajah Muda SMA');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateName(name);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl p-6 relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="print:hidden absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Card Printable Area */}
        <div className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-4 border-amber-500/70 shadow-2xl relative overflow-hidden text-center">
          {/* Subtle ornate background accents */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Logo / Crest */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 mb-3 text-3xl">
            👑
          </div>

          <div className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold mb-1">
            TREASURE ISLAND &middot; THE HIDDEN EQUATION &middot; TINGKAT SMA
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
            Sertifikat Prestasi Penjelajah Matematika SPLDV
          </h1>

          <p className="text-xs text-slate-300 max-w-lg mx-auto mb-6 leading-relaxed">
            Diberikan sebagai pengakuan resmi atas keberhasilan memecahkan Lima Segel Rahasia di Treasure Island, menguasai konsep Sistem Persamaan Linear Dua Variabel (SPLDV), metode eliminasi, substitusi, grafik, serta menemukan Harta Karun Aljabar Utama.
          </p>

          {/* Recipient Name */}
          <div className="my-6">
            <div className="text-xs text-slate-400 mb-1">Dianugerahkan dengan bangga kepada:</div>
            {isEditing ? (
              <form onSubmit={handleSaveName} className="inline-flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-1 bg-slate-900 border border-amber-500 text-amber-300 font-bold text-xl rounded-lg focus:outline-none text-center"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Simpan
                </button>
              </form>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="cursor-pointer group inline-flex items-center gap-2"
                title="Klik untuk ubah nama"
              >
                <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 underline decoration-amber-500/30 decoration-dashed underline-offset-8">
                  {name}
                </span>
                <span className="print:hidden text-[10px] text-slate-500 group-hover:text-amber-400 transition">
                  (Ubah Nama)
                </span>
              </div>
            )}
          </div>

          {/* Achievement Details */}
          <div className="grid grid-cols-4 gap-2.5 max-w-lg mx-auto my-6 bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Skor Akhir</div>
              <div className="text-base font-bold text-cyan-400 font-mono">{stats.score} XP</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">5 Segel</div>
              <div className="text-base font-bold text-yellow-400 font-mono">
                {stats.sealsUnlocked.length}/5 TERBUKA
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Koin Emas</div>
              <div className="text-base font-bold text-amber-400 font-mono">{stats.coins} KOIN</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Gelar</div>
              <div className="text-xs font-black text-emerald-400 font-mono uppercase mt-1">MASTER EXPLORER</div>
            </div>
          </div>

          {/* Signatures & Verification Stamp */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800/80 text-left text-xs">
            <div>
              <div className="text-slate-400 font-medium">Tanggal Penerbitan:</div>
              <div className="text-slate-200 font-semibold">{currentDate}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                ID: TI-SPLDV-{Date.now().toString(36).toUpperCase()}
              </div>
            </div>

            <div className="flex items-center gap-2 text-amber-400 bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider">Terverifikasi Ekspedisi</div>
                <div className="text-[9px] text-amber-300">Treasure Island Academic Seal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="print:hidden flex items-center justify-between mt-5 pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Dapat dicetak langsung atau disimpan sebagai dokumen PDF prestasi.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              Kembali ke Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
