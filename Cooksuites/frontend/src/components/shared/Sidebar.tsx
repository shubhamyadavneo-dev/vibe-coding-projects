'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Utensils, 
  BookOpen, 
  Calendar, 
  ShoppingCart, 
  ShieldCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Recipes', href: '/recipes', icon: Utensils },
    { label: 'Cookbooks', href: '/cookbooks', icon: BookOpen },
    { label: 'Meal Planner', href: '/meal-planner', icon: Calendar },
    { label: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
    { label: 'Admin Panel', href: '/admin', icon: ShieldCheck },
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 border-r fixed left-0 top-0 bg-white border-zinc-200 flex-col gap-1 p-6 z-50">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-tighter text-emerald-900">CookSuite</h1>
        <p className="text-sm font-medium text-zinc-500">Culinary Suite</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out text-sm font-medium",
              pathname === item.href 
                ? "text-emerald-900 bg-emerald-50/50" 
                : "text-zinc-500 hover:bg-zinc-50"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
