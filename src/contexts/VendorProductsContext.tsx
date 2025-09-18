import React, { createContext, useContext, useState, useEffect } from 'react';
import { VendorProduct } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

interface VendorProductsContextType {
  products: VendorProduct[];
  isLoading: boolean;
  addProduct: (product: Omit<VendorProduct, 'id' | 'createdAt' | 'updatedAt'>) => Promise<VendorProduct | null>;
  updateProduct: (id: number, updates: Partial<VendorProduct>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  getProductsByStatus: (status: VendorProduct['status']) => VendorProduct[];
  getRecentProducts: (limit?: number) => VendorProduct[];
  refreshProducts: () => Promise<void>;
  calculateStats: () => {
    totalProducts: number;
    activeProducts: number;
    pendingProducts: number;
    draftProducts: number;
    rejectedProducts: number;
    totalSales: number;
    monthlyRevenue: number;
    totalOrders: number;
  };
}

const VendorProductsContext = createContext<VendorProductsContextType | undefined>(undefined);

export const useVendorProducts = () => {
  const context = useContext(VendorProductsContext);
  if (!context) {
    throw new Error('useVendorProducts must be used within a VendorProductsProvider');
  }
  return context;
};

export const VendorProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                               import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await loadProductsFromSupabase();
      } else {
        await loadProductsFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading products:', error);
      await loadProductsFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductsFromSupabase = async () => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setProducts([]);
        return;
      }

      // Get vendor ID from vendors table
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (vendorError || !vendorData) {
        console.error('Error fetching vendor:', vendorError);
        setProducts([]);
        return;
      }

      // Fetch vendor products
      const { data: productsData, error: productsError } = await supabase
        .from('vendor_products')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        return;
      }

      if (productsData) {
        const formattedProducts: VendorProduct[] = productsData.map(product => ({
          id: product.id,
          vendorId: product.vendor_id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.original_price || undefined,
          category: product.category,
          images: product.images || [],
          image: (product.images && product.images.length > 0) ? product.images[0] : '',
          sizes: product.sizes || [],
          status: product.status,
          isNew: false, // You might want to add this to the database
          isSale: !!product.original_price,
          inStock: product.is_active,
          reviews: [],
          averageRating: 0,
          totalReviews: 0,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error loading products from Supabase:', error);
      throw error;
    }
  };

  const loadProductsFromLocalStorage = async () => {
    try {
      const stored = localStorage.getItem('vendorProducts');
      if (stored) {
        const storedProducts = JSON.parse(stored);
        setProducts(storedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
      setProducts([]);
    }
  };

  const saveProductsToLocalStorage = (productsToSave: VendorProduct[]) => {
    try {
      localStorage.setItem('vendorProducts', JSON.stringify(productsToSave));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  };

  const addProduct = async (productData: Omit<VendorProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<VendorProduct | null> => {
    try {
      const now = new Date().toISOString();
      let newProduct: VendorProduct;

      if (isSupabaseConfigured) {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast.error('You must be logged in to add products');
          return null;
        }

        // Get vendor ID
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (vendorError || !vendorData) {
          toast.error('Vendor not found');
          return null;
        }

        // Insert product into Supabase
        const { data: insertedProduct, error: insertError } = await supabase
          .from('vendor_products')
          .insert({
            vendor_id: vendorData.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            original_price: productData.originalPrice,
            category: productData.category,
            images: productData.images,
            sizes: productData.sizes,
            status: 'pending', // Always set to pending for admin review
            is_active: productData.inStock
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting product:', insertError);
          toast.error('Failed to add product');
          return null;
        }

        newProduct = {
          id: insertedProduct.id,
          vendorId: insertedProduct.vendor_id,
          name: insertedProduct.name,
          description: insertedProduct.description,
          price: insertedProduct.price,
          originalPrice: insertedProduct.original_price || undefined,
          category: insertedProduct.category,
          images: insertedProduct.images || [],
          image: (insertedProduct.images && insertedProduct.images.length > 0) ? insertedProduct.images[0] : '',
          sizes: insertedProduct.sizes || [],
          status: insertedProduct.status,
          isNew: false,
          isSale: !!insertedProduct.original_price,
          inStock: insertedProduct.is_active,
          reviews: [],
          averageRating: 0,
          totalReviews: 0,
          createdAt: insertedProduct.created_at,
          updatedAt: insertedProduct.updated_at
        };
      } else {
        // Fallback to localStorage
        newProduct = {
          ...productData,
          id: Date.now(),
          createdAt: now,
          updatedAt: now,
          reviews: [],
          averageRating: 0,
          totalReviews: 0
        };
      }

      const updatedProducts = [newProduct, ...products];
      setProducts(updatedProducts);

      if (!isSupabaseConfigured) {
        saveProductsToLocalStorage(updatedProducts);
      }

      toast.success('Product added successfully!');
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
      return null;
    }
  };

  const updateProduct = async (id: number, updates: Partial<VendorProduct>): Promise<boolean> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('vendor_products')
          .update({
            name: updates.name,
            description: updates.description,
            price: updates.price,
            original_price: updates.originalPrice,
            category: updates.category,
            images: updates.images,
            sizes: updates.sizes,
            status: updates.status,
            is_active: updates.inStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating product:', error);
          toast.error('Failed to update product');
          return false;
        }
      }

      const updatedProducts = products.map(product =>
        product.id === id
          ? { ...product, ...updates, updatedAt: new Date().toISOString() }
          : product
      );
      setProducts(updatedProducts);

      if (!isSupabaseConfigured) {
        saveProductsToLocalStorage(updatedProducts);
      }

      toast.success('Product updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      return false;
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('vendor_products')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting product:', error);
          toast.error('Failed to delete product');
          return false;
        }
      }

      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);

      if (!isSupabaseConfigured) {
        saveProductsToLocalStorage(updatedProducts);
      }

      toast.success('Product deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      return false;
    }
  };

  const getProductsByStatus = (status: VendorProduct['status']): VendorProduct[] => {
    return products.filter(product => product.status === status);
  };

  const getRecentProducts = (limit: number = 5): VendorProduct[] => {
    return products
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const activeProducts = getProductsByStatus('approved').length;
    const pendingProducts = getProductsByStatus('pending').length;
    const draftProducts = getProductsByStatus('draft').length;
    const rejectedProducts = getProductsByStatus('rejected').length;
    
    // Real data - starts at 0 and will populate when orders are implemented
    const totalSales = 0;
    const monthlyRevenue = 0;
    const totalOrders = 0;
    
    return {
      totalProducts,
      activeProducts,
      pendingProducts,
      draftProducts,
      rejectedProducts,
      totalSales,
      monthlyRevenue,
      totalOrders
    };
  };

  const refreshProducts = async (): Promise<void> => {
    await loadProducts();
  };

  return (
    <VendorProductsContext.Provider value={{
      products,
      isLoading,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductsByStatus,
      getRecentProducts,
      refreshProducts,
      calculateStats
    }}>
      {children}
    </VendorProductsContext.Provider>
  );
};

export default VendorProductsProvider;