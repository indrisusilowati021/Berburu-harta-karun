/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, X, Scale, Zap, Repeat, TrendingUp, CheckCircle2, Bookmark } from 'lucide-react';
import { sound } from '../utils/audio';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'konsep' | 'eliminasi' | 'substitusi' | 'grafik'>('konsep');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl p-5 md:p-8 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Buku Panduan Materi SPLDV SMA
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Konsep, Metode Eliminasi, Substitusi, dan Grafik Koordinat Kartesius
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5 overflow-x-auto">
          {[
            { id: 'konsep', label: '1. Konsep & Pemodelan', icon: '📐' },
            { id: 'eliminasi', label: '2. Metode Eliminasi', icon: '⚡' },
            { id: 'substitusi', label: '3. Metode Substitusi', icon: '🔄' },
            { id: 'grafik', label: '4. Metode Grafik', icon: '📈' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(t.id as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
          {activeTab === 'konsep' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-amber-400 text-sm">
                  A. Definisi & Bentuk Umum SPLDV
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong>Sistem Persamaan Linear Dua Variabel (SPLDV)</strong> adalah kumpulan dua atau lebih persamaan linear yang memuat dua variabel yang sama dan saling terkait. Bentuk umum SPLDV dalam matematika SMA adalah:
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center font-mono font-bold text-white text-sm my-2">
                  ax + by = c <br />
                  dx + ey = f
                </div>
                <p className="text-slate-400 text-xs">
                  Di mana <span className="text-white">x</span> dan <span className="text-white">y</span> adalah variabel, sedangkan <span className="text-white">a, b, d, e</span> adalah koefisien, dan <span className="text-white">c, f</span> adalah konstanta real.
                </p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-cyan-400 text-sm">
                  B. Langkah Pemodelan Masalah Kontekstual
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                  <li><strong>Identifikasi Objek:</strong> Tentukan dua besaran yang belum diketahui nilainya.</li>
                  <li><strong>Tetapkan Variabel:</strong> Misalkan objek pertama sebagai <em>x</em> dan objek kedua sebagai <em>y</em>.</li>
                  <li><strong>Susun Hubungan:</strong> Terjemahkan setiap kalimat petunjuk ke dalam bentuk persamaan aljabar.</li>
                  <li><strong>Pecahkan Sistem:</strong> Gunakan metode aljabar atau grafik untuk mencari nilai himpunan penyelesaian <em>(x, y)</em>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'eliminasi' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Prinsip Metode Eliminasi
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Metode eliminasi bertujuan untuk <strong>menghilangkan (mengeliminasi)</strong> salah satu variabel sehingga persamaan menyisakan satu variabel tunggal yang mudah diselesaikan.
                </p>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-1 font-mono text-xs text-slate-200">
                  <div className="text-emerald-300 font-bold mb-1">Contoh Soal Logistik:</div>
                  <div>(1) 2x + 3y = 39 [x 3] &rarr; 6x + 9y = 117</div>
                  <div>(2) 3x + 2y = 36 [x 2] &rarr; 6x + 4y = 72</div>
                  <div className="border-t border-slate-700 pt-1 text-emerald-400 font-bold">
                    Kurangkan: 5y = 45 &rArr; y = 9
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1">Tips Sukses Eliminasi:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                  <li>Jika tanda koefisien sama (+ dan + atau - dan -), <strong>kurangkan</strong> kedua persamaan.</li>
                  <li>Jika tanda koefisien berlawanan (+ dan -), <strong>jumlahkan</strong> kedua persamaan untuk menghilangkannya.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'substitusi' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-purple-400 text-sm flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-purple-400" />
                  Prinsip Metode Substitusi
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Metode substitusi dilakukan dengan <strong>mengganti (mensubstitusikan)</strong> nilai suatu variabel dengan ekspresi variabel lain dari persamaan sebelumnya.
                </p>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-1 font-mono text-xs text-slate-200">
                  <div className="text-purple-300 font-bold mb-1">Contoh Penerapan:</div>
                  <div>Persamaan 1: x + y = 10 &rarr; x = 10 - y</div>
                  <div>Persamaan 2: 2x + y = 16</div>
                  <div>Substitusi x: 2(10 - y) + y = 16 &rarr; 20 - 2y + y = 16</div>
                  <div className="border-t border-slate-700 pt-1 text-purple-400 font-bold">
                    -y = 16 - 20 &rarr; y = 4 &rArr; x = 10 - 4 = 6
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grafik' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-teal-400 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  Metode Grafik & Titik Potong Dua Garis
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Dalam geometri analitis, setiap persamaan linear dua variabel merepresentasikan sebuah <strong>garis lurus</strong> pada bidang koordinat Kartesius. <strong>Penyelesaian SPLDV adalah titik perpotongan (x, y)</strong> dari kedua garis tersebut!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-teal-500/30 text-center">
                    <span className="text-base font-bold text-teal-300">1 Solusi Tunggal</span>
                    <p className="text-[11px] text-slate-400 mt-1">Kedua garis berpotongan di tepat satu titik (gradien berbeda: m1 &ne; m2).</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
                    <span className="text-base font-bold text-rose-300">0 Solusi (Kosong)</span>
                    <p className="text-[11px] text-slate-400 mt-1">Kedua garis sejajar dan tidak pernah bertemu (m1 = m2, c1 &ne; c2).</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
                    <span className="text-base font-bold text-yellow-300">&infin; Banyak Solusi</span>
                    <p className="text-[11px] text-slate-400 mt-1">Kedua garis berimpit sempurna pada semua titik koordinat.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Kembali ke Petualangan Pulau
          </button>
        </div>
      </div>
    </div>
  );
};
