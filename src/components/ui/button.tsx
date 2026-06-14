import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'danger' | 'destructive' | 'ghost' | 'secondary' | 'warning';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-[0.97] dark:bg-blue-600 dark:hover:bg-blue-500',
  outline:
    'border border-slate-200 bg-transparent text-slate-900 hover:bg-slate-50 active:scale-[0.97] dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-md active:scale-[0.97] dark:bg-rose-600 dark:hover:bg-rose-500',
  destructive:
    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-md active:scale-[0.97] dark:bg-rose-600 dark:hover:bg-rose-500',
  ghost:
    'bg-transparent text-slate-900 hover:bg-slate-100 active:scale-[0.97] dark:text-slate-100 dark:hover:bg-slate-800',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.97] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  warning:
    'bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md active:scale-[0.97] dark:bg-amber-600 dark:hover:bg-amber-500'
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-6 text-base'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'default', size = 'default', asChild = false, isLoading, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';