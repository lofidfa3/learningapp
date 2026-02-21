'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Newspaper, TrendingUp, Settings, Music, Crown, User, Library } from 'lucide-react';
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
  { href: '/library', label: 'Library', icon: Library },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();

  if (pathname?.startsWith('/mindhouse')) return null;

  return (
    <nav 
      className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ zIndex: 1000, position: 'sticky', pointerEvents: 'auto' }}
    >
      <div className="container mx-auto px-4" style={{ position: 'relative', zIndex: 1001 }}>
        <div className="flex h-16 items-center justify-between" style={{ position: 'relative', zIndex: 1002 }}>
          {/* Logo */}
          <button
            onClick={() => {
              if (pathname !== '/') {
                router.prefetch('/');
                router.push('/');
              }
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-all duration-200 cursor-pointer bg-transparent border-none transform hover:scale-105"
            style={{ position: 'relative', zIndex: 1003, pointerEvents: 'auto' }}
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">LinguaNews</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1" style={{ position: 'relative', zIndex: 1003 }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => {
                    if (!isActive) {
                      // Prefetch the route for faster navigation
                      router.prefetch(item.href);
                      router.push(item.href);
                    }
                  }}
                  onMouseEnter={() => {
                    // Prefetch on hover for even faster navigation
                    if (!isActive) {
                      router.prefetch(item.href);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-transparent border-none',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent transform hover:scale-105'
                  )}
                  style={{ position: 'relative', zIndex: 1004, pointerEvents: 'auto' }}
                >
                  <Icon className="h-4 w-4 transition-transform duration-200" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation Icons */}
          <div className="flex md:hidden items-center gap-1" style={{ position: 'relative', zIndex: 1003 }}>
            {navigationItems.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => {
                    if (!isActive) {
                      router.prefetch(item.href);
                      router.push(item.href);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!isActive) {
                      router.prefetch(item.href);
                    }
                  }}
                  className={cn(
                    'p-2 rounded-md transition-all duration-200 cursor-pointer bg-transparent border-none',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent transform hover:scale-110'
                  )}
                  title={item.label}
                  style={{ position: 'relative', zIndex: 1004, pointerEvents: 'auto' }}
                >
                  <Icon className="h-5 w-5 transition-transform duration-200" />
                </button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 1003 }}>
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                        {userProfile?.displayName?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userProfile?.displayName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile?.email || user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 pointer-events-auto">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/auth/signin');
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/auth/signup');
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

