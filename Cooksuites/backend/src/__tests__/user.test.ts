import { prismaMock } from '../lib/__mocks__/prisma';
import { userController } from '../controllers/UserController';
import { Response } from 'express';

describe('UserController', () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should return user profile when user is authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        createdAt: new Date(),
      };

      mockRequest.user = { id: 'user-123' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      await userController.getMe(mockRequest, mockResponse, nextFunction);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-123' },
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.user = { id: 'user-999' };
      prismaMock.user.findUnique.mockResolvedValue(null);

      await userController.getMe(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({ message: 'User not found' }),
      });
    });
  });
});
