"use client";
import { useState, useCallback } from 'react';

type TimeRange = 'all' | '1m' | '5m' | '15m' | '1h';

interface TimeRangeDetail {
  range: TimeRange;
  live: boolean;
}

interface StreamControlDetail {
  action: 'start' | 'stop';
}

function emitEvent<T>(name: string, detail: T): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export default function TimeRangeSelector() {
  const [range, setRange] = useState<TimeRange>('all');
  const [live, setLive] = useState<boolean>(true);

  const handleRangeChange = useCallback((newRange: TimeRange): void => {
    setRange(newRange);
    emitEvent<TimeRangeDetail>('timeRangeChange', { range: newRange, live });
  }, [live]);

  const handleLiveToggle = useCallback((): void => {
    const newLive: boolean = !live;
    setLive(newLive);
    emitEvent<StreamControlDetail>('streamControl', { action: newLive ? 'start' : 'stop' });
  }, [live]);

  const timeRanges: readonly TimeRange[] = ['all', '1m', '5m', '15m', '1h'] as const;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ 
          margin: 0, 
          color: '#e2e8f0', 
          fontSize: '18px', 
          fontWeight: '600' 
        }}>
          Time Range
        </h4>
        <span 
          className={`status-indicator ${live ? 'active' : 'inactive'}`}
          data-tooltip={live ? 'Live streaming' : 'Paused'}
        ></span>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {timeRanges.map((r) => (
          <button
            key={r}
            onClick={() => handleRangeChange(r as TimeRange)}
            className="tooltip"
            data-tooltip={r === 'all' ? 'Show all data' : `Last ${r}`}
            style={{
              padding: '8px 16px',
              background: range === r 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'rgba(59, 130, 246, 0.1)',
              color: range === r ? 'white' : '#60a5fa',
              border: range === r ? 'none' : '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: range === r ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              if (range !== r) {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (range !== r) {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              }
            }}
          >
            {r === 'all' ? '∞ All' : r.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{
        padding: '12px 16px',
        background: live 
          ? 'rgba(16, 185, 129, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        border: `1px solid ${live ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        borderRadius: '10px',
        transition: 'all 0.3s ease'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          color: '#cbd5e1', 
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <div style={{
            position: 'relative',
            width: '48px',
            height: '24px',
            background: live ? '#10b981' : '#4b5563',
            borderRadius: '12px',
            transition: 'background 0.3s ease',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            <input
              type="checkbox"
              checked={live}
              onChange={handleLiveToggle}
              style={{ 
                opacity: 0,
                width: 0,
                height: 0,
                position: 'absolute'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '2px',
              left: live ? '26px' : '2px',
              width: '20px',
              height: '20px',
              background: 'white',
              borderRadius: '50%',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}></div>
          </div>
          <div>
            <div style={{ 
              fontWeight: '600',
              fontSize: '14px',
              color: live ? '#10b981' : '#ef4444'
            }}>
              {live ? '● Live Updates' : '○ Paused'}
            </div>
            <div style={{ 
              fontSize: '11px',
              color: '#64748b',
              marginTop: '2px'
            }}>
              {live ? 'Streaming new data' : 'Updates stopped'}
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
