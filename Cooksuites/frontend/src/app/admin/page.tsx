'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { ListingHeader } from '@/components/shared/ListingHeader';
import { adminService, Role, Permission } from '@/services/adminService';
import { 
  Users, 
  Shield, 
  Key, 
  Loader2, 
  MoreHorizontal, 
  Check, 
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'users' | 'roles' | 'permissions';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Attempt to fetch all data
      // Note: Using Promise.allSettled to handle potential missing endpoints gracefully
      const [usersRes, rolesRes, permsRes] = await Promise.allSettled([
        adminService.getUsers(),
        adminService.getRoles(),
        adminService.getPermissions()
      ]);

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (rolesRes.status === 'fulfilled') setRoles(rolesRes.value.data);
      if (permsRes.status === 'fulfilled') setPermissions(permsRes.value.data);

      if (usersRes.status === 'rejected' && rolesRes.status === 'rejected' && permsRes.status === 'rejected') {
        setError('Administrative endpoints not available. Showing UI layout.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTabs = () => (
    <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl w-fit mb-8">
      {(['users', 'roles', 'permissions'] as Tab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize",
            activeTab === tab 
              ? "bg-white text-emerald-900 shadow-sm" 
              : "text-zinc-500 hover:text-emerald-700"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderUsers = () => (
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
                  <span className="text-xs text-zinc-400 font-medium">ID: {user.id.substring(0, 8)}...</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex flex-wrap gap-1.5">
                  {user.roles?.map((ur: any) => (
                    <Badge key={ur.role.id} variant="secondary" className="bg-emerald-50 text-emerald-700 border-none rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      {ur.role.name}
                    </Badge>
                  ))}
                  {(!user.roles || user.roles.length === 0) && (
                    <span className="text-xs text-zinc-300 font-medium italic">No roles assigned</span>
                  )}
                </div>
              </td>
              <td className="px-8 py-6 text-right">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </td>
            </tr>
          ))}
          {users.length === 0 && !loading && (
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
  );

  const renderRoles = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {roles.map((role) => (
        <Card key={role.id} className="border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden hover:border-emerald-200 transition-all">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-900 capitalize">{role.name}</h3>
                  <p className="text-xs text-zinc-500 font-medium">{role.description || 'No description provided'}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl text-emerald-700 font-bold text-xs">
                Edit Permissions
              </Button>
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions?.map((rp: any) => (
                  <div key={rp.permission.id} className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">{rp.permission.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {roles.length === 0 && !loading && (
        <div className="col-span-full p-24 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 flex flex-col items-center">
          <ShieldCheck className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-xl font-bold text-emerald-900">No roles configured</p>
          <p className="text-sm">Define system roles to manage user access.</p>
        </div>
      )}
    </div>
  );

  const renderPermissions = () => {
    const grouped = permissions.reduce((acc, p) => {
      if (!acc[p.resource]) acc[p.resource] = [];
      acc[p.resource].push(p);
      return acc;
    }, {} as Record<string, Permission[]>);

    return (
      <div className="space-y-8">
        {Object.entries(grouped).map(([resource, perms]) => (
          <div key={resource} className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-lg font-black text-emerald-900 capitalize mb-6 flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-600" />
              {resource} Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {perms.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-emerald-200 transition-all group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{p.action}</span>
                    <Badge variant="outline" className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      System
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-emerald-900 line-clamp-1">{p.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {permissions.length === 0 && !loading && (
          <div className="p-24 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 flex flex-col items-center">
            <Key className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-xl font-bold text-emerald-900">No permissions found</p>
            <p className="text-sm">The system permissions have not been initialized.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-8">
          <ListingHeader title="Administrative Management" />
          
          {error && (
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-center gap-4 text-amber-800">
              <AlertCircle className="h-6 w-6 flex-none" />
              <div className="flex-grow">
                <p className="font-bold">System Information</p>
                <p className="text-sm font-medium">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData}
                className="rounded-xl border-amber-200 text-amber-800 hover:bg-amber-100"
              >
                Retry Connection
              </Button>
            </div>
          )}

          {renderTabs()}

          {loading ? (
            <div className="p-24 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'roles' && renderRoles()}
              {activeTab === 'permissions' && renderPermissions()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
