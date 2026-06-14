import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn('z-50 min-w-[12rem] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-modal animate-scale-in dark:border-slate-800 dark:bg-slate-950', className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn('relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-100 dark:text-slate-100 dark:focus:bg-slate-800 dark:hover:bg-slate-900', className)}
      {...props}
    />
  )
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export const DropdownMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn('flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-colors hover:bg-slate-100 data-[state=checked]:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900 dark:data-[state=checked]:bg-slate-800', className)}
      {...props}
    >
      <span className="mr-2 flex h-4 w-4 items-center justify-center">
        <Check className="h-3.5 w-3.5 opacity-0" />
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
);
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

export const DropdownMenuRadioItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn('relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-colors hover:bg-slate-100 data-[state=checked]:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900 dark:data-[state=checked]:bg-slate-800', className)}
      {...props}
    >
      <span className="mr-2 flex h-4 w-4 items-center justify-center">
        <Check className="h-3.5 w-3.5 opacity-0" />
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

export const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Label ref={ref} className={cn('px-3 py-1.5 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400', className)} {...props} />
  )
);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

export const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator ref={ref} className={cn('my-1 h-px bg-slate-200 dark:bg-slate-800', className)} {...props} />
  )
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('ml-auto text-xs tracking-[0.2em] text-slate-500 dark:text-slate-400', className)} {...props} />
);
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';
