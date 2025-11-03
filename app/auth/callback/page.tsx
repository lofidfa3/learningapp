'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Handle OAuth callbacks with hash fragments
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Handle OAuth errors from hash
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          router.push(`/auth/signin?error=${encodeURIComponent(errorDescription || error)}`);
          return;
        }

        // Handle email confirmation links (query params)
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (type === 'signup' || type === 'email') {
          // Email confirmation - Supabase will set the session automatically
          // Wait a moment for the session to be established
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Get the session (works for both OAuth and email confirmation)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          router.push('/auth/signin?error=session_error');
          return;
        }

        if (session) {
          // Successful authentication - redirect to home
          router.push('/');
        } else if (accessToken) {
          // OAuth token in hash but no session yet - wait and retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (retrySession) {
            router.push('/');
          } else {
            console.error('No session after OAuth callback');
            router.push('/auth/signin?error=oauth_failed');
          }
        } else {
          // No session and no token - redirect to sign in
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        router.push('/auth/signin?error=callback_error');
      }
    }

    handleAuthCallback();
  }, [router, searchParams]);

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

