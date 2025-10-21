'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Music, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSpotifyAuth, clearSpotifyAuth, type SpotifyUser } from '@/lib/spotify-auth';
import { SpotifyLoginButton } from '@/components/spotify-login-button';

export function UserProfileMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SpotifyUser | null>(null);

  useEffect(() => {
    const auth = getSpotifyAuth();
    if (auth) {
      setUser(auth.user);
    }
  }, []);

  function handleLogout() {
    clearSpotifyAuth();
    setUser(null);
    router.push('/');
  }

  if (!user) {
    return <SpotifyLoginButton variant="outline" size="sm" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.imageUrl} alt={user.displayName} />
            <AvatarFallback>
              {user.displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.product === 'premium' && (
              <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                <Crown className="h-3 w-3" />
                <span>Premium</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/lyrics')}>
          <Music className="mr-2 h-4 w-4" />
          <span>Lyrics</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <User className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

