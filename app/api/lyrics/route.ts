import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Using multiple free lyrics APIs as fallbacks
export async function POST(request: NextRequest) {
  try {
    const { artist, title } = await request.json();

    if (!artist || !title) {
      return NextResponse.json(
        { error: 'Artist and title are required' },
        { status: 400 }
      );
    }

    // Try API 1: lyrics.ovh (completely free, no API key)
    try {
      const response = await axios.get(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      );

      if (response.data.lyrics) {
        return NextResponse.json({
          lyrics: response.data.lyrics,
          source: 'lyrics.ovh',
        });
      }
    } catch (error) {
      console.log('lyrics.ovh failed, trying next API...');
    }

    // Try API 2: lrclib.net (free, open source)
    try {
      const response = await axios.get(
        `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`
      );

      if (response.data && response.data.length > 0) {
        const plainLyrics = response.data[0].plainLyrics || response.data[0].syncedLyrics;
        if (plainLyrics) {
          // Remove timestamp markers if present [00:00.00]
          const cleanLyrics = plainLyrics.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim();
          return NextResponse.json({
            lyrics: cleanLyrics,
            source: 'lrclib.net',
          });
        }
      }
    } catch (error) {
      console.log('lrclib.net failed, trying next API...');
    }

    // Try API 3: ChartLyrics (free, no API key)
    try {
      const response = await axios.get(
        `http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(title)}`
      );

      // Parse XML response
      const lyricMatch = response.data.match(/<Lyric>([\s\S]*?)<\/Lyric>/);
      if (lyricMatch && lyricMatch[1] && lyricMatch[1].trim()) {
        return NextResponse.json({
          lyrics: lyricMatch[1].trim(),
          source: 'chartlyrics.com',
        });
      }
    } catch (error) {
      console.log('ChartLyrics failed');
    }

    return NextResponse.json(
      { error: 'Lyrics not found. Try a different song or check the song/artist name.' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Lyrics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lyrics', details: error.message },
      { status: 500 }
    );
  }
}

