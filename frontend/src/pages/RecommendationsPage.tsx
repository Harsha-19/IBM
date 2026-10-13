import { useRecommendations, useGenerateRecommendations } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Link } from 'react-router-dom';
import {
  Target,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCw,
  Flame,
  Award,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';

export function RecommendationsPage() {
  const { data: recommendations, isLoading, error, refetch } = useRecommendations();
  const generateMutation = useGenerateRecommendations();

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Synthesizing personalized study recommendations...</p>
      </div>
    );
  }

  if (error || !recommendations) {
    return (
      <ErrorState
        title="Failed to load recommendations"
        message="Could not retrieve your personalized recommendations."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> Recommended Revision & Next Steps
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-driven learning path curated from your quiz responses, accuracy, and weak concepts.
          </p>
        </div>

        <Button
          onClick={() => generateMutation.mutate()}
          isLoading={generateMutation.isPending}
          variant="outline"
          className="gap-2"
        >
          <RotateCw className="w-4 h-4" /> Refresh Recommendations
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-border rounded-xl space-y-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text">No active recommendations</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            Take more lecture quizzes to allow the adaptive engine to detect your learning gaps and suggest tailored revisions.
          </p>
          <div className="pt-2">
            <Link to="/lectures">
              <Button size="sm">Browse Lectures</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              className="p-6 bg-white border border-border hover:shadow-sm transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-text text-base">{rec.concept_name}</h3>
                  <Badge
                    variant={
                      rec.recommendation_type === 'review'
                        ? 'error'
                        : rec.recommendation_type === 'practice'
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {rec.recommendation_type.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-text-secondary">
                  Priority {rec.priority}
                </span>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed bg-gray-50/60 p-4 rounded-lg border border-border">
                {rec.reason}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-text-secondary">
                  Recommended: targeted conceptual drill
                </span>
                <Link to="/lectures">
                  <Button size="sm" className="gap-2">
                    Review Lecture <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
