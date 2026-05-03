'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetCookbookQuery, useRemoveRecipeFromCookbookMutation } from '@/store/api/cookbookApi';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, Loader2, Trash2, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { Recipe } from '@/store/slices/recipeSlice';

export default function CookbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cookbookId = params.id as string;

  const { data: cookbookData, isLoading, error } = useGetCookbookQuery(cookbookId);
  const [removeRecipe, { isLoading: isRemoving }] = useRemoveRecipeFromCookbookMutation();

  const cookbook = cookbookData?.data;
  const recipes = cookbook?.recipes?.map((cr: { recipe: Recipe }) => cr.recipe) || [];

  const handleRemoveRecipe = async (recipeId: string) => {
    try {
      await removeRecipe({ cookbookId, recipeId }).unwrap();
      toast.success('Recipe removed from cookbook');
    } catch {
      toast.error('Failed to remove recipe');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center md:ml-64">
        <Loader2 className="h-12 w-12 text-emerald-700 animate-spin" />
      </div>
    );
  }

  if (error || !cookbook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center md:ml-64 space-y-4">
        <div className="bg-red-50 p-6 rounded-full">
          <Book className="h-12 w-12 text-red-300" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Cookbook Not Found</h2>
        <Button onClick={() => router.push('/cookbooks')} variant="outline">Back to Cookbooks</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 md:ml-64 pt-24">
      <div className="max-w-[1440px] mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => router.push('/cookbooks')}
              className="flex items-center text-zinc-500 hover:text-emerald-900 transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Collections
            </button>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-emerald-700 p-3 rounded-2xl">
                  <Book className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-5xl font-black text-emerald-900 tracking-tight">{cookbook.name}</h1>
              </div>
              <p className="text-zinc-500 text-xl font-medium max-w-2xl ml-1">{cookbook.description || 'A beautiful collection of recipes.'}</p>
            </div>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-2xl h-12 px-6 border-zinc-200">
                <LayoutGrid className="mr-2 h-5 w-5" />
                Grid View
             </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h3 className="text-lg font-bold text-zinc-900">{recipes.length} Recipes in this Collection</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Sort by:</span>
              <select className="bg-transparent text-sm font-bold text-zinc-700 focus:outline-none">
                <option>Newest Added</option>
                <option>Alphabetical</option>
              </select>
            </div>
          </div>

          {recipes.length === 0 ? (
            <div className="p-20 text-center border-2 border-dashed border-zinc-200 rounded-[3rem] bg-white/50 flex flex-col items-center">
               <p className="text-zinc-400 mb-6">This cookbook is currently empty.</p>
               <Button onClick={() => router.push('/dashboard')} className="bg-emerald-700 rounded-xl">Explore Recipes</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {recipes.map((recipe: Recipe) => (
                <div key={recipe.id} className="relative group">
                  <RecipeCard recipe={recipe} />
                  <button
                    onClick={() => handleRemoveRecipe(recipe.id)}
                    disabled={isRemoving}
                    className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg active:scale-95 z-20"
                    title="Remove from cookbook"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
