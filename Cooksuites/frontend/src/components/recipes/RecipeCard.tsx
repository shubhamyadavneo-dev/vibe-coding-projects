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
  Pencil,
  Heart,
  Flame,
  User,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { usePermission } from '@/hooks/usePermission';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export function RecipeCard({ recipe, className, onClick, onDelete }: RecipeCardProps) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const canDeleteGlobal = usePermission('recipe:delete');
  const isAdmin = usePermission('admin:manage');
  const canDelete = canDeleteGlobal && (isAdmin || user?.id === recipe.userId);

  const imageUrl = recipe.images?.[0]?.url
    ? (recipe.images[0].url.startsWith('http') ? recipe.images[0].url : `http://localhost:4000${recipe.images[0].url}`)
    : null;

  const content = (
    <Card className={cn(
      "group overflow-hidden border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white h-full flex flex-col relative",
      className
    )}>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section */}
        <div className="aspect-[4/3] relative overflow-hidden bg-zinc-100 rounded-t-2xl">
          {imageUrl ? (
            <Image
              alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
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

          {canDelete && onDelete && (
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(e);
                }}
                className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Recipe"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-sm">
              {recipe.category?.name || 'Healthy'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-sm">
              {recipe.dietType || recipe.mealType || 'General'}
            </span>
          </div>

          <h3 className="text-xl font-bold text-zinc-900 leading-tight mb-4 line-clamp-2">
            {recipe.title}
          </h3>
          {recipe?.description && (
            <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{recipe.description}</p>
          )}

          <div className="flex items-center pt-1 mt-auto">
            <div className="flex items-center gap-4 text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{recipe.cookingTimeMinutes}m</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{Math.floor((recipe.cookingTimeMinutes * 15) + 120)} kcal</span>
              </div>
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
