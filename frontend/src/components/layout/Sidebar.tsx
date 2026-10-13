import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, LayoutDashboard, Target, Activity, Settings, UserCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/stores/useAuth';

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Lectures', path: '/lectures', icon: BookOpen },
    { label: 'Progress', path: '/progress', icon: Activity },
    { label: 'Recommendations', path: '/recommendations', icon: Target },
    { label: 'Validator Gate', path: '/admin', icon: ShieldCheck },
  ];

  return (
    <div className="w-64 border-r border-border bg-white flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-md">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg text-text">LectureLens</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary/5 text-primary' 
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <nav className="space-y-1">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-text transition-colors"
          >
            <UserCircle className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-text transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </div>
    </div>
  );
}
