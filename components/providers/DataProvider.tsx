"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { DataPoint } from '../../lib/types';

interface DataContextType {
  points: DataPoint[];
  append: (p: DataPoint) => void;
  loadFromAPI: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

interface DataProviderProps {
  children: React.ReactNode;
}

export default function DataProvider({ children }: DataProviderProps) {
  // visible points (filtered/aggregated) exposed to consumers 
  const [points, setPoints] = useState<DataPoint[]>([]);
  // raw data buffer (ref to avoid re-rendering on every append)
  const rawRef = useRef<DataPoint[]>([]);
  const [isLoadingAPI, setIsLoadingAPI] = useState<boolean>(false);

  // control state (updated from TimeRangeSelector events)
  interface ControlsState {
    range: string;
    aggregation: string;
    zoom: number;
    offset: number;
    live: boolean;
    filters: { series: string; min: number; max: number };
  }
  
  const controlsRef = useRef<ControlsState>({
    range: 'all',  // Changed from '1m' to 'all' to show all data
    aggregation: 'raw',
    zoom: 1,
    offset: 0,
    live: true,
    filters: { series: 'all', min: 0, max: 100 },
  });

  // RAF update handle to throttle visible updates to render frames
  const rafRef = useRef<number | null>(null);
  const streamTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled: boolean = false;
    // Helper: compute visible points based on controls and rawRef
    // This function is async because aggregation may be offloaded to a Web Worker.
    let worker: Worker | null = null;
    const pending = new Map<number, (res: DataPoint[]) => void>();
    let nextReqId: number = 1;

    function computeVisibleSync(): DataPoint[] {
      const raw = rawRef.current;
      if (!raw.length) return [];
      
      const now = Date.now();
      let windowMs = 60 * 1000;
      const range = controlsRef.current.range;
      if (range === '1m') windowMs = 60 * 1000;
      else if (range === '5m') windowMs = 5 * 60 * 1000;
      else if (range === '15m') windowMs = 15 * 60 * 1000;
      else if (range === '1h') windowMs = 60 * 60 * 1000;
      else windowMs = Infinity;
      
      const offsetMs = (controlsRef.current.offset || 0) * 1000;
      const endTs = now - offsetMs;
      const startTs = isFinite(windowMs) ? endTs - windowMs : -Infinity;
      
      let i = raw.length - 1;
      while (i >= 0 && raw[i].timestamp! > endTs) i--;
      const endIdx = i;
      while (i >= 0 && raw[i].timestamp! >= startTs) i--;
      const startIdx = i + 1;
      let slice = raw.slice(startIdx, endIdx + 1);
      
      // Apply filters
      const f = controlsRef.current.filters;
      if (f) {
        if (f.series && f.series !== 'all') {
          slice = slice.filter((p) => p.series === f.series);
        }
        const minV = typeof f.min === 'number' ? f.min : -Infinity;
        const maxV = typeof f.max === 'number' ? f.max : Infinity;
        slice = slice.filter((p) => (p.y ?? p.value ?? 0) >= minV && (p.y ?? p.value ?? 0) <= maxV);
      }
      
      return slice;
    }

    async function computeVisible(): Promise<DataPoint[]> {
      const raw = rawRef.current;
      if (!raw.length) return [] as DataPoint[];

      const now = Date.now();
      let windowMs = 60 * 1000; // default 1m
      const range = controlsRef.current.range;
      if (range === '1m') windowMs = 60 * 1000;
      else if (range === '5m') windowMs = 5 * 60 * 1000;
      else if (range === '15m') windowMs = 15 * 60 * 1000;
      else if (range === '1h') windowMs = 60 * 60 * 1000;
      else windowMs = Infinity; // all

      const offsetMs = (controlsRef.current.offset || 0) * 1000;
      const endTs = now - offsetMs;
      const startTs = isFinite(windowMs) ? endTs - windowMs : -Infinity;

      // Find indices using reverse scan (optimized for append-heavy streams)
      let i = raw.length - 1;
      while (i >= 0 && raw[i].timestamp! > endTs) i--;
      const endIdx = i;
      while (i >= 0 && raw[i].timestamp! >= startTs) i--;
      const startIdx = i + 1;
      let slice = raw.slice(startIdx, endIdx + 1);

      // Apply filters if present
      const f = controlsRef.current.filters;
      if (f) {
        if (f.series && f.series !== 'all') {
          slice = slice.filter((p) => p.series === f.series);
        }
        const minV = typeof f.min === 'number' ? f.min : -Infinity;
        const maxV = typeof f.max === 'number' ? f.max : Infinity;
        slice = slice.filter((p) => (p.y ?? p.value ?? 0) >= minV && (p.y ?? p.value ?? 0) <= maxV);
      }

      // Aggregation - skip for raw mode or small datasets
      const agg = controlsRef.current.aggregation;
      if (agg === 'raw' || slice.length <= 10000) return slice;

      // If worker is available, send aggregation request
      if (worker) {
        const reqId = nextReqId++;
        worker.postMessage({ action: 'aggregate', id: reqId, slice, agg });
        return await new Promise<DataPoint[]>((resolve) => {
          pending.set(reqId, resolve);
        });
      }

      // Fallback: do aggregation on main thread
      let bucketMs = 60 * 1000;
      if (agg === '1min') bucketMs = 60 * 1000;
      else if (agg === '5min') bucketMs = 5 * 60 * 1000;
      else if (agg === '1hour') bucketMs = 60 * 60 * 1000;

      const buckets: Record<number, { sum: number; count: number; ts: number }> = {};
      for (const p of slice) {
        const b = Math.floor(p.timestamp! / bucketMs) * bucketMs;
        if (!buckets[b]) buckets[b] = { sum: 0, count: 0, ts: b };
        buckets[b].sum += p.y;
        buckets[b].count += 1;
      }

      const out: DataPoint[] = Object.keys(buckets)
        .map((k) => {
          const bb = buckets[Number(k)];
          return { id: bb.ts, x: bb.ts, y: bb.sum / bb.count, timestamp: bb.ts } as DataPoint;
        })
        .sort((a, b) => a.timestamp! - b.timestamp!);

      return out;
    }

    const scheduleRender = (): void => {
      if (rafRef.current) return; // already scheduled
      rafRef.current = requestAnimationFrame(async (): Promise<void> => {
        rafRef.current = null;
        const visible: DataPoint[] = await computeVisible();
        if (!cancelled) setPoints(visible);
      });
    };
    
    const scheduleUpdate = scheduleRender; // Alias for consistency
    
    // Function to load data from API route (SSR/API integration) - defined inside effect
    const loadFromAPIInternal = async (): Promise<void> => {
      try {
        const response = await fetch('/api/data?count=10000&series=3');
        const result = await response.json();
        if (result.ok && Array.isArray(result.data) && !cancelled) {
          rawRef.current = result.data;
          scheduleUpdate();
        }
      } catch (error: unknown) {
        console.error('Failed to load data from API:', error);
      }
    };

    // Generate initial data with 3 series and proper timestamps
    // Spread data over last 50 seconds (within the default 1m window)
    const now = Date.now();
    const initialData: DataPoint[] = [];
    const seriesNames = ['s0', 's1', 's2'];
    const pointsPerSeries = 3333; // ~10k total points
    const timeSpreadMs = 50000; // 50 seconds in the past
    
    for (let s = 0; s < 3; s++) {
      let y = 50 + Math.random() * 20; // Start around 50-70
      for (let i = 0; i < pointsPerSeries; i++) {
        const timestamp = now - timeSpreadMs + (i / pointsPerSeries) * timeSpreadMs;
        y += (Math.random() - 0.5) * 5; // Random walk
        y = Math.max(0, Math.min(100, y)); // Clamp to 0-100
        initialData.push({
          id: s * pointsPerSeries + i,
          x: timestamp,
          y,
          value: y,
          series: seriesNames[s],
          timestamp,
        });
      }
    }
    
    rawRef.current = initialData;
    
    // Set initial points immediately using sync computation
    setPoints(computeVisibleSync());

    // simulated realtime stream parameters
    let intervalMs = 100;
    function startStream(ms: number) {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      intervalMs = ms;
      streamTimerRef.current = window.setInterval(() => {
        // append to rawRef and trim - generate points for all 3 series
        const seriesNames = ['s0', 's1', 's2'];
        const timestamp = Date.now();
        
        for (let s = 0; s < 3; s++) {
          const id = rawRef.current.length ? rawRef.current[rawRef.current.length - 1].id + 1 : s;
          const y = Math.random() * 100;
          const p: DataPoint = { 
            id, 
            x: timestamp, 
            y, 
            value: y,
            series: seriesNames[s],
            timestamp 
          };
          rawRef.current.push(p);
        }
        
        // Keep array from growing forever
        if (rawRef.current.length > 20000) {
          rawRef.current.splice(0, rawRef.current.length - 20000);
        }
        
        // Not updating React state here - doing it in the throttled timer below
        // Found that updating 10 times per second was killing performance
      }, intervalMs) as unknown as number;
    }

    startStream(100);

    // Throttle React state updates to fix the FPS drop issue
    // Only update UI once every 2 seconds to reduce re-render overhead
    // Data still accumulates every 100ms in background
    let lastUpdateTime = 0;
    const updateThrottleInterval = 2000; // Increased from 1000ms to 2000ms
    
    const throttledUpdateTimer = setInterval(() => {
      const now = performance.now();
      if (now - lastUpdateTime >= updateThrottleInterval) {
        lastUpdateTime = now;
        setPoints(computeVisibleSync());
      }
    }, updateThrottleInterval);

    // Try to setup the worker for aggregation
    try {
      // This bundler syntax was tricky to figure out
      // Only works in browser, not on server
      if (typeof window !== 'undefined' && 'Worker' in window) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        worker = new Worker(new URL('../../workers/aggregator.worker.ts', import.meta.url), { type: 'module' });
        worker.addEventListener('message', (ev) => {
          const data = ev.data || {};
          const id = data.id;
          const result = data.result || [];
          const resolve = pending.get(id);
          if (resolve) {
            pending.delete(id);
            resolve(result);
          }
        });
      }
    } catch (e) {
      // ignore worker initialization errors
      worker = null;
    }

    // Listen for control events
    function onTimeRange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      controlsRef.current = { ...controlsRef.current, ...detail };
      // Immediately compute and update for filter changes - synchronous for speed
      setPoints(computeVisibleSync());
    }

    function onStreamControl(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      const live = detail.live;
      const target = detail.targetIntervalMs ?? (live ? 100 : 1000);
      // restart stream with new interval
      if (live) startStream(target);
      else {
        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }
      }
      controlsRef.current.live = !!live;
    }

    function onDataControl(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      const action = detail.action;
      if (action === 'increaseLoad') {
        const add = detail.count || 5000;
        const base = rawRef.current.length ? rawRef.current[rawRef.current.length - 1].id + 1 : 0;
        const now = Date.now();
        const seriesNames = ['s0', 's1', 's2'];
        const batch: DataPoint[] = [];
        
        for (let i = 0; i < add; i++) {
          const seriesIdx = i % 3; // Distribute evenly across series
          batch.push({ 
            id: base + i, 
            x: now + i, 
            y: Math.random() * 100, 
            value: Math.random() * 100,
            series: seriesNames[seriesIdx],
            timestamp: now + i 
          });
        }
        
        rawRef.current = rawRef.current.concat(batch);
        if (rawRef.current.length > 200000) rawRef.current.splice(0, rawRef.current.length - 200000);
        setPoints(computeVisibleSync());
      }
      if (action === 'stressStart') {
        // Moderate stress test - 100ms interval (same as normal) but more points per tick
        if (streamTimerRef.current) clearInterval(streamTimerRef.current);
        streamTimerRef.current = window.setInterval(() => {
          const seriesNames = ['s0', 's1', 's2'];
          const timestamp = Date.now();
          const batch: DataPoint[] = [];
          
          // Generate 9 points per tick (3 per series) - 3x normal rate
          for (let i = 0; i < 9; i++) {
            const seriesIdx = i % 3;
            const id = rawRef.current.length + batch.length;
            const y = Math.random() * 100;
            batch.push({ 
              id, 
              x: timestamp + i, 
              y, 
              value: y,
              series: seriesNames[seriesIdx],
              timestamp: timestamp + i
            });
          }
          
          rawRef.current = rawRef.current.concat(batch);
          if (rawRef.current.length > 200000) rawRef.current.splice(0, rawRef.current.length - 200000);
          setPoints(computeVisibleSync());
        }, detail.intervalMs || 100) as unknown as number; // Slower, more visible updates
      }
      if (action === 'stressStop') {
        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }
        // restart normal stream if live
        if (controlsRef.current.live) startStream(100);
      }
      if (action === 'setRate') {
        const ms = detail.intervalMs || 200;
        if (controlsRef.current.live) startStream(ms);
      }
    }

    window.addEventListener('timeRangeChange', onTimeRange as EventListener);
    window.addEventListener('streamControl', onStreamControl as EventListener);
    window.addEventListener('dataControl', onDataControl as EventListener);

    return () => {
      cancelled = true;
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      if (throttledUpdateTimer) clearInterval(throttledUpdateTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        if (worker) {
          worker.terminate();
          worker = null;
        }
      } catch (e) {
        // ignore
      }
      window.removeEventListener('timeRangeChange', onTimeRange as EventListener);
      window.removeEventListener('streamControl', onStreamControl as EventListener);
      window.removeEventListener('dataControl', onDataControl as EventListener);
    };
  }, []);

  const append = (p: DataPoint): void => {
    rawRef.current.push(p);
    if (rawRef.current.length > 20000) rawRef.current.splice(0, rawRef.current.length - 20000);
    // schedule a render on next frame
    if (!rafRef.current) rafRef.current = requestAnimationFrame((): void => {
      rafRef.current = null;
      // simple visible recompute: include new point if in window
      setPoints((prev: DataPoint[]): DataPoint[] => {
        // lightweight append for raw mode
        if (controlsRef.current.aggregation === 'raw') return [...prev, p].slice(-20000);
        // otherwise trigger full recompute (will be scheduled via effect listeners)
        return prev;
      });
    });
  };

  // Exposed API loading function
  const loadFromAPI = async (): Promise<void> => {
    if (isLoadingAPI) return;
    setIsLoadingAPI(true);
    try {
      const response = await fetch('/api/data?count=10000&series=3');
      const result = await response.json();
      if (result.ok && Array.isArray(result.data)) {
        rawRef.current = result.data;
        // Trigger a render update
        setPoints(rawRef.current.slice(-20000));
      }
    } catch (error: unknown) {
      console.error('Failed to load data from API:', error);
    } finally {
      setIsLoadingAPI(false);
    }
  };

  return <DataContext.Provider value={{ points, append, loadFromAPI }}>{children}</DataContext.Provider>;
}

export function useDataContext(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataContext must be used inside DataProvider');
  return ctx;
}
