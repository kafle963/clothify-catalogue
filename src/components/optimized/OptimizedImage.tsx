import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  quality?: number;
  lazy?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder,
  fallback = '/placeholder-image.jpg',
  onLoad,
  onError,
  quality = 75,
  lazy = true,
  objectFit = 'cover'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL (could be extended to use a CDN service)
  const getOptimizedSrc = useCallback((originalSrc: string, w?: number, h?: number, q?: number) => {
    // This is a simple example - in a real app you might use a service like Cloudinary, Vercel Image Optimization, etc.
    if (originalSrc.includes('unsplash.com') || originalSrc.includes('picsum.photos')) {
      const params = new URLSearchParams();
      if (w) params.append('w', w.toString());
      if (h) params.append('h', h.toString());
      if (q && q < 100) params.append('q', q.toString());
      
      const separator = originalSrc.includes('?') ? '&' : '?';
      return `${originalSrc}${separator}${params.toString()}`;
    }
    return originalSrc;
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority]);

  // Load image when intersecting
  useEffect(() => {
    if (!isIntersecting) return;

    const optimizedSrc = getOptimizedSrc(src, width, height, quality);
    
    const img = new Image();
    img.onload = () => {
      setImageSrc(optimizedSrc);
      setIsLoading(false);
      onLoad?.();
    };
    img.onerror = () => {
      setImageError(true);
      setImageSrc(fallback);
      setIsLoading(false);
      onError?.();
    };
    img.src = optimizedSrc;
  }, [isIntersecting, src, width, height, quality, fallback, onLoad, onError, getOptimizedSrc]);

  // Generate srcSet for responsive images
  const generateSrcSet = useCallback(() => {
    if (!width || imageError) return undefined;
    
    const sizes = [0.5, 1, 1.5, 2]; // Different pixel densities
    return sizes
      .map(ratio => {
        const scaledWidth = Math.round(width * ratio);
        const optimizedSrc = getOptimizedSrc(src, scaledWidth, height ? Math.round(height * ratio) : undefined, quality);
        return `${optimizedSrc} ${ratio}x`;
      })
      .join(', ');
  }, [src, width, height, quality, imageError, getOptimizedSrc]);

  const imageStyle: React.CSSProperties = {
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoading ? 0 : 1,
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/Loading state */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 text-gray-400">
            <svg
              className="w-full h-full"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        style={imageStyle}
        srcSet={generateSrcSet()}
        sizes={width ? `(max-width: 768px) 100vw, ${width}px` : undefined}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        decoding="async"
        className={cn(
          'block max-w-full h-auto',
          isLoading && 'invisible'
        )}
      />

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
              <svg
                className="w-full h-full"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            Failed to load image
          </div>
        </div>
      )}
    </div>
  );
};

// Progressive enhancement for modern browsers
export const ProgressiveImage: React.FC<OptimizedImageProps & { 
  webpSrc?: string;
  avifSrc?: string;
}> = ({ webpSrc, avifSrc, src, ...props }) => {
  return (
    <picture>
      {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <OptimizedImage src={src} {...props} />
    </picture>
  );
};

export default OptimizedImage;