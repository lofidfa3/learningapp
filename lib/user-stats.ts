import { updateUserProfile } from './supabase-services';
import type { VocabularyItem, NewsArticle } from './types';

export async function updateUserStats(
  userId: string, 
  updates: {
    articlesRead?: number;
    wordsLearned?: number;
    streakDays?: number;
  }
) {
  try {
    // Get current profile first to increment correctly
    const updateData: any = {};
    
    if (updates.articlesRead !== undefined) {
      // Increment articles read
      updateData.articles_read = updates.articlesRead;
    }
    if (updates.wordsLearned !== undefined) {
      // Increment words learned
      updateData.words_learned = updates.wordsLearned;
    }
    if (updates.streakDays !== undefined) {
      updateData.streak_days = updates.streakDays;
    }

    // Always update last active date
    updateData.last_active_date = new Date().toISOString();

    await updateUserProfile(userId, updateData);
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

export async function saveUserVocabulary(
  userId: string,
  vocabularyItem: {
    originalWord: string;
    translatedWord: string;
    originalSentence: string;
    translatedSentence: string;
    language: string;
  }
) {
  try {
    // Use the Supabase vocabulary service
    const { saveVocabularyItem } = await import('./supabase-services');
    
    const item: VocabularyItem = {
      id: `${Date.now()}-${Math.random()}`,
      ...vocabularyItem,
      articleId: '',
      articleTitle: '',
      mastered: false,
      reviewCount: 0,
      createdAt: new Date(),
    };
    
    await saveVocabularyItem(userId, item);
  } catch (error) {
    console.error('Error saving vocabulary:', error);
  }
}

export async function saveUserArticle(
  userId: string,
  article: {
    id: string;
    title: string;
    content: string;
    source: string;
    publishedAt: string;
    language: string;
    translatedContent?: string;
  }
) {
  try {
    // Use the Supabase article service
    const { saveArticle } = await import('./supabase-services');
    
    const newsArticle: NewsArticle = {
      id: article.id,
      title: article.title,
      description: '',
      content: article.content,
      url: '',
      publishedAt: article.publishedAt,
      source: article.source,
    };
    
    await saveArticle(userId, newsArticle);
  } catch (error) {
    console.error('Error saving article:', error);
  }
}
