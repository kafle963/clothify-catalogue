import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Clear local storage
        localStorage.removeItem('cart');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url') {
      console.warn('Supabase not configured, using demo user data');
      const demoUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Demo User'
      };
      setUser(demoUser);
      return;
    }

    try {
      console.log('Fetching profile for user:', supabaseUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            // Fallback to basic user data
            const fallbackUser: User = {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
            };
            setUser(fallbackUser);
            return;
          }
          
          console.log('Profile created successfully:', newProfile);
          
          if (newProfile) {
            const userData: User = {
              id: newProfile.id,
              email: newProfile.email,
              name: newProfile.name,
              address: newProfile.street ? {
                street: newProfile.street,
                city: newProfile.city || '',
                state: newProfile.state || '',
                zipCode: newProfile.zip_code || '',
                country: newProfile.country || 'United States',
              } : undefined,
            };
            setUser(userData);
          }
          return;
        }
        
        // For other errors, still set basic user data
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
        };
        setUser(fallbackUser);
        return;
      }

      console.log('Profile fetched successfully:', profile);
      
      if (profile) {
        const userData: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          address: profile.street ? {
            street: profile.street,
            city: profile.city || '',
            state: profile.state || '',
            zipCode: profile.zip_code || '',
            country: profile.country || 'United States',
          } : undefined,
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback to basic user data even on unexpected errors
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
      };
      setUser(fallbackUser);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url') {
      console.warn('Supabase not configured, using demo login');
      // Create a demo user for testing
      const demoUser: User = {
        id: 'demo-user-id',
        email: email,
        name: email.split('@')[0]
      };
      setUser(demoUser);
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        await fetchUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url') {
      console.warn('Supabase not configured, using demo signup');
      // Create a demo user for testing
      const demoUser: User = {
        id: 'demo-user-' + Date.now(),
        email: email,
        name: name
      };
      setUser(demoUser);
      return true;
    }

    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error.message, error);
        
        // Handle specific error cases
        if (error.message.includes('Database error') || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.error('Database schema issue. Please run the Supabase migrations.');
          console.error('Run: npx supabase migration up (if using Supabase CLI)');
          console.error('Or check that your database tables are properly set up.');
        }
        
        return false;
      }

      console.log('Signup successful:', data);
      
      if (data.user) {
        // Check if user needs email confirmation
        if (!data.session) {
          console.log('User created but needs email confirmation');
          // For demo purposes, we'll still create a basic user profile
          const basicUser: User = {
            id: data.user.id,
            email: data.user.email || email,
            name: name
          };
          setUser(basicUser);
          return true; // Still consider it successful
        }
        
        // If we have a session, try to fetch/create profile
        try {
          await fetchUserProfile(data.user);
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
          // Create a basic user profile as fallback
          const basicUser: User = {
            id: data.user.id,
            email: data.user.email || email,
            name: name
          };
          setUser(basicUser);
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
      // Only call signOut if Supabase is configured
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url') {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      localStorage.removeItem('cart');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url') {
      console.warn('Supabase not configured, updating local user data only');
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      setUser(updatedUser);
      return;
    }
    try {
      const profileUpdates: any = {
        name: updates.name || user.name,
      };

      if (updates.address) {
        profileUpdates.street = updates.address.street;
        profileUpdates.city = updates.address.city;
        profileUpdates.state = updates.address.state;
        profileUpdates.zip_code = updates.address.zipCode;
        profileUpdates.country = updates.address.country;
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        // Still update local state even if database update fails
        const updatedUser: User = {
          ...user,
          ...updates,
        };
        setUser(updatedUser);
        return;
      }

      // Update local user state
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      // Fallback to local update
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
};