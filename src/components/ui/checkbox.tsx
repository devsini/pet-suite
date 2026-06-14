import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
  ({ className, children, ...props }, ref) => (
    <label className={cn('inline-flex items-center gap-2', className)}>
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-lg border border-slate-300 bg-white text-blue-600 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {children}
    </label>
  )
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
