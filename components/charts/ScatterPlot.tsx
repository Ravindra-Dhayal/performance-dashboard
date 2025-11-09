"use client";
import React, { useRef, useCallback } from 'react';
import { useDataContext } from '../providers/DataProvider';
import { useChartRenderer } from '../../hooks/useChartRenderer';

export default function ScatterPlot() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { points } = useDataContext();
  const pointsRef = useRef(points);
  pointsRef.current = points;

  const renderer = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, pts: any[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!pts || pts.length === 0) return;
    
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const maxPoints = 500; // Doubled from 250
    const start = Math.max(0, pts.length - maxPoints);
    const len = pts.length - start;
    
    const yScale = height / 200;
    const xScale = width / maxPoints;
    
    // Use Path2D for batch rendering
    const path = new Path2D();
    
    for (let i = 0; i < len; i++) {
      const p = pts[start + i];
      if (!p) continue;
      const x = i * xScale;
      const y = height - (p.y * yScale);
      path.moveTo(x + 2, y);
      path.arc(x, y, 2, 0, 6.283185307179586);
    }
    
    // Single fill operation for all points
    ctx.fillStyle = '#60a5fa';
    ctx.fill(path);
  }, []);

  useChartRenderer(canvasRef, { pointsRef, renderer });

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
