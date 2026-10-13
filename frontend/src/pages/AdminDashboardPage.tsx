import { useValidationStats } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  TrendingUp,
  FileCheck,
  HelpCircle,
} from 'lucide-react';

export function AdminDashboardPage() {
  const { data: stats, isLoading, error, refetch } = useValidationStats();

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Loading AI validator statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <ErrorState
        title="Failed to load admin stats"
        message="Could not load validator engine metrics."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" /> Admin Validator Quality Control
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Audit AI question generation quality, grounding metrics, and distractor plausibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/questions">
            <Button variant="outline" className="gap-2">
              <HelpCircle className="w-4 h-4" /> Review Questions
            </Button>
          </Link>
          <Link to="/admin/validation">
            <Button className="gap-2">
              <FileCheck className="w-4 h-4" /> Validation Inspector
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-border">
          <span className="text-xs font-semibold text-text-secondary uppercase">
            Total Generated
          </span>
          <p className="text-3xl font-extrabold text-text mt-2">{stats.total_generated}</p>
          <span className="text-xs text-text-secondary mt-1 block">Questions synthesized</span>
        </Card>

        <Card className="p-5 bg-white border border-green-200 bg-green-50/20">
          <span className="text-xs font-semibold text-green-700 uppercase">Approved (Quality-Gate)</span>
          <p className="text-3xl font-extrabold text-green-700 mt-2">{stats.total_approved}</p>
          <span className="text-xs text-green-600 mt-1 block">Passed verification</span>
        </Card>

        <Card className="p-5 bg-white border border-amber-200 bg-amber-50/20">
          <span className="text-xs font-semibold text-amber-700 uppercase">Under Review</span>
          <p className="text-3xl font-extrabold text-amber-700 mt-2">{stats.total_review}</p>
          <span className="text-xs text-amber-600 mt-1 block">Borderline scores</span>
        </Card>

        <Card className="p-5 bg-white border border-red-200 bg-red-50/20">
          <span className="text-xs font-semibold text-red-700 uppercase">Rejected</span>
          <p className="text-3xl font-extrabold text-red-700 mt-2">{stats.total_rejected}</p>
          <span className="text-xs text-red-600 mt-1 block">Failed grounding/clarity</span>
        </Card>
      </div>

      {/* Quality Gate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text">Average Validation Score</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">{stats.average_score} / 100</p>
          <p className="text-xs text-text-secondary">
            Weighted composite of Grounding (30%), Correctness (25%), Clarity (15%), Distractor Quality (15%), and Difficulty (15%).
          </p>
        </Card>

        <Card className="p-6 bg-white border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text">Grounding Failure Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.grounding_failure_rate}%</p>
          <p className="text-xs text-text-secondary">
            Questions flagged as hallucinated or ungrounded in the lecture material.
          </p>
        </Card>

        <Card className="p-6 bg-white border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text">Correctness Failure Rate</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.correctness_failure_rate}%</p>
          <p className="text-xs text-text-secondary">
            Questions where answer keys or distractors exhibited ambiguity or errors.
          </p>
        </Card>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/questions"
          className="p-5 rounded-xl border border-border bg-white hover:border-primary/50 transition flex items-center justify-between shadow-sm"
        >
          <div>
            <h3 className="font-bold text-text text-base">Question Approval Queue</h3>
            <p className="text-xs text-text-secondary mt-1">
              Approve, reject, or manually edit synthesized questions.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </Link>

        <Link
          to="/admin/validation"
          className="p-5 rounded-xl border border-border bg-white hover:border-primary/50 transition flex items-center justify-between shadow-sm"
        >
          <div>
            <h3 className="font-bold text-text text-base">Detailed Validator Inspector</h3>
            <p className="text-xs text-text-secondary mt-1">
              Inspect dimension scores (grounding, clarity, distractors, difficulty).
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </Link>
      </div>
    </div>
  );
}
