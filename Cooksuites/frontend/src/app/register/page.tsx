import Image from 'next/image';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Apple } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-xl bg-background">
      <div className="flex w-full max-w-[1100px] bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        {/* Image Section (Visual Anchor) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 z-10" />
          <Image
            alt="Culinary Workspace"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOr-uuaxIOVFmHh1IazzSBVMG9aFzzkcqU29vpa9LQY5g22pYPtDwfSaTSMxYcFQ1M5_Z-jEKN8XTw72_C7uZItk62IkOLfczjsw7cbF3-6AgEtYlZBncIt6DSBkevCqecYBDXraVxoJZvDjXMYlBjeKLMc70k3vjb1vFWG9alVaWfCvTWR3gOMas_MyfFLmzSPvpKu8ZpJ7d4HadmARPGt0bu1OYCg4Gtozyql8BX_ribbLPMxYPODWAQx-rjTRbaYSSRmkO_w6JY"
            fill
            sizes="50vw"
            priority
          />
          <div className="relative z-10 p-xl flex flex-col justify-center h-full w-full">
            <h2 className="text-white font-display-xl text-display-xl tracking-tight mb-md">CookSuite</h2>
            <p className="text-white/90 font-body-lg text-body-lg max-w-sm">
              Precision in every recipe. Efficiency in every meal plan. Elevate your culinary discipline with the workspace designed for the professional chef in you.
            </p>
          </div>
        </div>

        {/* Registration Form Section */}
        <div className="w-full lg:w-1/2 p-xl lg:px-20 flex flex-col justify-center bg-white py-12">
          {/* Header */}
          <div className="mb-xl">
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-xs">Create your workspace</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Join thousands of culinary professionals using CookSuite to manage their kitchens.</p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Divider */}
          <div className="relative my-xl flex items-center">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="mx-md font-label-sm text-label-sm text-on-surface-variant bg-white px-md tracking-widest uppercase">Or</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          {/* Social Options */}
          <div className="grid grid-cols-2 gap-md">
            <button className="flex items-center justify-center gap-sm py-md px-lg bg-surface-container border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors">
              <Image alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5czUxjGEq7bgmjUe--2oQLhZN7a230pr2nfGxB_UjbuPZ-jeNTZguSAPJ1ExUBIK9uI7RwO3kEVCBNJ5vcyngRmJ0cuRTUihkHQWm7flbQk4mooYwqECoI-uODmjpQcgYyBeFzfl7T55zCk7DA4RbOGS2C1_Bz0iyzers3aON8V6Y7m29Jk1hyqLst5DZm0SrHmnPmq-lwcyQdy6Nnsakv5VH6oKCWnNIynjuvp1enW57gHRyzGJjUIpfE73L_TwCgSBLVMXgWw72" />
              Google
            </button>
            <button className="flex items-center justify-center gap-sm py-md px-lg bg-surface-container border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors">
              <Apple className="h-5 w-5 fill-on-surface" />
              Apple
            </button>
          </div>

          {/* Footer Links */}
          <div className="mt-xl pt-lg border-t border-outline-variant text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have an account? <Link className="text-primary font-semibold hover:underline" href="/login">Sign in</Link>
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
