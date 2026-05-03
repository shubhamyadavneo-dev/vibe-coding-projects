'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '@/store/slices/authSlice';
import Link from 'next/link';
import Image from 'next/image';
import { Star, UtensilsCrossed, Eye } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    dispatch(setLoading(true));

    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to login');
      }

      dispatch(setCredentials({ user: data.data.user, token: data.data.accessToken }));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-xl bg-background">
      <div className="flex w-full max-w-[1100px] bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            {/* <Image alt="Kitchen" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA68xvkVl1fhayLUPVR4C3LQjlzf66pH66fCx0CdI2aGNV_NOFlKlv2s_rN2p--VLrLqTfygBFP3QKPFUg3YYZr6JmI92XIPbjTHQ-x1ufEO4sC8ULuFEifFFgsDcn3QCUhAs9cupBh5GFO5x8d1fAyUcQNrnJJHEWmwKsQFC_9kH5fcEMtPyjp0xDVJj5Wy6WoKPAwQ6hD2vIb61ONw1LijY6rCWpoFXTr-ckdhT2ZSFpbEOw5JBhiWXfOo19ThmowY_NjLtuxgsRJ" /> */}
          </div>
          <div className="relative z-10 p-xl flex flex-col justify-between h-full w-full">
            <div>
              <h2 className="text-white font-display-xl text-display-xl tracking-tight mb-md">CookSuite</h2>
              <p className="text-primary-fixed-dim font-body-lg text-body-lg max-w-sm">Elevate your culinary management with professional-grade precision tools.</p>
            </div>
            <div className="space-y-lg">
              <div className="p-lg bg-primary-container/30 rounded-lg border border-white/10 backdrop-blur-md">
                <div className="flex gap-sm mb-xs">
                  <Star className="text-primary-fixed-dim h-5 w-5 fill-primary-fixed-dim" />
                  <Star className="text-primary-fixed-dim h-5 w-5 fill-primary-fixed-dim" />
                  <Star className="text-primary-fixed-dim h-5 w-5 fill-primary-fixed-dim" />
                  <Star className="text-primary-fixed-dim h-5 w-5 fill-primary-fixed-dim" />
                  <Star className="text-primary-fixed-dim h-5 w-5 fill-primary-fixed-dim" />
                </div>
                <p className="text-white font-body-md text-body-md italic mb-sm">&quot;The quiet luxury of the interface allows my recipes to take center stage. Truly the most efficient tool for modern chefs.&quot;</p>
                <p className="text-primary-fixed-dim font-label-sm text-label-sm uppercase tracking-widest">— Executive Chef, L&apos;Aubergine</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 p-xl lg:px-24 flex flex-col justify-center bg-white">
          <div className="mb-xl">
            <div className="flex items-center gap-xs mb-lg lg:hidden">
              <UtensilsCrossed className="text-primary h-8 w-8" />
              <span className="font-display-xl text-headline-lg tracking-tight text-primary">CookSuite</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-xs">Welcome Back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Access your professional culinary workspace.</p>
          </div>

          {/* <div className="grid grid-cols-2 gap-md mb-xl">
            <button className="flex items-center justify-center gap-sm py-md px-lg bg-surface-container border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors">
              <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5czUxjGEq7bgmjUe--2oQLhZN7a230pr2nfGxB_UjbuPZ-jeNTZguSAPJ1ExUBIK9uI7RwO3kEVCBNJ5vcyngRmJ0cuRTUihkHQWm7flbQk4mooYwqECoI-uODmjpQcgYyBeFzfl7T55zCk7DA4RbOGS2C1_Bz0iyzers3aON8V6Y7m29Jk1hyqLst5DZm0SrHmnPmq-lwcyQdy6Nnsakv5VH6oKCWnNIynjuvp1enW57gHRyzGJjUIpfE73L_TwCgSBLVMXgWw72" />
              Google
            </button>
            <button className="flex items-center justify-center gap-sm py-md px-lg bg-surface-container border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors">
              <Apple className="h-5 w-5" />
              Apple
            </button>
          </div>
           */}
          {/* <div className="relative mb-xl flex items-center">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="mx-md font-label-sm text-label-sm text-on-surface-variant bg-white px-md">OR EMAIL</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div> */}

          <form className="space-y-lg" onSubmit={handleLogin}>
            {error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs" htmlFor="email">Email Address</label>
              <input className="w-full px-md py-md rounded-lg border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none font-body-md text-body-md" id="email" name="email" placeholder="chef@restaurant.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-xs">
                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest" htmlFor="password">Password</label>
                <Link className="font-label-sm text-label-sm text-primary hover:underline" href="#">Forgot password?</Link>
              </div>
              <div className="relative">
                <input className="w-full px-md py-md rounded-lg border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none font-body-md text-body-md" id="password" name="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary" type="button">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" id="remember" type="checkbox" />
              <label className="font-body-md text-body-md text-on-surface-variant" htmlFor="remember">Remember me for 30 days</label>
            </div>
            <button className="w-full py-md bg-primary text-white rounded-lg font-label-sm text-label-sm uppercase tracking-widest font-semibold hover:opacity-90 transition-all active:scale-[0.98] mt-lg flex items-center justify-center gap-2 cursor-pointer" type="submit">
              Sign In to Workspace
            </button>
          </form>

          <div className="mt-xl pt-lg border-t border-outline-variant text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              New to CookSuite? <Link className="text-primary font-semibold hover:underline" href="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-lg left-0 right-0 text-center pointer-events-none">
        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">
          © 2024 CookSuite Systems Inc. • <Link className="hover:text-primary pointer-events-auto" href="#">Privacy</Link> • <Link className="hover:text-primary pointer-events-auto" href="#">Terms</Link>
        </p>
      </div>
    </div>
  );
}
