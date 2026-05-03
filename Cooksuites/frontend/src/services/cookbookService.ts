import api from '../lib/api';
import { Cookbook } from '../store/api/cookbookApi';

export const cookbookService = {
  getCookbooks: async () => {
    const response = await api.get<{ success: boolean; data: Cookbook[] }>('/cookbooks');
    return response.data;
  },

  getCookbookById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Cookbook }>(`/cookbooks/${id}`);
    return response.data;
  },

  createCookbook: async (data: Partial<Cookbook>) => {
    const response = await api.post<{ success: boolean; data: Cookbook }>('/cookbooks', data);
    return response.data;
  },

  updateCookbook: async (id: string, data: Partial<Cookbook>) => {
    const response = await api.patch<{ success: boolean; data: Cookbook }>(`/cookbooks/${id}`, data);
    return response.data;
  },

  deleteCookbook: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/cookbooks/${id}`);
    return response.data;
  },

  addRecipeToCookbook: async (cookbookId: string, recipeId: string) => {
    const response = await api.post<{ success: boolean }>(`/cookbooks/${cookbookId}/recipes`, { recipeId });
    return response.data;
  },

  removeRecipeFromCookbook: async (cookbookId: string, recipeId: string) => {
    const response = await api.delete<{ success: boolean }>(`/cookbooks/${cookbookId}/recipes/${recipeId}`);
    return response.data;
  },
};
