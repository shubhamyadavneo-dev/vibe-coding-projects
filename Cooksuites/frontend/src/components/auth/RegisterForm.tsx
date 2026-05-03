'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '@/store/slices/authSlice';
import Link from 'next/link';

import { PasswordInput } from './PasswordInput';
import { PasswordChecklist } from './PasswordChecklist';
import { usePasswordValidation } from './usePasswordValidation';
import { useRouter } from 'next/navigation';

// 1. Zod Schema
const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string(),
  terms: z.boolean().refine((value) => value === true, {
    message: 'You must accept the terms and conditions',
  }),
}).superRefine((data, ctx) => {
  const hasMinLength = data.password.length >= 8;
  const hasNumberOrSymbol = /[\d!@#$%^&*()_+\[\]{}|;:'",.<>?/~`\\]/.test(data.password);
  const hasUpperCase = /[A-Z]/.test(data.password);

  if (!hasMinLength || !hasNumberOrSymbol || !hasUpperCase) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password does not meet all requirements",
      path: ["password"]
    });
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [globalError, setGlobalError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');
  const passwordValidations = usePasswordValidation(passwordValue);

  const onSubmit = async (data: RegisterFormValues) => {
    setGlobalError('');
    dispatch(setLoading(true));

    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error?.message || 'Failed to register');
      }

      dispatch(setCredentials({ user: responseData.data.user, token: responseData.data.accessToken }));
      router.push('/dashboard');
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <form className="space-y-lg" onSubmit={handleSubmit(onSubmit)}>
      {globalError && (
        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
          {globalError}
        </div>
      )}

      <div className="space-y-md">
        {/* Full Name */}
        <div>
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs" htmlFor="full_name">
            Full Name
          </label>
          <input
            {...register('full_name')}
            className={`w-full px-md py-md rounded-lg border bg-surface-bright focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none font-body-md text-body-md placeholder:text-outline-variant ${errors.full_name ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-outline-variant'
              }`}
            id="full_name"
            placeholder="Escoffier Auguste"
            type="text"
            aria-invalid={!!errors.full_name}
          />
          {errors.full_name && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs" htmlFor="email">
            Email Address
          </label>
          <input
            {...register('email')}
            className={`w-full px-md py-md rounded-lg border bg-surface-bright focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none font-body-md text-body-md placeholder:text-outline-variant ${errors.email ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-outline-variant'
              }`}
            id="email"
            placeholder="chef@cooksuite.com"
            type="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs" htmlFor="password">
            Password
          </label>
          <PasswordInput
            {...register('password')}
            id="password"
            placeholder="••••••••"
            className={errors.password ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-outline-variant'}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Password Requirements */}
        <PasswordChecklist validations={passwordValidations} />
      </div>

      {/* Terms & Conditions */}
      <div>
        <div className="flex items-start gap-sm">
          <input
            {...register('terms')}
            className={`mt-xs w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer ${errors.terms ? 'border-red-500' : ''
              }`}
            id="terms"
            type="checkbox"
          />
          <label className="font-body-md text-body-md text-on-surface-variant" htmlFor="terms">
            I agree to the <Link className="text-primary font-medium hover:underline" href="#">Terms of Service</Link> and <Link className="text-primary font-medium hover:underline" href="#">Privacy Policy</Link>.
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-xs mt-1 font-medium ml-6">{errors.terms.message}</p>
        )}
      </div>

      {/* Primary Action */}
      <button
        className="w-full py-md bg-primary text-white rounded-lg font-label-sm text-label-sm uppercase tracking-widest font-semibold hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-md"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}
