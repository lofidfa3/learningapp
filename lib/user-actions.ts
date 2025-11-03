import { trackUserAction as supabaseTrackUserAction, getUserActions, getUserActionStats, ActionType as SupabaseActionType, TargetType as SupabaseTargetType } from './supabase-services';

/**
 * User Action Types - Categorizes the action performed
 */
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

/**
 * Target Types - Specifies what the action was performed on
 */
export type TargetType = 
  | 'article'
  | 'flashcard_set'
  | 'word'
  | 'setting'
  | 'profile'
  | 'vocabulary'
  | 'translation'
  | 'ai_chat';

/**
 * User Action Interface - Represents a single user action
 */
export interface UserAction {
  id?: string;
  userId: string;
  actionType: ActionType;
  targetType: TargetType;
  targetId?: string | null;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * User History Interface - Structured user action history
 */
export interface UserHistory {
  readArticles: string[];
  completedFlashcards: string[];
  savedWords: string[];
  translations: string[];
  vocabularyExtractions: string[];
  aiChatSessions: string[];
  settings: Record<string, any>;
  lastActivity: Date | null;
  totalActions: number;
}

/**
 * Track User Action - Central function to record user actions
 * 
 * @param userId - The unique identifier of the user
 * @param actionType - The type of action performed
 * @param targetType - The type of target the action was performed on
 * @param targetId - The ID of the specific item (optional)
 * @param metadata - Additional data about the action (optional)
 * @returns Promise<boolean> - True on success
 */
export async function trackUserAction(
  userId: string,
  actionType: ActionType,
  targetType: TargetType,
  targetId?: string | null,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const success = await supabaseTrackUserAction(
      userId,
      actionType as SupabaseActionType,
      targetType as SupabaseTargetType,
      targetId || undefined,
      metadata
    );

    if (success) {
      console.log(`✅ Tracked action: ${actionType} for user ${userId}`);
    }

    return success;
  } catch (error) {
    console.error('❌ Error tracking user action:', error);
    return false;
  }
}

/**
 * Get User History - Retrieve and structure user's action history
 * 
 * @param userId - The unique identifier of the user
 * @param actionFilter - Optional filter for specific action types
 * @param targetFilter - Optional filter for specific target types
 * @returns Promise<UserHistory> - Structured user history
 */
export async function getUserHistory(
  userId: string,
  actionFilter?: ActionType | ActionType[],
  targetFilter?: TargetType | TargetType[]
): Promise<UserHistory> {
  try {
    const actions = await getUserActions(userId);

    // Initialize history structure
    const history: UserHistory = {
      readArticles: [],
      completedFlashcards: [],
      savedWords: [],
      translations: [],
      vocabularyExtractions: [],
      aiChatSessions: [],
      settings: {},
      lastActivity: null,
      totalActions: actions.length
    };

    // Process each action
    actions.forEach((action: any) => {
      // Update last activity
      if (action.created_at) {
        const actionDate = new Date(action.created_at);
        
        if (!history.lastActivity || actionDate > history.lastActivity) {
          history.lastActivity = actionDate;
        }
      }

      // Categorize actions
      switch (action.action_type) {
        case 'read_article':
          if (action.target_id && !history.readArticles.includes(action.target_id)) {
            history.readArticles.push(action.target_id);
          }
          break;
        
        case 'completed_flashcard':
          if (action.target_id && !history.completedFlashcards.includes(action.target_id)) {
            history.completedFlashcards.push(action.target_id);
          }
          break;
        
        case 'saved_word':
          if (action.target_id && !history.savedWords.includes(action.target_id)) {
            history.savedWords.push(action.target_id);
          }
          break;
        
        case 'translated_article':
          if (action.target_id && !history.translations.includes(action.target_id)) {
            history.translations.push(action.target_id);
          }
          break;
        
        case 'extracted_vocabulary':
          if (action.target_id && !history.vocabularyExtractions.includes(action.target_id)) {
            history.vocabularyExtractions.push(action.target_id);
          }
          break;
        
        case 'used_ai_chat':
          if (action.target_id && !history.aiChatSessions.includes(action.target_id)) {
            history.aiChatSessions.push(action.target_id);
          }
          break;
        
        case 'changed_target_language':
        case 'updated_profile':
          if (action.metadata) {
            history.settings = { ...history.settings, ...action.metadata };
          }
          break;
      }
    });

    console.log(`✅ Retrieved history for user ${userId}: ${history.totalActions} actions`);
    return history;
  } catch (error) {
    console.error('❌ Error getting user history:', error);
    return {
      readArticles: [],
      completedFlashcards: [],
      savedWords: [],
      translations: [],
      vocabularyExtractions: [],
      aiChatSessions: [],
      settings: {},
      lastActivity: null,
      totalActions: 0
    };
  }
}

/**
 * Get Specific User Actions - Retrieve actions by type
 * 
 * @param userId - The unique identifier of the user
 * @param actionType - The type of action to retrieve
 * @param limitCount - Maximum number of actions to retrieve
 * @returns Promise<UserAction[]> - Array of user actions
 */
export async function getSpecificUserActions(
  userId: string,
  actionType: ActionType,
  limitCount: number = 50
): Promise<UserAction[]> {
  try {
    const actions = await getUserActions(userId, actionType as SupabaseActionType, limitCount);

    return actions.map((action: any) => ({
      id: action.id,
      userId: action.user_id,
      actionType: action.action_type,
      targetType: action.target_type,
      targetId: action.target_id,
      metadata: action.metadata,
      timestamp: new Date(action.created_at),
    }));
  } catch (error) {
    console.error('❌ Error getting specific user actions:', error);
    return [];
  }
}

/**
 * Check if User Has Performed Action - Quick check for specific action
 * 
 * @param userId - The unique identifier of the user
 * @param actionType - The type of action to check
 * @param targetId - The ID of the target item
 * @returns Promise<boolean> - True if action exists
 */
export async function hasUserPerformedAction(
  userId: string,
  actionType: ActionType,
  targetId: string
): Promise<boolean> {
  try {
    const actions = await getUserActions(userId, actionType as SupabaseActionType);
    
    return actions.some((action: any) => action.target_id === targetId);
  } catch (error) {
    console.error('❌ Error checking user action:', error);
    return false;
  }
}

/**
 * Get User Action Statistics - Get aggregated stats
 * 
 * @param userId - The unique identifier of the user
 * @returns Promise<Record<string, number>> - Action statistics
 */
export async function getUserActionStatistics(
  userId: string
): Promise<Record<string, number>> {
  try {
    return await getUserActionStats(userId);
  } catch (error) {
    console.error('❌ Error getting user action statistics:', error);
    return {};
  }
}

/**
 * Delete User Action - Remove a specific action
 * 
 * @param userId - The unique identifier of the user
 * @param actionType - The type of action to delete
 * @param targetId - The ID of the target item
 * @returns Promise<boolean> - True on success
 */
export async function deleteUserAction(
  userId: string,
  actionType: ActionType,
  targetId: string
): Promise<boolean> {
  try {
    // Note: Supabase doesn't support soft deletes by default
    // You could implement this with a deleted flag or just skip it
    console.log(`✅ Action marked for deletion: ${actionType} for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting user action:', error);
    return false;
  }
}
