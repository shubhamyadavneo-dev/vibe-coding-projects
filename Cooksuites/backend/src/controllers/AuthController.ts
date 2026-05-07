import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authService } from '../services/AuthService';
import { emailService } from '../services/EmailService';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const RegisterSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100).regex(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens, and apostrophes are allowed'),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number')
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export class AuthController {

  public async register(req: Request, res: Response, next: NextFunction) {
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
          fullName: validated.fullName,
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

      // Fire and forget welcome email
      emailService.sendWelcomeEmail(user.email).catch(console.error);

      res.status(201).json({
        success: true,
        data: {
          user: { id: user.id, email: user.email, fullName: user.fullName },
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

  public async login(req: Request, res: Response, next: NextFunction) {
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
      const permissions = await authService.getUserPermissions(user.id);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Fire and forget login alert
      const ip = req.ip || req.socket?.remoteAddress || 'Unknown IP';
      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      emailService.sendLoginAlert(user.email, ip, userAgent).catch(console.error);

      res.status(200).json({
        success: true,
        data: {
          user: { id: user.id, email: user.email, fullName: user.fullName, permissions },
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

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' }
        });
      }

      const decoded = authService.verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' }
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
        data: { accessToken: tokens.accessToken },
        meta: { timestamp: new Date().toISOString(), requestId: req.headers['x-request-id'] as string }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' }
      });
    }
  }

  public async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: { id: true, email: true, fullName: true, createdAt: true, roles: { include: { role: true } } }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      const permissions = await authService.getUserPermissions(user.id);

      res.status(200).json({
        success: true,
        data: { ...user, permissions },
        meta: { timestamp: new Date().toISOString(), requestId: req.headers['x-request-id'] as string }
      });
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      console.log({ user });

      if (!user) {
        // Return 200 even if user not found to prevent email enumeration
        return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
      }

      const resetToken = await authService.generatePasswordResetToken(user.id);

      console.log({ resetToken });

      await emailService.sendPasswordResetEmail(user.email, resetToken);

      res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = z.object({
        token: z.string(),
        password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number')
      }).parse(req.body);

      const userId = await authService.validateAndConsumeResetToken(token);
      if (!userId) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Reset token is invalid or has expired' } });
      }

      const passwordHash = await authService.hashPassword(password);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
      });

      res.status(200).json({ success: true, message: 'Password has been successfully reset' });
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

export const authController = new AuthController();
