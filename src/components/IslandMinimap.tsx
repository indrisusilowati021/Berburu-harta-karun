/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IslandZoneId } from '../types/game';
import { ISLAND_ZONES } from '../data/challenges';
import { sound } from '../utils/audio';
import {
  Compass,
  MapPin,
  X,
  Maximize2,
  Lock,
  Unlock,
  Navigation,
} from 'lucide-react';

interface IslandMinimapProps {
  playerPos: { x: number; z: number; angle: number };
  currentZone: IslandZoneId;
  sealsUnlocked: number[];
  onTeleportToZone?: (zoneId: IslandZoneId) => void;
}

export const IslandMinimap: React.FC<IslandMinimapProps> = ({
  playerPos,
  currentZone,
  sealsUnlocked,
  onTeleportToZone,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Map coordinate range: x [-55, 55], z [-65, 55]
  const mapMinX = -55;
  const mapMaxX = 55;
  const mapMinZ = -65;
  const mapMaxZ = 55;

  const mapToPercent = (x: number, z: number) => {
    const px = ((x - mapMinX) / (mapMaxX - mapMinX)) * 100;
    const pz = ((z - mapMinZ) / (mapMaxZ - mapMinZ)) * 100;
    return { left: `${Math.max(5, Math.min(95, px))}%`, top: `${Math.max(5, Math.min(95, pz))}%` };
  };

  const currentZoneData = ISLAND_ZONES.find((z) => z.id === currentZone) || ISLAND_ZONES[0];

  return (
    <>
      {/* Compact Top-Right Corner HUD Radar Minimap */}
      <div className="flex flex-col items-end gap-1.5 select-none">
        <div
          onClick={() => {
            sound.playClick();
            setIsExpanded(true);
          }}
          className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-slate-950/90 border-2 border-slate-700 hover:border-cyan-400 p-2 shadow-2xl cursor-pointer group transition overflow-hidden"
          title="Klik untuk membuka Peta Petualangan Penuh"
        >
          {/* Compass Rose Ring */}
          <div className="absolute inset-1 rounded-xl border border-slate-800 pointer-events-none flex items-center justify-center">
            {/* North Indicator */}
            <span className="absolute top-1 text-[10px] font-mono font-bold text-rose-400">U</span>
            <span className="absolute bottom-1 text-[10px] font-mono font-bold text-slate-500">S</span>
            <span className="absolute left-1 text-[10px] font-mono font-bold text-slate-500">B</span>
            <span className="absolute right-1 text-[10px] font-mono font-bold text-slate-500">T</span>
          </div>

          {/* Island Shape Contour Silhouette */}
          <div className="absolute inset-3 rounded-full bg-emerald-950/40 border border-emerald-500/20 pointer-events-none" />

          {/* Zones points */}
          {ISLAND_ZONES.map((zone) => {
            const pos = mapToPercent(zone.coordinates.x, zone.coordinates.z);
            const isUnlocked = !zone.sealNumber || sealsUnlocked.includes(zone.sealNumber);

            return (
              <div
                key={zone.id}
                style={{ left: pos.left, top: pos.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm transition"
                  style={{ backgroundColor: zone.color }}
                />
              </div>
            );
          })}

          {/* Player Cursor Indicator */}
          {(() => {
            const pos = mapToPercent(playerPos.x, playerPos.z);
            return (
              <div
                style={{
                  left: pos.left,
                  top: pos.top,
                  transform: `translate(-50%, -50%) rotate(${playerPos.angle}rad)`,
                }}
                className="absolute pointer-events-none transition-all duration-75"
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[9px] border-b-cyan-400 filter drop-shadow-[0_0_3px_#22d3ee]" />
              </div>
            );
          })()}

          {/* Expand icon pill */}
          <div className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-slate-900/90 text-slate-400 group-hover:text-cyan-300 transition">
            <Maximize2 className="w-3 h-3" />
          </div>
        </div>

        {/* Current Location Badge */}
        <div className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-mono font-semibold flex items-center gap-1.5 shadow-md">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: currentZoneData.color }}
          />
          <span className="text-white">{currentZoneData.name}</span>
        </div>
      </div>

      {/* Expanded Island Adventure Map Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/30 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  🗺️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Peta Treasure Island: The Hidden Equation
                  </h3>
                  <p className="text-xs text-slate-400">
                    6 Lokasi Utama Ekspedisi SPLDV & Posisi Penjelajah
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsExpanded(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Map Canvas */}
            <div className="p-4 bg-slate-950 flex flex-col items-center">
              <div className="relative w-full max-w-lg aspect-square rounded-2xl bg-slate-900/90 border-2 border-slate-800 p-4 overflow-hidden shadow-inner">
                {/* Ocean & Island Coastline art */}
                <div className="absolute inset-4 rounded-3xl bg-emerald-950/50 border-2 border-emerald-500/30 shadow-2xl">
                  {/* Beach Sandy Border */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-amber-300/20 pointer-events-none" />

                  {/* Compass directions */}
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 font-mono font-bold text-xs text-rose-400">
                    ▲ UTARA
                  </span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono font-bold text-xs text-slate-500">
                    ▼ SELATAN
                  </span>
                </div>

                {/* 6 Zones Landmarks */}
                {ISLAND_ZONES.map((zone) => {
                  const pos = mapToPercent(zone.coordinates.x, zone.coordinates.z);
                  const isUnlocked = !zone.sealNumber || sealsUnlocked.includes(zone.sealNumber);
                  const isCurrent = currentZone === zone.id;

                  return (
                    <div
                      key={zone.id}
                      style={{ left: pos.left, top: pos.top }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                      onClick={() => {
                        if (onTeleportToZone) {
                          sound.playClick();
                          onTeleportToZone(zone.id);
                          setIsExpanded(false);
                        }
                      }}
                    >
                      <div
                        className={`p-2 rounded-xl border-2 transition shadow-lg ${
                          isCurrent
                            ? 'scale-125 border-cyan-400 shadow-cyan-500/50'
                            : 'border-slate-700 hover:scale-110'
                        }`}
                        style={{ backgroundColor: `${zone.color}33` }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: zone.color }} />
                      </div>
                      <span className="mt-1 text-[10px] font-mono font-bold text-white bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800 text-center whitespace-nowrap shadow">
                        {zone.name}
                        {zone.sealNumber && (
                          <span className="ml-1 text-yellow-400">
                            {isUnlocked ? '✓' : `[Segel ${zone.sealNumber}]`}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}

                {/* Player Live Marker */}
                {(() => {
                  const pos = mapToPercent(playerPos.x, playerPos.z);
                  return (
                    <div
                      style={{
                        left: pos.left,
                        top: pos.top,
                        transform: `translate(-50%, -50%) rotate(${playerPos.angle}rad)`,
                      }}
                      className="absolute pointer-events-none transition-all duration-75"
                    >
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-cyan-400 filter drop-shadow-[0_0_6px_#22d3ee]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white absolute -top-1 left-1/2 -translate-x-1/2 shadow" />
                    </div>
                  );
                })()}
              </div>

              {/* Legend & Instructions */}
              <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {ISLAND_ZONES.map((z) => (
                  <div
                    key={z.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: z.color }} />
                    <div className="truncate">
                      <div className="font-semibold text-white truncate text-[11px]">{z.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{z.tagline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
