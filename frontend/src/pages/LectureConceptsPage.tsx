import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useConcepts, useLecture } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Network,
  ArrowLeft,
  Play,
  Layers,
  Award,
  BookOpen,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export function LectureConceptsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lecture } = useLecture(id);
  const { data: conceptsData, isLoading, error, refetch } = useConcepts(id);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Generating knowledge map visualization...</p>
      </div>
    );
  }

  if (error || !conceptsData) {
    return (
      <ErrorState
        title="Failed to load concept map"
        message="Could not retrieve concepts for this lecture."
        onRetry={() => refetch()}
      />
    );
  }

  const concepts = conceptsData.concepts || [];
  const activeConcept = selectedConcept || concepts[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Navigation / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to={`/lectures/${id}`}
            className="text-xs text-text-secondary hover:text-text flex items-center gap-1 font-medium mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Lecture Overview
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-2">
            <Network className="w-6 h-6 text-primary" /> Knowledge Map & Taxonomy
          </h1>
          <p className="text-sm text-text-secondary">
            {lecture?.title ? `Extracted cognitive relationships for "${lecture.title}"` : 'Lecture Knowledge Architecture'}
          </p>
        </div>

        <Link to={`/lectures/${id}/quiz`}>
          <Button className="gap-2">
            <Play className="w-4 h-4" /> Generate Quiz From Concepts
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Hierarchy / Graph Explorer (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 bg-white border border-border">
            <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Concept Nodes (Click to Inspect)
            </h3>

            {/* Visual Node Tree */}
            <div className="space-y-3">
              {/* Root Lecture Node */}
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-center font-bold text-primary text-sm flex items-center justify-center gap-2 shadow-sm">
                <BookOpen className="w-4 h-4" />
                {lecture?.title || 'Root Lecture Curriculum'}
              </div>

              {/* Connecting Tree Line */}
              <div className="w-0.5 h-6 bg-primary/30 mx-auto" />

              {/* Child Concepts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {concepts.map((concept) => {
                  const isSelected = activeConcept?.id === concept.id;
                  return (
                    <div
                      key={concept.id}
                      onClick={() => setSelectedConcept(concept)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                          : 'border-border bg-white hover:border-primary/40 hover:bg-gray-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <h4 className="font-semibold text-sm text-text">{concept.name}</h4>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-text-secondary">
                            {concept.difficulty || 'medium'}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {concept.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-secondary">
                        <span>Importance: {Math.round((concept.importance || 0.8) * 100)}%</span>
                        <ChevronRight className="w-3.5 h-3.5 text-primary" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Selected Concept Deep Dive Drawer/Card (1 Col) */}
        <div>
          {activeConcept ? (
            <Card className="p-5 bg-white border border-border sticky top-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="text-xs capitalize">
                    {activeConcept.difficulty || 'Medium'} Difficulty
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round((activeConcept.importance || 0.8) * 100)}% Importance
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-text mt-2">{activeConcept.name}</h3>
              </div>

              <div>
                <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" /> Definition & Scope
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed bg-gray-50 p-3 rounded-lg border border-border">
                  {activeConcept.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" /> Pedagogical Role
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Extracted by the AI pipeline as a foundational element within this lecture. Question generation algorithms specifically craft multiple-choice and conceptual scenarios grounded in this topic.
                </p>
              </div>

              <div className="pt-3 border-t border-border">
                <Link to={`/lectures/${id}/quiz`}>
                  <Button className="w-full gap-2">
                    <Play className="w-4 h-4" /> Practice This Concept
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-white border border-border text-center text-sm text-text-secondary">
              Select any concept node on the left to view deep insights and relationships.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
