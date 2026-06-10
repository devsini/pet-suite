import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: string;
}

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(({ className, placeholder = 'USER', src, alt, ...props }, ref) => (
  <div className={cn('inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-700 dark:text-slate-100', className)}>
    {src ? <img ref={ref} src={src} alt={alt ?? 'avatar'} className="h-full w-full object-cover" {...props} /> : <span>{placeholder.slice(0, 2)}</span>}
  </div>
));
Avatar.displayName = 'Avatar';
