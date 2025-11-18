import { NextRequest, NextResponse } from 'next/server';
import { NewsArticle } from '@/lib/types';

// Multi-source news aggregator - fetches from multiple free news APIs
// Sources: The Guardian, New York Times, BBC RSS, Reddit News

const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || 'test';
const NYT_API_KEY = process.env.NYT_API_KEY; // Optional: Get at developer.nytimes.com

// Category mappings
const guardianCategoryMap: Record<string, string> = {
  general: 'world',
  technology: 'technology',
  business: 'business',
  science: 'science',
  health: 'lifeandstyle',
  sports: 'sport',
  entertainment: 'culture',
};

const nytCategoryMap: Record<string, string> = {
  general: 'home',
  technology: 'technology',
  business: 'business',
  science: 'science',
  health: 'health',
  sports: 'sports',
  entertainment: 'arts',
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

// Fetch from New York Times (optional - free tier available)
async function fetchNYT(category: string, pageSize: number): Promise<NewsArticle[]> {
  if (!NYT_API_KEY) return [];
  
  try {
    const nytSection = nytCategoryMap[category] || 'home';
    const url = new URL(`https://api.nytimes.com/svc/topstories/v2/${nytSection}.json`);
    url.searchParams.set('api-key', NYT_API_KEY);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (!data?.results) return [];
    
    return data.results.slice(0, pageSize).map((article: any, index: number) => ({
      id: `nyt-${article.uri || Date.now()}-${index}`,
      title: article.title,
      description: article.abstract || '',
      content: article.abstract || '',
      url: article.url,
      imageUrl: article.multimedia?.[0]?.url || article.multimedia?.[1]?.url,
      publishedAt: article.published_date,
      source: 'The New York Times',
      author: article.byline || 'The New York Times',
    }));
  } catch (error) {
    console.error('NYT API error:', error);
    return [];
  }
}

// Fetch from BBC News RSS (free, no API key!)
async function fetchBBC(category: string, pageSize: number): Promise<NewsArticle[]> {
  try {
    const bbcCategoryMap: Record<string, string> = {
      general: 'news',
      technology: 'technology',
      business: 'business',
      science: 'science',
      health: 'health',
      sports: 'sport',
      entertainment: 'entertainment',
    };
    
    const bbcSection = bbcCategoryMap[category] || 'news';
    const rssUrl = `https://feeds.bbci.co.uk/news/${bbcSection}/rss.xml`;
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    // Simple XML parsing (extract items)
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    return items.slice(0, pageSize).map((item, index) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                         item.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const thumbnail = item.match(/<media:thumbnail[^>]*url="([^"]*)"/)? [1] || '';
      
      return {
        id: `bbc-${Date.now()}-${index}`,
        title: title.trim(),
        description: description.replace(/<[^>]*>/g, '').trim(),
        content: description.replace(/<[^>]*>/g, '').trim(),
        url: link.trim(),
        imageUrl: thumbnail,
        publishedAt: pubDate,
        source: 'BBC News',
        author: 'BBC News',
      };
    }).filter(article => article.title && article.url);
  } catch (error) {
    console.error('BBC RSS error:', error);
    return [];
  }
}

// Fetch from CNN RSS (free, no API key!)
async function fetchCNN(category: string, pageSize: number): Promise<NewsArticle[]> {
  try {
    const cnnCategoryMap: Record<string, string> = {
      general: 'world',
      technology: 'tech',
      business: 'business',
      science: 'tech',
      health: 'health',
      sports: 'sport',
      entertainment: 'entertainment',
    };
    
    const cnnSection = cnnCategoryMap[category] || 'world';
    const rssUrl = `http://rss.cnn.com/rss/cnn_${cnnSection}.rss`;
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    // Simple XML parsing
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    return items.slice(0, pageSize).map((item, index) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                    item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                         item.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      
      return {
        id: `cnn-${Date.now()}-${index}`,
        title: title.trim(),
        description: description.replace(/<[^>]*>/g, '').trim(),
        content: description.replace(/<[^>]*>/g, '').trim(),
        url: link.trim(),
        imageUrl: '',
        publishedAt: pubDate,
        source: 'CNN',
        author: 'CNN',
      };
    }).filter(article => article.title && article.url);
  } catch (error) {
    console.error('CNN RSS error:', error);
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
    const [guardianArticles, nytArticles, bbcArticles, cnnArticles] = await Promise.all([
      fetchGuardian(category, Math.ceil(pageSize / 2)),
      fetchNYT(category, Math.ceil(pageSize / 6)),
      fetchBBC(category, Math.ceil(pageSize / 4)),
      fetchCNN(category, Math.ceil(pageSize / 6)),
    ]);

    // Combine articles from all sources
    let allArticles = [
      ...guardianArticles,
      ...nytArticles,
      ...bbcArticles,
      ...cnnArticles,
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

