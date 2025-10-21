'use client';

import { VocabularyItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Volume2 } from 'lucide-react';
import { deleteVocabularyItem } from '@/lib/storage';
import { format } from 'date-fns';

interface VocabularyManagerProps {
  vocabulary: VocabularyItem[];
  onUpdate: () => void;
}

export function VocabularyManager({ vocabulary, onUpdate }: VocabularyManagerProps) {
  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this word?')) {
      deleteVocabularyItem(id);
      onUpdate();
    }
  }

  function speakWord(text: string, language: string) {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  if (vocabulary.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No vocabulary words yet.</p>
        <p className="text-sm">Start reading articles to build your vocabulary!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vocabulary.map((word) => (
        <Card key={word.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{word.originalWord}</span>
                      <button
                        onClick={() => speakWord(word.originalWord, 'en-US')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-medium">{word.translatedWord}</span>
                      <button
                        onClick={() => speakWord(word.translatedWord, word.language)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-sm mb-2">
                  <p className="text-muted-foreground italic">"{word.originalSentence}"</p>
                  <p className="text-primary/80 italic">"{word.translatedSentence}"</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>From: {word.articleTitle}</span>
                  <span>•</span>
                  <span>Added: {format(word.createdAt, 'MMM d, yyyy')}</span>
                  {word.lastReviewed && (
                    <>
                      <span>•</span>
                      <span>Last reviewed: {format(word.lastReviewed, 'MMM d, yyyy')}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Reviews: {word.reviewCount}</span>
                  {word.mastered && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">✓ Mastered</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleDelete(word.id)}
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

