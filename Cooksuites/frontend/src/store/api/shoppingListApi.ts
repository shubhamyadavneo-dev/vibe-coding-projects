import { apiSlice } from './apiSlice';

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items?: ShoppingListItem[];
  _count?: {
    items: number;
  };
}

export const shoppingListApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShoppingLists: builder.query<{ success: boolean; data: ShoppingList[] }, void>({
      query: () => '/shopping-lists',
      providesTags: ['ShoppingList'],
    }),
    getShoppingList: builder.query<{ success: boolean; data: ShoppingList }, string>({
      query: (id) => `/shopping-lists/${id}`,
      providesTags: (result, error, id) => [{ type: 'ShoppingList', id }],
    }),
    generateShoppingList: builder.mutation<{ success: boolean; data: ShoppingList }, { recipeIds: string[]; name: string }>({
      query: (body) => ({
        url: '/shopping-lists/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ShoppingList'],
    }),
    toggleShoppingItem: builder.mutation<{ success: boolean }, string>({
      query: (itemId) => ({
        url: `/shopping-lists/items/${itemId}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: () => ['ShoppingList'],
    }),
    deleteShoppingList: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/shopping-lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShoppingList'],
    }),
  }),
});

export const {
  useGetShoppingListsQuery,
  useGetShoppingListQuery,
  useGenerateShoppingListMutation,
  useToggleShoppingItemMutation,
  useDeleteShoppingListMutation,
} = shoppingListApi;
