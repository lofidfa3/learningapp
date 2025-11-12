import { NextRequest, NextResponse } from 'next/server';
import { extractVocabularyWithDeepSeek } from '@/lib/deepseek-ai';
import { trackUserAction } from '@/lib/user-actions';

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
    const { text, targetLanguage, count = 15, userId, articleId } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    // Verify API key is available
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ Missing API key: DEEPSEEK_API_KEY or OPENROUTER_API_KEY');
      return NextResponse.json(
        { error: 'AI service not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    const targetLangName = languageCodeMap[targetLanguage] || targetLanguage;
    
    console.log('📚 Extracting vocabulary:', { 
      textLength: text.length, 
      targetLanguage: targetLangName,
      count,
      hasApiKey: !!apiKey,
      model: process.env.DEEPSEEK_MODEL || 'default'
    });
    
    // Use DeepSeek AI for vocabulary extraction
    const vocabulary = await extractVocabularyWithDeepSeek(text, targetLangName, count);

    // Track vocabulary extraction if userId is provided
    if (userId) {
      try {
        await trackUserAction(userId, 'extracted_vocabulary', 'article', articleId || 'unknown', {
          language: targetLanguage,
          count: vocabulary.length,
        });
        console.log(`Tracked vocabulary extraction for user ${userId}`);
      } catch (trackError) {
        console.error('Error tracking vocabulary extraction:', trackError);
        // Don't fail the request if tracking fails
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
