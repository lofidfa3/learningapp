import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API route to ensure all users have complete profiles
 * This guarantees identical capabilities for email/password and OAuth users
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials in environment variables' },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('🔄 Starting profile parity migration...');

    // Backfill all users with complete profile data
    const { data: updatedUsers, error: updateError } = await supabase.rpc('exec', {
      sql: `
        UPDATE public.users
        SET 
          display_name = COALESCE(NULLIF(display_name, ''), split_part(email, '@', 1), 'User'),
          subscription_status = COALESCE(subscription_status, 'free'),
          subscription_plan = COALESCE(subscription_plan, 'basic'),
          articles_per_day = COALESCE(articles_per_day, 5),
          target_language = COALESCE(target_language, 'italian'),
          daily_goal = COALESCE(daily_goal, 10),
          notifications_enabled = COALESCE(notifications_enabled, true),
          articles_read = COALESCE(articles_read, 0),
          words_learned = COALESCE(words_learned, 0),
          streak_days = COALESCE(streak_days, 0),
          last_active_date = COALESCE(last_active_date, NOW()),
          updated_at = NOW()
        WHERE 
          display_name IS NULL OR display_name = '' OR
          subscription_status IS NULL OR
          subscription_plan IS NULL OR
          articles_per_day IS NULL OR
          target_language IS NULL OR
          daily_goal IS NULL OR
          notifications_enabled IS NULL OR
          articles_read IS NULL OR
          words_learned IS NULL OR
          streak_days IS NULL OR
          last_active_date IS NULL
        RETURNING id, email;
      `
    });

    console.log('✅ Profile update completed');

    // Verify all users now have complete profiles
    const { data: allUsers, error: checkError } = await supabase
      .from('users')
      .select('id, email, display_name, subscription_status, subscription_plan, target_language, daily_goal');

    if (checkError) {
      console.error('Error checking users:', checkError);
    }

    const totalUsers = allUsers?.length || 0;
    const incompleteUsers = allUsers?.filter(u => 
      !u.display_name || 
      !u.subscription_status || 
      !u.subscription_plan || 
      !u.target_language || 
      !u.daily_goal
    ) || [];

    return NextResponse.json({
      success: true,
      message: '✅ Migration completed successfully',
      totalUsers,
      updatedUsers: updatedUsers?.length || 0,
      completeProfiles: totalUsers - incompleteUsers.length,
      incompleteProfiles: incompleteUsers.length,
      status: incompleteUsers.length === 0 
        ? '✅ All users now have complete profiles with identical capabilities!'
        : `⚠️ ${incompleteUsers.length} users still have incomplete profiles (will be fixed on next login)`,
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run migration', 
        details: error.message,
        note: 'Profiles will still be fixed automatically on user login via ensureUserProfile()'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if all users have complete profiles
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email, display_name, subscription_status, subscription_plan, target_language, daily_goal');

    if (allError) {
      return NextResponse.json({ error: allError.message }, { status: 500 });
    }

    const totalUsers = allUsers?.length || 0;
    const incompleteUsers = allUsers?.filter(u => 
      !u.display_name || 
      !u.subscription_status || 
      !u.subscription_plan || 
      !u.target_language || 
      !u.daily_goal
    ) || [];

    return NextResponse.json({
      totalUsers,
      completeUsers: totalUsers - incompleteUsers.length,
      incompleteUsers: incompleteUsers.length,
      allComplete: incompleteUsers.length === 0,
      status: incompleteUsers.length === 0 
        ? '✅ All users have complete profiles with identical capabilities'
        : `⚠️ ${incompleteUsers.length} users have incomplete profiles`,
      incompleteDetails: incompleteUsers.map(u => ({
        id: u.id,
        email: u.email,
        missingFields: [
          !u.display_name && 'display_name',
          !u.subscription_status && 'subscription_status',
          !u.subscription_plan && 'subscription_plan',
          !u.target_language && 'target_language',
          !u.daily_goal && 'daily_goal',
        ].filter(Boolean),
      })),
    });

  } catch (error: any) {
    console.error('Check error:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status', details: error.message },
      { status: 500 }
    );
  }
}

