"use client";
import { useCallback, useEffect, useState } from 'react';

type SeriesValue = 'all' | 's0' | 's1' | 's2';

interface FilterDetail {
  filters: {
    series: SeriesValue;
    min: number;
    max: number;
  };
}

function emitEvent<T>(name: string, detail: T): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export default function FilterPanel() {
  const [series, setSeries] = useState<SeriesValue>('all');
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(100);

  // emit filter changes (debounced minimal) — reuse timeRangeChange to update provider controls
  useEffect((): (() => void) => {
    const t: NodeJS.Timeout = setTimeout((): void => {
      emitEvent<FilterDetail>('timeRangeChange', { filters: { series, min, max } });
    }, 80);
    return (): void => clearTimeout(t);
  }, [series, min, max]);

  const onSeriesChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSeries(e.target.value as SeriesValue);
  }, []);
  
  const onMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setMin(Number(e.target.value) || 0);
  }, []);
  
  const onMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setMax(Number(e.target.value) || 100);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ 
          margin: 0, 
          color: '#e2e8f0', 
          fontSize: '18px', 
          fontWeight: '600' 
        }}>
          Filters
        </h3>
        <span className="status-indicator active" data-tooltip="Live filtering"></span>
      </div>
      
      <div style={{ marginTop: 16 }}>
        <label style={{ 
          display: 'block', 
          color: '#94a3b8', 
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '8px',
          letterSpacing: '0.3px'
        }}>
          Series
        </label>
        <select 
          value={series} 
          onChange={onSeriesChange}
          style={{ 
            width: '100%', 
            padding: '10px 12px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '8px',
            color: '#e2e8f0',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="all">All Series</option>
          <option value="s0">Series 0</option>
          <option value="s1">Series 1</option>
          <option value="s2">Series 2</option>
        </select>
        <div style={{ 
          marginTop: '6px', 
          fontSize: '11px', 
          color: '#64748b',
          fontStyle: 'italic'
        }}>
          Current: {series === 'all' ? 'All Series' : `Series ${series.slice(1)}`}
        </div>
      </div>
      
      <div style={{ marginTop: 20 }}>
        <label style={{ 
          display: 'block', 
          color: '#94a3b8', 
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '8px',
          letterSpacing: '0.3px'
        }}>
          Value Range
        </label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="number" 
              min={0} 
              max={1000} 
              value={min} 
              onChange={onMinChange}
              placeholder="Min"
              style={{ 
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>—</span>
          <div style={{ flex: 1 }}>
            <input 
              type="number" 
              min={0} 
              max={1000} 
              value={max} 
              onChange={onMaxChange}
              placeholder="Max"
              style={{ 
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>
        <div style={{ 
          marginTop: '8px',
          padding: '8px 12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#93c5fd'
        }}>
          📊 Filtering: {min} - {max}
        </div>
      </div>
    </div>
  );
}
