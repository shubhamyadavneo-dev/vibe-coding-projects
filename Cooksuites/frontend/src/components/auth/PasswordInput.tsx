'use client';
import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => setShowPassword(!showPassword);

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-md py-md rounded-lg border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none font-body-md text-body-md placeholder:text-outline-variant pr-10 ${className || ''}`}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none focus:text-primary transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
