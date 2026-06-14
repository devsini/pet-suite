import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const alertVariants: Record<NonNullable<AlertProps['variant']>, string> = {
  default: 'bg-slate-50 text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  danger: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800'
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = 'default', ...props }, ref) => (
  <div ref={ref} className={cn('rounded-2xl border px-4 py-3 text-sm', alertVariants[variant], className)} {...props} />
));
Alert.displayName = 'Alert';
