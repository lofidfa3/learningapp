'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { getUserProfile, updateUserProfile, UserProfile as SupabaseUserProfile } from './supabase-services';
import { actionToasts } from './toast-utils';
import { createUserProfile, ensureUserProfile } from './create-user-profile';

export interface UserSubscription {
  status: 'free' | 'premium';
  plan?: 'basic' | 'premium' | 'pro';
  articlesPerDay?: number;
  features?: string[];
  startDate?: Date;
  endDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  subscription: UserSubscription;
  preferences?: {
    targetLanguage?: string;
    dailyGoal?: number;
    notifications?: boolean;
  };
  stats?: {
    articlesRead: number;
    wordsLearned: number;
    streakDays: number;
    lastActiveDate: Date;
  };
}

// Convert Supabase profile to app format
function convertSupabaseProfile(supabaseUser: SupabaseUser, profile: SupabaseUserProfile | null): UserProfile | null {
  if (!profile) return null;

  return {
    uid: profile.id,
    email: profile.email,
    displayName: profile.display_name || supabaseUser.email?.split('@')[0] || 'User',
    createdAt: new Date(profile.created_at),
    subscription: {
      status: profile.subscription_status as 'free' | 'premium',
      plan: profile.subscription_plan as 'basic' | 'premium' | 'pro',
      articlesPerDay: profile.articles_per_day,
      features: profile.subscription_status === 'premium' 
        ? ['premium_translation', 'premium_vocabulary', 'unlimited_articles']
        : ['basic_translation', 'basic_vocabulary'],
    },
    preferences: {
      targetLanguage: profile.target_language,
      dailyGoal: profile.daily_goal,
      notifications: profile.notifications_enabled,
    },
    stats: {
      articlesRead: profile.articles_read,
      wordsLearned: profile.words_learned,
      streakDays: profile.streak_days,
      lastActiveDate: new Date(profile.last_active_date),
    },
  };
}

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache session in memory and localStorage for faster access
let cachedSession: { user: SupabaseUser | null; profile: UserProfile | null } | null = null;
const SESSION_CACHE_KEY = 'linguanews_session_cache';
const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedSession(): { user: SupabaseUser | null; profile: UserProfile | null; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      // Check if cache is still valid (within TTL)
      if (now - parsed.timestamp < SESSION_CACHE_TTL) {
        return parsed;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(SESSION_CACHE_KEY);
      }
    }
  } catch (e) {
    // Ignore cache errors
  }
  return null;
}

function setCachedSession(user: SupabaseUser | null, profile: UserProfile | null) {
  if (typeof window === 'undefined') return;
  
  try {
    cachedSession = { user, profile };
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
      user: user ? {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      } : null,
      profile,
      timestamp: Date.now(),
    }));
  } catch (e) {
    // Ignore cache errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(() => {
    // Try to get from cache first for instant initial state
    if (typeof window !== 'undefined') {
      const cached = getCachedSession();
      if (cached?.user) {
        // Return a minimal user object from cache
        return cached.user as any;
      }
    }
    return null;
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Try to get from cache first
    if (typeof window !== 'undefined') {
      const cached = getCachedSession();
      return cached?.profile || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Supabase
  async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profile = await getUserProfile(userId);
      if (profile && user) {
        return convertSupabaseProfile(user, profile);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Sign up with email and password
  async function signUp(email: string, password: string, displayName: string) {
    try {
      // Use production domain for email redirects
      const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://newslings.org';
      const emailRedirectUrl = typeof window !== 'undefined' 
        ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? `${productionUrl}/auth/callback`
            : `${window.location.origin}/auth/callback`)
        : `${productionUrl}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: emailRedirectUrl,
        },
      });

      if (error) {
        // Convert Supabase error to user-friendly message
        const errorMessage = error.message || 'Failed to sign up';
        throw new Error(errorMessage);
      }
      
      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          // User is immediately signed in (email confirmation disabled)
          // Create user profile in database
          await createUserProfile({
            id: data.user.id,
            email: data.user.email || email,
            display_name: displayName,
          });
          
          actionToasts.signupSuccess(displayName);
          
          // Wait a moment for profile to be created
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const profile = await fetchUserProfile(data.user.id);
          setUserProfile(profile);
        } else {
          // Email confirmation required
          actionToasts.signupSuccess(displayName);
          throw new Error('Please check your email to confirm your account. We sent you a confirmation link.');
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      // Re-throw with original message for UI to handle
      throw error;
    }
  }

  // Sign in with email and password
  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Convert Supabase error to user-friendly message
        let errorMessage = error.message || 'Failed to sign in';
        
        // Handle specific Supabase error cases
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email to confirm your account before signing in.';
        }
        
        throw new Error(errorMessage);
      }

      if (data.user && data.session) {
        const profile = await fetchUserProfile(data.user.id);
        const displayName = profile?.displayName || data.user.email?.split('@')[0] || 'User';
        actionToasts.loginSuccess(displayName);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      // Use production domain if available, otherwise use current origin
      const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://newslings.org';
      const redirectUrl = typeof window !== 'undefined' 
        ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? `${productionUrl}/auth/callback`
            : `${window.location.origin}/auth/callback`)
        : `${productionUrl}/auth/callback`;
        
      console.log('Starting Google OAuth with redirect:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('OAuth initiation error:', error);
        throw error;
      }
      
      console.log('OAuth redirect initiated:', data);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      setCachedSession(null, null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_CACHE_KEY);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Refresh user profile
  async function refreshUserProfile() {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;

    // Get initial session - check cache first for instant load
    const cached = getCachedSession();
    if (cached?.user) {
      // Use cached data immediately, then verify in background
      setUser(cached.user as any);
      setUserProfile(cached.profile);
      setLoading(false);
    }

    // Verify session in background
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setUserProfile(null);
          setCachedSession(null, null);
          setLoading(false);
          return;
        }

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // Ensure user profile exists with proper display name
          const displayNameFromMetadata = 
            currentUser.user_metadata?.display_name ||
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split('@')[0];
            
          ensureUserProfile(
            currentUser.id,
            currentUser.email || '',
            displayNameFromMetadata
          ).then(() => {
            fetchUserProfile(currentUser.id).then(profile => {
              if (mounted) {
                setUserProfile(profile);
                setCachedSession(currentUser, profile);
              }
            });
          });
        } else {
          setUserProfile(null);
          setCachedSession(null, null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setCachedSession(null, null);
          setLoading(false);
        }
      });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      try {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // Ensure user profile exists with COMPLETE setup (email + OAuth parity)
          const displayNameFromMetadata = 
            currentUser.user_metadata?.display_name ||
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split('@')[0];
            
          await ensureUserProfile(
            currentUser.id,
            currentUser.email || '',
            displayNameFromMetadata
          );
          const profile = await fetchUserProfile(currentUser.id);
          if (mounted) {
            setUserProfile(profile);
            setCachedSession(currentUser, profile);
          }
        } else {
          setUserProfile(null);
          setCachedSession(null, null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setCachedSession(null, null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
