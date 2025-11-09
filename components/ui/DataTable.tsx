"use client";
import { useState } from 'react';
import { useDataContext } from '../providers/DataProvider';
import { useVirtualWindow } from '../../hooks/useVirtualization';
import type { DataPoint } from '../../lib/types';

interface DataTableProps {
  height?: number;
  itemHeight?: number;
}

export default function DataTable({ height = 300, itemHeight = 32 }: DataTableProps) {
  const { points } = useDataContext();
  const [scrollTop, setScrollTop] = useState(0);
  const { start, end } = useVirtualWindow(points.length, itemHeight, height, scrollTop);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const visibleItems: DataPoint[] = points.slice(start, end);
  const totalHeight: number = points.length * itemHeight;
  const offsetY: number = start * itemHeight;

  const getSeriesBadgeColor = (series: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      's0': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
      's1': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
      's2': { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6' },
    };
    return colors[series] || { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8' };
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h4 style={{ 
            margin: '0 0 4px 0', 
            color: '#e2e8f0', 
            fontSize: '18px', 
            fontWeight: '600' 
          }}>
            Virtual Scrolling Data Table
          </h4>
          <p style={{ 
            margin: 0, 
            color: '#64748b', 
            fontSize: '13px' 
          }}>
            Efficiently rendering {points.length.toLocaleString()} points
          </p>
        </div>
        <div className="badge" style={{ 
          background: 'rgba(59, 130, 246, 0.15)', 
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '6px 12px',
          fontSize: '12px'
        }}>
          Virtual Scrolling
        </div>
      </div>

      <div
        onScroll={handleScroll}
        style={{
          height,
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '12px',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ 
                position: 'sticky', 
                top: 0, 
                background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
                color: '#cbd5e1',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                zIndex: 10
              }}>
                <tr>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#94a3b8'
                  }}>ID</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#94a3b8'
                  }}>Series</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'right',
                    fontWeight: '600',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#94a3b8'
                  }}>Value</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'right',
                    fontWeight: '600',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#94a3b8'
                  }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((point: DataPoint, idx: number) => {
                  const seriesColors = getSeriesBadgeColor(point.series || '');
                  return (
                    <tr
                      key={point.id}
                      style={{
                        background: idx % 2 === 0 
                          ? 'rgba(30, 41, 59, 0.3)' 
                          : 'rgba(45, 55, 72, 0.3)',
                        color: '#cbd5e1',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = idx % 2 === 0 
                          ? 'rgba(30, 41, 59, 0.3)' 
                          : 'rgba(45, 55, 72, 0.3)';
                      }}
                    >
                      <td style={{ 
                        padding: '10px 16px',
                        color: '#64748b',
                        fontWeight: '500',
                        fontFeatureSettings: '"tnum"'
                      }}>
                        #{point.id}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: seriesColors.bg,
                          color: seriesColors.text,
                          border: `1px solid ${seriesColors.text}40`
                        }}>
                          {point.series || 'N/A'}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '10px 16px', 
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#e2e8f0',
                        fontFeatureSettings: '"tnum"'
                      }}>
                        {(point.value ?? point.y)?.toFixed(2) ?? 'N/A'}
                      </td>
                      <td style={{ 
                        padding: '10px 16px', 
                        textAlign: 'right',
                        color: '#94a3b8',
                        fontSize: '12px',
                        fontFeatureSettings: '"tnum"'
                      }}>
                        {point.timestamp ? new Date(point.timestamp).toLocaleTimeString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '8px'
      }}>
        <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
          📊 Showing <span style={{ color: '#60a5fa', fontWeight: '600' }}>
            {start + 1}-{Math.min(end, points.length)}
          </span> of <span style={{ color: '#60a5fa', fontWeight: '600' }}>
            {points.length.toLocaleString()}
          </span> points
        </div>
        <div style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>
          Virtual rendering: {visibleItems.length} DOM nodes
        </div>
      </div>
    </div>
  );
}
