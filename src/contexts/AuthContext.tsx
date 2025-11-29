import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthUser extends User {
  role?: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
            setUser(null);
            setLoading(false);
          }
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log('Fetching user profile for:', authUser.id);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching user profile:', error);
        throw error;
      }

      console.log('User profile data:', data);

      if (data) {
        setUser({
          ...authUser,
          role: data.role,
          name: data.name
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (authError) {
      return { data: null, error: authError };
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: authData.user.email,
          ...userData 
        }]);
      
      if (profileError) {
        return { data: authData, error: profileError };
      }
    }
    
    return { data: authData, error: null };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};