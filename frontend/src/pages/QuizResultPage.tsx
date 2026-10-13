import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useAttemptResult } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  TrendingUp,
  Brain,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export function QuizResultPage() {
  const { id: quizId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const { data: result, isLoading, error, refetch } = useAttemptResult(attemptId || undefined);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Evaluating answers & compiling adaptive insights...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <ErrorState
        title="Could not load quiz result"
        message="The evaluation result for this attempt was not found."
        onRetry={() => refetch()}
      />
    );
  }

  const { score, total_questions, percentage, answers, concept_performance } = result;
  const incorrectCount = total_questions - score;

  // Identify weak concepts from performance (< 60%)
  const weakConcepts = (concept_performance || []).filter((cp) => cp.percentage < 60);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Score Header Card */}
      <Card className="p-8 bg-white border border-border shadow-sm text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-text-secondary">
            Quiz Evaluation Complete
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text mt-1">
            {Math.round(percentage)}% Accuracy
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            You scored <strong className="text-text">{score}</strong> out of{' '}
            <strong className="text-text">{total_questions}</strong> questions correctly.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4 border-t border-border">
          <div className="p-3 rounded-lg bg-green-50 border border-green-100">
            <span className="text-xs text-green-700 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
            </span>
            <p className="text-xl font-bold text-green-800 mt-0.5">{score}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <span className="text-xs text-red-700 font-medium flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Incorrect
            </span>
            <p className="text-xl font-bold text-red-800 mt-0.5">{incorrectCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
            <span className="text-xs text-indigo-700 font-medium flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Mastery
            </span>
            <p className="text-xl font-bold text-indigo-800 mt-0.5">{Math.round(percentage)}%</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link to={`/quiz/${quizId}`}>
            <Button variant="outline" className="gap-2">
              <RotateCw className="w-4 h-4" /> Retake Quiz
            </Button>
          </Link>
          <Link to="/progress">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="w-4 h-4" /> View Long-Term Progress
            </Button>
          </Link>
          <Link to="/">
            <Button className="gap-2">
              Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Weak Concept Detection & Adaptive Recommendation Banner */}
      {weakConcepts.length > 0 && (
        <Card className="p-6 bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-amber-900 text-base">Weak Concept Detected</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Our multi-signal analysis shows lower comprehension on the following topics:
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {weakConcepts.map((wc) => (
                  <span
                    key={wc.concept_id}
                    className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 text-xs font-semibold"
                  >
                    {wc.concept_name} ({Math.round(wc.percentage)}% correct)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Concept Breakdown Table */}
      <Card className="p-6 bg-white border border-border space-y-4">
        <h3 className="font-bold text-text text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> Performance by Educational Concept
        </h3>

        <div className="space-y-3">
          {concept_performance && concept_performance.length > 0 ? (
            concept_performance.map((cp) => (
              <div key={cp.concept_id} className="p-3 rounded-lg border border-border bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="font-semibold text-text">{cp.concept_name}</span>
                  <span className={cp.percentage >= 70 ? 'text-green-700' : 'text-amber-700'}>
                    {cp.correct} of {cp.total} correct ({Math.round(cp.percentage)}%)
                  </span>
                </div>
                <ProgressBar
                  value={cp.percentage}
                  className={`h-2 ${cp.percentage >= 70 ? 'bg-green-100' : 'bg-amber-100'}`}
                />
              </div>
            ))
          ) : (
            <p className="text-xs text-text-secondary">No concept mapping recorded for this quiz.</p>
          )}
        </div>
      </Card>

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <h3 className="font-bold text-text text-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" /> Question-by-Question Review
        </h3>

        <div className="space-y-4">
          {answers && answers.map((ans, idx) => (
            <Card
              key={idx}
              className={`p-5 bg-white border ${
                ans.is_correct ? 'border-green-200' : 'border-red-200'
              } space-y-3`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  {ans.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-xs font-bold uppercase text-text-secondary">
                      Question {idx + 1}
                    </span>
                    <h4 className="font-semibold text-text text-sm mt-0.5">
                      {ans.question_text}
                    </h4>
                  </div>
                </div>
                <Badge variant={ans.is_correct ? 'success' : 'error'}>
                  {ans.is_correct ? 'CORRECT' : 'INCORRECT'}
                </Badge>
              </div>

              {/* AI Explanation Callout */}
              {ans.explanation && (
                <div className="p-3 bg-gray-50 border border-border rounded-lg text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text">Explanation:</strong> {ans.explanation}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
