import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

const badgeClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950',
  secondary: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
  outline: 'border border-slate-200 text-slate-900 dark:border-slate-700 dark:text-slate-100'
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => (
  <span ref={ref} className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', badgeClasses[variant], className)} {...props} />
));
Badge.displayName = 'Badge';
