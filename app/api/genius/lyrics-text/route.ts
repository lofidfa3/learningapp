import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lyricsUrl = searchParams.get('url');

  if (!lyricsUrl) {
    return NextResponse.json({ error: 'Lyrics URL is required' }, { status: 400 });
  }

  try {
    // Fetch the Genius page
    const response = await axios.get(lyricsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const html = response.data;
    
    // Extract lyrics from the page - Genius uses multiple possible structures
    // Try multiple patterns to find lyrics
    
    // Pattern 1: data-lyrics-container attribute (newer structure)
    let lyricsMatch = html.match(/<div[^>]*data-lyrics-container[^>]*>([\s\S]*?)<\/div>/);
    
    // Pattern 2: Lyrics container with class containing "lyrics"
    if (!lyricsMatch) {
      lyricsMatch = html.match(/<div[^>]*class="[^"]*lyrics[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    }
    
    // Pattern 3: Look for the main lyrics div (common structure)
    if (!lyricsMatch) {
      lyricsMatch = html.match(/<div[^>]*class="[^"]*Lyrics__Container[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    }
    
    // Pattern 4: Look for lyrics in script tag (Genius sometimes embeds in JSON)
    if (!lyricsMatch) {
      const scriptMatch = html.match(/<script[^>]*>[\s\S]*?"lyrics_data":\s*"([^"]+)"[\s\S]*?<\/script>/);
      if (scriptMatch) {
        try {
          const decoded = decodeURIComponent(scriptMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
          return NextResponse.json({ lyrics: decoded });
        } catch (e) {
          // Continue to next pattern
        }
      }
    }
    
    // Pattern 5: Look for any div containing lyrics text with common classes
    if (!lyricsMatch) {
      const patterns = [
        /<div[^>]*class="[^"]*lyrics[^"]*"[^>]*>([\s\S]{100,}?)<\/div>/,
        /<div[^>]*id="lyrics-root"[^>]*>([\s\S]*?)<\/div>/,
        /<div[^>]*class="[^"]*Lyrics__Root[^"]*"[^>]*>([\s\S]*?)<\/div>/,
      ];
      
      for (const pattern of patterns) {
        lyricsMatch = html.match(pattern);
        if (lyricsMatch && lyricsMatch[1].length > 100) break;
      }
    }
    
    if (!lyricsMatch) {
      console.error('Could not find lyrics in HTML. Trying to extract any text content...');
      // Last resort: try to extract any meaningful text content
      const textMatch = html.match(/<div[^>]*>([\s\S]{200,}?)<\/div>/);
      if (textMatch && textMatch[1].length > 200) {
        lyricsMatch = textMatch;
      } else {
        return NextResponse.json({ 
          error: 'Could not extract lyrics from page. The page structure may have changed.',
          debug: 'HTML length: ' + html.length 
        }, { status: 404 });
      }
    }

    // Clean up the extracted lyrics
    let lyrics = lyricsMatch[1]
      // Remove script and style tags
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '\n')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&hellip;/g, '...')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      // Clean up whitespace
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .replace(/^\s+|\s+$/gm, '')
      .trim();
    
    // Remove common non-lyrics text
    lyrics = lyrics
      .replace(/^\[.*?\]\s*/gm, '') // Remove [Intro], [Verse], etc. markers if they're on their own line
      .replace(/^\d+\s*$/gm, '') // Remove standalone numbers
      .trim();

    if (!lyrics || lyrics.length < 50) {
      return NextResponse.json({ 
        error: 'Extracted lyrics are too short or empty. The page structure may have changed.',
        debug: `Extracted length: ${lyrics?.length || 0}`
      }, { status: 404 });
    }

    return NextResponse.json({ lyrics });
  } catch (error: any) {
    console.error('Error fetching lyrics text:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch lyrics text',
      details: error.message 
    }, { status: 500 });
  }
}

