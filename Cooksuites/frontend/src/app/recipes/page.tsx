'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { ListingHeader } from '@/components/shared/ListingHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { recipeService, RecipeFilters } from '@/services/recipeService';
import { categoryService, Category } from '@/services/categoryService';
import { Recipe } from '@/store/slices/recipeSlice';
import { Loader2, SearchX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const [filters, setFilters] = useState<RecipeFilters>({
    search: '',
    mealType: '',
    difficulty: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchRecipes = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        cursor: isLoadMore ? nextCursor : undefined,
        limit: 12,
      };
      const response = await recipeService.getRecipes(params);

      if (isLoadMore) {
        setRecipes(prev => [...prev, ...response.data]);
      } else {
        setRecipes(response.data);
      }

      setHasMore(response.meta.pagination.hasMore);
      setNextCursor(response.meta.pagination.nextCursor);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, nextCursor]);

  useEffect(() => {
    fetchRecipes();
  }, [filters, fetchRecipes]);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />

      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <ListingHeader
          title="Recipes"
          onAddClick={() => router.push('/recipes/create')}
          addButtonLabel="Create Recipe"
        >
          <SearchInput onSearch={handleSearch} placeholder="Search recipes..." />
          <FilterSelect
            label="Category"
            options={categories.map(c => ({ label: c.name, value: c.id }))}
            value={filters?.category || ''}
            onChange={(val) => setFilters(prev => ({ ...prev, category: val || undefined }))}
          />
          <FilterSelect
            label="Meal Type"
            options={[
              { label: 'Breakfast', value: 'Breakfast' },
              { label: 'Lunch', value: 'Lunch' },
              { label: 'Dinner', value: 'Dinner' },
              { label: 'Snack', value: 'Snack' },
              { label: 'Dessert', value: 'Dessert' }
            ]}
            value={filters.mealType || ''}
            onChange={(val) => setFilters(prev => ({ ...prev, mealType: val || undefined }))}
          />
          <FilterSelect
            label="Difficulty"
            options={[
              { label: 'Easy', value: 'Easy' },
              { label: 'Medium', value: 'Medium' },
              { label: 'Hard', value: 'Hard' }
            ]}
            value={filters.difficulty || ''}
            onChange={(val) => setFilters(prev => ({ ...prev, difficulty: val || undefined }))}
          />
        </ListingHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}

          {loading && !recipes.length && (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-100 animate-pulse rounded-2xl" />
            ))
          )}
        </div>

        {!loading && recipes.length === 0 && (
          <div className="p-24 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 flex flex-col items-center">
            <SearchX className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-xl font-bold text-emerald-900 mb-1">No recipes found</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}

        {error && (
          <div className="p-12 text-center border-2 border-dashed border-red-100 rounded-[3rem] text-red-500 flex flex-col items-center">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="font-bold">{error}</p>
            <Button variant="link" onClick={() => fetchRecipes()} className="text-red-500 underline">Try again</Button>
          </div>
        )}

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <Button
              onClick={() => fetchRecipes(true)}
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl px-12 py-6 h-auto font-bold text-lg shadow-lg shadow-emerald-100"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Load More Recipes'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
