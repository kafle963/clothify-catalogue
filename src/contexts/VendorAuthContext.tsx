import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vendor, VendorAuthContextType, VendorSignupData } from '@/types';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined);

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider');
  }
  return context;
};

export const VendorAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                               import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

  useEffect(() => {
    checkVendorSession();
  }, []);

  const checkVendorSession = async () => {
    try {
      setIsLoading(true);
      
      // Check localStorage first for fallback session
      const stored = localStorage.getItem('vendor_session');
      if (stored) {
        try {
          const vendorData = JSON.parse(stored);
          setVendor(vendorData);
          return;
        } catch (error) {
          localStorage.removeItem('vendor_session');
        }
      }
      
      if (!isSupabaseConfigured) {
        setVendor(null);
        return;
      }

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setVendor(null);
        return;
      }

      // Fetch vendor profile from Supabase
      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching vendor:', error);
        setVendor(null);
        return;
      }

      if (vendorData) {
        const vendor: Vendor = {
          id: vendorData.id,
          email: vendorData.email,
          name: vendorData.name,
          businessName: vendorData.business_name,
          description: vendorData.description || undefined,
          phone: vendorData.phone || undefined,
          profileImage: vendorData.profile_image || undefined,
          website: vendorData.website || undefined,
          taxId: vendorData.tax_id || undefined,
          socialMedia: vendorData.social_media || undefined,
          address: vendorData.address_street ? {
            street: vendorData.address_street,
            city: vendorData.address_city || '',
            state: vendorData.address_state || '',
            zipCode: vendorData.address_zip_code || '',
            country: vendorData.address_country || 'United States'
          } : undefined,
          isApproved: vendorData.is_approved,
          joinedDate: vendorData.created_at.split('T')[0]
        };
        setVendor(vendor);
      }
    } catch (error) {
      console.error('Error checking vendor session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured) {
        // Fallback authentication for development
        if (email === 'vendor@clothify.com' && password === 'vendor123') {
          const mockVendor: Vendor = {
            id: 'mock-vendor-1',
            email: 'vendor@clothify.com',
            name: 'Demo Vendor',
            businessName: 'Demo Fashion Store',
            description: 'A demo vendor account for testing',
            phone: '+1-555-0123',
            isApproved: true,
            joinedDate: new Date().toISOString().split('T')[0]
          };
          setVendor(mockVendor);
          localStorage.setItem('vendor_session', JSON.stringify(mockVendor));
          toast.success('Successfully logged in as Demo Vendor!');
          return true;
        } else {
          toast.error('Invalid credentials. Use vendor@clothify.com / vendor123 for demo.');
          return false;
        }
      }

      // Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('Login failed: ' + error.message);
        return false;
      }

      if (data.user) {
        // Check if vendor profile exists
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (vendorError) {
          toast.error('No vendor profile found. Please sign up as a vendor.');
          return false;
        }

        if (vendorData && vendorData.is_approved) {
          const vendor: Vendor = {
            id: vendorData.id,
            email: vendorData.email,
            name: vendorData.name,
            businessName: vendorData.business_name,
            description: vendorData.description || undefined,
            phone: vendorData.phone || undefined,
            profileImage: vendorData.profile_image || undefined,
            website: vendorData.website || undefined,
            taxId: vendorData.tax_id || undefined,
            socialMedia: vendorData.social_media || undefined,
            address: vendorData.address_street ? {
              street: vendorData.address_street,
              city: vendorData.address_city || '',
              state: vendorData.address_state || '',
              zipCode: vendorData.address_zip_code || '',
              country: vendorData.address_country || 'United States'
            } : undefined,
            isApproved: vendorData.is_approved,
            joinedDate: vendorData.created_at.split('T')[0]
          };
          setVendor(vendor);
          toast.success('Successfully logged in!');
          return true;
        } else if (vendorData && !vendorData.is_approved) {
          toast.error('Your vendor account is pending approval. Please wait for admin approval.');
          return false;
        }
      }

      return false;
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const signup = async (data: VendorSignupData): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured) {
        // Fallback signup for development
        const mockVendor: Vendor = {
          id: 'mock-vendor-' + Date.now(),
          email: data.email,
          name: data.name,
          businessName: data.businessName,
          description: data.description,
          phone: data.phone,
          isApproved: false,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setVendor(mockVendor);
        localStorage.setItem('vendor_session', JSON.stringify(mockVendor));
        toast.success('Account created successfully! Your account is pending approval.');
        return true;
      }

      // Supabase signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          }
        }
      });

      if (authError) {
        toast.error('Signup failed: ' + authError.message);
        return false;
      }

      if (authData.user) {
        // Create vendor profile
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            user_id: authData.user.id,
            email: data.email,
            name: data.name,
            business_name: data.businessName,
            description: data.description,
            phone: data.phone,
            is_approved: false
          })
          .select()
          .single();

        if (vendorError) {
          toast.error('Failed to create vendor profile: ' + vendorError.message);
          return false;
        }

        if (vendorData) {
          const newVendor: Vendor = {
            id: vendorData.id,
            email: vendorData.email,
            name: vendorData.name,
            businessName: vendorData.business_name,
            description: vendorData.description || undefined,
            phone: vendorData.phone || undefined,
            isApproved: vendorData.is_approved,
            joinedDate: vendorData.created_at.split('T')[0]
          };
          setVendor(newVendor);
          toast.success('Account created successfully! Your account is pending approval.');
          return true;
        }
      }

      return false;
    } catch (error) {
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      
      localStorage.removeItem('vendor_session');
      setVendor(null);
      toast.success('Logged out successfully');
    } catch (error) {
      localStorage.removeItem('vendor_session');
      setVendor(null);
    }
  };

  const updateProfile = async (updates: Partial<Vendor>) => {
    if (!vendor) return;
    
    try {
      if (!isSupabaseConfigured) {
        console.error('Supabase is not properly configured. Cannot update vendor profile.');
        return;
      }

      // Update in Supabase
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.businessName) updateData.business_name = updates.businessName;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.profileImage !== undefined) updateData.profile_image = updates.profileImage;
      if (updates.website !== undefined) updateData.website = updates.website;
      if (updates.taxId !== undefined) updateData.tax_id = updates.taxId;
      if (updates.socialMedia !== undefined) updateData.social_media = updates.socialMedia;
      if (updates.address) {
        updateData.address_street = updates.address.street;
        updateData.address_city = updates.address.city;
        updateData.address_state = updates.address.state;
        updateData.address_zip_code = updates.address.zipCode;
        updateData.address_country = updates.address.country;
      }

      const { error } = await supabase
        .from('vendors')
        .update(updateData)
        .eq('id', vendor.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile.');
        return;
      }

      const updatedVendor = { ...vendor, ...updates };
      setVendor(updatedVendor);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    }
  };

  return (
    <VendorAuthContext.Provider value={{
      vendor,
      login,
      signup,
      logout,
      updateProfile
    }}>
      {children}
    </VendorAuthContext.Provider>
  );
};

export default VendorAuthProvider;
