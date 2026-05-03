'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { ListingHeader } from '@/components/shared/ListingHeader';
import { shoppingListService } from '@/services/shoppingListService';
import { ShoppingList } from '@/store/api/shoppingListApi';
import { ShoppingCart, AlertCircle, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ShoppingListPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await shoppingListService.getShoppingLists();
      setLists(response.data);
    } catch (err) {
      setError('Failed to fetch shopping lists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this list?')) return;
    try {
      await shoppingListService.deleteShoppingList(id);
      toast.success('List deleted');
      fetchLists();
    } catch {
      toast.error('Failed to delete list');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <ListingHeader 
          title="Shopping Lists" 
          onAddClick={() => router.push('/dashboard')}
          addButtonLabel="Generate New"
        />

        <div className="grid grid-cols-1 gap-4">
          {lists.map(list => (
            <Card 
              key={list.id} 
              className="group overflow-hidden border-zinc-100 rounded-3xl hover:border-emerald-200 transition-all cursor-pointer" 
              onClick={() => router.push(`/shopping-list/${list.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center flex-none">
                    <ShoppingCart className="h-8 w-8 text-emerald-700" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-emerald-900 mb-1">{list.name}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                      <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                      <span className="h-1 w-1 rounded-full bg-zinc-200" />
                      <span className="text-emerald-700">{list._count?.items || 0} items</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleDelete(e, list.id)}
                      className="text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                    <ChevronRight className="h-6 w-6 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {loading && !lists.length && (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-zinc-100 animate-pulse rounded-3xl" />
            ))
          )}
        </div>

        {!loading && lists.length === 0 && (
          <div className="p-24 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-xl font-bold text-emerald-900">All caught up!</p>
            <p className="text-sm">Generate a shopping list from your favorite recipes.</p>
          </div>
        )}

        {error && (
          <div className="p-12 text-center border-2 border-dashed border-red-100 rounded-[3rem] text-red-500 flex flex-col items-center">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="font-bold">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
