'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { shoppingListService } from '@/services/shoppingListService';
import { ShoppingList } from '@/store/api/shoppingListApi';
import { 
  ChevronLeft, 
  ShoppingCart, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Printer, 
  Share2, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ShoppingListDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await shoppingListService.getShoppingListById(id as string);
      setList(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load shopping list');
      router.push('/shopping-list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchList();
  }, [id]);

  const handleToggle = async (itemId: string) => {
    try {
      await shoppingListService.toggleShoppingItem(itemId);
      // Optimistic update
      setList(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId ? { ...item, isPurchased: !item.isPurchased } : item
          )
        };
      });
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this list?')) return;
    try {
      await shoppingListService.deleteShoppingList(id as string);
      toast.success('List deleted');
      router.push('/shopping-list');
    } catch (err) {
      toast.error('Failed to delete list');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!list) return null;

  const purchasedCount = list.items.filter(i => i.isPurchased).length;
  const progress = (purchasedCount / list.items.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-8">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/shopping-list')}
                className="rounded-full hover:bg-emerald-50 text-emerald-900"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-3xl font-black text-emerald-900 tracking-tight">{list.name}</h1>
                <p className="text-sm text-zinc-500 font-medium">
                  {new Date(list.createdAt).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
              <Button variant="outline" className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDelete}
                className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>

          {/* Progress Section */}
          <Card className="border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden bg-emerald-50/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-1">List Progress</h3>
                    <p className="text-sm text-zinc-500 font-medium">
                      You've picked up <span className="text-emerald-700 font-bold">{purchasedCount}</span> of {list.items.length} items
                    </p>
                  </div>
                </div>
                <div className="flex-grow max-w-md w-full">
                  <div className="h-3 w-full bg-emerald-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            {list.items.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={cn(
                  "group flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer",
                  item.isPurchased 
                    ? "bg-zinc-50 border-zinc-100 opacity-60" 
                    : "bg-white border-zinc-100 hover:border-emerald-200 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-none">
                    {item.isPurchased ? (
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    ) : (
                      <Circle className="h-8 w-8 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
                    )}
                  </div>
                  <div>
                    <h4 className={cn(
                      "text-lg font-bold transition-all",
                      item.isPurchased ? "text-zinc-400 line-through" : "text-emerald-900"
                    )}>
                      {item.name}
                    </h4>
                    <p className="text-sm text-zinc-500 font-medium">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
                
                {!item.isPurchased && (
                  <div className="hidden md:block">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {list.items.length === 0 && (
            <div className="p-24 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 flex flex-col items-center">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-xl font-bold text-emerald-900">Your list is empty</p>
              <p className="text-sm">There are no items in this shopping list.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
