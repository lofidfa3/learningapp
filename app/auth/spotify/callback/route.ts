import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'aeca33a241374f0aae9f0d0b2fe771a2';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '29dab9ff2d234c77a18df6737b08f2cf';

// Use production domain for redirect URI (Spotify requires HTTPS)
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
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://newslings.org';
  
  if (error) {
    return NextResponse.redirect(`${appUrl}/lyrics?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/lyrics?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://newslings.org';
    
    if (tokenData.error) {
      return NextResponse.redirect(`${appUrl}/lyrics?error=${tokenData.error}`);
    }

    // Redirect to lyrics page with tokens in URL hash (client-side will handle)
    return NextResponse.redirect(`${appUrl}/lyrics?access_token=${tokenData.access_token}&refresh_token=${tokenData.refresh_token}&expires_in=${tokenData.expires_in}`);
  } catch (error: any) {
    console.error('Spotify callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://newslings.org';
    return NextResponse.redirect(`${appUrl}/lyrics?error=callback_failed`);
  }
}

