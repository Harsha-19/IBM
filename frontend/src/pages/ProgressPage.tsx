import { useProgress } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Link } from 'react-router-dom';
import {
  Activity,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Lightbulb,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export function ProgressPage() {
  const { data, isLoading, error, refetch } = useProgress();

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Loading learning mastery data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load progress"
        message="Could not retrieve your learning progress records."
        onRetry={() => refetch()}
      />
    );
  }

  const { learning_progress, weak_concepts, mastery_distribution } = data;

  const pieData = [
    { name: 'Mastered (80-100%)', value: mastery_distribution?.mastered || 0, color: '#10B981' },
    { name: 'Proficient (60-79%)', value: mastery_distribution?.proficient || 0, color: '#4F46E5' },
    { name: 'Developing (40-59%)', value: mastery_distribution?.developing || 0, color: '#F59E0B' },
    { name: 'Weak (<40%)', value: mastery_distribution?.weak || 0, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" /> Learning Progress & Mastery
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Detailed cognitive retention tracking across all extracted lecture concepts.
        </p>
      </div>

      {/* Distribution Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 bg-white border border-border md:col-span-2">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base font-semibold text-text">
              Mastery Tier Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200">
                <span className="text-xs font-semibold text-green-800">Mastered</span>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {mastery_distribution?.mastered || 0}
                </p>
                <span className="text-[11px] text-green-700">80% - 100%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-xs font-semibold text-indigo-800">Proficient</span>
                <p className="text-2xl font-bold text-indigo-900 mt-1">
                  {mastery_distribution?.proficient || 0}
                </p>
                <span className="text-[11px] text-indigo-700">60% - 79%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-semibold text-amber-800">Developing</span>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {mastery_distribution?.developing || 0}
                </p>
                <span className="text-[11px] text-amber-700">40% - 59%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
                <span className="text-xs font-semibold text-red-800">Needs Work</span>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {mastery_distribution?.weak || 0}
                </p>
                <span className="text-[11px] text-red-700">Below 40%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="p-5 bg-white border border-border flex flex-col justify-between">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base font-semibold text-text">Proportion</CardTitle>
          </CardHeader>
          <div className="h-44">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any, name: any) => [`${val} concepts`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-secondary">
                No quiz attempts yet.
              </div>
            )}
          </div>
          <div className="text-center text-xs text-text-secondary">
            Mastery estimated via accuracy & difficulty
          </div>
        </Card>
      </div>

      {/* Weak Topics Priority Section */}
      {weak_concepts && weak_concepts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Focus Areas (Weak Concepts)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weak_concepts.map((wc) => (
              <Card key={wc.concept_id} className="p-5 bg-white border border-red-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-text text-base">{wc.concept_name}</h3>
                  <Badge variant="error">{Math.round(wc.mastery_score)}% Mastery</Badge>
                </div>

                <div className="text-xs text-text-secondary space-y-1">
                  <div className="flex justify-between">
                    <span>Quiz Questions Attempted:</span>
                    <strong className="text-text">{wc.attempt_count}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Correct vs Incorrect:</span>
                    <strong className="text-text">
                      {wc.correct_count} correct / {wc.incorrect_count} missed
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 text-xs text-red-900 leading-relaxed flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{wc.recommendation}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Concepts Mastery Table */}
      <Card className="p-6 bg-white border border-border space-y-4">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> Comprehensive Concept Performance
        </h2>

        {learning_progress && (learning_progress as any).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-secondary font-semibold uppercase">
                  <th className="pb-3">Concept Name</th>
                  <th className="pb-3">Mastery Level</th>
                  <th className="pb-3 text-center">Attempts</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(learning_progress as any).map((item: any) => (
                  <tr key={item.concept_id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 font-medium text-text">{item.concept_name}</td>
                    <td className="py-3.5 w-1/3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>{Math.round(item.mastery_score)}%</span>
                        </div>
                        <ProgressBar
                          value={item.mastery_score}
                          className={`h-1.5 ${
                            item.mastery_score >= 80
                              ? 'bg-green-100'
                              : item.mastery_score >= 60
                              ? 'bg-indigo-100'
                              : 'bg-red-100'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 text-center text-xs text-text font-semibold">
                      {item.attempt_count}
                    </td>
                    <td className="py-3.5 text-right">
                      {item.mastery_score >= 80 ? (
                        <Badge variant="success">Mastered</Badge>
                      ) : item.mastery_score >= 60 ? (
                        <Badge variant="default">Proficient</Badge>
                      ) : (
                        <Badge variant="error">Developing</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-text-secondary">
            No concept attempts recorded yet. Take your first lecture quiz to begin tracking.
          </div>
        )}
      </Card>
    </div>
  );
}
