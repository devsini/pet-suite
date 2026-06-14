import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800', className)}
    {...props}
  >
    <div
      className="absolute inset-y-0 left-0 rounded-full bg-blue-600 transition-all duration-500 ease-in-out dark:bg-blue-500"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
));
Progress.displayName = 'Progress';