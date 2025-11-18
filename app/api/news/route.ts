import { NextRequest, NextResponse } from 'next/server';
import { NewsArticle } from '@/lib/types';

// Using The Guardian API - completely free, no API key required for basic usage
// Alternative: Can also use GNews API free tier or NewsData.io

const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || 'test'; // Guardian allows 'test' key for development

// Category mapping from our categories to Guardian sections
const categoryMap: Record<string, string> = {
  general: 'world',
  technology: 'technology',
  business: 'business',
  science: 'science',
  health: 'lifeandstyle',
  sports: 'sport',
  entertainment: 'culture',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'general';
  const page = searchParams.get('page') || '1';
  const pageSize = parseInt(searchParams.get('pageSize') || '50'); // Increased from 20 to 50

  try {
    const guardianSection = categoryMap[category] || 'world';
    
    // Using The Guardian Open Platform API (completely free)
    // Fetch multiple pages in parallel for more articles
    const pagesToFetch = Math.min(3, Math.ceil(pageSize / 20)); // Fetch up to 3 pages
    const pagePromises = [];
    
    for (let i = 0; i < pagesToFetch; i++) {
      const pageNum = parseInt(page) + i;
      const url = new URL('https://content.guardianapis.com/search');
      url.searchParams.set('api-key', GUARDIAN_API_KEY);
      url.searchParams.set('section', guardianSection);
      url.searchParams.set('show-fields', 'headline,trailText,body,thumbnail,byline');
      url.searchParams.set('page-size', '50');
      url.searchParams.set('page', pageNum.toString());
      url.searchParams.set('order-by', 'newest');
      
      pagePromises.push(fetch(url.toString()).then(res => res.json()));
    }
    
    // Fetch all pages in parallel
    const responses = await Promise.all(pagePromises);
    
    // Combine all articles from all pages
    let allArticles: any[] = [];
    responses.forEach((response) => {
      if (response?.response?.results) {
        allArticles = allArticles.concat(response.response.results);
      }
    });
    
    // Remove duplicates based on article ID
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.id, article])).values()
    );
    
    // Limit to requested page size
    const limitedArticles = uniqueArticles.slice(0, pageSize);

    const articles: NewsArticle[] = limitedArticles
      .filter((article: any) => article.fields?.headline && article.fields?.trailText)
      .map((article: any, index: number) => {
        // Extract text content from HTML body
        const bodyText = article.fields?.body 
          ? article.fields.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000) // Increased from 1000 to 2000
          : article.fields?.trailText || '';

        return {
          id: `${article.id}-${index}`,
          title: article.fields.headline || article.webTitle,
          description: article.fields.trailText || '',
          content: bodyText,
          url: article.webUrl,
          imageUrl: article.fields.thumbnail,
          publishedAt: article.webPublicationDate,
          source: 'The Guardian',
          author: article.fields.byline,
        };
      });

    // Get total from first response
    const totalResults = responses[0]?.response?.total || articles.length;

    return NextResponse.json({
      articles,
      totalResults,
      hasMore: articles.length >= pageSize && totalResults > articles.length,
      currentPage: parseInt(page),
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    
    // Fallback to GNews API (also free tier available)
    try {
      // Fetch from multiple categories for more variety
      const categoriesToFetch = category === 'general' 
        ? ['world', 'general', 'breaking-news']
        : [category];
      
      const gnewsPromises = categoriesToFetch.map(cat => {
        const url = new URL('https://gnews.io/api/v4/top-headlines');
        url.searchParams.set('category', cat === 'general' ? 'world' : cat);
        url.searchParams.set('lang', 'en');
        url.searchParams.set('max', '30');
        url.searchParams.set('apikey', process.env.GNEWS_API_KEY || 'demo');
        return fetch(url.toString()).then(res => res.json());
      });
      
      const gnewsResponses = await Promise.all(gnewsPromises);
      
      // Combine articles from all categories
      let allGnewsArticles: any[] = [];
      gnewsResponses.forEach((response) => {
        if (response?.articles) {
          allGnewsArticles = allGnewsArticles.concat(response.articles);
        }
      });
      
      // Remove duplicates
      const uniqueGnewsArticles = Array.from(
        new Map(allGnewsArticles.map((article) => [article.url, article])).values()
      ).slice(0, pageSize);

      const articles: NewsArticle[] = uniqueGnewsArticles.map((article: any, index: number) => ({
        id: `gnews-${Date.now()}-${index}`,
        title: article.title,
        description: article.description,
        content: article.content || article.description,
        url: article.url,
        imageUrl: article.image,
        publishedAt: article.publishedAt,
        source: article.source.name,
        author: article.source.name,
      }));

      return NextResponse.json({
        articles,
        totalResults: articles.length,
        hasMore: false,
        currentPage: parseInt(page),
      });
    } catch (fallbackError) {
      console.error('Fallback news fetch also failed:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to fetch news articles', details: 'Both news sources unavailable' },
        { status: 500 }
      );
    }
  }
}

