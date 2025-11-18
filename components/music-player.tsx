'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  image: string;
  previewUrl: string;
  duration: number;
  progress: number;
}

interface MusicPlayerProps {
  track: SpotifyTrack;
  isPlaying: boolean;
  onRefresh: () => void;
}

export function MusicPlayer({ track, isPlaying, onRefresh }: MusicPlayerProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {track.image && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={track.image}
                alt={track.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate">{track.name}</h3>
            <p className="text-muted-foreground truncate">{track.artists}</p>
            <p className="text-sm text-muted-foreground truncate">{track.album}</p>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(track.progress / track.duration) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(track.progress)} / {formatTime(track.duration)}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                title="Refresh track info"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

