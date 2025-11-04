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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : 'http://localhost:3000/auth/callback';
        
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

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          // Ensure user profile exists with proper display name
          const displayNameFromMetadata = 
            session.user.user_metadata?.display_name ||
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0];
            
          ensureUserProfile(
            session.user.id,
            session.user.email || '',
            displayNameFromMetadata
          ).then(() => {
            fetchUserProfile(session.user.id).then(profile => {
              if (mounted) setUserProfile(profile);
            });
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Ensure user profile exists
          await ensureUserProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.display_name
          );
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
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
