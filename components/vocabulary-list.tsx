'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Volume2 } from 'lucide-react';

interface VocabularyListProps {
  vocabulary: any[];
  onSaveWord: (word: any) => void;
  targetLanguage: string;
}

export function VocabularyList({ vocabulary, onSaveWord, targetLanguage }: VocabularyListProps) {
  function speakWord(text: string, language: string) {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="space-y-3">
      {vocabulary.map((word, index) => (
        <Card key={index} className="p-4">
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
                      onClick={() => speakWord(word.translatedWord, targetLanguage)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground italic">"{word.originalSentence}"</p>
                </div>
                <div>
                  <p className="text-primary/80 italic">"{word.translatedSentence}"</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => onSaveWord(word)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

