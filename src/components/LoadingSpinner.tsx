import React from 'react';
import { Shirt } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false, 
  message 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-background'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative">
          <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto`}></div>
          <Shirt className={`${sizeClasses[size]} absolute inset-0 text-accent/50 animate-pulse mx-auto`} />
        </div>
        {message && (
          <p className="mt-4 text-muted-foreground text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;