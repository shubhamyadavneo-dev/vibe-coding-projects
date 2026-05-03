'use client';

import React from 'react';
import { useCreateCookbookMutation } from '@/store/api/cookbookApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const cookbookSchema = Yup.object({
  name: Yup.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: Yup.string().max(500, 'Description is too long'),
});

export default function CreateCookbookPage() {
  const router = useRouter();
  const [createCookbook, { isLoading }] = useCreateCookbookMutation();

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema: cookbookSchema,
    onSubmit: async (values) => {
      try {
        await createCookbook(values).unwrap();
        toast.success('Cookbook created successfully!');
        router.push('/cookbooks');
      } catch {
        toast.error('Failed to create cookbook.');
      }
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 md:ml-64 pt-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-zinc-500 hover:text-emerald-900 transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Cookbooks
        </button>

        <div>
          <h1 className="text-4xl font-bold text-emerald-900 tracking-tight">Create New Cookbook</h1>
          <p className="text-zinc-500 font-medium mt-2">Give your collection a name and a brief description.</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-700 font-bold ml-1">Cookbook Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Italian Family Secrets"
              className="rounded-2xl border-zinc-200 focus:border-orange-500 focus:ring-orange-500 py-6"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="text-red-500 text-xs font-medium ml-1">{formik.errors.name}</div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-700 font-bold ml-1">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell us what this collection is about..."
              className="rounded-2xl border-zinc-200 focus:border-orange-500 focus:ring-orange-500 min-h-[120px]"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
            />
            {formik.touched.description && formik.errors.description ? (
              <div className="text-red-500 text-xs font-medium ml-1">{formik.errors.description}</div>
            ) : null}
          </div>

          <div className="pt-4 flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl py-6 h-auto font-bold text-lg shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Create Collection'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-2xl py-6 h-auto px-8 border-zinc-200 text-zinc-500 hover:bg-zinc-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
