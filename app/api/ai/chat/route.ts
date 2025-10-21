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
    
    console.log('Chat API called with DeepSeek:', {
      hasArticleContent: !!articleContent,
      hasArticleTitle: !!articleTitle,
      hasUserQuestion: !!userQuestion,
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
    console.error('DeepSeek AI error:', error);
    
    // Provide a helpful fallback response
    const fallbackResponse = `I apologize, but I'm having trouble processing your question right now. 

Based on your question "${userQuestion}", here are some general tips for language learning with news articles:

1. **Identify Key Vocabulary**: Look for important words and phrases in the article
2. **Understand Context**: Try to understand how words are used in different contexts
3. **Practice Reading**: Read similar articles to reinforce your learning
4. **Ask Specific Questions**: Try asking about specific words, phrases, or concepts

Please try again in a moment, or rephrase your question to be more specific.`;

    return NextResponse.json(
      {
        answer: fallbackResponse,
        question: userQuestion,
        articleTitle: articleTitle || 'News Article',
        timestamp: new Date().toISOString(),
        error: 'AI service temporarily unavailable',
        details: error.message
      },
      { status: 200 } // Return 200 with fallback instead of 500
    );
  }
}
