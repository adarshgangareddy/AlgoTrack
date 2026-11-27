import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  username?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  target_role?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    fullName: string,
    username: string,
    email: string,
    password: string,
    profileDetails?: { target_role?: string; bio?: string }
  ) => Promise<{ error: Error | null; requiresEmailVerification?: boolean }>;
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
  const userIdRef = useRef<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user]);

  // Fetch user profile from Supabase profiles table
  const fetchProfile = async (
    userId: string,
    userEmail: string,
    userFullName?: string,
    userUsername?: string,
    userAvatarUrl?: string
  ) => {
    const baseName = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user';
    const safeFallbackUsername = userUsername || `${baseName}_${userId.slice(0, 6)}`;

    if (!configured) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        const demoProf: UserProfile = {
          id: userId,
          full_name: userFullName || userEmail.split('@')[0],
          username: safeFallbackUsername,
          email: userEmail,
          avatar_url: userAvatarUrl,
          target_role: 'Software Engineer',
          bio: '',
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
          username: safeFallbackUsername,
          email: userEmail,
          avatar_url: userAvatarUrl,
          target_role: 'Software Engineer',
          bio: '',
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
        username: safeFallbackUsername,
        email: userEmail,
        avatar_url: userAvatarUrl,
        target_role: 'Software Engineer',
        bio: '',
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (configured) {
      // 1. Initial session check
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          const meta = initialSession.user.user_metadata;
          fetchProfile(
            initialSession.user.id,
            initialSession.user.email || '',
            meta?.full_name || meta?.name,
            meta?.username,
            meta?.avatar_url || meta?.picture
          );
        }
        setLoading(false);
      }).catch(() => {
        if (isMounted) setLoading(false);
      });

      // 2. Real-time auth state subscription
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!isMounted) return;
          // Ignore TOKEN_REFRESHED if user didn't change to prevent flicker
          if (event === 'TOKEN_REFRESHED' && newSession?.user?.id === userIdRef.current) {
            setSession(newSession);
            return;
          }

          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            const meta = newSession.user.user_metadata;
            await fetchProfile(
              newSession.user.id,
              newSession.user.email || '',
              meta?.full_name || meta?.name,
              meta?.username,
              meta?.avatar_url || meta?.picture
            );
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
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

  // Sign In (Supports Email OR Username)
  const signIn = async (identifier: string, password: string): Promise<{ error: Error | null }> => {
    if (configured) {
      let resolvedEmail = identifier.trim();

      // If user typed a username (no '@'), resolve their email
      if (!resolvedEmail.includes('@')) {
        const cleanUsername = resolvedEmail.replace(/^@/, '').toLowerCase();
        
        try {
          // Attempt resolution via get_email_by_username RPC
          const { data: rpcEmail, error: rpcErr } = await supabase.rpc('get_email_by_username', {
            p_username: cleanUsername,
          });

          if (!rpcErr && rpcEmail) {
            resolvedEmail = rpcEmail as string;
          } else {
            // Fallback direct table select
            const { data: prof } = await supabase
              .from('profiles')
              .select('email')
              .ilike('username', cleanUsername)
              .maybeSingle();

            if (prof?.email) {
              resolvedEmail = prof.email;
            } else {
              return {
                error: new Error(`No account found with username "@${cleanUsername}". Check your spelling or sign in with your email.`),
              };
            }
          }
        } catch {
          // If profile table doesn't have username yet, inform user
          return {
            error: new Error(`Could not resolve username "@${cleanUsername}". Please sign in with your email address.`),
          };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });
      if (error) return { error };
      if (data.user) {
        await fetchProfile(
          data.user.id,
          data.user.email || resolvedEmail,
          data.user.user_metadata?.full_name,
          data.user.user_metadata?.username
        );
      }
      return { error: null };
    } else {
      // Local dev simulation
      if (password.length < 6) {
        return { error: new Error('Password must be at least 6 characters.') };
      }
      const mockUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 10),
        email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
        user_metadata: { full_name: identifier.split('@')[0], username: identifier },
      } as unknown as User;
      const mockProfile: UserProfile = {
        id: mockUser.id,
        full_name: identifier.split('@')[0],
        username: identifier.replace(/^@/, ''),
        email: mockUser.email || '',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(mockProfile));
      return { error: null };
    }
  };

  // Sign Up (Full name, Username, Email, Password, Profile Details)
  const signUp = async (
    fullName: string,
    username: string,
    email: string,
    password: string,
    profileDetails?: { target_role?: string; bio?: string }
  ): Promise<{ error: Error | null; requiresEmailVerification?: boolean }> => {
    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase();

    if (configured) {
      // Check if username is already taken in profiles table
      try {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          return {
            error: new Error(`The username "@${cleanUsername}" is already taken. Please choose another username.`),
          };
        }
      } catch {
        // Table might not have username column yet
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: cleanUsername,
            target_role: profileDetails?.target_role || 'Software Engineer',
            bio: profileDetails?.bio || '',
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
        await fetchProfile(data.user.id, email, fullName, cleanUsername);
      }
      return { error: null, requiresEmailVerification: false };
    } else {
      // Local dev simulation
      const mockUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 10),
        email,
        user_metadata: { full_name: fullName, username: cleanUsername },
      } as unknown as User;
      const mockProfile: UserProfile = {
        id: mockUser.id,
        full_name: fullName,
        username: cleanUsername,
        email,
        target_role: profileDetails?.target_role || 'Software Engineer',
        bio: profileDetails?.bio || '',
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
          queryParams: {
            prompt: 'select_account',
          },
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
