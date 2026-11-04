/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, CheckCircle, BarChart3, AlertCircle, X, Star, Coins, ShieldCheck, Clock, Bookmark } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { GAME_BADGES } from '../data/challenges';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onOpenCertificate: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  stats,
  onOpenCertificate,
}) => {
  if (!isOpen) return null;

  const totalStars = Object.values(stats.starsByLevel).reduce((a, b) => a + b, 0);
  const accuracyPct =
    stats.totalAttempts > 0 ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) : 100;

  // Format elapsed time
  const minutes = Math.floor(stats.timeElapsedSeconds / 60);
  const seconds = stats.timeElapsedSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  // Mastery competencies (0 - 100%)
  const conceptMastery = Math.min(100, Math.max(35, Math.round((stats.sealsUnlocked.length / 5) * 100)));
  const modelingMastery = Math.min(100, Math.max(30, Math.round(stats.modelingMasteryScore * 18)));
  const eliminationMastery = Math.min(100, Math.max(25, Math.round(stats.eliminationMasteryScore * 22)));
  const substitutionMastery = Math.min(100, Math.max(25, Math.round(stats.substitutionMasteryScore * 22)));
  const graphMastery = Math.min(100, Math.max(30, Math.round(stats.graphMasteryScore * 25)));
  const contextualMastery = Math.min(100, Math.max(30, Math.round(stats.contextualMasteryScore * 20)));

  // Recommendations generator based on scores
  const recommendations: { topic: string; tip: string; priority: 'Tinggi' | 'Sedang' | 'Baik' }[] = [];

  if (graphMastery < 75) {
    recommendations.push({
      topic: 'Metode Grafik & Penentuan Titik Potong',
      tip: 'Pelajarilah cara mencari titik potong sumbu X (saat y=0) dan sumbu Y (saat x=0) agar lebih cepat menggambar garis lurus di bidang Kartesius.',
      priority: 'Tinggi',
    });
  }
  if (eliminationMastery < 70) {
    recommendations.push({
      topic: 'Metode Eliminasi & Perkalian Koefisien',
      tip: 'Gunakan prinsip KPK (Kelipatan Persekutuan Terkecil) untuk mengalikan persamaan sebelum mengurangkan atau menjumlahkan kedua persamaan.',
      priority: 'Sedang',
    });
  }
  if (substitutionMastery < 70) {
    recommendations.push({
      topic: 'Metode Substitusi & Sifat Distributif',
      tip: 'Saat mengganti suatu variabel dengan ekspresi lain, selalu gunakan tanda kurung seperti 2(y + 2) agar perkalian distributif aljabar akurat.',
      priority: 'Sedang',
    });
  }
  if (modelingMastery < 75) {
    recommendations.push({
      topic: 'Pemodelan Soal Cerita ke Bentuk Aljabar',
      tip: 'Definisikan variabel x dan y secara eksplisit (misal x = harga 1 botol air, y = harga 1 makanan) sebelum menyusun persamaan matematis.',
      priority: 'Sedang',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      topic: 'Pengayaan Aljabar Lanjut (SPLTV & Matriks)',
      tip: 'Penguasaan konsep SPLDV Anda sudah sangat istimewa! Anda siap melangkah ke materi Sistem Persamaan Tiga Variabel (SPLTV) dan Aturan Cramer.',
      priority: 'Baik',
    });
  }

  // Badges obtained
  const unlockedBadges = GAME_BADGES.filter((b) => stats.badges.includes(b.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl p-5 md:p-8 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 shadow-lg font-black text-xl">
            🏆
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Rapor Evaluasi Pembelajaran Penjelajah
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Treasure Island: The Hidden Equation &middot; Penilaian Kompetensi SPLDV SMA
            </p>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Skor XP</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">{stats.score}</div>
            <div className="text-[10px] text-slate-500">Poin Akumulasi</div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Segel Terbuka</div>
            <div className="text-2xl font-black text-yellow-400 font-mono mt-0.5">
              {stats.sealsUnlocked.length}/5
            </div>
            <div className="text-[10px] text-slate-500">Segel Kuno Pulau</div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Akurasi Jawaban</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{accuracyPct}%</div>
            <div className="text-[10px] text-slate-500">{stats.totalCorrect} benar dari {stats.totalAttempts} coba</div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Koin Emas</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              {stats.coins}
            </div>
            <div className="text-[10px] text-slate-500">Harta Karun Terkumpul</div>
          </div>
        </div>

        {/* 6 Kompetensi Inti Evaluasi SPLDV */}
        <div className="bg-slate-950/70 p-4 md:p-5 rounded-2xl border border-slate-800 mb-6">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Pemetaan Kompetensi Aljabar SPLDV
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Pemahaman Konsep & Himpunan Penyelesaian', score: conceptMastery, color: 'bg-cyan-500' },
              { label: 'Identifikasi Variabel & Pemodelan Matematika', score: modelingMastery, color: 'bg-emerald-500' },
              { label: 'Kecakapan Metode Eliminasi Aljabar', score: eliminationMastery, color: 'bg-purple-500' },
              { label: 'Kecakapan Metode Substitusi Ekspresi', score: substitutionMastery, color: 'bg-blue-500' },
              { label: 'Kecakapan Metode Grafik & Titik Potong Kartesius', score: graphMastery, color: 'bg-teal-500' },
              { label: 'Interpretasi Solusi Masalah Kontekstual', score: contextualMastery, color: 'bg-amber-500' },
            ].map((skill, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-300">{skill.label}</span>
                  <span className="font-mono font-bold text-slate-200">{skill.score}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full ${skill.color} transition-all duration-500`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Earned Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-200 mb-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Lencana Penjelajah yang Diraih ({unlockedBadges.length}/{GAME_BADGES.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GAME_BADGES.map((b) => {
              const isUnlocked = stats.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition ${
                    isUnlocked
                      ? 'bg-slate-950/80 border-slate-700 text-white'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                  }`}
                >
                  <span className="text-xl">{isUnlocked ? '🎖️' : '🔒'}</span>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{b.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{b.requirement}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rekomendasi Belajar Personal */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-200 mb-2.5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Rekomendasi Materi yang Perlu Dipelajari Kembali
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3"
              >
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono mt-0.5 shrink-0 ${
                    rec.priority === 'Tinggi'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : rec.priority === 'Sedang'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {rec.priority}
                </span>
                <div>
                  <div className="text-xs font-bold text-white">{rec.topic}</div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{rec.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onOpenCertificate();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Award className="w-4 h-4" />
            <span>Lihat & Unduh Sertifikat Resmi</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
