import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, AuthContextType } from '@/types';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using auth context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// AuthProvider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize authentication
    const initializeAuth = async () => {
      // Check if Supabase is properly configured
      const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                   import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                   import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                                   import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';
      
      if (!isSupabaseConfigured) {
        console.error('Supabase is not properly configured. Please set up your environment variables.');
        setLoading(false);
        return;
      }

      try {
        // Add timeout protection for session fetching
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (session?.user) {
          // Add timeout protection for profile fetching
          const profilePromise = fetchUserProfile(session.user);
          const profileTimeout = new Promise((resolve) => 
            setTimeout(() => {
              createFallbackUser(session.user);
              resolve(null);
            }, 8000)
          );
          
          await Promise.race([profilePromise, profileTimeout]);
        }
      } catch (error) {
        console.error('Error in session initialization:', error);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };



    const createFallbackUser = (supabaseUser: SupabaseUser) => {
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        account_type: (supabaseUser.user_metadata?.account_type as 'customer' | 'vendor') || 'customer'
      };
      setUser(fallbackUser);
      console.log('Fallback user created:', fallbackUser.id);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Add timeout protection for profile fetching on auth change
          const profilePromise = fetchUserProfile(session.user);
          const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => {
              console.warn('Profile fetch timeout on auth change, using fallback');
              createFallbackUser(session.user);
              resolve(null);
            }, 8000)
          );
          
          await Promise.race([profilePromise, timeoutPromise]);
        } catch (error) {
          console.error('Error on auth change:', error);
          createFallbackUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('cart');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log('Starting fetchUserProfile for user:', supabaseUser.id);
    console.log('User email:', supabaseUser.email);
    
    try {
      console.log('Attempting to fetch profile from Supabase...');
      
      // First, create a fallback user immediately to ensure functionality
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        account_type: (supabaseUser.user_metadata?.account_type as 'customer' | 'vendor') || 'customer'
      };
      
      // Set fallback user immediately to prevent hanging
      setUser(fallbackUser);
      console.log('Fallback user set, attempting profile fetch...');
      
      let profile = null;
      
      // Add timeout protection for profile query
      const profileQuery = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
        
      const queryTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 5000)
      );
      
      const { data: profileData, error } = await Promise.race([profileQuery, queryTimeout]) as any;
        
      console.log('📝 Profile query completed:', { 
        hasProfile: !!profileData, 
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message 
      });

      if (error && error.code === 'PGRST116') {
        // Profile not found, try to create one
        console.log('Profile not found, attempting to create new profile...');
        
        const newProfileData = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
        };
        
        try {
          const createQuery = supabase
            .from('profiles')
            .insert(newProfileData)
            .select()
            .single();
            
          const createTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile creation timeout')), 5000)
          );
          
          const { data: newProfile, error: createError } = await Promise.race([createQuery, createTimeout]) as any;
          
          if (createError) {
            console.error('Error creating profile:', createError);
            console.log('Keeping fallback user due to create error');
            return;
          }
          
          console.log('Profile created successfully:', newProfile);
          profile = newProfile;
        } catch (createError) {
          console.error('Profile creation failed:', createError);
          console.log('Keeping fallback user due to creation failure');
          return;
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
        console.log('Keeping fallback user due to fetch error');
        return;
      } else {
        profile = profileData;
      }

      // If we successfully got profile data, update the user
      if (profile) {
        const userData: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          account_type: profile.account_type,
          address: profile.street ? {
            street: profile.street,
            city: profile.city || '',
            state: profile.state || '',
            zipCode: profile.zip_code || '',
            country: profile.country || 'United States',
          } : undefined,
        };
        console.log('Enhanced user data assembled:', userData);

        setUser(userData);
      }
    } catch (error: any) {
      console.error('Unexpected error in fetchUserProfile:', error);
      console.log('Fallback user should already be set');
      
      // Double-check that user is set
      if (!user) {
        const emergencyFallback: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          account_type: (supabaseUser.user_metadata?.account_type as 'customer' | 'vendor') || 'customer'
        };
        setUser(emergencyFallback);
        console.log('Emergency fallback user created');
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check if Supabase is properly configured
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                 import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                 import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                                 import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';
    
    if (!isSupabaseConfigured) {
      console.error('Supabase is not properly configured. Please set up your environment variables.');
      return false;
    }

    try {
      
      // Add timeout protection for login
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout')), 15000)
      );
      
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        
        // Create immediate fallback user for functionality
        const immediateUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          account_type: (data.user.user_metadata?.account_type as 'customer' | 'vendor') || 'customer'
        };
        setUser(immediateUser);
        
        // Try to fetch enhanced profile in background
        try {
          await fetchUserProfile(data.user);
        } catch (profileError) {
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, accountType: 'customer' | 'vendor' = 'customer'): Promise<boolean> => {
    // Check if Supabase is properly configured
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                 import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                 import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                                 import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';
    
    if (!isSupabaseConfigured) {
      console.error('Supabase is not properly configured. Please set up your environment variables.');
      return false;
    }

    try {
      
      // Add timeout protection for signup
      const signupPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            account_type: accountType
          },
        },
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signup timeout')), 15000)
      );
      
      const { data, error } = await Promise.race([signupPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Signup error:', error.message, error);
        return false;
      }


      
      if (data.user) {
        // Create immediate user for functionality
        const immediateUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: name,
          account_type: accountType  // Use the passed account type
        };
        setUser(immediateUser);
        
        if (!data.session) {
          return true; // Still successful, user can use the app
        }
        
        // If we have a session, try to fetch/create profile in background
        try {
          await fetchUserProfile(data.user);
        } catch (profileError) {
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup catch error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      localStorage.removeItem('cart');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                 import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                 import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                                 import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

    if (!isSupabaseConfigured) {
      console.error('Supabase is not properly configured. Cannot update profile.');
      return;
    }

    try {
      const profileData: any = {
        email: updates.email || user.email,
        name: updates.name || user.name,
      };

      if (updates.address) {
        profileData.street = updates.address.street;
        profileData.city = updates.address.city;
        profileData.state = updates.address.state;
        profileData.zip_code = updates.address.zipCode;
        profileData.country = updates.address.country;
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
      }

      const updatedUser: User = {
        ...user,
        ...updates,
      };
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      setUser(updatedUser);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }
  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth, AuthProvider };