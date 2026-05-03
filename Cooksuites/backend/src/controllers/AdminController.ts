import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { adminService } from '../services/AdminService';

const UpdateUserRolesSchema = z.object({
  roleIds: z.array(z.string().uuid({ message: 'Each roleId must be a valid UUID' }))
});

const UpdateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid({ message: 'Each permissionId must be a valid UUID' }))
});

/**
 * Generates a standard response meta object.
 */
const meta = (req: AuthRequest) => ({
  timestamp: new Date().toISOString(),
  requestId: (req.headers['x-request-id'] as string) || 'unknown'
});

export class AdminController {

  /**
   * GET /api/v1/admin/users
   * Lists all users with their assigned roles.
   */
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getUsers();
      res.status(200).json({ success: true, data: users, meta: meta(req) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/roles
   * Lists all roles with their permissions.
   */
  async getRoles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const roles = await adminService.getRoles();
      res.status(200).json({ success: true, data: roles, meta: meta(req) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/permissions
   * Lists all permissions.
   */
  async getPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await adminService.getPermissions();
      res.status(200).json({ success: true, data: permissions, meta: meta(req) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/users/:id/roles
   * Replaces all role assignments for a user.
   */
  async updateUserRoles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;

      const parsed = UpdateUserRolesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parsed.error.issues
          }
        });
      }

      const updated = await adminService.updateUserRoles(userId?.toString(), parsed.data.roleIds);
      res.status(200).json({
        success: true,
        data: updated,
        meta: meta(req)
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/roles/:id/permissions
   * Replaces all permission assignments for a role.
   */
  async updateRolePermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const roleId = req.params.id;

      const parsed = UpdateRolePermissionsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parsed.error.issues
          }
        });
      }

      const updated = await adminService.updateRolePermissions(roleId?.toString(), parsed.data.permissionIds);
      res.status(200).json({
        success: true,
        data: updated,
        meta: meta(req)
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/seed
   * Seeds default roles and permissions if none exist (idempotent).
   */
  async seedDefaults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.seedDefaults();
      res.status(200).json({ success: true, data: result, meta: meta(req) });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
