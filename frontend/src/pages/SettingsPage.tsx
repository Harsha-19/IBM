import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Settings, Cpu, ShieldCheck, Database, Bell } from 'lucide-react';

export function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">Platform Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          System configurations, AI provider pipelines, and validation quality thresholds.
        </p>
      </div>

      <div className="space-y-6">
        {/* AI & Validation Settings Card */}
        <Card className="p-6 bg-white border border-border space-y-5">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text">AI Inference & Pipeline</h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-gray-50 border border-border">
              <div>
                <p className="font-semibold text-text">Active AI Provider</p>
                <p className="text-xs text-text-secondary">Provider backend configured in environment</p>
              </div>
              <Badge variant="success">MOCK / OPENAI HYBRID</Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-gray-50 border border-border">
              <div>
                <p className="font-semibold text-text">Quality Gate Threshold</p>
                <p className="text-xs text-text-secondary">Minimum composite score required to pass questions into student quizzes</p>
              </div>
              <span className="font-mono font-bold text-primary">75 / 100</span>
            </div>
          </div>
        </Card>

        {/* Database & Storage */}
        <Card className="p-6 bg-white border border-border space-y-5">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text">Storage & Database</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-gray-50 border border-border">
              <div>
                <p className="font-semibold text-text">Relational Database</p>
                <p className="text-xs text-text-secondary">SQLAlchemy ORM + SQLite / PostgreSQL</p>
              </div>
              <Badge variant="default">CONNECTED</Badge>
            </div>
          </div>
        </Card>

        {/* Save feedback */}
        {saved && (
          <div className="p-3 bg-green-50 text-green-800 text-sm rounded-lg border border-green-200">
            Settings updated successfully.
          </div>
        )}

        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
