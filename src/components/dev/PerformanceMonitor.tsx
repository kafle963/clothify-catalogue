import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentCount: number;
  reRenderCount: number;
  lastUpdate: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showInProduction?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

// Global performance tracking
class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Set<(metrics: Map<string, PerformanceMetrics>) => void> = new Set();

  static getInstance() {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  track(componentName: string, renderTime: number, reRenderCount: number) {
    const existing = this.metrics.get(componentName);
    const metrics: PerformanceMetrics = {
      renderTime,
      memoryUsage: this.getMemoryUsage(),
      componentCount: this.metrics.size + 1,
      reRenderCount,
      lastUpdate: Date.now()
    };

    this.metrics.set(componentName, metrics);
    this.notifyObservers();
  }

  subscribe(callback: (metrics: Map<string, PerformanceMetrics>) => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this.metrics));
  }

  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return undefined;
  }

  getMetrics() {
    return this.metrics;
  }

  clear() {
    this.metrics.clear();
    this.notifyObservers();
  }
}

// Hook for component performance tracking
export function usePerformanceTracking(componentName: string, dependencies: any[] = []) {
  const renderCountRef = useRef(0);
  const renderStartRef = useRef(0);
  const tracker = PerformanceTracker.getInstance();

  useEffect(() => {
    renderCountRef.current += 1;
    const renderTime = performance.now() - renderStartRef.current;
    
    if (renderCountRef.current > 1) { // Skip first render
      tracker.track(componentName, renderTime, renderCountRef.current - 1);
    }
  });

  useEffect(() => {
    renderStartRef.current = performance.now();
  }, dependencies);

  return renderCountRef.current;
}

// Performance monitor component
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showInProduction = false,
  position = 'bottom-right',
  compact = false,
  onMetricsUpdate
}) => {
  const [metrics, setMetrics] = useState<Map<string, PerformanceMetrics>>(new Map());
  const [isVisible, setIsVisible] = useState(false);
  const tracker = PerformanceTracker.getInstance();

  useEffect(() => {
    if (!enabled && !showInProduction) return;

    const unsubscribe = tracker.subscribe((newMetrics) => {
      setMetrics(new Map(newMetrics));
      onMetricsUpdate?.(Array.from(newMetrics.values())[0]); // Pass first metric as example
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, showInProduction, tracker, onMetricsUpdate]);

  if (!enabled && !showInProduction) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const totalComponents = metrics.size;
  const avgRenderTime = Array.from(metrics.values()).reduce((sum, m) => sum + m.renderTime, 0) / totalComponents || 0;
  const totalReRenders = Array.from(metrics.values()).reduce((sum, m) => sum + m.reRenderCount, 0);
  const memoryUsage = Array.from(metrics.values())[0]?.memoryUsage;

  return (
    <div className={cn(
      'fixed z-[9999] font-mono text-xs',
      positionClasses[position]
    )}>
      <div className={cn(
        'bg-black/80 text-white rounded-lg shadow-lg backdrop-blur-sm',
        compact ? 'p-2' : 'p-3'
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn('font-semibold', compact ? 'text-xs' : 'text-sm')}>
            Performance
          </span>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-white/70 hover:text-white"
          >
            {isVisible ? '−' : '+'}
          </button>
        </div>
        
        {!compact && (
          <div className="space-y-1">
            <div>Components: {totalComponents}</div>
            <div>Avg Render: {avgRenderTime.toFixed(2)}ms</div>
            <div>Re-renders: {totalReRenders}</div>
            {memoryUsage && <div>Memory: {memoryUsage.toFixed(1)}MB</div>}
          </div>
        )}

        {compact && (
          <div className="text-xs text-white/80">
            {totalComponents}c | {avgRenderTime.toFixed(1)}ms | {totalReRenders}r
          </div>
        )}

        {isVisible && !compact && (
          <div className="mt-3 max-h-40 overflow-y-auto">
            <div className="text-xs font-semibold mb-1">Components:</div>
            {Array.from(metrics.entries()).map(([name, metric]) => (
              <div key={name} className="text-xs text-white/80 mb-1">
                <div className="truncate">{name}</div>
                <div className="text-white/60">
                  {metric.renderTime.toFixed(1)}ms | {metric.reRenderCount}r
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-2 flex gap-1">
          <button
            onClick={() => tracker.clear()}
            className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

// Higher-order component for automatic performance tracking
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    usePerformanceTracking(name, [props]);
    
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceTracking(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Performance boundary component
export const PerformanceBoundary: React.FC<{
  children: React.ReactNode;
  name: string;
  threshold?: number; // ms
  onSlowRender?: (renderTime: number) => void;
}> = ({ children, name, threshold = 16, onSlowRender }) => {
  const renderTime = usePerformanceTracking(name);
  const lastRenderTimeRef = useRef(0);

  useEffect(() => {
    const currentTime = performance.now();
    const renderDuration = currentTime - lastRenderTimeRef.current;
    
    if (renderDuration > threshold && onSlowRender) {
      onSlowRender(renderDuration);
    }
    
    lastRenderTimeRef.current = currentTime;
  });

  return <>{children}</>;
};

export default PerformanceMonitor;