import api from '../lib/api';
import { Recipe } from '../store/slices/recipeSlice';

export interface RecipeFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  mealType?: string;
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    pagination: {
      hasMore: boolean;
      nextCursor?: string;
    };
  };
}

export const recipeService = {
  getRecipes: async (params: RecipeFilters) => {
    // Map search to q for backend compatibility
    const { search, ...rest } = params;
    const response = await api.get<PaginatedResponse<Recipe>>('/recipes', {
      params: { q: search, ...rest },
    });
    return response.data;
  },

  getRecipeById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Recipe }>(`/recipes/${id}`);
    return response.data;
  },

  createRecipe: async (data: FormData) => {
    const response = await api.post<{ success: boolean; data: Recipe }>('/recipes', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRecipe: async (id: string, data: FormData) => {
    const response = await api.put<{ success: boolean; data: Recipe }>(`/recipes/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteRecipe: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/recipes/${id}`);
    return response.data;
  },
};
