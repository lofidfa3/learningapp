import { NextRequest, NextResponse } from 'next/server';

const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN || '63GzNt7g9M9-YtP8daOkMDG2i6qlqfLyzCsg2QIyoRqNPVpE0k_rruXi5RONSHzf';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const songTitle = searchParams.get('song');
  const artist = searchParams.get('artist');

  if (!songTitle || !artist) {
    return NextResponse.json({ error: 'Song title and artist are required' }, { status: 400 });
  }

  try {
    // Clean and prepare search query - use exact song title and artist from Spotify
    const cleanTitle = songTitle.trim();
    const cleanArtist = artist.split(',')[0].trim(); // Use first artist if multiple
    const searchQuery = `${cleanTitle} ${cleanArtist}`;
    
    console.log('🔍 Searching Genius for:', { songTitle: cleanTitle, artist: cleanArtist, query: searchQuery });
    
    // Step 1: Search for the song
    const searchUrl = new URL('https://api.genius.com/search');
    searchUrl.searchParams.set('q', searchQuery);
    
    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
      },
    });
    
    const searchData = await searchResponse.json();
    const hits = searchData?.response?.hits || [];
    
    if (hits.length === 0) {
      console.log('❌ No results found for:', searchQuery);
      return NextResponse.json({ 
        error: 'Song not found on Genius',
        song: cleanTitle,
        artist: cleanArtist,
        searchQuery: searchQuery
      }, { status: 404 });
    }

    // Try to find the best match by comparing title and artist
    let bestMatch = hits[0].result;
    let bestScore = 0;
    
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedTitle = normalize(cleanTitle);
    const normalizedArtist = normalize(cleanArtist);
    
    for (const hit of hits) {
      const result = hit.result;
      const resultTitle = normalize(result.title);
      const resultArtist = normalize(result.primary_artist.name);
      
      let score = 0;
      // Check title match
      if (resultTitle.includes(normalizedTitle) || normalizedTitle.includes(resultTitle)) {
        score += 10;
      }
      // Check artist match
      if (resultArtist.includes(normalizedArtist) || normalizedArtist.includes(resultArtist)) {
        score += 5;
      }
      // Exact match bonus
      if (resultTitle === normalizedTitle && resultArtist === normalizedArtist) {
        score += 20;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = result;
      }
    }
    
    console.log('✅ Found match:', { title: bestMatch.title, artist: bestMatch.primary_artist.name, score: bestScore });
    
    const songData = bestMatch;
    const songUrl = songData.url;

    // Step 2: Fetch lyrics from the song page
    // Note: Genius API doesn't provide lyrics directly, we need to scrape the page
    // For now, we'll return the song info and URL
    // You might need to use a lyrics scraping service or implement web scraping
    
    return NextResponse.json({
      song: {
        id: songData.id,
        title: songData.title,
        artist: songData.primary_artist.name,
        url: songUrl,
        thumbnail: songData.song_art_image_url,
      },
      // Note: Actual lyrics scraping would need to be done client-side or via a proxy
      // For now, return the URL so client can fetch it
      lyricsUrl: songUrl,
    });
  } catch (error: any) {
    console.error('Error fetching lyrics from Genius:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch lyrics',
      details: error.message 
    }, { status: 500 });
  }
}

