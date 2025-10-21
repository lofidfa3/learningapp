import { VocabularyItem, LanguageProgress, NewsArticle } from './types';

// Local storage keys
const STORAGE_KEYS = {
  VOCABULARY: 'language-learning-vocabulary',
  PROGRESS: 'language-learning-progress',
  SAVED_ARTICLES: 'language-learning-articles',
  SELECTED_LANGUAGE: 'language-learning-selected-language',
} as const;

// Vocabulary Storage
export function saveVocabulary(items: VocabularyItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(items));
  }
}

export function getVocabulary(): VocabularyItem[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
  if (!stored) return [];
  
  const items = JSON.parse(stored);
  return items.map((item: any) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : undefined,
    nextReview: item.nextReview ? new Date(item.nextReview) : undefined,
  }));
}

export function addVocabularyItem(item: VocabularyItem): void {
  const vocabulary = getVocabulary();
  vocabulary.push(item);
  saveVocabulary(vocabulary);
}

export function updateVocabularyItem(id: string, updates: Partial<VocabularyItem>): void {
  const vocabulary = getVocabulary();
  const index = vocabulary.findIndex(item => item.id === id);
  if (index !== -1) {
    vocabulary[index] = { ...vocabulary[index], ...updates };
    saveVocabulary(vocabulary);
  }
}

export function deleteVocabularyItem(id: string): void {
  const vocabulary = getVocabulary();
  const filtered = vocabulary.filter(item => item.id !== id);
  saveVocabulary(filtered);
}

export function getVocabularyByLanguage(language: string): VocabularyItem[] {
  return getVocabulary().filter(item => item.language === language);
}

// Progress Storage
export function saveProgress(progress: Record<string, LanguageProgress>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }
}

export function getProgress(): Record<string, LanguageProgress> {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  if (!stored) return {};
  
  const progress = JSON.parse(stored);
  Object.keys(progress).forEach(key => {
    progress[key].lastActivity = new Date(progress[key].lastActivity);
  });
  
  return progress;
}

export function updateProgress(language: string, updates: Partial<LanguageProgress>): void {
  const progress = getProgress();
  if (!progress[language]) {
    progress[language] = {
      language,
      totalWords: 0,
      masteredWords: 0,
      articlesRead: 0,
      lastActivity: new Date(),
      studyStreak: 1,
    };
  }
  progress[language] = { ...progress[language], ...updates, lastActivity: new Date() };
  saveProgress(progress);
}

// Article Storage
export function saveSavedArticles(articles: NewsArticle[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SAVED_ARTICLES, JSON.stringify(articles));
  }
}

export function getSavedArticles(): NewsArticle[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.SAVED_ARTICLES);
  return stored ? JSON.parse(stored) : [];
}

export function saveArticle(article: NewsArticle): void {
  const articles = getSavedArticles();
  if (!articles.find(a => a.id === article.id)) {
    articles.push(article);
    saveSavedArticles(articles);
  }
}

export function removeSavedArticle(articleId: string): void {
  const articles = getSavedArticles();
  const filtered = articles.filter(a => a.id !== articleId);
  saveSavedArticles(filtered);
}

// Selected Language
export function saveSelectedLanguage(language: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SELECTED_LANGUAGE, language);
  }
}

export function getSelectedLanguage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.SELECTED_LANGUAGE);
}

