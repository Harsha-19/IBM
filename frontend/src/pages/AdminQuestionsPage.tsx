import { useState } from 'react';
import { useValidationQuestions, useApproveQuestion, useRejectQuestion } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCw,
  ArrowLeft,
  Filter,
  Check,
  X,
  Search,
} from 'lucide-react';

export function AdminQuestionsPage() {
  const { data: questions, isLoading, error, refetch } = useValidationQuestions();
  const approveMutation = useApproveQuestion();
  const rejectMutation = useRejectQuestion();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Loading question review queue...</p>
      </div>
    );
  }

  if (error || !questions) {
    return (
      <ErrorState
        title="Failed to load questions"
        message="Could not retrieve questions for review."
        onRetry={() => refetch()}
      />
    );
  }

  const filtered = questions.filter((q) => {
    const matchesFilter = filterStatus === 'all' || q.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="text-xs text-text-secondary hover:text-text flex items-center gap-1 font-medium mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" /> Questions Approval Queue
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review AI questions, verify answer keys and override quality-gate statuses.
          </p>
        </div>

        <Link to="/admin/validation">
          <Button variant="outline" className="text-xs">
            Inspect Validation Scores
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['all', 'approved', 'review', 'rejected', 'pending'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filterStatus === s
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-border text-text-secondary hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border border-border rounded-xl text-sm text-text-secondary">
            No questions match your selected filter criteria.
          </div>
        ) : (
          filtered.map((q) => {
            const latestValidation = q.validation_results?.[0];
            return (
              <Card key={q.id} className="p-5 bg-white border border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
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
                      <Badge variant="secondary" className="capitalize text-xs">
                        {q.difficulty}
                      </Badge>
                      {latestValidation && (
                        <span className="text-xs font-mono font-semibold text-primary">
                          Score: {Math.round(latestValidation.overall_score)}/100
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-text text-base mt-1 leading-snug">
                      {q.question_text}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
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

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        opt.is_correct
                          ? 'border-green-300 bg-green-50/60 font-semibold text-green-900'
                          : 'border-border bg-gray-50/50 text-text-secondary'
                      }`}
                    >
                      <span>{opt.option_text}</span>
                      {opt.is_correct && (
                        <span className="text-[10px] uppercase font-bold text-green-700">
                          (Correct)
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <p className="text-xs text-text-secondary bg-gray-50 p-2.5 rounded-lg border border-border">
                    <strong className="text-text">Explanation:</strong> {q.explanation}
                  </p>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
