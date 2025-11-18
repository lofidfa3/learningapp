import { NextRequest, NextResponse } from 'next/server';
import { translateWithDeepSeek } from '@/lib/deepseek-ai';

const languageCodeMap: Record<string, string> = {
  'italian': 'Italian',
  'spanish': 'Spanish',
  'french': 'French',
  'german': 'German',
  'portuguese': 'Portuguese',
  'russian': 'Russian',
  'japanese': 'Japanese',
  'chinese': 'Chinese',
  'korean': 'Korean',
  'turkish': 'Turkish',
};

export async function POST(request: NextRequest) {
  try {
    const { word, targetLanguage, context } = await request.json();

    if (!word || !targetLanguage) {
      return NextResponse.json(
        { error: 'Word and target language are required' },
        { status: 400 }
      );
    }

    const targetLangName = languageCodeMap[targetLanguage] || targetLanguage;

    // Create a context-aware translation request
    const translationPrompt = context
      ? `Translate the word "${word}" from ${targetLangName} to English. Context: "${context}". Provide only the English translation.`
      : `Translate the word "${word}" from ${targetLangName} to English. Provide only the English translation.`;

    try {
      const translation = await translateWithDeepSeek(translationPrompt, 'English');
      
      return NextResponse.json({
        word,
        translation: translation.trim(),
        language: targetLanguage,
      });
    } catch (error: any) {
      // Fallback: return the word itself if translation fails
      return NextResponse.json({
        word,
        translation: word,
        language: targetLanguage,
        error: 'Translation unavailable',
      });
    }
  } catch (error: any) {
    console.error('Word translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate word', details: error.message },
      { status: 500 }
    );
  }
}

