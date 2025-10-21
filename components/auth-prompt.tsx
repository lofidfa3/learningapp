'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LogIn, UserPlus, Sparkles, BookOpen, MessageSquare, Languages } from 'lucide-react';

interface AuthPromptProps {
  feature: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}

export function AuthPrompt({ feature, description, icon: Icon, children }: AuthPromptProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);

  if (user) {
    return <>{children}</>;
  }

  if (!showPrompt) {
    return (
      <div className="w-full">
        <Card className="retro-card border-dashed border-2 border-muted">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            <Button 
              onClick={() => setShowPrompt(true)}
              className="retro-button"
            >
              <Lock className="h-4 w-4 mr-2" />
              Sign In to Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="retro-card">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">Sign In Required</CardTitle>
        <p className="text-muted-foreground">
          Please sign in to access {feature.toLowerCase()} and other interactive features
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/auth')}
            className="w-full retro-button"
            size="lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In
          </Button>
          <Button 
            onClick={() => router.push('/auth')}
            variant="outline" 
            className="w-full retro-button-secondary"
            size="lg"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Sign Up
          </Button>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Unlock these features:</p>
          <ul className="space-y-1">
            <li className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-powered translations
            </li>
            <li className="flex items-center justify-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Vocabulary extraction
            </li>
            <li className="flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Interactive AI chat
            </li>
            <li className="flex items-center justify-center gap-2">
              <Languages className="h-4 w-4 text-primary" />
              Multiple language support
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={() => setShowPrompt(false)}
          >
            Continue browsing without signing in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
