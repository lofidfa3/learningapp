import { supabase } from './supabaseClient';
import { VocabularyItem, NewsArticle } from './types';

// ============================================================================
// USER PROFILE OPERATIONS
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  created_at: Date;
  subscription_status: 'free' | 'premium';
  subscription_plan: 'basic' | 'premium' | 'pro';
  articles_per_day: number;
  target_language: string;
  daily_goal: number;
  notifications_enabled: boolean;
  articles_read: number;
  words_learned: number;
  streak_days: number;
  last_active_date: Date;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Check if Supabase client is properly configured
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Don't log PGRST116 (table doesn't exist) as error during development
      if (error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }
      return null;
    }
    
    if (!data) return null;
    
    return data as UserProfile;
  } catch (error: any) {
    // Only log if it's not a configuration error
    if (error?.message?.includes('Missing Supabase')) {
      console.warn('Supabase not configured. Please set environment variables.');
    } else {
      console.error('Error fetching user profile:', error);
    }
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

// ============================================================================
// VOCABULARY OPERATIONS
// ============================================================================

export interface SupabaseVocabularyItem {
  id: string;
  user_id: string;
  original_word: string;
  translated_word: string;
  original_sentence: string;
  translated_sentence: string;
  language: string;
  article_id: string;
  article_title: string;
  mastered: boolean;
  review_count: number;
  last_reviewed: string | null;
  next_review: string | null;
  created_at: string;
}

export async function saveVocabularyItem(
  userId: string,
  item: VocabularyItem
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('vocabulary_items')
      .upsert({
        user_id: userId,
        original_word: item.originalWord,
        translated_word: item.translatedWord,
        original_sentence: item.originalSentence,
        translated_sentence: item.translatedSentence,
        language: item.language,
        article_id: item.articleId,
        article_title: item.articleTitle,
        mastered: item.mastered,
        review_count: item.reviewCount,
        last_reviewed: item.lastReviewed?.toISOString(),
        next_review: item.nextReview?.toISOString(),
      }, {
        onConflict: 'user_id,original_word,language',
        ignoreDuplicates: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving vocabulary item:', error);
    return false;
  }
}

export async function getUserVocabulary(
  userId: string,
  language?: string
): Promise<VocabularyItem[]> {
  try {
    let query = supabase
      .from('vocabulary_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (language) {
      query = query.eq('language', language);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((item: SupabaseVocabularyItem) => ({
      id: item.id,
      originalWord: item.original_word,
      translatedWord: item.translated_word,
      originalSentence: item.original_sentence,
      translatedSentence: item.translated_sentence,
      language: item.language,
      articleId: item.article_id,
      articleTitle: item.article_title,
      mastered: item.mastered,
      reviewCount: item.review_count,
      lastReviewed: item.last_reviewed ? new Date(item.last_reviewed) : undefined,
      nextReview: item.next_review ? new Date(item.next_review) : undefined,
      createdAt: new Date(item.created_at),
    }));
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return [];
  }
}

export async function updateVocabularyItem(
  userId: string,
  itemId: string,
  updates: Partial<VocabularyItem>
): Promise<boolean> {
  try {
    const updateData: any = {};
    
    if (updates.mastered !== undefined) updateData.mastered = updates.mastered;
    if (updates.reviewCount !== undefined) updateData.review_count = updates.reviewCount;
    if (updates.lastReviewed) updateData.last_reviewed = updates.lastReviewed.toISOString();
    if (updates.nextReview) updateData.next_review = updates.nextReview.toISOString();

    const { error } = await supabase
      .from('vocabulary_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating vocabulary item:', error);
    return false;
  }
}

export async function deleteVocabularyItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('vocabulary_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting vocabulary item:', error);
    return false;
  }
}

// ============================================================================
// ARTICLE OPERATIONS
// ============================================================================

export async function saveArticle(
  userId: string,
  article: NewsArticle
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('articles')
      .upsert({
        id: article.id,
        user_id: userId,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image_url: article.imageUrl,
        published_at: article.publishedAt,
        source: article.source,
        author: article.author,
      }, {
        onConflict: 'user_id,id',
        ignoreDuplicates: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving article:', error);
    return false;
  }
}

export async function markArticleAsRead(
  userId: string,
  articleId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('articles')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', articleId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update user stats
    await supabase.rpc('increment_articles_read', { user_id: userId });

    return true;
  } catch (error) {
    console.error('Error marking article as read:', error);
    return false;
  }
}

export async function getUserArticles(userId: string): Promise<NewsArticle[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((article: any) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      source: article.source,
      author: article.author,
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// ============================================================================
// USER ACTIONS TRACKING
// ============================================================================

export type ActionType = 
  | 'read_article'
  | 'completed_flashcard'
  | 'saved_word'
  | 'viewed_progress'
  | 'changed_target_language'
  | 'started_article'
  | 'translated_article'
  | 'extracted_vocabulary'
  | 'used_ai_chat'
  | 'saved_flashcard_set'
  | 'completed_lesson'
  | 'updated_profile';

export type TargetType = 
  | 'article'
  | 'flashcard_set'
  | 'word'
  | 'setting'
  | 'profile'
  | 'vocabulary'
  | 'translation'
  | 'ai_chat';

export async function trackUserAction(
  userId: string,
  actionType: ActionType,
  targetType: TargetType,
  targetId?: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_actions')
      .upsert({
        user_id: userId,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId || null,
        metadata: metadata || {},
      }, {
        onConflict: 'user_id,action_type,target_id',
        ignoreDuplicates: false
      });

    if (error) throw error;

    // Update last active date
    await supabase
      .from('users')
      .update({ last_active_date: new Date().toISOString() })
      .eq('id', userId);

    return true;
  } catch (error) {
    console.error('Error tracking user action:', error);
    return false;
  }
}

export async function getUserActions(
  userId: string,
  actionType?: ActionType,
  limit: number = 50
): Promise<any[]> {
  try {
    let query = supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user actions:', error);
    return [];
  }
}

export async function getUserActionStats(userId: string): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('user_actions')
      .select('action_type')
      .eq('user_id', userId);

    if (error) throw error;

    const stats: Record<string, number> = {};
    (data || []).forEach((action: any) => {
      const actionType = action.action_type;
      stats[actionType] = (stats[actionType] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching user action stats:', error);
    return {};
  }
}

