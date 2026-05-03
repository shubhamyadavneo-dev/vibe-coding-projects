'use client';

import React from 'react';
import { Menu as MenuIcon, Bell as BellIcon, LogOut as LogOutIcon } from 'lucide-react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export function Header() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <header className="md:ml-64 bg-white border-b border-zinc-200 h-16 fixed top-0 right-0 left-0 z-40 flex justify-between items-center px-6 md:px-12">
      <div className="flex items-center gap-4 flex-grow max-w-2xl">
        <MenuIcon className="md:hidden h-6 w-6 text-zinc-500" />
      </div>
      <div className="flex items-center gap-4">
        <button className="text-zinc-500 hover:bg-zinc-50 p-2 rounded-full transition-colors active:opacity-80 cursor-pointer">
          <BellIcon className="h-6 w-6" />
        </button>
        <button onClick={handleLogout} className="text-zinc-500 hover:bg-zinc-50 p-2 rounded-full transition-colors active:opacity-80 cursor-pointer text-sm font-medium flex items-center gap-1">
          <LogOutIcon className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-zinc-200">
          <Image
            alt="User profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkCAK2_4vDXutPAAeWBONuE16cCVduCpp1vunZ1KbaVD6SFqNGZG-82qrygbsdBsTN2bfCQTzVUZJ67S1UargzIQR01FwBv6OEa7rsMXgVIj92wj2sWKk5cXS7XlgiHLOkornh3uxDu4DlSPRWoWMeWWUaydvKV78oRkW8gkBZxuLeKbkS-p_TWSDkB9Lpmx2x29HquaaybfQ3pXcvNkZLWgFIlcXGOkkiMnMmqhtNb9fa_rMRNVQ_1ULf8AQ4FS5KDOF8I5ynPSmT"
            height={50}
            width={50}
          />
        </div>
      </div>
    </header>
  );
}
