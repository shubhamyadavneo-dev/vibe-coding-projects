import api from '../lib/api';
import { ShoppingList } from '../store/api/shoppingListApi';

export const shoppingListService = {
  getShoppingLists: async () => {
    const response = await api.get<{ success: boolean; data: ShoppingList[] }>('/shopping-lists');
    return response.data;
  },

  getShoppingListById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: ShoppingList }>(`/shopping-lists/${id}`);
    return response.data;
  },

  generateShoppingList: async (data: { recipeIds: string[]; name: string }) => {
    const response = await api.post<{ success: boolean; data: ShoppingList }>('/shopping-lists/generate', data);
    return response.data;
  },

  toggleShoppingItem: async (itemId: string) => {
    const response = await api.patch<{ success: boolean }>(`/shopping-lists/items/${itemId}/toggle`);
    return response.data;
  },

  deleteShoppingList: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/shopping-lists/${id}`);
    return response.data;
  },
};
