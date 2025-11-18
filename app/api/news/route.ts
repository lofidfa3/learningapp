import { NextRequest, NextResponse } from 'next/server';
import { NewsArticle } from '@/lib/types';

// Multi-source news aggregator - fetches from multiple free news APIs
// Sources: The Guardian, BBC RSS, Al Jazeera RSS, Reuters RSS, NewsData.io, NYT (optional)

const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || 'test';
const NYT_API_KEY = process.env.NYT_API_KEY; // Optional: Get at developer.nytimes.com
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY; // Optional: Get free at newsdata.io

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

// Fetch from The Guardian with pagination support
async function fetchGuardian(category: string, pageSize: number, page: number = 1): Promise<NewsArticle[]> {
  try {
    const guardianSection = guardianCategoryMap[category] || 'world';
    
    // Guardian API allows max 50 per page, fetch multiple pages if needed
    const pagesToFetch = Math.ceil(pageSize / 50);
    const allArticles: NewsArticle[] = [];
    
    for (let i = 0; i < pagesToFetch && i < 4; i++) { // Max 4 pages = 200 articles from Guardian
      const url = new URL('https://content.guardianapis.com/search');
      url.searchParams.set('api-key', GUARDIAN_API_KEY);
      url.searchParams.set('section', guardianSection);
      url.searchParams.set('show-fields', 'headline,trailText,body,thumbnail,byline');
      url.searchParams.set('page-size', '50');
      url.searchParams.set('page', (page + i).toString());
      url.searchParams.set('order-by', 'newest');
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (!data?.response?.results) break;
      
      const articles = data.response.results
        .filter((article: any) => article.fields?.headline && article.fields?.trailText)
        .map((article: any, index: number) => {
          const bodyText = article.fields?.body 
            ? article.fields.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000)
            : article.fields?.trailText || '';

          return {
            id: `guardian-${article.id}-${page}-${i}-${index}`,
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
      
      allArticles.push(...articles);
      
      // If we got less than 50 articles, no more pages available
      if (articles.length < 50) break;
    }
    
    return allArticles.slice(0, pageSize);
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
      const thumbnail = item.match(/<media:thumbnail[^>]*url="([^"]*)"/)?.[1] || '';
      
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

// Fetch from Al Jazeera RSS (free, no API key!)
async function fetchAlJazeera(category: string, pageSize: number): Promise<NewsArticle[]> {
  try {
    const alJazeeraCategoryMap: Record<string, string> = {
      general: '',
      technology: 'science-and-technology',
      business: 'economy',
      science: 'science-and-technology',
      health: 'news',
      sports: 'sports',
      entertainment: 'entertainment',
    };
    
    const alJazeeraSection = alJazeeraCategoryMap[category] || '';
    const rssUrl = alJazeeraSection 
      ? `https://www.aljazeera.com/xml/rss/${alJazeeraSection}.xml`
      : 'https://www.aljazeera.com/xml/rss/all.xml';
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    return items.slice(0, pageSize).map((item, index) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                         item.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const image = item.match(/<media:content[^>]*url="([^"]*)"/)?.[1] || 
                    item.match(/<enclosure[^>]*url="([^"]*)"/)?.[1] || '';
      
      return {
        id: `aljazeera-${Date.now()}-${index}`,
        title: title.trim(),
        description: description.replace(/<[^>]*>/g, '').trim(),
        content: description.replace(/<[^>]*>/g, '').trim(),
        url: link.trim(),
        imageUrl: image,
        publishedAt: pubDate,
        source: 'Al Jazeera',
        author: 'Al Jazeera',
      };
    }).filter(article => article.title && article.url);
  } catch (error) {
    console.error('Al Jazeera RSS error:', error);
    return [];
  }
}

// Fetch from Reuters RSS (free, no API key!)
async function fetchReuters(category: string, pageSize: number): Promise<NewsArticle[]> {
  try {
    const reutersCategoryMap: Record<string, string> = {
      general: 'world',
      technology: 'technology',
      business: 'business',
      science: 'science',
      health: 'health',
      sports: 'sports',
      entertainment: 'lifestyle',
    };
    
    const reutersSection = reutersCategoryMap[category] || 'world';
    const rssUrl = `https://www.reutersagency.com/feed/?taxonomy=${reutersSection}&post_type=best`;
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    return items.slice(0, pageSize).map((item, index) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                         item.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const image = item.match(/<media:content[^>]*url="([^"]*)"/)?.[1] || '';
      
      return {
        id: `reuters-${Date.now()}-${index}`,
        title: title.trim(),
        description: description.replace(/<[^>]*>/g, '').trim(),
        content: description.replace(/<[^>]*>/g, '').trim(),
        url: link.trim(),
        imageUrl: image,
        publishedAt: pubDate,
        source: 'Reuters',
        author: 'Reuters',
      };
    }).filter(article => article.title && article.url);
  } catch (error) {
    console.error('Reuters RSS error:', error);
    return [];
  }
}

// Fetch from NewsData.io (free tier: 200 requests/day)
async function fetchNewsData(category: string, pageSize: number): Promise<NewsArticle[]> {
  if (!NEWSDATA_API_KEY) return [];
  
  try {
    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.set('apikey', NEWSDATA_API_KEY);
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


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'general';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '100');
  const sourceFilter = searchParams.get('source'); // New: filter by source

  try {
    // Fetch MORE articles from all sources in parallel
    // Guardian supports pagination - fetch more on subsequent pages
    const guardianCount = page === 1 ? 100 : 50; // First page: 100, subsequent: 50 more
    
    const [guardianArticles, bbcArticles, alJazeeraArticles, reutersArticles, newsdataArticles, nytArticles] = await Promise.all([
      fetchGuardian(category, guardianCount, page), // Up to 200 total from Guardian with pagination
      fetchBBC(category, 30),
      fetchAlJazeera(category, 30),
      fetchReuters(category, 30),
      fetchNewsData(category, 10),
      fetchNYT(category, 20),
    ]);

    // Combine articles from all sources
    let allArticles = [
      ...guardianArticles,
      ...bbcArticles,
      ...alJazeeraArticles,
      ...reutersArticles,
      ...newsdataArticles,
      ...nytArticles,
    ];

    // Remove duplicates by URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.url, article])).values()
    );

    // Filter by source if specified
    const filteredArticles = sourceFilter
      ? uniqueArticles.filter(article => article.source === sourceFilter)
      : uniqueArticles;

    // Shuffle articles for variety (mix different sources)
    const shuffled = filteredArticles.sort(() => Math.random() - 0.5);

    // Limit to requested page size
    const articles = shuffled.slice(0, pageSize);

    // Get all available sources for filter UI
    const availableSources = Array.from(new Set(uniqueArticles.map(a => a.source)));

    // Check if more articles are available (for Guardian pagination)
    const hasMore = page < 4 && guardianArticles.length >= guardianCount; // Up to 4 pages

    console.log(`📰 Fetched ${articles.length} articles from ${sourceFilter || 'all sources'} (page ${page})`);

    return NextResponse.json({
      articles,
      totalResults: articles.length,
      hasMore,
      currentPage: page,
      sources: availableSources,
      activeSource: sourceFilter || 'all',
      sourceCounts: availableSources.reduce((acc, source) => {
        acc[source] = uniqueArticles.filter(a => a.source === source).length;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles', details: error.message },
      { status: 500 }
    );
  }
}

