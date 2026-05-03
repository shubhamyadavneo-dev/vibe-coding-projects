import { PrismaClient, Recipe } from '@prisma/client';
import { mediaStorageService } from './MediaStorageService';

const prisma = new PrismaClient();

export interface RecipeCreateInput {
  title: string;
  mealType?: string;
  cuisine?: string;
  ingredients: { name: string; quantity: number; unit: any }[];
  instructions: string;
  cookingTimeMinutes: number;
  difficulty: string;
  categoryId?: string;
  servings: number;
  image?: Express.Multer.File;
}

export interface RecipeUpdateInput {
  title?: string;
  mealType?: string;
  cuisine?: string;
  ingredients?: { name: string; quantity: number; unit: any }[];
  instructions?: string;
  cookingTimeMinutes?: number;
  difficulty?: string;
  categoryId?: string;
  servings?: number;
  image?: Express.Multer.File;
}

export class RecipeService {

  async createRecipe(data: RecipeCreateInput, userId: string): Promise<Recipe> {
    const { image, ingredients, ...recipeData } = data;

    // Create the recipe with ingredients in a transaction (automatically handled by nested create)
    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        userId,
        ingredients: {
          create: ingredients
        }
      }
    });

    // Handle image upload if provided
    if (image) {
      const imageUrl = await mediaStorageService.upload(image, `recipes/${recipe.id}`);
      await prisma.recipeImage.create({
        data: {
          recipeId: recipe.id,
          url: imageUrl
        }
      });
    }

    return prisma.recipe.findUniqueOrThrow({
      where: { id: recipe.id },
      include: { ingredients: true, images: true, category: true, user: { select: { email: true } } }
    });
  }

  async getRecipe(id: string): Promise<Recipe | null> {
    return prisma.recipe.findFirst({
      where: { id, deletedAt: null },
      include: { ingredients: true, images: true, category: true, user: { select: { email: true } } }
    });
  }

  async listRecipes(filters: { q?: string, mealType?: string, difficulty?: string, categoryId?: string, minTime?: number, maxTime?: number, cursor?: string, limit?: number }): Promise<{ data: Recipe[], hasMore: boolean, nextCursor?: string }> {
    const { q, mealType, difficulty, categoryId, minTime, maxTime, cursor, limit = 20 } = filters;

    const where: any = {
      deletedAt: null,
      ...(mealType && { mealType }),
      ...(difficulty && { difficulty }),
      ...(categoryId && { categoryId }),
      ...((minTime || maxTime) && {
        cookingTimeMinutes: {
          ...(minTime && { gte: minTime }),
          ...(maxTime && { lte: maxTime })
        }
      })
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { ingredients: { some: { name: { contains: q, mode: 'insensitive' } } } }
      ];
    }

    const args: any = {
      take: limit + 1,
      where,
      orderBy: { createdAt: 'desc' },
      include: { ingredients: true, images: true, category: true, user: { select: { email: true } } }
    };

    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const recipes = await prisma.recipe.findMany(args);
    let nextCursor: string | undefined = undefined;
    let hasMore = false;

    if (recipes.length > limit) {
      hasMore = true;
      const nextItem = recipes.pop();
      nextCursor = nextItem?.id;
    }

    return { data: recipes, hasMore, nextCursor };
  }

  async updateRecipe(id: string, data: RecipeUpdateInput, userId: string): Promise<Recipe> {
    const { image, ingredients, ...recipeData } = data;

    // Using transaction for atomic update of ingredients
    await prisma.$transaction(async (tx: any) => {
      await tx.recipe.update({
        where: { id },
        data: recipeData
      });

      if (ingredients) {
        // Simple strategy: delete existing and recreate
        await tx.ingredient.deleteMany({ where: { recipeId: id } });
        await tx.ingredient.createMany({
          data: ingredients.map(ing => ({ ...ing, recipeId: id }))
        });
      }
    });

    if (image) {
      const imageUrl = await mediaStorageService.upload(image, `recipes/${id}`);
      await prisma.recipeImage.create({
        data: {
          recipeId: id,
          url: imageUrl
        }
      });
    }

    return prisma.recipe.findUniqueOrThrow({
      where: { id },
      include: { ingredients: true, images: true, category: true, user: { select: { email: true } } }
    });
  }

  async deleteRecipe(id: string): Promise<void> {
    await prisma.recipe.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export const recipeService = new RecipeService();
