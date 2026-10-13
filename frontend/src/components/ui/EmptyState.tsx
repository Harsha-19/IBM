import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-border">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
