import api from '../lib/api';

export interface Category {
  id: string;
  name: string;
}

export const categoryService = {
  getCategories: async () => {
    const response = await api.get<{ success: boolean; data: Category[] }>('/categories');
    return response.data;
  },
};
