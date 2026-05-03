'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';
import Link from 'next/link';
import { Bell, Settings } from 'lucide-react';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import Image from 'next/image';

export default function CreateRecipePage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-12">
      {/* TopNavBar */}
      <nav className="bg-white border-b border-zinc-200 shadow-sm top-0 z-50 flex items-center justify-between px-12 py-4 w-full sticky">
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-emerald-900">CookSuite</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-zinc-500 hover:text-emerald-800 font-sans text-sm font-medium transition-colors duration-200 ease-in-out" href="/dashboard">Dashboard</Link>
            <Link className="text-emerald-900 border-b-2 border-emerald-900 pb-1 font-sans text-sm font-medium transition-colors duration-200 ease-in-out" href="/recipes">Recipes</Link>
            <Link className="text-zinc-500 hover:text-emerald-800 font-sans text-sm font-medium transition-colors duration-200 ease-in-out" href="/meal-planner">Meal Plans</Link>
            <Link className="text-zinc-500 hover:text-emerald-800 font-sans text-sm font-medium transition-colors duration-200 ease-in-out" href="/shopping-list">Grocery List</Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-zinc-500">
            <Bell className="cursor-pointer hover:bg-zinc-50 p-2 h-10 w-10 rounded-full transition-colors" />
            <Settings className="cursor-pointer hover:bg-zinc-50 p-2 h-10 w-10 rounded-full transition-colors" />
          </div>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant">
            <Image alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFYWE1D5_iH4ozHv-yzX11F1h_2MO6TYT-VNRzlILQoS2lzs9M7RBrvlCgK8rWj7LihWZtpv6wet6jC3YuJdA6nWXlC_YtL86oZv1SheAsVRTBphsXxv1dJfiVSMNI8lmACk6OLceE0FtNa1TG9JEbcK_yZCL8WUHQ5kDyoF2GNYDq2_mPSq1E0FofEdJxzJ_od9sImdZzUFv-QEBixTQcGyVIKzHm8MCUXms8i8b0i_aFT5_d1HZtgM9RNbZ5VAB2VXyJv35KVmk2"
              height={100}
              width={100}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-xl py-12 flex flex-col gap-12">
        {/* Header Section */}
        <header className="flex flex-col gap-xs">
          <h1 className="font-display-xl text-display-xl text-primary">Draft New Recipe</h1>
          <p className="text-on-surface-variant font-body-lg">Define your culinary masterpiece with precision and detail.</p>
        </header>

        {/* Main Form Component */}
        <RecipeForm />
      </main>
    </div>
  );
}
