'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ListingHeaderProps {
  title: string;
  onAddClick?: () => void;
  addButtonLabel?: string;
  children?: React.ReactNode;
}

export function ListingHeader({ title, onAddClick, addButtonLabel = 'Add New', children }: ListingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
      <div className="flex-grow">
        <h1 className="text-4xl font-black text-emerald-900 tracking-tight mb-6">{title}</h1>
        <div className="flex flex-wrap items-center gap-4">
          {children}
        </div>
      </div>
      {onAddClick && (
        <div className="flex items-start">
          <Button 
            onClick={onAddClick}
            className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-6 py-6 h-auto font-bold flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            <Plus className="h-5 w-5" />
            {addButtonLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
