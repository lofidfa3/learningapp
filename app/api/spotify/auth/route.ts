import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'aeca33a241374f0aae9f0d0b2fe771a2';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '29dab9ff2d234c77a18df6737b08f2cf';

// Use production domain for redirect URI (Spotify requires HTTPS)
// When running locally, we still use production domain for OAuth
function getSpotifyRedirectUri(): string {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }
  
  const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://newslings.org';
  return `${productionUrl}/auth/spotify/callback`;
}

const REDIRECT_URI = getSpotifyRedirectUri();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'login') {
    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const scopes = [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-email',
      'user-read-private',
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state}`;

    return NextResponse.json({ authUrl, state });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

