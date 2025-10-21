/**
 * USER ACTIONS INTEGRATION EXAMPLES
 * 
 * This file demonstrates how to integrate the user actions tracking system
 * throughout your application.
 */

import { trackUserAction } from './user-actions';
import { useUserActions } from './use-user-actions';

// ============================================================================
// EXAMPLE 1: Track Article Read
// ============================================================================

export async function handleArticleRead(userId: string, articleId: string, timeSpent: number) {
  await trackUserAction(
    userId,
    'read_article',
    'article',
    articleId,
    {
      time_spent_seconds: timeSpent,
      completed: true,
      date: new Date().toISOString()
    }
  );
}

// ============================================================================
// EXAMPLE 2: Track Translation
// ============================================================================

export async function handleTranslation(
  userId: string,
  articleId: string,
  targetLanguage: string,
  wordCount: number
) {
  await trackUserAction(
    userId,
    'translated_article',
    'translation',
    articleId,
    {
      target_language: targetLanguage,
      word_count: wordCount,
      timestamp: new Date().toISOString()
    }
  );
}

// ============================================================================
// EXAMPLE 3: Track Vocabulary Extraction
// ============================================================================

export async function handleVocabularyExtraction(
  userId: string,
  articleId: string,
  wordsExtracted: number,
  targetLanguage: string
) {
  await trackUserAction(
    userId,
    'extracted_vocabulary',
    'vocabulary',
    articleId,
    {
      words_extracted: wordsExtracted,
      target_language: targetLanguage,
      timestamp: new Date().toISOString()
    }
  );
}

// ============================================================================
// EXAMPLE 4: Track Flashcard Completion
// ============================================================================

export async function handleFlashcardCompletion(
  userId: string,
  flashcardSetId: string,
  score: number,
  totalCards: number
) {
  await trackUserAction(
    userId,
    'completed_flashcard',
    'flashcard_set',
    flashcardSetId,
    {
      score,
      out_of: totalCards,
      accuracy: (score / totalCards) * 100,
      timestamp: new Date().toISOString()
    }
  );
}

// ============================================================================
// EXAMPLE 5: Track Word Save
// ============================================================================

export async function handleWordSave(
  userId: string,
  wordId: string,
  word: string,
  translation: string,
  language: string
) {
  await trackUserAction(
    userId,
    'saved_word',
    'word',
    wordId,
    {
      word,
      translation,
      language,
      timestamp: new Date().toISOString()
    }
  );
}

// ============================================================================
// EXAMPLE 6: Track AI Chat Usage
// ============================================================================

export async function handleAIChatUsage(
  userId: string,
  articleId: string,
  questionCount: number,
  sessionDuration: number
) {
  await trackUserAction(
    userId,
    'used_ai_chat',
    'ai_chat',
    articleId,
    {
      question_count: questionCount,
      session_duration_seconds: sessionDuration,
      timestamp: new Date().toISOString()
    }
  );
}

// ============================================================================
// EXAMPLE 7: Track Language Change
// ============================================================================

export async function handleLanguageChange(
  userId: string,
  newLanguage: string,
  previousLanguage: string
) {
  await trackUserAction(
    userId,
    'changed_target_language',
    'setting',
    null,
    {
      new_language: newLanguage,
      previous_language: previousLanguage,
      timestamp: new Date().toISOString()
    }
  );
}

// ============================================================================
// EXAMPLE 8: Using the React Hook in a Component
// ============================================================================

/*
function ArticleComponent({ articleId }: { articleId: string }) {
  const { track, hasReadArticle, history } = useUserActions();
  const [timeSpent, setTimeSpent] = useState(0);

  // Check if article has been read
  const isRead = hasReadArticle(articleId);

  // Track article read
  const handleMarkAsRead = async () => {
    await track(
      'read_article',
      'article',
      articleId,
      {
        time_spent_seconds: timeSpent,
        completed: true
      }
    );
  };

  // Track translation
  const handleTranslate = async (targetLanguage: string) => {
    await track(
      'translated_article',
      'translation',
      articleId,
      {
        target_language: targetLanguage
      }
    );
  };

  return (
    <div>
      {isRead && <Badge>Read</Badge>}
      <Button onClick={handleMarkAsRead}>Mark as Read</Button>
      <Button onClick={() => handleTranslate('spanish')}>Translate</Button>
      <p>Total actions: {history?.totalActions}</p>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 9: Loading User History on Login
// ============================================================================

/*
function useUserHistoryOnLogin() {
  const { user } = useAuth();
  const { history, loading, refresh } = useUserActions();

  useEffect(() => {
    if (user) {
      // History is automatically loaded by the hook
      console.log('User history loaded:', history);
    }
  }, [user, history]);

  return { history, loading, refresh };
}
*/

// ============================================================================
// EXAMPLE 10: Checking Action Statistics
// ============================================================================

/*
function UserStatisticsComponent() {
  const { statistics, getActionCount } = useUserActions();

  return (
    <div>
      <h3>Your Activity</h3>
      <p>Articles Read: {getActionCount('read_article')}</p>
      <p>Translations: {getActionCount('translated_article')}</p>
      <p>Vocabulary Extracted: {getActionCount('extracted_vocabulary')}</p>
      <p>Flashcards Completed: {getActionCount('completed_flashcard')}</p>
      <p>Words Saved: {getActionCount('saved_word')}</p>
      <p>AI Chat Sessions: {getActionCount('used_ai_chat')}</p>
    </div>
  );
}
*/
