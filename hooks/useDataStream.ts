"use client";
import { useEffect, useRef } from 'react';
import type { DataPoint } from '../lib/types';

/**
 * useDataStream Hook
 * 
 * Creates a simulated real-time data stream that generates new data points
 * at a fixed interval. Useful for:
 * - Testing real-time chart rendering
 * - Demonstrating streaming data capabilities
 * - Simulating WebSocket or SSE connections
 * - Performance testing under continuous data flow
 * 
 * Performance Characteristics:
 * - Default: 250ms interval (4 points/second)
 * - Low overhead: Uses single setInterval
 * - Automatic cleanup on unmount
 * - Stable callback reference using useRef
 * 
 * @param onPoint - Callback invoked with each new data point
 * @param interval - Optional: Time between points in milliseconds (default: 250)
 * 
 * @example
 * ```tsx
 * useDataStream((point) => {
 *   console.log('New point:', point);
 *   setData(prev => [...prev, point]);
 * }, 100); // Generate point every 100ms
 * ```
 * 
 * @see DataProvider for production-grade data streaming implementation
 */
export default function useDataStream(
  onPoint: (p: DataPoint) => void,
  interval: number = 250
): void {
  /**
   * Callback Reference
   * 
   * Store callback in ref to avoid recreating interval on every callback change.
   * This is the "latest ref" pattern:
   * - Effect runs once (empty deps)
   * - Always calls latest callback version
   * - No need to restart interval when callback changes
   * 
   * Without this:
   * - Effect would need [onPoint] in deps
   * - Interval would restart on every parent re-render
   * - Performance degradation
   */
  const cb = useRef(onPoint);
  cb.current = onPoint;

  /**
   * Interval Reference
   * Store interval ID for cleanup
   */
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    /**
     * Point ID Counter
     * Increments for each generated point to ensure uniqueness.
     * In production, use UUIDs or server-generated IDs.
     */
    let id = 0;

    /**
     * Data Generation Interval
     * 
     * Generates simulated data points with:
     * - Unique incrementing ID
     * - Current timestamp for x coordinate
     * - Random y value (0-100)
     * - Timestamp for sorting/filtering
     * 
     * Note: Math.random() is used for simplicity.
     * For realistic simulation, use:
     * - Random walk: y = prevY + (Math.random() - 0.5) * step
     * - Sine wave: y = 50 + 30 * Math.sin(t * frequency)
     * - Perlin noise for smooth curves
     */
    intervalRef.current = setInterval((): void => {
      id++;
      const timestamp = Date.now();
      
      cb.current({
        id,
        x: timestamp,
        y: Math.random() * 100, // Random value 0-100
        timestamp,
        value: Math.random() * 100, // Duplicate for compatibility
        series: `stream-${id % 3}` // Rotate through 3 series
      });
    }, interval);

    /**
     * Cleanup Function
     * 
     * Critical for preventing memory leaks:
     * - Clears interval when component unmounts
     * - Prevents callbacks on unmounted components
     * - Stops unnecessary data generation
     * 
     * Without cleanup:
     * - Interval continues after unmount
     * - Memory leak (timer + closure)
     * - Possible "setState on unmounted component" errors
     */
    return (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    
    /**
     * Dependency Array
     * 
     * [interval] - Re-create interval if rate changes
     * 
     * Not included:
     * - onPoint: Handled via ref pattern
     * - id: Local variable, doesn't need to be in deps
     */
  }, [interval]);
}
