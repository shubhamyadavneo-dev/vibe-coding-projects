'use client';

import { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { storage } from '@/app/lib/storage';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock authentication
    setTimeout(() => {
      storage.login(email || 'demo@example.com');
      setIsLoading(false);
      router.push('/');
    }, 800);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      storage.login('demo@example.com');
      setIsLoading(false);
      router.push('/');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="app-shell rounded-[32px] border border-white/10 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500">
              <LogIn size={32} className="text-white" />
            </div>
            <div className="eyebrow mb-3">Welcome Back</div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-300">Sign in to your TodoDash account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-surface w-full rounded-2xl py-3 pl-12 pr-4 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-surface w-full rounded-2xl py-3 pl-12 pr-12 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-slate-300">Remember me</span>
              </label>
              <a href="#" className="text-sm text-cyan-200 hover:text-cyan-100">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-sm text-slate-400">OR</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Demo login */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="input-surface w-full rounded-2xl px-4 py-3 font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Try Demo Account
          </button>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-cyan-200 hover:text-cyan-100">
              Sign up
            </a>
          </p>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            This is a mock login. No real authentication is performed.
          </p>
        </div>
      </div>
    </div>
  );
}
