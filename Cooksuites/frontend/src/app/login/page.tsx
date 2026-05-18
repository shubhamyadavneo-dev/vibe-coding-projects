'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '@/store/slices/authSlice';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      console.log({email, password});
      

      const data = await res.json();
      console.log("data", data )
      
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
    <AuthSplitLayout
      title="Welcome Back"
      subtitle="Access your professional culinary workspace."
      leftTitle="CookSuite"
      leftDescription="Operate your recipes and planning workflow with precision and speed."
      footer={(
        <p className="font-body-md text-body-md text-on-surface-variant">
          New to CookSuite? <Link className="text-primary font-semibold hover:underline" href="/register">Create an account</Link>
        </p>
      )}
    >
          <form className="space-y-lg" onSubmit={handleLogin}>
            {error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs" htmlFor="email">Email Address</label>
              <input className="w-full px-md py-md rounded-lg border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none font-body-md text-body-md" id="email" name="email" placeholder="chef@restaurant.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-xs">
                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest" htmlFor="password">Password</label>
                <Link className="font-label-sm text-label-sm text-primary hover:underline" href="/forgot-password">Forgot password?</Link>
              </div>
              <div className="relative">
                <input className="w-full px-md py-md rounded-lg border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none font-body-md text-body-md pr-12" id="password" name="password" placeholder="••••••••" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary" type="button" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
    </AuthSplitLayout>
  );
}
