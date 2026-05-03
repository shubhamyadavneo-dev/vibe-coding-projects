'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Link from 'next/link';

import { recipeService } from '@/services/recipeService';
import { shoppingListService } from '@/services/shoppingListService';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/store/slices/recipeSlice';
import { 
  ShoppingCart, 
  Check, 
  Loader2, 
  Utensils, 
  Plus, 
  ArrowRight, 
  AlertCircle, 
  SearchX, 
  MoreHorizontal, 
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

import { GenerateListDialog } from '@/components/dashboard/GenerateListDialog';
import Image from 'next/image';

export default function DashboardPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchRecentRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await recipeService.getRecipes({ limit: 6 });
      setRecipes(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentRecipes();
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router, fetchRecentRecipes]);

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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />

      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <section className="md:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black text-emerald-900 tracking-tight mb-2">Welcome back, Chef</h2>
                <p className="text-sm font-medium text-zinc-500">You have {recipes.length} recipes in your collection.</p>
              </div>
              <div className="flex gap-4">
                {selectionMode ? (
                  <>
                    <Button
                      onClick={() => setShowGenerateDialog(true)}
                      disabled={selectedRecipeIds.length === 0 || isGenerating}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-emerald-100"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                      Generate List ({selectedRecipeIds.length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setSelectionMode(false); setSelectedRecipeIds([]); }}
                      className="rounded-xl h-12 border-zinc-200"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setSelectionMode(true)}
                      className="rounded-xl h-12 border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Select for List
                    </Button>
                    <Button 
                      onClick={() => router.push('/recipes/create')} 
                      className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-12 px-6 font-bold flex items-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      <Plus className="h-5 w-5" /> Create Recipe
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-emerald-900">
                  {selectionMode ? 'Select Recipes' : 'Recent Recipes'}
                </h3>
                <Link className="text-sm font-bold text-emerald-700 flex items-center gap-1 hover:underline" href="/recipes">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[4/5] bg-zinc-100 animate-pulse rounded-2xl" />
                  ))
                ) : error ? (
                  <div className="col-span-full p-12 text-center border-2 border-dashed border-red-100 rounded-[3rem] text-red-500 flex flex-col items-center">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p>Failed to load recipes. Please try again.</p>
                  </div>
                ) : recipes.length === 0 ? (
                  <div className="col-span-full p-12 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 flex flex-col items-center">
                    <SearchX className="h-10 w-10 mb-4 opacity-20" />
                    <p className="text-lg font-bold text-emerald-900">No recipes yet.</p>
                    <Link href="/recipes/create" className="text-emerald-700 underline mt-2">Create your first recipe</Link>
                  </div>
                ) : (
                  recipes.map(recipe => (
                    <div key={recipe.id} className="relative">
                      <RecipeCard 
                        recipe={recipe} 
                        onClick={() => handleRecipeClick(recipe.id)} 
                      />
                      {selectionMode && (
                        <div className={`absolute top-4 left-4 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all z-20 ${selectedRecipeIds.includes(recipe.id)
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg"
                          : "bg-white/50 backdrop-blur border-white"
                          }`}>
                          {selectedRecipeIds.includes(recipe.id) && <Check className="h-5 w-5" />}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-emerald-900">Weekly Meal Plan</h3>
              <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 border-b border-zinc-50">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
                    <div key={day} className={`p-3 text-center border-r border-zinc-50 last:border-0 ${idx === 2 ? 'bg-emerald-50' : 'bg-white'}`}>
                      <span className={`text-[10px] font-bold tracking-widest ${idx === 2 ? 'text-emerald-900' : 'text-zinc-400'}`}>{day}</span>
                    </div>
                  ))}
                </div>
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="h-24 w-24 rounded-2xl bg-zinc-100 overflow-hidden flex-none">
                      <Image alt="Lentil Soup" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1471&auto=format&fit=crop" height={100} width={100} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase text-emerald-700 font-black tracking-widest">Today&apos;s Dinner</span>
                          <h4 className="text-2xl font-black text-emerald-900 mt-1">Spiced Red Lentil Soup</h4>
                        </div>
                        <button className="text-zinc-400 hover:text-emerald-900 transition-colors p-2 rounded-full hover:bg-zinc-50">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex gap-6 mt-4">
                        <span className="flex items-center gap-2 text-xs font-bold text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full">
                          <Utensils className="h-3.5 w-3.5 text-emerald-700" /> 2 Servings
                        </span>
                        <span className="flex items-center gap-2 text-xs font-bold text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full">
                          <Activity className="h-3.5 w-3.5 text-emerald-700" /> 420 kcal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="md:col-span-4 space-y-8">
            <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-emerald-900">Quick Shop</h3>
                <span className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">12 items</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Greek Yogurt (500g)', category: 'Dairy' },
                  { name: 'Fresh Spinach', category: 'Produce' },
                  { name: 'Whole Wheat Bread', category: 'Bakery', checked: true },
                  { name: 'Garlic Bulbs (2)', category: 'Pantry' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-200 group-hover:border-emerald-200'
                    }`}>
                      {item.checked && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`text-sm font-bold ${item.checked ? 'text-zinc-300 line-through' : 'text-emerald-900'}`}>{item.name}</span>
                    <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-zinc-300">{item.category}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 border-2 border-dashed border-zinc-100 rounded-2xl text-sm font-bold text-zinc-400 hover:border-emerald-200 hover:text-emerald-700 transition-all flex items-center justify-center gap-2 group">
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" /> Add Item
              </button>
              <Button 
                onClick={() => router.push('/shopping-list')}
                className="w-full mt-4 bg-emerald-50 text-emerald-700 py-6 rounded-2xl font-bold hover:bg-emerald-100 transition-all border-0 shadow-none h-auto"
              >
                Go to Shopping List
              </Button>
            </div>

            <div className="bg-emerald-900 rounded-[2rem] p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-2xl font-black text-white mb-2">Upgrade to Pro</h4>
                <p className="text-emerald-200 text-sm font-medium mb-6 opacity-80">Unlock advanced nutrition tracking and AI meal generation.</p>
                <button className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all shadow-xl shadow-black/10">Start Free Trial</button>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                <Utensils className="h-32 w-32 text-white" />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-emerald-900 mb-6">Weekly Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-5 bg-emerald-50/30 rounded-2xl border border-emerald-50/50">
                  <span className="block text-2xl font-black text-emerald-900">84%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mt-1 block">Healthy choice</span>
                </div>
                <div className="text-center p-5 bg-zinc-50/50 rounded-2xl border border-zinc-50">
                  <span className="block text-2xl font-black text-emerald-900">12</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1 block">New recipes</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <GenerateListDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onConfirm={handleConfirmGenerate}
        isGenerating={isGenerating}
        selectedCount={selectedRecipeIds.length}
      />
    </div>
  );
}
