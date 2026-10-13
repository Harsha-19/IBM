import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useDashboard } from '@/hooks/useQueries';
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  Flame,
  Award,
  AlertTriangle,
  ArrowRight,
  Plus,
  Play,
  Lightbulb,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-text-secondary text-sm">Loading your dashboard insights...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="Could not retrieve your learning progress from the server."
        onRetry={() => refetch()}
      />
    );
  }

  const { stats, score_trend, concept_mastery, recent_activity, recommendations } = data;

  const chartData = (score_trend || []).map((pt, idx) => ({
    name: `Quiz ${idx + 1}`,
    score: pt.score,
    date: pt.date ? new Date(pt.date).toLocaleDateString() : '',
  }));

  const masteryData = (concept_mastery || []).slice(0, 6).map((cm) => ({
    name: cm.concept_name.length > 14 ? cm.concept_name.substring(0, 14) + '...' : cm.concept_name,
    mastery: cm.mastery_score,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Learning Overview</h1>
          <p className="text-text-secondary mt-1">
            Track your lecture comprehension, AI-validated quiz results, and adaptive progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/lectures/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload Lecture
            </Button>
          </Link>
          <Link to="/lectures">
            <Button variant="outline" className="flex items-center gap-2">
              Browse Lectures
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-white border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Lectures</span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">{stats.total_lectures}</div>
          <div className="text-xs text-text-secondary mt-1">Processed</div>
        </Card>

        <Card className="p-4 bg-white border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Quizzes Taken</span>
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">{stats.total_quizzes_taken}</div>
          <div className="text-xs text-text-secondary mt-1">Completed</div>
        </Card>

        <Card className="p-4 bg-white border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Average Score</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">{stats.average_score}%</div>
          <div className="text-xs text-text-secondary mt-1">Across all quizzes</div>
        </Card>

        <Card className="p-4 bg-white border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">{stats.learning_streak} Days</div>
          <div className="text-xs text-text-secondary mt-1">Active practice</div>
        </Card>

        <Card className="p-4 bg-white border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Mastered</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">{stats.concepts_mastered}</div>
          <div className="text-xs text-text-secondary mt-1">Of {stats.total_concepts} concepts</div>
        </Card>

        <Card className="p-4 bg-white border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Weak Topics</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{stats.weak_concepts_count}</div>
          <div className="text-xs text-text-secondary mt-1">Need revision</div>
        </Card>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Chart */}
        <Card className="p-5 bg-white border border-border">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-semibold text-text flex items-center justify-between">
              <span>Quiz Performance Trend</span>
              <span className="text-xs font-normal text-text-secondary">Historical Scores</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    formatter={(val: any) => [`${val}%`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    dot={{ fill: '#4F46E5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-secondary">
                Take quizzes to see your score trajectory over time.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Concept Mastery Bar Chart */}
        <Card className="p-5 bg-white border border-border">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-semibold text-text flex items-center justify-between">
              <span>Concept Mastery Levels</span>
              <span className="text-xs font-normal text-text-secondary">Top Concepts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64">
            {masteryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={masteryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    formatter={(val: any) => [`${val}%`, 'Mastery']}
                  />
                  <Bar dataKey="mastery" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-secondary">
                Complete quizzes to measure mastery across lecture topics.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adaptive Recommendations (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" /> Adaptive Recommendations
            </h2>
            <Link to="/recommendations" className="text-xs text-primary hover:underline font-medium">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations && recommendations.length > 0 ? (
              recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-lg bg-white border border-border flex items-start justify-between gap-4 transition hover:border-primary/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-text">{rec.concept_name}</span>
                      <Badge
                        variant={
                          rec.recommendation_type === 'review'
                            ? 'warning'
                            : rec.recommendation_type === 'practice'
                            ? 'default'
                            : 'success'
                        }
                      >
                        {rec.recommendation_type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-text-secondary">Priority {rec.priority}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{rec.reason}</p>
                  </div>
                  <Link to="/progress">
                    <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1">
                      Review <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 bg-white border border-border rounded-lg text-center text-sm text-text-secondary">
                No weak concepts detected! Keep testing your understanding.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Recent Activity</h2>
          </div>

          <Card className="p-4 bg-white border border-border">
            <div className="space-y-4">
              {recent_activity && recent_activity.length > 0 ? (
                recent_activity.map((act, index) => (
                  <div key={index} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-text">{act.title}</p>
                      <p className="text-text-secondary mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-text-secondary/70">
                        {act.date ? new Date(act.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-secondary text-center py-4">No recent activity found.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
