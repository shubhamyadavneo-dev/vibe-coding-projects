import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminService {

  /**
   * Returns all users with their assigned roles.
   */
  async getUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Returns all roles with their associated permissions.
   */
  async getRoles() {
    return prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Returns all permissions, optionally grouped by resource.
   */
  async getPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }]
    });
  }

  /**
   * Replaces all roles for a given user atomically.
   * @param userId - Target user UUID
   * @param roleIds - New set of role UUIDs to assign
   */
  async updateUserRoles(userId: string, roleIds: string[]) {
    // Validate all roleIds exist
    const existingRoles = await prisma.role.findMany({
      where: { id: { in: roleIds } }
    });

    if (existingRoles.length !== roleIds.length) {
      const foundIds = existingRoles.map(r => r.id);
      const missing = roleIds.filter(id => !foundIds.includes(id));
      throw Object.assign(new Error(`Role(s) not found: ${missing.join(', ')}`), {
        statusCode: 404,
        code: 'ROLE_NOT_FOUND'
      });
    }

    await prisma.$transaction(async (tx) => {
      // Delete all existing role assignments
      await tx.userRole.deleteMany({ where: { userId } });

      // Recreate with new set
      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map(roleId => ({ userId, roleId }))
        });
      }
    });

    // Return updated user
    return prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        roles: {
          select: {
            role: { select: { id: true, name: true, description: true } }
          }
        }
      }
    });
  }

  /**
   * Replaces all permissions for a given role atomically.
   * @param roleId - Target role UUID
   * @param permissionIds - New set of permission UUIDs to assign
   */
  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    // Validate all permissionIds exist
    const existingPerms = await prisma.permission.findMany({
      where: { id: { in: permissionIds } }
    });

    if (existingPerms.length !== permissionIds.length) {
      const foundIds = existingPerms.map(p => p.id);
      const missing = permissionIds.filter(id => !foundIds.includes(id));
      throw Object.assign(new Error(`Permission(s) not found: ${missing.join(', ')}`), {
        statusCode: 404,
        code: 'PERMISSION_NOT_FOUND'
      });
    }

    await prisma.$transaction(async (tx) => {
      // Delete all existing permission assignments for this role
      await tx.rolePermission.deleteMany({ where: { roleId } });

      // Recreate with new set
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({ roleId, permissionId }))
        });
      }
    });

    // Return updated role
    return prisma.role.findUniqueOrThrow({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
  }

  /**
   * Seeds default roles and permissions if the DB is empty.
   * Idempotent — safe to call multiple times.
   */
  async seedDefaults() {
    const roleCount = await prisma.role.count();
    if (roleCount > 0) {
      return { seeded: false, message: 'Roles already exist' };
    }

    const permissionDefs = [
      { name: 'recipe:create', resource: 'recipe', action: 'create' },
      { name: 'recipe:read', resource: 'recipe', action: 'read' },
      { name: 'recipe:update', resource: 'recipe', action: 'update' },
      { name: 'recipe:delete', resource: 'recipe', action: 'delete' },
      { name: 'cookbook:create', resource: 'cookbook', action: 'create' },
      { name: 'cookbook:share', resource: 'cookbook', action: 'share' },
      { name: 'admin:manage', resource: 'admin', action: 'manage' },
    ];

    for (const perm of permissionDefs) {
      await prisma.permission.upsert({ where: { name: perm.name }, update: {}, create: perm });
    }

    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' }, update: {}, create: { name: 'admin', description: 'Administrator' }
    });
    await prisma.role.upsert({
      where: { name: 'user' }, update: {}, create: { name: 'user', description: 'Regular User' }
    });
    await prisma.role.upsert({
      where: { name: 'viewer' }, update: {}, create: { name: 'viewer', description: 'Read Only Viewer' }
    });

    const allPerms = await prisma.permission.findMany();
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: perm.id }
      });
    }

    return { seeded: true, message: 'Default roles and permissions seeded successfully' };
  }
}

export const adminService = new AdminService();
