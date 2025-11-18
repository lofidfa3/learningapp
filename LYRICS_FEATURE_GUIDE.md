# Lyrics Learning Feature - Implementation Guide

## Overview
The lyrics page allows users to connect their Spotify account, view lyrics for currently playing songs, translate them, and learn vocabulary by clicking on words.

## Features Implemented

### 1. Spotify OAuth Integration
- **Login Flow**: Users can connect their Spotify account
- **Token Management**: Automatic token refresh when expired
- **Current Track Detection**: Fetches the currently playing song from Spotify

### 2. Genius Lyrics Integration
- **Lyrics Fetching**: Automatically fetches lyrics from Genius API
- **Song Search**: Searches for songs by title and artist
- **Lyrics Extraction**: Extracts clean lyrics text from Genius pages

### 3. Interactive Lyrics Display
- **Two-Column Layout**: 
  - Left: Original lyrics
  - Right: Translated lyrics (clickable words)
- **Clickable Words**: Each word in translated lyrics is clickable
- **Word Meanings**: Shows translation/meaning when clicked
- **Flashcard Integration**: Users can add words to their flashcards

### 4. Translation
- **AI-Powered Translation**: Uses DeepSeek AI to translate lyrics
- **Language Selection**: Supports all target languages (Italian, Spanish, French, German, Portuguese)
- **Context-Aware**: Translation considers song context

## API Routes Created

### Spotify APIs
1. `/api/spotify/auth` - Initiates Spotify OAuth login
2. `/api/spotify/callback` - Handles OAuth callback
3. `/api/spotify/current-track` - Gets currently playing track
4. `/api/spotify/refresh-token` - Refreshes expired tokens

### Genius APIs
1. `/api/genius/lyrics` - Searches for song and gets lyrics URL
2. `/api/genius/lyrics-text` - Fetches actual lyrics text from Genius page

### Translation APIs
1. `/api/translate/word` - Translates individual words with context

## Environment Variables Needed

Add these to your `.env.local` and production environment:

```env
# Spotify OAuth
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

# Genius API
GENIUS_ACCESS_TOKEN=63GzNt7g9M9-YtP8daOkMDG2i6qlqfLyzCsg2QIyoRqNPVpE0k_rruXi5RONSHzf

# App URL (for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Spotify App Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use existing
3. Add redirect URI: `http://localhost:3000/api/spotify/callback` (for dev)
4. Add production redirect URI when deploying
5. Copy Client ID and Client Secret

## How It Works

### User Flow
1. User navigates to `/lyrics` page
2. Clicks "Connect with Spotify"
3. Authorizes app on Spotify
4. Returns to lyrics page with access token
5. App automatically detects currently playing song
6. Fetches lyrics from Genius
7. User can translate lyrics
8. User clicks words in translated lyrics to see meanings
9. User can add words to flashcards

### Technical Flow
1. **Spotify Login**: OAuth 2.0 flow with authorization code
2. **Token Storage**: Tokens stored in localStorage (consider moving to secure storage)
3. **Track Polling**: Polls Spotify API every 5 seconds when track is playing
4. **Lyrics Fetching**: 
   - Search Genius for song
   - Extract lyrics from HTML page
5. **Translation**: Uses DeepSeek AI to translate full lyrics
6. **Word Translation**: Individual word translations with context

## Components Created

1. **`app/lyrics/page.tsx`** - Main lyrics page
2. **`components/music-player.tsx`** - Music player display
3. **`components/clickable-lyrics.tsx`** - Interactive lyrics with clickable words

## Features

✅ Spotify OAuth login
✅ Current track detection
✅ Genius lyrics fetching
✅ Two-column lyrics display
✅ Clickable words
✅ Word meaning lookup
✅ Flashcard integration
✅ Translation support
✅ Language selection
✅ Auto-refresh when track changes

## Known Limitations

1. **Genius Lyrics Scraping**: Genius doesn't provide direct API access to lyrics, so we scrape the HTML. This may break if Genius changes their HTML structure.

2. **Token Storage**: Currently using localStorage. For production, consider:
   - Storing tokens server-side
   - Using secure HTTP-only cookies
   - Implementing proper session management

3. **Word Translation**: Simple word-to-word translation. Could be enhanced with:
   - Dictionary API integration
   - Better context understanding
   - Phrase detection

## Future Enhancements

1. **Better Lyrics Source**: Consider using Musixmatch API or other lyrics services
2. **Synchronized Highlighting**: Highlight words as song plays
3. **Pronunciation**: Add audio pronunciation for words
4. **Lyrics History**: Save previously viewed lyrics
5. **Playlist Support**: Learn from entire playlists
6. **Offline Mode**: Cache lyrics for offline viewing

## Testing

1. Test Spotify login flow
2. Test with different songs
3. Test translation accuracy
4. Test word clicking and flashcard saving
5. Test token refresh
6. Test error handling (no track playing, lyrics not found, etc.)

## Troubleshooting

### "No track currently playing"
- Make sure Spotify is open and playing a song
- Check that the app has proper permissions

### "Lyrics not found"
- Song might not be on Genius
- Try a different song
- Check Genius API rate limits

### "Translation failed"
- Check DeepSeek API key is configured
- Verify API quota hasn't been exceeded

### "Token expired"
- App should auto-refresh, but if it doesn't, reconnect Spotify

