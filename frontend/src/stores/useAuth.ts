import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, authApi, LoginRequest, RegisterRequest } from '../api/auth';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  getMe: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (data: LoginRequest) => {
        const response = await authApi.login(data);
        set({
          user: response.user,
          token: response.access_token,
          isAuthenticated: true,
        });
      },

      register: async (data: RegisterRequest) => {
        const user = await authApi.register(data);
        // Note: depends on API whether register returns token or just user.
        // Assuming user needs to log in after register, or we might need to adjust based on actual API.
        // If it auto-logs in, we'd set state here. For now we just return the user data.
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      getMe: async () => {
        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

// Subscribe to token changes to update axios client
useAuth.subscribe((state) => {
  if (state.token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
});
