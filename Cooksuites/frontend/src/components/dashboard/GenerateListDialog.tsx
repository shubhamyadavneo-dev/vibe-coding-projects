'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Loader2 } from 'lucide-react';

interface GenerateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  isGenerating: boolean;
  selectedCount: number;
}

export const GenerateListDialog: React.FC<GenerateListDialogProps> = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isGenerating,
  selectedCount
}) => {
  const [name, setName] = useState(`My Weekly List (${new Date().toLocaleDateString()})`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-emerald-900 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-orange-500" />
            Name Your List
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-4">
          <p className="text-zinc-500 text-sm">
            Generating an aggregated list from <strong>{selectedCount}</strong> selected recipes.
          </p>
          <div className="space-y-2">
            <Label htmlFor="list-name" className="text-zinc-700 font-bold ml-1">Shopping List Name</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekend Brunch Prep"
              className="rounded-2xl border-zinc-200 focus:border-orange-500 focus:ring-orange-500 py-6"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(name)} 
            disabled={!name.trim() || isGenerating}
            className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-8 h-12 shadow-lg shadow-emerald-100"
          >
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Generate List'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
