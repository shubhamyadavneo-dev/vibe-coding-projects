import prisma from '../lib/prisma';
import { z } from 'zod';
import { shoppingListService } from './ShoppingListService';
import { ForbiddenError, NotFoundError } from '../middleware/error';

export const CreateMealPlanSchema = z.object({
  name: z.string().min(1).max(100),
  weekStart: z.string().datetime(), // ISO string
});

export const UpdateMealPlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  weekStart: z.string().datetime().optional(),
});

export const AddMealPlanEntrySchema = z.object({
  recipeId: z.string().uuid(),
  date: z.string().datetime(),
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snacks']),
});

export class MealPlanService {
  async createMealPlan(userId: string, data: z.infer<typeof CreateMealPlanSchema>) {
    return prisma.mealPlan.create({
      data: {
        userId,
        name: data.name,
        weekStart: new Date(data.weekStart),
      },
    });
  }

  async getMealPlan(id: string, userId: string) {
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                cookingTimeMinutes: true,
                difficulty: true,
                images: true,
              }
            }
          }
        }
      }
    });

    if (!mealPlan) throw new NotFoundError('Meal plan not found');
    if (mealPlan.userId !== userId) throw new ForbiddenError('Access denied');

    return mealPlan;
  }

  async listMealPlans(userId: string) {
    return prisma.mealPlan.findMany({
      where: { userId },
      orderBy: { weekStart: 'desc' },
      include: {
        _count: { select: { entries: true } }
      }
    });
  }

  async updateMealPlan(id: string, userId: string, data: z.infer<typeof UpdateMealPlanSchema>) {
    const existing = await prisma.mealPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Meal plan not found');
    if (existing.userId !== userId) throw new ForbiddenError('Access denied');

    return prisma.mealPlan.update({
      where: { id },
      data: {
        name: data.name,
        weekStart: data.weekStart ? new Date(data.weekStart) : undefined,
      }
    });
  }

  async deleteMealPlan(id: string, userId: string) {
    const existing = await prisma.mealPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Meal plan not found');
    if (existing.userId !== userId) throw new ForbiddenError('Access denied');

    await prisma.mealPlan.delete({ where: { id } });
  }

  async addEntry(mealPlanId: string, userId: string, data: z.infer<typeof AddMealPlanEntrySchema>) {
    const mealPlan = await prisma.mealPlan.findUnique({ where: { id: mealPlanId } });
    if (!mealPlan) throw new NotFoundError('Meal plan not found');
    if (mealPlan.userId !== userId) throw new ForbiddenError('Access denied');

    return prisma.mealPlanEntry.create({
      data: {
        mealPlanId,
        recipeId: data.recipeId,
        date: new Date(data.date),
        mealType: data.mealType,
      },
      include: {
        recipe: {
          select: { id: true, title: true, images: true }
        }
      }
    });
  }

  async bulkUpdateEntries(mealPlanId: string, userId: string, entries: z.infer<typeof AddMealPlanEntrySchema>[]) {
    const mealPlan = await prisma.mealPlan.findUnique({ where: { id: mealPlanId } });
    if (!mealPlan) throw new NotFoundError('Meal plan not found');
    if (mealPlan.userId !== userId) throw new ForbiddenError('Access denied');

    await prisma.$transaction(async (tx) => {
      await tx.mealPlanEntry.deleteMany({
        where: { mealPlanId }
      });

      if (entries.length > 0) {
        await tx.mealPlanEntry.createMany({
          data: entries.map(e => ({
            mealPlanId,
            recipeId: e.recipeId,
            date: new Date(e.date),
            mealType: e.mealType
          }))
        });
      }
    });

    return this.getMealPlan(mealPlanId, userId);
  }

  async removeEntry(mealPlanId: string, entryId: string, userId: string) {
    const mealPlan = await prisma.mealPlan.findUnique({ where: { id: mealPlanId } });
    if (!mealPlan) throw new NotFoundError('Meal plan not found');
    if (mealPlan.userId !== userId) throw new ForbiddenError('Access denied');

    const entry = await prisma.mealPlanEntry.findUnique({ where: { id: entryId } });
    if (!entry || entry.mealPlanId !== mealPlanId) throw new NotFoundError('Entry not found');

    await prisma.mealPlanEntry.delete({ where: { id: entryId } });
  }

  async generateShoppingList(mealPlanId: string, userId: string) {
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: { entries: true }
    });

    if (!mealPlan) throw new NotFoundError('Meal plan not found');
    if (mealPlan.userId !== userId) throw new ForbiddenError('Access denied');

    const recipeIds = Array.from(new Set(mealPlan.entries.map(e => e.recipeId)));

    // Generate shopping list using the advanced generator
    return shoppingListService.generateAdvanced(recipeIds, userId, `Shopping List for ${mealPlan.name}`);
  }
}

export const mealPlanService = new MealPlanService();
