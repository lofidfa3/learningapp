'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Callback page loaded');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        // Handle OAuth callback with hash fragments
        // Supabase automatically parses hash fragments when getSession() is called
        if (window.location.hash) {
          console.log('📝 Processing hash fragment...');
          // Clear the hash from URL after processing
          const hash = window.location.hash;
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // Wait a bit for Supabase to process the hash fragment and set the session
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the current session (Supabase automatically parses hash fragments)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          router.push('/auth?error=auth_callback_error');
          return;
        }

        if (session) {
          console.log('✅ Session found!');
          console.log('User:', session.user.email);
          console.log('User metadata:', session.user.user_metadata);
          
          // Ensure user profile exists with COMPLETE defaults (same as email/password signup)
          const displayName = 
            session.user.user_metadata?.full_name || 
            session.user.user_metadata?.name || 
            session.user.user_metadata?.display_name ||
            session.user.email?.split('@')[0] || 
            'User';

          console.log('Creating/updating profile with name:', displayName);

          // Import ensureUserProfile to guarantee consistent profile creation
          const { ensureUserProfile } = await import('@/lib/create-user-profile');
          
          // Use ensureUserProfile to create/update with ALL required fields
          const profileSuccess = await ensureUserProfile(
            session.user.id,
            session.user.email || '',
            displayName
          );

          if (profileSuccess) {
            console.log('✅ Profile ready with all database capabilities');
          } else {
            console.error('❌ Profile creation/update failed');
          }

          // Wait for auth context to update
          console.log('⏳ Waiting for auth context to update...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          console.log('✅ Redirecting to home...');
          router.push('/');
        } else {
          console.log('⚠️ No session found, retrying...');
          
          // No session yet, wait longer and retry
          await new Promise(resolve => setTimeout(resolve, 1500));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (retrySession) {
            console.log('✅ Session found on retry!');
            router.push('/');
          } else {
            console.error('❌ Still no session after retry');
            router.push('/auth?error=no_session');
          }
        }
      } catch (error: any) {
        console.error('❌ Callback error:', error);
        router.push('/auth?error=callback_failed');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we authenticate you</p>
      </div>
    </div>
  );
}

