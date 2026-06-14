import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-slate-200 bg-slate-200 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  )
);
Switch.displayName = SwitchPrimitive.Root.displayName;
