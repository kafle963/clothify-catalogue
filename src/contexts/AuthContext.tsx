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
    console.log('🔄 Starting fetchUserProfile for user:', supabaseUser.id);
    console.log('📧 User email:', supabaseUser.email);
    console.log('🔧 Environment check:', {
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      url: import.meta.env.VITE_SUPABASE_URL,
      urlLength: import.meta.env.VITE_SUPABASE_URL?.length || 0
    });
    
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || 
        !import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url' ||
        import.meta.env.VITE_SUPABASE_ANON_KEY === 'your_supabase_anon_key') {
      console.warn('⚠️ Supabase not properly configured, using demo user data');
      console.warn('📋 To fix this issue:');
      console.warn('1. Create a Supabase project at https://supabase.com');
      console.warn('2. Copy your project URL and anon key to the .env file');
      console.warn('3. Restart your development server');
      
      const demoUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Demo User'
      };
      setUser(demoUser);
      return;
    }

    try {
      console.log('🔍 Attempting to fetch profile from Supabase...');
      
      // Test Supabase connection first
      const { data: sessionData, error: connectionError } = await supabase.auth.getSession();
      if (connectionError) {
        console.error('❌ Supabase connection error:', connectionError);
        throw new Error(`Supabase connection failed: ${connectionError.message}`);
      }
      
      console.log('✅ Supabase connection successful');
      console.log('🔐 Session info:', {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
        userEmail: sessionData.session?.user?.email,
        currentUserIdMatches: sessionData.session?.user?.id === supabaseUser.id
      });
      
      // Check if the current session matches the user we're trying to fetch
      if (!sessionData.session || sessionData.session.user.id !== supabaseUser.id) {
        console.warn('⚠️ Session user mismatch or no session found');
        console.log('🔄 Creating fallback user from auth user data');
        
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
        };
        setUser(fallbackUser);
        return;
      }
      
      console.log('📊 Executing profile query...');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
        
      console.log('📝 Profile query completed:', { 
        hasProfile: !!profile, 
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message 
      });

      if (error) {
        console.error('❌ Error fetching profile:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Handle specific error cases
        if (error.code === '42P01') {
          console.error('🚨 Table does not exist: profiles table is missing from database');
          console.error('💡 Solution: Run database migrations or create the profiles table');
        } else if (error.code === '42501') {
          console.error('🚨 Permission denied: Check RLS policies on profiles table');
          console.error('💡 Solution: Ensure RLS policies allow authenticated users to read their own profiles');
        } else if (error.code === 'PGRST116') {
          console.log('🔨 Profile not found, attempting to create new profile...');
          
          const profileData = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
          };
          
          console.log('📝 Creating profile with data:', profileData);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();
            
          if (createError) {
            console.error('❌ Error creating profile:', {
              code: createError.code,
              message: createError.message,
              details: createError.details,
              hint: createError.hint
            });
            
            // Handle specific create errors
            if (createError.message.includes('relation "profiles" does not exist')) {
              console.error('🚨 Database schema issue: profiles table does not exist');
              console.error('💡 Solution: Run the Supabase migrations or create the profiles table');
              console.error('📄 Check: supabase/migrations/ folder for SQL scripts');
            } else if (createError.code === '42501') {
              console.error('🚨 Permission denied: Check RLS policies on profiles table');
              console.error('💡 Solution: Ensure RLS policies allow authenticated users to insert their own profiles');
            } else if (createError.code === '23505') {
              console.error('🚨 Unique constraint violation: Profile might already exist');
              console.log('🔄 Retrying profile fetch...');
              
              // Retry fetching the profile
              const { data: retryProfile, error: retryError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();
                
              if (!retryError && retryProfile) {
                console.log('✅ Profile found on retry');
                const userData: User = {
                  id: retryProfile.id,
                  email: retryProfile.email,
                  name: retryProfile.name,
                  address: retryProfile.street ? {
                    street: retryProfile.street,
                    city: retryProfile.city || '',
                    state: retryProfile.state || '',
                    zipCode: retryProfile.zip_code || '',
                    country: retryProfile.country || 'United States',
                  } : undefined,
                };
                setUser(userData);
                return;
              }
            }
            
            // Fallback to basic user data
            console.log('🔄 Using fallback user data due to create error');
            const fallbackUser: User = {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
            };
            setUser(fallbackUser);
            return;
          }
          
          console.log('✅ Profile created successfully:', newProfile);
          
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
        } else if (error.code === 'PGRST301') {
          console.error('🚨 Multiple rows returned when expecting single row');
        }
        
        // For other errors, still set basic user data
        console.log('🔄 Using fallback user data due to fetch error');
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
        };
        setUser(fallbackUser);
        return;
      }

      console.log('✅ Profile fetched successfully:', profile);
      
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
        console.log('✅ User data assembled:', userData);
        setUser(userData);
      }
    } catch (error: any) {
      console.error('💥 Unexpected error in fetchUserProfile:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check for network errors
      if (error.message.includes('fetch')) {
        console.error('🌐 Network error: Check internet connection and Supabase URL');
      } else if (error.message.includes('Invalid API key')) {
        console.error('🔑 Invalid API key: Check VITE_SUPABASE_ANON_KEY in .env file');
      }
      
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