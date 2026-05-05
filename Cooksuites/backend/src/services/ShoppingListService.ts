import { ShoppingList } from '@prisma/client';
import prisma from '../lib/prisma';
import { UnitConverter, ParsedIngredient } from '../utils/unitConverter';

export class ShoppingListService {
  async generateFromRecipes(recipeIds: string[], userId: string, listName: string): Promise<ShoppingList> {
    // Basic aggregation keeping units separate
    const recipes = await prisma.recipe.findMany({
      where: { id: { in: recipeIds } },
      include: { ingredients: true }
    });

    const aggregatedIngredients: Record<string, { quantity: number, unit: string }> = {};

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}_${ing.unit}`;
        if (aggregatedIngredients[key]) {
          aggregatedIngredients[key].quantity += ing.quantity;
        } else {
          aggregatedIngredients[key] = {
            quantity: ing.quantity,
            unit: ing.unit
          };
        }
      });
    });

    return prisma.shoppingList.create({
      data: {
        name: listName,
        userId,
        items: {
          create: Object.entries(aggregatedIngredients).map(([key, data]) => {
            const name = key.split('_')[0];
            return {
              name: name.charAt(0).toUpperCase() + name.slice(1),
              // @ts-ignore
              quantity: data.quantity.toString(),
              unit: data.unit
            };
          }) as any
        }
      },
      include: { items: true }
    });
  }

  async generateAdvanced(recipeIds: string[], userId: string, listName: string): Promise<ShoppingList> {
    // Advanced aggregation with cross-unit conversion
    const recipes = await prisma.recipe.findMany({
      where: { id: { in: recipeIds } },
      include: { ingredients: true }
    });

    const rawIngredients: ParsedIngredient[] = [];

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        rawIngredients.push({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit
        });
      });
    });

    const mergedIngredients = UnitConverter.mergeIngredients(rawIngredients);

    return prisma.shoppingList.create({
      data: {
        name: listName,
        userId,
        items: {
          create: mergedIngredients.map(ing => ({
            name: ing.name,
            // @ts-ignore
            quantity: ing.quantity.toString(),
            unit: ing.unit
          })) as any
        }
      },
      include: { items: true }
    });
  }

  async getShoppingList(id: string): Promise<ShoppingList | null> {
    return prisma.shoppingList.findUnique({
      where: { id },
      include: { items: true }
    });
  }

  async listUserShoppingLists(userId: string): Promise<ShoppingList[]> {
    return prisma.shoppingList.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async toggleItemPurchased(itemId: string): Promise<void> {
    const item = await prisma.shoppingListItem.findUnique({ where: { id: itemId } });
    if (item) {
      await prisma.shoppingListItem.update({
        where: { id: itemId },
        data: { isPurchased: !item.isPurchased }
      });
    }
  }

  async deleteShoppingList(id: string): Promise<void> {
    await prisma.shoppingList.delete({ where: { id } });
  }

  async updateItemQuantity(itemId: string, quantity: string): Promise<any> {
    return prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        // @ts-ignore
        quantity
      }
    });
  }
}

export const shoppingListService = new ShoppingListService();
