import { NextRequest, NextResponse } from 'next/server';

// This endpoint gets the currently playing track from Spotify
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get('access_token');

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Access token required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204) {
      return NextResponse.json({ playing: false });
    }

    if (!response.ok) {
      throw new Error('Failed to fetch currently playing track');
    }

    const data = await response.json();

    if (!data.item) {
      return NextResponse.json({ playing: false });
    }

    return NextResponse.json({
      playing: true,
      track: {
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists[0].name,
        album: data.item.album.name,
        imageUrl: data.item.album.images[0]?.url,
        duration: data.item.duration_ms,
        progress: data.progress_ms,
      },
    });
  } catch (error: any) {
    console.error('Spotify API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currently playing track', details: error.message },
      { status: 500 }
    );
  }
}

