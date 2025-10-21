import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './auth-context';

export async function updateUserStats(
  userId: string, 
  updates: {
    articlesRead?: number;
    wordsLearned?: number;
    streakDays?: number;
  }
) {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData: any = {
      'stats.lastActiveDate': serverTimestamp()
    };

    if (updates.articlesRead) {
      updateData['stats.articlesRead'] = increment(updates.articlesRead);
    }
    if (updates.wordsLearned) {
      updateData['stats.wordsLearned'] = increment(updates.wordsLearned);
    }
    if (updates.streakDays) {
      updateData['stats.streakDays'] = increment(updates.streakDays);
    }

    await updateDoc(userRef, updateData);
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
    const vocabRef = doc(db, 'users', userId, 'vocabulary', `${Date.now()}-${Math.random()}`);
    await updateDoc(vocabRef, {
      ...vocabularyItem,
      createdAt: serverTimestamp(),
      reviewed: false,
      reviewCount: 0,
      lastReviewed: null
    });
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
    const articleRef = doc(db, 'users', userId, 'articles', article.id);
    await updateDoc(articleRef, {
      ...article,
      savedAt: serverTimestamp(),
      readCount: increment(1)
    });
  } catch (error) {
    console.error('Error saving article:', error);
  }
}
