'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { NewsArticle, VocabularyItem, SUPPORTED_LANGUAGES } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Volume2, BookMarked, ExternalLink, Plus, MessageSquare } from 'lucide-react';
import { ArticleReader } from '@/components/article-reader';
import { VocabularyList } from '@/components/vocabulary-list';
import { AIChat } from '@/components/ai-chat';
import { AuthPrompt } from '@/components/auth-prompt';
import { useAuth } from '@/lib/auth-context';
import { useUserData } from '@/lib/use-user-data';
import { useUserActions } from '@/lib/use-user-actions';
import { useSupabaseData } from '@/lib/use-supabase-data';
import { actionToasts, showError } from '@/lib/toast-utils';

export default function ArticlePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const articleId = decodeURIComponent(params.id as string);
  const targetLanguage = searchParams.get('lang') || 'italian';
  const { user } = useAuth();
  const userDataManager = useUserData(user?.id || null);
  const { track: trackOld } = useUserActions();
  const supabaseData = useSupabaseData(user?.id || null);

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [translation, setTranslation] = useState<string>('');
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExtractingVocab, setIsExtractingVocab] = useState(false);
  const [activeTab, setActiveTab] = useState('original');
  const [isRead, setIsRead] = useState(false);

  // Load article from session storage or database, and load saved translation/vocabulary
  useEffect(() => {
    let mounted = true;

    async function loadArticleAndData() {
      if (!user || !articleId) return;

      try {
        const { 
          getArticleWithData, 
          saveArticle, 
          getArticleById 
        } = await import('@/lib/supabase-services');

        // Step 1: Try to load article from sessionStorage first (faster)
        const savedArticles = sessionStorage.getItem('current-articles');
        let foundArticle: NewsArticle | null = null;

        if (savedArticles) {
          try {
            const articles = JSON.parse(savedArticles);
            foundArticle = articles.find((a: NewsArticle) => a.id === articleId) || null;
          } catch (e) {
            console.error('Error parsing sessionStorage articles:', e);
          }
        }

        // Step 2: If not in sessionStorage, try to load from database
        if (!foundArticle) {
          foundArticle = await getArticleById(user.id, articleId);
        }

        // Step 3: Set article if found
        if (foundArticle && mounted) {
          setArticle(foundArticle);
          // Ensure article is saved to database (upsert - won't duplicate)
          await saveArticle(user.id, foundArticle);
        }

        // Step 4: ALWAYS load translation and vocabulary from database (independent of article source)
        const savedData = await getArticleWithData(user.id, articleId);
        
        if (mounted && savedData) {
          // Check if saved translation language matches current target language
          const currentLanguageName = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name;
          const translationMatches = !savedData.translationLanguage || savedData.translationLanguage === currentLanguageName;
          
          if (savedData.translation && translationMatches) {
            setTranslation(savedData.translation);
            // Automatically switch to translation tab if translation exists
            setActiveTab('translation');
            console.log('✅ Loaded saved translation - switched to translation tab');
          } else if (savedData.translation && !translationMatches) {
            console.log('⚠️ Saved translation exists but for different language:', savedData.translationLanguage, 'vs', currentLanguageName);
          }
          
          // Check if saved vocabulary language matches current target language
          const vocabularyMatches = !savedData.vocabularyLanguage || savedData.vocabularyLanguage === currentLanguageName;
          
          if (savedData.vocabulary && savedData.vocabulary.length > 0 && vocabularyMatches) {
            setVocabulary(savedData.vocabulary);
            console.log('✅ Loaded saved vocabulary:', savedData.vocabulary.length, 'items');
          } else if (savedData.vocabulary && savedData.vocabulary.length > 0 && !vocabularyMatches) {
            console.log('⚠️ Saved vocabulary exists but for different language:', savedData.vocabularyLanguage, 'vs', currentLanguageName);
          }
        }
      } catch (error) {
        console.error('Error loading article and data:', error);
      }
    }

    loadArticleAndData();

    return () => {
      mounted = false;
    };
  }, [articleId, user?.id]); // Only depend on articleId and user.id - don't depend on article

  // Check read status when article is loaded
  useEffect(() => {
    async function checkReadStatus() {
      if (user && article) {
        const savedArticle = supabaseData.articles.find(a => a.id === article.id);
        if (savedArticle && savedArticle.is_read) {
          setIsRead(true);
        }
      }
    }
    checkReadStatus();
  }, [user, article?.id, supabaseData.articles]); // Only depend on article.id, not the whole article object

  async function handleTranslate() {
    if (!article) return;

    setIsTranslating(true);
    try {
      const languageInfo = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES];
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: article.content,
          targetLanguage: languageInfo.name,
          userId: user?.id,
          articleId: article.id,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Translation API error:', data);
        showError(data.error || 'Translation failed', data.details || 'Please try again.');
        return;
      }

      if (data.translatedText) {
        setTranslation(data.translatedText);
        setActiveTab('translation');
        actionToasts.translationComplete();
        
        // Save translation to database
        if (user && article) {
          try {
            const { saveArticleTranslation } = await import('@/lib/supabase-services');
            const languageInfo = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES];
            await saveArticleTranslation(user.id, article.id, data.translatedText, languageInfo.name, article);
            console.log('✅ Translation saved to database');
          } catch (error) {
            console.error('Error saving translation:', error);
            // Don't fail the request if saving fails
          }
        }
      } else if (data.error) {
        console.error('Translation error:', data.error);
        showError(data.error || 'Translation failed', 'Please check your API configuration.');
      }
    } catch (error: any) {
      console.error('Translation failed:', error);
      showError('Translation failed', error.message || 'Please try again.');
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleExtractVocabulary() {
    if (!article) return;

    setIsExtractingVocab(true);
    try {
      const languageInfo = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES];
      const response = await fetch('/api/vocabulary/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: article.content,
          targetLanguage: languageInfo.name,
          count: 15,
          userId: user?.id,
          articleId: article.id,
        }),
      });

      const data = await response.json();
      if (data.vocabulary) {
        setVocabulary(data.vocabulary);
        actionToasts.vocabularyExtracted(data.vocabulary.length);
        
        // Save vocabulary to database
        if (user && article) {
          try {
            const { saveArticleVocabulary } = await import('@/lib/supabase-services');
            const languageInfo = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES];
            await saveArticleVocabulary(user.id, article.id, data.vocabulary, languageInfo.name, article);
            console.log('✅ Vocabulary saved to database');
          } catch (error) {
            console.error('Error saving vocabulary:', error);
            // Don't fail the request if saving fails
          }
        }
      }
    } catch (error) {
      console.error('Vocabulary extraction failed:', error);
    } finally {
      setIsExtractingVocab(false);
    }
  }

  async function handleSaveVocabulary(vocabItem: any) {
    if (!article || !user) {
      console.error('Missing required data for saving vocabulary');
      return;
    }

    // Validate required fields
    if (!vocabItem.originalWord || !vocabItem.translatedWord) {
      console.error('Missing required vocabulary fields:', vocabItem);
      return;
    }

    const vocabularyItem: VocabularyItem = {
      id: `${Date.now()}-${Math.random()}`,
      originalWord: vocabItem.originalWord,
      translatedWord: vocabItem.translatedWord,
      originalSentence: vocabItem.originalSentence || '',
      translatedSentence: vocabItem.translatedSentence || '',
      language: targetLanguage,
      articleId: article.id,
      articleTitle: article.title,
      mastered: false,
      reviewCount: 0,
      createdAt: new Date(),
    };

    try {
      // Save to Supabase
      const success = await supabaseData.saveVocab(vocabularyItem);
      
      if (success) {
        await supabaseData.track('saved_word', 'vocabulary', article.id, {
          word: vocabularyItem.originalWord,
          language: targetLanguage,
        });
        console.log('Vocabulary item saved successfully for user:', user.id);
      }
    } catch (error) {
      console.error('Error saving vocabulary item:', error);
    }
  }

  async function handleSaveAllVocabulary() {
    if (!user) {
      console.error('Missing user for saving all vocabulary');
      return;
    }
    
    if (vocabulary.length === 0) {
      return;
    }
    
    try {
      console.log(`Saving ${vocabulary.length} vocabulary items for user:`, user.id);
      
      let savedCount = 0;
      
      for (const vocab of vocabulary) {
        try {
          await handleSaveVocabulary(vocab);
          savedCount++;
        } catch (error) {
          console.error(`Failed to save vocabulary item:`, vocab, error);
        }
      }
      
      if (savedCount > 0 && article) {
        await supabaseData.track('saved_word', 'vocabulary', article.id, {
          count: savedCount,
          language: targetLanguage,
        });
        actionToasts.savedAllWords(savedCount);
      }
      
      console.log(`Saved ${savedCount} vocabulary items for user:`, user.id);
    } catch (error) {
      console.error('Error saving all vocabulary items:', error);
    }
  }

  async function handleMarkArticleAsRead() {
    if (!article || !user) return;

    try {
      // Save article and mark as read in Supabase
      await supabaseData.saveArticleData(article);
      await supabaseData.markAsRead(article.id, article.title);
      
      setIsRead(true);
      actionToasts.articleRead(article.title);
      
      console.log('Article marked as read');
    } catch (error) {
      console.error('Error marking article as read:', error);
    }
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl" style={{ position: 'relative', zIndex: 1 }}>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{article.title}</CardTitle>
              <CardDescription className="text-base">
                {article.description}
              </CardDescription>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span>{article.source}</span>
                {article.author && <span>by {article.author}</span>}
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Source
              </Button>
            </a>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <AuthPrompt 
              feature="Translation" 
              description="Translate this article to your target language"
              icon={Volume2}
            >
              <Button
                onClick={handleTranslate}
                disabled={isTranslating}
                size="sm"
                variant={translation ? "outline" : "default"}
              >
                {isTranslating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : translation ? (
                  <Volume2 className="h-4 w-4 mr-2" />
                ) : (
                  <Volume2 className="h-4 w-4 mr-2" />
                )}
                {translation ? 'Translation Ready' : 'Translate Article'}
              </Button>
            </AuthPrompt>

            <AuthPrompt 
              feature="Vocabulary Extraction" 
              description="Extract important vocabulary words from this article"
              icon={BookMarked}
            >
              <Button
                onClick={handleExtractVocabulary}
                disabled={isExtractingVocab}
                variant="outline"
                size="sm"
              >
                {isExtractingVocab ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BookMarked className="h-4 w-4 mr-2" />
                )}
                Extract Vocabulary
              </Button>
            </AuthPrompt>

            <AuthPrompt 
              feature="Progress Tracking" 
              description="Mark this article as read and track your progress"
              icon={BookMarked}
            >
              <Button
                onClick={handleMarkArticleAsRead}
                variant="outline"
                size="sm"
                disabled={isRead}
              >
                {isRead ? '✓ Read' : 'Mark as Read'}
              </Button>
            </AuthPrompt>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original (English)</TabsTrigger>
              <TabsTrigger value="translation">
                Translation ({SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="original" className="mt-4">
              <ArticleReader text={article.content} language="en-US" />
            </TabsContent>

            <TabsContent value="translation" className="mt-4">
              {translation ? (
                <ArticleReader
                  text={translation}
                  language={SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]?.code}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Click "Translate Article" to see the translation
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {vocabulary.length > 0 && (
        <AuthPrompt 
          feature="Vocabulary Management" 
          description="Save vocabulary words to your flashcards"
          icon={BookMarked}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vocabulary ({vocabulary.length} words)</CardTitle>
                <Button onClick={handleSaveAllVocabulary} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Save All to Flashcards
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <VocabularyList
                vocabulary={vocabulary}
                onSaveWord={handleSaveVocabulary}
                targetLanguage={targetLanguage}
              />
            </CardContent>
          </Card>
        </AuthPrompt>
      )}

      {/* AI Chat Component */}
      <AuthPrompt 
        feature="AI Chat" 
        description="Ask questions about this article with AI assistance"
        icon={MessageSquare}
      >
        <AIChat 
          articleContent={article.content} 
          articleTitle={article.title} 
        />
      </AuthPrompt>
    </div>
  );
}

