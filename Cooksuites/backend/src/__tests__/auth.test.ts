import { prismaMock } from '../lib/__mocks__/prisma';
import { authController } from '../controllers/AuthController';
import { authService } from '../services/AuthService';
import { emailService } from '../services/EmailService';

// Mock authService
jest.mock('../services/AuthService', () => ({
  authService: {
    verifyPassword: jest.fn(),
    generateTokens: jest.fn(),
    getUserPermissions: jest.fn(),
  }
}));

// Mock emailService
jest.mock('../services/EmailService', () => ({
  emailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendLoginAlert: jest.fn().mockResolvedValue(undefined),
  }
}));

describe('AuthController', () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      headers: {},
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        fullName: 'Test User',
      };

      mockRequest.body = { email: 'test@example.com', password: 'password123' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (authService.verifyPassword as jest.Mock).mockResolvedValue(true);
      (authService.generateTokens as jest.Mock).mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      (authService.getUserPermissions as jest.Mock).mockResolvedValue(['recipe:read']);

      await authController.login(mockRequest, mockResponse, nextFunction);

      expect(prismaMock.user.findUnique).toHaveBeenCalled();
      expect(authService.verifyPassword).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          accessToken: 'access-token',
          user: expect.objectContaining({
            permissions: ['recipe:read']
          })
        })
      }));
    });

    it('should return 401 for invalid credentials', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'wrong-password' };
      prismaMock.user.findUnique.mockResolvedValue({ id: '1', passwordHash: 'hash' } as any);
      (authService.verifyPassword as jest.Mock).mockResolvedValue(false);

      await authController.login(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({ message: 'Invalid credentials' })
      }));
    });
  });
});
