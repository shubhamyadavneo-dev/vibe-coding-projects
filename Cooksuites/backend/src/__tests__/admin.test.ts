import { prismaMock } from '../lib/__mocks__/prisma';
import { adminService } from '../services/AdminService';

describe('AdminService', () => {
  describe('getUsers', () => {
    it('should return all users with roles', async () => {
      const mockUsers = [
        { id: '1', email: 'admin@example.com', roles: [] }
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await adminService.getUsers();

      expect(prismaMock.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('updateUserRoles', () => {
    it('should update user roles atomically', async () => {
      const userId = 'user-123';
      const roleIds = ['role-1'];

      prismaMock.role.findMany.mockResolvedValue([{ id: 'role-1' }] as any);
      prismaMock.$transaction.mockImplementation(async (cb) => await cb(prismaMock));
      prismaMock.user.findUniqueOrThrow.mockResolvedValue({ id: userId, email: 't@t.com', roles: [] } as any);

      await adminService.updateUserRoles(userId, roleIds);

      expect(prismaMock.userRole.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(prismaMock.userRole.createMany).toHaveBeenCalledWith({
        data: [{ userId, roleId: 'role-1' }]
      });
    });
  });
});
