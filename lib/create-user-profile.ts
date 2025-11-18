import { supabase } from './supabaseClient';

export interface CreateProfileData {
  id: string;
  email: string;
  display_name: string;
}

/**
 * Create a user profile in Supabase when they sign up
 * This ensures the user has a record in the users table
 */
export async function createUserProfile(data: CreateProfileData): Promise<boolean> {
  try {
    console.log('Creating user profile for:', data.email);

    const { error } = await supabase
      .from('users')
      .insert({
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        subscription_status: 'free',
        subscription_plan: 'basic',
        articles_per_day: 5,
        target_language: 'italian',
        daily_goal: 10,
        notifications_enabled: true,
        articles_read: 0,
        words_learned: 0,
        streak_days: 0,
        last_active_date: new Date().toISOString(),
      });

    if (error) {
      // Check if user already exists (ignore duplicate key error)
      if (error.code === '23505') {
        console.log('User profile already exists');
        return true;
      }
      console.error('Error creating user profile:', error);
      return false;
    }

    console.log('User profile created successfully');
    return true;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return false;
  }
}

/**
 * Ensure user profile exists, create if not
 * This ensures IDENTICAL profile setup for both email/password and OAuth users
 */
export async function ensureUserProfile(userId: string, email: string, displayName?: string): Promise<boolean> {
  try {
    // Check if profile exists with all fields
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('id, display_name, target_language, daily_goal, subscription_status, subscription_plan, articles_per_day')
      .eq('id', userId)
      .single();

    if (existing) {
      // Profile exists - check if it has all required fields (especially for OAuth users)
      const needsUpdate = 
        !existing.display_name || 
        existing.display_name === '' ||
        !existing.target_language ||
        !existing.daily_goal ||
        !existing.subscription_status ||
        !existing.subscription_plan ||
        !existing.articles_per_day;

      if (needsUpdate) {
        console.log('Updating incomplete profile for:', userId);
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            display_name: displayName || existing.display_name || email.split('@')[0],
            target_language: existing.target_language || 'italian',
            daily_goal: existing.daily_goal || 10,
            subscription_status: existing.subscription_status || 'free',
            subscription_plan: existing.subscription_plan || 'basic',
            articles_per_day: existing.articles_per_day || 5,
            notifications_enabled: true,
          })
          .eq('id', userId);
        
        if (updateError) {
          console.error('Error updating profile:', updateError);
          return false;
        }
        console.log('✅ Profile updated with all required fields');
      } else {
        console.log('✅ User profile already complete');
      }
      return true;
    }

    // Profile doesn't exist, create it with FULL defaults
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('Creating new profile for:', userId);
      return await createUserProfile({
        id: userId,
        email,
        display_name: displayName || email.split('@')[0],
      });
    }

    return false;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return false;
  }
}

