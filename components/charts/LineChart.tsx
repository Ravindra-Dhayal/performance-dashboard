"use client";
import React, { useRef } from 'react';
import { useDataContext } from '../providers/DataProvider';
import { useChartRenderer } from '../../hooks/useChartRenderer';

export default function LineChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { points } = useDataContext();
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useChartRenderer(canvasRef, { pointsRef });

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
