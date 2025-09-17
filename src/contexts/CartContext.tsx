import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { CartItem, Product, CartContextType } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

type CartProviderProps = {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                               import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      // Load from localStorage when no user is logged in
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          setItems(JSON.parse(storedCart));
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem('cart');
        }
      }
    }
  }, [user]);

  useEffect(() => {
    // Always save to localStorage as backup
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const loadCartItems = async () => {
    if (!user || !isSupabaseConfigured) {
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading cart items:', error);
        return;
      }

      if (data) {
        const cartItems: CartItem[] = data.map(item => ({
          product: {
            id: item.product_id,
            name: item.product_name,
            price: item.product_price,
            image: item.product_image,
            category: item.product_category,
            description: item.product_description || '',
            sizes: item.product_sizes ? JSON.parse(item.product_sizes) : ['XS', 'S', 'M', 'L', 'XL'],
            inStock: true,
            reviews: [],
            averageRating: item.product_average_rating || 4.5,
            totalReviews: item.product_total_reviews || 0
          } as Product,
          size: item.size,
          quantity: item.quantity
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncCartItem = async (product: Product, size: string, quantity: number, action: 'upsert' | 'delete' = 'upsert') => {
    if (!user || !isSupabaseConfigured) {
      return;
    }

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .eq('size', size);

        if (error) {
          console.error('Error deleting cart item:', error);
        }
      } else {
        const cartItemData = {
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image,
          product_category: product.category,
          size: size,
          quantity: quantity
        };

        const { error } = await supabase
          .from('cart_items')
          .upsert(cartItemData, {
            onConflict: 'user_id,product_id,size',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error syncing cart item:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing cart item:', error);
    }
  };

  // Memoize expensive operations
  const addItem = useCallback(async (product: Product, size: string, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && item.size === size
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        updatedItems[existingItemIndex].quantity = newQuantity;
        
        // Sync with Supabase
        syncCartItem(product, size, newQuantity);
      } else {
        // Add new item
        updatedItems = [...prevItems, { product, size, quantity }];
        
        // Sync with Supabase
        syncCartItem(product, size, quantity);
      }
      
      return updatedItems;
    });

    toast.success(`${product.name} added to cart!`);
  }, [items, user, isSupabaseConfigured]);

  const removeItem = useCallback(async (productId: number, size: string) => {
    const itemToRemove = items.find(item => item.product.id === productId && item.size === size);
    
    setItems(prevItems =>
      prevItems.filter(item => !(item.product.id === productId && item.size === size))
    );

    // Sync with Supabase
    if (itemToRemove) {
      syncCartItem(itemToRemove.product, size, 0, 'delete');
      toast.success(`${itemToRemove.product.name} removed from cart!`);
    }
  }, [items, user, isSupabaseConfigured]);

  const updateQuantity = useCallback(async (productId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }

    const product = items.find(item => item.product.id === productId && item.size === size)?.product;
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );

    // Sync with Supabase
    if (product) {
      syncCartItem(product, size, quantity);
    }
  }, [items]);

  const clearCart = useCallback(async () => {
    setItems([]);
    
    // Clear from Supabase
    if (user && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error clearing cart:', error);
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }

    toast.success('Cart cleared!');
  }, [user, isSupabaseConfigured]);

  // Memoize computed values
  const total = useMemo(() => 
    items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0), 
    [items]
  );
  
  const itemCount = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  );

  // Memoize context value
  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    isLoading
  }), [items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, isLoading]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};