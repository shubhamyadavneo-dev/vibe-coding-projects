import { PrismaClient, Cookbook } from '@prisma/client';

const prisma = new PrismaClient();

export interface CookbookCreateInput {
  name: string;
  description?: string;
}

export interface CookbookUpdateInput {
  name?: string;
  description?: string;
}

export class CookbookService {
  async createCookbook(data: CookbookCreateInput, userId: string): Promise<Cookbook> {
    return prisma.cookbook.create({
      data: {
        ...data,
        userId
      }
    });
  }

  async getCookbook(id: string): Promise<Cookbook | null> {
    return prisma.cookbook.findFirst({
      where: { id, deletedAt: null },
      include: {
        recipes: {
          include: {
            recipe: {
              include: {
                images: true,
                ingredients: true
              }
            }
          }
        }
      }
    });
  }

  async listUserCookbooks(userId: string): Promise<Cookbook[]> {
    return prisma.cookbook.findMany({
      where: { userId, deletedAt: null },
      include: {
        _count: {
          select: { recipes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addRecipeToCookbook(cookbookId: string, recipeId: string): Promise<void> {
    await prisma.cookbookRecipe.upsert({
      where: {
        cookbookId_recipeId: { cookbookId, recipeId }
      },
      create: { cookbookId, recipeId },
      update: {} // Do nothing if already exists
    });
  }

  async removeRecipeFromCookbook(cookbookId: string, recipeId: string): Promise<void> {
    await prisma.cookbookRecipe.delete({
      where: {
        cookbookId_recipeId: { cookbookId, recipeId }
      }
    });
  }

  async updateCookbook(id: string, data: CookbookUpdateInput, userId: string): Promise<Cookbook> {
    return prisma.cookbook.update({
      where: { id, userId },
      data
    });
  }

  async deleteCookbook(id: string, userId: string): Promise<void> {
    await prisma.cookbook.update({
      where: { id, userId },
      data: { deletedAt: new Date() }
    });
  }
}

export const cookbookService = new CookbookService();
