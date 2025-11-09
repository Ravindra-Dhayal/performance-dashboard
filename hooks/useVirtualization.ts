"use client";
import { useMemo } from 'react';

/**
 * Virtual Window Range Interface
 * Defines the slice of items to render in the viewport
 */
interface VirtualWindow {
  /** First index to render (inclusive) */
  start: number;
  /** Last index to render (exclusive) */
  end: number;
}

/**
 * useVirtualWindow Hook
 * 
 * Calculates which items should be rendered in a virtualized scrolling list.
 * Virtual scrolling is a technique to render only visible items instead of
 * rendering thousands of DOM nodes, dramatically improving performance.
 * 
 * Performance Benefits:
 * - Renders only ~10-20 DOM nodes instead of 10,000+
 * - Constant memory usage regardless of data size
 * - Smooth scrolling even with massive datasets
 * - Eliminates "scroll lag" from excessive DOM nodes
 * 
 * How it works:
 * 1. Calculate which item is at the top of scroll (scrollTop / itemHeight)
 * 2. Calculate how many items fit in viewport (containerHeight / itemHeight)
 * 3. Render those items + buffer (2 extra for smooth scrolling)
 * 4. Use absolute positioning to place items correctly
 * 
 * Algorithm Complexity: O(1) - constant time calculation
 * 
 * @param itemCount - Total number of items in the list
 * @param itemHeight - Height of each item in pixels (must be uniform)
 * @param containerHeight - Height of the scrollable container in pixels
 * @param scrollTop - Current scroll position in pixels
 * @returns Object with start and end indices for rendering
 * 
 * @example
 * ```tsx
 * const [scrollTop, setScrollTop] = useState(0);
 * const { start, end } = useVirtualWindow(10000, 32, 400, scrollTop);
 * 
 * const visibleItems = allItems.slice(start, end);
 * // Render only ~12 items instead of 10,000!
 * ```
 * 
 * @see DataTable component for full implementation example
 */
export function useVirtualWindow(
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
): VirtualWindow {
/**
 * Figure out which row is at the top of the visible area
 * Just divide scroll position by row height
 * e.g., scrolled 320px with 32px rows = row 10 is at top
 */
  const start = Math.floor(scrollTop / itemHeight);  /**
   * Calculate Visible Count
   * 
   * How many items fit in the viewport?
   * - containerHeight = 400px, itemHeight = 32px → visible = 12.5
   * - Math.ceil(12.5) = 13 (always round up to ensure full coverage)
   * 
   * Why ceil? If we have 12.5 items visible, we need to render 13
   * to prevent white space at the bottom.
   */
  const visible = Math.ceil(containerHeight / itemHeight);

  /**
   * Calculate End Index
   * 
   * Render visible items + buffer for smooth scrolling.
   * - Buffer of 2 items: 1 above, 1 below viewport
   * - Prevents flashing when scrolling quickly
   * - Minimal overhead (2 extra items vs 10,000)
   * 
   * Clamp to itemCount to avoid rendering non-existent items.
   * 
   * Example:
   * - start = 10, visible = 13, buffer = 2
   * - end = Math.min(10000, 10 + 13 + 2) = 25
   * - Render items 10-24 (15 total)
   */
  const end = Math.min(itemCount, start + visible + 2);

  /**
   * Memoize Result
   * 
   * Only recalculate when start or end changes.
   * - start/end change when user scrolls
   * - If scrolling within same "window", return cached object
   * - Prevents unnecessary re-renders of child components
   * 
   * Performance impact:
   * - Without memo: New object every render → child re-renders
   * - With memo: Same object reference → React skips child re-render
   * 
   * Example:
   * - User scrolls 5px (not enough to change start)
   * - start = 10, end = 25 (same as before)
   * - useMemo returns same object reference
   * - React.memo components skip re-render
   */
  const range = useMemo(
    (): VirtualWindow => ({ 
      start: Math.max(0, start), // Clamp start to 0 (no negative indices)
      end 
    }),
    [start, end]
  );

  return range;
}
