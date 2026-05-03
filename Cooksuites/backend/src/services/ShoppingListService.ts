import { PrismaClient, ShoppingList } from '@prisma/client';

const prisma = new PrismaClient();

export class ShoppingListService {
  async generateFromRecipes(recipeIds: string[], userId: string, listName: string): Promise<ShoppingList> {
    // 1. Fetch all ingredients for the given recipes
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

    // 2. Create the shopping list
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: listName,
        userId,
        items: {
          create: Object.entries(aggregatedIngredients).map(([key, data]) => {
            const name = key.split('_')[0];
            return {
              name: name.charAt(0).toUpperCase() + name.slice(1),
              quantity: data.quantity,
              unit: data.unit
            };
          })
        }
      },
      include: { items: true }
    });

    return shoppingList;
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
}

export const shoppingListService = new ShoppingListService();
