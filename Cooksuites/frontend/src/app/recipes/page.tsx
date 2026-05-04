'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { recipeService, RecipeFilters } from '@/services/recipeService';
import { categoryService, Category } from '@/services/categoryService';
import { Recipe } from '@/store/slices/recipeSlice';
import { Loader2, SearchX, AlertCircle, Plus, LayoutGrid, List, ShoppingCart, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { shoppingListService } from '@/services/shoppingListService';
import { toast } from 'sonner';
import { GenerateListDialog } from '@/components/dashboard/GenerateListDialog';
import { useDispatch } from 'react-redux';
import { removeRecipe } from '@/store/slices/recipeSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const [filters, setFilters] = useState<RecipeFilters>({
    search: '',
    mealType: '',
    difficulty: '',
    category: '',
  });

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Delete state
  const dispatch = useDispatch();
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;
    try {
      setIsDeleting(true);
      await recipeService.deleteRecipe(recipeToDelete);
      dispatch(removeRecipe(recipeToDelete));
      setRecipes(prev => prev.filter(r => r.id !== recipeToDelete));
      toast.success('Recipe deleted successfully');
      setRecipeToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete recipe');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchRecipes = useCallback(async (isLoadMore = false, cursor?: string) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        cursor: isLoadMore ? cursor : undefined,
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
  }, [filters]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleSearch = (search: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setFilters(prev => {
        if (prev.search === search) return prev;
        return { ...prev, search };
      });
    }, 400);
  };

  const handleDifficultyChange = (val: string) => {
    setFilters(prev => {
      const next = val || undefined;
      if (prev.difficulty === next) return prev;
      return { ...prev, difficulty: next };
    });
  };

  const handleCategoryChange = (val: string) => {
    setFilters(prev => {
      const next = val || undefined;
      if (prev.category === next) return prev;
      return { ...prev, category: next };
    });
  };

  const handleMealTypeChange = (val: string) => {
    setFilters(prev => {
      const next = val || undefined;
      if (prev.mealType === next) return prev;
      return { ...prev, mealType: next };
    });
  };

  const handleClearFilters = () => {
    setFilters({ search: '', mealType: '', difficulty: '', category: '' });
  };

  const activeFilterCount = [filters.difficulty, filters.category, filters.mealType]
    .filter(Boolean).length;

  const handleRecipeClick = (id: string) => {
    if (selectionMode) {
      setSelectedRecipeIds(prev =>
        prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
      );
    } else {
      router.push(`/recipes/${id}`);
    }
  };

  const handleConfirmGenerate = async (name: string) => {
    try {
      setIsGenerating(true);
      await shoppingListService.generateShoppingList({ recipeIds: selectedRecipeIds, name });
      toast.success('Shopping list generated!');
      router.push(`/shopping-list`);
    } catch {
      toast.error('Failed to generate list');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header>
        <div className="ml-4 flex-grow max-w-2xl">
          <SearchInput onSearch={handleSearch} placeholder="Search recipes..." />
        </div>
      </Header>

      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        {/* Title & Actions Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2">Recipe Gallery</h1>
            <p className="text-sm text-zinc-500 font-medium">Discover and manage your curated collection of professional recipes.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center border border-zinc-200 rounded-lg p-1 bg-white">
              <button className="p-1.5 rounded bg-zinc-100 text-zinc-900 shadow-sm"><LayoutGrid className="h-4 w-4" /></button>
              <button className="p-1.5 rounded text-zinc-400 hover:text-zinc-600"><List className="h-4 w-4" /></button>
            </div>

            {selectionMode ? (
              <>
                <Button
                  onClick={() => setShowGenerateDialog(true)}
                  disabled={selectedRecipeIds.length === 0 || isGenerating}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-4 h-10 font-medium flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                  {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  Generate List ({selectedRecipeIds.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setSelectionMode(false); setSelectedRecipeIds([]); }}
                  className="rounded-lg px-4 h-10 font-medium text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-sm whitespace-nowrap"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectionMode(true)}
                  className="rounded-lg px-4 h-10 font-medium text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-sm whitespace-nowrap hidden sm:flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Select for List
                </Button>
                <Button
                  onClick={() => router.push('/recipes/create')}
                  className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg px-4 h-10 font-medium flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  Create Recipe
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border border-zinc-100 p-4 rounded-xl shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Difficulty"
              options={[
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Hard', value: 'Hard' },
              ]}
              value={filters.difficulty || ''}
              onChange={handleDifficultyChange}
            />
            <FilterSelect
              label="Meal Type"
              options={[
                { label: 'Breakfast', value: 'Breakfast' },
                { label: 'Lunch', value: 'Lunch' },
                { label: 'Dinner', value: 'Dinner' },
                { label: 'Snack', value: 'Snack' },
                { label: 'Dessert', value: 'Dessert' },
              ]}
              value={filters.mealType || ''}
              onChange={handleMealTypeChange}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear filters
                <span className="ml-1 h-4 w-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">{activeFilterCount}</span>
              </button>
            )}
          </div>
          <div className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
            Showing {recipes.length} recipes
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="relative cursor-pointer group" onClick={() => handleRecipeClick(recipe.id)}>
              <div className={`transition-all duration-300 ${selectionMode && selectedRecipeIds.includes(recipe.id) ? 'ring-2 ring-emerald-500 rounded-2xl scale-[0.98]' : ''}`}>
                <RecipeCard
                  recipe={recipe}
                  onClick={() => { }}
                  onDelete={() => setRecipeToDelete(recipe.id)}
                />
              </div>

              {selectionMode && (
                <div className={`absolute top-4 left-4 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all z-20 shadow-sm ${selectedRecipeIds.includes(recipe.id)
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-white/90 backdrop-blur-md border-zinc-300 text-transparent hover:border-emerald-300'
                  }`}>
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && !recipes.length && (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-100 animate-pulse rounded-2xl border border-zinc-200" />
            ))
          )}
        </div>

        {!loading && recipes.length === 0 && (
          <div className="p-16 text-center border border-dashed border-zinc-200 rounded-2xl text-zinc-500 flex flex-col items-center bg-zinc-50/50">
            <SearchX className="h-10 w-10 mb-3 opacity-40 text-zinc-500" />
            <p className="text-lg font-medium text-zinc-900 mb-1">No recipes found</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}

        {error && (
          <div className="p-12 text-center border border-dashed border-red-200 rounded-2xl text-red-600 flex flex-col items-center bg-red-50/50">
            <AlertCircle className="h-8 w-8 mb-2 opacity-80" />
            <p className="font-medium text-red-900">{error}</p>
            <Button variant="link" onClick={() => fetchRecipes()} className="text-red-600 font-medium hover:text-red-700">Try again</Button>
          </div>
        )}

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <Button
              onClick={() => fetchRecipes(true, nextCursor)}
              disabled={loading}
              variant="outline"
              className="rounded-xl px-8 h-11 font-medium bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 shadow-sm"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Load More Recipes'}
            </Button>
          </div>
        )}
      </main>

      <GenerateListDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onConfirm={handleConfirmGenerate}
        isGenerating={isGenerating}
        selectedCount={selectedRecipeIds.length}
      />

      <Dialog open={!!recipeToDelete} onOpenChange={(open) => !open && setRecipeToDelete(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setRecipeToDelete(null)}
              disabled={isDeleting}
              className="rounded-lg h-10 px-4 text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-lg h-10 px-4 bg-red-600 hover:bg-red-700 shadow-sm text-white"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
