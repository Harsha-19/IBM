import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLectures, useDeleteLecture, useProcessLecture } from '@/hooks/useQueries';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  BookOpen,
  Plus,
  Play,
  RotateCw,
  Trash2,
  Search,
  FileText,
  Network,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export function LecturesPage() {
  const { data, isLoading, error, refetch } = useLectures();
  const deleteMutation = useDeleteLecture();
  const processMutation = useProcessLecture();
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Loading lectures...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load lectures"
        message="Could not load your lecture list from the server."
        onRetry={() => refetch()}
      />
    );
  }

  const lectures = data.lectures || [];
  const filteredLectures = lectures.filter((lec) =>
    lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lec.description && lec.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Processing
          </Badge>
        );
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Your Lectures</h1>
          <p className="text-text-secondary mt-1 text-sm">
            Upload course material, generate AI-validated quizzes, and explore extracted knowledge graphs.
          </p>
        </div>
        <Link to="/lectures/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Upload New Lecture
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search lectures by title or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Lectures List */}
      {filteredLectures.length === 0 ? (
        <div className="p-12 text-center bg-white border border-border rounded-xl">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text">No lectures found</h3>
          <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
            {searchQuery ? 'No lectures matched your search query.' : 'Upload your first lecture transcript or document to begin validated learning.'}
          </p>
          {!searchQuery && (
            <Link to="/lectures/new" className="mt-4 inline-block">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Upload Lecture
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => (
            <Card
              key={lecture.id}
              className="p-5 bg-white border border-border flex flex-col justify-between hover:shadow-sm transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  {getStatusBadge(lecture.status)}
                  <span className="text-[11px] text-text-secondary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lecture.created_at ? new Date(lecture.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <Link to={`/lectures/${lecture.id}`}>
                  <h3 className="font-semibold text-text text-base hover:text-primary transition line-clamp-1">
                    {lecture.title}
                  </h3>
                </Link>

                <p className="text-xs text-text-secondary mt-1 line-clamp-2 min-h-[32px]">
                  {lecture.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                  <span>Type: <strong className="text-text capitalize">{lecture.source_type}</strong></span>
                  {lecture.word_count ? <span>{lecture.word_count.toLocaleString()} words</span> : null}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link to={`/lectures/${lecture.id}`}>
                    <Button variant="outline" size="sm" className="text-xs px-2.5">
                      Overview
                    </Button>
                  </Link>

                  {lecture.status === 'completed' && (
                    <>
                      <Link to={`/lectures/${lecture.id}/concepts`}>
                        <Button variant="outline" size="sm" className="text-xs px-2.5 gap-1">
                          <Network className="w-3 h-3" /> Map
                        </Button>
                      </Link>
                      <Link to={`/lectures/${lecture.id}/quiz`}>
                        <Button size="sm" className="text-xs px-2.5 gap-1">
                          <Play className="w-3 h-3" /> Quiz
                        </Button>
                      </Link>
                    </>
                  )}

                  {lecture.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => processMutation.mutate(lecture.id)}
                      isLoading={processMutation.isPending}
                      className="text-xs px-2.5 gap-1"
                    >
                      <RotateCw className="w-3 h-3" /> Process
                    </Button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this lecture?')) {
                      deleteMutation.mutate(lecture.id);
                    }
                  }}
                  className="p-1.5 text-text-secondary hover:text-red-600 transition rounded hover:bg-red-50"
                  title="Delete lecture"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
