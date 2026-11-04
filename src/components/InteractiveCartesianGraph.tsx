/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraphEquationProblem } from '../types/game';
import { sound } from '../utils/audio';
import { Crosshair, CheckCircle2, RefreshCw, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';

interface InteractiveCartesianGraphProps {
  problem: GraphEquationProblem;
  onSelectIntersection: (x: number, y: number) => void;
  selectedPoint: { x: number; y: number } | null;
  isSolved: boolean;
}

export const InteractiveCartesianGraph: React.FC<InteractiveCartesianGraphProps> = ({
  problem,
  onSelectIntersection,
  selectedPoint,
  isSolved,
}) => {
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Coordinate ranges: default from -2 to 12
  const minX = -1;
  const maxX = 11;
  const minY = -1;
  const maxY = 11;

  const svgWidth = 440;
  const svgHeight = 400;
  const padding = 36;

  const plotWidth = svgWidth - padding * 2;
  const plotHeight = svgHeight - padding * 2;

  // Coordinate conversion
  const toSvgX = (x: number) => padding + ((x - minX) / (maxX - minX)) * plotWidth;
  const toSvgY = (y: number) => padding + ((maxY - y) / (maxY - minY)) * plotHeight;

  const toMathX = (svgX: number) => {
    const raw = minX + ((svgX - padding) / plotWidth) * (maxX - minX);
    return Math.round(raw);
  };
  const toMathY = (svgY: number) => {
    const raw = maxY - ((svgY - padding) / plotHeight) * (maxY - minY);
    return Math.round(raw);
  };

  // Compute Line 1 endpoints (y = (c - a*x)/b)
  const getLinePoints = (a: number, b: number, c: number) => {
    if (Math.abs(b) > 0.0001) {
      const x1 = minX;
      const y1 = (c - a * x1) / b;
      const x2 = maxX;
      const y2 = (c - a * x2) / b;
      return { x1: toSvgX(x1), y1: toSvgY(y1), x2: toSvgX(x2), y2: toSvgY(y2) };
    } else {
      // vertical line x = c/a
      const x = c / a;
      return { x1: toSvgX(x), y1: toSvgY(minY), x2: toSvgX(x), y2: toSvgY(maxY) };
    }
  };

  const line1Points = getLinePoints(problem.eq1.a, problem.eq1.b, problem.eq1.c);
  const line2Points = getLinePoints(problem.eq2.a, problem.eq2.b, problem.eq2.c);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;

    const mathX = toMathX(svgX);
    const mathY = toMathY(svgY);

    if (mathX >= minX && mathX <= maxX && mathY >= minY && mathY <= maxY) {
      sound.playClick();
      onSelectIntersection(mathX, mathY);
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;

    const mathX = toMathX(svgX);
    const mathY = toMathY(svgY);

    if (mathX >= minX && mathX <= maxX && mathY >= minY && mathY <= maxY) {
      setHoverCoord({ x: mathX, y: mathY });
    } else {
      setHoverCoord(null);
    }
  };

  // Generate grid ticks
  const xTicks = [];
  for (let x = Math.ceil(minX); x <= Math.floor(maxX); x++) {
    xTicks.push(x);
  }

  const yTicks = [];
  for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
    yTicks.push(y);
  }

  const isSelectedCorrect =
    selectedPoint &&
    selectedPoint.x === problem.intersectX &&
    selectedPoint.y === problem.intersectY;

  return (
    <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-4 shadow-xl flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-bold text-teal-200">Altar Koordinat Kartesius 2D</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            {problem.eq1.slopeIntercept}
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            {problem.eq2.slopeIntercept}
          </span>
        </div>
      </div>

      {/* SVG Canvas Interactive Coordinate Plane */}
      <div className="relative border border-slate-700 rounded-xl overflow-hidden bg-slate-950 shadow-inner select-none">
        <svg
          width={svgWidth}
          height={svgHeight}
          onClick={handleSvgClick}
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={() => setHoverCoord(null)}
          className="cursor-crosshair block"
        >
          <defs>
            <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <filter id="glow-teal">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background */}
          <rect width={svgWidth} height={svgHeight} fill="url(#grid-grad)" />

          {/* Grid lines */}
          {xTicks.map((x) => (
            <line
              key={`x-${x}`}
              x1={toSvgX(x)}
              y1={padding}
              x2={toSvgX(x)}
              y2={svgHeight - padding}
              stroke={x === 0 ? '#64748b' : '#1e293b'}
              strokeWidth={x === 0 ? 1.8 : 0.8}
              strokeDasharray={x === 0 ? 'none' : '2 2'}
            />
          ))}

          {yTicks.map((y) => (
            <line
              key={`y-${y}`}
              x1={padding}
              y1={toSvgY(y)}
              x2={svgWidth - padding}
              y2={toSvgY(y)}
              stroke={y === 0 ? '#64748b' : '#1e293b'}
              strokeWidth={y === 0 ? 1.8 : 0.8}
              strokeDasharray={y === 0 ? 'none' : '2 2'}
            />
          ))}

          {/* X and Y Axis Numerics */}
          {xTicks.map(
            (x) =>
              x !== 0 && (
                <text
                  key={`tx-${x}`}
                  x={toSvgX(x)}
                  y={toSvgY(0) + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                  className="font-mono font-medium pointer-events-none"
                >
                  {x}
                </text>
              )
          )}

          {yTicks.map(
            (y) =>
              y !== 0 && (
                <text
                  key={`ty-${y}`}
                  x={toSvgX(0) - 8}
                  y={toSvgY(y) + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  className="font-mono font-medium pointer-events-none"
                >
                  {y}
                </text>
              )
          )}

          {/* Origin '0' */}
          <text
            x={toSvgX(0) - 8}
            y={toSvgY(0) + 14}
            textAnchor="end"
            fontSize="10"
            fill="#64748b"
            className="font-mono pointer-events-none"
          >
            0
          </text>

          {/* Axis Labels */}
          <text
            x={svgWidth - padding + 16}
            y={toSvgY(0) + 4}
            fontSize="12"
            fill="#38bdf8"
            className="font-mono font-bold pointer-events-none"
          >
            X
          </text>
          <text
            x={toSvgX(0) - 4}
            y={padding - 10}
            fontSize="12"
            fill="#38bdf8"
            className="font-mono font-bold pointer-events-none"
          >
            Y
          </text>

          {/* Line 1 (Sky Blue) */}
          <line
            x1={line1Points.x1}
            y1={line1Points.y1}
            x2={line1Points.x2}
            y2={line1Points.y2}
            stroke={problem.eq1.color}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Line 2 (Rose/Red) */}
          <line
            x1={line2Points.x1}
            y1={line2Points.y1}
            x2={line2Points.x2}
            y2={line2Points.y2}
            stroke={problem.eq2.color}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Hover indicator crosshair */}
          {hoverCoord && (
            <g className="pointer-events-none">
              <circle
                cx={toSvgX(hoverCoord.x)}
                cy={toSvgY(hoverCoord.y)}
                r="6"
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <line
                x1={toSvgX(hoverCoord.x) - 10}
                y1={toSvgY(hoverCoord.y)}
                x2={toSvgX(hoverCoord.x) + 10}
                y2={toSvgY(hoverCoord.y)}
                stroke="#a855f7"
                strokeWidth="1"
              />
              <line
                x1={toSvgX(hoverCoord.x)}
                y1={toSvgY(hoverCoord.y) - 10}
                x2={toSvgX(hoverCoord.x)}
                y2={toSvgY(hoverCoord.y) + 10}
                stroke="#a855f7"
                strokeWidth="1"
              />
            </g>
          )}

          {/* Selected Point Target */}
          {selectedPoint && (
            <g className="pointer-events-none">
              {/* Pulsing ring */}
              <circle
                cx={toSvgX(selectedPoint.x)}
                cy={toSvgY(selectedPoint.y)}
                r="10"
                fill={isSelectedCorrect ? 'rgba(45, 212, 191, 0.25)' : 'rgba(239, 68, 68, 0.25)'}
                stroke={isSelectedCorrect ? '#2dd4bf' : '#ef4444'}
                strokeWidth="2"
              />
              {/* Inner dot */}
              <circle
                cx={toSvgX(selectedPoint.x)}
                cy={toSvgY(selectedPoint.y)}
                r="4.5"
                fill={isSelectedCorrect ? '#2dd4bf' : '#ef4444'}
              />
              {/* Tooltip text badge */}
              <rect
                x={toSvgX(selectedPoint.x) + 10}
                y={toSvgY(selectedPoint.y) - 24}
                width="64"
                height="20"
                rx="4"
                fill="#0f172a"
                stroke={isSelectedCorrect ? '#2dd4bf' : '#ef4444'}
                strokeWidth="1"
              />
              <text
                x={toSvgX(selectedPoint.x) + 42}
                y={toSvgY(selectedPoint.y) - 10}
                textAnchor="middle"
                fontSize="11"
                fill="#ffffff"
                className="font-mono font-bold"
              >
                ({selectedPoint.x}, {selectedPoint.y})
              </text>
            </g>
          )}

          {/* Solved radiant beacon at true intersection */}
          {isSolved && (
            <g filter="url(#glow-teal)" className="pointer-events-none">
              <circle
                cx={toSvgX(problem.intersectX)}
                cy={toSvgY(problem.intersectY)}
                r="8"
                fill="#2dd4bf"
              />
              <circle
                cx={toSvgX(problem.intersectX)}
                cy={toSvgY(problem.intersectY)}
                r="16"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Hover Coordinate Floating Pill */}
        {hoverCoord && (
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-300 pointer-events-none">
            Uji Titik: <span className="text-teal-300 font-bold">({hoverCoord.x}, {hoverCoord.y})</span>
          </div>
        )}
      </div>

      {/* Interactive Helper Controls */}
      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400">
        <p className="text-slate-300">
          💡 Klik tepat pada <strong>titik perpotongan</strong> garis biru & merah untuk memasukkan koordinat.
        </p>
        {selectedPoint && (
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            <span>Titik Terpilih:</span>
            <span className={isSelectedCorrect ? 'text-teal-400' : 'text-amber-400'}>
              ({selectedPoint.x}, {selectedPoint.y})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
