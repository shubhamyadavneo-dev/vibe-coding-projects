import { prismaMock } from '../lib/__mocks__/prisma';
import { cookbookService } from '../services/CookbookService';

describe('CookbookService', () => {
  describe('createCookbook', () => {
    it('should create a cookbook successfully', async () => {
      const mockCookbook = {
        id: 'cookbook-123',
        name: 'My Cookbook',
        description: 'Testing',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        image: null,
      };

      prismaMock.cookbook.create.mockResolvedValue(mockCookbook as any);

      const result = await cookbookService.createCookbook({ name: 'My Cookbook', description: 'Testing' }, 'user-123');

      expect(prismaMock.cookbook.create).toHaveBeenCalledWith({
        data: {
          name: 'My Cookbook',
          description: 'Testing',
          userId: 'user-123'
        }
      });
      expect(result).toEqual(mockCookbook);
    });
  });

  describe('listUserCookbooks', () => {
    it('should return a list of cookbooks for a user', async () => {
      const mockCookbooks = [
        { id: '1', name: 'Cookbook 1', userId: 'user-123' }
      ];

      prismaMock.cookbook.findMany.mockResolvedValue(mockCookbooks as any);

      const result = await cookbookService.listUserCookbooks('user-123');

      expect(prismaMock.cookbook.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockCookbooks);
    });
  });
});
