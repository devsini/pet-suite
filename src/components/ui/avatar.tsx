import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: string;
}

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, placeholder = 'USER', src, alt, ...props }, ref) => (
    <div
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-semibold uppercase text-white shadow-sm',
        className
      )}
    >
      {src ? (
        <img ref={ref} src={src} alt={alt ?? 'avatar'} className="h-full w-full object-cover" {...props} />
      ) : (
        <span>{placeholder.slice(0, 2)}</span>
      )}
    </div>
  )
);
Avatar.displayName = 'Avatar';