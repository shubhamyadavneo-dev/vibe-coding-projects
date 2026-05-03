import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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
}

export const authService = new AuthService();
