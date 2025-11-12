'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/language-selector';
import { Download, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useUserData } from '@/lib/use-user-data';
import { UserDataManager } from '@/lib/user-data';

export default function SettingsPage() {
  const { user } = useAuth();
  const userDataManager: UserDataManager | null = useUserData(user?.id ?? null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('italian');
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});

  useEffect(() => {
    if (userDataManager) {
      userDataManager.getVocabulary().then(setVocabulary);
      userDataManager.getSavedArticles().then(setArticles);
      userDataManager.getProgress().then(setProgress);
    }
  }, [userDataManager]);
  
  const stats = {
    vocabularyCount: vocabulary.length,
    articlesCount: articles.length,
    languagesCount: Object.keys(progress).length,
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  function handleExportData() {
    if (!user) return;
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
            <CardTitle>AI Model Configuration</CardTitle>
            <CardDescription>
              The application is powered by DeepSeek AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  AI-Powered Learning
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  This app uses the DeepSeek API for translations, vocabulary extraction, and chat. 
                  Ensure your API key is set in the environment variables.
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
              Export your learning data from the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full justify-start"
              disabled={!user}
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Data (JSON)
            </Button>

            <p className="text-xs text-muted-foreground">
              Your learning data is stored securely in our database. You can export it anytime for a backup.
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
              <strong className="text-foreground">LinguaNews</strong> - Learn languages through live news articles
            </p>
            <p>
              This app uses AI to help you learn new languages by reading real news articles. 
              Features include AI-powered translations, vocabulary extraction, spaced repetition flashcards, and progress tracking.
            </p>
            <p className="text-xs">
              Built with Next.js, TypeScript, Tailwind CSS, Supabase, and DeepSeek AI.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

