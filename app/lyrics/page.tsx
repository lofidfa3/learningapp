'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Music, Play, Pause, LogIn, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSupabaseData } from '@/lib/use-supabase-data';
import { SUPPORTED_LANGUAGES } from '@/lib/types';
import { LanguageSelector } from '@/components/language-selector';
import { toast } from 'sonner';
import { actionToasts } from '@/lib/toast-utils';
import { ClickableLyrics } from '@/components/clickable-lyrics';
import { MusicPlayer } from '@/components/music-player';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  image: string;
  previewUrl: string;
  duration: number;
  progress: number;
}

export default function LyricsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabaseData = useSupabaseData(user?.id || null);
  
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalLyrics, setOriginalLyrics] = useState<string>('');
  const [translatedLyrics, setTranslatedLyrics] = useState<string>('');
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('italian');
  const [selectedWord, setSelectedWord] = useState<{ word: string; meaning: string } | null>(null);

  // Handle Spotify OAuth callback
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refresh = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');

    if (accessToken && refresh) {
      setSpotifyToken(accessToken);
      setRefreshToken(refresh);
      if (expiresIn) {
        setTokenExpiresAt(Date.now() + parseInt(expiresIn) * 1000);
      }
      // Clear URL params
      window.history.replaceState({}, '', '/lyrics');
    }

    // Load saved tokens from localStorage
    const savedToken = localStorage.getItem('spotify_access_token');
    const savedRefresh = localStorage.getItem('spotify_refresh_token');
    const savedExpires = localStorage.getItem('spotify_token_expires');

    if (savedToken && savedRefresh) {
      setSpotifyToken(savedToken);
      setRefreshToken(savedRefresh);
      if (savedExpires) {
        setTokenExpiresAt(parseInt(savedExpires));
      }
    }
  }, [searchParams]);

  // Save tokens to localStorage
  useEffect(() => {
    if (spotifyToken) {
      localStorage.setItem('spotify_access_token', spotifyToken);
    }
    if (refreshToken) {
      localStorage.setItem('spotify_refresh_token', refreshToken);
    }
    if (tokenExpiresAt) {
      localStorage.setItem('spotify_token_expires', tokenExpiresAt.toString());
    }
  }, [spotifyToken, refreshToken, tokenExpiresAt]);

  // Refresh token if expired
  const refreshSpotifyToken = useCallback(async () => {
    if (!refreshToken) return null;

    try {
      const response = await fetch('/api/spotify/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();
      if (data.access_token) {
        setSpotifyToken(data.access_token);
        setTokenExpiresAt(Date.now() + data.expires_in * 1000);
        return data.access_token;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
    return null;
  }, [refreshToken]);

  // Get valid access token
  const getValidToken = useCallback(async () => {
    if (!spotifyToken) return null;
    
    if (tokenExpiresAt && Date.now() >= tokenExpiresAt - 60000) {
      // Token expires in less than 1 minute, refresh it
      return await refreshSpotifyToken();
    }
    
    return spotifyToken;
  }, [spotifyToken, tokenExpiresAt, refreshSpotifyToken]);

  // Track ID to detect changes
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  // Fetch lyrics from Genius using exact Spotify track info
  const fetchLyrics = useCallback(async (songTitle: string, artist: string) => {
    setIsLoadingLyrics(true);
    try {
      console.log('🎵 Fetching lyrics for:', { songTitle, artist });
      
      // Step 1: Search for song on Genius using exact Spotify track info
      const searchResponse = await fetch(`/api/genius/lyrics?song=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(artist)}`);
      const searchData = await searchResponse.json();

      if (searchData.error) {
        console.error('❌ Genius search error:', searchData.error);
        toast.error(`Could not find lyrics: ${searchData.error}`);
        return;
      }

      if (!searchData.lyricsUrl) {
        console.error('❌ No lyrics URL returned');
        toast.error('Could not find lyrics URL');
        return;
      }

      console.log('✅ Found lyrics URL:', searchData.lyricsUrl);

      // Step 2: Fetch lyrics text
      const lyricsResponse = await fetch(`/api/genius/lyrics-text?url=${encodeURIComponent(searchData.lyricsUrl)}`);
      const lyricsData = await lyricsResponse.json();

      if (lyricsData.error) {
        console.error('❌ Lyrics extraction error:', lyricsData.error);
        toast.error(`Could not extract lyrics: ${lyricsData.error}`);
        return;
      }

      if (lyricsData.lyrics && lyricsData.lyrics.length > 50) {
        console.log('✅ Lyrics fetched successfully:', { length: lyricsData.lyrics.length });
        setOriginalLyrics(lyricsData.lyrics);
        toast.success('Lyrics loaded successfully');
      } else {
        console.error('❌ Lyrics too short or empty:', { length: lyricsData.lyrics?.length || 0 });
        toast.error('Could not fetch lyrics - extracted text is too short');
      }
    } catch (error: any) {
      console.error('❌ Error fetching lyrics:', error);
      toast.error(`Failed to fetch lyrics: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoadingLyrics(false);
    }
  }, []);

  // Fetch current track (only fetch lyrics if track changed)
  const fetchCurrentTrack = useCallback(async (skipLyrics = false) => {
    const token = await getValidToken();
    if (!token) {
      toast.error('Please connect your Spotify account');
      return;
    }

    setIsLoadingTrack(true);
    try {
      const response = await fetch(`/api/spotify/current-track?access_token=${token}`);
      const data = await response.json();

      if (data.error && data.error !== 'No track currently playing') {
        toast.error(data.error);
        return;
      }

      if (data.track) {
        const trackChanged = currentTrackId !== data.track.id;
        
        // Only update if track changed or if we're not skipping lyrics
        if (trackChanged || !skipLyrics) {
          setCurrentTrack(data.track);
          setCurrentTrackId(data.track.id);
          setIsPlaying(data.isPlaying || false);
          
          // Only fetch lyrics if track actually changed
          if (trackChanged) {
            setOriginalLyrics(''); // Clear old lyrics
            setTranslatedLyrics(''); // Clear old translation
            await fetchLyrics(data.track.name, data.track.artists);
          }
        } else {
          // Just update progress and playing state without re-fetching
          setCurrentTrack(prev => prev ? { ...prev, progress: data.track.progress } : null);
          setIsPlaying(data.isPlaying || false);
        }
      } else {
        setCurrentTrack(null);
        setCurrentTrackId(null);
        if (!skipLyrics) {
          toast.info('No track currently playing on Spotify');
        }
      }
    } catch (error) {
      console.error('Error fetching track:', error);
      if (!skipLyrics) {
        toast.error('Failed to fetch current track');
      }
    } finally {
      setIsLoadingTrack(false);
    }
  }, [getValidToken, currentTrackId, fetchLyrics]);

  // Translate lyrics
  const translateLyrics = useCallback(async () => {
    if (!originalLyrics) {
      toast.error('No lyrics to translate');
      return;
    }

    setIsTranslating(true);
    try {
      const languageInfo = SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES];
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalLyrics,
          targetLanguage: languageInfo.name,
          userId: user?.id,
        }),
      });

      const data = await response.json();
      if (data.translatedText) {
        setTranslatedLyrics(data.translatedText);
        toast.success('Lyrics translated successfully');
      } else {
        toast.error(data.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate lyrics');
    } finally {
      setIsTranslating(false);
    }
  }, [originalLyrics, selectedLanguage, user?.id]);

  // Handle Spotify login
  const handleSpotifyLogin = async () => {
    try {
      const response = await fetch('/api/spotify/auth?action=login');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Spotify login error:', error);
      toast.error('Failed to initiate Spotify login');
    }
  };

  // Poll for track updates - only update progress, not full refresh
  useEffect(() => {
    if (!spotifyToken) return;

    // Initial fetch when token is available
    if (!currentTrack) {
      fetchCurrentTrack(false);
      return;
    }

    // If playing, poll more frequently but only update progress
    // If not playing, poll less frequently to detect when playback starts
    const pollInterval = isPlaying ? 3000 : 10000; // 3s when playing, 10s when paused

    const interval = setInterval(() => {
      // Skip lyrics fetch on polling - only update progress/time
      fetchCurrentTrack(true);
    }, pollInterval);

    return () => clearInterval(interval);
  }, [spotifyToken, isPlaying, currentTrack, fetchCurrentTrack]);

  // Add word to flashcards
  const handleAddToFlashcards = async (word: string, translation: string) => {
    if (!user || !currentTrack) {
      toast.error('Please sign in to save words');
      return;
    }

    try {
      const vocabularyItem = {
        id: `${Date.now()}-${Math.random()}`,
        originalWord: word,
        translatedWord: translation,
        originalSentence: originalLyrics.split('\n').find(line => line.includes(word)) || '',
        translatedSentence: translatedLyrics.split('\n').find(line => line.toLowerCase().includes(translation.toLowerCase())) || '',
        language: selectedLanguage,
        articleId: `lyrics-${currentTrack.id}`,
        articleTitle: `${currentTrack.name} - ${currentTrack.artists}`,
        mastered: false,
        reviewCount: 0,
        createdAt: new Date(),
      };

      const success = await supabaseData.saveVocab(vocabularyItem);
      if (success) {
        toast.success(`"${word}" added to flashcards`);
        setSelectedWord(null);
      } else {
        toast.error('Failed to save word');
      }
    } catch (error) {
      console.error('Error saving word:', error);
      toast.error('Failed to save word to flashcards');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Learn Languages with Music</h1>
        <p className="text-muted-foreground text-lg">
          Connect your Spotify account and learn from song lyrics
        </p>
      </div>

      {!spotifyToken ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-6 w-6" />
              Connect Spotify
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Connect your Spotify account to see lyrics for the song you're currently playing.
            </p>
            <Button onClick={handleSpotifyLogin} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Connect with Spotify
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Music Player */}
          {currentTrack && (
            <MusicPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              onRefresh={fetchCurrentTrack}
            />
          )}

          {/* Language Selector */}
          <div className="flex items-center justify-between">
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
            />
            {originalLyrics && (
              <Button
                onClick={translateLyrics}
                disabled={isTranslating}
                variant="outline"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  'Translate Lyrics'
                )}
              </Button>
            )}
          </div>

          {/* Lyrics Display */}
          {isLoadingTrack || isLoadingLyrics ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : originalLyrics ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Lyrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Original Language</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                      {originalLyrics}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Translated Lyrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Target Language ({SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name})</CardTitle>
                </CardHeader>
                <CardContent>
                  {translatedLyrics ? (
                    <ClickableLyrics
                      lyrics={translatedLyrics}
                      originalLyrics={originalLyrics}
                      targetLanguage={selectedLanguage}
                      onWordClick={(word, meaning) => setSelectedWord({ word, meaning })}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Click "Translate Lyrics" to see the translation</p>
                      <p className="text-sm mt-2">Each word will be clickable to see its meaning</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No lyrics loaded. Play a song on Spotify and click refresh.</p>
                {currentTrack && (
                  <Button onClick={() => fetchLyrics(currentTrack.name, currentTrack.artists)} className="mt-4">
                    Load Lyrics
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Word Meaning Modal */}
          {selectedWord && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedWord(null)}>
              <Card className="max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                  <CardTitle>{selectedWord.word}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Meaning:</p>
                    <p className="text-lg">{selectedWord.meaning}</p>
                  </div>
                  {user && (
                    <Button
                      onClick={() => handleAddToFlashcards(selectedWord.word, selectedWord.meaning)}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Flashcards
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWord(null)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

