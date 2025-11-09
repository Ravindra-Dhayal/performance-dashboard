"use client";
import React from 'react';
import DataProvider from '../../components/providers/DataProvider';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import ScatterPlot from '../../components/charts/ScatterPlot';
import Heatmap from '../../components/charts/Heatmap';
import PerformanceMonitor from '../../components/ui/PerformanceMonitor';
import FilterPanel from '../../components/controls/FilterPanel';
import TimeRangeSelector from '../../components/controls/TimeRangeSelector';
import DataTable from '../../components/ui/DataTable';

/**
 * Performance Dashboard Page
 * 
 * Main dashboard displaying real-time performance metrics with 10,000+ data points.
 * Features:
 * - 4 canvas-based charts (Line, Bar, Scatter, Heatmap)
 * - Real-time data streaming at 100ms intervals
 * - Virtual scrolling data table
 * - Performance monitoring (FPS, memory, latency)
 * - Interactive filters and time range controls
 * 
 * Performance Targets:
 * - 60 FPS sustained rendering
 * - <100ms interaction latency
 * - Memory stable at ~100MB
 */
export default function Page() {
  return (
    <ErrorBoundary>
      <DataProvider>
      <div style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #1a1d29 0%, #0f111a 100%)', 
        minHeight: '100vh' 
      }}>
        <div className="fade-in" style={{ marginBottom: '24px' }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '8px',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Performance Dashboard
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '14px',
            margin: 0 
          }}>
            Real-time data visualization with 10,000+ points @ 60 FPS
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card grid-item glass" style={{ 
              background: 'rgba(37, 40, 54, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '24px', 
              borderRadius: '16px', 
              height: '320px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ 
                  color: '#e2e8f0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  margin: 0
                }}>Line Chart</h2>
                <span className="badge" style={{ 
                  background: '#10b98120', 
                  color: '#10b981',
                  border: '1px solid #10b98140'
                }}>800 pts</span>
              </div>
              <div style={{ height: 'calc(100% - 40px)' }}>
                <LineChart />
              </div>
            </div>
            <div className="card grid-item glass" style={{ 
              background: 'rgba(37, 40, 54, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '24px', 
              borderRadius: '16px', 
              height: '320px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ 
                  color: '#e2e8f0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  margin: 0
                }}>Bar Chart</h2>
                <span className="badge" style={{ 
                  background: '#3b82f620', 
                  color: '#3b82f6',
                  border: '1px solid #3b82f640'
                }}>300 bars</span>
              </div>
              <div style={{ height: 'calc(100% - 40px)' }}>
                <BarChart />
              </div>
            </div>
            <div className="card grid-item glass" style={{ 
              background: 'rgba(37, 40, 54, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '24px', 
              borderRadius: '16px', 
              height: '320px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ 
                  color: '#e2e8f0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  margin: 0
                }}>Scatter Plot</h2>
                <span className="badge" style={{ 
                  background: '#8b5cf620', 
                  color: '#a78bfa',
                  border: '1px solid #8b5cf640'
                }}>500 pts</span>
              </div>
              <div style={{ height: 'calc(100% - 40px)' }}>
                <ScatterPlot />
              </div>
            </div>
            <div className="card grid-item glass" style={{ 
              background: 'rgba(37, 40, 54, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '24px', 
              borderRadius: '16px', 
              height: '320px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ 
                  color: '#e2e8f0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  margin: 0
                }}>Heatmap</h2>
                <span className="badge" style={{ 
                  background: '#ec489920', 
                  color: '#f472b6',
                  border: '1px solid #ec489940'
                }}>20x8 grid</span>
              </div>
              <div style={{ height: 'calc(100% - 40px)' }}>
                <Heatmap />
              </div>
            </div>
          </div>
          <aside className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card glass" style={{ 
              background: 'rgba(37, 40, 54, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '24px', 
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <TimeRangeSelector />
            </div>
            <div className="card glass" style={{ 
              background: 'rgba(37, 40, 54, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '24px', 
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <FilterPanel />
            </div>
            <div className="card glass" style={{ 
              background: 'rgba(37, 40, 54, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '24px', 
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <PerformanceMonitor />
            </div>
          </aside>
        </div>
        
        {/* Virtual Scrolling Data Table - demonstrates useVirtualization hook */}
        <div className="card fade-in glass" style={{ 
          background: 'rgba(37, 40, 54, 0.6)',
          backdropFilter: 'blur(10px)',
          padding: '24px', 
          borderRadius: '16px', 
          marginTop: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <DataTable height={400} itemHeight={32} />
        </div>
      </div>
    </DataProvider>
    </ErrorBoundary>
  );
}
