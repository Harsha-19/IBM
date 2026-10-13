import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="mb-1.5 block text-sm font-medium text-text">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              icon && 'pl-10',
              error && 'border-error focus:ring-error',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
