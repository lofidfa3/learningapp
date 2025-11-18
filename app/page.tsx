'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { NewsArticle } from '@/lib/types';
import { LanguageSelector } from '@/components/language-selector';
import { Button } from '@/components/ui/button';
import { NewsCardSkeleton } from '@/components/loading-skeleton';
import { apiCache } from '@/lib/cache';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, Zap, Loader2 } from 'lucide-react';

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
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('italian');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { user } = useAuth();

  // Handle OAuth redirects that land on root page with hash fragments
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      // Check if this is an OAuth callback (contains access_token or similar)
      if (hash.includes('access_token') || hash.includes('error')) {
        console.log('🔄 OAuth redirect detected on root page, redirecting to callback...');
        // Redirect to callback page with the hash
        router.replace(`/auth/callback${hash}`);
        return;
      }
    }
  }, [router]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setArticles([]);
    fetchNews(1, true);
  }, [selectedCategory, selectedSource]);

  const fetchNews = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    // Check cache first (only for first page)
    if (page === 1) {
      const cacheKey = `news-${selectedCategory}-${selectedSource}`;
      const cachedData = apiCache.get<NewsArticle[]>(cacheKey);
      
      if (cachedData) {
        setArticles(cachedData);
        setIsLoading(false);
        return;
      }
    }
    
    try {
      const sourceParam = selectedSource !== 'all' ? `&source=${selectedSource}` : '';
      const response = await fetch(
        `/api/news?category=${selectedCategory}&page=${page}&pageSize=100${sourceParam}`
      );
      const data = await response.json();

      if (data.articles) {
        if (reset) {
          setArticles(data.articles);
          // Cache for 5 minutes
          const cacheKey = `news-${selectedCategory}-${selectedSource}`;
          apiCache.set(cacheKey, data.articles, 5);
          
          // Update available sources and counts
          if (data.sources) {
            setAvailableSources(data.sources);
          }
          if (data.sourceCounts) {
            setSourceCounts(data.sourceCounts);
          }
        } else {
          // Append new articles
          setArticles((prev) => {
            const combined = [...prev, ...data.articles];
            // Remove duplicates
            const unique = Array.from(
              new Map(combined.map((article) => [article.id, article])).values()
            );
            return unique;
          });
        }
        
        setHasMore(data.hasMore || false);
        setCurrentPage(page);
        
        // Save articles to sessionStorage so they can be accessed in article detail page
        const allArticles = reset ? data.articles : [...articles, ...data.articles];
        sessionStorage.setItem('current-articles', JSON.stringify(allArticles));
      } else {
        console.error('Error fetching news:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, selectedSource, articles]);
  
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchNews(currentPage + 1, false);
    }
  }, [currentPage, hasMore, isLoadingMore, fetchNews]);

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

      {/* Source Filter */}
      {availableSources.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Filter by Source:
            </h3>
            <span className="text-xs text-muted-foreground">
              ({articles.length} articles)
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedSource === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSource('all')}
              className="whitespace-nowrap"
            >
              All Sources
              <span className="ml-1.5 text-xs opacity-70">
                ({Object.values(sourceCounts).reduce((a, b) => a + b, 0)})
              </span>
            </Button>
            {availableSources.map((source) => (
              <Button
                key={source}
                variant={selectedSource === source ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSource(source)}
                className="whitespace-nowrap"
              >
                {source}
                {sourceCounts[source] && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({sourceCounts[source]})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <NewsArticleCard
                key={article.id}
                article={article}
                targetLanguage={selectedLanguage}
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                variant="outline"
                size="lg"
                className="min-w-[200px]"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more articles...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Load More Articles
                  </>
                )}
              </Button>
            </div>
          )}
          
          {!hasMore && articles.length > 0 && (
            <div className="mt-8 text-center text-muted-foreground">
              <p>You've seen all available articles in this category.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

