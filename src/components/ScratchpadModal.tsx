/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Download,
  X,
  Palette,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState<string>('#ffffff');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = isEraser ? '#0f172a' : color;
    ctx.lineWidth = isEraser ? brushSize * 4 : brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    sound.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const colors = ['#ffffff', '#38bdf8', '#4ade80', '#facc15', '#f43f5e', '#c084fc'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              ✏️
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Papan Tulis Digital Aljabar
              </h2>
              <p className="text-xs text-slate-400">
                Coret-coret rumus, eliminasi koefisien, atau uji substitusi secara bebas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setIsEraser(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                !isEraser ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Pensil</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsEraser(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                isEraser ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Penghapus</span>
            </button>
          </div>

          {/* Palette Colors */}
          {!isEraser && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 mr-1">Warna:</span>
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    sound.playClick();
                    setColor(c);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    color === c ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}

          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Ukuran:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 bg-rose-500/10 border border-rose-500/30 transition font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hapus Semua</span>
          </button>
        </div>

        {/* Canvas Body */}
        <div className="flex-1 bg-slate-950 p-2 relative h-[380px] md:h-[450px]">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full rounded-xl bg-slate-900/60 border border-slate-800 touch-none cursor-crosshair shadow-inner"
          />
          <div className="absolute bottom-4 right-4 pointer-events-none text-[11px] font-mono text-slate-500">
            Papan Coret Matematika SPLDV
          </div>
        </div>
      </div>
    </div>
  );
};
