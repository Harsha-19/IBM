import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStartAttempt, useSubmitAttempt } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
} from 'lucide-react';

export function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const startAttemptMutation = useStartAttempt();
  const submitAttemptMutation = useSubmitAttempt();

  const [attemptData, setAttemptData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<number, number>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Initialize attempt on mount
  useEffect(() => {
    if (!id) return;
    startAttemptMutation.mutate(id, {
      onSuccess: (data) => {
        setAttemptData(data);
        setQuestionStartTimes({ 0: Date.now() });
      },
      onError: (err: any) => {
        console.error('Failed to start quiz attempt:', err);
      },
    });
  }, [id]);

  // 2. Timer ticker
  useEffect(() => {
    if (!attemptData) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [attemptData]);

  const questions = attemptData?.questions || [];
  const currentQ = questions[currentIndex]?.question;

  const handleSelectOption = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionStartTimes((prev) => ({ ...prev, [currentIndex + 1]: Date.now() }));
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attemptData) return;
    setIsSubmitting(true);

    const answersPayload = questions.map((qq: any, idx: number) => {
      const q = qq.question;
      return {
        question_id: q.id,
        selected_option_id: selectedAnswers[q.id] || null,
        time_taken_seconds: 15, // estimated per question
      };
    });

    try {
      const result = await submitAttemptMutation.mutateAsync({
        attemptId: attemptData.attempt_id,
        submission: { answers: answersPayload },
      });
      navigate(`/quiz/${id}/result?attemptId=${attemptData.attempt_id}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error submitting quiz.');
      setIsSubmitting(false);
    }
  };

  if (startAttemptMutation.isPending || !attemptData) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Preparing your quality-gated quiz questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-md mx-auto p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-text">No Validated Questions Available</h2>
        <p className="text-xs text-text-secondary">
          All questions generated for this lecture are currently under validation review.
        </p>
        <Button onClick={() => navigate(-1)}>Return to Lecture</Button>
      </Card>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Quiz Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <h2 className="text-lg font-bold text-text">Knowledge Assessment</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-gray-100 border border-border text-xs font-mono font-medium text-text flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {formatTimer(elapsedSeconds)}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirmModal(true)}
            className="text-xs gap-1"
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      <ProgressBar value={progressPercent} className="h-1.5" />

      {/* Main Question Card */}
      <Card className="p-6 md:p-8 bg-white border border-border shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="capitalize text-xs">
            {currentQ.question_type ? currentQ.question_type.replace('_', ' ') : 'Multiple Choice'}
          </Badge>
          <Badge variant="default" className="capitalize text-xs">
            {currentQ.difficulty || 'Medium'}
          </Badge>
        </div>

        <h3 className="text-lg md:text-xl font-semibold text-text leading-relaxed">
          {currentQ.question_text}
        </h3>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((opt: any) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition flex items-center justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-sm'
                    : 'border-border bg-white text-text hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <span>{opt.option_text}</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                    isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          {currentIndex < questions.length - 1 ? (
            <Button onClick={handleNext} className="gap-2">
              Next Question <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => setShowConfirmModal(true)} className="gap-2">
              Review & Submit <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white border border-border shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-text">Ready to Submit Quiz?</h3>
            <p className="text-sm text-text-secondary">
              You have answered <strong className="text-text">{answeredCount}</strong> of{' '}
              <strong className="text-text">{questions.length}</strong> questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-amber-600 font-medium text-xs">
                  ⚠️ Note: Unanswered questions will be evaluated as incorrect.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Continue Answering
              </Button>
              <Button onClick={handleSubmit} isLoading={isSubmitting} className="gap-2">
                Confirm Submission <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
