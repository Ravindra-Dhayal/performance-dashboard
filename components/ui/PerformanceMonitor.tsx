"use client";
import React, { useCallback, useEffect, useState } from 'react';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';
import { useDataContext } from '../providers/DataProvider';

function emitEvent(name: string, detail: any) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export default function PerformanceMonitor() {
  const { fps } = usePerformanceMonitor();
  const { points } = useDataContext();
  const [memory, setMemory] = useState<number | null>(null);
  const [stress, setStress] = useState(false);

  useEffect(() => {
    if (typeof (performance as any).memory !== 'undefined') {
      const mem = (performance as any).memory;
      setMemory(mem.usedJSHeapSize || mem.totalJSHeapSize || null);
    }
    const t = setInterval(() => {
      if (typeof (performance as any).memory !== 'undefined') {
        const mem = (performance as any).memory;
        setMemory(mem.usedJSHeapSize || mem.totalJSHeapSize || null);
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const increaseLoad = useCallback(() => emitEvent('dataControl', { action: 'increaseLoad', count: 5000 }), []);
  const startStress = useCallback(() => {
    emitEvent('dataControl', { action: 'stressStart', intervalMs: 100 });
    setStress(true);
  }, []);
  const stopStress = useCallback(() => {
    emitEvent('dataControl', { action: 'stressStop' });
    setStress(false);
  }, []);
  const setRate = useCallback((ms: number) => emitEvent('dataControl', { action: 'setRate', intervalMs: ms }), []);

  const getFpsColor = (fps: number): string => {
    if (fps >= 55) return '#10b981';
    if (fps >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const fpsColor = getFpsColor(fps);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ 
          margin: 0, 
          color: '#e2e8f0', 
          fontSize: '18px', 
          fontWeight: '600' 
        }}>
          Performance
        </h4>
        <span 
          className={`status-indicator ${stress ? 'inactive' : 'active'}`}
          data-tooltip={stress ? 'Stress test active' : 'Normal operation'}
        ></span>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
        <div style={{ 
          background: `${fpsColor}15`,
          border: `1px solid ${fpsColor}40`,
          borderRadius: '12px',
          padding: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="shimmer" style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            opacity: 0.5
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              fontSize: '11px', 
              color: '#94a3b8',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Frame Rate
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: fpsColor,
              lineHeight: 1,
              fontFeatureSettings: '"tnum"'
            }} className="counter">
              {fps}
              <span style={{ fontSize: '16px', marginLeft: '4px', fontWeight: '500' }}>FPS</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '12px'
          }}>
            <div style={{ 
              fontSize: '10px', 
              color: '#94a3b8',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Points
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#3b82f6',
              lineHeight: 1
            }} className="counter">
              {points.length.toLocaleString()}
            </div>
          </div>

          <div style={{ 
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '12px'
          }}>
            <div style={{ 
              fontSize: '10px', 
              color: '#94a3b8',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Memory
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#8b5cf6',
              lineHeight: 1
            }} className="counter">
              {memory ? `${Math.round(memory / 1024 / 1024)}` : 'N/A'}
              <span style={{ fontSize: '12px', marginLeft: '2px', fontWeight: '500' }}>MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '8px',
        marginTop: '16px'
      }}>
        <button 
          onClick={increaseLoad}
          className="tooltip"
          data-tooltip="Add 5000 points"
          style={{ 
            padding: '10px 12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}
        >
          + 5k Points
        </button>
        
        <button 
          onClick={() => setRate(100)}
          className="tooltip"
          data-tooltip="Normal speed"
          style={{ 
            padding: '10px 12px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '8px',
            color: '#60a5fa',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          100ms
        </button>
        
        <button 
          onClick={() => setRate(500)}
          className="tooltip"
          data-tooltip="Slow speed"
          style={{ 
            padding: '10px 12px',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '8px',
            color: '#a78bfa',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          500ms
        </button>

        {!stress ? (
          <button 
            onClick={startStress}
            className="tooltip"
            data-tooltip="Start stress test"
            style={{ 
              padding: '10px 12px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
          >
            🔥 Stress
          </button>
        ) : (
          <button 
            onClick={stopStress}
            className="tooltip pulse"
            data-tooltip="Stop stress test"
            style={{ 
              padding: '10px 12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
            }}
          >
            ✓ Stop
          </button>
        )}
      </div>
    </div>
  );
}
