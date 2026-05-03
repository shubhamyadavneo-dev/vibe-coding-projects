import { Request, Response, NextFunction } from 'express';
import { cookbookService } from '../services/CookbookService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const CookbookSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
});

export class CookbookController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = CookbookSchema.parse(req.body);
      const cookbook = await cookbookService.createCookbook(validated, req.user!.id);
      res.status(201).json({ success: true, data: cookbook });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cookbooks = await cookbookService.listUserCookbooks(req.user!.id);
      res.status(200).json({ success: true, data: cookbooks });
    } catch (error) {
      next(error);
    }
  }

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cookbook = await cookbookService.getCookbook(req?.params?.id as string);
      if (!cookbook) {
        return res.status(404).json({ success: false, error: 'Cookbook not found' });
      }
      res.status(200).json({ success: true, data: cookbook });
    } catch (error) {
      next(error);
    }
  }

  async addRecipe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { recipeId } = req.body;
      await cookbookService.addRecipeToCookbook(req?.params?.id as string, recipeId);
      res.status(200).json({ success: true, message: 'Recipe added to cookbook' });
    } catch (error) {
      next(error);
    }
  }

  async removeRecipe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cookbookService.removeRecipeFromCookbook(req?.params?.id as string, req?.params?.recipeId as string);
      res.status(200).json({ success: true, message: 'Recipe removed from cookbook' });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = CookbookSchema.partial().parse(req.body);
      const cookbook = await cookbookService.updateCookbook(req?.params?.id as string, validated, req.user!.id);
      res.status(200).json({ success: true, data: cookbook });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cookbookService.deleteCookbook(req?.params?.id as string, req.user!.id);
      res.status(200).json({ success: true, message: 'Cookbook deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const cookbookController = new CookbookController();
