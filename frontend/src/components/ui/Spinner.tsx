import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | number;
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const sizeClass = typeof size === 'string' ? sizeClasses[size] : `w-[${size}px] h-[${size}px]`;

  return (
    <Loader2 className={cn('animate-spin text-primary', sizeClass, className)} {...props} />
  );
}
