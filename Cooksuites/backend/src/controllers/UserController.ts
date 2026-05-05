import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).regex(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens, and apostrophes are allowed'),
});

export class UserController {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        // @ts-ignore
        select: { id: true, email: true, fullName: true, createdAt: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = UpdateProfileSchema.parse(req.body);

      const updatedUser = await prisma.user.update({
        where: { id: req.user?.id },
        data: {
          fullName: validated.fullName
        } as any,
        // @ts-ignore
        select: { id: true, email: true, fullName: true, createdAt: true }
      });

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.message }
        });
      }
      next(error);
    }
  }
}

export const userController = new UserController();
