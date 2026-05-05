'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Forgot Password?"
      subtitle="Enter your account email and we will send a secure reset link."
      leftTitle="CookSuite"
      leftDescription="Keep your kitchen workflow secure and recover access in just a few steps."
      footer={(
        <p className="font-body-md text-body-md text-on-surface-variant">
          Remember your password? <Link className="text-primary font-semibold hover:underline inline-flex items-center gap-1" href="/login"><ArrowLeft className="h-4 w-4" /> Back to Login</Link>
        </p>
      )}
    >
      {submitted ? (
        <div className="space-y-6">
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-100">
            If an account exists for {email}, a password reset link has been sent. Please check your inbox.
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-md bg-primary text-white rounded-lg font-label-sm text-label-sm uppercase tracking-widest font-semibold hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-lg">
          <div>
            <label htmlFor="email" className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-md py-md rounded-lg border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none font-body-md text-body-md"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-md bg-primary text-white rounded-lg font-label-sm text-label-sm uppercase tracking-widest font-semibold hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      )}
    </AuthSplitLayout>
  );
}
