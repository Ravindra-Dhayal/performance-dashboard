"use client";
import React, { useRef, useCallback } from 'react';
import { useDataContext } from '../providers/DataProvider';
import { useChartRenderer } from '../../hooks/useChartRenderer';

export default function Heatmap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { points } = useDataContext();
  const pointsRef = useRef(points);
  pointsRef.current = points;

  const renderer = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, pts: any[]) => {
    clearRectSafe(ctx);
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const sample = pts ? pts.slice(-200) : [];
    const len = sample.length;
    if (len === 0) return;
    
    // Smaller grid for 60fps
    const cellsX = 20;
    const cellsY = 8;
    const cellWidth = width / cellsX;
    const cellHeight = height / cellsY;
    
    // Use array instead of Map for better performance
    const grid = new Uint8Array(cellsX * cellsY);
    
    for (let i = 0; i < len; i++) {
      const p = sample[i];
      if (!p) continue;
      
      const cellX = Math.floor((i / len) * cellsX);
      const cellY = Math.floor((1 - (p.y / 200)) * cellsY);
      const idx = cellY * cellsX + cellX;
      if (idx >= 0 && idx < grid.length) {
        grid[idx] = Math.min(255, grid[idx] + 1);
      }
    }
    
    // Find max for normalization
    let maxCount = 1;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] > maxCount) maxCount = grid[i];
    }
    
    // Pre-defined colors
    const colors = ['#1e3a8a', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];
    
    // Render only non-empty cells
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === 0) continue;
      
      const cellX = i % cellsX;
      const cellY = Math.floor(i / cellsX);
      const intensity = grid[i] / maxCount;
      const colorIdx = Math.min(5, Math.floor(intensity * 6));
      
      ctx.fillStyle = colors[colorIdx];
      ctx.globalAlpha = 0.5 + (intensity * 0.5);
      ctx.fillRect(cellX * cellWidth, cellY * cellHeight, cellWidth - 1, cellHeight - 1);
    }
    ctx.globalAlpha = 1.0;
  }, []);

  useChartRenderer(canvasRef, { pointsRef, renderer });

  return <canvas ref={canvasRef} style={{ width: '100%', height: 200, display: 'block' }} />;
}

function clearRectSafe(ctx: CanvasRenderingContext2D) {
  try {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } catch (e) {
    // noop
  }
}
