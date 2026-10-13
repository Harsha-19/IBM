import { apiClient } from './client';

export interface DashboardStats {
  total_lectures: number;
  total_quizzes_taken: number;
  average_score: number;
  concepts_mastered: number;
  total_concepts: number;
  weak_concepts_count: number;
  learning_streak: number;
  total_questions_answered: number;
}

export interface ScoreTrendPoint {
  date: string;
  score: number;
}

export interface ConceptMastery {
  concept_id: number;
  concept_name: string;
  mastery_score: number;
  attempt_count: number;
}

export interface RecentActivity {
  type: string;
  title: string;
  description: string;
  date: string;
  score?: number;
}

export interface RecommendationItem {
  id: number;
  concept_id: number;
  concept_name: string;
  recommendation_type: string;
  reason: string;
  priority: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  score_trend: ScoreTrendPoint[];
  concept_mastery: ConceptMastery[];
  recent_activity: RecentActivity[];
  recommendations: RecommendationItem[];
}

export interface WeakConcept {
  concept_id: number;
  concept_name: string;
  mastery_score: number;
  attempt_count: number;
  correct_count: number;
  incorrect_count: number;
  recommendation: string;
}

export interface ProgressData {
  learning_progress: number; // e.g., percentage
  weak_concepts: WeakConcept[];
  mastery_distribution: Record<string, number>;
}

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const { data } = await apiClient.get('/analytics/dashboard');
    return data;
  },
  getProgress: async (): Promise<ProgressData> => {
    const { data } = await apiClient.get('/analytics/progress');
    return data;
  },
  getLectureAnalytics: async (lectureId: number | string): Promise<any> => {
    const { data } = await apiClient.get(`/analytics/lectures/${lectureId}`);
    return data;
  }
};
