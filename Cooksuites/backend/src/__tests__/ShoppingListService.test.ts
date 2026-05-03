import { jest, describe, it, expect, afterEach } from '@jest/globals';
import { shoppingListService } from '../services/ShoppingListService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrisma = {
    recipe: {
      findMany: jest.fn(),
    },
    shoppingList: {
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new (require('@prisma/client').PrismaClient)();

describe('ShoppingListService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFromRecipes', () => {
    it('should aggregate ingredients from multiple recipes correctly', async () => {
      const mockRecipes = [
        {
          id: '1',
          ingredients: [
            { name: 'Flour', quantity: 200, unit: 'g' },
            { name: 'Sugar', quantity: 100, unit: 'g' },
          ],
        },
        {
          id: '2',
          ingredients: [
            { name: 'Flour', quantity: 300, unit: 'g' },
            { name: 'Milk', quantity: 500, unit: 'ml' },
          ],
        },
      ];

      (prisma.recipe.findMany as any).mockResolvedValue(mockRecipes);
      (prisma.shoppingList.create as any).mockResolvedValue({ id: 'list-1', name: 'Test List' });

      await shoppingListService.generateFromRecipes(['1', '2'], 'user-1', 'Test List');

      expect(prisma.recipe.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['1', '2'] } },
        include: { ingredients: true },
      });

      expect(prisma.shoppingList.create).toHaveBeenCalledWith({
        data: {
          name: 'Test List',
          userId: 'user-1',
          items: {
            create: expect.arrayContaining([
              { name: 'Flour', quantity: 500, unit: 'g' },
              { name: 'Sugar', quantity: 100, unit: 'g' },
              { name: 'Milk', quantity: 500, unit: 'ml' },
            ]),
          },
        },
        include: { items: true },
      });
    });
  });
});
