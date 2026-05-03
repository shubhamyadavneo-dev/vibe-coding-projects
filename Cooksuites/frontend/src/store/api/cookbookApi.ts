import { apiSlice } from './apiSlice';
import { Recipe } from '../slices/recipeSlice';

export interface Cookbook {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    recipes: number;
  };
  recipes?: { recipe: Recipe }[];
}

export const cookbookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCookbooks: builder.query<{ success: boolean; data: Cookbook[] }, void>({
      query: () => '/cookbooks',
      providesTags: ['Cookbook'],
    }),
    getCookbook: builder.query<{ success: boolean; data: Cookbook }, string>({
      query: (id) => `/cookbooks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Cookbook', id }],
    }),
    createCookbook: builder.mutation<{ success: boolean; data: Cookbook }, Partial<Cookbook>>({
      query: (body) => ({
        url: '/cookbooks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cookbook'],
    }),
    updateCookbook: builder.mutation<{ success: boolean; data: Cookbook }, { id: string; body: Partial<Cookbook> }>({
      query: ({ id, body }) => ({
        url: `/cookbooks/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Cookbook', { type: 'Cookbook', id }],
    }),
    deleteCookbook: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/cookbooks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cookbook'],
    }),
    addRecipeToCookbook: builder.mutation<{ success: boolean }, { cookbookId: string; recipeId: string }>({
      query: ({ cookbookId, recipeId }) => ({
        url: `/cookbooks/${cookbookId}/recipes`,
        method: 'POST',
        body: { recipeId },
      }),
      invalidatesTags: (result, error, { cookbookId }) => [{ type: 'Cookbook', id: cookbookId }],
    }),
    removeRecipeFromCookbook: builder.mutation<{ success: boolean }, { cookbookId: string; recipeId: string }>({
      query: ({ cookbookId, recipeId }) => ({
        url: `/cookbooks/${cookbookId}/recipes/${recipeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { cookbookId }) => [{ type: 'Cookbook', id: cookbookId }],
    }),
  }),
});

export const {
  useGetCookbooksQuery,
  useGetCookbookQuery,
  useCreateCookbookMutation,
  useUpdateCookbookMutation,
  useDeleteCookbookMutation,
  useAddRecipeToCookbookMutation,
  useRemoveRecipeFromCookbookMutation,
} = cookbookApi;
