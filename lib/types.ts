export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  author?: string;
  is_read?: boolean;
}

export interface Translation {
  originalText: string;
  translatedText: string;
  language: string;
}

export interface VocabularyItem {
  id: string;
  originalWord: string;
  translatedWord: string;
  originalSentence: string;
  translatedSentence: string;
  language: string;
  articleId: string;
  articleTitle: string;
  mastered: boolean;
  reviewCount: number;
  lastReviewed?: Date;
  nextReview?: Date;
  createdAt: Date;
}

export interface LanguageProgress {
  language: string;
  totalWords: number;
  masteredWords: number;
  articlesRead: number;
  lastActivity: Date;
  studyStreak: number;
}

export interface FlashcardReview {
  vocabularyId: string;
  isCorrect: boolean;
  timestamp: Date;
}

export const SUPPORTED_LANGUAGES = {
  italian: { code: 'it', name: 'Italian', flag: '🇮🇹' },
  french: { code: 'fr', name: 'French', flag: '🇫🇷' },
  german: { code: 'de', name: 'German', flag: '🇩🇪' },
  spanish: { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  portuguese: { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  russian: { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  japanese: { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  chinese: { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  korean: { code: 'ko', name: 'Korean', flag: '🇰🇷' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

