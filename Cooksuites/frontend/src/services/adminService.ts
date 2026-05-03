import api from '../lib/api';
import { User } from '../store/slices/authSlice';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: { permission: Permission }[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export const adminService = {
  // Users
  getUsers: async () => {
    const response = await api.get<{ success: boolean; data: any[] }>('/admin/users');
    return response.data;
  },

  updateUserRoles: async (userId: string, roleIds: string[]) => {
    const response = await api.put<{ success: boolean }>(`/admin/users/${userId}/roles`, { roleIds });
    return response.data;
  },

  // Roles
  getRoles: async () => {
    const response = await api.get<{ success: boolean; data: Role[] }>('/admin/roles');
    return response.data;
  },

  updateRolePermissions: async (roleId: string, permissionIds: string[]) => {
    const response = await api.put<{ success: boolean }>(`/admin/roles/${roleId}/permissions`, { permissionIds });
    return response.data;
  },

  // Permissions
  getPermissions: async () => {
    const response = await api.get<{ success: boolean; data: Permission[] }>('/admin/permissions');
    return response.data;
  },
};
