import { Request, Response, NextFunction } from 'express';
import { shoppingListService } from '../services/ShoppingListService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const GenerateListSchema = z.object({
  recipeIds: z.array(z.string().uuid()),
  name: z.string().min(1)
});

export class ShoppingListController {
  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = GenerateListSchema.parse(req.body);
      const list = await shoppingListService.generateFromRecipes(
        validated.recipeIds,
        req.user!.id,
        validated.name
      );
      res.status(201).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const lists = await shoppingListService.listUserShoppingLists(req.user!.id);
      res.status(200).json({ success: true, data: lists });
    } catch (error) {
      next(error);
    }
  }

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const list = await shoppingListService.getShoppingList(req?.params?.id as string);
      if (!list) {
        return res.status(404).json({ success: false, error: 'Shopping list not found' });
      }
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async toggleItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await shoppingListService.toggleItemPurchased(req?.params?.itemId as string);
      res.status(200).json({ success: true, message: 'Item status toggled' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await shoppingListService.deleteShoppingList(req?.params?.id as string);
      res.status(200).json({ success: true, message: 'Shopping list deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const shoppingListController = new ShoppingListController();
