import { NextRequest, NextResponse } from 'next/server';
import { extractVocabularyWithDeepSeek } from '@/lib/deepseek-ai';
import { createUserDataManager } from '@/lib/user-data';

// Language name mapping
const languageCodeMap: Record<string, string> = {
  'Italian': 'Italian',
  'French': 'French',
  'German': 'German',
  'Spanish': 'Spanish',
  'Portuguese': 'Portuguese',
  'Russian': 'Russian',
  'Japanese': 'Japanese',
  'Chinese': 'Chinese (Simplified)',
  'Korean': 'Korean',
};

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, count = 15, userId, saveToFirebase = false } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    const targetLangName = languageCodeMap[targetLanguage] || targetLanguage;
    
    // Use DeepSeek AI for vocabulary extraction
    const vocabulary = await extractVocabularyWithDeepSeek(text, targetLangName, count);

    // Optionally save to Firebase if userId is provided
    if (saveToFirebase && userId && vocabulary.length > 0) {
      try {
        const userDataManager = createUserDataManager(userId);
        
        // Save each vocabulary item
        for (const vocab of vocabulary) {
          const vocabItem = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            originalWord: vocab.originalWord,
            translatedWord: vocab.translatedWord,
            originalSentence: vocab.originalSentence,
            translatedSentence: vocab.translatedSentence,
            language: targetLanguage,
            reviewCount: 0,
            correctCount: 0,
            mastered: false,
            articleId: 'extracted',
            articleTitle: 'Extracted Vocabulary',
            createdAt: new Date(),
          };
          
          await userDataManager.saveVocabularyItem(vocabItem);
        }
        
        console.log(`Saved ${vocabulary.length} vocabulary items for user ${userId}`);
      } catch (saveError) {
        console.error('Error saving vocabulary to Firebase:', saveError);
        // Don't fail the request if saving fails, just log it
      }
    }

    return NextResponse.json({ vocabulary });
  } catch (error: any) {
    console.error('Vocabulary extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract vocabulary', details: error.message },
      { status: 500 }
    );
  }
}
