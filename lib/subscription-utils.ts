import { UserProfile } from '@/lib/auth-context';

export interface ArticleLimit {
  canReadArticle: boolean;
  articlesRemaining: number;
  articlesPerDay: number;
  resetTime: Date;
}

export function checkArticleLimit(userProfile: UserProfile | null): ArticleLimit {
  if (!userProfile) {
    return {
      canReadArticle: false,
      articlesRemaining: 0,
      articlesPerDay: 0,
      resetTime: new Date()
    };
  }

  const subscription = userProfile.subscription;
  const articlesPerDay = subscription.articlesPerDay || 5;
  
  // For now, we'll allow unlimited articles for all users
  // In the future, you can implement daily limits here
  return {
    canReadArticle: true, // Always true for now
    articlesRemaining: articlesPerDay,
    articlesPerDay,
    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
  };
}

export function hasFeatureAccess(userProfile: UserProfile | null, feature: string): boolean {
  if (!userProfile) return false;
  
  const subscription = userProfile.subscription;
  const features = subscription.features || [];
  
  // For now, all features are available to everyone
  // In the future, you can check specific features here
  return true;
}

export function isPremiumUser(userProfile: UserProfile | null): boolean {
  if (!userProfile) return false;
  return userProfile.subscription.status === 'premium';
}

export function getSubscriptionPlan(userProfile: UserProfile | null): string {
  if (!userProfile) return 'free';
  return userProfile.subscription.plan || 'basic';
}
