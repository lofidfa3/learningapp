'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

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

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid,
          email: data.email || '',
          displayName: data.displayName || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          subscription: data.subscription || {
            status: 'free',
            plan: 'basic',
            articlesPerDay: 5, // Free users get 5 articles per day
            features: ['basic_translation', 'basic_vocabulary']
          },
          preferences: data.preferences || {
            targetLanguage: 'italian',
            dailyGoal: 5,
            notifications: true
          },
          stats: data.stats || {
            articlesRead: 0,
            wordsLearned: 0,
            streakDays: 0,
            lastActiveDate: new Date()
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Create user profile in Firestore
  async function createUserProfile(user: User, displayName: string) {
    try {
      const userProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName,
        createdAt: serverTimestamp(),
        subscription: {
          status: 'free',
          plan: 'basic',
          articlesPerDay: 5, // Free users get 5 articles per day
          features: ['basic_translation', 'basic_vocabulary']
        },
        preferences: {
          targetLanguage: 'italian',
          dailyGoal: 5,
          notifications: true
        },
        stats: {
          articlesRead: 0,
          wordsLearned: 0,
          streakDays: 0,
          lastActiveDate: serverTimestamp()
        }
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Sign up with email and password
  async function signUp(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user, displayName);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async function signIn(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, create if not
      const existingProfile = await fetchUserProfile(result.user.uid);
      if (!existingProfile) {
        await createUserProfile(result.user, result.user.displayName || '');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async function signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Refresh user profile
  async function refreshUserProfile() {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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