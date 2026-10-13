import { apiClient } from './client';
import { ConceptResponse } from './concepts';

export interface Lecture {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  source_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  word_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SectionResponse {
  id: number;
  title: string;
  content: string;
  order_index: number;
}

export interface LectureDetail extends Lecture {
  transcript?: string;
  sections: SectionResponse[];
  concepts: ConceptResponse[];
  quiz_count: number;
}

export interface LectureListResponse {
  lectures: Lecture[];
  total: number;
}

export interface CreateLecturePayload {
  title: string;
  source_type: string;
  content?: string;
  file?: File;
}

export const lecturesApi = {
  list: async (): Promise<LectureListResponse> => {
    const { data } = await apiClient.get('/lectures');
    return data;
  },
  get: async (id: number | string): Promise<LectureDetail> => {
    const { data } = await apiClient.get(`/lectures/${id}`);
    return data;
  },
  create: async (payload: CreateLecturePayload): Promise<Lecture> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('source_type', payload.source_type);
    if (payload.file) {
      formData.append('file', payload.file);
    }
    if (payload.content) {
      formData.append('content', payload.content);
    }
    const { data } = await apiClient.post('/lectures', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/lectures/${id}`);
  },
  process: async (id: number | string): Promise<void> => {
    await apiClient.post(`/lectures/${id}/process`);
  },
  getStatus: async (id: number | string): Promise<{ status: string }> => {
    const { data } = await apiClient.get(`/lectures/${id}/status`);
    return data;
  }
};
