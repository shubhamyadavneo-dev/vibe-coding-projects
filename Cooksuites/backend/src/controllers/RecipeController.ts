import { Request, Response, NextFunction } from 'express';
import { recipeService } from '../services/RecipeService';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RecipeSchema = z.object({
  title: z.string().min(3).max(200),
  mealType: z.string().optional(),
  cuisine: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    quantity: z.coerce.number().positive(),
    unit: z.enum(['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'pcs'])
  })).min(1),
  instructions: z.array(z.object({
    description: z.string().min(1),
    imageUrl: z.string().optional()
  })).min(1),
  cookingTimeMinutes: z.coerce.number().int().positive(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  categoryId: z.string().uuid().optional(),
  servings: z.coerce.number().int().positive().default(1),
});

const RecipeUpdateSchema = RecipeSchema.partial();

export class RecipeController {

  async createRecipe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Handle stringified JSON from multipart/form-data
      if (typeof req.body.ingredients === 'string') {
        try {
          req.body.ingredients = JSON.parse(req.body.ingredients);
        } catch (e) {
          throw new Error('Invalid ingredients format');
        }
      }
      if (typeof req.body.instructions === 'string') {
        try {
          req.body.instructions = JSON.parse(req.body.instructions);
        } catch (e) {
          throw new Error('Invalid instructions format');
        }
      }

      const validated = RecipeSchema.parse(req.body);
      const userId = req.user!.id;

      const { instructions: validatedInstructions, ...rest } = validated;
      const recipe = await recipeService.createRecipe({
        ...rest,
        instructions: JSON.stringify(validatedInstructions),
        image: req.file
      }, userId);

      res.status(201).json({
        success: true,
        data: recipe,
        meta: { timestamp: new Date().toISOString(), requestId: req.headers['x-request-id'] as string }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.issues }
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message }
        });
      }
      next(error);
    }
  }

  async updateRecipe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recipeId = req.params.id as string;
      
      // Handle stringified JSON from multipart/form-data
      if (typeof req.body.ingredients === 'string') {
        try {
          req.body.ingredients = JSON.parse(req.body.ingredients);
        } catch (e) {
          throw new Error('Invalid ingredients format');
        }
      }
      if (typeof req.body.instructions === 'string') {
        try {
          req.body.instructions = JSON.parse(req.body.instructions);
        } catch (e) {
          throw new Error('Invalid instructions format');
        }
      }

      const validated = RecipeUpdateSchema.parse(req.body);
      const userId = req.user!.id;

      const existing = await prisma.recipe.findUnique({ where: { id: recipeId } });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recipe not found' } });
      }

      const { instructions: validatedInstructions, ...rest } = validated;
      const updated = await recipeService.updateRecipe(recipeId, {
        ...rest,
        instructions: validatedInstructions ? JSON.stringify(validatedInstructions) : undefined,
        image: req.file
      }, userId);

      res.status(200).json({
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString(), requestId: req.headers['x-request-id'] as string }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.issues }
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message }
        });
      }
      next(error);
    }
  }

  async getRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await recipeService.getRecipe(req.params.id?.toString());
      if (!recipe) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Recipe not found' }
        });
      }

      res.status(200).json({
        success: true,
        data: recipe,
        meta: { timestamp: new Date().toISOString(), requestId: req.headers['x-request-id'] as string }
      });
    } catch (error) {
      next(error);
    }
  }

  async listRecipes(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, mealType, difficulty, categoryId, minTime, maxTime, cursor, limit } = req.query;
      
      const result = await recipeService.listRecipes({
        q: q as string,
        mealType: mealType as string,
        difficulty: difficulty as string,
        categoryId: categoryId as string,
        minTime: minTime ? parseInt(minTime as string, 10) : undefined,
        maxTime: maxTime ? parseInt(maxTime as string, 10) : undefined,
        cursor: cursor as string,
        limit: limit ? parseInt(limit as string, 10) : 20
      });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
          pagination: {
            hasMore: result.hasMore,
            nextCursor: result.nextCursor
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRecipe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recipeId = req.params.id as string;
      const existing = await prisma.recipe.findUnique({ where: { id: recipeId } });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recipe not found' } });
      }

      await recipeService.deleteRecipe(recipeId);

      res.status(200).json({
        success: true,
        data: { deleted: true },
        meta: { timestamp: new Date().toISOString(), requestId: req.headers['x-request-id'] as string }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const recipeController = new RecipeController();
