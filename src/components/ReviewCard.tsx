import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MoreHorizontal } from 'lucide-react';
import StarRating from './StarRating';
import { Review } from '@/types';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  onHelpfulClick?: (reviewId: string) => void;
  className?: string;
  compact?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onHelpfulClick,
  className,
  compact = false
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleHelpfulClick = () => {
    if (onHelpfulClick) {
      onHelpfulClick(review.id);
    }
  };

  return (
    <Card className={cn(
      "p-4 sm:p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300",
      compact && "p-3 sm:p-4",
      className
    )}>
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-xs sm:text-sm font-semibold text-accent">
                {review.userName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "font-semibold text-foreground",
                  compact ? "text-sm" : "text-sm sm:text-base"
                )}>
                  {review.userName}
                </h4>
                {review.verified && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    Verified
                  </Badge>
                )}
              </div>
              <p className={cn(
                "text-muted-foreground",
                compact ? "text-xs" : "text-xs sm:text-sm"
              )}>
                {formatDate(review.date)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Rating */}
        <StarRating 
          rating={review.rating} 
          size={compact ? "sm" : "md"} 
          className="flex items-center"
        />

        {/* Review Content */}
        <div className="space-y-2 sm:space-y-3">
          <p className={cn(
            "text-foreground leading-relaxed",
            compact ? "text-sm" : "text-sm sm:text-base"
          )}>
            {review.comment}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-foreground gap-2 h-8 px-2 sm:px-3",
              compact && "text-xs"
            )}
            onClick={handleHelpfulClick}
          >
            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Helpful ({review.helpful})</span>
          </Button>
          
          {!compact && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                Reply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReviewCard;