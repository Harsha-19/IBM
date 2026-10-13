import { apiClient } from './client';

export interface Recommendation {
  id: number;
  concept_id: number;
  concept_name: string;
  recommendation_type: string;
  reason: string;
  priority: number;
  is_completed: boolean;
  created_at: string;
}

export const recommendationsApi = {
  getRecommendations: async (): Promise<Recommendation[]> => {
    const { data } = await apiClient.get('/recommendations');
    return data;
  },
  completeRecommendation: async (id: number | string): Promise<void> => {
    await apiClient.post(`/recommendations/${id}/complete`);
  },
  generateRecommendations: async (): Promise<Recommendation[]> => {
    const { data } = await apiClient.post('/recommendations/generate');
    return data;
  }
};
