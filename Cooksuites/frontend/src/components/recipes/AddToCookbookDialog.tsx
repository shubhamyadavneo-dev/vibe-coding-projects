'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetCookbooksQuery, useAddRecipeToCookbookMutation } from '@/store/api/cookbookApi';
import { Book, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AddToCookbookDialogProps {
  recipeId: string;
}

export const AddToCookbookDialog: React.FC<AddToCookbookDialogProps> = ({ recipeId }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: cookbooksData, isLoading } = useGetCookbooksQuery(undefined, {
    skip: !open,
  });
  const [addRecipe, { isLoading: isAdding }] = useAddRecipeToCookbookMutation();

  const cookbooks = cookbooksData?.data || [];

  const handleAdd = async (cookbookId: string) => {
    try {
      await addRecipe({ cookbookId, recipeId }).unwrap();
      toast.success('Recipe added to cookbook!');
      setOpen(false);
    } catch {
      toast.error('Failed to add recipe to cookbook.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 rounded-xl h-11 border-zinc-200 hover:bg-zinc-50 font-bold transition-all">
          <Book className="h-4 w-4" />
          Add to Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-emerald-900">Choose a Collection</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            </div>
          ) : cookbooks.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-zinc-500">You haven&apos;t created any cookbooks yet.</p>
              <Button onClick={() => router.push('/cookbooks/create')} variant="link" className="text-orange-600">
                Create your first collection
              </Button>
            </div>
          ) : (
            cookbooks.map((cookbook) => (
              <button
                key={cookbook.id}
                onClick={() => handleAdd(cookbook.id)}
                disabled={isAdding}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <Book className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-zinc-900">{cookbook.name}</p>
                    <p className="text-xs text-zinc-400">{cookbook._count?.recipes || 0} recipes</p>
                  </div>
                </div>
                <div className="h-6 w-6 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-500 transition-all">
                  <Plus className="h-4 w-4 text-zinc-300 group-hover:text-white" />
                </div>
              </button>
            ))
          )}
        </div>
        <DialogFooter>
           <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
