'use client';

import { useState, useCallback } from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/types';

interface ClickableLyricsProps {
  lyrics: string;
  originalLyrics: string;
  targetLanguage: string;
  onWordClick: (word: string, meaning: string) => void;
}

export function ClickableLyrics({ lyrics, originalLyrics, targetLanguage, onWordClick }: ClickableLyricsProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  // Get word meaning using translation API
  const getWordMeaning = useCallback(async (word: string): Promise<string> => {
    // Remove punctuation and convert to lowercase
    const cleanWord = word.replace(/[.,!?;:()\[\]{}'"]/g, '').trim();
    
    if (!cleanWord || cleanWord.length < 2) return '';
    
    try {
      // Find context from the line containing the word
      const lines = lyrics.split('\n');
      const contextLine = lines.find(line => line.includes(word)) || '';
      
      const response = await fetch('/api/translate/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: cleanWord,
          targetLanguage: targetLanguage,
          context: contextLine.substring(0, 100), // Limit context length
        }),
      });

      const data = await response.json();
      return data.translation || cleanWord;
    } catch (error) {
      console.error('Error fetching word meaning:', error);
      // Fallback: try to find in original lyrics
      const originalWords = originalLyrics.toLowerCase().split(/\s+/);
      const translatedWords = lyrics.toLowerCase().split(/\s+/);
      const wordIndex = translatedWords.findIndex(w => w.replace(/[.,!?;:()\[\]{}'"]/g, '') === cleanWord.toLowerCase());
      
      if (wordIndex >= 0 && wordIndex < originalWords.length) {
        return originalWords[wordIndex] || cleanWord;
      }
      
      return cleanWord;
    }
  }, [lyrics, originalLyrics, targetLanguage]);

  const handleWordClick = useCallback(async (word: string) => {
    const meaning = await getWordMeaning(word);
    if (meaning) {
      onWordClick(word, meaning);
    }
  }, [getWordMeaning, onWordClick]);

  // Split lyrics into words while preserving line breaks
  const renderClickableLyrics = () => {
    const lines = lyrics.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <div key={lineIndex} className="h-4" />;
      }
      
      const words = line.split(/(\s+)/);
      
      return (
        <div key={lineIndex} className="mb-2">
          {words.map((word, wordIndex) => {
            const cleanWord = word.replace(/[.,!?;:()\[\]{}'"]/g, '').trim();
            const isWord = cleanWord.length > 0;
            
            if (isWord) {
              return (
                <span
                  key={wordIndex}
                  className="cursor-pointer hover:bg-primary/20 hover:text-primary px-1 rounded transition-colors inline-block"
                  onClick={() => handleWordClick(word)}
                  onMouseEnter={() => setHoveredWord(word)}
                  onMouseLeave={() => setHoveredWord(null)}
                  title="Click to see meaning"
                >
                  {word}
                </span>
              );
            }
            
            return <span key={wordIndex}>{word}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="prose prose-slate max-w-none">
      <div className="font-sans text-base leading-relaxed">
        {renderClickableLyrics()}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        * Click any word to see its meaning and add it to your flashcards
      </p>
    </div>
  );
}

