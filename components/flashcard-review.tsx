'use client';

import { useState } from 'react';
import { VocabularyItem, SUPPORTED_LANGUAGES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { updateVocabularyItem, updateProgress, getProgress } from '@/lib/storage';
import { Volume2, CheckCircle, XCircle, Eye } from 'lucide-react';

interface FlashcardReviewProps {
  words: VocabularyItem[];
  onComplete: () => void;
  targetLanguage: string;
}

export function FlashcardReview({ words, onComplete, targetLanguage }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  function speakText(text: string, language: string) {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  function calculateNextReview(isCorrect: boolean, reviewCount: number): Date {
    const now = new Date();
    let daysToAdd = 1;

    if (isCorrect) {
      // Spaced repetition intervals: 1, 3, 7, 14, 30 days
      const intervals = [1, 3, 7, 14, 30];
      daysToAdd = intervals[Math.min(reviewCount, intervals.length - 1)];
    }

    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + daysToAdd);
    return nextReview;
  }

  function handleAnswer(isCorrect: boolean) {
    const newReviewCount = currentWord.reviewCount + 1;
    const isMastered = isCorrect && newReviewCount >= 5;

    updateVocabularyItem(currentWord.id, {
      mastered: isMastered,
      reviewCount: newReviewCount,
      lastReviewed: new Date(),
      nextReview: calculateNextReview(isCorrect, newReviewCount),
    });

    if (isCorrect) {
      setCorrectCount(correctCount + 1);

      // Update progress
      if (isMastered) {
        const progress = getProgress();
        const currentProgress = progress[targetLanguage];
        updateProgress(targetLanguage, {
          masteredWords: (currentProgress?.masteredWords || 0) + 1,
        });
      }
    }

    // Move to next card
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Review complete
      onComplete();
    }
  }

  function handleShowAnswer() {
    setShowAnswer(true);
    const languageCode = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]?.code || 'en';
    speakText(currentWord.translatedWord, languageCode);
  }

  if (!currentWord) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {words.length}
          </span>
          <span className="text-sm font-medium">
            Correct: {correctCount} / {currentIndex + 1}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-center text-sm text-muted-foreground">
            {currentWord.articleTitle}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-4xl font-bold">{currentWord.originalWord}</h2>
              <button
                onClick={() => speakText(currentWord.originalWord, 'en-US')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Volume2 className="h-6 w-6" />
              </button>
            </div>

            <p className="text-lg text-muted-foreground italic mb-6">
              "{currentWord.originalSentence}"
            </p>

            {showAnswer ? (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="p-6 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h3 className="text-3xl font-bold text-primary">
                      {currentWord.translatedWord}
                    </h3>
                    <button
                      onClick={() => {
                        const languageCode = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]?.code || 'en';
                        speakText(currentWord.translatedWord, languageCode);
                      }}
                      className="text-primary hover:text-primary/80"
                    >
                      <Volume2 className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="text-base text-primary/80 italic">
                    "{currentWord.translatedSentence}"
                  </p>
                </div>

                <div className="flex gap-4 justify-center mt-8">
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="outline"
                    size="lg"
                    className="flex-1 max-w-[200px]"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Wrong
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true)}
                    size="lg"
                    className="flex-1 max-w-[200px]"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Correct
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleShowAnswer}
                size="lg"
                className="mt-4"
              >
                <Eye className="h-5 w-5 mr-2" />
                Show Answer
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>Review count: {currentWord.reviewCount}</p>
            {currentWord.mastered && (
              <p className="text-green-600 font-medium">✓ Mastered</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

