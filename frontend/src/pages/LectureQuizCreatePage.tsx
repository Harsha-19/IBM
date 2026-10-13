import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLecture, useCreateQuiz } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  HelpCircle,
  Play,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export function LectureQuizCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lecture, isLoading } = useLecture(id);
  const createQuizMutation = useCreateQuiz();

  const [numQuestions, setNumQuestions] = useState<number>(3);
  const [isAdaptive, setIsAdaptive] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<string>('adaptive');

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Loading quiz configuration...</p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!id) return;
    try {
      const quiz = await createQuizMutation.mutateAsync({
        lecture_id: Number(id),
        num_questions: numQuestions,
        is_adaptive: isAdaptive,
      });
      navigate(`/quiz/${quiz.id}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to initialize quiz.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Link
        to={`/lectures/${id}`}
        className="text-xs text-text-secondary hover:text-text flex items-center gap-1 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Lecture Details
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" /> Configure Adaptive Quiz
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lecture?.title ? `Customize questions for "${lecture.title}"` : 'Setup your testing session.'}
        </p>
      </div>

      <Card className="p-6 bg-white border border-border shadow-sm space-y-6">
        {/* Adaptive Learning Mode Callout */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
          <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-text text-sm">Adaptive Engine Enabled</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Questions dynamically adjust based on your historical mastery and weak concepts identified in previous attempts.
            </p>
          </div>
        </div>

        {/* Number of Questions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-text">Number of Questions</label>
            <span className="text-sm font-bold text-primary">{numQuestions} Questions</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[3, 5, 8, 10].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setNumQuestions(count)}
                className={`py-2 text-sm font-medium rounded-lg border transition ${
                  numQuestions === count
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-border bg-white text-text hover:bg-gray-50'
                }`}
              >
                {count} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Cognitive Difficulty Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">Target Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'adaptive', label: 'Adaptive Auto' },
              { id: 'medium', label: 'Moderate' },
              { id: 'hard', label: 'Challenging' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className={`py-2 text-sm font-medium rounded-lg border transition ${
                  difficulty === d.id
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-white text-text hover:bg-gray-50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Adaptive Toggle */}
        <div className="pt-2">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-gray-50 cursor-pointer">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-text">Prioritize Weak Topics</span>
              <p className="text-xs text-text-secondary">
                Selects validated questions targeting concepts where your mastery score is under 60%.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isAdaptive}
              onChange={(e) => setIsAdaptive(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
          </label>
        </div>

        {/* Quality Gate Guarantee */}
        <div className="p-3 bg-gray-50 rounded-lg border border-border flex items-center gap-2 text-xs text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <span>Every question in this quiz is quality-checked for grounding and distractor validity.</span>
        </div>

        <Button
          onClick={handleCreate}
          isLoading={createQuizMutation.isPending}
          className="w-full gap-2 text-base py-5"
        >
          <Play className="w-4 h-4" /> Start Validated Quiz Now
        </Button>
      </Card>
    </div>
  );
}
