import { useAuth } from '@/stores/useAuth';
import { Button } from '../ui/Button';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6">
      <div className="flex items-center">
        {/* Breadcrumbs or page title could go here */}
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-secondary">
          Welcome, {user?.name || 'Student'}
        </span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
