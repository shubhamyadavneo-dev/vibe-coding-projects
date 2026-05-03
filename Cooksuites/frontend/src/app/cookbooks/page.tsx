'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { ListingHeader } from '@/components/shared/ListingHeader';
import { cookbookService } from '@/services/cookbookService';
import { Cookbook } from '@/store/api/cookbookApi';
import { 
  Loader2, 
  BookOpen, 
  AlertCircle, 
  Pencil, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { CookbookDialog } from '@/components/cookbooks/CookbookDialog';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function CookbooksPage() {
  const router = useRouter();
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedCookbook, setSelectedCookbook] = useState<Cookbook | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCookbooks = async () => {
    try {
      setLoading(true);
      const response = await cookbookService.getCookbooks();
      setCookbooks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cookbooks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCookbooks();
  }, []);

  const handleEditClick = (e: React.MouseEvent, cookbook: Cookbook) => {
    e.stopPropagation();
    setSelectedCookbook(cookbook);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, cookbook: Cookbook) => {
    e.stopPropagation();
    setSelectedCookbook(cookbook);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCookbook) return;
    try {
      setIsDeleting(true);
      const res = await cookbookService.deleteCookbook(selectedCookbook.id);
      if (res.success) {
        toast.success('Cookbook deleted successfully');
        setIsDeleteConfirmOpen(false);
        fetchCookbooks();
      } else {
        throw new Error('Failed to delete cookbook');
      }
    } catch (err) {
      toast.error('Failed to delete cookbook');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <ListingHeader 
          title="Cookbooks" 
          onAddClick={() => {
            setSelectedCookbook(null);
            setDialogMode('create');
            setIsDialogOpen(true);
          }}
          addButtonLabel="New Cookbook"
        />

        <CookbookDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          onSuccess={fetchCookbooks}
          initialData={selectedCookbook ? {
            id: selectedCookbook.id,
            name: selectedCookbook.name,
            description: selectedCookbook.description
          } : undefined}
          mode={dialogMode}
        />

        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-emerald-900">Delete Cookbook?</DialogTitle>
              <DialogDescription className="text-zinc-500">
                Are you sure you want to delete "{selectedCookbook?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)} className="rounded-xl">Cancel</Button>
              <Button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cookbooks.map(cookbook => (
            <Card key={cookbook.id} className="group overflow-hidden border-zinc-100 rounded-[2rem] hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500 cursor-pointer" onClick={() => router.push(`/cookbooks/${cookbook.id}`)}>
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-emerald-50 flex items-center justify-center relative overflow-hidden">
                  <BookOpen className="h-16 w-16 text-emerald-200 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent" />
                  
                  {/* Actions Overlay */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={(e) => handleEditClick(e, cookbook)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(e, cookbook)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-emerald-900 mb-1">{cookbook.name}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{cookbook.description || 'No description provided.'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {cookbook._count?.recipes || 0} Recipes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {loading && !cookbooks.length && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-100 animate-pulse rounded-[2rem]" />
            ))
          )}
        </div>

        {!loading && cookbooks.length === 0 && (
          <div className="p-24 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 flex flex-col items-center">
            <BookOpen className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-xl font-bold text-emerald-900">No cookbooks yet</p>
            <p className="text-sm">Start organizing your recipes into themed collections.</p>
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
