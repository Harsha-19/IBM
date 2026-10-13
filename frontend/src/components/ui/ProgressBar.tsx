import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  progress?: number;
  value?: number;
  className?: string;
}

export function ProgressBar({ progress, value, className }: ProgressBarProps) {
  const currentVal = value !== undefined ? value : (progress !== undefined ? progress : 0);
  const clampedProgress = Math.min(100, Math.max(0, currentVal));
  
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-border", className)}>
      <div 
        className="h-full bg-primary transition-all duration-500 ease-in-out" 
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
