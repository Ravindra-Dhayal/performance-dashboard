import { DataPoint } from './types';

// Generate N points with simple random walk per series
export function generateData(count: number, seriesCount = 1): DataPoint[] {
  const out: DataPoint[] = [];
  for (let s = 0; s < seriesCount; s++) {
    let y = Math.random() * 100;
    for (let i = 0; i < count; i++) {
      y += (Math.random() - 0.5) * 2;
      out.push({ id: s * count + i, x: i, y, series: `s${s}`, timestamp: Date.now() });
    }
  }
  return out;
}

export function generateRealtimePoint(id: number): DataPoint {
  return { id, x: Date.now(), y: Math.random() * 100, timestamp: Date.now() };
}
