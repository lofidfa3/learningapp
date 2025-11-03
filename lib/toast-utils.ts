import { toast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    icon: '✅',
    className: 'retro-glow',
  });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    icon: '❌',
  });
};

export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    icon: 'ℹ️',
  });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    icon: '⚠️',
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

// Action-specific toasts with fun messages
export const actionToasts = {
  savedWord: (word: string) => 
    showSuccess('Word Saved! 📚', `"${word}" added to your vocabulary`),
  
  savedAllWords: (count: number) =>
    showSuccess('All Words Saved! 🎉', `${count} words added to your flashcards`),
  
  deletedWord: (word: string) =>
    showInfo('Word Removed', `"${word}" deleted from your vocabulary`),
  
  articleRead: (title: string) =>
    showSuccess('Article Completed! 🎯', `Great job reading "${title}"`),
  
  flashcardCorrect: () =>
    showSuccess('Correct! ⭐', 'Keep up the great work!'),
  
  flashcardWrong: () =>
    showWarning('Try Again! 💪', 'Practice makes perfect'),
  
  translationComplete: () =>
    showSuccess('Translation Ready! 🌐', 'Your translation is ready to read'),
  
  vocabularyExtracted: (count: number) =>
    showSuccess('Vocabulary Found! 📖', `Extracted ${count} key words from the article`),
  
  profileUpdated: () =>
    showSuccess('Profile Updated! ✨', 'Your changes have been saved'),
  
  languageChanged: (language: string) =>
    showSuccess('Language Changed! 🗣️', `Now learning ${language}`),
  
  aiChatReady: () =>
    showSuccess('AI Ready! 🤖', 'Ask me anything about the article'),
  
  loginSuccess: (name: string) =>
    showSuccess(`Welcome back, ${name}! 👋`, 'Ready to continue learning?'),
  
  signupSuccess: (name: string) =>
    showSuccess(`Welcome, ${name}! 🎉`, 'Your learning journey begins now'),
  
  streakMaintained: (days: number) =>
    showSuccess(`${days} Day Streak! 🔥`, 'You\'re on fire! Keep it going'),
  
  goalReached: () =>
    showSuccess('Daily Goal Reached! 🏆', 'Amazing work today!'),
};

