import { NextRequest, NextResponse } from 'next/server';

// Free AI alternative using Hugging Face Inference API
export async function POST(request: NextRequest) {
  try {
    const { articleContent, articleTitle, userQuestion } = await request.json();

    if (!articleContent || !userQuestion) {
      return NextResponse.json(
        { error: 'Article content and user question are required' },
        { status: 400 }
      );
    }

    // Use Hugging Face's free inference API (no API key required for basic usage)
    const prompt = `You are an AI assistant helping users learn languages through news articles.

Article Title: ${articleTitle}
Article Content: ${articleContent}

User Question: ${userQuestion}

Please provide a helpful, educational response that:
1. Answers the user's question based on the article content
2. Helps with language learning by explaining key concepts
3. Provides additional context or related information
4. Uses clear, educational language

If the question is not related to the article, politely redirect to article-related topics.

Response:`;

    const huggingFaceResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 500,
          temperature: 0.7,
          do_sample: true
        }
      })
    });

    if (!huggingFaceResponse.ok) {
      // Fallback to a simple rule-based response
      const fallbackResponse = generateFallbackResponse(userQuestion, articleContent, articleTitle);
      return NextResponse.json({
        answer: fallbackResponse,
        question: userQuestion,
        articleTitle,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      });
    }

    const huggingFaceData = await huggingFaceResponse.json();
    
    let answer = '';
    if (Array.isArray(huggingFaceData) && huggingFaceData[0] && huggingFaceData[0].generated_text) {
      answer = huggingFaceData[0].generated_text.replace(prompt, '').trim();
    } else {
      // Fallback if response format is unexpected
      answer = generateFallbackResponse(userQuestion, articleContent, articleTitle);
    }

    return NextResponse.json({
      answer,
      question: userQuestion,
      articleTitle,
      timestamp: new Date().toISOString(),
      source: 'huggingface'
    });

  } catch (error: any) {
    console.error('Free AI API error:', error);
    
    // Always provide a fallback response
    const { articleContent, articleTitle, userQuestion } = await request.json().catch(() => ({}));
    const fallbackResponse = generateFallbackResponse(userQuestion || 'general question', articleContent || '', articleTitle || '');
    
    return NextResponse.json({
      answer: fallbackResponse,
      question: userQuestion || 'general question',
      articleTitle: articleTitle || '',
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: 'Using fallback response due to API error'
    });
  }
}

function generateFallbackResponse(question: string, articleContent: string, articleTitle: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('main topic') || lowerQuestion.includes('what is this about')) {
    return `Based on the article "${articleTitle}", this appears to be about ${extractMainTopic(articleContent)}. The article discusses important aspects of this topic that can help with your language learning.`;
  }
  
  if (lowerQuestion.includes('vocabulary') || lowerQuestion.includes('words')) {
    const importantWords = extractImportantWords(articleContent);
    return `Here are some important vocabulary words from this article: ${importantWords.slice(0, 5).join(', ')}. These words are commonly used in news articles and will help improve your language skills.`;
  }
  
  if (lowerQuestion.includes('explain') || lowerQuestion.includes('key points')) {
    return `The article "${articleTitle}" covers several key points. The main content discusses ${extractMainTopic(articleContent)}. This type of content is excellent for language learning as it uses formal, informative language commonly found in news articles.`;
  }
  
  if (lowerQuestion.includes('learn') || lowerQuestion.includes('help')) {
    return `This article is great for language learning because it uses formal vocabulary and sentence structures typical of news writing. Reading articles like this helps improve your comprehension skills and expands your vocabulary in ${articleTitle.toLowerCase()}.`;
  }
  
  // Default response
  return `Thank you for your question about "${articleTitle}". This article discusses ${extractMainTopic(articleContent)}. Reading news articles like this is an excellent way to improve your language skills, as they use formal vocabulary and complex sentence structures that are common in written English.`;
}

function extractMainTopic(content: string): string {
  const sentences = content.split('.');
  const firstSentence = sentences[0] || '';
  return firstSentence.length > 100 ? firstSentence.substring(0, 100) + '...' : firstSentence;
}

function extractImportantWords(content: string): string[] {
  const words = content.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 5)
    .filter(word => !['the', 'and', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'where', 'much', 'some', 'these', 'would', 'through', 'before', 'right', 'being', 'should', 'because', 'during', 'never', 'really', 'always', 'sometimes', 'usually', 'often', 'every', 'another', 'different', 'important', 'necessary', 'possible', 'available', 'recent', 'current', 'modern', 'traditional', 'national', 'international', 'political', 'economic', 'social', 'cultural', 'environmental', 'technological'].includes(word));
  
  // Get unique words and return top 10
  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 10);
}
