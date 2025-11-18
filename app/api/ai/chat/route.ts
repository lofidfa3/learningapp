import { NextRequest, NextResponse } from 'next/server';
import { answerArticleQuestion } from '@/lib/deepseek-ai';

// DeepSeek AI integration for article interaction
export async function POST(request: NextRequest) {
  let userQuestion = '';
  let articleTitle = '';
  
  try {
    const { articleContent, articleTitle: title, userQuestion: question } = await request.json();
    userQuestion = question || '';
    articleTitle = title || '';
    
    // Verify API key is available
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ Missing API key: DEEPSEEK_API_KEY or OPENROUTER_API_KEY');
      return NextResponse.json(
        { error: 'AI service not configured. Please check environment variables.' },
        { status: 500 }
      );
    }
    
    console.log('💬 Chat API called:', {
      hasArticleContent: !!articleContent,
      hasArticleTitle: !!articleTitle,
      hasUserQuestion: !!userQuestion,
      hasApiKey: !!apiKey,
      model: process.env.DEEPSEEK_MODEL || 'default'
    });

    if (!articleContent || !userQuestion) {
      console.log('Missing required fields:', { articleContent: !!articleContent, userQuestion: !!userQuestion });
      return NextResponse.json(
        { error: 'Article content and user question are required' },
        { status: 400 }
      );
    }

    // Use DeepSeek AI to answer questions about the article
    const answer = await answerArticleQuestion(articleContent, articleTitle, userQuestion);

    return NextResponse.json({
      answer,
      question: userQuestion,
      articleTitle,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ DeepSeek AI error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return actual error so client can handle it properly
    return NextResponse.json(
      {
        error: error.message || 'AI service temporarily unavailable',
        details: error.message,
        question: userQuestion,
        articleTitle: articleTitle || 'News Article',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
