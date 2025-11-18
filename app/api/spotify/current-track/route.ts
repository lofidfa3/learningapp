import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get('access_token');

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token required' }, { status: 401 });
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204) {
      // No track currently playing
      return NextResponse.json({ 
        error: 'No track currently playing',
        isPlaying: false 
      }, { status: 200 });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ 
        error: errorData.error?.message || 'Failed to fetch current track',
        status: response.status 
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      isPlaying: data.is_playing || false,
      track: {
        id: data.item?.id,
        name: data.item?.name,
        artists: data.item?.artists?.map((artist: any) => artist.name).join(', ') || '',
        album: data.item?.album?.name || '',
        image: data.item?.album?.images?.[0]?.url || '',
        previewUrl: data.item?.preview_url || '',
        duration: data.item?.duration_ms || 0,
        progress: data.progress_ms || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching current track:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch current track',
      details: error.message 
    }, { status: 500 });
  }
}

