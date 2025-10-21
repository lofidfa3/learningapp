import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
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

  try {
    const guardianSection = categoryMap[category] || 'world';
    
    // Using The Guardian Open Platform API (completely free)
    const response = await axios.get('https://content.guardianapis.com/search', {
      params: {
        'api-key': GUARDIAN_API_KEY,
        section: guardianSection,
        'show-fields': 'headline,trailText,body,thumbnail,byline',
        'page-size': 20,
        page: page,
        'order-by': 'newest',
      },
    });

    const articles: NewsArticle[] = response.data.response.results
      .filter((article: any) => article.fields?.headline && article.fields?.trailText)
      .map((article: any, index: number) => {
        // Extract text content from HTML body
        const bodyText = article.fields?.body 
          ? article.fields.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 1000)
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

    return NextResponse.json({
      articles,
      totalResults: response.data.response.total,
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    
    // Fallback to GNews API (also free tier available)
    try {
      const gnewsResponse = await axios.get('https://gnews.io/api/v4/top-headlines', {
        params: {
          category: category === 'general' ? 'world' : category,
          lang: 'en',
          max: 20,
          apikey: process.env.GNEWS_API_KEY || 'demo', // Free tier: 100 requests/day
        },
      });

      const articles: NewsArticle[] = gnewsResponse.data.articles.map((article: any, index: number) => ({
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
        totalResults: gnewsResponse.data.totalArticles,
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

