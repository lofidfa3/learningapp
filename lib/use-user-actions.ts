import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import {
  trackUserAction,
  getUserHistory,
  getSpecificUserActions,
  hasUserPerformedAction,
  getUserActionStatistics,
  ActionType,
  TargetType,
  UserHistory,
  UserAction
} from './user-actions';

/**
 * Custom React Hook for User Actions
 * Provides easy access to user action tracking and history
 */
export function useUserActions() {
  const { user } = useAuth();
  const [history, setHistory] = useState<UserHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<Record<string, number>>({});

  /**
   * Load user history on mount and when user changes
   */
  useEffect(() => {
    if (user) {
      loadUserHistory();
      loadUserStatistics();
    } else {
      setHistory(null);
      setStatistics({});
    }
  }, [user]);

  /**
   * Load user's complete action history
   */
  const loadUserHistory = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userHistory = await getUserHistory(user.uid);
      setHistory(userHistory);
    } catch (error) {
      console.error('Error loading user history:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Load user's action statistics
   */
  const loadUserStatistics = useCallback(async () => {
    if (!user) return;
    
    try {
      const stats = await getUserActionStatistics(user.uid);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading user statistics:', error);
    }
  }, [user]);

  /**
   * Track a new user action
   */
  const track = useCallback(async (
    actionType: ActionType,
    targetType: TargetType,
    targetId?: string | null,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    if (!user) {
      console.warn('Cannot track action: User not authenticated');
      return false;
    }

    const success = await trackUserAction(
      user.uid,
      actionType,
      targetType,
      targetId,
      metadata
    );

    if (success) {
      // Refresh history after tracking
      await loadUserHistory();
      await loadUserStatistics();
    }

    return success;
  }, [user, loadUserHistory, loadUserStatistics]);

  /**
   * Check if user has performed a specific action
   */
  const hasPerformed = useCallback(async (
    actionType: ActionType,
    targetId: string
  ): Promise<boolean> => {
    if (!user) return false;
    return await hasUserPerformedAction(user.uid, actionType, targetId);
  }, [user]);

  /**
   * Get specific actions by type
   */
  const getActions = useCallback(async (
    actionType: ActionType,
    limit: number = 50
  ): Promise<UserAction[]> => {
    if (!user) return [];
    return await getSpecificUserActions(user.uid, actionType, limit);
  }, [user]);

  /**
   * Check if article has been read
   */
  const hasReadArticle = useCallback((articleId: string): boolean => {
    return history?.readArticles.includes(articleId) || false;
  }, [history]);

  /**
   * Check if flashcard has been completed
   */
  const hasCompletedFlashcard = useCallback((flashcardId: string): boolean => {
    return history?.completedFlashcards.includes(flashcardId) || false;
  }, [history]);

  /**
   * Check if word has been saved
   */
  const hasSavedWord = useCallback((wordId: string): boolean => {
    return history?.savedWords.includes(wordId) || false;
  }, [history]);

  /**
   * Get total action count
   */
  const getTotalActions = useCallback((): number => {
    return history?.totalActions || 0;
  }, [history]);

  /**
   * Get action count by type
   */
  const getActionCount = useCallback((actionType: ActionType): number => {
    return statistics[actionType] || 0;
  }, [statistics]);

  return {
    // State
    history,
    loading,
    statistics,
    
    // Actions
    track,
    hasPerformed,
    getActions,
    
    // Convenience methods
    hasReadArticle,
    hasCompletedFlashcard,
    hasSavedWord,
    getTotalActions,
    getActionCount,
    
    // Refresh methods
    refresh: loadUserHistory,
    refreshStatistics: loadUserStatistics
  };
}
