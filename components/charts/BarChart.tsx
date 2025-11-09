"use client";
import React, { useRef, useCallback } from 'react';
import { useDataContext } from '../providers/DataProvider';
import { useChartRenderer } from '../../hooks/useChartRenderer';

export default function BarChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { points } = useDataContext();
  const pointsRef = useRef(points);
  pointsRef.current = points;

  const renderer = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, pts: any[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!pts || pts.length === 0) return;
    
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Optimized: 300 bars with batch rendering for 60fps
    const maxBars = Math.min(300, pts.length);
    const start = pts.length - maxBars;
    const barWidth = width / maxBars;
    const yScale = height / 100;
    
    // Use Path2D for better performance with many bars
    const path = new Path2D();
    
    for (let i = 0; i < maxBars; i++) {
      const p = pts[start + i];
      if (!p) continue;
      const value = p.y || p.value || 0;
      if (value <= 0) continue;
      const barH = value * yScale;
      const x = i * barWidth;
      path.rect(x, height - barH, barWidth - 1, barH);
    }
    
    // Single fill operation for all bars
    ctx.fillStyle = '#3b82f6';
    ctx.fill(path);
  }, []);

  useChartRenderer(canvasRef, { pointsRef, renderer });

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
