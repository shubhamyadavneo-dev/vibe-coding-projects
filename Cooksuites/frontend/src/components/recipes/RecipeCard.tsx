'use client';

import React from 'react';
import Link from 'next/link';
import { Recipe } from '@/store/slices/recipeSlice';
import Image from 'next/image';
import { 
  ImageIcon, 
  Clock, 
  Users, 
  ArrowRight,
  ChefHat,
  ChevronRight,
  Pencil
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
  onClick?: () => void;
}

export function RecipeCard({ recipe, className, onClick }: RecipeCardProps) {
  const router = useRouter();
  const imageUrl = recipe.images?.[0]?.url
    ? (recipe.images[0].url.startsWith('http') ? recipe.images[0].url : `http://localhost:4000${recipe.images[0].url}`)
    : null;

  const content = (
    <Card className={cn(
      "group overflow-hidden border-zinc-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 bg-white h-full",
      className
    )}>
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="aspect-[4/3] relative overflow-hidden bg-zinc-100">
          {imageUrl ? (
            <Image
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              src={imageUrl}
              width={500}
              height={400}
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <ChefHat className="h-16 w-16 opacity-20" />
            </div>
          )}
          
          {/* Difficulty Badge */}
          <div className="absolute top-5 right-5 flex gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/recipes/${recipe.id}/edit`);
              }}
              className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white/50 text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl shadow-sm border border-white/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">
                {recipe.difficulty}
              </span>
            </div>
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              {recipe.category?.name || 'Recipe'}
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-200" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {recipe.mealType || 'Main'}
            </span>
          </div>

          <h3 className="text-2xl font-black text-emerald-900 leading-tight mb-6 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {recipe.title}
          </h3>

          <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-0.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Time</span>
                </div>
                <span className="text-sm font-bold text-emerald-900">{recipe.cookingTimeMinutes}m</span>
              </div>
              
              <div className="flex flex-col border-l border-zinc-100 pl-6">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-0.5">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Servings</span>
                </div>
                <span className="text-sm font-bold text-emerald-900">{recipe.servings || 2}ppl</span>
              </div>
            </div>

            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer h-full">
        {content}
      </div>
    );
  }

  return (
    <Link href={`/recipes/${recipe.id}`} className="block h-full">
      {content}
    </Link>
  );
}
