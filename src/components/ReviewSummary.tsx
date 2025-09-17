import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StarRating from './StarRating';
import { Review } from '@/types';
import { cn } from '@/lib/utils';

interface ReviewSummaryProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  className?: string;
  compact?: boolean;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  reviews,
  averageRating,
  totalReviews,
  className,
  compact = false
}) => {
  // Calculate rating distribution
  const ratingDistribution = Array.from({ length: 5 }, (_, index) => {
    const rating = 5 - index; // 5 stars to 1 star
    const count = reviews.filter(review => Math.floor(review.rating) === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
        <StarRating rating={averageRating} size="sm" />
        <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">
          ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
        </span>
      </div>
    );
  }

  return (
    <Card className={cn("p-4 sm:p-6 border-0 shadow-sm", className)}>
      <div className="space-y-4 sm:space-y-6">
        {/* Overall Rating */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-3xl sm:text-4xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </div>
            <StarRating 
              rating={averageRating} 
              size="lg" 
              className="justify-center"
            />
            <p className="text-sm sm:text-base text-muted-foreground">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-semibold text-sm sm:text-base">Rating Breakdown</h4>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-muted-foreground w-8">
                  {rating} ★
                </span>
                <Progress 
                  value={percentage} 
                  className="flex-1 h-2"
                />
                <span className="text-xs sm:text-sm text-muted-foreground w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-border/50">
          <div className="text-center space-y-1">
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {Math.round((ratingDistribution[0].percentage + ratingDistribution[1].percentage))}%
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">5-4 Stars</p>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {reviews.filter(r => r.verified).length}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Verified</p>
          </div>
          <div className="text-center space-y-1 col-span-2 sm:col-span-1">
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {Math.round(reviews.reduce((sum, r) => sum + r.helpful, 0) / reviews.length) || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Avg Helpful</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReviewSummary;