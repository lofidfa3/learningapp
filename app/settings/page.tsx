'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/language-selector';
import { getSelectedLanguage, getVocabulary, getProgress, getSavedArticles } from '@/lib/storage';
import { Download, Trash2, Info } from 'lucide-react';

export default function SettingsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('italian');
  const [stats, setStats] = useState({
    vocabularyCount: 0,
    articlesCount: 0,
    languagesCount: 0,
  });

  useEffect(() => {
    const savedLanguage = getSelectedLanguage();
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }

    updateStats();
  }, []);

  function updateStats() {
    const vocabulary = getVocabulary();
    const articles = getSavedArticles();
    const progress = getProgress();

    setStats({
      vocabularyCount: vocabulary.length,
      articlesCount: articles.length,
      languagesCount: Object.keys(progress).length,
    });
  }

  function handleExportData() {
    const vocabulary = getVocabulary();
    const progress = getProgress();
    const articles = getSavedArticles();

    const exportData = {
      vocabulary,
      progress,
      articles,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `language-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  function handleClearData() {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('language-learning-vocabulary');
      localStorage.removeItem('language-learning-progress');
      localStorage.removeItem('language-learning-articles');
      
      alert('All data has been cleared.');
      updateStats();
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your preferences and data
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Preference */}
        <Card>
          <CardHeader>
            <CardTitle>Default Language</CardTitle>
            <CardDescription>
              Choose your preferred target language for learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
            />
          </CardContent>
        </Card>

        {/* Data Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Data</CardTitle>
            <CardDescription>
              Overview of your stored learning data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Total vocabulary words</span>
              <span className="font-medium">{stats.vocabularyCount}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Saved articles</span>
              <span className="font-medium">{stats.articlesCount}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Languages learning</span>
              <span className="font-medium">{stats.languagesCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration Info */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Information about required API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-green-900">✅ No API Keys Required!</p>
                <p className="text-green-800">
                  This app uses completely free APIs and works immediately without any configuration.
                </p>
                <ul className="list-disc list-inside space-y-1 text-green-700 mt-2">
                  <li>
                    <strong>The Guardian API</strong> - Free news articles (no key needed)
                  </li>
                  <li>
                    <strong>MyMemory Translation API</strong> - Free translations (no key needed)
                  </li>
                  <li>
                    <strong>Lyrics APIs</strong> - Free song lyrics (lyrics.ovh, lrclib.net, ChartLyrics)
                  </li>
                  <li>
                    <strong>Custom NLP</strong> - Smart vocabulary extraction
                  </li>
                </ul>
                <p className="text-xs text-green-700 mt-3">
                  Optional: For enhanced features, you can add free API keys to your{' '}
                  <code className="bg-green-100 px-1 py-0.5 rounded">.env.local</code> file:
                  <br />
                  <code className="block mt-1 bg-green-100 p-2 rounded">
                    GUARDIAN_API_KEY=your_free_key (optional)
                    <br />
                    GNEWS_API_KEY=your_free_key (optional)
                    <br />
                    NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_id (for Lyrics)
                  </code>
                  <br />
                  <span className="text-xs mt-1 block">
                    See <strong>SPOTIFY_SETUP.md</strong> for Spotify integration guide
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export or clear your learning data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Data (JSON)
            </Button>
            
            <Button
              onClick={handleClearData}
              variant="destructive"
              className="w-full justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>

            <p className="text-xs text-muted-foreground">
              All data is stored locally in your browser. Export your data regularly to keep a backup.
            </p>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">LinguaNews</strong> - Learn languages through live news articles & song lyrics
            </p>
            <p>
              This app uses free translation APIs and smart vocabulary extraction to help you learn new languages 
              by reading real news articles and your favorite song lyrics. Features include Spotify integration, 
              spaced repetition flashcards, progress tracking, and text-to-speech for pronunciation practice.
            </p>
            <p className="text-xs">
              Built with Next.js, TypeScript, Tailwind CSS, and 100% free APIs
            </p>
            <p className="text-xs text-green-600 font-medium mt-1">
              ✨ No API keys required - completely free to use!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

