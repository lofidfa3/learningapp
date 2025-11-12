import { NextRequest, NextResponse } from 'next/server';
import { translateWithDeepSeek } from '@/lib/deepseek-ai';
import { createUserDataManager } from '@/lib/user-data';
import { trackUserAction } from '@/lib/user-actions';

// Language code mapping
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
    const { text, targetLanguage, userId, articleId } = await request.json();

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

    console.log('🔄 Translating text:', { 
      textLength: text.length, 
      targetLanguage: targetLangName,
      hasApiKey: !!apiKey,
      model: process.env.DEEPSEEK_MODEL || 'default'
    });

    // Use DeepSeek AI for translation
    const translatedText = await translateWithDeepSeek(text, targetLangName);

    // Track translation action if userId is provided
    if (userId) {
      try {
        await trackUserAction(userId, 'translated_article', 'article', articleId || 'unknown', {
          language: targetLanguage,
          textLength: text.length
        });
        
        // Update user's language progress
        const userDataManager = createUserDataManager(userId);
        await userDataManager.updateProgress(targetLanguage.toLowerCase(), {
          language: targetLanguage,
          lastActivity: new Date()
        });
        
        console.log(`Tracked translation for user ${userId}`);
      } catch (trackError) {
        console.error('Error tracking translation:', trackError);
        // Don't fail the request if tracking fails
      }
    }

    return NextResponse.json({
      originalText: text,
      translatedText,
      language: targetLanguage,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text', details: error.message },
      { status: 500 }
    );
  }
}
