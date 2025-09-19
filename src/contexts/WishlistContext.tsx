import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { products } from '@/data/products';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface WishlistContextType {
  wishlistItems: Product[];
  wishlistIds: number[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
  isLoading?: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                               import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

  useEffect(() => {
    if (user) {
      loadWishlistItems();
    } else {
      // Load from localStorage when no user is logged in
      const savedWishlist = localStorage.getItem('clothify-wishlist');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) {
            setWishlistIds(parsedWishlist);
          }
        } catch (error) {
          console.error('Error parsing wishlist from localStorage:', error);
          localStorage.removeItem('clothify-wishlist');
        }
      }
    }
  }, [user]);

  useEffect(() => {
    // Always save to localStorage as backup
    localStorage.setItem('clothify-wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const loadWishlistItems = async () => {
    if (!user || !isSupabaseConfigured) {
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading wishlist items:', error);
        return;
      }

      if (data) {
        const productIds = data.map(item => item.product_id);
        setWishlistIds(productIds);
      }
    } catch (error) {
      console.error('Error loading wishlist items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWishlistItem = async (product: Product, action: 'add' | 'remove') => {
    if (!user || !isSupabaseConfigured) {
      return;
    }

    try {
      if (action === 'remove') {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) {
          console.error('Error removing wishlist item:', error);
        }
      } else {
        const wishlistItemData = {
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image,
          product_category: product.category
        };

        const { error } = await supabase
          .from('wishlist_items')
          .insert(wishlistItemData);

        if (error) {
          console.error('Error adding wishlist item:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing wishlist item:', error);
    }
  };

  // Get wishlist items by finding products that match the stored IDs
  const wishlistItems = wishlistIds
    .map(id => products.find(product => product.id === id))
    .filter((product): product is Product => product !== undefined);

  const addToWishlist = async (product: Product) => {
    if (!wishlistIds.includes(product.id)) {
      setWishlistIds(prev => [...prev, product.id]);
      
      // Sync with Supabase
      syncWishlistItem(product, 'add');
      
      toast.success(`${product.name} added to favorites!`, {
        description: "You can view all your favorites in your profile."
      });
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    
    setWishlistIds(prev => prev.filter(id => id !== productId));
    
    // Sync with Supabase
    if (product) {
      syncWishlistItem(product, 'remove');
      toast.success(`${product.name} removed from favorites!`);
    }
  };

  const toggleWishlist = (product: Product) => {
    if (wishlistIds.includes(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistIds.includes(productId);
  };

  const clearWishlist = async () => {
    setWishlistIds([]);
    
    // Clear from Supabase
    if (user && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error clearing wishlist:', error);
        }
      } catch (error) {
        console.error('Error clearing wishlist:', error);
      }
    }
    
    toast.success('Wishlist cleared!');
  };

  const wishlistCount = wishlistIds.length;

  const value: WishlistContextType = {
    wishlistItems,
    wishlistIds,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount,
    isLoading
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};