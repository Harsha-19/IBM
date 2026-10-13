import { apiClient } from './client';

export interface QuestionOption {
  id: number;
  option_text: string;
  is_correct?: boolean; // not shown to students
  order_index: number;
}

export interface Question {
  id: number;
  lecture_id: number;
  concept_id: number;
  question_text: string;
  question_type: string;
  difficulty: number;
  explanation?: string;
  status: string;
  options: QuestionOption[];
  created_at: string;
}

export interface QuestionListResponse {
  questions: Question[];
  total: number;
}

export interface ValidationResult {
  id: number;
  question_id: number;
  grounding_score: number;
  correctness_score: number;
  clarity_score: number;
  difficulty_score: number;
  distractor_score: number;
  overall_score: number;
  validation_status: string;
  feedback: string;
  created_at: string;
}

export const questionsApi = {
  getByLecture: async (lectureId: number | string): Promise<QuestionListResponse> => {
    const { data } = await apiClient.get(`/questions/${lectureId}/questions`);
    return data;
  },
  generate: async (lectureId: number | string): Promise<void> => {
    await apiClient.post(`/questions/${lectureId}/generate`);
  },
  performAction: async (questionId: number | string, action: string): Promise<void> => {
    await apiClient.post(`/questions/${questionId}/action`, null, { params: { action } });
  },
  getValidation: async (questionId: number | string): Promise<ValidationResult> => {
    const { data } = await apiClient.get(`/questions/${questionId}/validation`);
    return data;
  }
};
