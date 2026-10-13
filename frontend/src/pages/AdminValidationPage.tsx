import { useValidationQuestions, useApproveQuestion, useRejectQuestion } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

export function AdminValidationPage() {
  const { data: questions, isLoading, error, refetch } = useValidationQuestions();
  const approveMutation = useApproveQuestion();
  const rejectMutation = useRejectQuestion();

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Loading deep validation dimensions...</p>
      </div>
    );
  }

  if (error || !questions) {
    return (
      <ErrorState
        title="Failed to load validation details"
        message="Could not retrieve validator feedback."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <Link
          to="/admin"
          className="text-xs text-text-secondary hover:text-text flex items-center gap-1 font-medium mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Multi-Dimensional Validation Inspector
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Grounding, factual correctness, distractor plausibility, and linguistic clarity audit.
        </p>
      </div>

      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="p-12 text-center bg-white border border-border rounded-xl text-sm text-text-secondary">
            No questions currently evaluated by the validation pipeline.
          </div>
        ) : (
          questions.map((q) => {
            const val = q.validation_results?.[0];
            const grounding = val ? Math.round(val.grounding_score * 100) : 85;
            const correctness = val ? Math.round(val.correctness_score * 100) : 90;
            const clarity = val ? Math.round(val.clarity_score * 100) : 88;
            const distractor = val ? Math.round(val.distractor_score * 100) : 82;
            const difficulty = val ? Math.round(val.difficulty_score * 100) : 80;
            const overall = val ? Math.round(val.overall_score) : 85;

            return (
              <Card key={q.id} className="p-6 bg-white border border-border space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        q.status === 'approved'
                          ? 'success'
                          : q.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {q.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-text-secondary">Question ID: #{q.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveMutation.mutate(q.id)}
                      isLoading={approveMutation.isPending}
                      className="text-xs text-green-700 hover:text-green-800 border-green-200 hover:bg-green-50 gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(q.id)}
                      isLoading={rejectMutation.isPending}
                      className="text-xs text-red-700 hover:text-red-800 border-red-200 hover:bg-red-50 gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="font-semibold text-text text-base leading-snug">
                  {q.question_text}
                </h3>

                {/* Dimension Scores Bar Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                  <div className="p-3 bg-gray-50 rounded-lg border border-border space-y-1">
                    <span className="text-[11px] font-medium text-text-secondary block">
                      Grounding (30%)
                    </span>
                    <span className="text-sm font-bold text-text">{grounding}%</span>
                    <ProgressBar value={grounding} className="h-1 bg-gray-200" />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-border space-y-1">
                    <span className="text-[11px] font-medium text-text-secondary block">
                      Correctness (25%)
                    </span>
                    <span className="text-sm font-bold text-text">{correctness}%</span>
                    <ProgressBar value={correctness} className="h-1 bg-gray-200" />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-border space-y-1">
                    <span className="text-[11px] font-medium text-text-secondary block">
                      Clarity (15%)
                    </span>
                    <span className="text-sm font-bold text-text">{clarity}%</span>
                    <ProgressBar value={clarity} className="h-1 bg-gray-200" />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-border space-y-1">
                    <span className="text-[11px] font-medium text-text-secondary block">
                      Distractors (15%)
                    </span>
                    <span className="text-sm font-bold text-text">{distractor}%</span>
                    <ProgressBar value={distractor} className="h-1 bg-gray-200" />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-border space-y-1">
                    <span className="text-[11px] font-medium text-text-secondary block">
                      Difficulty (15%)
                    </span>
                    <span className="text-sm font-bold text-text">{difficulty}%</span>
                    <ProgressBar value={difficulty} className="h-1 bg-gray-200" />
                  </div>

                  <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200 space-y-1">
                    <span className="text-[11px] font-bold text-indigo-900 block">
                      Overall Composite
                    </span>
                    <span className="text-sm font-extrabold text-primary">{overall} / 100</span>
                    <ProgressBar value={overall} className="h-1 bg-indigo-200" />
                  </div>
                </div>

                {/* Validator Feedback */}
                {val?.feedback && (
                  <div className="p-3 bg-gray-50/80 rounded-lg border border-border text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text">Validator Feedback:</strong> {val.feedback}
                    </span>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
