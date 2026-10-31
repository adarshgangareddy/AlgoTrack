import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ error: Error | null; requiresEmailVerification?: boolean }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updateUserPassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'algotrack_demo_user';
const LOCAL_STORAGE_KEY_PROFILE = 'algotrack_demo_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  // Fetch user profile from Supabase profiles table
  const fetchProfile = async (userId: string, userEmail: string, userFullName?: string) => {
    if (!configured) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        const demoProf: UserProfile = {
          id: userId,
          full_name: userFullName || 'AlgoTrack Engineer',
          email: userEmail,
        };
        setProfile(demoProf);
        localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(demoProf));
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Fallback upsert if profile row was not yet created by trigger
        const fallbackProfile: UserProfile = {
          id: userId,
          full_name: userFullName || userEmail.split('@')[0],
          email: userEmail,
        };
        await supabase.from('profiles').upsert(fallbackProfile);
        setProfile(fallbackProfile);
      } else if (data) {
        setProfile(data as UserProfile);
      }
    } catch {
      // In case of network issue
      setProfile({
        id: userId,
        full_name: userFullName || userEmail.split('@')[0],
        email: userEmail,
      });
    }
  };

  useEffect(() => {
    if (configured) {
      // Real Supabase session initialization
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          fetchProfile(
            initialSession.user.id,
            initialSession.user.email || '',
            initialSession.user.user_metadata?.full_name
          );
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await fetchProfile(
              newSession.user.id,
              newSession.user.email || '',
              newSession.user.user_metadata?.full_name
            );
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Local development test session check
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          if (storedProfile) setProfile(JSON.parse(storedProfile));
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
          localStorage.removeItem(LOCAL_STORAGE_KEY_PROFILE);
        }
      }
      setLoading(false);
    }
  }, [configured]);

  // Sign In
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (configured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email || email, data.user.user_metadata?.full_name);
      }
      return { error: null };
    } else {
      // Local dev simulation
      if (password.length < 6) {
        return { error: new Error('Password must be at least 6 characters.') };
      }
      const mockUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 10),
        email,
        user_metadata: { full_name: email.split('@')[0] },
      } as unknown as User;
      const mockProfile: UserProfile = {
        id: mockUser.id,
        full_name: email.split('@')[0],
        email,
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(mockProfile));
      return { error: null };
    }
  };

  // Sign Up
  const signUp = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ error: Error | null; requiresEmailVerification?: boolean }> => {
    if (configured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (error) return { error };

      // Supabase user was created
      if (data.user && !data.session) {
        // Confirmation email was sent by Supabase
        return { error: null, requiresEmailVerification: true };
      }

      if (data.user) {
        await fetchProfile(data.user.id, email, fullName);
      }
      return { error: null, requiresEmailVerification: false };
    } else {
      // Local dev simulation
      const mockUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 10),
        email,
        user_metadata: { full_name: fullName },
      } as unknown as User;
      const mockProfile: UserProfile = {
        id: mockUser.id,
        full_name: fullName,
        email,
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(mockProfile));
      return { error: null, requiresEmailVerification: false };
    }
  };

  // Sign in with Google (OAuth)
  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    if (configured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      return { error };
    } else {
      // Local demo fallback
      const mockUser = {
        id: 'usr_google_' + Math.random().toString(36).substring(2, 10),
        email: 'developer@google.com',
        user_metadata: { full_name: 'Google Engineer' },
      } as unknown as User;
      const mockProfile: UserProfile = {
        id: mockUser.id,
        full_name: 'Google Engineer',
        email: 'developer@google.com',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(mockProfile));
      return { error: null };
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    if (configured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROFILE);
  };

  // Password Recovery Request
  const resetPasswordForEmail = async (email: string): Promise<{ error: Error | null }> => {
    if (configured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } else {
      // Local simulation
      await new Promise((res) => setTimeout(res, 500));
      return { error: null };
    }
  };

  // Update Password (used in /reset-password)
  const updateUserPassword = async (password: string): Promise<{ error: Error | null }> => {
    if (configured) {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } else {
      await new Promise((res) => setTimeout(res, 500));
      return { error: null };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '', user.user_metadata?.full_name);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPasswordForEmail,
        updateUserPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
