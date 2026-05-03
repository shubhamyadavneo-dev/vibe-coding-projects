'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetRecipeByIdQuery } from '@/store/api/recipeApi';
import Link from 'next/link';
import { AddToCookbookDialog } from '@/components/recipes/AddToCookbookDialog';
import {
  AlertCircle,
  ArrowLeft,
  Edit3,
  Share2,
  Clock,
  Zap,
  Users,
  Utensils,
  ShoppingCart,
  UtensilsCrossed
} from 'lucide-react';
import Image from 'next/image';

export default function RecipeViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: recipeResponse, isLoading, error } = useGetRecipeByIdQuery(id);
  const recipe = recipeResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-label-sm text-label-sm uppercase tracking-widest text-primary animate-pulse">Loading Recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-xl">
        <div className="bg-white border border-outline-variant rounded-2xl p-xl max-w-md w-full text-center shadow-lg">
          <AlertCircle className="text-error h-16 w-16 mx-auto mb-4" />
          <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Recipe Not Found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            The recipe you&apos;re looking for might have been moved or deleted.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-primary text-white py-3 rounded-xl font-label-sm uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Safe parsing of JSON instructions
  let instructions: { description: string, imageUrl?: string }[] = [];
  try {
    instructions = typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : (recipe.instructions as { description: string, imageUrl?: string }[] || []);
  } catch (e) {
    console.error("Failed to parse instructions", e);
  }

  // Ingredients are now a normalized relation (array of objects)
  const ingredientsList = recipe.ingredients && Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];

  const mealType = recipe?.mealType || 'Recipe';
  const cuisine = recipe?.cuisine;

  const mainImageUrl = recipe.images?.[0]?.url
    ? (recipe.images[0].url.startsWith('http') ? recipe.images[0].url : `http://localhost:4000${recipe.images[0].url}`)
    : null;

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 w-full">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-emerald-900 hidden sm:block">CookSuite</Link>
        </div>
        <div className="flex items-center gap-4">
          <AddToCookbookDialog recipeId={id} />
          <button 
            onClick={() => router.push(`/recipes/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-label-sm text-label-sm hover:bg-zinc-50 transition-colors"
          >
            <Edit3 className="h-4 w-4" /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-colors shadow-sm">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto px-6 pt-12">
        <div className="flex flex-col gap-12">
          {/* Hero Section */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 flex flex-col gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="bg-emerald-50 text-emerald-900 font-label-sm text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                  {mealType}
                </span>
                {cuisine && (
                  <span className="bg-zinc-100 text-zinc-600 font-label-sm text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                    {cuisine}
                  </span>
                )}
              </div>
              <h1 className="font-display-xl text-display-xl text-primary leading-tight">{recipe.title}</h1>

              <div className="flex flex-wrap gap-8 items-center py-4 border-y border-outline-variant">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Time</span>
                    <span className="font-headline-sm text-headline-sm">{recipe.cookingTimeMinutes} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-outline-variant pl-8">
                  <Zap className="text-primary h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Difficulty</span>
                    <span className="font-headline-sm text-headline-sm">{recipe.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-outline-variant pl-8">
                  <Users className="text-primary h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Servings</span>
                    <span className="font-headline-sm text-headline-sm">2 People</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              {mainImageUrl ? (
                <Image src={mainImageUrl} alt={recipe.title} className="w-full h-full object-cover"
                  width={500}
                  height={500}
                />
              ) : (
                <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center text-zinc-300">
                  <Utensils className="h-24 w-24 mb-2" />
                  <p className="font-label-sm uppercase tracking-tighter">No cover photo</p>
                </div>
              )}
            </div>
          </section>

          {/* Content Tabs/Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Ingredients Column */}
            <section className="lg:col-span-4 space-y-8">
              <div className="sticky top-28">
                <h2 className="font-headline-lg text-headline-lg text-primary mb-6 flex items-center gap-3">
                  <ShoppingCart className="bg-emerald-50 text-emerald-900 p-2 rounded-xl h-10 w-10" />
                  Ingredients
                </h2>
                <ul className="space-y-4">
                  {ingredientsList.length > 0 ? (
                    ingredientsList.map((item: { name: string, quantity: number, unit: string }, i: number) => (
                      <li key={i} className="flex items-center justify-between pb-3 border-b border-zinc-100 text-on-surface">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="font-body-md text-body-md">{item.name}</span>
                        </div>
                        <span className="font-label-sm text-on-surface-variant bg-zinc-50 px-2 py-0.5 rounded">
                          {item.quantity} {item.unit}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-on-surface-variant italic font-body-md">No specific ingredients listed.</li>
                  )}
                </ul>

                <div className="mt-12 p-6 bg-primary-container rounded-2xl shadow-sm border border-primary/10">
                  <h4 className="font-headline-sm text-headline-sm text-white mb-2">Chef&apos;s Tip</h4>
                  <p className="font-body-md text-body-md text-white/90">Always use fresh ingredients for the best flavor profile in this {cuisine || 'recipe'}.</p>
                </div>
              </div>
            </section>

            {/* Preparation Column */}
            <section className="lg:col-span-8 space-y-12">
              <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-3">
                <UtensilsCrossed className="bg-emerald-50 text-emerald-900 p-2 rounded-xl h-10 w-10" />
                Preparation Steps
              </h2>
              <div className="space-y-10">
                {instructions.map((step, index) => (
                  <div key={index} className="flex gap-8 group">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-primary text-primary flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-primary group-hover:text-white transition-colors">
                        {index + 1}
                      </div>
                      <div className="w-0.5 flex-1 bg-zinc-100 group-last:hidden" />
                    </div>
                    <div className="flex-1 pb-10 group-last:pb-0">
                      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                        <p className="font-body-lg text-body-lg text-on-surface leading-relaxed mb-6">
                          {step.description}
                        </p>
                        {step.imageUrl && (
                          <div className="mt-6 rounded-2xl overflow-hidden aspect-video border border-outline-variant shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={step.imageUrl.startsWith('http') ? step.imageUrl : `http://localhost:4000${step.imageUrl}`}
                              alt={`Step ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
