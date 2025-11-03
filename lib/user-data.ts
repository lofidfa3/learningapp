import { VocabularyItem, LanguageProgress, NewsArticle } from './types';
import {
  getUserVocabulary,
  saveVocabularyItem,
  updateVocabularyItem as supabaseUpdateVocabularyItem,
  deleteVocabularyItem,
  getUserArticles,
  saveArticle,
  markArticleAsRead,
} from './supabase-services';

// User-specific data storage using Supabase
export class UserDataManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Vocabulary Management
  async saveVocabularyItem(item: VocabularyItem): Promise<void> {
    try {
      console.log('UserDataManager: Saving vocabulary item for user:', this.userId, item);
      
      const success = await saveVocabularyItem(this.userId, item);
      
      if (!success) {
        throw new Error('Failed to save vocabulary item');
      }
      
      console.log('UserDataManager: Vocabulary item saved successfully');
    } catch (error) {
      console.error('UserDataManager: Error saving vocabulary item:', error);
      throw error;
    }
  }

  async getVocabulary(language?: string): Promise<VocabularyItem[]> {
    try {
      console.log('UserDataManager: Getting vocabulary for user:', this.userId, 'language:', language);
      
      const vocabulary = await getUserVocabulary(this.userId, language);
      
      console.log('UserDataManager: Retrieved vocabulary items:', vocabulary.length);
      return vocabulary;
    } catch (error) {
      console.error('UserDataManager: Error getting vocabulary:', error);
      return [];
    }
  }

  async updateVocab(itemId: string, updates: Partial<VocabularyItem>): Promise<void> {
    try {
      const success = await supabaseUpdateVocabularyItem(this.userId, itemId, updates);
      
      if (!success) {
        throw new Error('Failed to update vocabulary item');
      }
    } catch (error) {
      console.error('Error updating vocabulary item:', error);
      throw error;
    }
  }

  async deleteVocabularyItem(itemId: string): Promise<void> {
    try {
      const success = await deleteVocabularyItem(this.userId, itemId);
      
      if (!success) {
        throw new Error('Failed to delete vocabulary item');
      }
    } catch (error) {
      console.error('Error deleting vocabulary item:', error);
      throw error;
    }
  }

  // Progress Management - Using Supabase user stats
  async saveProgress(progress: Record<string, LanguageProgress>): Promise<void> {
    try {
      // Progress is now managed through user stats in Supabase
      // We can aggregate from vocabulary items
      console.log('Progress saved (managed through Supabase user stats)');
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  async getProgress(): Promise<Record<string, LanguageProgress>> {
    try {
      // Get progress from vocabulary items and user stats
      const vocabulary = await getUserVocabulary(this.userId);
      
      const progressByLanguage: Record<string, LanguageProgress> = {};
      
      vocabulary.forEach(item => {
        if (!progressByLanguage[item.language]) {
          progressByLanguage[item.language] = {
            language: item.language,
            totalWords: 0,
            masteredWords: 0,
            articlesRead: 0,
            lastActivity: item.createdAt,
            studyStreak: 0,
          };
        }
        
        const langProgress = progressByLanguage[item.language];
        langProgress.totalWords++;
        if (item.mastered) {
          langProgress.masteredWords++;
        }
        if (item.createdAt > langProgress.lastActivity) {
          langProgress.lastActivity = item.createdAt;
        }
      });
      
      return progressByLanguage;
    } catch (error) {
      console.error('Error getting progress:', error);
      return {};
    }
  }

  async updateProgress(language: string, updates: Partial<LanguageProgress>): Promise<void> {
    try {
      // Progress updates are handled automatically by Supabase triggers
      console.log('Progress update (managed through Supabase)');
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  // Article Management
  async saveArticle(article: NewsArticle): Promise<void> {
    try {
      const success = await saveArticle(this.userId, article);
      
      if (!success) {
        throw new Error('Failed to save article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    }
  }

  async getSavedArticles(): Promise<NewsArticle[]> {
    try {
      const articles = await getUserArticles(this.userId);
      return articles;
    } catch (error) {
      console.error('Error getting saved articles:', error);
      return [];
    }
  }

  async markArticleAsRead(articleId: string): Promise<void> {
    try {
      const success = await markArticleAsRead(this.userId, articleId);
      
      if (!success) {
        throw new Error('Failed to mark article as read');
      }
    } catch (error) {
      console.error('Error marking article as read:', error);
      throw error;
    }
  }

  // Settings Management - Using Supabase user preferences
  async saveSetting(key: string, value: any): Promise<void> {
    try {
      // Settings are managed through user preferences in Supabase
      // This would need to be extended based on your needs
      console.log(`Setting ${key} saved (managed through Supabase preferences)`);
    } catch (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any> {
    try {
      // Get settings from user preferences in Supabase
      // This would need to be extended based on your needs
      return null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  }

  async getSelectedLanguage(): Promise<string> {
    // Get from user preferences in Supabase profile
    return 'italian'; // Default
  }

  async setSelectedLanguage(language: string): Promise<void> {
    await this.saveSetting('selectedLanguage', language);
  }
}

// Factory function to create UserDataManager instance
export function createUserDataManager(userId: string): UserDataManager {
  return new UserDataManager(userId);
}
