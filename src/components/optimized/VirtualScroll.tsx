import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  buffer?: number; // Number of items to render outside visible area
  onScroll?: (scrollTop: number) => void;
  estimatedItemHeight?: number; // For dynamic heights
}

function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  buffer = 5,
  onScroll,
  estimatedItemHeight
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const totalHeight = useMemo(() => {
    return items.length * (estimatedItemHeight || itemHeight);
  }, [items.length, itemHeight, estimatedItemHeight]);

  const visibleItemsCount = useMemo(() => {
    return Math.ceil(containerHeight / itemHeight) + buffer * 2;
  }, [containerHeight, itemHeight, buffer]);

  const startIndex = useMemo(() => {
    return Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  }, [scrollTop, itemHeight, buffer]);

  const endIndex = useMemo(() => {
    return Math.min(items.length - 1, startIndex + visibleItemsCount);
  }, [startIndex, visibleItemsCount, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  const offsetY = useMemo(() => {
    return startIndex * itemHeight;
  }, [startIndex, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Performance optimization: use transform instead of changing top position
  const innerStyle = useMemo(() => ({
    height: totalHeight,
    position: 'relative' as const,
  }), [totalHeight]);

  const itemsContainerStyle = useMemo(() => ({
    transform: `translateY(${offsetY}px)`,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
  }), [offsetY]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={innerStyle}>
        <div style={itemsContainerStyle}>
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: itemHeight,
                  overflow: 'hidden'
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hook for managing virtual scroll state
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const totalHeight = items.length * itemHeight;
  const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(items.length - 1, startIndex + visibleItemsCount);
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return {
    scrollTop,
    setScrollTop,
    totalHeight,
    visibleItems,
    offsetY,
    startIndex,
    endIndex,
    visibleItemsCount
  };
}

// Optimized list component with intersection observer for lazy loading
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  loadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  itemHeight?: number;
  estimatedItemHeight?: number;
}

export function OptimizedList<T>({
  items,
  renderItem,
  className,
  loadMore,
  hasMore = false,
  loading = false,
  itemHeight = 100,
  estimatedItemHeight
}: OptimizedListProps<T>) {
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Measure container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height || 400);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Intersection observer for infinite loading
  useEffect(() => {
    if (!loadMore || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  return (
    <div ref={containerRef} className={cn('h-full', className)}>
      <VirtualScroll
        items={items}
        itemHeight={estimatedItemHeight || itemHeight}
        containerHeight={containerHeight}
        renderItem={renderItem}
        estimatedItemHeight={estimatedItemHeight}
      />
      {hasMore && (
        <div ref={loadingRef} className="p-4 text-center">
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          ) : (
            <div className="h-4"></div>
          )}
        </div>
      )}
    </div>
  );
}

export default VirtualScroll;