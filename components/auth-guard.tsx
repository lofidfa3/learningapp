'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/auth');
    } else if (user) {
      setIsRedirecting(false);
    }
  }, [user, loading, router, isRedirecting]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold">
            {loading ? 'Loading...' : 'Redirecting to sign in...'}
          </h2>
          <p className="text-muted-foreground">
            {loading 
              ? 'Please wait while we prepare your experience'
              : 'Please sign in to continue'
            }
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to /auth
  }

  return <>{children}</>;
}
