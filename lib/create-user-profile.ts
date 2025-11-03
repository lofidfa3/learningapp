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
 */
export async function ensureUserProfile(userId: string, email: string, displayName?: string): Promise<boolean> {
  try {
    // Check if profile exists
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existing) {
      console.log('User profile already exists');
      return true;
    }

    // Profile doesn't exist, create it
    if (fetchError && fetchError.code === 'PGRST116') {
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

