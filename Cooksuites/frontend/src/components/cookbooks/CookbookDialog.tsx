'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cookbookService } from '@/services/cookbookService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const cookbookSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  description: z.string().max(200).optional(),
});

type CookbookFormValues = z.infer<typeof cookbookSchema>;

interface CookbookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: { id: string; name: string; description?: string | null };
  mode?: 'create' | 'edit';
}

export function CookbookDialog({ open, onOpenChange, onSuccess, initialData, mode = 'create' }: CookbookDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CookbookFormValues>({
    resolver: zodResolver(cookbookSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || '',
        description: initialData?.description || '',
      });
    }
  }, [open, initialData, form]);

  const onSubmit = async (values: CookbookFormValues) => {
    setIsSubmitting(true);
    try {
      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await cookbookService.updateCookbook(initialData.id, values);
      } else {
        res = await cookbookService.createCookbook(values);
      }

      if (res.success) {
        toast.success(mode === 'edit' ? 'Cookbook updated successfully' : 'Cookbook created successfully');
        form.reset();
        onOpenChange(false);
        onSuccess();
      } else {
        throw new Error(`Failed to ${mode} cookbook`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-emerald-900">
            {mode === 'edit' ? 'Edit Cookbook' : 'New Cookbook'}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            {mode === 'edit' 
              ? 'Update your collection details.' 
              : 'Create a collection to organize your favorite recipes.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Italian Favorites" 
                      className="rounded-xl border-zinc-200 focus:ring-emerald-500 focus:border-emerald-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A collection of pasta and pizza recipes..." 
                      className="rounded-xl border-zinc-200 focus:ring-emerald-500 focus:border-emerald-500 min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-12 font-bold shadow-lg shadow-emerald-100"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === 'edit' ? 'Save Changes' : 'Create Cookbook'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
