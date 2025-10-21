'use client';

import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 'demo';
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/spotify/callback` : '';

interface SpotifyLoginButtonProps {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function SpotifyLoginButton({ variant = 'default', size = 'default', className }: SpotifyLoginButtonProps) {
  function handleLogin() {
    const scopes = [
      'user-read-email',
      'user-read-private',
      'user-read-currently-playing',
      'user-read-playback-state',
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CLIENT_ID}&` +
      `response_type=token&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `show_dialog=true`;

    window.location.href = authUrl;
  }

  return (
    <Button onClick={handleLogin} variant={variant} size={size} className={className}>
      <Music className="h-5 w-5 mr-2" />
      Sign in with Spotify
    </Button>
  );
}

