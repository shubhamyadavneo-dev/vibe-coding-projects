import api from '../lib/api';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: { permission: Permission }[];
  _count?: { users: number };
}

export interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
  roles: { role: { id: string; name: string; description?: string } }[];
}

export const adminService = {
  // ── Users ──────────────────────────────────────────────────────────────────

  getUsers: async (): Promise<{ success: boolean; data: AdminUser[] }> => {
    const response = await api.get<{ success: boolean; data: AdminUser[] }>('/admin/users');
    return response.data;
  },

  updateUserRoles: async (
    userId: string,
    roleIds: string[]
  ): Promise<{ success: boolean; data: AdminUser }> => {
    const response = await api.put<{ success: boolean; data: AdminUser }>(
      `/admin/users/${userId}/roles`,
      { roleIds }
    );
    return response.data;
  },

  // ── Roles ───────────────────────────────────────────────────────────────────

  getRoles: async (): Promise<{ success: boolean; data: Role[] }> => {
    const response = await api.get<{ success: boolean; data: Role[] }>('/admin/roles');
    return response.data;
  },

  updateRolePermissions: async (
    roleId: string,
    permissionIds: string[]
  ): Promise<{ success: boolean; data: Role }> => {
    const response = await api.put<{ success: boolean; data: Role }>(
      `/admin/roles/${roleId}/permissions`,
      { permissionIds }
    );
    return response.data;
  },

  // ── Permissions ─────────────────────────────────────────────────────────────

  getPermissions: async (): Promise<{ success: boolean; data: Permission[] }> => {
    const response = await api.get<{ success: boolean; data: Permission[] }>('/admin/permissions');
    return response.data;
  },

  // ── Seeding ─────────────────────────────────────────────────────────────────

  seedDefaults: async (): Promise<{ success: boolean; data: { seeded: boolean; message: string } }> => {
    const response = await api.post<{ success: boolean; data: { seeded: boolean; message: string } }>(
      '/admin/seed'
    );
    return response.data;
  },
};
