import React, { createContext, useContext, useState, useEffect } from 'react';
import { Admin, AdminAuthContextType } from '@/types';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                               import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      setIsLoading(true);
      
      // Always check localStorage first for fallback admin session
      const stored = localStorage.getItem('admin_session');
      if (stored) {
        try {
          const adminData = JSON.parse(stored);
          console.log('💾 Found stored admin session:', adminData.email);
          setAdmin(adminData);
          return;
        } catch (error) {
          console.error('Error parsing stored admin session:', error);
          localStorage.removeItem('admin_session');
        }
      }
      
      if (!isSupabaseConfigured) {
        console.log('⚠️ Supabase not configured, using localStorage only');
        return;
      }

      // Check if user is authenticated with Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('🚫 No Supabase session found');
        setAdmin(null);
        return;
      }

      // Fetch admin profile from Supabase
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching admin:', error);
        setAdmin(null);
        return;
      }

      if (adminData) {
        const admin: Admin = {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
          role: adminData.role,
          permissions: adminData.permissions || [],
          isActive: adminData.is_active,
          lastLogin: adminData.last_login,
          createdAt: adminData.created_at
        };
        setAdmin(admin);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Admin login attempt:', { email, isSupabaseConfigured });
      
      if (!isSupabaseConfigured) {
        console.log('📝 Using fallback authentication');
        // Fallback authentication for development
        if (email === 'admin@clothify.com' && password === 'admin123') {
          console.log('✅ Credentials match - logging in');
          const mockAdmin: Admin = {
            id: 'mock-admin-1',
            email: 'admin@clothify.com',
            name: 'System Administrator',
            role: 'super_admin',
            permissions: [
              { resource: 'vendors', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject'] },
              { resource: 'products', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject'] },
              { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
              { resource: 'orders', actions: ['create', 'read', 'update', 'delete'] },
              { resource: 'analytics', actions: ['read'] },
              { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] }
            ],
            isActive: true,
            lastLogin: new Date().toISOString(),
            createdAt: '2024-01-01T00:00:00.000Z'
          };
          setAdmin(mockAdmin);
          localStorage.setItem('admin_session', JSON.stringify(mockAdmin));
          toast.success('Successfully logged in as Administrator!');
          return true;
        } else {
          console.log('❌ Credentials do not match:', { email, password: password.length + ' chars' });
          toast.error('Invalid admin credentials');
          return false;
        }
      }

      console.log('🔍 Supabase is configured, attempting Supabase auth');
      
      // Try Supabase authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('⚠️ Supabase auth failed, trying fallback:', error.message);
        
        // If Supabase auth fails, try fallback for admin
        if (email === 'admin@clothify.com' && password === 'admin123') {
          console.log('✅ Using fallback admin credentials');
          const mockAdmin: Admin = {
            id: 'mock-admin-1',
            email: 'admin@clothify.com',
            name: 'System Administrator',
            role: 'super_admin',
            permissions: [
              { resource: 'vendors', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject'] },
              { resource: 'products', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject'] },
              { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
              { resource: 'orders', actions: ['create', 'read', 'update', 'delete'] },
              { resource: 'analytics', actions: ['read'] },
              { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] }
            ],
            isActive: true,
            lastLogin: new Date().toISOString(),
            createdAt: '2024-01-01T00:00:00.000Z'
          };
          setAdmin(mockAdmin);
          localStorage.setItem('admin_session', JSON.stringify(mockAdmin));
          toast.success('Successfully logged in as Administrator!');
          return true;
        }
        
        toast.error('Login failed: ' + error.message);
        return false;
      }

      if (data.user) {
        // Check if admin profile exists
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (adminError) {
          toast.error('No admin profile found. Access denied.');
          return false;
        }

        if (adminData && adminData.is_active) {
          // Update last login
          await supabase
            .from('admins')
            .update({ last_login: new Date().toISOString() })
            .eq('id', adminData.id);

          const admin: Admin = {
            id: adminData.id,
            email: adminData.email,
            name: adminData.name,
            role: adminData.role,
            permissions: adminData.permissions || [],
            isActive: adminData.is_active,
            lastLogin: new Date().toISOString(),
            createdAt: adminData.created_at
          };
          setAdmin(admin);
          toast.success('Successfully logged in!');
          return true;
        } else {
          toast.error('Admin account is not active. Access denied.');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Admin logging out');
      
      // Clear Supabase session if configured
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      
      // Always clear localStorage
      localStorage.removeItem('admin_session');
      setAdmin(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if Supabase logout fails
      localStorage.removeItem('admin_session');
      setAdmin(null);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!admin) return false;
    
    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;
    
    // Check specific permissions
    const permission = admin.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action as any) : false;
  };

  return (
    <AdminAuthContext.Provider value={{
      admin,
      login,
      logout,
      isLoading,
      hasPermission
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;