# User Actions Tracking System Documentation

## Overview

This system provides a comprehensive, server-side solution for tracking user actions across the LinguaNews application using Firebase Firestore. It ensures that all user activity is persistent across sessions and logins.

## Architecture

### Database Schema (Firestore)

**Collection: `user_actions`**

```typescript
{
  id: string;                    // Auto-generated document ID
  userId: string;                // Foreign key to users collection
  actionType: ActionType;        // Type of action performed
  targetType: TargetType;        // Type of target acted upon
  targetId?: string | null;      // ID of specific item (optional)
  metadata?: Record<string, any>; // Additional action data (optional)
  timestamp: Timestamp;          // When the action occurred
}
```

### Action Types

```typescript
type ActionType = 
  | 'read_article'              // User finished reading an article
  | 'completed_flashcard'       // User completed a flashcard set
  | 'saved_word'                // User saved a vocabulary word
  | 'viewed_progress'           // User viewed their progress
  | 'changed_target_language'   // User changed their target language
  | 'started_article'           // User started reading an article
  | 'translated_article'        // User translated an article
  | 'extracted_vocabulary'      // User extracted vocabulary from article
  | 'used_ai_chat'              // User used AI chat feature
  | 'saved_flashcard_set'       // User saved a flashcard set
  | 'completed_lesson'          // User completed a lesson
  | 'updated_profile';          // User updated their profile
```

### Target Types

```typescript
type TargetType = 
  | 'article'                   // News article
  | 'flashcard_set'             // Set of flashcards
  | 'word'                      // Vocabulary word
  | 'setting'                   // User setting
  | 'profile'                   // User profile
  | 'vocabulary'                // Vocabulary collection
  | 'translation'               // Translation
  | 'ai_chat';                  // AI chat session
```

## Core Functions

### 1. `trackUserAction()`

**Purpose:** Record a user action in the database.

**Signature:**
```typescript
async function trackUserAction(
  userId: string,
  actionType: ActionType,
  targetType: TargetType,
  targetId?: string | null,
  metadata?: Record<string, any>
): Promise<boolean>
```

**Features:**
- **Idempotent Actions:** For actions like 'read_article', 'saved_word', the function ensures only one record exists per (userId, actionType, targetId) combination.
- **Automatic Timestamps:** Uses Firestore serverTimestamp() for accurate timing.
- **Metadata Support:** Store any additional data as JSON.
- **Error Handling:** Returns boolean success status.

**Example:**
```typescript
await trackUserAction(
  'user123',
  'read_article',
  'article',
  'article456',
  {
    time_spent_seconds: 120,
    language: 'Spanish',
    completed: true
  }
);
```

### 2. `getUserHistory()`

**Purpose:** Retrieve and structure a user's complete action history.

**Signature:**
```typescript
async function getUserHistory(
  userId: string,
  actionFilter?: ActionType | ActionType[],
  targetFilter?: TargetType | TargetType[]
): Promise<UserHistory>
```

**Returns:**
```typescript
interface UserHistory {
  readArticles: string[];           // IDs of read articles
  completedFlashcards: string[];    // IDs of completed flashcards
  savedWords: string[];             // IDs of saved words
  translations: string[];           // IDs of translated articles
  vocabularyExtractions: string[];  // IDs of vocabulary extractions
  aiChatSessions: string[];         // IDs of AI chat sessions
  settings: Record<string, any>;    // User settings
  lastActivity: Date | null;        // Last activity timestamp
  totalActions: number;             // Total action count
}
```

**Example:**
```typescript
const history = await getUserHistory('user123');
console.log(`User has read ${history.readArticles.length} articles`);
```

### 3. `getSpecificUserActions()`

**Purpose:** Retrieve specific actions by type with pagination.

**Signature:**
```typescript
async function getSpecificUserActions(
  userId: string,
  actionType: ActionType,
  limitCount: number = 50
): Promise<UserAction[]>
```

### 4. `hasUserPerformedAction()`

**Purpose:** Quick check if a user has performed a specific action.

**Signature:**
```typescript
async function hasUserPerformedAction(
  userId: string,
  actionType: ActionType,
  targetId: string
): Promise<boolean>
```

### 5. `getUserActionStatistics()`

**Purpose:** Get aggregated statistics of user actions.

**Signature:**
```typescript
async function getUserActionStatistics(
  userId: string
): Promise<Record<string, number>>
```

**Returns:**
```typescript
{
  'read_article': 45,
  'translated_article': 30,
  'saved_word': 120,
  'completed_flashcard': 15,
  // ... etc
}
```

## React Hook: `useUserActions()`

A custom React hook that provides easy access to the user actions system.

### Usage

```typescript
import { useUserActions } from '@/lib/use-user-actions';

function MyComponent() {
  const {
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
    refresh,
    refreshStatistics
  } = useUserActions();

  // Track an action
  const handleArticleRead = async (articleId: string) => {
    await track('read_article', 'article', articleId, {
      time_spent_seconds: 180
    });
  };

  // Check if article was read
  const isRead = hasReadArticle('article123');

  // Get action count
  const articlesRead = getActionCount('read_article');

  return (
    <div>
      <p>Articles Read: {articlesRead}</p>
      <p>Total Actions: {getTotalActions()}</p>
    </div>
  );
}
```

## Firestore Security Rules

The system includes comprehensive security rules to ensure:
- Users can only read/write their own actions
- Proper authentication is required
- Data validation on creation

## Firestore Indexes

Optimized indexes for fast queries on:
- `userId` + `timestamp`
- `userId` + `actionType` + `timestamp`
- `userId` + `targetType` + `timestamp`
- `userId` + `actionType` + `targetType` + `timestamp`

## Integration Examples

### Example 1: Track Article Read

```typescript
import { useUserActions } from '@/lib/use-user-actions';

function ArticlePage({ articleId }: { articleId: string }) {
  const { track, hasReadArticle } = useUserActions();
  const [startTime] = useState(Date.now());

  const handleMarkAsRead = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    await track('read_article', 'article', articleId, {
      time_spent_seconds: timeSpent,
      completed: true,
      date: new Date().toISOString()
    });
  };

  const isRead = hasReadArticle(articleId);

  return (
    <div>
      {isRead && <Badge>✓ Read</Badge>}
      <Button onClick={handleMarkAsRead}>Mark as Read</Button>
    </div>
  );
}
```

### Example 2: Track Translation

```typescript
const handleTranslate = async (articleId: string, targetLanguage: string) => {
  await track('translated_article', 'translation', articleId, {
    target_language: targetLanguage,
    word_count: articleText.split(' ').length,
    timestamp: new Date().toISOString()
  });
};
```

### Example 3: Track Vocabulary Extraction

```typescript
const handleExtractVocabulary = async (articleId: string, words: string[]) => {
  await track('extracted_vocabulary', 'vocabulary', articleId, {
    words_extracted: words.length,
    target_language: targetLanguage,
    timestamp: new Date().toISOString()
  });
};
```

### Example 4: Load User History on Login

```typescript
function Dashboard() {
  const { history, loading } = useUserActions();

  if (loading) return <Loader />;

  return (
    <div>
      <h2>Your Activity</h2>
      <p>Articles Read: {history?.readArticles.length}</p>
      <p>Words Saved: {history?.savedWords.length}</p>
      <p>Flashcards Completed: {history?.completedFlashcards.length}</p>
      <p>Last Active: {history?.lastActivity?.toLocaleDateString()}</p>
    </div>
  );
}
```

### Example 5: Display Statistics

```typescript
function UserStats() {
  const { statistics, getActionCount } = useUserActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Learning Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <StatItem 
            label="Articles Read" 
            value={getActionCount('read_article')} 
          />
          <StatItem 
            label="Translations" 
            value={getActionCount('translated_article')} 
          />
          <StatItem 
            label="Vocabulary Extracted" 
            value={getActionCount('extracted_vocabulary')} 
          />
          <StatItem 
            label="Flashcards Completed" 
            value={getActionCount('completed_flashcard')} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

## Deployment

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### 3. Verify Deployment

```bash
firebase firestore:indexes
```

## Best Practices

1. **Always track user actions** when they perform meaningful activities
2. **Use idempotent actions** for state-based tracking (read, saved, etc.)
3. **Include relevant metadata** for analytics and debugging
4. **Load user history on login** to restore application state
5. **Use the React hook** for easy integration in components
6. **Check action status** before showing UI elements (badges, etc.)
7. **Refresh history** after tracking new actions for immediate UI updates

## Performance Considerations

- **Indexes:** All queries are optimized with composite indexes
- **Pagination:** Use `limit` parameter in queries to control data size
- **Caching:** User history is cached in React state
- **Batch Operations:** Consider batching multiple actions if needed
- **Offline Support:** Firestore automatically handles offline scenarios

## Error Handling

All functions include comprehensive error handling:
- Return `false` on failure for tracking functions
- Return empty arrays/objects on failure for query functions
- Log errors to console for debugging
- Never throw exceptions to prevent app crashes

## Future Enhancements

- **Analytics Dashboard:** Aggregate statistics across all users
- **Action Replay:** Reconstruct user journey from actions
- **Recommendations:** Use action history for personalized content
- **Achievements:** Award badges based on action milestones
- **Export Data:** Allow users to export their action history
- **Action Undo:** Implement soft deletes for reversible actions

## Support

For questions or issues with the user actions system:
1. Check the integration examples
2. Review the Firestore console for data
3. Check browser console for error logs
4. Verify Firestore rules and indexes are deployed
