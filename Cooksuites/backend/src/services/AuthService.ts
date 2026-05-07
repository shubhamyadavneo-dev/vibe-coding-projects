import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class AuthService {
  private readonly BCRYPT_ROUNDS = 12;
  
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateTokens(userId: string) {
    const accessSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-min-32-chars-long';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'another-super-secret-refresh-key-32-chars';
    
    const accessToken = jwt.sign({ id: userId }, accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, refreshSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): { id: string } {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'another-super-secret-refresh-key-32-chars';
    return jwt.verify(token, refreshSecret) as { id: string };
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    const permissionSet = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(`${rp.permission.resource}:${rp.permission.action}`);
      }
    }

    return Array.from(permissionSet);
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 mins expiry

    await prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });

    return token;
  }

  async validateAndConsumeResetToken(token: string): Promise<string | null> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken) return null;

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return null;
    }

    const userId = resetToken.userId;
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return userId;
  }
}

export const authService = new AuthService();
