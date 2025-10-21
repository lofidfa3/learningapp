import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { VocabularyItem, LanguageProgress, NewsArticle } from './types';

// User-specific data storage using Firestore
export class UserDataManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Vocabulary Management
  async saveVocabularyItem(item: VocabularyItem): Promise<void> {
    try {
      console.log('UserDataManager: Saving vocabulary item for user:', this.userId, item);
      
      const vocabRef = doc(db, 'users', this.userId, 'vocabulary', item.id);
      
      // Create a clean data object without the original createdAt
      const { createdAt, lastReviewed, nextReview, ...itemData } = item;
      
      const dataToSave = {
        ...itemData,
        userId: this.userId, // Ensure userId is included for Firestore rules
        createdAt: serverTimestamp(),
        lastReviewed: lastReviewed ? serverTimestamp() : null,
        nextReview: nextReview ? serverTimestamp() : null,
      };
      
      console.log('UserDataManager: Data to save:', dataToSave);
      await setDoc(vocabRef, dataToSave);
      
      console.log('UserDataManager: Vocabulary item saved successfully');
    } catch (error) {
      console.error('UserDataManager: Error saving vocabulary item:', error);
      throw error;
    }
  }

  async getVocabulary(language?: string): Promise<VocabularyItem[]> {
    try {
      console.log('UserDataManager: Getting vocabulary for user:', this.userId, 'language:', language);
      
      const vocabRef = collection(db, 'users', this.userId, 'vocabulary');
      let q = query(vocabRef, orderBy('createdAt', 'desc'));
      
      if (language) {
        q = query(vocabRef, where('language', '==', language), orderBy('createdAt', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      const vocabulary: VocabularyItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vocabulary.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastReviewed: data.lastReviewed?.toDate() || undefined,
          nextReview: data.nextReview?.toDate() || undefined,
        } as VocabularyItem);
      });

      console.log('UserDataManager: Retrieved vocabulary items:', vocabulary.length);
      return vocabulary;
    } catch (error) {
      console.error('UserDataManager: Error getting vocabulary:', error);
      return [];
    }
  }

  async updateVocabularyItem(itemId: string, updates: Partial<VocabularyItem>): Promise<void> {
    try {
      const vocabRef = doc(db, 'users', this.userId, 'vocabulary', itemId);
      const updateData: any = { ...updates };
      
      if (updates.lastReviewed) {
        updateData.lastReviewed = serverTimestamp();
      }
      if (updates.nextReview) {
        updateData.nextReview = serverTimestamp();
      }

      await updateDoc(vocabRef, updateData);
    } catch (error) {
      console.error('Error updating vocabulary item:', error);
      throw error;
    }
  }

  async deleteVocabularyItem(itemId: string): Promise<void> {
    try {
      const vocabRef = doc(db, 'users', this.userId, 'vocabulary', itemId);
      await updateDoc(vocabRef, { deleted: true, deletedAt: serverTimestamp() });
    } catch (error) {
      console.error('Error deleting vocabulary item:', error);
      throw error;
    }
  }

  // Progress Management
  async saveProgress(progress: Record<string, LanguageProgress>): Promise<void> {
    try {
      const progressRef = doc(db, 'users', this.userId, 'data', 'progress');
      await setDoc(progressRef, {
        ...progress,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  async getProgress(): Promise<Record<string, LanguageProgress>> {
    try {
      const progressRef = doc(db, 'users', this.userId, 'data', 'progress');
      const docSnap = await getDoc(progressRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const progress: Record<string, LanguageProgress> = {};
        
        Object.keys(data).forEach(key => {
          if (key !== 'lastUpdated' && typeof data[key] === 'object') {
            progress[key] = {
              ...data[key],
              lastActivity: data[key].lastActivity?.toDate() || new Date(),
            };
          }
        });
        
        return progress;
      }
      
      return {};
    } catch (error) {
      console.error('Error getting progress:', error);
      return {};
    }
  }

  async updateProgress(language: string, updates: Partial<LanguageProgress>): Promise<void> {
    try {
      const progressRef = doc(db, 'users', this.userId, 'data', 'progress');
      const updateData = {
        [`${language}.lastActivity`]: serverTimestamp(),
        [`${language}.language`]: language,
        lastUpdated: serverTimestamp(),
      };

      // Add other updates
      Object.keys(updates).forEach(key => {
        if (key !== 'lastActivity' && key !== 'language') {
          const value = updates[key as keyof LanguageProgress];
          if (value !== undefined) {
            // Convert to string for Firebase compatibility
            updateData[`${language}.${key}`] = String(value);
          }
        }
      });

      await updateDoc(progressRef, updateData);
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  // Article Management
  async saveArticle(article: NewsArticle): Promise<void> {
    try {
      const articleRef = doc(db, 'users', this.userId, 'articles', article.id);
      await setDoc(articleRef, {
        ...article,
        savedAt: serverTimestamp(),
        readCount: 1,
      });
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    }
  }

  async getSavedArticles(): Promise<NewsArticle[]> {
    try {
      const articlesRef = collection(db, 'users', this.userId, 'articles');
      const q = query(articlesRef, orderBy('savedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const articles: NewsArticle[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        articles.push({
          id: doc.id,
          ...data,
          publishedAt: data.publishedAt || new Date().toISOString(),
        } as NewsArticle);
      });

      return articles;
    } catch (error) {
      console.error('Error getting saved articles:', error);
      return [];
    }
  }

  async markArticleAsRead(articleId: string): Promise<void> {
    try {
      const articleRef = doc(db, 'users', this.userId, 'articles', articleId);
      await updateDoc(articleRef, {
        readCount: 1,
        lastReadAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking article as read:', error);
      throw error;
    }
  }

  // Settings Management
  async saveSetting(key: string, value: any): Promise<void> {
    try {
      const settingsRef = doc(db, 'users', this.userId, 'data', 'settings');
      await updateDoc(settingsRef, {
        [key]: value,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any> {
    try {
      const settingsRef = doc(db, 'users', this.userId, 'data', 'settings');
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        return docSnap.data()[key];
      }
      
      return null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  }

  async getSelectedLanguage(): Promise<string> {
    const language = await this.getSetting('selectedLanguage');
    return language || 'italian';
  }

  async setSelectedLanguage(language: string): Promise<void> {
    await this.saveSetting('selectedLanguage', language);
  }
}

// Factory function to create UserDataManager instance
export function createUserDataManager(userId: string): UserDataManager {
  return new UserDataManager(userId);
}
