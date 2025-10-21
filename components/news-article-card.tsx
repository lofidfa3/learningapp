'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface NewsArticleCardProps {
  article: NewsArticle;
  targetLanguage: string;
}

export function NewsArticleCard({ article, targetLanguage }: NewsArticleCardProps) {
  const publishedDate = new Date(article.publishedAt);

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      {article.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
            {article.source}
          </span>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {format(publishedDate, 'MMM d, yyyy')}
          </div>
        </div>
        <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {article.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="mt-auto flex gap-2">
        <Link
          href={`/article/${encodeURIComponent(article.id)}?lang=${targetLanguage}`}
          className="flex-1"
        >
          <Button className="w-full" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Learn from Article
          </Button>
        </Link>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}

