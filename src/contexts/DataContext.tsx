import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Vendor, VendorProduct, Order, AdminStats } from '@/types';
import { supabase } from '@/lib/supabase';
import { AdminDataService } from '@/lib/adminUtils';
import { toast } from '@/components/ui/sonner';

interface DataContextType {
  // Data stores
  users: User[];
  vendors: Vendor[];
  products: VendorProduct[];
  orders: Order[];
  
  // Loading states
  isLoadingUsers: boolean;
  isLoadingVendors: boolean;
  isLoadingProducts: boolean;
  isLoadingOrders: boolean;
  
  // Data operations
  refreshAllData: () => Promise<void>;
  addVendor: (vendor: Vendor) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  addProduct: (product: VendorProduct) => void;
  updateProduct: (id: number, updates: Partial<VendorProduct>) => void;
  
  // Analytics functions
  getAdminStats: () => AdminStats;
  getVendorStats: (vendorId: string) => {
    totalProducts: number;
    activeProducts: number;
    pendingProducts: number;
    totalRevenue: number;
    totalOrders: number;
    monthlyRevenue: number;
  };
  
  // Relationship functions
  getUsersByType: (type: 'customer' | 'vendor') => User[];
  getProductsByVendor: (vendorId: string) => VendorProduct[];
  getProductsByStatus: (status: VendorProduct['status']) => VendorProduct[];
  getOrdersByVendor: (vendorId: string) => Order[];
  getRevenueByVendor: (vendorId: string) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data stores
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Loading states
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Check if Supabase is configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                               import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadUsers(),
      loadVendors(),
      loadProducts(),
      loadOrders()
    ]);
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      if (isSupabaseConfigured) {
        // Load from Supabase when available
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        setUsers(data || []);
      } else {
        // Load from localStorage
        const stored = localStorage.getItem('app_users');
        setUsers(stored ? JSON.parse(stored) : []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadVendors = async () => {
    setIsLoadingVendors(true);
    try {
      if (isSupabaseConfigured) {
        // Check if current user is admin
        const { data: { session } } = await supabase.auth.getSession();
        let isAdmin = false;
        
        if (session?.user) {
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('is_active', true)
            .single();
          
          isAdmin = !!adminData;
        }
        
        if (isAdmin) {
          console.log('Admin user detected, loading all vendors');
          const vendors = await AdminDataService.getAllVendors();
          setVendors(vendors);
        } else {
          const { data, error } = await supabase.from('vendors').select('*');
          if (error) throw error;
          
          // Transform Supabase data to our format
          const transformedVendors: Vendor[] = (data || []).map(vendor => ({
            id: vendor.id,
            email: vendor.email,
            name: vendor.name,
            businessName: vendor.business_name,
            description: vendor.description,
            phone: vendor.phone,
            profileImage: vendor.profile_image,
            website: vendor.website,
            taxId: vendor.tax_id,
            socialMedia: vendor.social_media,
            address: vendor.address_street ? {
              street: vendor.address_street,
              city: vendor.address_city || '',
              state: vendor.address_state || '',
              zipCode: vendor.address_zip_code || '',
              country: vendor.address_country || 'United States'
            } : undefined,
            isApproved: vendor.is_approved,
            joinedDate: vendor.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
          }));
          setVendors(transformedVendors);
        }
      } else {
        const stored = localStorage.getItem('app_vendors');
        if (stored) {
          setVendors(JSON.parse(stored));
        } else {
          // Use fallback demo data
          const demoVendors = AdminDataService.getAllVendors();
          setVendors(await demoVendors);
        }
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      // Fallback to demo data
      const demoVendors = await AdminDataService.getAllVendors();
      setVendors(demoVendors);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      if (isSupabaseConfigured) {
        // Check if current user is admin
        const { data: { session } } = await supabase.auth.getSession();
        let isAdmin = false;
        
        if (session?.user) {
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('is_active', true)
            .single();
          
          isAdmin = !!adminData;
        }
        
        if (isAdmin) {
          console.log('Admin user detected, loading all vendor products');
          const products = await AdminDataService.getAllVendorProducts();
          setProducts(products);
        } else {
          // Try to fetch all products without policy restrictions
          let { data, error } = await supabase.from('vendor_products').select('*');
          
          if (error) {
            console.warn('Direct query failed, using fallback data:', error);
            const fallbackProducts = await AdminDataService.getAllVendorProducts();
            setProducts(fallbackProducts);
            return;
          }
          
          // Transform Supabase data to our format
          const transformedProducts: VendorProduct[] = (data || []).map(product => ({
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
            isNew: false,
            isSale: !!product.original_price,
            inStock: product.is_active,
            reviews: [],
            averageRating: 0,
            totalReviews: 0,
            createdAt: product.created_at,
            updatedAt: product.updated_at
          }));
          setProducts(transformedProducts);
        }
      } else {
        const stored = localStorage.getItem('app_products');
        if (stored) {
          setProducts(JSON.parse(stored));
        } else {
          // Use fallback demo data
          const demoProducts = await AdminDataService.getAllVendorProducts();
          setProducts(demoProducts);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Fall back to demo data
      const demoProducts = await AdminDataService.getAllVendorProducts();
      setProducts(demoProducts);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      if (isSupabaseConfigured) {
        // TODO: Implement when order table is created
        setOrders([]);
      } else {
        const stored = localStorage.getItem('app_orders');
        setOrders(stored ? JSON.parse(stored) : []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const refreshAllData = async () => {
    await loadAllData();
  };

  const addVendor = (vendor: Vendor) => {
    const updatedVendors = [...vendors, vendor];
    setVendors(updatedVendors);
    if (!isSupabaseConfigured) {
      localStorage.setItem('app_vendors', JSON.stringify(updatedVendors));
    }
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    const updatedVendors = vendors.map(vendor =>
      vendor.id === id ? { ...vendor, ...updates } : vendor
    );
    setVendors(updatedVendors);
    
    // Update in Supabase if configured
    if (isSupabaseConfigured) {
      updateVendorInSupabase(id, updates);
    } else {
      localStorage.setItem('app_vendors', JSON.stringify(updatedVendors));
    }
  };

  const updateVendorInSupabase = async (id: string, updates: Partial<Vendor>) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          business_name: updates.businessName,
          description: updates.description,
          phone: updates.phone,
          is_approved: updates.isApproved,
          approval_date: updates.isApproved ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating vendor in Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update vendor in Supabase:', error);
    }
  };

  const addProduct = (product: VendorProduct) => {
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    if (!isSupabaseConfigured) {
      localStorage.setItem('app_products', JSON.stringify(updatedProducts));
    }
  };

  const updateProduct = (id: number, updates: Partial<VendorProduct>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...updates } : product
    );
    setProducts(updatedProducts);
    
    // Update in Supabase if configured
    if (isSupabaseConfigured) {
      updateProductInSupabase(id, updates);
    } else {
      localStorage.setItem('app_products', JSON.stringify(updatedProducts));
    }
  };

  const updateProductInSupabase = async (id: number, updates: Partial<VendorProduct>) => {
    try {
      const { error } = await supabase
        .from('vendor_products')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          original_price: updates.originalPrice,
          category: updates.category,
          status: updates.status,
          approval_date: updates.status === 'approved' ? new Date().toISOString() : null,
          rejected_reason: updates.status === 'rejected' ? 'Rejected by admin' : null,
          is_active: updates.inStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating product in Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update product in Supabase:', error);
    }
  };

  // Analytics functions
  const getAdminStats = (): AdminStats => {
    const totalVendors = vendors.length;
    const pendingVendors = vendors.filter(v => !v.isApproved).length;
    const approvedVendors = vendors.filter(v => v.isApproved).length;
    const rejectedVendors = 0; // TODO: Add rejected status to vendors
    
    const totalProducts = products.length;
    const pendingProducts = products.filter(p => p.status === 'pending').length;
    const approvedProducts = products.filter(p => p.status === 'approved').length;
    const rejectedProducts = products.filter(p => p.status === 'rejected').length;
    
    const totalUsers = users.length;
    const activeUsers = totalUsers; // TODO: Add activity tracking
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const monthlyRevenue = calculateMonthlyRevenue();
    const weeklySignups = calculateWeeklySignups();

    return {
      totalVendors,
      pendingVendors,
      approvedVendors,
      rejectedVendors,
      totalProducts,
      pendingProducts,
      approvedProducts,
      rejectedProducts,
      totalUsers,
      activeUsers,
      totalOrders,
      totalRevenue,
      monthlyRevenue,
      weeklySignups
    };
  };

  const getVendorStats = (vendorId: string) => {
    const vendorProducts = products.filter(p => p.vendorId === vendorId);
    const vendorOrders = orders.filter(order => 
      order.items.some(item => 
        vendorProducts.some(product => product.id === item.product.id)
      )
    );
    
    const totalProducts = vendorProducts.length;
    const activeProducts = vendorProducts.filter(p => p.status === 'approved').length;
    const pendingProducts = vendorProducts.filter(p => p.status === 'pending').length;
    const totalOrders = vendorOrders.length;
    const totalRevenue = vendorOrders.reduce((sum, order) => sum + order.total, 0);
    const monthlyRevenue = calculateVendorMonthlyRevenue(vendorId);

    return {
      totalProducts,
      activeProducts,
      pendingProducts,
      totalRevenue,
      totalOrders,
      monthlyRevenue
    };
  };

  // Helper functions
  const calculateMonthlyRevenue = (): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return orders
      .filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + order.total, 0);
  };

  const calculateVendorMonthlyRevenue = (vendorId: string): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const vendorProducts = products.filter(p => p.vendorId === vendorId);
    
    return orders
      .filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear &&
               order.items.some(item => 
                 vendorProducts.some(product => product.id === item.product.id)
               );
      })
      .reduce((sum, order) => sum + order.total, 0);
  };

  const calculateWeeklySignups = (): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return users.filter(user => {
      // TODO: Add created_at to User interface
      return true; // Placeholder
    }).length;
  };

  // Relationship functions
  const getUsersByType = (type: 'customer' | 'vendor'): User[] => {
    return users.filter(user => user.account_type === type);
  };

  const getProductsByVendor = (vendorId: string): VendorProduct[] => {
    return products.filter(product => product.vendorId === vendorId);
  };

  const getProductsByStatus = (status: VendorProduct['status']): VendorProduct[] => {
    return products.filter(product => product.status === status);
  };

  const getOrdersByVendor = (vendorId: string): Order[] => {
    const vendorProducts = products.filter(p => p.vendorId === vendorId);
    return orders.filter(order => 
      order.items.some(item => 
        vendorProducts.some(product => product.id === item.product.id)
      )
    );
  };

  const getRevenueByVendor = (vendorId: string): number => {
    const vendorOrders = getOrdersByVendor(vendorId);
    return vendorOrders.reduce((sum, order) => sum + order.total, 0);
  };

  return (
    <DataContext.Provider value={{
      // Data stores
      users,
      vendors,
      products,
      orders,
      
      // Loading states
      isLoadingUsers,
      isLoadingVendors,
      isLoadingProducts,
      isLoadingOrders,
      
      // Data operations
      refreshAllData,
      addVendor,
      updateVendor,
      addProduct,
      updateProduct,
      
      // Analytics functions
      getAdminStats,
      getVendorStats,
      
      // Relationship functions
      getUsersByType,
      getProductsByVendor,
      getProductsByStatus,
      getOrdersByVendor,
      getRevenueByVendor
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;