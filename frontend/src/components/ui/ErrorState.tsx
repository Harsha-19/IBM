import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'We encountered an error loading this content.', 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-error/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10 mb-4">
        <AlertCircle className="h-6 w-6 text-error" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
