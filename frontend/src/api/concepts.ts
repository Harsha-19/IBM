import { apiClient } from './client';

export interface ConceptResponse {
  id: number;
  lecture_id: number;
  name: string;
  description: string;
  importance: number;
  difficulty: number;
  parent_concept_id?: number;
}

export interface ConceptListResponse {
  concepts: ConceptResponse[];
  total: number;
}

export interface ConceptMapNode {
  id: number;
  name: string;
  importance: number;
  difficulty: number;
  mastery_score?: number;
  children: ConceptMapNode[];
}

export const conceptsApi = {
  getByLecture: async (lectureId: number | string): Promise<ConceptListResponse> => {
    const { data } = await apiClient.get(`/concepts/${lectureId}/concepts`);
    return data;
  },
  getConceptMap: async (lectureId: number | string): Promise<ConceptMapNode> => {
    const { data } = await apiClient.get(`/concepts/${lectureId}/concept-map`);
    return data;
  },
  extractConcepts: async (lectureId: number | string): Promise<void> => {
    await apiClient.post(`/concepts/${lectureId}/extract`);
  }
};
