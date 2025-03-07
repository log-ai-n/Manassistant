import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (emailOrUsername: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, username: string, password: string, fullName: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@');
      let email = isEmail ? emailOrUsername : null;

      if (!isEmail) {
        // First check profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('username', emailOrUsername)
          .single();

        if (!profileError && profileData?.email) {
          email = profileData.email;
        } else {
          // If not found in profiles, check restaurant_members table
          const { data: memberData, error: memberError } = await supabase
            .from('restaurant_members')
            .select('email')
            .eq('username', emailOrUsername)
            .single();

          if (!memberError && memberData?.email) {
            email = memberData.email;
          }
        }

        if (!email) {
          return { data: null, error: new Error('Username not found') };
        }
      }

      // Sign in with the found email
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error };
      }

      return { data: data.session, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error: error as Error };
    }
  };

  const signUp = async (email: string, username: string, password: string, fullName: string) => {
    try {
      // Check if username is already taken in profiles
      const { data: existingProfileUser, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username);

      // Check if username is already taken in restaurant_members
      const { data: existingMemberUser, error: memberCheckError } = await supabase
        .from('restaurant_members')
        .select('id')
        .eq('username', username);

      if ((!profileCheckError && existingProfileUser && existingProfileUser.length > 0) ||
          (!memberCheckError && existingMemberUser && existingMemberUser.length > 0)) {
        return { data: null, error: new Error('Username is already taken') };
      }

      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
        },
      });

      if (error) {
        return { data: null, error };
      }

      return { data: data.session, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('currentRestaurantId');
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};