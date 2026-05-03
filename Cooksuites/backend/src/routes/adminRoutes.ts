import { Router } from 'express';
import { adminController } from '../controllers/AdminController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

// All admin routes require authentication and admin:manage permission
router.use(authenticate, requirePermission('admin:manage'));

// Users
router.get('/users', adminController.getUsers.bind(adminController));
router.put('/users/:id/roles', adminController.updateUserRoles.bind(adminController));

// Roles
router.get('/roles', adminController.getRoles.bind(adminController));
router.put('/roles/:id/permissions', adminController.updateRolePermissions.bind(adminController));

// Permissions
router.get('/permissions', adminController.getPermissions.bind(adminController));

// Seeding (emergency / first-time setup)
router.post('/seed', adminController.seedDefaults.bind(adminController));

export default router;
