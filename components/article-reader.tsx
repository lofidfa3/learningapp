'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Pause, RotateCcw } from 'lucide-react';

interface ArticleReaderProps {
  text: string;
  language: string;
}

export function ArticleReader({ text, language }: ArticleReaderProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function handleSpeak() {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  function handleStop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleSpeak}
          size="sm"
          variant="outline"
        >
          {isSpeaking && !isPaused ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 mr-2" />
              {isPaused ? 'Resume' : 'Read Aloud'}
            </>
          )}
        </Button>
        {isSpeaking && (
          <Button
            onClick={handleStop}
            size="sm"
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Stop
          </Button>
        )}
      </div>

      <div className="prose prose-slate max-w-none">
        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  );
}

