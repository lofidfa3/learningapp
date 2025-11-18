// DeepSeek AI Integration via OpenRouter
// https://openrouter.ai/api/v1

import OpenAI from 'openai';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Get configured OpenAI client for OpenRouter
 */
function getOpenRouterClient(): OpenAI {
  // Try multiple ways to access environment variables
  const deepseekKey = process.env.DEEPSEEK_API_KEY 
    || (typeof process !== 'undefined' && (process as any).env?.DEEPSEEK_API_KEY)
    || (global as any).DEEPSEEK_API_KEY;
    
  const openrouterKey = process.env.OPENROUTER_API_KEY 
    || (typeof process !== 'undefined' && (process as any).env?.OPENROUTER_API_KEY)
    || (global as any).OPENROUTER_API_KEY;
    
  const apiKey = deepseekKey || openrouterKey;

  // Detailed logging for debugging
  const envInfo = {
    hasDeepseekKey: !!deepseekKey,
    hasOpenrouterKey: !!openrouterKey,
    hasApiKey: !!apiKey,
    deepseekKeyLength: deepseekKey?.length || 0,
    openrouterKeyLength: openrouterKey?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'not set',
    vercel: process.env.VERCEL || 'not set',
    allApiKeys: typeof process !== 'undefined' && process.env 
      ? Object.keys(process.env).filter(k => 
          k.includes('API') || k.includes('DEEPSEEK') || k.includes('OPENROUTER') || k.includes('MODEL')
        )
      : []
  };

  if (!apiKey) {
    console.error('❌ Missing API key. Checked DEEPSEEK_API_KEY and OPENROUTER_API_KEY');
    console.error('Environment check:', JSON.stringify(envInfo, null, 2));
    throw new Error('DEEPSEEK_API_KEY or OPENROUTER_API_KEY is not configured. Please set one of these environment variables in Vercel.');
  }

  // Validate API key format (should start with sk-)
  if (!apiKey.startsWith('sk-')) {
    console.warn('⚠️ API key format may be incorrect (should start with sk-)');
    console.warn('API key prefix:', apiKey.substring(0, 20));
  }

  console.log('✅ API key found, creating OpenRouter client', {
    keyLength: apiKey.length,
    keyPrefix: apiKey.substring(0, 15) + '...',
    source: deepseekKey ? 'DEEPSEEK_API_KEY' : 'OPENROUTER_API_KEY',
    model: process.env.DEEPSEEK_MODEL || 'not set',
    envInfo: JSON.stringify(envInfo, null, 2)
  });

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://newslings.org',
      'X-Title': 'LinguaNews Language Learning App',
    },
  });
}

/**
 * Call DeepSeek AI API for chat completion via OpenRouter
 */
export async function callDeepSeekAPI(
  messages: DeepSeekMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  } = {}
): Promise<string> {
  const model = process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat';
  const openai = getOpenRouterClient();

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY;
    console.log('🤖 Calling OpenRouter API:', { 
      model, 
      hasApiKey: !!apiKey,
      messageCount: messages.length 
    });
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      top_p: options.topP ?? 0.95,
    });

    if (!completion.choices || completion.choices.length === 0) {
      console.error('❌ No choices in OpenRouter response');
      throw new Error('No response from OpenRouter API');
    }

    const content = completion.choices[0].message.content;
    if (!content) {
      console.error('❌ Empty content in OpenRouter response');
      throw new Error('Empty response from OpenRouter API');
    }

    console.log('✅ OpenRouter API success:', { 
      model, 
      responseLength: content.length 
    });
    
    return content;
  } catch (error: any) {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY;
    console.error('❌ OpenRouter API call failed:', {
      error: error.message,
      status: error.status,
      code: error.code,
      model,
      hasApiKey: !!apiKey
    });
    
    // Provide more helpful error messages
    if (error.status === 401 || error.code === 'invalid_api_key') {
      throw new Error('Invalid API key. Please check DEEPSEEK_API_KEY or OPENROUTER_API_KEY environment variable.');
    } else if (error.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    } else if (error.status === 400) {
      throw new Error(`Invalid request: ${error.message}`);
    }
    
    throw error;
  }
}

/**
 * Translate text using DeepSeek AI
 */
export async function translateWithDeepSeek(
  text: string,
  targetLanguage: string
): Promise<string> {
  const systemPrompt = `You are a professional translator. Translate the given English text to ${targetLanguage}. 
Provide ONLY the translation without any explanations, notes, or additional text.
Maintain the original tone, style, and formatting.`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text },
  ];

  return callDeepSeekAPI(messages, { temperature: 0.3, maxTokens: 4000 });
}

/**
 * Extract vocabulary from text using DeepSeek AI
 */
export async function extractVocabularyWithDeepSeek(
  text: string,
  targetLanguage: string,
  count: number = 15
): Promise<Array<{
  originalWord: string;
  translatedWord: string;
  originalSentence: string;
  translatedSentence: string;
}>> {
  const systemPrompt = `You are a language learning assistant. Extract the ${count} most important and useful vocabulary words from the given English text for someone learning ${targetLanguage}.

For each word, provide:
1. The original English word
2. The ${targetLanguage} translation
3. The sentence from the text where the word appears
4. The ${targetLanguage} translation of that sentence

Focus on:
- Content words (nouns, verbs, adjectives, adverbs)
- Words that are educationally valuable
- Skip common words (the, is, and, etc.)
- Words with good learning value

Return ONLY a JSON array in this exact format:
[
  {
    "originalWord": "word",
    "translatedWord": "translation",
    "originalSentence": "sentence from text",
    "translatedSentence": "translated sentence"
  }
]

Do not include any other text, explanations, or markdown formatting. Just the JSON array.`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text.substring(0, 4000) }, // Limit text length
  ];

  const response = await callDeepSeekAPI(messages, {
    temperature: 0.5,
    maxTokens: 3000,
  });

  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const vocabulary = JSON.parse(cleanedResponse);
    return vocabulary.slice(0, count);
  } catch (error) {
    console.error('Failed to parse vocabulary JSON:', error, response);
    throw new Error('Failed to parse vocabulary response from AI');
  }
}

/**
 * Answer questions about an article using DeepSeek AI
 */
export async function answerArticleQuestion(
  articleContent: string,
  articleTitle: string,
  userQuestion: string
): Promise<string> {
  const systemPrompt = `You are a helpful AI assistant for language learning. 
Answer questions about news articles to help users understand the content and learn languages.
Provide clear, concise, and educational responses.
If relevant, mention useful vocabulary or phrases from the article.`;

  const userPrompt = `Article Title: ${articleTitle}

Article Content: ${articleContent.substring(0, 3000)}

User Question: ${userQuestion}

Please provide a helpful answer that aids in language learning.`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  return callDeepSeekAPI(messages, { temperature: 0.7, maxTokens: 800 });
}

