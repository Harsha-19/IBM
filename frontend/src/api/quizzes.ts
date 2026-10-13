import { apiClient } from './client';

export interface QuizCreateRequest {
  lecture_id: number;
  num_questions?: number;
  difficulty?: number;
  is_adaptive?: boolean;
  question_types?: string[];
  concept_ids?: number[];
  time_limit_minutes?: number;
}

export interface Quiz {
  id: number;
  lecture_id: number;
  user_id: number;
  title: string;
  status: string;
  num_questions: number;
  difficulty: number;
  is_adaptive: boolean;
  created_at: string;
}

export interface QuizQuestionOption {
  id: number;
  option_text: string;
  order_index: number;
}

export interface QuizQuestionData {
  id: number;
  question_text: string;
  question_type: string;
  difficulty: number;
  options: QuizQuestionOption[];
}

export interface QuizQuestion {
  id: number;
  order_index: number;
  question: QuizQuestionData;
}

export interface AttemptStart {
  attempt_id: number;
  quiz_id: number;
  started_at: string;
  questions: QuizQuestion[];
}

export interface AnswerSubmission {
  question_id: number;
  selected_option_id: number;
  time_taken_seconds: number;
}

export interface QuizSubmission {
  answers: AnswerSubmission[];
}

export interface AnswerResult {
  question_id: number;
  question_text: string;
  selected_option_id: number;
  correct_option_id: number;
  is_correct: boolean;
  explanation: string;
  time_taken_seconds: number;
}

export interface ConceptPerformance {
  concept_id: number;
  concept_name: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface AttemptResult {
  attempt_id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
  answers: AnswerResult[];
  concept_performance: ConceptPerformance[];
}

export const quizzesApi = {
  create: async (data: QuizCreateRequest): Promise<Quiz> => {
    const { data: res } = await apiClient.post('/quizzes', data);
    return res;
  },
  getById: async (quizId: number | string): Promise<Quiz> => {
    const { data } = await apiClient.get(`/quizzes/${quizId}`);
    return data;
  },
  list: async (lectureId?: number | string): Promise<Quiz[]> => {
    const { data } = await apiClient.get('/quizzes', { params: { lecture_id: lectureId } });
    return data;
  },
  startAttempt: async (quizId: number | string): Promise<AttemptStart> => {
    const { data } = await apiClient.post(`/quizzes/${quizId}/attempts`);
    return data;
  },
  submitAttempt: async (attemptId: number | string, submission: QuizSubmission): Promise<AttemptResult> => {
    const { data } = await apiClient.post(`/quizzes/attempts/${attemptId}/submit`, submission);
    return data;
  },
  getAttemptResult: async (attemptId: number | string): Promise<AttemptResult> => {
    const { data } = await apiClient.get(`/quizzes/attempts/${attemptId}/result`);
    return data;
  }
};
