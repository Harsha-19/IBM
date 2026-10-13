import { apiClient } from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const { data: res } = await apiClient.post('/auth/login', data);
    return res;
  },
  register: async (data: RegisterRequest): Promise<User> => {
    const { data: res } = await apiClient.post('/auth/register', data);
    return res;
  },
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
