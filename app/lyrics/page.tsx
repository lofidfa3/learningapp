'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Play, Volume2, BookMarked, Loader2 } from 'lucide-react';
import { getSelectedLanguage } from '@/lib/storage';
import { LanguageSelector } from '@/components/language-selector';
import { addVocabularyItem } from '@/lib/storage';
import { SUPPORTED_LANGUAGES } from '@/lib/types';
import { VocabularyListSkeleton } from '@/components/loading-skeleton';
import { apiCache } from '@/lib/cache';
import { SpotifyLoginButton } from '@/components/spotify-login-button';

// Lazy load vocabulary list
const VocabularyList = dynamic(() => import('@/components/vocabulary-list').then(mod => ({ default: mod.VocabularyList })), {
  loading: () => <VocabularyListSkeleton />,
  ssr: false
});

export default function LyricsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('italian');
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [spotifyUser, setSpotifyUser] = useState<any>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [lyrics, setLyrics] = useState<string>('');
  const [translatedLyrics, setTranslatedLyrics] = useState<string>('');
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExtractingVocab, setIsExtractingVocab] = useState(false);
  const [activeTab, setActiveTab] = useState('original');

  useEffect(() => {
    const savedLanguage = getSelectedLanguage();
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }

    // Check for Spotify authentication
    const checkAuth = async () => {
      const { getSpotifyAuth } = await import('@/lib/spotify-auth');
      const auth = getSpotifyAuth();
      
      if (auth) {
        setSpotifyToken(auth.accessToken);
        setSpotifyUser(auth.user);
      }
    };
    
    checkAuth();
  }, []);


  async function fetchCurrentlyPlaying() {
    if (!spotifyToken) return;

    try {
      const response = await fetch(`/api/spotify/currently-playing?access_token=${spotifyToken}`);
      const data = await response.json();

      if (data.playing && data.track) {
        setCurrentTrack(data.track);
      } else {
        setCurrentTrack(null);
      }
    } catch (error) {
      console.error('Error fetching currently playing:', error);
    }
  }

  const fetchLyrics = useCallback(async () => {
    if (!currentTrack) return;

    setIsLoadingLyrics(true);
    
    // Check cache first
    const cacheKey = `lyrics-${currentTrack.artist}-${currentTrack.name}`;
    const cachedLyrics = apiCache.get<string>(cacheKey);
    
    if (cachedLyrics) {
      setLyrics(cachedLyrics);
      setIsLoadingLyrics(false);
      return;
    }
    
    try {
      const response = await fetch('/api/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: currentTrack.artist,
          title: currentTrack.name,
        }),
      });

      const data = await response.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
        // Cache lyrics for 30 minutes
        apiCache.set(cacheKey, data.lyrics, 30);
      } else {
        alert(data.error || 'Lyrics not found');
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      alert('Failed to fetch lyrics');
    } finally {
      setIsLoadingLyrics(false);
    }
  }, [currentTrack]);

  async function translateLyrics() {
    if (!lyrics) return;

    setIsTranslating(true);
    try {
      const languageInfo = SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES];
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: lyrics,
          targetLanguage: languageInfo.name,
        }),
      });

      const data = await response.json();
      if (data.translatedText) {
        setTranslatedLyrics(data.translatedText);
        setActiveTab('translation');
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  }

  async function extractVocabulary() {
    if (!lyrics) return;

    setIsExtractingVocab(true);
    try {
      const languageInfo = SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES];
      const response = await fetch('/api/vocabulary/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: lyrics,
          targetLanguage: languageInfo.name,
          count: 15,
        }),
      });

      const data = await response.json();
      if (data.vocabulary) {
        setVocabulary(data.vocabulary);
      }
    } catch (error) {
      console.error('Vocabulary extraction failed:', error);
    } finally {
      setIsExtractingVocab(false);
    }
  }

  function handleSaveVocabulary(vocabItem: any) {
    if (!currentTrack) return;

    const vocabularyItem = {
      id: `${Date.now()}-${Math.random()}`,
      originalWord: vocabItem.originalWord,
      translatedWord: vocabItem.translatedWord,
      originalSentence: vocabItem.originalSentence,
      translatedSentence: vocabItem.translatedSentence,
      language: selectedLanguage,
      articleId: currentTrack.id,
      articleTitle: `${currentTrack.name} - ${currentTrack.artist}`,
      mastered: false,
      reviewCount: 0,
      createdAt: new Date(),
    };

    addVocabularyItem(vocabularyItem);
  }

  if (!spotifyToken) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Music className="h-8 w-8" />
                Learn from Song Lyrics
              </CardTitle>
              <CardDescription className="text-base">
                Sign in with Spotify to learn vocabulary from your favorite songs!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                  <li>Sign in with your Spotify account</li>
                  <li>Play any song on Spotify (phone, computer, or web)</li>
                  <li>We'll fetch the lyrics automatically</li>
                  <li>Get translations and vocabulary in your target language</li>
                  <li>Save words to flashcards for review</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✨ With your account:</h3>
                <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                  <li>See your profile picture and name</li>
                  <li>Access currently playing track</li>
                  <li>Personalized experience</li>
                  <li>Your data stays private and secure</li>
                </ul>
              </div>

              <SpotifyLoginButton size="lg" className="w-full" />

              <p className="text-xs text-muted-foreground text-center">
                We only access your profile and currently playing track. No playlists or listening history.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Music className="h-8 w-8" />
          Learn from Lyrics
        </h1>
        <LanguageSelector value={selectedLanguage} onChange={setSelectedLanguage} />
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Currently Playing on Spotify</CardTitle>
            <CardDescription>
              Play a song on Spotify to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchCurrentlyPlaying} className="mb-4">
              Refresh Currently Playing
            </Button>

            {currentTrack ? (
              <div className="flex items-start gap-4">
                {currentTrack.imageUrl && (
                  <img
                    src={currentTrack.imageUrl}
                    alt={currentTrack.name}
                    className="w-24 h-24 rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{currentTrack.name}</h3>
                  <p className="text-muted-foreground">{currentTrack.artist}</p>
                  <p className="text-sm text-muted-foreground">{currentTrack.album}</p>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={fetchLyrics} disabled={isLoadingLyrics}>
                      {isLoadingLyrics ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Music className="h-4 w-4 mr-2" />
                      )}
                      Get Lyrics
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No song currently playing</p>
            )}
          </CardContent>
        </Card>

        {lyrics && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{currentTrack?.name} - Lyrics</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={translateLyrics} disabled={isTranslating} size="sm">
                    {isTranslating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4 mr-2" />
                    )}
                    Translate
                  </Button>
                  <Button onClick={extractVocabulary} disabled={isExtractingVocab} variant="outline" size="sm">
                    {isExtractingVocab ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BookMarked className="h-4 w-4 mr-2" />
                    )}
                    Extract Vocabulary
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="original">Original Lyrics</TabsTrigger>
                  <TabsTrigger value="translation">
                    Translation ({SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="original" className="mt-4">
                  <div className="prose prose-slate max-w-none">
                    <p className="whitespace-pre-wrap">{lyrics}</p>
                  </div>
                </TabsContent>

                <TabsContent value="translation" className="mt-4">
                  {translatedLyrics ? (
                    <div className="prose prose-slate max-w-none">
                      <p className="whitespace-pre-wrap text-primary">{translatedLyrics}</p>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      Click "Translate" to see lyrics in {SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {vocabulary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary from Lyrics ({vocabulary.length} words)</CardTitle>
            </CardHeader>
            <CardContent>
              <VocabularyList
                vocabulary={vocabulary}
                onSaveWord={handleSaveVocabulary}
                targetLanguage={selectedLanguage}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

