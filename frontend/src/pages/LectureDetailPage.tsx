import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLecture, useProcessLecture, useQuizzes } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  BookOpen,
  Play,
  RotateCw,
  Network,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function LectureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lecture, isLoading, error, refetch } = useLecture(id);
  const { data: quizzes } = useQuizzes(id);
  const processMutation = useProcessLecture();
  const [activeTab, setActiveTab] = useState<'concepts' | 'sections' | 'transcript' | 'quizzes'>('concepts');

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Loading lecture details...</p>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <ErrorState
        title="Lecture not found"
        message="Could not load the requested lecture details."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Card */}
      <Card className="p-6 bg-white border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  lecture.status === 'completed'
                    ? 'success'
                    : lecture.status === 'processing'
                    ? 'warning'
                    : 'secondary'
                }
              >
                {lecture.status.toUpperCase()}
              </Badge>
              <span className="text-xs text-text-secondary">
                {lecture.word_count ? `${lecture.word_count.toLocaleString()} words` : ''}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text">{lecture.title}</h1>
            <p className="text-sm text-text-secondary">
              {lecture.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {lecture.status === 'completed' && (
              <>
                <Link to={`/lectures/${lecture.id}/quiz`}>
                  <Button className="gap-2">
                    <Play className="w-4 h-4" /> Start Adaptive Quiz
                  </Button>
                </Link>
                <Link to={`/lectures/${lecture.id}/concepts`}>
                  <Button variant="outline" className="gap-2">
                    <Network className="w-4 h-4" /> Knowledge Map
                  </Button>
                </Link>
              </>
            )}

            <Button
              variant="outline"
              onClick={() => processMutation.mutate(lecture.id)}
              isLoading={processMutation.isPending}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" /> Reprocess Lecture
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs Header */}
      <div className="border-b border-border flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('concepts')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'concepts'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          <Layers className="w-4 h-4" /> Extracted Concepts ({lecture.concepts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'sections'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          <FileText className="w-4 h-4" /> Structured Sections ({lecture.sections?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Quizzes ({quizzes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'transcript'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Full Transcript
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'concepts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text text-lg">Key Educational Concepts</h3>
            <Link to={`/lectures/${lecture.id}/concepts`} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Open Interactive Knowledge Graph <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lecture.concepts && lecture.concepts.length > 0 ? (
              lecture.concepts.map((concept) => (
                <Card key={concept.id} className="p-4 bg-white border border-border space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-text text-sm">{concept.name}</h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="default">
                        Importance: {Math.round((concept.importance || 0.8) * 100)}%
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {concept.difficulty || 'medium'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {concept.description}
                  </p>
                </Card>
              ))
            ) : (
              <div className="p-8 col-span-2 text-center bg-white border border-border rounded-xl text-text-secondary text-sm">
                No concepts extracted yet. Click "Reprocess Lecture" to trigger AI extraction.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="space-y-4">
          {lecture.sections && lecture.sections.length > 0 ? (
            lecture.sections.map((sec, idx) => (
              <Card key={sec.id} className="p-5 bg-white border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="font-semibold text-text text-sm">{sec.title}</h4>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed pl-8 whitespace-pre-wrap">
                  {sec.content}
                </p>
              </Card>
            ))
          ) : (
            <div className="p-8 text-center bg-white border border-border rounded-xl text-text-secondary text-sm">
              No sections detected.
            </div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text text-lg">Quizzes for this Lecture</h3>
            <Link to={`/lectures/${lecture.id}/quiz`}>
              <Button size="sm" className="gap-2">
                <Play className="w-4 h-4" /> Create New Quiz
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {quizzes && quizzes.length > 0 ? (
              quizzes.map((q) => (
                <div
                  key={q.id}
                  className="p-4 bg-white border border-border rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text text-sm">{q.title}</span>
                      {q.is_adaptive && <Badge variant="warning">Adaptive</Badge>}
                      <Badge variant="secondary">{q.num_questions} Questions</Badge>
                    </div>
                    <span className="text-xs text-text-secondary">
                      Created: {q.created_at ? new Date(q.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <Link to={`/quiz/${q.id}`}>
                    <Button size="sm" className="gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Take Quiz
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white border border-border rounded-xl text-text-secondary text-sm">
                No quizzes created yet for this lecture.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'transcript' && (
        <Card className="p-6 bg-white border border-border">
          <h3 className="font-semibold text-text text-sm mb-3">Complete Transcript</h3>
          <div className="p-4 bg-gray-50 rounded-lg text-xs font-mono text-text leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto border border-border">
            {lecture.transcript || 'No transcript text available.'}
          </div>
        </Card>
      )}
    </div>
  );
}
