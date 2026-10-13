import { useAuth } from '@/stores/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserCircle, Mail, Shield, Calendar, Award } from 'lucide-react';

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">User Profile</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your account credentials and system role.
        </p>
      </div>

      <Card className="p-6 bg-white border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">{user?.name || 'Student User'}</h2>
            <p className="text-sm text-text-secondary">{user?.email}</p>
            <div className="mt-1">
              <Badge variant="default" className="uppercase text-[10px]">
                {user?.role || 'student'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
          <div className="p-3.5 rounded-lg bg-gray-50 border border-border space-y-1">
            <span className="text-xs text-text-secondary flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
            </span>
            <p className="font-semibold text-text">{user?.email || 'N/A'}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-gray-50 border border-border space-y-1">
            <span className="text-xs text-text-secondary flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-primary" /> Account Role
            </span>
            <p className="font-semibold text-text capitalize">{user?.role || 'student'}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            Authenticated via secure JWT Bearer Token
          </span>
          <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700">
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
