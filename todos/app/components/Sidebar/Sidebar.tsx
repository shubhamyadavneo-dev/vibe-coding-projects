'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CheckSquare,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  LogIn,
  Menu,
  X,
} from 'lucide-react';
import { storage } from '@/app/lib/storage';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/todos', label: 'Todos', icon: CheckSquare },
  { href: '/create', label: 'Create', icon: PlusCircle },
  { href: '/stats', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const user = storage.getUser();

  const handleLogin = () => {
    storage.login('demo@example.com');
    window.location.reload();
  };

  const handleLogout = () => {
    storage.logout();
    window.location.reload();
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="app-shell lg:hidden fixed left-4 top-4 z-50 rounded-2xl p-3 text-slate-100"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-full w-[284px] border-r border-white/10
          bg-[linear-gradient(180deg,rgba(8,15,29,0.92)_0%,rgba(6,12,23,0.84)_100%)]
          transition-transform duration-300 lg:static
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex h-full flex-col p-5 lg:p-6">
          {/* Logo */}
          <div className="panel rounded-[28px] p-5">
            <div className="eyebrow mb-3">Workspace</div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-amber-300 text-lg font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20">
                TD
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">TodoDash</h1>
                <p className="text-sm text-slate-300">Modern SaaS task ops</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1">
            <div className="eyebrow mb-3 px-3">Navigate</div>
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all
                        ${isActive
                          ? 'bg-white text-slate-950 shadow-lg shadow-cyan-950/30'
                          : 'panel-muted text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }
                      `}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isActive
                            ? 'bg-slate-950/10 text-slate-900'
                            : 'bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="flex-1">
                        <span className="block font-semibold">{item.label}</span>
                        <span className={`text-xs ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                          {item.label === 'Dashboard' && 'Overview and signals'}
                          {item.label === 'Todos' && 'All tasks and filters'}
                          {item.label === 'Create' && 'Quick task intake'}
                          {item.label === 'Analytics' && 'Performance insights'}
                          {item.label === 'Settings' && 'Workspace preferences'}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="panel rounded-[28px] p-4">
            {user.isLoggedIn ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-sm font-bold text-slate-950">
                    <span className="font-bold text-white">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.username}</p>
                    <p className="text-xs text-slate-400">Premium workspace</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-xl p-2.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                <LogIn size={20} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
