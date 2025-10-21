'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Newspaper, TrendingUp, Settings, Music, Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ThemeToggle = dynamic(() => import('@/components/theme-toggle').then(mod => ({ default: mod.ThemeToggle })), { ssr: false });

const navigationItems = [
  { href: '/', label: 'News', icon: Newspaper },
  { href: '/lyrics', label: 'Lyrics', icon: Music },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-primary bg-card/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary retro-glow" />
            <span className="text-xl font-bold uppercase tracking-wider neon-text text-primary">
              LinguaNews
            </span>
          </div>

          <div className="flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all border-2',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary retro-glow'
                      : 'text-foreground border-transparent hover:border-primary hover:text-primary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
            
            <div className="ml-4 flex items-center gap-2">
              <ThemeToggle />
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 border-2 border-primary retro-button p-0">
                      <Avatar className="h-full w-full">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {userProfile?.displayName?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 border-2 border-primary retro-card" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold uppercase">
                          {userProfile?.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {userProfile?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span className="uppercase text-xs font-bold">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive">
                      <span className="uppercase text-xs font-bold">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push('/auth')}
                    className="retro-button border-2 border-current uppercase text-xs font-bold"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => router.push('/auth')}
                    className="retro-button border-2 border-current uppercase text-xs font-bold bg-primary text-primary-foreground"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

