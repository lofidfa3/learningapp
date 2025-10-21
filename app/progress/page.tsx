'use client';

import { useState, useEffect } from 'react';
import { LanguageProgress, SUPPORTED_LANGUAGES, VocabularyItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LanguageSelector } from '@/components/language-selector';
import { BookOpen, TrendingUp, Calendar, Award, Target, Lock, LogIn } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '@/lib/auth-context';
import { useUserActions } from '@/lib/use-user-actions';
import { useUserData } from '@/lib/use-user-data';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ProgressPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { history, statistics } = useUserActions();
  const userDataManager = useUserData(user?.uid || null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('italian');
  const [progress, setProgress] = useState<Record<string, LanguageProgress>>({});
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && userDataManager) {
      loadUserProgress();
    } else {
      setIsLoading(false);
    }
  }, [user, userDataManager, selectedLanguage]);

  async function loadUserProgress() {
    if (!user || !userDataManager) return;
    
    setIsLoading(true);
    try {
      // Load user-specific data from Firestore
      const userProgress = await userDataManager.getProgress();
      setProgress(userProgress);

      const userVocabulary = await userDataManager.getVocabulary(selectedLanguage);
      setVocabulary(userVocabulary);

      // Load selected language from user settings
      const savedLanguage = await userDataManager.getSelectedLanguage();
      if (savedLanguage && savedLanguage !== selectedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
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

  const currentProgress = progress[selectedLanguage] || {
    language: selectedLanguage,
    totalWords: 0,
    masteredWords: 0,
    articlesRead: 0,
    lastActivity: new Date(),
    studyStreak: 0,
  };

  const masteryPercentage = currentProgress.totalWords > 0
    ? Math.round((currentProgress.masteredWords / currentProgress.totalWords) * 100)
    : 0;

  // Calculate study streak
  const daysSinceLastActivity = currentProgress.lastActivity
    ? differenceInDays(new Date(), new Date(currentProgress.lastActivity))
    : 999;
  const isStreakActive = daysSinceLastActivity <= 1;

  // Weekly progress
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const wordsThisWeek = vocabulary.filter(
    v => v.createdAt >= lastWeek
  ).length;

  const reviewsThisWeek = vocabulary.filter(
    v => v.lastReviewed && v.lastReviewed >= lastWeek
  ).length;

  // Learning insights
  const wordsInProgress = vocabulary.filter(v => !v.mastered).length;
  const wordsReadyForReview = vocabulary.filter(v => {
    if (v.mastered && v.reviewCount >= 5) return false;
    if (!v.nextReview) return true;
    return v.nextReview <= new Date();
  }).length;

  // Show authentication prompt for unauthenticated users
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground text-lg">
            Track your language learning journey
          </p>
        </div>

        <Card className="retro-card border-dashed border-2 border-muted">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              To track your progress and save your learning data, please sign in to your account. 
              Your progress will be saved securely and accessible across all your devices.
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
          <h1 className="text-4xl font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground text-lg">
            Loading your learning data...
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground text-lg">
          Track your language learning journey
        </p>
      </div>

      <div className="mb-6">
        <LanguageSelector
          value={selectedLanguage}
          onChange={handleLanguageChange}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vocabulary</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProgress.totalWords}</div>
            <p className="text-xs text-muted-foreground">
              +{wordsThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProgress.masteredWords}</div>
            <p className="text-xs text-muted-foreground">
              {masteryPercentage}% mastery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles Read</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProgress.articlesRead}</div>
            <p className="text-xs text-muted-foreground">
              Keep reading!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStreakActive ? currentProgress.studyStreak : 0} days
            </div>
            <p className="text-xs text-muted-foreground">
              {isStreakActive ? 'Keep it up!' : 'Start studying today!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Mastery</CardTitle>
            <CardDescription>
              Your progress towards mastering {SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{masteryPercentage}%</span>
              </div>
              <Progress value={masteryPercentage} className="h-2" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total words</span>
                <span className="font-medium">{currentProgress.totalWords}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mastered</span>
                <span className="font-medium text-green-600">{currentProgress.masteredWords}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In progress</span>
                <span className="font-medium text-blue-600">{wordsInProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ready for review</span>
                <span className="font-medium text-orange-600">{wordsReadyForReview}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your learning activity this week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">New words added</span>
                </div>
                <span className="font-bold text-lg">{wordsThisWeek}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Words reviewed</span>
                </div>
                <span className="font-bold text-lg">{reviewsThisWeek}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Last activity</span>
                </div>
                <span className="font-medium text-sm">
                  {currentProgress.lastActivity
                    ? format(new Date(currentProgress.lastActivity), 'MMM d, yyyy')
                    : 'Never'}
                </span>
              </div>
            </div>

            {currentProgress.totalWords > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {wordsReadyForReview > 0 ? (
                    <>
                      You have <span className="font-semibold text-foreground">{wordsReadyForReview} words</span> ready for review.
                      Keep up the good work! 🎉
                    </>
                  ) : (
                    <>
                      All caught up! Add more words or check back later for reviews.
                    </>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Languages Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Languages</CardTitle>
          <CardDescription>
            Overview of your progress across all languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(progress).length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Start learning to see your progress here!
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(progress).map(([lang, data]) => {
                const langInfo = SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES];
                const percentage = data.totalWords > 0
                  ? Math.round((data.masteredWords / data.totalWords) * 100)
                  : 0;

                return (
                  <div key={lang} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{langInfo?.flag}</span>
                        <span className="font-medium">{langInfo?.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {data.masteredWords} / {data.totalWords} words
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

