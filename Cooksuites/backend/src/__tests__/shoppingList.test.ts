import { prismaMock } from '../lib/__mocks__/prisma';
import { shoppingListService } from '../services/ShoppingListService';

describe('ShoppingListService', () => {
  describe('updateItemQuantity', () => {
    it('should update the quantity of a shopping list item', async () => {
      const mockItem = {
        id: 'item-123',
        shoppingListId: 'list-123',
        name: 'Salt',
        quantity: '1',
        unit: 'tsp',
        isPurchased: false,
      };

      prismaMock.shoppingListItem.update.mockResolvedValue(mockItem as any);

      const result = await shoppingListService.updateItemQuantity('item-123', '2');

      expect(prismaMock.shoppingListItem.update).toHaveBeenCalledWith({
        where: { id: 'item-123' },
        data: { quantity: '2' },
      });
      expect(result).toEqual(mockItem);
    });
  });

  describe('generateFromRecipes', () => {
    it('should generate a shopping list from recipes', async () => {
      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Recipe 1',
          ingredients: [
            { name: 'Salt', quantity: 1, unit: 'tsp' }
          ]
        }
      ];

      const mockList = {
        id: 'list-123',
        name: 'My List',
        userId: 'user-123',
        items: []
      };

      prismaMock.recipe.findMany.mockResolvedValue(mockRecipes as any);
      prismaMock.shoppingList.create.mockResolvedValue(mockList as any);

      const result = await shoppingListService.generateFromRecipes(['recipe-1'], 'user-123', 'My List');

      expect(prismaMock.recipe.findMany).toHaveBeenCalled();
      expect(prismaMock.shoppingList.create).toHaveBeenCalled();
      expect(result).toEqual(mockList);
    });
  });
});
