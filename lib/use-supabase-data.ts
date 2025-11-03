'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getUserVocabulary,
  saveVocabularyItem,
  updateVocabularyItem,
  deleteVocabularyItem,
  getUserArticles,
  saveArticle,
  markArticleAsRead,
  trackUserAction,
  ActionType,
  TargetType,
} from './supabase-services';
import { VocabularyItem, NewsArticle } from './types';
import { actionToasts } from './toast-utils';

export function useSupabaseData(userId: string | null) {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user data
  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [vocabData, articlesData] = await Promise.all([
        getUserVocabulary(userId),
        getUserArticles(userId),
      ]);

      setVocabulary(vocabData);
      setArticles(articlesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save vocabulary item
  const saveVocab = useCallback(
    async (item: VocabularyItem) => {
      if (!userId) return false;

      try {
        const success = await saveVocabularyItem(userId, item);
        if (success) {
          actionToasts.savedWord(item.originalWord);
          await trackUserAction(userId, 'saved_word', 'vocabulary', item.id, {
            word: item.originalWord,
            language: item.language,
          });
          await loadData();
        }
        return success;
      } catch (error) {
        console.error('Error saving vocabulary:', error);
        return false;
      }
    },
    [userId, loadData]
  );

  // Update vocabulary item
  const updateVocab = useCallback(
    async (itemId: string, updates: Partial<VocabularyItem>) => {
      if (!userId) return false;

      try {
        const success = await updateVocabularyItem(userId, itemId, updates);
        if (success) {
          await loadData();
        }
        return success;
      } catch (error) {
        console.error('Error updating vocabulary:', error);
        return false;
      }
    },
    [userId, loadData]
  );

  // Delete vocabulary item
  const deleteVocab = useCallback(
    async (itemId: string, word: string) => {
      if (!userId) return false;

      try {
        const success = await deleteVocabularyItem(userId, itemId);
        if (success) {
          actionToasts.deletedWord(word);
          await loadData();
        }
        return success;
      } catch (error) {
        console.error('Error deleting vocabulary:', error);
        return false;
      }
    },
    [userId, loadData]
  );

  // Save article
  const saveArticleData = useCallback(
    async (article: NewsArticle) => {
      if (!userId) return false;

      try {
        const success = await saveArticle(userId, article);
        if (success) {
          await loadData();
        }
        return success;
      } catch (error) {
        console.error('Error saving article:', error);
        return false;
      }
    },
    [userId, loadData]
  );

  // Mark article as read
  const markAsRead = useCallback(
    async (articleId: string, articleTitle: string) => {
      if (!userId) return false;

      try {
        const success = await markArticleAsRead(userId, articleId);
        if (success) {
          actionToasts.articleRead(articleTitle);
          await trackUserAction(userId, 'read_article', 'article', articleId, {
            title: articleTitle,
          });
          await loadData();
        }
        return success;
      } catch (error) {
        console.error('Error marking article as read:', error);
        return false;
      }
    },
    [userId, loadData]
  );

  // Track action
  const track = useCallback(
    async (
      actionType: ActionType,
      targetType: TargetType,
      targetId?: string,
      metadata?: Record<string, any>
    ) => {
      if (!userId) return false;

      try {
        return await trackUserAction(userId, actionType, targetType, targetId, metadata);
      } catch (error) {
        console.error('Error tracking action:', error);
        return false;
      }
    },
    [userId]
  );

  return {
    vocabulary,
    articles,
    loading,
    saveVocab,
    updateVocab,
    deleteVocab,
    saveArticleData,
    markAsRead,
    track,
    refresh: loadData,
  };
}

