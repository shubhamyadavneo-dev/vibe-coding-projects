import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Recipe {
  id: string;
  title: string;
  ingredients: unknown;
  instructions: string;
  cookingTimeMinutes: number;
  difficulty: string;
  images?: { url: string }[];
  category?: { name: string };
  user?: { email: string };
  cuisine?: string
  mealType?: string;
  servings: number;
}

export interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  loading: boolean;
  hasMore: boolean;
  nextCursor?: string;
}

const initialState: RecipeState = {
  recipes: [],
  currentRecipe: null,
  loading: false,
  hasMore: true,
};

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setRecipes: (state, action: PayloadAction<{ data: Recipe[], hasMore: boolean, nextCursor?: string }>) => {
      state.recipes = action.payload.data;
      state.hasMore = action.payload.hasMore;
      state.nextCursor = action.payload.nextCursor;
    },
    addRecipes: (state, action: PayloadAction<{ data: Recipe[], hasMore: boolean, nextCursor?: string }>) => {
      state.recipes = [...state.recipes, ...action.payload.data];
      state.hasMore = action.payload.hasMore;
      state.nextCursor = action.payload.nextCursor;
    },
    setCurrentRecipe: (state, action: PayloadAction<Recipe | null>) => {
      state.currentRecipe = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipes.unshift(action.payload);
    },
    updateRecipeInList: (state, action: PayloadAction<Recipe>) => {
      const index = state.recipes.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.recipes[index] = action.payload;
      }
      if (state.currentRecipe?.id === action.payload.id) {
        state.currentRecipe = action.payload;
      }
    },
    removeRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(r => r.id !== action.payload);
    }
  },
});

export const { setRecipes, addRecipes, setCurrentRecipe, setLoading, addRecipe, updateRecipeInList, removeRecipe } = recipeSlice.actions;
export default recipeSlice.reducer;
