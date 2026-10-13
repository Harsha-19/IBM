import { apiClient } from './client';
import { Question, ValidationResult } from './questions';

export interface ValidationStats {
  total_generated: number;
  total_approved: number;
  total_rejected: number;
  total_review: number;
  average_score: number;
  grounding_failure_rate: number;
  correctness_failure_rate: number;
}

export interface QuestionWithValidation extends Question {
  validation_results: ValidationResult[];
}

export const validationApi = {
  triggerValidation: async (lectureId: number | string): Promise<void> => {
    await apiClient.post(`/validation/${lectureId}/validate`);
  },
  getStats: async (): Promise<ValidationStats> => {
    const { data } = await apiClient.get('/validation/stats');
    return data;
  },
  getQuestionsForReview: async (): Promise<QuestionWithValidation[]> => {
    const { data } = await apiClient.get('/validation/questions');
    return data;
  },
  approveQuestion: async (questionId: number | string): Promise<void> => {
    await apiClient.post(`/validation/questions/${questionId}/approve`);
  },
  rejectQuestion: async (questionId: number | string): Promise<void> => {
    await apiClient.post(`/validation/questions/${questionId}/reject`);
  },
  regenerateQuestion: async (questionId: number | string): Promise<void> => {
    await apiClient.post(`/validation/questions/${questionId}/regenerate`);
  }
};
