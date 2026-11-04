/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryItemDefinition } from '../types/game';

export const INVENTORY_ITEMS: InventoryItemDefinition[] = [
  {
    type: 'x',
    label: 'Kotak X',
    weight: 0,
    isVariable: true,
    varName: 'x',
    shape: 'box_x',
    color: '#06b6d4',
    badgeColor: 'from-cyan-500 to-blue-600 shadow-cyan-500/50',
    description: 'Kotak misteri biru elektrik bersimbol X dengan aura neon',
  },
  {
    type: 'y',
    label: 'Kotak Y',
    weight: 0,
    isVariable: true,
    varName: 'y',
    shape: 'box_y',
    color: '#d946ef',
    badgeColor: 'from-fuchsia-500 to-purple-600 shadow-fuchsia-500/50',
    description: 'Kotak misteri ungu/pink cerah bersimbol Y dengan aura neon',
  },
  {
    type: 'weight_2',
    label: 'Balok Emas (2 kg)',
    weight: 2,
    shape: 'gold_bar',
    color: '#fbbf24',
    badgeColor: 'from-amber-400 to-yellow-600 shadow-amber-500/50',
    description: 'Batangan emas murni berkilau dengan cap 2 kg',
  },
  {
    type: 'weight_3',
    label: 'Bintang Kuning (3 kg)',
    weight: 3,
    shape: 'yellow_star',
    color: '#facc15',
    badgeColor: 'from-yellow-300 to-amber-500 shadow-yellow-400/50',
    description: 'Bintang emas kosmik berbobot tepat 3 kg',
  },
  {
    type: 'weight_4',
    label: 'Kristal Hijau (4 kg)',
    weight: 4,
    shape: 'green_crystal',
    color: '#10b981',
    badgeColor: 'from-emerald-400 to-teal-600 shadow-emerald-500/50',
    description: 'Kristal zamrud berbidang multifaset berbobot 4 kg',
  },
  {
    type: 'weight_5',
    label: 'Bola Merah (5 kg)',
    weight: 5,
    shape: 'red_sphere',
    color: '#ef4444',
    badgeColor: 'from-rose-500 to-red-600 shadow-red-500/50',
    description: 'Bola delima mengilap dengan finishing glossy 5 kg',
  },
  {
    type: 'weight_6',
    label: 'Berlian Biru (6 kg)',
    weight: 6,
    shape: 'blue_diamond',
    color: '#38bdf8',
    badgeColor: 'from-sky-400 to-blue-600 shadow-sky-500/50',
    description: 'Permata berlian safir bercahaya 6 kg',
  },
  {
    type: 'weight_1',
    label: 'Koin Perak (1 kg)',
    weight: 1,
    shape: 'silver_coin',
    color: '#94a3b8',
    badgeColor: 'from-slate-300 to-slate-500 shadow-slate-400/50',
    description: 'Piringan logam presisi 1 kg',
  },
  {
    type: 'weight_10',
    label: 'Baterai Neon (10 kg)',
    weight: 10,
    shape: 'neon_battery',
    color: '#8b5cf6',
    badgeColor: 'from-violet-500 to-indigo-600 shadow-violet-500/50',
    description: 'Reaktor energi super padat 10 kg',
  },
];
