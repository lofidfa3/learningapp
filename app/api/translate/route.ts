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
  'Turkish': 'Turkish',
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

    // Verify API key is available - check both environment variables
    // Use direct process.env access and also try alternative methods
    const deepseekKey = process.env.DEEPSEEK_API_KEY || (process.env as any).DEEPSEEK_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY || (process.env as any).OPENROUTER_API_KEY;
    const apiKey = deepseekKey || openrouterKey;
    
    // Log environment check for debugging - this will show in Vercel logs
    const envCheck = {
      hasDeepseekKey: !!deepseekKey,
      hasOpenrouterKey: !!openrouterKey,
      hasApiKey: !!apiKey,
      deepseekKeyLength: deepseekKey?.length || 0,
      openrouterKeyLength: openrouterKey?.length || 0,
      model: process.env.DEEPSEEK_MODEL || 'not set',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'not set',
      vercel: process.env.VERCEL || 'not set',
      allApiKeys: Object.keys(process.env).filter(k => 
        k.includes('API') || k.includes('DEEPSEEK') || k.includes('OPENROUTER') || k.includes('MODEL')
      )
    };
    
    console.log('🔍 Environment check:', JSON.stringify(envCheck, null, 2));

    if (!apiKey) {
      console.error('❌ Missing API key: DEEPSEEK_API_KEY or OPENROUTER_API_KEY');
      console.error('Full environment check:', JSON.stringify(envCheck, null, 2));
      return NextResponse.json(
        { 
          error: 'AI service not configured. Please check environment variables.',
          details: 'DEEPSEEK_API_KEY or OPENROUTER_API_KEY must be set in Vercel environment variables.',
          debug: process.env.NODE_ENV === 'development' ? envCheck : undefined
        },
        { status: 500 }
      );
    }

    const targetLangName = languageCodeMap[targetLanguage] || targetLanguage;

    console.log('🔄 Translating text:', { 
      textLength: text.length, 
      targetLanguage: targetLangName,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      model: process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat'
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
    console.error('❌ Translation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      status: error.status,
      code: error.code
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to translate text';
    let errorDetails = error.message || 'Unknown error';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API key configuration error';
      errorDetails = 'Please check that DEEPSEEK_API_KEY or OPENROUTER_API_KEY is correctly set in Vercel environment variables.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'API rate limit exceeded';
      errorDetails = 'Please try again in a few moments.';
    } else if (error.message?.includes('Invalid request')) {
      errorMessage = 'Invalid translation request';
      errorDetails = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails,
        originalError: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
