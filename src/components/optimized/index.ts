// Optimized Components Index
// Export all performance-optimized components from a single entry point

export { default as MemoizedProductCard } from './MemoizedProductCard';
export { default as VirtualScroll, OptimizedList, useVirtualScroll } from './VirtualScroll';
export { default as OptimizedImage, ProgressiveImage } from './OptimizedImage';

// Re-export types for convenience
export type { default as VirtualScrollProps } from './VirtualScroll';
export type { default as OptimizedImageProps } from './OptimizedImage';