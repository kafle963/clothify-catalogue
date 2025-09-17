import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  className,
  interactive = false,
  onRatingChange
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const isFilled = index < Math.floor(rating);
          const isHalfFilled = index === Math.floor(rating) && rating % 1 !== 0;
          
          return (
            <div
              key={index}
              className={cn(
                "relative",
                interactive && "cursor-pointer hover:scale-110 transition-transform duration-200"
              )}
              onClick={() => handleStarClick(index)}
            >
              <Star 
                className={cn(
                  sizeClasses[size],
                  isFilled 
                    ? "fill-slate-600 text-slate-600"
                    : "fill-gray-200 text-gray-200",
                  interactive && "hover:fill-slate-500 hover:text-slate-500"
                )}
              />
              {isHalfFilled && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star 
                    className={cn(
                      sizeClasses[size],
                      "fill-slate-600 text-slate-600"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showNumber && (
        <span className={cn(
          'font-medium text-muted-foreground ml-1',
          textSizeClasses[size]
        )}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;