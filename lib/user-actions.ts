import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

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
  timestamp: Timestamp | Date;
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
    // For idempotent actions (like 'read_article'), use a unique document ID
    const isIdempotent = ['read_article', 'saved_word', 'saved_flashcard_set'].includes(actionType);
    
    if (isIdempotent && targetId) {
      // Create a unique document ID based on user, action, and target
      const uniqueDocId = `${userId}_${actionType}_${targetId}`;
      const actionRef = doc(db, 'user_actions', uniqueDocId);
      
      // Check if action already exists
      const existingDoc = await getDoc(actionRef);
      
      if (existingDoc.exists()) {
        // Update timestamp and metadata for existing action
        await updateDoc(actionRef, {
          timestamp: serverTimestamp(),
          metadata: metadata || {},
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create new action
        await setDoc(actionRef, {
          userId,
          actionType,
          targetType,
          targetId,
          metadata: metadata || {},
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }
    } else {
      // For non-idempotent actions, always create a new document
      await addDoc(collection(db, 'user_actions'), {
        userId,
        actionType,
        targetType,
        targetId: targetId || null,
        metadata: metadata || {},
        timestamp: serverTimestamp()
      });
    }

    // Update user's last activity timestamp
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastActivityDate: serverTimestamp()
    });

    console.log(`✅ Tracked action: ${actionType} for user ${userId}`);
    return true;
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
    // Build query with filters
    let q = query(
      collection(db, 'user_actions'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    // Apply action type filter if provided
    if (actionFilter) {
      const actions = Array.isArray(actionFilter) ? actionFilter : [actionFilter];
      q = query(
        collection(db, 'user_actions'),
        where('userId', '==', userId),
        where('actionType', 'in', actions),
        orderBy('timestamp', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    
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
      totalActions: querySnapshot.size
    };

    // Process each action
    querySnapshot.forEach((doc) => {
      const action = doc.data() as UserAction;
      
      // Update last activity
      if (action.timestamp) {
        const actionDate = action.timestamp instanceof Timestamp 
          ? action.timestamp.toDate() 
          : new Date(action.timestamp);
        
        if (!history.lastActivity || actionDate > history.lastActivity) {
          history.lastActivity = actionDate;
        }
      }

      // Categorize actions
      switch (action.actionType) {
        case 'read_article':
          if (action.targetId && !history.readArticles.includes(action.targetId)) {
            history.readArticles.push(action.targetId);
          }
          break;
        
        case 'completed_flashcard':
          if (action.targetId && !history.completedFlashcards.includes(action.targetId)) {
            history.completedFlashcards.push(action.targetId);
          }
          break;
        
        case 'saved_word':
          if (action.targetId && !history.savedWords.includes(action.targetId)) {
            history.savedWords.push(action.targetId);
          }
          break;
        
        case 'translated_article':
          if (action.targetId && !history.translations.includes(action.targetId)) {
            history.translations.push(action.targetId);
          }
          break;
        
        case 'extracted_vocabulary':
          if (action.targetId && !history.vocabularyExtractions.includes(action.targetId)) {
            history.vocabularyExtractions.push(action.targetId);
          }
          break;
        
        case 'used_ai_chat':
          if (action.targetId && !history.aiChatSessions.includes(action.targetId)) {
            history.aiChatSessions.push(action.targetId);
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
    const q = query(
      collection(db, 'user_actions'),
      where('userId', '==', userId),
      where('actionType', '==', actionType),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const actions: UserAction[] = [];

    querySnapshot.forEach((doc) => {
      actions.push({
        id: doc.id,
        ...doc.data()
      } as UserAction);
    });

    return actions;
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
    const uniqueDocId = `${userId}_${actionType}_${targetId}`;
    const actionRef = doc(db, 'user_actions', uniqueDocId);
    const actionDoc = await getDoc(actionRef);
    
    return actionDoc.exists();
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
    const q = query(
      collection(db, 'user_actions'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const stats: Record<string, number> = {};

    querySnapshot.forEach((doc) => {
      const action = doc.data() as UserAction;
      const actionType = action.actionType;
      
      if (!stats[actionType]) {
        stats[actionType] = 0;
      }
      stats[actionType]++;
    });

    return stats;
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
    const uniqueDocId = `${userId}_${actionType}_${targetId}`;
    const actionRef = doc(db, 'user_actions', uniqueDocId);
    
    await updateDoc(actionRef, {
      deleted: true,
      deletedAt: serverTimestamp()
    });

    console.log(`✅ Deleted action: ${actionType} for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting user action:', error);
    return false;
  }
}
