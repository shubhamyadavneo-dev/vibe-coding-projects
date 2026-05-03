import api from '../lib/api';
import { User } from '../store/slices/authSlice';

export const authService = {
  login: async (credentials: Record<string, unknown>) => {
    const response = await api.post<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: Record<string, unknown>) => {
    const response = await api.post<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data;
  },
};
