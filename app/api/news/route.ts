import { NextRequest, NextResponse } from 'next/server';
import { NewsArticle } from '@/lib/types';

// Multi-source news aggregator - fetches from multiple free news APIs
// Sources: The Guardian, NewsAPI, NewsData.io, GNews

const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || 'test';
const NEWSAPI_KEY = process.env.NEWSAPI_KEY; // Get free key at newsapi.org
const NEWSDATA_KEY = process.env.NEWSDATA_KEY; // Get free key at newsdata.io
const GNEWS_KEY = process.env.GNEWS_API_KEY; // Get free key at gnews.io

// Category mappings for different APIs
const guardianCategoryMap: Record<string, string> = {
  general: 'world',
  technology: 'technology',
  business: 'business',
  science: 'science',
  health: 'lifeandstyle',
  sports: 'sport',
  entertainment: 'culture',
};

const newsapiCategoryMap: Record<string, string> = {
  general: 'general',
  technology: 'technology',
  business: 'business',
  science: 'science',
  health: 'health',
  sports: 'sports',
  entertainment: 'entertainment',
};

// Fetch from The Guardian
async function fetchGuardian(category: string, pageSize: number): Promise<NewsArticle[]> {
  try {
    const guardianSection = guardianCategoryMap[category] || 'world';
    const url = new URL('https://content.guardianapis.com/search');
    url.searchParams.set('api-key', GUARDIAN_API_KEY);
    url.searchParams.set('section', guardianSection);
    url.searchParams.set('show-fields', 'headline,trailText,body,thumbnail,byline');
    url.searchParams.set('page-size', Math.min(pageSize, 50).toString());
    url.searchParams.set('order-by', 'newest');
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (!data?.response?.results) return [];
    
    return data.response.results
      .filter((article: any) => article.fields?.headline && article.fields?.trailText)
      .map((article: any, index: number) => {
        const bodyText = article.fields?.body 
          ? article.fields.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000)
          : article.fields?.trailText || '';

        return {
          id: `guardian-${article.id}-${index}`,
          title: article.fields.headline || article.webTitle,
          description: article.fields.trailText || '',
          content: bodyText,
          url: article.webUrl,
          imageUrl: article.fields.thumbnail,
          publishedAt: article.webPublicationDate,
          source: 'The Guardian',
          author: article.fields.byline || 'The Guardian',
        };
      });
  } catch (error) {
    console.error('Guardian API error:', error);
    return [];
  }
}

// Fetch from NewsAPI.org
async function fetchNewsAPI(category: string, pageSize: number): Promise<NewsArticle[]> {
  if (!NEWSAPI_KEY) return [];
  
  try {
    const newsapiCategory = newsapiCategoryMap[category] || 'general';
    const url = new URL('https://newsapi.org/v2/top-headlines');
    url.searchParams.set('category', newsapiCategory);
    url.searchParams.set('language', 'en');
    url.searchParams.set('pageSize', Math.min(pageSize, 100).toString());
    url.searchParams.set('apiKey', NEWSAPI_KEY);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (!data?.articles) return [];
    
    return data.articles.map((article: any, index: number) => ({
      id: `newsapi-${Date.now()}-${index}`,
      title: article.title,
      description: article.description || '',
      content: article.content || article.description || '',
      url: article.url,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name || 'NewsAPI',
      author: article.author || article.source?.name || 'NewsAPI',
    }));
  } catch (error) {
    console.error('NewsAPI error:', error);
    return [];
  }
}

// Fetch from NewsData.io
async function fetchNewsData(category: string, pageSize: number): Promise<NewsArticle[]> {
  if (!NEWSDATA_KEY) return [];
  
  try {
    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.set('apikey', NEWSDATA_KEY);
    url.searchParams.set('category', category);
    url.searchParams.set('language', 'en');
    url.searchParams.set('size', Math.min(pageSize, 10).toString());
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (!data?.results) return [];
    
    return data.results.map((article: any, index: number) => ({
      id: `newsdata-${article.article_id || Date.now()}-${index}`,
      title: article.title,
      description: article.description || '',
      content: article.content || article.description || '',
      url: article.link,
      imageUrl: article.image_url,
      publishedAt: article.pubDate,
      source: article.source_id || 'NewsData',
      author: article.creator?.[0] || article.source_id || 'NewsData',
    }));
  } catch (error) {
    console.error('NewsData API error:', error);
    return [];
  }
}

// Fetch from GNews
async function fetchGNews(category: string, pageSize: number): Promise<NewsArticle[]> {
  if (!GNEWS_KEY) return [];
  
  try {
    const url = new URL('https://gnews.io/api/v4/top-headlines');
    url.searchParams.set('category', category === 'general' ? 'world' : category);
    url.searchParams.set('lang', 'en');
    url.searchParams.set('max', Math.min(pageSize, 10).toString());
    url.searchParams.set('apikey', GNEWS_KEY);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (!data?.articles) return [];
    
    return data.articles.map((article: any, index: number) => ({
      id: `gnews-${Date.now()}-${index}`,
      title: article.title,
      description: article.description || '',
      content: article.content || article.description || '',
      url: article.url,
      imageUrl: article.image,
      publishedAt: article.publishedAt,
      source: article.source?.name || 'GNews',
      author: article.source?.name || 'GNews',
    }));
  } catch (error) {
    console.error('GNews API error:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'general';
  const page = searchParams.get('page') || '1';
  const pageSize = parseInt(searchParams.get('pageSize') || '50');

  try {
    // Fetch from all sources in parallel for variety
    const [guardianArticles, newsapiArticles, newsdataArticles, gnewsArticles] = await Promise.all([
      fetchGuardian(category, Math.ceil(pageSize / 2)),
      fetchNewsAPI(category, Math.ceil(pageSize / 4)),
      fetchNewsData(category, Math.ceil(pageSize / 6)),
      fetchGNews(category, Math.ceil(pageSize / 6)),
    ]);

    // Combine articles from all sources
    let allArticles = [
      ...guardianArticles,
      ...newsapiArticles,
      ...newsdataArticles,
      ...gnewsArticles,
    ];

    // Remove duplicates by URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.url, article])).values()
    );

    // Shuffle articles for variety (mix different sources)
    const shuffled = uniqueArticles.sort(() => Math.random() - 0.5);

    // Limit to requested page size
    const articles = shuffled.slice(0, pageSize);

    console.log(`📰 Fetched ${articles.length} articles from ${new Set(articles.map(a => a.source)).size} sources`);

    return NextResponse.json({
      articles,
      totalResults: articles.length,
      hasMore: articles.length >= pageSize,
      currentPage: parseInt(page),
      sources: Array.from(new Set(articles.map(a => a.source))),
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles', details: error.message },
      { status: 500 }
    );
  }
}

