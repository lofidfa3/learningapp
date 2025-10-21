'use client';

import { useState, useEffect } from 'react';
import { VocabularyItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlashcardReview } from '@/components/flashcard-review';
import { VocabularyManager } from '@/components/vocabulary-manager';
import { BookOpen, GraduationCap, Lock, LogIn } from 'lucide-react';
import { LanguageSelector } from '@/components/language-selector';
import { useAuth } from '@/lib/auth-context';
import { useUserData } from '@/lib/use-user-data';
import { useRouter } from 'next/navigation';

export default function FlashcardsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const userDataManager = useUserData(user?.uid || null);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('italian');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewWords, setReviewWords] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && userDataManager) {
      loadUserVocabulary();
    } else {
      setIsLoading(false);
    }
  }, [user, userDataManager, selectedLanguage]);

  async function loadUserVocabulary() {
    if (!user || !userDataManager) return;
    
    setIsLoading(true);
    try {
      const userVocabulary = await userDataManager.getVocabulary(selectedLanguage);
      setVocabulary(userVocabulary);

      // Load selected language from user settings
      const savedLanguage = await userDataManager.getSelectedLanguage();
      if (savedLanguage && savedLanguage !== selectedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading user vocabulary:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language);
    if (userDataManager) {
      await userDataManager.setSelectedLanguage(language);
    }
  };

  function handleStartReview() {
    // Get words that need review (not mastered or due for review)
    const now = new Date();
    const wordsToReview = vocabulary.filter(word => {
      if (word.mastered && word.reviewCount >= 5) return false;
      if (!word.nextReview) return true;
      return word.nextReview <= now;
    });

    if (wordsToReview.length === 0) {
      alert('No words to review! All caught up! 🎉');
      return;
    }

    // Shuffle words
    const shuffled = [...wordsToReview].sort(() => Math.random() - 0.5);
    setReviewWords(shuffled);
    setIsReviewing(true);
  }

  function handleReviewComplete() {
    setIsReviewing(false);
    setReviewWords([]);
    loadUserVocabulary();
  }

  // Show authentication prompt for unauthenticated users
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground text-lg">
            Practice your vocabulary with interactive flashcards
          </p>
        </div>

        <Card className="retro-card border-dashed border-2 border-muted">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              To access your flashcards and track your learning progress, please sign in to your account. 
              Your vocabulary will be saved securely and accessible across all your devices.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => router.push('/auth')}
                className="retro-button"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth')}
                variant="outline"
                className="retro-button-secondary"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground text-lg">
            Loading your vocabulary...
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading flashcards...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalWords = vocabulary.length;
  const masteredWords = vocabulary.filter(w => w.mastered).length;
  const wordsToReview = vocabulary.filter(w => {
    if (w.mastered && w.reviewCount >= 5) return false;
    if (!w.nextReview) return true;
    return w.nextReview <= new Date();
  }).length;

  if (isReviewing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FlashcardReview
          words={reviewWords}
          onComplete={handleReviewComplete}
          targetLanguage={selectedLanguage}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Flashcards</h1>
        <p className="text-muted-foreground text-lg">
          Review your vocabulary with spaced repetition
        </p>
      </div>

      <div className="mb-6">
        <LanguageSelector
          value={selectedLanguage}
          onChange={handleLanguageChange}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWords}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{masteredWords}</div>
            <p className="text-xs text-muted-foreground">
              {totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wordsToReview}</div>
            <Button
              onClick={handleStartReview}
              className="mt-2 w-full"
              disabled={wordsToReview === 0}
            >
              Start Review
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Words ({totalWords})</TabsTrigger>
          <TabsTrigger value="learning">Learning ({totalWords - masteredWords})</TabsTrigger>
          <TabsTrigger value="mastered">Mastered ({masteredWords})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <VocabularyManager
            vocabulary={vocabulary}
            onUpdate={loadUserVocabulary}
          />
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <VocabularyManager
            vocabulary={vocabulary.filter(w => !w.mastered)}
            onUpdate={loadUserVocabulary}
          />
        </TabsContent>

        <TabsContent value="mastered" className="mt-6">
          <VocabularyManager
            vocabulary={vocabulary.filter(w => w.mastered)}
            onUpdate={loadUserVocabulary}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

