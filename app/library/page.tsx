'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Languages, CheckCircle, Clock, Loader2, ExternalLink } from 'lucide-react';
import { AuthPrompt } from '@/components/auth-prompt';

interface ArticleWithData {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  source: string;
  author: string;
  published_at: string;
  is_read: boolean;
  read_at: string | null;
  translation: string | null;
  translation_language: string | null;
  vocabulary: any[] | null;
  vocabulary_language: string | null;
  created_at: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [readArticles, setReadArticles] = useState<ArticleWithData[]>([]);
  const [translatedArticles, setTranslatedArticles] = useState<ArticleWithData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchUserArticles();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  async function fetchUserArticles() {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { supabase } = await import('@/lib/supabaseClient');
      
      // Fetch all user's articles
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const articles = (data || []) as ArticleWithData[];
      
      // Split into read and translated
      const read = articles.filter(a => a.is_read);
      const translated = articles.filter(a => a.translation !== null);
      
      setReadArticles(read);
      setTranslatedArticles(translated);
    } catch (error) {
      console.error('Error fetching user articles:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function ArticleCard({ article }: { article: ArticleWithData }) {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
        const lang = article.translation_language?.toLowerCase() || 'italian';
        router.push(`/article/${encodeURIComponent(article.id)}?lang=${lang}`);
      }}>
        <CardHeader>
          {article.image_url && (
            <div className="w-full h-48 mb-4 rounded-md overflow-hidden">
              <img 
                src={article.image_url} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {article.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {article.is_read && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md text-xs">
                <CheckCircle className="h-3 w-3" />
                Read
              </span>
            )}
            {article.translation && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-xs">
                <Languages className="h-3 w-3" />
                Translated ({article.translation_language})
              </span>
            )}
            {article.vocabulary && article.vocabulary.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs">
                <BookOpen className="h-3 w-3" />
                {article.vocabulary.length} words
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
            <span className="text-xs">{article.source}</span>
          </div>
          
          <div className="mt-3 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                window.open(article.url, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Original
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                const lang = article.translation_language?.toLowerCase() || 'italian';
                router.push(`/article/${encodeURIComponent(article.id)}?lang=${lang}`);
              }}
            >
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AuthPrompt 
          feature="Article Library" 
          description="Sign in to access your saved articles, translations, and vocabulary"
          icon={BookOpen}
        >
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Your Article Library</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to view your read articles and translations
            </p>
          </div>
        </AuthPrompt>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Library</h1>
        <p className="text-muted-foreground text-lg">
          Your reading history and saved translations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">
            All Articles ({readArticles.length})
          </TabsTrigger>
          <TabsTrigger value="translated">
            Translated ({translatedArticles.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({readArticles.filter(a => a.is_read).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : readArticles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start reading articles to build your library
                </p>
                <Button onClick={() => router.push('/')}>
                  Browse Articles
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {readArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="translated">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : translatedArticles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Languages className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No translated articles yet</h3>
                <p className="text-muted-foreground mb-4">
                  Translate articles to see them here
                </p>
                <Button onClick={() => router.push('/')}>
                  Find Articles to Translate
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {translatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="read">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : readArticles.filter(a => a.is_read).length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No read articles yet</h3>
                <p className="text-muted-foreground mb-4">
                  Mark articles as read to track your progress
                </p>
                <Button onClick={() => router.push('/')}>
                  Start Reading
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {readArticles.filter(a => a.is_read).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

