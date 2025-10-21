'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveSpotifyAuth, fetchSpotifyUser } from '@/lib/spotify-auth';

export default function SpotifyCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Spotify authentication...');

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get access token from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (!accessToken) {
          throw new Error('No access token received');
        }

        // Fetch user profile
        setMessage('Fetching your Spotify profile...');
        const user = await fetchSpotifyUser(accessToken);

        if (!user) {
          throw new Error('Failed to fetch user profile');
        }

        // Calculate expiration time
        const expiresAt = Date.now() + (parseInt(expiresIn || '3600') * 1000);

        // Save authentication state
        saveSpotifyAuth({
          accessToken,
          expiresAt,
          user,
        });

        setStatus('success');
        setMessage(`Welcome, ${user.displayName}! Redirecting...`);

        // Redirect to lyrics page after a short delay
        setTimeout(() => {
          router.push('/lyrics');
        }, 1500);

      } catch (error: any) {
        console.error('Spotify callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to authenticate with Spotify');
        
        // Redirect to lyrics page after error
        setTimeout(() => {
          router.push('/lyrics');
        }, 3000);
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              Spotify Authentication
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Please wait...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Error occurred'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-center ${
              status === 'success' ? 'text-green-700' : 
              status === 'error' ? 'text-red-700' : 
              'text-muted-foreground'
            }`}>
              {message}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

