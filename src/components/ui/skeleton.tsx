import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width = '100%', height = '1rem', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse-soft rounded-xl bg-slate-200 dark:bg-slate-800', className)}
      style={{ width, height }}
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';