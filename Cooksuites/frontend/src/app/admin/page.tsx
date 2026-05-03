'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { ListingHeader } from '@/components/shared/ListingHeader';
import { adminService, AdminUser, Role, Permission } from '@/services/adminService';
import {
  Users,
  Shield,
  Key,
  Loader2,
  MoreHorizontal,
  Check,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  UserCog,
  Settings2,
  Sprout,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'users' | 'roles' | 'permissions';

// ── Helper ───────────────────────────────────────────────────────────────────

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as any;
    // Axios error with backend envelope
    if (e.response?.data?.error?.message) return e.response.data.error.message;
    if (e.response?.data?.message) return e.response.data.message;
    if (e.message) return e.message;
  }
  return 'An unexpected error occurred.';
}

// ── Assign Roles Modal ────────────────────────────────────────────────────────

interface AssignRolesModalProps {
  user: AdminUser | null;
  roles: Role[];
  open: boolean;
  onClose: () => void;
  onSave: (userId: string, roleIds: string[]) => Promise<void>;
}

function AssignRolesModal({ user, roles, open, onClose, onSave }: AssignRolesModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSelected(new Set(user.roles.map(ur => ur.role.id)));
    }
  }, [user]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await onSave(user.id, Array.from(selected));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="rounded-3xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-emerald-900 font-black flex items-center gap-2">
            <UserCog className="h-5 w-5 text-emerald-600" />
            Assign Roles
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Select roles for <span className="font-bold text-emerald-800">{user?.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2 max-h-64 overflow-y-auto">
          {roles.map(role => {
            const isChecked = selected.has(role.id);
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggle(role.id)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left',
                  isChecked
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-zinc-100 bg-zinc-50 hover:border-emerald-200'
                )}
              >
                <div>
                  <p className="font-bold text-emerald-900 capitalize">{role.name}</p>
                  <p className="text-xs text-zinc-400">{role.description || 'No description'}</p>
                </div>
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isChecked ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300'
                  )}
                >
                  {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Roles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Permissions Modal ────────────────────────────────────────────────────

interface EditPermissionsModalProps {
  role: Role | null;
  permissions: Permission[];
  open: boolean;
  onClose: () => void;
  onSave: (roleId: string, permissionIds: string[]) => Promise<void>;
}

function EditPermissionsModal({ role, permissions, open, onClose, onSave }: EditPermissionsModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role) {
      setSelected(new Set(role.permissions.map(rp => rp.permission.id)));
    }
  }, [role]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    try {
      await onSave(role.id, Array.from(selected));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by resource
  const grouped = permissions.reduce((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = [];
    acc[p.resource].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="rounded-3xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-emerald-900 font-black flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-emerald-600" />
            Edit Permissions
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Configure permissions for the{' '}
            <span className="font-bold text-emerald-800 capitalize">{role?.name}</span> role
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-80 overflow-y-auto">
          {Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource}>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 px-1">
                {resource}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {perms.map(p => {
                  const isChecked = selected.has(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggle(p.id)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all',
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-zinc-100 bg-zinc-50 hover:border-emerald-200'
                      )}
                    >
                      <span className="text-xs font-bold text-emerald-900">{p.name}</span>
                      <div
                        className={cn(
                          'h-4 w-4 rounded flex items-center justify-center border transition-all flex-none ml-2',
                          isChecked ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300'
                        )}
                      >
                        {isChecked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [errors, setErrors] = useState<{ users?: string; roles?: string; perms?: string }>({});

  // Modal state
  const [assignRolesUser, setAssignRolesUser] = useState<AdminUser | null>(null);
  const [editPermRole, setEditPermRole] = useState<Role | null>(null);

  // Seeding state
  const [seeding, setSeeding] = useState(false);

  // ── Fetch helpers ────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrors(prev => ({ ...prev, users: undefined }));
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (err) {
      setErrors(prev => ({ ...prev, users: extractErrorMessage(err) }));
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    setErrors(prev => ({ ...prev, roles: undefined }));
    try {
      const res = await adminService.getRoles();
      setRoles(res.data);
    } catch (err) {
      setErrors(prev => ({ ...prev, roles: extractErrorMessage(err) }));
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    setLoadingPerms(true);
    setErrors(prev => ({ ...prev, perms: undefined }));
    try {
      const res = await adminService.getPermissions();
      setPermissions(res.data);
    } catch (err) {
      setErrors(prev => ({ ...prev, perms: extractErrorMessage(err) }));
    } finally {
      setLoadingPerms(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, [fetchUsers, fetchRoles, fetchPermissions]);

  // ── Action handlers ──────────────────────────────────────────────────────

  const handleSaveUserRoles = async (userId: string, roleIds: string[]) => {
    try {
      await adminService.updateUserRoles(userId, roleIds);
      toast.success('Roles updated successfully');
      await fetchUsers();
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err; // re-throw so modal stays open on error
    }
  };

  const handleSaveRolePermissions = async (roleId: string, permissionIds: string[]) => {
    try {
      await adminService.updateRolePermissions(roleId, permissionIds);
      toast.success('Permissions updated successfully');
      await fetchRoles();
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await adminService.seedDefaults();
      toast.success(res.data.message);
      await Promise.all([fetchRoles(), fetchPermissions()]);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSeeding(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderTabs = () => (
    <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl w-fit mb-8">
      {(['users', 'roles', 'permissions'] as Tab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            'px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize',
            activeTab === tab
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-zinc-500 hover:text-emerald-700'
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderErrorBanner = (msg: string, retry: () => void) => (
    <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4 text-red-800 mb-4">
      <AlertCircle className="h-5 w-5 flex-none" />
      <p className="flex-grow text-sm font-medium">{msg}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={retry}
        className="rounded-xl border-red-200 text-red-700 hover:bg-red-100 gap-1.5"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </Button>
    </div>
  );

  const renderUsers = () => {
    if (loadingUsers) return <TabSkeleton />;
    return (
      <>
        {errors.users && renderErrorBanner(errors.users, fetchUsers)}
        <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-50 bg-zinc-50/30">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">User</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Roles</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-emerald-50/10 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-900">{user.email}</span>
                      <span className="text-xs text-zinc-400 font-medium">ID: {user.id.substring(0, 8)}…</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles?.map((ur) => (
                        <Badge
                          key={ur.role.id}
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 border-none rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider"
                        >
                          {ur.role.name}
                        </Badge>
                      ))}
                      {(!user.roles || user.roles.length === 0) && (
                        <span className="text-xs text-zinc-300 font-medium italic">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600"
                      onClick={() => setAssignRolesUser(user)}
                      title="Assign roles"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loadingUsers && (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center">
                    <Users className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                    <p className="text-emerald-900 font-bold">No users found</p>
                    <p className="text-sm text-zinc-400">The user management system is currently empty.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderRoles = () => {
    if (loadingRoles) return <TabSkeleton />;
    return (
      <>
        {errors.roles && renderErrorBanner(errors.roles, fetchRoles)}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              className="border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden hover:border-emerald-200 transition-all"
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-emerald-900 capitalize">{role.name}</h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        {role.description || 'No description provided'}
                        {role._count ? ` · ${role._count.users} user${role._count.users !== 1 ? 's' : ''}` : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-emerald-700 font-bold text-xs"
                    onClick={() => setEditPermRole(role)}
                  >
                    Edit Permissions
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions?.map((rp) => (
                      <div
                        key={rp.permission.id}
                        className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100"
                      >
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">{rp.permission.name}</span>
                      </div>
                    ))}
                    {(!role.permissions || role.permissions.length === 0) && (
                      <span className="text-xs text-zinc-300 italic">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {roles.length === 0 && !loadingRoles && (
            <div className="col-span-full p-24 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 flex flex-col items-center">
              <ShieldCheck className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-xl font-bold text-emerald-900 mb-2">No roles configured</p>
              <p className="text-sm mb-6">Define system roles to manage user access.</p>
              <Button
                onClick={handleSeed}
                disabled={seeding}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
              >
                {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sprout className="h-4 w-4" />}
                Seed Default Roles
              </Button>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderPermissions = () => {
    if (loadingPerms) return <TabSkeleton />;
    const grouped = permissions.reduce((acc, p) => {
      if (!acc[p.resource]) acc[p.resource] = [];
      acc[p.resource].push(p);
      return acc;
    }, {} as Record<string, Permission[]>);

    return (
      <>
        {errors.perms && renderErrorBanner(errors.perms, fetchPermissions)}
        <div className="space-y-8">
          {Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource} className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-lg font-black text-emerald-900 capitalize mb-6 flex items-center gap-2">
                <Key className="h-5 w-5 text-emerald-600" />
                {resource} Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {perms.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-emerald-200 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{p.action}</span>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        System
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-emerald-900 line-clamp-1">{p.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {permissions.length === 0 && !loadingPerms && (
            <div className="p-24 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 flex flex-col items-center">
              <Key className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-xl font-bold text-emerald-900 mb-2">No permissions found</p>
              <p className="text-sm mb-6">The system permissions have not been initialized.</p>
              <Button
                onClick={handleSeed}
                disabled={seeding}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
              >
                {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sprout className="h-4 w-4" />}
                Seed Default Permissions
              </Button>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />

      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-8">
          <ListingHeader title="Administrative Management" />

          {renderTabs()}

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'roles' && renderRoles()}
            {activeTab === 'permissions' && renderPermissions()}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AssignRolesModal
        user={assignRolesUser}
        roles={roles}
        open={!!assignRolesUser}
        onClose={() => setAssignRolesUser(null)}
        onSave={handleSaveUserRoles}
      />
      <EditPermissionsModal
        role={editPermRole}
        permissions={permissions}
        open={!!editPermRole}
        onClose={() => setEditPermRole(null)}
        onSave={handleSaveRolePermissions}
      />
    </div>
  );
}

// ── Tab Skeleton ──────────────────────────────────────────────────────────────

function TabSkeleton() {
  return (
    <div className="p-24 flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
    </div>
  );
}
