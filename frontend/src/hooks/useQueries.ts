import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lecturesApi, CreateLecturePayload } from '../api/lectures';
import { conceptsApi } from '../api/concepts';
import { questionsApi } from '../api/questions';
import { quizzesApi, QuizCreateRequest, QuizSubmission } from '../api/quizzes';
import { analyticsApi } from '../api/analytics';
import { validationApi } from '../api/validation';
import { recommendationsApi } from '../api/recommendations';

// --- Dashboard & Analytics ---
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsApi.getDashboard(),
    staleTime: 30000,
  });
};

export const useProgress = () => {
  return useQuery({
    queryKey: ['progress'],
    queryFn: () => analyticsApi.getProgress(),
    staleTime: 30000,
  });
};

// --- Lectures ---
export const useLectures = () => {
  return useQuery({
    queryKey: ['lectures'],
    queryFn: () => lecturesApi.list(),
    staleTime: 30000,
  });
};

export const useLecture = (id?: number | string) => {
  return useQuery({
    queryKey: ['lecture', id],
    queryFn: () => lecturesApi.get(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useCreateLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLecturePayload) => lecturesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
    },
  });
};

export const useDeleteLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => lecturesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
    },
  });
};

export const useProcessLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => lecturesApi.process(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lecture', variables] });
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
    },
  });
};

// --- Concepts ---
export const useConcepts = (lectureId?: number | string) => {
  return useQuery({
    queryKey: ['concepts', lectureId],
    queryFn: () => conceptsApi.getByLecture(lectureId!),
    enabled: !!lectureId,
    staleTime: 30000,
  });
};

export const useConceptMap = (lectureId?: number | string) => {
  return useQuery({
    queryKey: ['conceptMap', lectureId],
    queryFn: () => conceptsApi.getConceptMap(lectureId!),
    enabled: !!lectureId,
    staleTime: 30000,
  });
};

export const useExtractConcepts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lectureId: number | string) => conceptsApi.extractConcepts(lectureId),
    onSuccess: (_, lectureId) => {
      queryClient.invalidateQueries({ queryKey: ['concepts', lectureId] });
      queryClient.invalidateQueries({ queryKey: ['conceptMap', lectureId] });
      queryClient.invalidateQueries({ queryKey: ['lecture', lectureId] });
    },
  });
};

// --- Questions ---
export const useQuestions = (lectureId?: number | string) => {
  return useQuery({
    queryKey: ['questions', lectureId],
    queryFn: () => questionsApi.getByLecture(lectureId!),
    enabled: !!lectureId,
    staleTime: 30000,
  });
};

export const useGenerateQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lectureId: number | string) => questionsApi.generate(lectureId),
    onSuccess: (_, lectureId) => {
      queryClient.invalidateQueries({ queryKey: ['questions', lectureId] });
      queryClient.invalidateQueries({ queryKey: ['validationQuestions'] });
    },
  });
};

// --- Quizzes ---
export const useQuizzes = (lectureId?: number | string) => {
  return useQuery({
    queryKey: ['quizzes', lectureId],
    queryFn: () => quizzesApi.list(lectureId),
    staleTime: 30000,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuizCreateRequest) => quizzesApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.lecture_id] });
      queryClient.invalidateQueries({ queryKey: ['quizzes', undefined] });
    },
  });
};

export const useStartAttempt = () => {
  return useMutation({
    mutationFn: (quizId: number | string) => quizzesApi.startAttempt(quizId),
  });
};

export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, submission }: { attemptId: number | string, submission: QuizSubmission }) => 
      quizzesApi.submitAttempt(attemptId, submission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
};

export const useAttemptResult = (attemptId?: number | string) => {
  return useQuery({
    queryKey: ['attemptResult', attemptId],
    queryFn: () => quizzesApi.getAttemptResult(attemptId!),
    enabled: !!attemptId,
    staleTime: 30000,
  });
};

// --- Recommendations ---
export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationsApi.getRecommendations(),
    staleTime: 30000,
  });
};

export const useGenerateRecommendations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => recommendationsApi.generateRecommendations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
};

// --- Validation ---
export const useValidationStats = () => {
  return useQuery({
    queryKey: ['validationStats'],
    queryFn: () => validationApi.getStats(),
    staleTime: 30000,
  });
};

export const useValidationQuestions = () => {
  return useQuery({
    queryKey: ['validationQuestions'],
    queryFn: () => validationApi.getQuestionsForReview(),
    staleTime: 30000,
  });
};

export const useTriggerValidation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lectureId: number | string) => validationApi.triggerValidation(lectureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validationStats'] });
      queryClient.invalidateQueries({ queryKey: ['validationQuestions'] });
    },
  });
};

export const useApproveQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: number | string) => validationApi.approveQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validationStats'] });
      queryClient.invalidateQueries({ queryKey: ['validationQuestions'] });
    },
  });
};

export const useRejectQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: number | string) => validationApi.rejectQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validationStats'] });
      queryClient.invalidateQueries({ queryKey: ['validationQuestions'] });
    },
  });
};
