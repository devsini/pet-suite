import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'blue' | 'slate' | 'emerald' | 'amber' | 'rose';
}

const badgeClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
  secondary: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
  outline: 'border border-slate-200 text-slate-900 dark:border-slate-700 dark:text-slate-100',
  destructive: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        badgeClasses[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';