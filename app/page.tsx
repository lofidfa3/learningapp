'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { NewsArticle } from '@/lib/types';
import { LanguageSelector } from '@/components/language-selector';
import { Button } from '@/components/ui/button';
import { NewsCardSkeleton } from '@/components/loading-skeleton';
import { getSelectedLanguage } from '@/lib/storage';
import { apiCache } from '@/lib/cache';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, Zap } from 'lucide-react';

// Lazy load news card for better performance
const NewsArticleCard = dynamic(
  () => import('@/components/news-article-card').then(mod => ({ default: mod.NewsArticleCard })),
  { loading: () => <NewsCardSkeleton />, ssr: false }
);

const categories = [
  { value: 'general', label: 'General' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'science', label: 'Science' },
  { value: 'health', label: 'Health' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
];

export default function HomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('italian');
  const { user } = useAuth();

  useEffect(() => {
    const savedLanguage = getSelectedLanguage();
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    
    // Check cache first
    const cacheKey = `news-${selectedCategory}`;
    const cachedData = apiCache.get<NewsArticle[]>(cacheKey);
    
    if (cachedData) {
      setArticles(cachedData);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(
        `/api/news?category=${selectedCategory}&page=1`
      );
      const data = await response.json();

      if (data.articles) {
        setArticles(data.articles);
        
        // Cache for 5 minutes
        apiCache.set(cacheKey, data.articles, 5);
        
        // Save articles to sessionStorage so they can be accessed in article detail page
        sessionStorage.setItem('current-articles', JSON.stringify(data.articles));
      } else {
        console.error('Error fetching news:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      {user && (
        <div className="mb-6">
          <div className="bg-green-50 dark:bg-green-950 border-2 border-green-500 retro-card p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 retro-glow" />
              <div>
                <h2 className="text-lg font-bold text-green-600 dark:text-green-400 uppercase">
                  Welcome to LinguaNews!
                </h2>
                <p className="text-sm text-muted-foreground">
                  You're signed in and ready to learn languages with live news articles.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Learn Languages with Live News</h1>
        <p className="text-muted-foreground text-lg">
          Read real news articles, get AI translations, and build your vocabulary
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <LanguageSelector
          value={selectedLanguage}
          onChange={setSelectedLanguage}
        />

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsArticleCard
              key={article.id}
              article={article}
              targetLanguage={selectedLanguage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

