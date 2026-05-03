import { apiSlice } from './apiSlice';
import { Recipe } from '../slices/recipeSlice';

export const recipeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecipes: builder.query<{ success: boolean; data: Recipe[]; hasMore: boolean; nextCursor?: string }, Record<string, unknown>>({
      query: (params) => ({
        url: '/recipes',
        params,
      }),
      // Only cache based on search/filter params, excluding cursor
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const filters = { ...queryArgs } as Record<string, unknown>;
        delete filters.cursor;
        return `${endpointName}-${JSON.stringify(filters)}`;
      },
      // Always merge incoming data to the existing cache
      merge: (currentCache, newItems, { arg }) => {
        if (!arg.cursor) {
          return newItems;
        }
        currentCache.data.push(...newItems.data);
        currentCache.hasMore = newItems.hasMore;
        currentCache.nextCursor = newItems.nextCursor;
      },
      // Refetch when filters change
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Recipe' as const, id })),
              { type: 'Recipe', id: 'LIST' },
            ]
          : [{ type: 'Recipe', id: 'LIST' }],
    }),
    getRecipeById: builder.query<{ success: boolean; data: Recipe }, string>({
      query: (id) => `/recipes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Recipe', id }],
    }),
    createRecipe: builder.mutation<{ success: boolean; data: Recipe }, FormData>({
      query: (formData) => ({
        url: '/recipes',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Recipe', id: 'LIST' }],
    }),
  }),
});

export const { useGetRecipesQuery, useGetRecipeByIdQuery, useCreateRecipeMutation } = recipeApi;
