'use client';

import Link from 'next/link';
import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface AuthSplitLayoutProps {
  title: string;
  subtitle: string;
  leftTitle: string;
  leftDescription: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthSplitLayout({
  title,
  subtitle,
  leftTitle,
  leftDescription,
  children,
  footer,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-xl bg-background">
      <div className="flex w-full max-w-[1100px] bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div 
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/cookingmain-1520371866.avif')" }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 p-xl flex flex-col justify-between h-full w-full">
            <div>
              <h2 className="text-white font-display-xl text-display-xl tracking-tight mb-md">{leftTitle}</h2>
              <p className="text-emerald-50/90 font-body-lg text-body-lg max-w-sm">{leftDescription}</p>
            </div>
            <div className="p-lg rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <p className="text-white font-medium">
                Plan meals, manage recipes, and run your kitchen workflow from one dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-xl lg:px-20 flex flex-col justify-center bg-white py-12">
          <div className="mb-xl">
            <div className="flex items-center gap-xs mb-lg lg:hidden">
              <UtensilsCrossed className="text-primary h-8 w-8" />
              <span className="font-display-xl text-headline-lg tracking-tight text-primary">CookSuite</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-xs">{title}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
          </div>

          {children}

          {footer && <div className="mt-xl pt-lg border-t border-outline-variant text-center">{footer}</div>}
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
