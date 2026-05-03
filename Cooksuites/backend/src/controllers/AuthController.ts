import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authService } from '../services/AuthService';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number')
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export class AuthController {

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = RegisterSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({ where: { email: validated.email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { code: 'USER_EXISTS', message: 'User with this email already exists' }
        });
      }

      const passwordHash = await authService.hashPassword(validated.password);

      const user = await prisma.user.create({
        data: {
          email: validated.email,
          passwordHash
        }
      });

      // Optionally assign default 'user' role
      const defaultRole = await prisma.role.findUnique({ where: { name: 'user' } });
      if (defaultRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: defaultRole.id
          }
        });
      }

      const tokens = authService.generateTokens(user.id);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: { id: user.id, email: user.email },
          accessToken: tokens.accessToken
        },
        meta: { timestamp: new Date().toISOString(), requestId: req.headers['x-request-id'] as string }
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

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = LoginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email: validated.email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
        });
      }

      const isValid = await authService.verifyPassword(validated.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
        });
      }

      const tokens = authService.generateTokens(user.id);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: { id: user.id, email: user.email },
          accessToken: tokens.accessToken
        },
        meta: { timestamp: new Date().toISOString(), requestId: req.headers['x-request-id'] as string }
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error?.message }
        });
      }
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: { id: true, email: true, createdAt: true, roles: { include: { role: true } } }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      res.status(200).json({
        success: true,
        data: user,
        meta: { timestamp: new Date().toISOString(), requestId: req.headers['x-request-id'] as string }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
